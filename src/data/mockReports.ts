// Mock Report Builder Data - Finance Pulse Demo

import { BarChart3, PieChart, TrendingUp, Table, DollarSign, Users, FileText, Calendar } from "lucide-react";

export type ModuleType = "chart" | "table" | "metric" | "text";
export type ModuleCategory = "financial" | "departmental" | "visualizations";

export interface ReportModule {
  id: string;
  type: ModuleType;
  name: string;
  icon: string;
  category: ModuleCategory;
  description: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  moduleIds: string[];
}

export interface CanvasModule {
  id: string;
  moduleId: string;
  config: Record<string, unknown>;
}

export const availableModules: ReportModule[] = [
  // Financial Metrics
  {
    id: "revenue",
    type: "chart",
    name: "Revenue Overview",
    icon: "BarChart3",
    category: "financial",
    description: "Monthly/quarterly revenue breakdown",
  },
  {
    id: "expenses",
    type: "chart",
    name: "Expense Breakdown",
    icon: "PieChart",
    category: "financial",
    description: "Categorized expense analysis",
  },
  {
    id: "cash_flow",
    type: "chart",
    name: "Cash Flow",
    icon: "TrendingUp",
    category: "financial",
    description: "Operating cash flow over time",
  },
  {
    id: "profitability",
    type: "metric",
    name: "Profitability Metrics",
    icon: "DollarSign",
    category: "financial",
    description: "Gross margin, net margin, EBITDA",
  },
  // Departmental
  {
    id: "budget_table",
    type: "table",
    name: "Budget vs Actual",
    icon: "Table",
    category: "departmental",
    description: "Department budget comparison",
  },
  {
    id: "headcount",
    type: "metric",
    name: "Headcount Summary",
    icon: "Users",
    category: "departmental",
    description: "Team size and growth",
  },
  {
    id: "dept_spend",
    type: "chart",
    name: "Department Spending",
    icon: "BarChart3",
    category: "departmental",
    description: "Spend by department",
  },
  // Visualizations
  {
    id: "kpi_grid",
    type: "metric",
    name: "KPI Dashboard",
    icon: "BarChart3",
    category: "visualizations",
    description: "Key performance indicators grid",
  },
  {
    id: "trend_chart",
    type: "chart",
    name: "Trend Analysis",
    icon: "TrendingUp",
    category: "visualizations",
    description: "Multi-metric trend lines",
  },
  {
    id: "summary_text",
    type: "text",
    name: "Executive Summary",
    icon: "FileText",
    category: "visualizations",
    description: "Text block for narrative",
  },
];

export const demoTemplates: ReportTemplate[] = [
  {
    id: "monthly",
    name: "Monthly Financial Summary",
    description: "Standard monthly close report with revenue, expenses, and cash flow",
    moduleIds: ["revenue", "expenses", "cash_flow", "profitability"],
  },
  {
    id: "quarterly",
    name: "Quarterly Board Report",
    description: "Comprehensive quarterly report for board presentation",
    moduleIds: ["summary_text", "kpi_grid", "revenue", "budget_table", "trend_chart"],
  },
  {
    id: "department",
    name: "Department Budget Review",
    description: "Department-focused budget analysis and headcount",
    moduleIds: ["budget_table", "dept_spend", "headcount"],
  },
];

export const periodOptions = [
  { value: "q1-2024", label: "Q1 2024" },
  { value: "q2-2024", label: "Q2 2024" },
  { value: "q3-2024", label: "Q3 2024" },
  { value: "q4-2024", label: "Q4 2024" },
];

export const getModuleById = (id: string): ReportModule | undefined => {
  return availableModules.find((m) => m.id === id);
};

export const getModulesByCategory = (category: ModuleCategory): ReportModule[] => {
  return availableModules.filter((m) => m.category === category);
};

// Icon mapping for dynamic rendering
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  DollarSign,
  Users,
  FileText,
  Calendar,
};
