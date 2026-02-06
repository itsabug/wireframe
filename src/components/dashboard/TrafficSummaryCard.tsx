import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

interface TrafficDataPoint {
  time: string;
  inbound: number;
  outbound: number;
}

interface TrafficSummaryCardProps {
  inboundGB: number;
  outboundMB: number;
  chartData: TrafficDataPoint[];
}

export const TrafficSummaryCard = ({ inboundGB, outboundMB, chartData }: TrafficSummaryCardProps) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div>
              <p className="text-xs text-muted-foreground">IN</p>
              <p className="text-xl font-bold font-mono">
                {inboundGB.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-0.5">GB</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <div>
              <p className="text-xs text-muted-foreground">OUT</p>
              <p className="text-xl font-bold font-mono">
                {outboundMB}<span className="text-sm font-normal text-muted-foreground ml-0.5">MB</span>
              </p>
            </div>
          </div>
        </div>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="inboundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outboundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="inbound"
                stroke="hsl(var(--primary))"
                strokeWidth={1.5}
                fill="url(#inboundGradient)"
              />
              <Area
                type="monotone"
                dataKey="outbound"
                stroke="hsl(var(--chart-2))"
                strokeWidth={1.5}
                fill="url(#outboundGradient)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
