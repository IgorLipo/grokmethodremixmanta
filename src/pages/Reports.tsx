import { useState, useEffect } from "react";
import { FileText, Plus, LayoutTemplate, Trash2, Edit, Clock, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { demoTemplates, getModuleById, iconMap } from "@/data/mockReports";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SavedReport {
  id: string;
  title: string;
  period: string;
  moduleCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Reports() {
  const navigate = useNavigate();
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Load saved reports from sessionStorage
  useEffect(() => {
    const reports = sessionStorage.getItem("savedReports");
    if (reports) {
      try {
        setSavedReports(JSON.parse(reports));
      } catch {
        setSavedReports([]);
      }
    }
  }, []);

  const handleUseTemplate = (templateId: string) => {
    const template = demoTemplates.find((t) => t.id === templateId);
    if (template) {
      sessionStorage.setItem("selectedTemplate", JSON.stringify(template));
      toast.success(`Loading "${template.name}"`, {
        description: "Template modules added to your report.",
      });
      navigate("/reports/new");
    }
  };

  const handleEditReport = (reportId: string) => {
    sessionStorage.setItem("editReportId", reportId);
    navigate("/reports/new");
  };

  const handleDeleteReport = () => {
    if (!deleteId) return;
    const updated = savedReports.filter((r) => r.id !== deleteId);
    setSavedReports(updated);
    sessionStorage.setItem("savedReports", JSON.stringify(updated));
    // Also remove the actual report data
    sessionStorage.removeItem(`report-${deleteId}`);
    toast.success("Report deleted");
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          <div className="flex items-center gap-2">
            <Link to="/reports/templates">
              <Button variant="outline" className="gap-2">
                <LayoutTemplate className="h-4 w-4" />
                Templates
              </Button>
            </Link>
            <Link to="/reports/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Your Reports Section */}
        {savedReports.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-medium text-foreground mb-4">Your Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedReports.map((report) => (
                <div
                  key={report.id}
                  className="group p-5 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">{report.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs">{report.period}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.moduleCount} modules
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatDate(report.updatedAt)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditReport(report.id)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Templates Section */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <LayoutTemplate className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-medium text-foreground">Quick Start Templates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoTemplates.slice(0, 3).map((template) => (
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
          <div className="mt-4 text-center">
            <Link to="/reports/templates">
              <Button variant="ghost" size="sm">
                View all templates →
              </Button>
            </Link>
          </div>
        </section>

        {/* Empty State for saved reports */}
        {savedReports.length === 0 && (
          <section>
            <h2 className="text-lg font-medium text-foreground mb-4">Your Reports</h2>
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-4">
                <FileText className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">No saved reports</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">
                Reports you create will appear here. Save reports to access them later in this session.
              </p>
              <Link to="/reports/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Report
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The report will be permanently removed from your session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
