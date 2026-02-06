import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetHeader } from "./ScopeChip";
import { WIDGET_DEFINITIONS, ASSET_METRICS, LocalityData } from "@/data/unified-dashboard-data";

interface LocalityCoverageCardProps {
  localities: LocalityData[];
  totalAssets?: number;
  onViewUnmapped?: () => void;
}

export const LocalityCoverageCard = ({
  localities,
  totalAssets = ASSET_METRICS.TOTAL_MANAGED_ASSETS,
  onViewUnmapped,
}: LocalityCoverageCardProps) => {
  const totalLocalityAssets = localities.reduce((sum, l) => sum + l.assetCount, 0);
  const coveragePct = Math.round((totalLocalityAssets / totalAssets) * 100);
  const unmapped = totalAssets - totalLocalityAssets;
  const def = WIDGET_DEFINITIONS.LOCALITY_COVERAGE;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={def.title}
          definition={def.definition}
          scope={def.scope}
          computation={def.computation}
          icon={<MapPin className="h-4 w-4 text-chart-2" />}
          action={
            <Badge variant="outline" className={cn(
              "text-[10px]",
              coveragePct >= 90 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"
            )}>
              {coveragePct >= 90 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
              {coveragePct}% mapped
            </Badge>
          }
        />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-chart-2/10 rounded-lg">
            <MapPin className="h-5 w-5 text-chart-2" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold font-mono">{localities.length}</p>
            <p className="text-xs text-muted-foreground">Defined localities</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {totalAssets} assets
          </Badge>
        </div>
        
        <div className="space-y-2">
          {localities.slice(0, 5).map((locality, index) => (
            <div key={locality.id || index} className="flex items-center justify-between text-xs">
              <span className="text-foreground">{locality.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{locality.assetCount}</span>
                <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      locality.coverage >= 80 ? "bg-emerald-500" : "bg-amber-500"
                    )} 
                    style={{ width: `${locality.coverage}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {unmapped > 0 && (
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <div className="text-xs text-amber-500 flex items-center gap-1.5">
              <AlertCircle className="h-3 w-3" />
              {unmapped} assets unmapped
            </div>
            {onViewUnmapped && (
              <button 
                onClick={onViewUnmapped}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View <ChevronRight className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
