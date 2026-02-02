import { NetworkBehavior } from "@/types/asset";
import { TrendingUp, TrendingDown, Activity, Users, Zap, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NetworkBehaviorCardProps {
  behavior: NetworkBehavior;
}

const calculateChange = (today: number, yesterday: number) => {
  if (yesterday === 0) return 100;
  return Math.round(((today - yesterday) / yesterday) * 100);
};

const MetricItem = ({ 
  label, 
  value, 
  unit, 
  change, 
  tooltip,
  icon: Icon 
}: { 
  label: string; 
  value: number; 
  unit: string; 
  change: number;
  tooltip: string;
  icon: React.ElementType;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="p-3 bg-secondary/30 rounded-lg cursor-help hover:bg-secondary/50 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            change >= 0 ? (change > 20 ? "text-threat-medium" : "text-success") : "text-success"
          )}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-mono">{value.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="max-w-xs">
      <p className="text-xs">{tooltip}</p>
    </TooltipContent>
  </Tooltip>
);

export const NetworkBehaviorCard = ({ behavior }: NetworkBehaviorCardProps) => {
  const bandwidthChange = calculateChange(behavior.bandwidthToday, behavior.bandwidthYesterday);
  const flowChange = calculateChange(behavior.flowCountToday, behavior.flowCountYesterday);
  const peerChange = calculateChange(behavior.uniquePeersToday, behavior.uniquePeersYesterday);

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Network Behavior</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Today's network metrics compared to previous 24-hour period</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricItem 
          label="Bandwidth" 
          value={behavior.bandwidthToday} 
          unit="MB" 
          change={bandwidthChange}
          tooltip={`Yesterday: ${behavior.bandwidthYesterday.toLocaleString()} MB. ${bandwidthChange > 20 ? 'Significant increase detected.' : 'Within normal range.'}`}
          icon={Activity}
        />
        <MetricItem 
          label="Flow Count" 
          value={behavior.flowCountToday} 
          unit="flows" 
          change={flowChange}
          tooltip={`Yesterday: ${behavior.flowCountYesterday.toLocaleString()} flows. Higher flow count may indicate scanning or C2.`}
          icon={Zap}
        />
        <MetricItem 
          label="Unique Peers" 
          value={behavior.uniquePeersToday} 
          unit="peers" 
          change={peerChange}
          tooltip={`Yesterday: ${behavior.uniquePeersYesterday} peers. New peers may indicate lateral movement.`}
          icon={Users}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-3 bg-threat-medium/10 border border-threat-medium/30 rounded-lg cursor-help">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3.5 w-3.5 text-threat-medium" />
                <span className="text-xs text-threat-medium font-medium">New Peers Today</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold font-mono text-threat-medium">{behavior.newPeersToday}</span>
                <span className="text-xs text-threat-medium/70">new connections</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs">First-time connections to peers not seen in the last 30 days. May indicate reconnaissance or C2.</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
