import { Construction, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            AI Report Summarizer
          </h1>
          <p className="text-sm text-muted-foreground">Generate executive summaries with AI</p>
        </div>

        {/* Placeholder */}
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
            <Construction className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">Coming in Phase 5</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            AI-powered report summarization with Lovable AI integration.
          </p>
          <Button variant="outline" disabled>
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
        </div>
      </div>
    </div>
  );
}
