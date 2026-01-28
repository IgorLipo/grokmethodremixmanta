import { ReportModule } from "@/data/mockReports";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ComboChartProps {
  module: ReportModule;
  config: Record<string, unknown>;
  compact?: boolean;
}

const burnRateData = [
  { month: "Jul", burn: 320000, cumulative: 320000, runway: 22 },
  { month: "Aug", burn: 335000, cumulative: 655000, runway: 21 },
  { month: "Sep", burn: 318000, cumulative: 973000, runway: 20 },
  { month: "Oct", burn: 342000, cumulative: 1315000, runway: 19 },
  { month: "Nov", burn: 328000, cumulative: 1643000, runway: 18 },
  { month: "Dec", burn: 355000, cumulative: 1998000, runway: 17 },
];

const formatValue = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function ComboChart({ module, config, compact = false }: ComboChartProps) {
  const data = (module.previewData as typeof burnRateData) || burnRateData;
  const height = compact ? 160 : 200;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
          />
          <YAxis 
            yAxisId="left"
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
            tickFormatter={formatValue}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
            tickFormatter={(value) => `${value}mo`}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(222, 47%, 11%)', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => {
              if (name === "runway") return [`${value} months`, "Runway"];
              return [formatValue(value), name === "burn" ? "Monthly Burn" : "Cumulative"];
            }}
          />
          {(config.showLegend as boolean) !== false && (
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  burn: "Monthly Burn",
                  cumulative: "Cumulative",
                  runway: "Runway (months)"
                };
                return <span className="text-xs text-muted-foreground">{labels[value] || value}</span>;
              }}
            />
          )}
          <Bar 
            yAxisId="left"
            dataKey="burn" 
            fill="hsl(0, 84%, 60%)" 
            radius={[4, 4, 0, 0]}
            opacity={0.8}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="cumulative" 
            stroke="hsl(38, 92%, 50%)"
            strokeWidth={2}
            dot={{ r: 3, fill: "hsl(38, 92%, 50%)" }}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="runway" 
            stroke="hsl(239, 84%, 67%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: "hsl(239, 84%, 67%)" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
