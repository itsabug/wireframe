import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, ChevronRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MitreTacticEntry } from "@/data/dashboard-mock-data";

interface MitreAttackSummaryCardProps {
  tactics: MitreTacticEntry[];
  onViewDetails?: () => void;
}

export const MitreAttackSummaryCard = ({ tactics, onViewDetails }: MitreAttackSummaryCardProps) => {
  const totalEvents = tactics.reduce((sum, t) => sum + t.eventCount, 0);
  const activeTactics = tactics.filter(t => t.eventCount > 0).length;

  const getSeverityColor = (count: number) => {
    if (count > 50) return "bg-destructive text-destructive-foreground";
    if (count > 20) return "bg-threat-high text-white";
    if (count > 10) return "bg-amber-500 text-white";
    return "bg-blue-500 text-white";
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-medium text-muted-foreground">MITRE ATT&CK</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">Detection events mapped to MITRE ATT&CK tactics and techniques observed in the last 7 days across all assets.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Details <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-2xl font-bold font-mono">{totalEvents}</p>
            <p className="text-[10px] text-muted-foreground">Events (7d)</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-muted-foreground">{activeTactics}</p>
            <p className="text-[10px] text-muted-foreground">Active Tactics</p>
          </div>
          <div className="flex-1">
            <Progress value={(activeTactics / 14) * 100} className="h-2" />
            <p className="text-[9px] text-muted-foreground mt-0.5">of 14 tactics</p>
          </div>
        </div>
        <ScrollArea className="h-[140px]">
          <div className="space-y-2">
            {tactics.map((tactic) => (
              <Tooltip key={tactic.tacticId}>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between py-1 cursor-pointer hover:bg-secondary/30 rounded px-1 -mx-1 transition-colors">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Badge className={cn("text-[10px] px-1.5 py-0 h-5 font-mono min-w-[32px] justify-center", getSeverityColor(tactic.eventCount))}>
                        {tactic.eventCount}
                      </Badge>
                      <span className="text-xs truncate">{tactic.tacticName}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono ml-2">{tactic.tacticId}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold">{tactic.tacticName} ({tactic.tacticId})</p>
                    <p className="text-xs text-muted-foreground">{tactic.techniqueCount} techniques observed</p>
                    <div className="space-y-1">
                      <p className="text-[10px] font-medium">Top Techniques:</p>
                      {tactic.topTechniques.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{t.id}</span>
                          <span>{t.name}</span>
                          <span className="font-mono text-primary">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
