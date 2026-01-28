import { SummaryTone, toneOptions } from "@/data/mockAI";
import { cn } from "@/lib/utils";

interface ToneSelectorProps {
  value: SummaryTone;
  onChange: (tone: SummaryTone) => void;
  disabled?: boolean;
}

export function ToneSelector({ value, onChange, disabled }: ToneSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Tone</label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {toneOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "p-3 rounded-xl border text-left transition-all",
              value === option.value
                ? "border-accent bg-accent/5 ring-1 ring-accent"
                : "border-border hover:border-accent/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <p className="text-sm font-medium text-foreground">{option.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
