import { Construction } from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences</p>
        </div>

        {/* Placeholder */}
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-4">
            <Construction className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">Coming in Phase 4</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Profile and export preferences settings.
          </p>
        </div>
      </div>
    </div>
  );
}
