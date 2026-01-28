import { ReportModule } from "@/data/mockReports";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ForecastChartProps {
  module: ReportModule;
  config: Record<string, unknown>;
  compact?: boolean;
}

const forecastData = [
  // Historical
  { month: "Jul", actual: 1050000, low: null, mid: null, high: null },
  { month: "Aug", actual: 1120000, low: null, mid: null, high: null },
  { month: "Sep", actual: 1180000, low: null, mid: null, high: null },
  // Forecast
  { month: "Oct", actual: null, low: 1200000, mid: 1250000, high: 1300000 },
  { month: "Nov", actual: null, low: 1250000, mid: 1320000, high: 1390000 },
  { month: "Dec", actual: null, low: 1300000, mid: 1400000, high: 1500000 },
  { month: "Jan", actual: null, low: 1350000, mid: 1480000, high: 1610000 },
  { month: "Feb", actual: null, low: 1400000, mid: 1560000, high: 1720000 },
  { month: "Mar", actual: null, low: 1450000, mid: 1650000, high: 1850000 },
];

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
};

export function ForecastChart({ module, config, compact = false }: ForecastChartProps) {
  const height = compact ? 160 : 220;

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(239, 84%, 67%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'hsl(222, 47%, 11%)', 
              border: 'none', 
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number | null, name: string) => {
              if (value === null) return ["-", name];
              const labels: Record<string, string> = {
                actual: "Actual",
                high: "High Estimate",
                mid: "Base Forecast",
                low: "Low Estimate"
              };
              return [formatValue(value), labels[name] || name];
            }}
          />
          {(config.showLegend as boolean) !== false && (
            <Legend 
              verticalAlign="top" 
              height={36}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  actual: "Actual",
                  high: "High",
                  mid: "Forecast",
                  low: "Low"
                };
                return <span className="text-xs text-muted-foreground">{labels[value] || value}</span>;
              }}
            />
          )}
          
          {/* Confidence interval (low to high) */}
          <Area
            type="monotone"
            dataKey="high"
            stroke="transparent"
            fill="url(#colorConfidence)"
            connectNulls={false}
          />
          <Area
            type="monotone"
            dataKey="low"
            stroke="transparent"
            fill="white"
            connectNulls={false}
          />
          
          {/* Actual historical data */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="hsl(239, 84%, 67%)"
            strokeWidth={2}
            fill="url(#colorActual)"
            dot={{ r: 4, fill: "hsl(239, 84%, 67%)" }}
            connectNulls={false}
          />
          
          {/* Base forecast */}
          <Area
            type="monotone"
            dataKey="mid"
            stroke="hsl(160, 84%, 39%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#colorForecast)"
            dot={{ r: 3, fill: "hsl(160, 84%, 39%)" }}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
