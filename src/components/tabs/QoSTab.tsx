import { QoSData } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Clock, Zap, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface QoSTabProps {
  qosData: QoSData[];
}

const getMosQuality = (mos: number): { label: string; color: string } => {
  if (mos >= 4.3) return { label: 'Excellent', color: 'text-threat-low' };
  if (mos >= 4.0) return { label: 'Good', color: 'text-primary' };
  if (mos >= 3.6) return { label: 'Fair', color: 'text-threat-medium' };
  return { label: 'Poor', color: 'text-destructive' };
};

export const QoSTab = ({ qosData }: QoSTabProps) => {
  const avgLatency = qosData.reduce((sum, d) => sum + d.latency, 0) / qosData.length;
  const avgJitter = qosData.reduce((sum, d) => sum + d.jitter, 0) / qosData.length;
  const avgPacketLoss = qosData.reduce((sum, d) => sum + d.packetLoss, 0) / qosData.length;
  const avgMos = qosData.reduce((sum, d) => sum + d.mos, 0) / qosData.length;

  const chartData = qosData.map(d => ({
    name: d.application,
    latency: d.latency,
    jitter: d.jitter,
    packetLoss: d.packetLoss * 100,
  }));

  return (
    <div className="space-y-6">
      {/* QoS Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Latency</p>
                <p className="text-2xl font-bold font-mono">{avgLatency.toFixed(1)} ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-traffic-out/10 rounded-lg">
                <Zap className="h-5 w-5 text-traffic-out" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Jitter</p>
                <p className="text-2xl font-bold font-mono">{avgJitter.toFixed(1)} ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", avgPacketLoss > 0.1 ? "bg-destructive/10" : "bg-secondary")}>
                <AlertTriangle className={cn("h-5 w-5", avgPacketLoss > 0.1 ? "text-destructive" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Packet Loss</p>
                <p className="text-2xl font-bold font-mono">{(avgPacketLoss * 100).toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-threat-low/10 rounded-lg">
                <Activity className="h-5 w-5 text-threat-low" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg MOS Score</p>
                <p className="text-2xl font-bold font-mono">{avgMos.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QoS Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">QoS Metrics by Application</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="latency" fill="hsl(var(--primary))" name="Latency (ms)" />
                <Bar dataKey="jitter" fill="hsl(var(--traffic-out))" name="Jitter (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* QoS Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Application QoS Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold">Application</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Latency (ms)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Jitter (ms)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Packet Loss (%)</TableHead>
                  <TableHead className="text-xs font-semibold text-right">MOS Score</TableHead>
                  <TableHead className="text-xs font-semibold">Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qosData.map((item) => {
                  const quality = getMosQuality(item.mos);
                  return (
                    <TableRow key={item.id} className="hover:bg-secondary/50">
                      <TableCell className="font-medium text-sm">{item.application}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{item.latency}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{item.jitter}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{(item.packetLoss * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-right font-mono text-xs">{item.mos.toFixed(1)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-xs', quality.color)}>
                          {quality.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
