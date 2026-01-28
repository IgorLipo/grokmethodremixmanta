import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CanvasModule, getModuleById, iconMap } from "@/data/mockReports";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ModuleConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canvasModule: CanvasModule | null;
  onSave: (canvasId: string, config: Record<string, unknown>) => void;
}

export function ModuleConfigModal({
  open,
  onOpenChange,
  canvasModule,
  onSave,
}: ModuleConfigModalProps) {
  const [config, setConfig] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (canvasModule) {
      setConfig(canvasModule.config);
    }
  }, [canvasModule]);

  if (!canvasModule) return null;

  const module = getModuleById(canvasModule.moduleId);
  if (!module) return null;

  const IconComponent = iconMap[module.icon];

  const handleSave = () => {
    onSave(canvasModule.id, config);
    onOpenChange(false);
    toast.success("Module configured", {
      description: `${module.name} settings have been updated.`,
    });
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-5 w-5 text-accent" />}
            Configure {module.name}
          </DialogTitle>
          <DialogDescription>
            Customize how this module appears in your report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Common options for all module types */}
          <div className="space-y-2">
            <Label htmlFor="custom-title">Custom Title (optional)</Label>
            <Input
              id="custom-title"
              placeholder={module.name}
              value={(config.customTitle as string) || ""}
              onChange={(e) => updateConfig("customTitle", e.target.value)}
            />
          </div>

          {/* Chart-specific options */}
          {module.type === "chart" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select
                  value={(config.chartType as string) || "bar"}
                  onValueChange={(value) => updateConfig("chartType", value)}
                >
                  <SelectTrigger id="chart-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-legend">Show Legend</Label>
                <Switch
                  id="show-legend"
                  checked={(config.showLegend as boolean) ?? true}
                  onCheckedChange={(checked) => updateConfig("showLegend", checked)}
                />
              </div>
            </>
          )}

          {/* Table-specific options */}
          {module.type === "table" && (
            <div className="space-y-2">
              <Label htmlFor="rows-per-page">Rows per Page</Label>
              <Select
                value={(config.rowsPerPage as string) || "10"}
                onValueChange={(value) => updateConfig("rowsPerPage", value)}
              >
                <SelectTrigger id="rows-per-page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="25">25 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Metric-specific options */}
          {module.type === "metric" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="show-comparison">Show Comparison</Label>
              <Switch
                id="show-comparison"
                checked={(config.showComparison as boolean) ?? true}
                onCheckedChange={(checked) => updateConfig("showComparison", checked)}
              />
            </div>
          )}

          {/* Text-specific options */}
          {module.type === "text" && (
            <div className="flex items-center justify-between">
              <Label htmlFor="use-ai">Generate with AI</Label>
              <Switch
                id="use-ai"
                checked={(config.useAI as boolean) ?? false}
                onCheckedChange={(checked) => updateConfig("useAI", checked)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
