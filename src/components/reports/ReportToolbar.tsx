import { Eye, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { periodOptions } from "@/data/mockReports";
import { toast } from "sonner";

interface ReportToolbarProps {
  title: string;
  period: string;
  onTitleChange: (title: string) => void;
  onPeriodChange: (period: string) => void;
  onPreview: () => void;
  moduleCount: number;
}

export function ReportToolbar({
  title,
  period,
  onTitleChange,
  onPeriodChange,
  onPreview,
  moduleCount,
}: ReportToolbarProps) {
  const handleExport = () => {
    toast.success("Report exported!", {
      description: "Your report has been downloaded as PDF.",
    });
  };

  const handleSave = () => {
    toast.success("Report saved!", {
      description: "Your changes have been saved locally.",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-lg font-semibold border-none bg-transparent px-0 h-auto focus-visible:ring-0 max-w-xs"
          placeholder="Report Title"
        />

        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">
          {moduleCount} {moduleCount === 1 ? "module" : "modules"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPreview}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
}
