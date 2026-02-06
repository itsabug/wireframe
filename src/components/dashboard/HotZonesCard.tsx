import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetHeader } from "./ScopeChip";
import { WIDGET_DEFINITIONS, DEFAULT_TIME_WINDOW, HotZone } from "@/data/unified-dashboard-data";

interface HotZonesCardProps {
  zones: HotZone[];
  onViewAll?: () => void;
}

export const HotZonesCard = ({ zones, onViewAll }: HotZonesCardProps) => {
  const def = WIDGET_DEFINITIONS.HOT_ZONES;
  
  const getSeverityColor = (severity: HotZone['severity']) => {
    switch (severity) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
    }
  };

  const getTrendIcon = (trend: HotZone['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-destructive" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-emerald-500" />;
      case 'stable': return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={def.title}
          definition={def.definition}
          scope={def.scope}
          timeWindow={DEFAULT_TIME_WINDOW}
          computation={def.computation}
          icon={<Flame className="h-4 w-4 text-destructive" />}
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
      <CardContent>
        <div className="space-y-2">
          {zones.slice(0, 5).map((zone, index) => (
            <div key={zone.zoneId || index} className="flex items-center justify-between p-2 rounded-md bg-secondary/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-3.5 w-3.5",
                  zone.severity === 'high' ? 'text-destructive' :
                  zone.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                )} />
                <span className="text-xs text-foreground">{zone.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[10px]", getSeverityColor(zone.severity))}>
                  {zone.detections} detections
                </Badge>
                {zone.newAssets > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{zone.newAssets} new
                  </Badge>
                )}
                {getTrendIcon(zone.trend)}
              </div>
            </div>
          ))}
          {zones.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No active hot zones
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
