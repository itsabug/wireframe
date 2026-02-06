import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import { WidgetHeader } from "./ScopeChip";
import { GroupRogue } from "@/data/unified-dashboard-data";

interface TopGroupsByRoguesCardProps {
  groups: GroupRogue[];
  timeWindow: string;
  onViewAll?: () => void;
}

export const TopGroupsByRoguesCard = ({ groups, timeWindow, onViewAll }: TopGroupsByRoguesCardProps) => {
  const maxRogues = Math.max(...groups.map(g => g.rogueCount), 1);

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title="Top Groups by Rogues"
          definition="Asset groups with the highest concentration of rogue (unmanaged) devices."
          scope="All groups"
          timeWindow={timeWindow}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
          action={
            onViewAll && (
              <button 
                onClick={onViewAll}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View all <ChevronRight className="h-3 w-3" />
              </button>
            )
          }
        />
      </CardHeader>
      <CardContent className="space-y-2">
        {groups.slice(0, 5).map((group, index) => (
          <div key={group.groupId || index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground truncate max-w-[60%]">{group.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-destructive">{group.rogueCount}</span>
                {group.trend > 0 && (
                  <Badge variant="outline" className="text-[9px] text-destructive border-destructive/30 px-1">
                    <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
                    +{group.trend}
                  </Badge>
                )}
              </div>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-destructive/60 rounded-full transition-all"
                style={{ width: `${(group.rogueCount / maxRogues) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No rogue assets detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};
