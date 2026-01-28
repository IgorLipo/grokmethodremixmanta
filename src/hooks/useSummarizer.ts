import { useState, useCallback } from "react";
import { SummaryTone, demoSummaries } from "@/data/mockAI";

interface UseSummarizerReturn {
  summary: string;
  tone: SummaryTone;
  isGenerating: boolean;
  hasGenerated: boolean;
  setTone: (tone: SummaryTone) => void;
  generateSummary: (inputData?: string) => Promise<void>;
  regenerate: () => Promise<void>;
  reset: () => void;
}

export function useSummarizer(): UseSummarizerReturn {
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState<SummaryTone>("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateSummary = useCallback(async (inputData?: string) => {
    setIsGenerating(true);
    setSummary("");
    
    // Simulate streaming effect with demo data
    const fullSummary = demoSummaries[tone];
    const words = fullSummary.split(" ");
    
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 30));
      setSummary((prev) => prev + (i === 0 ? "" : " ") + words[i]);
    }
    
    setIsGenerating(false);
    setHasGenerated(true);
  }, [tone]);

  const regenerate = useCallback(async () => {
    await generateSummary();
  }, [generateSummary]);

  const reset = useCallback(() => {
    setSummary("");
    setHasGenerated(false);
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
  };
}
