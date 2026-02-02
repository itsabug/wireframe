import { Asset, FlowData, Peer } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownLeft, ArrowUpRight, Layers } from "lucide-react";

interface DependenciesTabProps {
  asset: Asset;
  flows: FlowData[];
  peers: Peer[];
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
};

const buildDependencyList = (flows: FlowData[], direction: "inbound" | "outbound") => {
  const map = new Map<string, { ip: string; bytes: number; protocols: Set<string> }>();
  flows
    .filter((flow) => flow.direction === direction)
    .forEach((flow) => {
      const ip = direction === "outbound" ? flow.destIp : flow.sourceIp;
      const entry = map.get(ip);
      if (entry) {
        entry.bytes += flow.bytes;
        entry.protocols.add(flow.application || flow.protocol);
      } else {
        map.set(ip, { ip, bytes: flow.bytes, protocols: new Set([flow.application || flow.protocol]) });
      }
    });

  return Array.from(map.values())
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      protocols: Array.from(item.protocols).slice(0, 2),
    }));
};

export const DependenciesTab = ({ asset, flows, peers }: DependenciesTabProps) => {
  const upstream = buildDependencyList(flows, "inbound");
  const downstream = buildDependencyList(flows, "outbound");

  const serviceTags = asset.tags?.length ? asset.tags.slice(0, 4) : ["Identity", "Core Services"];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Layers className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Service Dependencies</h2>
        <Badge variant="secondary" className="text-xs">
          {peers.length} observed peers
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-primary" />
              Upstream Dependencies (Inbound)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upstream.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inbound dependencies observed.</p>
            ) : (
              upstream.map((dep, index) => (
                <div key={dep.ip} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">#{index + 1}</span>
                    <span className="font-mono">{dep.ip}</span>
                    <div className="flex gap-1">
                      {dep.protocols.map((protocol) => (
                        <Badge key={protocol} variant="outline" className="text-[10px]">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono">{formatBytes(dep.bytes)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="col-span-6">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-traffic-out" />
              Downstream Dependents (Outbound)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {downstream.length === 0 ? (
              <p className="text-sm text-muted-foreground">No outbound dependencies observed.</p>
            ) : (
              downstream.map((dep, index) => (
                <div key={dep.ip} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-mono">#{index + 1}</span>
                    <span className="font-mono">{dep.ip}</span>
                    <div className="flex gap-1">
                      {dep.protocols.map((protocol) => (
                        <Badge key={protocol} variant="outline" className="text-[10px]">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono">{formatBytes(dep.bytes)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Critical Service Paths</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Authentication path reliant on asset availability</span>
              <Badge variant="outline" className="text-[10px]">
                High Impact
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Backup/replication job chain</span>
              <Badge variant="outline" className="text-[10px]">
                Medium Impact
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Internal admin access (RDP/SSH)</span>
              <Badge variant="outline" className="text-[10px]">
                Medium Impact
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-5">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Business Service Tags</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {serviceTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
