import { FileText, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Reports() {
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

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">No reports yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Create your first financial report using our drag-and-drop builder.
          </p>
          <Link to="/reports/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
