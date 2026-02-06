import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotZone {
  name: string;
  detections: number;
  newAssets: number;
  trend: "up" | "down" | "stable";
  severity: "critical" | "high" | "medium";
}

interface HotZonesCardProps {
  zones: HotZone[];
}

export const HotZonesCard = ({ zones }: HotZonesCardProps) => {
  const getSeverityColor = (severity: HotZone["severity"]) => {
    switch (severity) {
      case "critical": return "bg-destructive/20 text-destructive border-destructive/30";
      case "high": return "bg-threat-high/20 text-threat-high border-threat-high/30";
      case "medium": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Hot Zones</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
            {zones.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {zones.slice(0, 4).map((zone, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-md bg-secondary/30 border border-border/30"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className={cn(
                "h-4 w-4 flex-shrink-0",
                zone.severity === "critical" ? "text-destructive" :
                zone.severity === "high" ? "text-threat-high" : "text-amber-500"
              )} />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{zone.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {zone.detections} detections • {zone.newAssets} new assets
                </p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-[10px]", getSeverityColor(zone.severity))}>
              {zone.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
              {zone.severity}
            </Badge>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No hot zones detected
          </div>
        )}
      </CardContent>
    </Card>
  );
};
