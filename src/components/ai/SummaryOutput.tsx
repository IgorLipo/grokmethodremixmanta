import { Copy, RefreshCw, Check, Brain, TrendingUp, TrendingDown, Minus, FileText, DollarSign, Target, AlertTriangle, CheckCircle2, BarChart3, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart as RechartsPie,
  Pie,
} from "recharts";

interface SummaryOutputProps {
  summary: string;
  isGenerating: boolean;
  onRegenerate: () => void;
}

// Chart colors matching the report builder
const COLORS = [
  "hsl(239, 84%, 67%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(215, 16%, 47%)",
  "hsl(340, 82%, 52%)",
];

// Extract KPIs from summary text
function extractKPIs(text: string): Array<{ label: string; value: string; trend?: "up" | "down" | "stable"; change?: string }> {
  const kpis: Array<{ label: string; value: string; trend?: "up" | "down" | "stable"; change?: string }> = [];
  
  // Look for common KPI patterns
  const patterns = [
    { regex: /ARR[:\s]+\$?([\d.]+[MBK]?)/i, label: "ARR" },
    { regex: /revenue[:\s]+\$?([\d.]+[MBK]?)/i, label: "Revenue" },
    { regex: /gross\s*margin[:\s]+([\d.]+%)/i, label: "Gross Margin" },
    { regex: /LTV:?CAC[:\s]+([\d.]+x)/i, label: "LTV:CAC" },
    { regex: /NDR[:\s]+([\d.]+%)/i, label: "NDR" },
    { regex: /burn\s*rate[:\s]+\$?([\d,]+)/i, label: "Monthly Burn" },
    { regex: /runway[:\s]+([\d.]+\s*months?)/i, label: "Runway" },
    { regex: /cash[:\s]+\$?([\d.]+[MBK]?)/i, label: "Cash Position" },
    { regex: /growth[:\s]+([\d.]+%)/i, label: "YoY Growth" },
  ];

  for (const { regex, label } of patterns) {
    const match = text.match(regex);
    if (match) {
      const existingKpi = kpis.find(k => k.label === label);
      if (!existingKpi) {
        // Determine trend based on context
        let trend: "up" | "down" | "stable" = "stable";
        const contextMatch = text.slice(Math.max(0, (match.index || 0) - 50), (match.index || 0) + 100);
        if (/strong|healthy|robust|positive|grew|increased|improved/i.test(contextMatch)) trend = "up";
        if (/decline|weak|concern|decreased|reduced|lagging/i.test(contextMatch)) trend = "down";
        
        kpis.push({
          label,
          value: match[1].includes("$") ? match[1] : (label.includes("$") ? match[1] : match[1]),
          trend,
        });
      }
    }
  }

  return kpis.slice(0, 6);
}

