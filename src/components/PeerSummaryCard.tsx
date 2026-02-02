import { Peer } from "@/types/asset";
import { Globe, Server, Users, Info, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface PeerSummaryCardProps {
  peers: Peer[];
}

export const PeerSummaryCard = ({ peers }: PeerSummaryCardProps) => {
  const internalPeers = peers.filter(p => p.type === 'internal');
  const externalPeers = peers.filter(p => p.type === 'external');
  const newPeers = peers.filter(p => p.isNew);
  const topPeers = [...peers].sort((a, b) => b.connectionCount - a.connectionCount).slice(0, 5);

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Peer Context</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Network peers this asset has communicated with in the last 24 hours</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 bg-primary/10 rounded-lg text-center cursor-help">
              <Server className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold font-mono">{internalPeers.length}</p>
              <p className="text-[10px] text-muted-foreground">Internal</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Peers within your network perimeter</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 bg-threat-medium/10 rounded-lg text-center cursor-help">
              <Globe className="h-4 w-4 text-threat-medium mx-auto mb-1" />
              <p className="text-lg font-bold font-mono text-threat-medium">{externalPeers.length}</p>
              <p className="text-[10px] text-muted-foreground">External</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">External IP addresses (internet hosts)</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "p-2 rounded-lg text-center cursor-help",
              newPeers.length > 0 ? "bg-destructive/10" : "bg-secondary/50"
            )}>
              <Sparkles className={cn(
                "h-4 w-4 mx-auto mb-1",
                newPeers.length > 0 ? "text-destructive" : "text-muted-foreground"
              )} />
              <p className={cn(
                "text-lg font-bold font-mono",
                newPeers.length > 0 ? "text-destructive" : "text-foreground"
              )}>{newPeers.length}</p>
              <p className="text-[10px] text-muted-foreground">New Today</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">First-time peers not seen in last 30 days</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Top Peers List */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top Talkers</p>
        {topPeers.map((peer) => (
          <Tooltip key={peer.id}>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-help",
                peer.isNew && "bg-destructive/5 border border-destructive/20"
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    peer.type === 'internal' ? 'bg-primary' : 'bg-threat-medium'
                  )} />
                  <span className="text-xs font-mono truncate">{peer.ip}</span>
                  {peer.isNew && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-destructive/10 text-destructive border-destructive/30">
                      NEW
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {peer.connectionCount.toLocaleString()} flows
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="space-y-1">
                <p className="text-xs font-medium">{peer.name}</p>
                <p className="text-xs text-muted-foreground">{peer.category} • {peer.location}</p>
                <p className="text-xs text-muted-foreground">{peer.connectionCount.toLocaleString()} connections</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <button className="link-text flex items-center gap-1 mt-3 w-full justify-center text-xs">
        View full peer map <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
