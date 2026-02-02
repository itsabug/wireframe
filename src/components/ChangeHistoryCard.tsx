import { ChangeHistoryItem } from "@/types/asset";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, History, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ChangeHistoryCardProps {
  changes: ChangeHistoryItem[];
}

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'ip':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'mac':
      return 'bg-traffic-in/10 text-traffic-in border-traffic-in/30';
    case 'peer':
      return 'bg-threat-medium/10 text-threat-medium border-threat-medium/30';
    case 'port':
      return 'bg-threat-info/10 text-threat-info border-threat-info/30';
    case 'vlan':
      return 'bg-success/10 text-success border-success/30';
    case 'traffic':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-muted-foreground/30';
  }
};

export const ChangeHistoryCard = ({ changes }: ChangeHistoryCardProps) => {
  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Network Changes</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Changes detected via network packets: IP/MAC (DHCP/ARP), peers, ports, VLANs</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="space-y-2">
        {changes.slice(0, 3).map((change) => (
          <Tooltip key={change.id}>
            <TooltipTrigger asChild>
              <div className="p-2.5 bg-secondary/50 rounded-lg cursor-help hover:bg-secondary/70 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className={cn('text-[10px] capitalize', getChangeTypeColor(change.changeType))}>
                    {change.changeType}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{change.timestamp.split(' ')[0]}</span>
                </div>
                <p className="text-xs font-medium">{change.description}</p>
                {change.oldValue && change.newValue && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                    <span className="truncate max-w-[70px]">{change.oldValue}</span>
                    <ArrowRight className="h-2.5 w-2.5 flex-shrink-0" />
                    <span className="truncate max-w-[70px]">{change.newValue}</span>
                  </div>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="space-y-1">
                <p className="text-xs font-medium">{change.description}</p>
                {change.oldValue && <p className="text-xs text-muted-foreground">From: {change.oldValue}</p>}
                {change.newValue && <p className="text-xs text-muted-foreground">To: {change.newValue}</p>}
                <p className="text-xs text-muted-foreground">{change.timestamp}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};
