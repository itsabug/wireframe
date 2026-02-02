import { Asset, Peer, FlowData } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Shield, Server, Globe, ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopologyTabProps {
  asset: Asset;
  peers: Peer[];
  flows: FlowData[];
}

export const TopologyTab = ({ asset, peers, flows }: TopologyTabProps) => {
  // Simple layout logic for SVG
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  const topPeers = peers.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Network className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Network Topology</h2>
          <Badge variant="secondary" className="text-xs">
            {peers.length} Active Connections
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Target Asset</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <span>Internal Peer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>External/High Risk</span>
          </div>
        </div>
      </div>

      <Card className="bg-secondary/10 border-border/50 overflow-hidden">
        <CardContent className="p-0 relative h-[600px] flex items-center justify-center">
          <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-full">
            {/* Connection Lines */}
            {topPeers.map((peer, i) => {
              const angle = (i / topPeers.length) * 2 * Math.PI;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              const isHighRisk = peer.connectionCount > 50; // Mock risk

              return (
                <g key={`line-${peer.id}`}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isHighRisk ? "rgba(239, 68, 68, 0.4)" : "rgba(148, 163, 184, 0.3)"}
                    strokeWidth={Math.min(5, peer.connectionCount / 10)}
                    strokeDasharray={peer.type === 'external' ? "5,5" : "0"}
                  />
                  {/* Flow animation dots (mock) */}
                  <circle r="3" fill={isHighRisk ? "#ef4444" : "#3b82f6"}>
                    <animateMotion
                      dur={`${Math.max(1, 5 - peer.connectionCount / 20)}s`}
                      repeatCount="indefinite"
                      path={`M ${centerX} ${centerY} L ${x} ${y}`}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Peer Nodes */}
            {topPeers.map((peer, i) => {
              const angle = (i / topPeers.length) * 2 * Math.PI;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              const isHighRisk = peer.connectionCount > 50;

              return (
                <g key={`node-${peer.id}`} className="cursor-pointer group">
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill={peer.type === 'external' ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)"}
                    stroke={peer.type === 'external' ? "#ef4444" : "#3b82f6"}
                    strokeWidth="2"
                    className="transition-all group-hover:r-28"
                  />
                  <foreignObject x={x - 12} y={y - 12} width="24" height="24">
                    <div className="flex items-center justify-center h-full w-full">
                      {peer.type === 'external' ? (
                        <Globe className="h-4 w-4 text-destructive" />
                      ) : (
                        <Server className="h-4 w-4 text-chart-2" />
                      )}
                    </div>
                  </foreignObject>
                  <text
                    x={x}
                    y={y + 40}
                    textAnchor="middle"
                    className="text-[10px] fill-muted-foreground font-medium"
                  >
                    {peer.name}
                  </text>
                  <text
                    x={x}
                    y={y + 52}
                    textAnchor="middle"
                    className="text-[9px] fill-muted-foreground font-mono"
                  >
                    {peer.ip}
                  </text>
                </g>
              );
            })}

            {/* Center Node (Target Asset) */}
            <g className="cursor-pointer">
              <circle
                cx={centerX}
                cy={centerY}
                r="40"
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="3"
              />
              <foreignObject x={centerX - 20} y={centerY - 20} width="40" height="40">
                <div className="flex items-center justify-center h-full w-full">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </foreignObject>
              <text
                x={centerX}
                y={centerY + 60}
                textAnchor="middle"
                className="text-sm font-bold fill-foreground"
              >
                {asset.name}
              </text>
              <text
                x={centerX}
                y={centerY + 75}
                textAnchor="middle"
                className="text-xs fill-muted-foreground font-mono"
              >
                {asset.ip}
              </text>
            </g>
          </svg>

          {/* Overlay Info */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm border border-border p-3 rounded-lg pointer-events-auto max-w-xs">
              <h4 className="text-xs font-semibold mb-1 flex items-center gap-1">
                <ArrowRightLeft className="h-3 w-3" />
                Blast Radius Analysis
              </h4>
              <p className="text-[10px] text-muted-foreground">
                This asset has direct dependencies on {topPeers.filter(p => p.type === 'internal').length} internal core services. 
                Compromise could lead to lateral movement across {asset.blastRadiusScore} network segments.
              </p>
            </div>
            <div className="flex flex-col gap-2 pointer-events-auto">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                Zoom: 100%
              </Badge>
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                Layout: Radial
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
