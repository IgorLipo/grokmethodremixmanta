import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft, ArrowRight, Save, Send, CheckCircle2, ClipboardList,
  Camera, Upload, Share2, X, Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { logAudit } from "@/hooks/useAuditLog";
import { notifySiteReportSubmitted } from "@/hooks/useNotificationTriggers";

const SECTIONS = [
  {
    id: "site_access",
    title: "Site Access",
    fields: [
      { key: "access_type", label: "Access type", type: "select", options: ["Front door", "Side gate", "Rear access", "Key safe", "Other"], required: true },
      { key: "access_notes", label: "Access notes", type: "textarea" },
      { key: "parking_available", label: "Parking available on-site?", type: "boolean", required: true },
      { key: "parking_notes", label: "Parking details", type: "text" },
      { key: "access_photo", label: "Photo of access point", type: "photo" },
    ],
  },
  {
    id: "roof_assessment",
    title: "Roof Assessment",
    fields: [
      { key: "roof_type", label: "Roof type", type: "select", options: ["Pitched tile", "Flat", "Slate", "Metal", "Concrete", "Other"], required: true },
      { key: "roof_orientation", label: "Roof orientation", type: "select", options: ["South", "South-East", "South-West", "East", "West", "North"], required: true },
      { key: "roof_pitch", label: "Estimated roof pitch (degrees)", type: "number" },
      { key: "roof_condition", label: "Roof condition", type: "select", options: ["Excellent", "Good", "Fair", "Poor", "Needs repair"], required: true },
      { key: "roof_condition_notes", label: "Condition notes", type: "textarea" },
      { key: "shading_present", label: "Any shading issues?", type: "boolean", required: true },
      { key: "shading_details", label: "Shading details", type: "textarea" },
      { key: "roof_photo", label: "Roof photo", type: "photo", required: true },
    ],
  },
  {
    id: "electrical",
    title: "Electrical Assessment",
    fields: [
      { key: "meter_type", label: "Meter type", type: "select", options: ["Smart meter", "Standard", "Economy 7", "Prepayment", "Other"], required: true },
      { key: "consumer_unit_location", label: "Consumer unit location", type: "text", required: true },
      { key: "consumer_unit_condition", label: "Consumer unit condition", type: "select", options: ["Modern (RCD protected)", "Older (needs upgrade)", "Unknown"], required: true },
      { key: "earthing_type", label: "Earthing arrangement", type: "select", options: ["TN-S", "TN-C-S (PME)", "TT", "Unknown"], required: true },
      { key: "spare_ways", label: "Spare ways available?", type: "boolean" },
      { key: "electrical_notes", label: "Additional electrical notes", type: "textarea" },
      { key: "consumer_unit_photo", label: "Consumer unit photo", type: "photo" },
    ],
  },
  {
    id: "panel_layout",
    title: "Panel Layout & Specification",
    fields: [
      { key: "panel_count", label: "Number of panels", type: "number", required: true },
      { key: "panel_model", label: "Panel model", type: "text" },
      { key: "panel_wattage", label: "Panel wattage (W)", type: "number" },
      { key: "inverter_model", label: "Inverter model", type: "text" },
      { key: "inverter_location", label: "Inverter proposed location", type: "text" },
      { key: "battery_included", label: "Battery storage included?", type: "boolean" },
      { key: "battery_model", label: "Battery model", type: "text" },
      { key: "layout_notes", label: "Layout notes", type: "textarea" },
      { key: "panel_layout_photo", label: "Panel layout photo", type: "photo", required: true },
    ],
  },
  {
    id: "scaffolding",
    title: "Scaffolding Assessment",
    fields: [
      { key: "scaffold_required", label: "Scaffolding required?", type: "boolean", required: true },
      { key: "scaffold_height", label: "Estimated scaffold height (m)", type: "number" },
      { key: "scaffold_sides", label: "Number of sides", type: "select", options: ["1", "2", "3", "4"] },
      { key: "ground_conditions", label: "Ground conditions", type: "select", options: ["Solid/paved", "Grass/soft", "Sloped", "Restricted access"] },
      { key: "scaffold_notes", label: "Scaffolding notes", type: "textarea" },
      { key: "scaffold_photo", label: "Scaffolding area photo", type: "photo" },
    ],
  },
  {
    id: "health_safety",
    title: "Health & Safety",
    fields: [
      { key: "asbestos_risk", label: "Asbestos risk identified?", type: "boolean", required: true },
      { key: "asbestos_notes", label: "Asbestos details", type: "textarea" },
      { key: "hazards_identified", label: "Other hazards identified?", type: "boolean" },
      { key: "hazard_notes", label: "Hazard details", type: "textarea" },
      { key: "ppe_requirements", label: "PPE requirements", type: "text" },
      { key: "risk_level", label: "Overall risk assessment", type: "select", options: ["Low", "Medium", "High"], required: true },
      { key: "hazard_photo", label: "Photo of identified hazards", type: "photo" },
    ],
  },
  {
    id: "summary",
    title: "Summary & Recommendations",
    fields: [
      { key: "installation_viable", label: "Installation viable?", type: "boolean", required: true },
      { key: "estimated_system_size", label: "Estimated system size (kWp)", type: "number" },
      { key: "estimated_annual_yield", label: "Estimated annual yield (kWh)", type: "number" },
      { key: "recommendations", label: "Recommendations", type: "textarea", required: true },
      { key: "additional_work_required", label: "Additional work required", type: "textarea" },
      { key: "engineer_comments", label: "Final comments", type: "textarea" },
      { key: "completion_photo", label: "Final completion photo", type: "photo" },
    ],
  },
];

