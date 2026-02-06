import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssetGroupHealthCardProps {
  totalGroups: number;
  internalCount: number;
  externalCount: number;
  trend: number;
}

export const AssetGroupHealthCard = ({
  totalGroups,
  internalCount,
  externalCount,
  trend,
}: AssetGroupHealthCardProps) => {
  const internalPct = Math.round((internalCount / totalGroups) * 100);
  const externalPct = 100 - internalPct;
  const isPositive = trend >= 0;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Asset Group Health</CardTitle>
          <Badge variant="outline" className={cn(
            "text-[10px] gap-1",
            isPositive ? "text-emerald-500 border-emerald-500/30" : "text-destructive border-destructive/30"
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{trend}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold font-mono">{totalGroups}</p>
            <p className="text-xs text-muted-foreground">Total Groups</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Internal</span>
            <span className="font-mono text-primary">{internalCount} ({internalPct}%)</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden flex">
            <div className="bg-primary h-full" style={{ width: `${internalPct}%` }} />
            <div className="bg-chart-2 h-full" style={{ width: `${externalPct}%` }} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">External</span>
            <span className="font-mono text-chart-2">{externalCount} ({externalPct}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
