import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ZoneData {
  name: string;
  assetCount: number;
  hasGaps: boolean;
}

interface ZoneCoverageCardProps {
  zones: ZoneData[];
  coverageGaps: string[];
}

export const ZoneCoverageCard = ({ zones, coverageGaps }: ZoneCoverageCardProps) => {
  const totalZones = zones.length;
  const zonesWithGaps = zones.filter(z => z.hasGaps).length;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Zone Coverage</CardTitle>
          {zonesWithGaps > 0 && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {zonesWithGaps} gaps
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold font-mono">{totalZones}</p>
            <p className="text-xs text-muted-foreground">Security zones</p>
          </div>
        </div>
        <ScrollArea className="h-[100px]">
          <div className="space-y-1.5">
            {zones.map((zone, index) => (
              <div key={index} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${zone.hasGaps ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  <span className="text-foreground truncate max-w-[120px]">{zone.name}</span>
                </div>
                <span className="font-mono text-muted-foreground">{zone.assetCount}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        {coverageGaps.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground mb-1">Unknown subnets:</p>
            <div className="flex flex-wrap gap-1">
              {coverageGaps.slice(0, 3).map((gap, index) => (
                <Badge key={index} variant="secondary" className="text-[10px] font-mono bg-amber-500/10 text-amber-600">
                  {gap}
                </Badge>
              ))}
              {coverageGaps.length > 3 && (
                <Badge variant="secondary" className="text-[10px] bg-muted">
                  +{coverageGaps.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
