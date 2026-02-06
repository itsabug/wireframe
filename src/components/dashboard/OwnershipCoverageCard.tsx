import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserCheck, AlertCircle } from "lucide-react";

interface OwnershipCoverageCardProps {
  totalAssets: number;
  assignedCount: number;
  overdueReviews: number;
}

export const OwnershipCoverageCard = ({
  totalAssets,
  assignedCount,
  overdueReviews,
}: OwnershipCoverageCardProps) => {
  const coverage = Math.round((assignedCount / totalAssets) * 100);
  const unassigned = totalAssets - assignedCount;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Ownership Coverage</CardTitle>
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
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Unassigned: {unassigned}</span>
          </div>
          {overdueReviews > 0 && (
            <div className="flex items-center gap-1.5 text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>{overdueReviews} overdue reviews</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
