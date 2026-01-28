import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { demoTemplates, getModuleById, iconMap } from "@/data/mockReports";
import { toast } from "sonner";

export default function ReportTemplates() {
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
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Report Templates</h1>
          <p className="text-sm text-muted-foreground">Start with a pre-built template</p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 gap-6">
          {demoTemplates.map((template) => (
            <div
              key={template.id}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-accent hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-foreground mb-2">
                    {template.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    {template.description}
                  </p>
                  
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Included Modules
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {template.moduleIds.map((moduleId) => {
                      const module = getModuleById(moduleId);
                      if (!module) return null;
                      const IconComponent = iconMap[module.icon];
                      return (
                        <span
                          key={moduleId}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted rounded-lg text-foreground"
                        >
                          {IconComponent && <IconComponent className="h-4 w-4 text-accent" />}
                          {module.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Button onClick={() => handleUseTemplate(template.id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
