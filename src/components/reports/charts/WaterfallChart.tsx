import { ReportModule } from "@/data/mockReports";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface WaterfallChartProps {
  module: ReportModule;
  config: Record<string, unknown>;
  compact?: boolean;
}

interface WaterfallDataPoint {
  name: string;
  value: number;
  type: "start" | "positive" | "negative" | "end";
}

// Calculate cumulative values for waterfall chart
function calculateWaterfallData(data: WaterfallDataPoint[]) {
  let cumulative = 0;
  
  return data.map((item, index) => {
    if (item.type === "start") {
      cumulative = item.value;
      return {
        ...item,
        y0: 0,
        y1: item.value,
        displayValue: item.value,
      };
    }
    
    if (item.type === "end") {
      return {
        ...item,
        y0: 0,
        y1: cumulative,
        displayValue: cumulative,
      };
    }
    
    const y0 = cumulative;
    cumulative += item.value;
    
    return {
      ...item,
      y0: Math.min(y0, cumulative),
      y1: Math.max(y0, cumulative),
      displayValue: item.value,
    };
  });
}

const formatValue = (value: number) => {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
};

export function WaterfallChart({ module, config, compact = false }: WaterfallChartProps) {
  const rawData = (module.previewData as WaterfallDataPoint[]) || [
    { name: "Starting ARR", value: 10200000, type: "start" as const },
    { name: "New Business", value: 2800000, type: "positive" as const },
    { name: "Expansion", value: 1200000, type: "positive" as const },
    { name: "Churn", value: -800000, type: "negative" as const },
    { name: "Contraction", value: -400000, type: "negative" as const },
    { name: "Ending ARR", value: 13000000, type: "end" as const },
  ];

  const data = calculateWaterfallData(rawData);
  const height = compact ? 160 : 220;

  const getBarColor = (type: string) => {
    switch (type) {
      case "start":
      case "end":
        return "hsl(239, 84%, 67%)";
      case "positive":
        return "hsl(160, 84%, 39%)";
      case "negative":
        return "hsl(0, 84%, 60%)";
      default:
        return "hsl(215, 16%, 47%)";
    }
  };

  // Custom bar shape for waterfall
  const WaterfallBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    const color = getBarColor(payload.type);
    
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          rx={4}
          ry={4}
        />
        {/* Connector line to next bar */}
        {payload.type !== "end" && (
          <line
            x1={x + width}
            y1={payload.type === "start" ? y : (payload.type === "positive" ? y : y + height)}
            x2={x + width + 20}
            y2={payload.type === "start" ? y : (payload.type === "positive" ? y : y + height)}
            stroke="hsl(215, 16%, 47%)"
            strokeWidth={1}
            strokeDasharray="4,2"
          />
        )}
      </g>
    );
  };

  return (
    <div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
              tickFormatter={(value) => formatValue(value)}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'hsl(222, 47%, 11%)', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '12px' 
              }}
              formatter={(value: number, name: string, props: any) => [
                formatValue(props.payload.displayValue),
                props.payload.name
              ]}
            />
            <ReferenceLine y={0} stroke="hsl(215, 16%, 47%)" strokeOpacity={0.3} />
            <Bar 
              dataKey="y1" 
              shape={<WaterfallBar />}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      {(config.showLegend as boolean) !== false && (
        <div className="flex items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(239,84%,67%)]" />
            <span className="text-muted-foreground">Start/End</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(160,84%,39%)]" />
            <span className="text-muted-foreground">Increase</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[hsl(0,84%,60%)]" />
            <span className="text-muted-foreground">Decrease</span>
          </div>
        </div>
      )}
    </div>
  );
}
