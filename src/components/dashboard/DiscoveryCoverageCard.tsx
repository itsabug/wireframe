import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Target, CheckCircle2 } from "lucide-react";
import { WidgetHeader } from "./ScopeChip";
import { WIDGET_DEFINITIONS, ASSET_METRICS, DEFAULT_TIME_WINDOW } from "@/data/unified-dashboard-data";

interface DiscoveryCoverageCardProps {
  coverage?: number;
  mappedAssets?: number;
  totalAssets?: number;
  timeWindow?: string;
}

export const DiscoveryCoverageCard = ({ 
  coverage,
  mappedAssets,
  totalAssets = ASSET_METRICS.TOTAL_MANAGED_ASSETS,
  timeWindow = DEFAULT_TIME_WINDOW
}: DiscoveryCoverageCardProps) => {
  // Calculate coverage if not provided
  const actualMapped = mappedAssets ?? Math.round(totalAssets * 0.93);
  const actualCoverage = coverage ?? Math.round((actualMapped / totalAssets) * 100);
  const unmapped = totalAssets - actualMapped;
  
  const def = WIDGET_DEFINITIONS.DISCOVERY_COVERAGE;
  
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={def.title}
          definition={def.definition}
          scope={def.scope}
          timeWindow={timeWindow}
          computation={def.computation}
          icon={<Activity className="h-4 w-4 text-primary" />}
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold font-mono">{actualCoverage}%</p>
              {actualCoverage >= 90 && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {actualMapped} of {totalAssets} assets mapped
            </p>
          </div>
        </div>
        
        {unmapped > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Unmapped assets</span>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                {unmapped} need attention
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
