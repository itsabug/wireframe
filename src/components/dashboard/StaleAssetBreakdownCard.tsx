import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StaleBreakdown {
  locality: string;
  count: number;
}

interface TrendDataPoint {
  date: string;
  count: number;
}

interface StaleAssetBreakdownCardProps {
  breakdown: StaleBreakdown[];
  trendData: TrendDataPoint[];
  totalStale: number;
  trend: number;
}

export const StaleAssetBreakdownCard = ({
  breakdown,
  trendData,
  totalStale,
  trend,
}: StaleAssetBreakdownCardProps) => {
  const isPositive = trend <= 0; // For stale, decreasing is positive

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Stale Assets Breakdown</CardTitle>
          </div>
          <Badge variant="outline" className={cn(
            "text-[10px] gap-1",
            isPositive ? "text-emerald-500 border-emerald-500/30" : "text-destructive border-destructive/30"
          )}>
            {isPositive ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
            {trend > 0 ? "+" : ""}{trend}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <p className="text-3xl font-bold font-mono text-amber-500">{totalStale}</p>
          <div className="flex-1 h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="staleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={1.5}
                  fill="url(#staleGradient)"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  formatter={(value: number) => [value, 'Stale']}
                  labelFormatter={(label) => label}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {breakdown.slice(0, 4).map((item, index) => (
            <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-secondary/30">
              <span className="text-muted-foreground capitalize">{item.locality}</span>
              <span className="font-mono text-amber-600">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
