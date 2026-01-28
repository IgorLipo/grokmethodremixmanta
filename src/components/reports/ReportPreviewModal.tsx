import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { CanvasModule, getModuleById, iconMap, periodOptions } from "@/data/mockReports";
import { toast } from "sonner";

interface ReportPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  period: string;
  modules: CanvasModule[];
}

export function ReportPreviewModal({
  open,
  onOpenChange,
  title,
  period,
  modules,
}: ReportPreviewModalProps) {
  const periodLabel = periodOptions.find((p) => p.value === period)?.label || period;

  const handleExport = () => {
    toast.success("Report exported!", {
      description: "Your report has been downloaded as PDF.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Report Preview</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Preview Content - Simulated PDF */}
        <div className="flex-1 overflow-y-auto bg-muted/50 rounded-lg p-4">
          <div className="bg-white dark:bg-card rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
            {/* Report Header */}
            <div className="border-b border-border pb-6 mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Period: {periodLabel} • Generated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Report Modules */}
            {modules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No modules added to this report.</p>
                <p className="text-sm mt-2">Add modules from the sidebar to see them here.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {modules.map((canvasModule, index) => {
                  const module = getModuleById(canvasModule.moduleId);
                  if (!module) return null;

                  const IconComponent = iconMap[module.icon];
                  const customTitle = canvasModule.config.customTitle as string;

                  return (
                    <div key={canvasModule.id} className="page-break-inside-avoid">
                      <div className="flex items-center gap-2 mb-4">
                        {IconComponent && (
                          <IconComponent className="h-5 w-5 text-accent" />
                        )}
                        <h2 className="text-lg font-semibold text-foreground">
                          {customTitle || module.name}
                        </h2>
                      </div>

                      {/* Placeholder content based on module type */}
                      <div className="border border-border rounded-lg overflow-hidden">
                        {module.type === "chart" && (
                          <div className="h-48 bg-gradient-to-br from-accent/5 to-accent/10 flex items-center justify-center">
                            <div className="text-center">
                              <IconComponent className="h-12 w-12 text-accent/30 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                {module.name} Chart
                              </p>
                            </div>
                          </div>
                        )}

                        {module.type === "table" && (
                          <div className="p-4">
                            <div className="grid grid-cols-4 gap-4 text-xs font-medium text-muted-foreground border-b border-border pb-2 mb-2">
                              <span>Department</span>
                              <span>Budget</span>
                              <span>Actual</span>
                              <span>Variance</span>
                            </div>
                            {["Engineering", "Marketing", "Sales"].map((dept) => (
                              <div
                                key={dept}
                                className="grid grid-cols-4 gap-4 text-sm py-2 border-b border-border/50"
                              >
                                <span>{dept}</span>
                                <span>$150,000</span>
                                <span>$142,000</span>
                                <span className="text-success">-$8,000</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {module.type === "metric" && (
                          <div className="p-4 grid grid-cols-3 gap-4">
                            {["ARR", "Gross Margin", "NDR"].map((metric) => (
                              <div key={metric} className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-xs text-muted-foreground mb-1">{metric}</p>
                                <p className="text-xl font-bold text-foreground">
                                  {metric === "ARR" ? "$12.5M" : metric === "Gross Margin" ? "78.2%" : "114%"}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {module.type === "text" && (
                          <div className="p-4 text-sm text-muted-foreground">
                            <p>
                              This quarter showed strong performance across key metrics.
                              Revenue grew 12.4% YoY while maintaining healthy margins.
                              The team successfully controlled costs, coming in under budget
                              across most departments.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Report Footer */}
            <div className="mt-12 pt-6 border-t border-border text-center text-xs text-muted-foreground">
              <p>Finance Pulse • Confidential</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
