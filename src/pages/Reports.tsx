import { FileText, Plus, LayoutTemplate } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { demoTemplates, getModuleById, iconMap } from "@/data/mockReports";
import { toast } from "sonner";

export default function Reports() {
  const navigate = useNavigate();

  const handleUseTemplate = (templateId: string) => {
    const template = demoTemplates.find((t) => t.id === templateId);
    if (template) {
      toast.success(`Loading "${template.name}"`, {
        description: "Template modules added to your report.",
      });
      navigate("/reports/new", { state: { templateId } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
            <p className="text-sm text-muted-foreground">Build and manage financial reports</p>
          </div>
          <Link to="/reports/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>

        {/* Templates Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-medium text-foreground">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoTemplates.map((template) => (
              <div
                key={template.id}
                className="group p-6 rounded-2xl border border-border bg-card hover:border-accent hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleUseTemplate(template.id)}
              >
                <h3 className="text-base font-medium text-foreground mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.moduleIds.slice(0, 3).map((moduleId) => {
                    const module = getModuleById(moduleId);
                    if (!module) return null;
                    const IconComponent = iconMap[module.icon];
                    return (
                      <span
                        key={moduleId}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground"
                      >
                        {IconComponent && <IconComponent className="h-3 w-3" />}
                        {module.name}
                      </span>
                    );
                  })}
                  {template.moduleIds.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                      +{template.moduleIds.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Empty State for saved reports */}
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Your Reports</h2>
          <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium text-foreground mb-2">No saved reports</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Reports you create will appear here. In demo mode, reports are not persisted.
            </p>
            <Link to="/reports/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Report
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
