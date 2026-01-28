import { useState, useCallback, useRef } from "react";
import { SummaryTone } from "@/data/mockAI";
import { toast } from "sonner";

const SUMMARIZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/summarize-report`;

interface UseSummarizerReturn {
  summary: string;
  tone: SummaryTone;
  isGenerating: boolean;
  hasGenerated: boolean;
  setTone: (tone: SummaryTone) => void;
  generateSummary: (inputData: string) => Promise<void>;
  regenerate: () => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useSummarizer(): UseSummarizerReturn {
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState<SummaryTone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const lastInputRef = useRef<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateSummary = useCallback(async (inputData: string) => {
    if (!inputData.trim()) {
      toast.error("Please enter some report data to summarize");
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    lastInputRef.current = inputData;

    setIsGenerating(true);
    setSummary("");

    try {
      const response = await fetch(SUMMARIZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ reportData: inputData, tone }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast.error("Rate limit exceeded", {
            description: "Please wait a moment and try again.",
          });
          throw new Error("Rate limit exceeded");
        }
        
        if (response.status === 402) {
          toast.error("AI credits exhausted", {
            description: "Please add credits to your workspace.",
          });
          throw new Error("Credits exhausted");
        }

        throw new Error(errorData.error || "Failed to generate summary");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullSummary = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullSummary += content;
              setSummary(fullSummary);
            }
          } catch {
            // Incomplete JSON, put it back
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullSummary += content;
              setSummary(fullSummary);
            }
          } catch {
            /* ignore partial leftovers */
          }
        }
      }

      setHasGenerated(true);
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Cancelled, don't show error
        return;
      }
      console.error("Summary generation error:", error);
      if (!summary) {
        toast.error("Failed to generate summary", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [tone, summary]);

  const regenerate = useCallback(async () => {
    if (lastInputRef.current) {
      await generateSummary(lastInputRef.current);
    }
  }, [generateSummary]);

  const reset = useCallback(() => {
    setSummary("");
    setHasGenerated(false);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  return {
    summary,
    tone,
    isGenerating,
    hasGenerated,
    setTone,
    generateSummary,
    regenerate,
    reset,
    cancel,
  };
}
