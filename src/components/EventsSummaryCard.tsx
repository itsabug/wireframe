import { ThreatEvent } from "@/types/asset";
import { ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EventsSummaryCardProps {
  events: ThreatEvent[];
}

export const EventsSummaryCard = ({ events }: EventsSummaryCardProps) => {
  const highCount = events.filter(e => e.severity === 'critical' || e.severity === 'high').length;
  const mediumCount = events.filter(e => e.severity === 'medium').length;
  const lowCount = events.filter(e => e.severity === 'low' || e.severity === 'info').length;
  const total = events.length;

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">Security Events</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Security events detected on this asset over the last 24 hours</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono text-foreground">{total}</span>
          <span className="text-muted-foreground">Total Events</span>
        </div>

        <div className="h-2 rounded-full overflow-hidden flex bg-secondary">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full bg-threat-high transition-all duration-500 cursor-help"
                style={{ width: `${(highCount / total) * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{highCount} High/Critical severity events</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full bg-threat-medium transition-all duration-500 cursor-help"
                style={{ width: `${(mediumCount / total) * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{mediumCount} Medium severity events</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="h-full bg-threat-low transition-all duration-500 cursor-help"
                style={{ width: `${(lowCount / total) * 100}%` }}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{lowCount} Low/Info severity events</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-threat-high/10">
            <span className="text-2xl font-bold font-mono text-threat-high block">{highCount}</span>
            <p className="text-xs text-muted-foreground mt-1">High</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-threat-medium/10">
            <span className="text-2xl font-bold font-mono text-threat-medium block">{mediumCount}</span>
            <p className="text-xs text-muted-foreground mt-1">Medium</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-threat-low/10">
            <span className="text-2xl font-bold font-mono text-threat-low block">{lowCount}</span>
            <p className="text-xs text-muted-foreground mt-1">Low</p>
          </div>
        </div>

        <button className="link-text flex items-center gap-1 w-full justify-center">
          View all events <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
