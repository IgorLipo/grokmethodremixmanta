import { Copy, RefreshCw, Check, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface SummaryOutputProps {
  summary: string;
  isGenerating: boolean;
  onRegenerate: () => void;
}

export function SummaryOutput({ summary, isGenerating, onRegenerate }: SummaryOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Executive Summary</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
            Regenerate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={isGenerating || !summary}
            className="gap-2"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Copy
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 min-h-[200px]">
        {isGenerating && !summary && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Generating executive summary...</span>
          </div>
        )}
        
        {summary && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div 
              className="whitespace-pre-wrap text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: summary
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
                  .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mt-3 mb-1">$1</h3>')
                  .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                  .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
                  .replace(/\|(.*)\|/g, '<code class="bg-muted px-1 rounded">$1</code>')
              }}
            />
            {isGenerating && (
              <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