// Parse markdown into structured sections
function parseMarkdown(text: string) {
  const sections: Array<{
    type: "heading" | "paragraph" | "list" | "table" | "highlight" | "callout";
    level?: number;
    content: string;
    items?: string[];
    rows?: string[][];
    variant?: "success" | "warning" | "info";
  }> = [];

  const lines = text.split("\n");
  let currentList: string[] = [];
  let currentTable: string[][] = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table detection
    if (line.includes("|") && line.trim().startsWith("|")) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }
      // Skip separator line
      if (!/^\|[\s\-:|]+\|$/.test(line.trim())) {
        const cells = line.split("|").map(c => c.trim()).filter(c => c);
        if (cells.length > 0) {
          currentTable.push(cells);
        }
      }
      continue;
    } else if (inTable) {
      if (currentTable.length > 0) {
        sections.push({ type: "table", content: "", rows: currentTable });
      }
      inTable = false;
      currentTable = [];
    }

    // Flush current list if we hit a non-list line
    if (currentList.length > 0 && !line.match(/^[\*\-•]\s+/) && !line.match(/^\d+\.\s+/)) {
      sections.push({ type: "list", content: "", items: currentList });
      currentList = [];
    }

    // Headings
    if (line.startsWith("# ")) {
      sections.push({ type: "heading", level: 1, content: line.slice(2).trim() });
    } else if (line.startsWith("## ")) {
      sections.push({ type: "heading", level: 2, content: line.slice(3).trim() });
    } else if (line.startsWith("### ")) {
      sections.push({ type: "heading", level: 3, content: line.slice(4).trim() });
    }
    // Highlight boxes (lines starting with specific keywords)
    else if (/^(Key Insight|Important|Note|Warning|Success|Recommendation):/i.test(line.trim())) {
      const variant = /warning|concern|attention/i.test(line) ? "warning" : 
                      /success|achievement|strength/i.test(line) ? "success" : "info";
      sections.push({ type: "callout", content: line.trim(), variant });
    }
    // List items
    else if (line.match(/^[\*\-•]\s+/)) {
      currentList.push(line.replace(/^[\*\-•]\s+/, "").trim());
    } else if (line.match(/^\d+\.\s+/)) {
      currentList.push(line.replace(/^\d+\.\s+/, "").trim());
    }
    // Regular paragraphs
    else if (line.trim()) {
      // Check for highlight patterns
      if (/^(Financial Highlights|Areas Requiring Attention|Key Takeaways|Recommendations)/i.test(line.trim())) {
        sections.push({ type: "heading", level: 2, content: line.trim() });
      } else {
        sections.push({ type: "paragraph", content: line.trim() });
      }
    }
  }

  // Flush remaining items
  if (currentList.length > 0) {
    sections.push({ type: "list", content: "", items: currentList });
  }
  if (currentTable.length > 0) {
    sections.push({ type: "table", content: "", rows: currentTable });
  }

  return sections;
}

// Format inline markdown (bold, italic, code)
function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-accent">$1</code>');
}

// Sample chart data for visualizations
const performanceData = [
  { month: "Jan", revenue: 9.8, target: 9.5 },
  { month: "Feb", revenue: 10.2, target: 10.0 },
  { month: "Mar", revenue: 10.8, target: 10.5 },
  { month: "Apr", revenue: 11.5, target: 11.0 },
  { month: "May", revenue: 11.8, target: 11.5 },
  { month: "Jun", revenue: 12.5, target: 12.0 },
];

const allocationData = [
  { name: "Engineering", value: 45 },
  { name: "Sales & Mktg", value: 25 },
  { name: "Operations", value: 20 },
  { name: "G&A", value: 10 },
];

