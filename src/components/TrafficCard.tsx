import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TrafficCardProps {
  inbound: number;
  outbound: number;
}

export const TrafficCard = ({ inbound, outbound }: TrafficCardProps) => {
  const total = inbound + outbound;
  const inPercent = (inbound / total) * 100;

  const inboundTrend = 23;
  const outboundTrend = -8;
  const overallTrend = 18;

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title mb-0">Traffic</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Network traffic volume over the last 24 hours compared to previous 24 hours baseline</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-12">
            <div className="w-2 h-2 rounded-full bg-traffic-in" />
            <span className="text-xs text-muted-foreground">IN</span>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="stat-value">{inbound.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">MB</span>
              <div className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="h-3 w-3" />
                <span>{inboundTrend}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 w-12">
            <div className="w-2 h-2 rounded-full bg-traffic-out" />
            <span className="text-xs text-muted-foreground">OUT</span>
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="stat-value">{outbound.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">MB</span>
              <div className="flex items-center gap-1 text-xs text-threat-medium">
                <TrendingDown className="h-3 w-3" />
                <span>{Math.abs(outboundTrend)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
          <div
            className="h-full bg-traffic-in transition-all duration-500"
            style={{ width: `${inPercent}%` }}
          />
          <div
            className="h-full bg-traffic-out transition-all duration-500"
            style={{ width: `${100 - inPercent}%` }}
          />
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Network Behavior</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-xs font-medium text-success cursor-help">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{overallTrend}% increase</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-xs">Overall traffic increased by {overallTrend}% compared to previous 24-hour period (baseline: {(total / (1 + overallTrend/100)).toFixed(0)} MB)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