export default function SiteReport() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [reportPhotos, setReportPhotos] = useState<Record<string, string>>({});
  const [reportId, setReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportStatus, setReportStatus] = useState("draft");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!jobId) return;
      const { data } = await (supabase as any)
        .from("site_reports")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setReportId(data.id);
        setReportData(data.report_data || {});
        setReportPhotos(data.report_photos || {});
        setReportStatus(data.status);
      }
      setLoading(false);
    };
    load();
  }, [jobId]);

  const setValue = (key: string, value: any) => {
    setReportData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePhotoUpload = async (fieldKey: string, file: File) => {
    if (!jobId || !user) return;
    setUploadingField(fieldKey);
    const ext = file.name.split(".").pop();
    const path = `${jobId}/report/${fieldKey}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("job-photos").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingField(null);
      return;
    }
    const { data: urlData } = supabase.storage.from("job-photos").getPublicUrl(path);
    setReportPhotos((prev) => ({ ...prev, [fieldKey]: urlData.publicUrl }));
    setUploadingField(null);
    toast({ title: "Photo added" });
  };

  const saveProgress = async () => {
    if (!jobId || !user) return;
    setSaving(true);
    if (reportId) {
      await (supabase as any).from("site_reports").update({
        report_data: reportData,
        report_photos: reportPhotos,
        updated_at: new Date().toISOString(),
      }).eq("id", reportId);
    } else {
      const { data } = await (supabase as any).from("site_reports").insert({
        job_id: jobId,
        engineer_id: user.id,
        report_data: reportData,
        report_photos: reportPhotos,
      }).select("id").single();
      if (data) setReportId(data.id);
    }
    toast({ title: "Progress saved" });
    setSaving(false);
  };

  const submitReport = async () => {
    if (!reportId || !user || !jobId) return;
    const missing: string[] = [];
    SECTIONS.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) {
          if (field.type === "photo") {
            if (!reportPhotos[field.key]) missing.push(`${section.title}: ${field.label}`);
          } else if (reportData[field.key] === undefined || reportData[field.key] === "" || reportData[field.key] === null) {
            missing.push(`${section.title}: ${field.label}`);
          }
        }
      });
    });
    if (missing.length > 0) {
      toast({
        title: "Missing required fields",
        description: missing.slice(0, 3).join(", ") + (missing.length > 3 ? ` and ${missing.length - 3} more` : ""),
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    await (supabase as any).from("site_reports").update({
      status: "submitted",
      report_data: reportData,
      report_photos: reportPhotos,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", reportId);
    setReportStatus("submitted");
    logAudit(user.id, "site_report_submitted", "site_report", reportId, { job_id: jobId });
    notifySiteReportSubmitted(jobId, `Job ${jobId?.slice(0, 8)}`, user.id);
    toast({ title: "Site report submitted" });
    setSubmitting(false);
  };

  const generatePdfBlob = async (): Promise<Blob> => {
    // Build a simple HTML report and convert to a printable PDF via iframe
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Site Report</title>
    <style>
      body{font-family:system-ui,sans-serif;padding:24px;color:#1a1a1a;font-size:13px;max-width:700px;margin:0 auto}
      h1{font-size:20px;margin-bottom:4px}
      h2{font-size:15px;margin-top:20px;padding-bottom:4px;border-bottom:1px solid #ddd}
      .field{margin:6px 0}.label{font-weight:600;font-size:12px;color:#555}
      .value{margin-top:2px}
      img{max-width:100%;max-height:200px;border-radius:8px;margin-top:4px}
      .meta{color:#888;font-size:11px;margin-bottom:16px}
    </style></head><body>`;
    html += `<h1>Site Report</h1><p class="meta">Job: ${jobId?.slice(0, 8)} • Generated: ${new Date().toLocaleDateString("en-GB")}</p>`;
    SECTIONS.forEach((section) => {
      html += `<h2>${section.title}</h2>`;
      section.fields.forEach((field) => {
        const val = field.type === "photo" ? reportPhotos[field.key] : reportData[field.key];
        if (val !== undefined && val !== null && val !== "") {
          html += `<div class="field"><div class="label">${field.label}</div>`;
          if (field.type === "photo") {
            html += `<img src="${val}" alt="${field.label}"/>`;
          } else if (field.type === "boolean") {
            html += `<div class="value">${val ? "Yes" : "No"}</div>`;
          } else {
            html += `<div class="value">${val}</div>`;
          }
          html += `</div>`;
        }
      });
    });
    html += `</body></html>`;
    return new Blob([html], { type: "text/html" });
  };

  const shareReport = async () => {
    const blob = await generatePdfBlob();
    const file = new File([blob], `site-report-${jobId?.slice(0, 8)}.html`, { type: "text/html" });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ title: "Site Report", files: [file] });
        return;
      } catch { /* cancelled */ }
    }

    // Fallback: open in new tab for print/save-as-PDF
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.addEventListener("load", () => { win.print(); });
    }
    toast({ title: "Report opened — use Print → Save as PDF" });
  };

  const section = SECTIONS[currentSection];
  const progress = ((currentSection + 1) / SECTIONS.length) * 100;
  const filledCount = SECTIONS.reduce((acc, s) => {
    return acc + s.fields.filter((f) => {
      if (f.type === "photo") return !!reportPhotos[f.key];
      return reportData[f.key] !== undefined && reportData[f.key] !== "" && reportData[f.key] !== null;
    }).length;
  }, 0);
  const totalFields = SECTIONS.reduce((acc, s) => acc + s.fields.length, 0);

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  const isReadOnly = reportStatus === "submitted" || reportStatus === "approved";

  return (
    <div className="p-4 lg:p-8 space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/jobs/${jobId}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Job
        </Button>
        {reportStatus === "submitted" && (
          <Button variant="outline" size="sm" onClick={shareReport}>
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
        )}
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" /> Site Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{filledCount}/{totalFields} fields completed</p>
        <Progress value={(filledCount / totalFields) * 100} className="mt-2 h-2" />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrentSection(i)}
            className={cn(
              "text-[10px] px-2.5 py-1.5 rounded-full whitespace-nowrap font-medium transition-colors",
              i === currentSection
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{section.title}</CardTitle>
            <span className="text-xs text-muted-foreground">{currentSection + 1}/{SECTIONS.length}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {section.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-destructive">*</span>}
              </Label>

              {field.type === "text" && (
                <Input value={reportData[field.key] || ""} onChange={(e) => setValue(field.key, e.target.value)} disabled={isReadOnly} />
              )}
              {field.type === "number" && (
                <Input type="number" value={reportData[field.key] || ""} onChange={(e) => setValue(field.key, e.target.value)} disabled={isReadOnly} />
              )}
              {field.type === "textarea" && (
                <Textarea value={reportData[field.key] || ""} onChange={(e) => setValue(field.key, e.target.value)} rows={3} disabled={isReadOnly} />
              )}
              {field.type === "select" && (
                <Select value={reportData[field.key] || ""} onValueChange={(v) => setValue(field.key, v)} disabled={isReadOnly}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "boolean" && (
                <div className="flex items-center gap-2">
                  <Switch checked={!!reportData[field.key]} onCheckedChange={(v) => setValue(field.key, v)} disabled={isReadOnly} />
                  <span className="text-sm text-muted-foreground">{reportData[field.key] ? "Yes" : "No"}</span>
                </div>
              )}
              {field.type === "photo" && (
                <div className="space-y-2">
                  {reportPhotos[field.key] ? (
                    <div className="relative rounded-xl overflow-hidden border border-border cursor-pointer" onClick={() => setFullscreenPhoto(reportPhotos[field.key])}>
                      <img src={reportPhotos[field.key]} alt={field.label} className="w-full h-40 object-cover" />
                      {!isReadOnly && (
                        <Button
                          size="sm" variant="ghost"
                          className="absolute top-2 right-2 h-7 w-7 p-0 bg-black/50 text-white hover:bg-black/70"
                          onClick={(e) => { e.stopPropagation(); setReportPhotos((prev) => { const n = { ...prev }; delete n[field.key]; return n; }); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ) : !isReadOnly ? (
                    <label className="cursor-pointer">
                      <input
                        type="file" accept="image/*" capture="environment" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(field.key, f); }}
                        disabled={uploadingField === field.key}
                      />
                      <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                        {uploadingField === field.key ? (
                          <p className="text-xs text-muted-foreground">Uploading...</p>
                        ) : (
                          <>
                            <Camera className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground">Tap to take or upload photo</p>
                          </>
                        )}
                      </div>
                    </label>
                  ) : (
                    <div className="border border-border rounded-xl p-4 text-center">
                      <Image className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">No photo added</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" disabled={currentSection === 0} onClick={() => setCurrentSection((p) => p - 1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Previous
        </Button>
        <div className="flex gap-2">
          {!isReadOnly && (
            <Button variant="outline" size="sm" onClick={saveProgress} disabled={saving}>
              <Save className="h-4 w-4 mr-1" /> {saving ? "Saving..." : "Save"}
            </Button>
          )}
          {currentSection < SECTIONS.length - 1 ? (
            <Button size="sm" onClick={() => { saveProgress(); setCurrentSection((p) => p + 1); }}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : !isReadOnly ? (
            <Button size="sm" onClick={submitReport} disabled={submitting} className="bg-success hover:bg-success/90">
              <Send className="h-4 w-4 mr-1" /> {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          ) : null}
        </div>
      </div>

      {isReadOnly && (
        <Card className="border-success/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              <p className="text-sm text-foreground">This report has been submitted.</p>
            </div>
            <Button variant="outline" size="sm" onClick={shareReport}>
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
          </CardContent>
        </Card>
      )}

      {fullscreenPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenPhoto(null)}>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 z-10" onClick={() => setFullscreenPhoto(null)}>
            <X className="h-6 w-6" />
          </Button>
          <img src={fullscreenPhoto} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
