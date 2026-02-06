import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserCheck, AlertCircle, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetHeader } from "./ScopeChip";
import { WIDGET_DEFINITIONS, ASSET_METRICS } from "@/data/unified-dashboard-data";

interface OwnershipCoverageCardProps {
  totalAssets?: number;
  assignedCount?: number;
  overdueReviews?: number;
  onViewUnassigned?: () => void;
}

export const OwnershipCoverageCard = ({
  totalAssets = ASSET_METRICS.TOTAL_MANAGED_ASSETS,
  assignedCount = ASSET_METRICS.ASSIGNED_OWNER,
  overdueReviews = ASSET_METRICS.OVERDUE_REVIEW,
  onViewUnassigned,
}: OwnershipCoverageCardProps) => {
  const coverage = Math.round((assignedCount / totalAssets) * 100);
  const unassigned = totalAssets - assignedCount;
  const def = WIDGET_DEFINITIONS.OWNERSHIP_COVERAGE;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={def.title}
          definition={def.definition}
          scope={def.scope}
          computation={def.computation}
          icon={<Users className="h-4 w-4 text-emerald-500" />}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/10 rounded-lg">
            <UserCheck className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold font-mono">{coverage}%</p>
            <p className="text-xs text-muted-foreground">{assignedCount} of {totalAssets} assigned</p>
          </div>
        </div>
        
        <Progress value={coverage} className="h-2" />
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Unassigned</span>
            </div>
            <span className="font-mono text-amber-600">{unassigned}</span>
          </div>
          
          {overdueReviews > 0 && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>Overdue reviews</span>
              </div>
              <span className="font-mono text-destructive">{overdueReviews}</span>
            </div>
          )}
        </div>
        
        {unassigned > 0 && onViewUnassigned && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            onClick={onViewUnassigned}
          >
            View unassigned <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
