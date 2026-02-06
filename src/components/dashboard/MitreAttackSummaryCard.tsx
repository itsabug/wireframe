import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface MitreTactic {
  id: string;
  name: string;
  count: number;
}

interface MitreAttackSummaryCardProps {
  activeEvents: number;
  totalEvents: number;
  tactics: MitreTactic[];
}

export const MitreAttackSummaryCard = ({ activeEvents, totalEvents, tactics }: MitreAttackSummaryCardProps) => {
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6 mb-4">
          <div>
            <p className="text-2xl font-bold font-mono">{activeEvents}</p>
            <p className="text-[10px] text-muted-foreground">Active Events</p>
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-muted-foreground">{totalEvents}</p>
            <p className="text-[10px] text-muted-foreground">Total Events</p>
          </div>
          <div className="flex-1">
            <Progress value={(activeEvents / totalEvents) * 100} className="h-2" />
          </div>
        </div>
        <ScrollArea className="h-[160px]">
          <div className="space-y-2">
            {tactics.map((tactic, index) => (
              <div key={index} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge className={cn("text-[10px] px-1.5 py-0 h-5 font-mono", getSeverityColor(tactic.count))}>
                    {tactic.count}
                  </Badge>
                  <span className="text-xs truncate">{tactic.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono ml-2">{tactic.id}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