export function SummaryOutput({ summary, isGenerating, onRegenerate }: SummaryOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const kpis = useMemo(() => extractKPIs(summary), [summary]);
  const sections = useMemo(() => parseMarkdown(summary), [summary]);

  // Determine if we have enough content for enhanced display
  const hasEnoughContent = summary.length > 200;

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
      {/* Header - Report Style */}
      <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent px-6 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Executive Summary</h3>
              <p className="text-xs text-muted-foreground">
                AI-generated analysis • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
              <span className="hidden sm:inline">Regenerate</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={isGenerating || !summary}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Copy</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isGenerating && !summary && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-accent/20" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Analyzing your data...</p>
              <p className="text-xs text-muted-foreground mt-1">Generating executive summary with AI</p>
            </div>
          </div>
        )}
        
        {summary && (
          <div className="space-y-8">
            {/* KPI Cards - Only show if we extracted some */}
            {kpis.length >= 3 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {kpis.map((kpi, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 border border-border/50 hover:border-accent/30 transition-colors"
                  >
                    <p className="text-xs text-muted-foreground mb-1 truncate">{kpi.label}</p>
                    <p className="text-lg font-bold text-foreground">{kpi.value}</p>
                    {kpi.trend && (
                      <div className="flex items-center gap-1 mt-1">
                        {kpi.trend === "up" && <TrendingUp className="h-3 w-3 text-success" />}
                        {kpi.trend === "down" && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {kpi.trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
                        <span className={cn(
                          "text-xs",
                          kpi.trend === "up" && "text-success",
                          kpi.trend === "down" && "text-destructive",
                          kpi.trend === "stable" && "text-muted-foreground"
                        )}>
                          {kpi.trend === "up" ? "Strong" : kpi.trend === "down" ? "Attention" : "Stable"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Visual Charts Row */}
            {hasEnoughContent && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4 text-accent" />
                    <h4 className="text-sm font-semibold text-foreground">Performance Trend</h4>
                  </div>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} 
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'hsl(222, 47%, 11%)', 
                            border: 'none', 
                            borderRadius: '8px', 
                            fontSize: '12px' 
                          }}
                          formatter={(value: number) => [`$${value}M`, 'Revenue']}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(239, 84%, 67%)"
                          strokeWidth={2}
                          fill="url(#revenueGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Budget Allocation */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4 text-accent" />
                    <h4 className="text-sm font-semibold text-foreground">Budget Allocation</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-[120px] w-[120px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="80%"
                            dataKey="value"
                            paddingAngle={2}
                          >
                            {allocationData.map((_, idx) => (
                              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                            ))}
                          </Pie>
                        </RechartsPie>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {allocationData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                            />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                          <span className="font-medium text-foreground">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parsed Content Sections */}
            <div className="space-y-6">
              {sections.map((section, idx) => {
                // Heading
                if (section.type === "heading") {
                  if (section.level === 1) {
                    return (
                      <h2 key={idx} className="text-xl font-bold text-foreground border-b border-border pb-2 mt-6">
                        {section.content}
                      </h2>
                    );
                  }
                  if (section.level === 2) {
                    return (
                      <div key={idx} className="flex items-center gap-2 mt-6 mb-3">
                        {/highlight|strength|achievement/i.test(section.content) ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : /attention|concern|warning/i.test(section.content) ? (
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        ) : (
                          <FileText className="h-5 w-5 text-accent" />
                        )}
                        <h3 className="text-lg font-semibold text-foreground">{section.content}</h3>
                      </div>
                    );
                  }
                  return (
                    <h4 key={idx} className="text-base font-medium text-foreground mt-4 mb-2">
                      {section.content}
                    </h4>
                  );
                }

                // Callout boxes
                if (section.type === "callout") {
                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-xl p-4 border",
                        section.variant === "success" && "bg-success/10 border-success/30",
                        section.variant === "warning" && "bg-warning/10 border-warning/30",
                        section.variant === "info" && "bg-accent/10 border-accent/30"
                      )}
                    >
                      <p 
                        className="text-sm text-foreground"
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content) }}
                      />
                    </div>
                  );
                }

                // Lists with styled bullets
                if (section.type === "list" && section.items) {
                  return (
                    <ul key={idx} className="space-y-2 ml-1">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(item) }} />
                        </li>
                      ))}
                    </ul>
                  );
                }

                // Tables with professional styling
                if (section.type === "table" && section.rows && section.rows.length > 0) {
                  const headers = section.rows[0];
                  const bodyRows = section.rows.slice(1);
                  
                  return (
                    <div key={idx} className="overflow-x-auto rounded-xl border border-border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {headers.map((header, hIdx) => (
                              <th 
                                key={hIdx} 
                                className="px-4 py-3 text-left font-semibold text-foreground border-b border-border"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bodyRows.map((row, rIdx) => (
                            <tr key={rIdx} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                              {row.map((cell, cIdx) => (
                                <td 
                                  key={cIdx} 
                                  className={cn(
                                    "px-4 py-3",
                                    cIdx === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                  )}
                                  dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(cell) }}
                                />
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                // Regular paragraphs
                if (section.type === "paragraph") {
                  return (
                    <p 
                      key={idx} 
                      className="text-sm text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(section.content) }}
                    />
                  );
                }

                return null;
              })}
            </div>

            {/* Streaming indicator */}
            {isGenerating && (
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs text-muted-foreground">AI is still generating...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {summary && !isGenerating && (
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Brain className="h-3 w-3" />
              <span>Powered by Lovable AI</span>
            </div>
            <span>Generated {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
