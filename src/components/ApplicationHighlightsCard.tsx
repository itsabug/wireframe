import { ApplicationData, ConversationData } from "@/types/asset";
import { Layers, Info, ArrowRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ApplicationHighlightsCardProps {
  applications: ApplicationData[];
  conversations: ConversationData[];
}

const formatBytes = (bytes: number) => {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const ApplicationHighlightsCard = ({ applications, conversations }: ApplicationHighlightsCardProps) => {
  const topApps = [...applications].sort((a, b) => b.bytes - a.bytes).slice(0, 5);
  const highRiskApps = applications.filter(a => a.risk === 'high');
  const unknownApps = applications.filter(a => a.category === 'Unknown');
  const totalSessions = applications.reduce((sum, app) => sum + app.sessions, 0);
  const activeConversations = conversations.length;

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Application & Conversation</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Application layer analysis from DPI and flow data</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 bg-secondary/50 rounded-lg text-center cursor-help">
              <p className="text-lg font-bold font-mono">{applications.length}</p>
              <p className="text-[10px] text-muted-foreground">Applications</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Unique applications detected</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 bg-secondary/50 rounded-lg text-center cursor-help">
              <p className="text-lg font-bold font-mono">{totalSessions}</p>
              <p className="text-[10px] text-muted-foreground">Sessions</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Total active sessions across all applications</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 bg-primary/10 rounded-lg text-center cursor-help">
              <p className="text-lg font-bold font-mono text-primary">{activeConversations}</p>
              <p className="text-[10px] text-muted-foreground">Conversations</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Active bidirectional conversations</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Risk Indicators */}
      {(highRiskApps.length > 0 || unknownApps.length > 0) && (
        <div className="flex gap-2 mb-4">
          {highRiskApps.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-destructive/10 rounded-lg cursor-help">
                  <AlertTriangle className="h-3 w-3 text-destructive" />
                  <span className="text-xs font-medium text-destructive">{highRiskApps.length} High Risk</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Applications flagged as high risk: {highRiskApps.map(a => a.name).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
          {unknownApps.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-threat-medium/10 rounded-lg cursor-help">
                  <AlertTriangle className="h-3 w-3 text-threat-medium" />
                  <span className="text-xs font-medium text-threat-medium">{unknownApps.length} Unknown</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Unidentified applications: {unknownApps.map(a => a.name).join(', ')}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      {/* Top Applications */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Top by Volume</p>
        {topApps.map((app) => (
          <Tooltip key={app.id}>
            <TooltipTrigger asChild>
              <div className={cn(
                "flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-help",
                app.risk === 'high' && "bg-destructive/5 border border-destructive/20"
              )}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-medium truncate">{app.name}</span>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] px-1 py-0",
                      app.risk === 'high' && "bg-destructive/10 text-destructive border-destructive/30",
                      app.risk === 'medium' && "bg-threat-medium/10 text-threat-medium border-threat-medium/30"
                    )}
                  >
                    {app.category}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                  {formatBytes(app.bytes)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="space-y-1">
                <p className="text-xs font-medium">{app.name}</p>
                <p className="text-xs text-muted-foreground">{app.sessions} sessions • {app.packets.toLocaleString()} packets</p>
                <p className="text-xs text-muted-foreground">Risk: {app.risk}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <button className="link-text flex items-center gap-1 mt-3 w-full justify-center text-xs">
        View all applications <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
