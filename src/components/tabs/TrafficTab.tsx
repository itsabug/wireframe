import { useState } from "react";
import { FlowData } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Activity, Clock, ArrowDownUp, Download } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface TrafficTabProps {
  flows: FlowData[];
}

const parseTimestamp = (value: string) => {
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildTrafficSeries = (flows: FlowData[]) => {
  const buckets = new Map<number, number>();

  flows.forEach((flow) => {
    const timestamp = parseTimestamp(flow.timestamp);
    if (!timestamp) return;
    const hour = timestamp.getHours();
    buckets.set(hour, (buckets.get(hour) || 0) + flow.bytes);
  });

  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([hour, bytes]) => ({
      time: `${String(hour).padStart(2, "0")}:00`,
      value: Number((bytes / 1_000_000).toFixed(2)),
    }));
};

const buildTopTalkers = (flows: FlowData[], isEgress: boolean) => {
  const talkerMap = new Map<string, { ip: string; bytes: number; port: number; protocol: string; peakBytes: number }>();

  flows.forEach((flow) => {
    const ip = isEgress ? flow.destIp : flow.sourceIp;
    const port = flow.destPort;
    const protocol = flow.application || flow.protocol;
    const existing = talkerMap.get(ip);

    if (!existing) {
      talkerMap.set(ip, { ip, bytes: flow.bytes, port, protocol, peakBytes: flow.bytes });
      return;
    }

    existing.bytes += flow.bytes;
    if (flow.bytes >= existing.peakBytes) {
      existing.port = port;
      existing.protocol = protocol;
      existing.peakBytes = flow.bytes;
    }
  });

  return Array.from(talkerMap.values())
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5)
    .map(({ peakBytes, ...talker }) => talker);
};

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`;
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const TrafficTab = ({ flows }: TrafficTabProps) => {
  const [direction, setDirection] = useState<'egress' | 'ingress'>('egress');

  const isEgress = direction === 'egress';
  
  const relevantFlows = flows.filter(f => 
    isEgress ? f.direction === 'outbound' : f.direction === 'inbound'
  );
  const trafficData = buildTrafficSeries(relevantFlows);
  const topTalkers = buildTopTalkers(relevantFlows, isEgress);
  const uniquePeers = new Set(relevantFlows.map((flow) => (isEgress ? flow.destIp : flow.sourceIp))).size;
  const totalBytes = relevantFlows.reduce((sum, f) => sum + f.bytes, 0);
  const totalPackets = relevantFlows.reduce((sum, f) => sum + f.packets, 0);

  return (
    <div className="space-y-6">
      {/* Direction Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowDownUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Traffic Analysis</h2>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
          <Button
            variant={direction === 'egress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDirection('egress')}
            className={cn(
              "gap-2 h-8",
              direction === 'egress' ? "bg-traffic-out text-white hover:bg-traffic-out/90" : ""
            )}
          >
            <ArrowUp className="h-4 w-4" />
            Egress / Outbound
          </Button>
          <Button
            variant={direction === 'ingress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setDirection('ingress')}
            className={cn(
              "gap-2 h-8",
              direction === 'ingress' ? "bg-primary text-white hover:bg-primary/90" : ""
            )}
          >
            <ArrowDown className="h-4 w-4" />
            Ingress / Inbound
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Download className="h-4 w-4" />
          Download PCAP
        </Button>
      </div>

      {/* Traffic Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className={cn(
          "bg-gradient-to-br",
          isEgress 
            ? "from-traffic-out/10 to-traffic-out/5 border-traffic-out/20" 
            : "from-primary/10 to-primary/5 border-primary/20"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                isEgress ? "bg-traffic-out/20" : "bg-primary/20"
              )}>
                {isEgress ? (
                  <ArrowUp className="h-5 w-5 text-traffic-out" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isEgress ? 'Outbound' : 'Inbound'} Traffic</p>
                <p className="text-2xl font-bold font-mono">{formatBytes(totalBytes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Packets</p>
                <p className="text-2xl font-bold font-mono">{totalPackets.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Flows</p>
                <p className="text-2xl font-bold font-mono">{relevantFlows.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary rounded-lg">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isEgress ? 'Unique Destinations' : 'Unique Sources'}</p>
                <p className="text-2xl font-bold font-mono">{uniquePeers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            {isEgress ? (
              <ArrowUp className="h-4 w-4 text-traffic-out" />
            ) : (
              <ArrowDown className="h-4 w-4 text-primary" />
            )}
            {isEgress ? 'Outbound' : 'Inbound'} Traffic Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {trafficData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isEgress ? "hsl(var(--traffic-out))" : "hsl(var(--primary))"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isEgress ? "hsl(var(--traffic-out))" : "hsl(var(--primary))"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} MB`, isEgress ? 'Outbound' : 'Inbound']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isEgress ? "hsl(var(--traffic-out))" : "hsl(var(--primary))"} 
                    strokeWidth={2}
                    fill="url(#colorTraffic)" 
                    name={isEgress ? 'Outbound' : 'Inbound'} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No traffic data available for this direction.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Talkers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Top {isEgress ? 'Destinations' : 'Sources'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topTalkers.length > 0 ? (
            <div className="space-y-3">
              {topTalkers.map((talker, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-muted-foreground w-6">{index + 1}</span>
                    <span className="font-mono text-sm">{talker.ip}</span>
                    <Badge variant="outline" className="text-xs">
                      {talker.protocol}
                    </Badge>
                    <span className="text-xs text-muted-foreground">:{talker.port}</span>
                  </div>
                  <span className="font-mono text-sm font-medium">{formatBytes(talker.bytes)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No top talkers available for this direction.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
