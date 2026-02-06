import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocalityData {
  name: string;
  assetCount: number;
  coverage: number;
}

interface LocalityCoverageCardProps {
  localities: LocalityData[];
  totalMapped: number;
  totalAssets: number;
}

export const LocalityCoverageCard = ({
  localities,
  totalMapped,
  totalAssets,
}: LocalityCoverageCardProps) => {
  const coveragePct = Math.round((totalMapped / totalAssets) * 100);
  const unmapped = totalAssets - totalMapped;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Locality Coverage</CardTitle>
          <Badge variant="outline" className={cn(
            "text-[10px]",
            coveragePct >= 90 ? "text-emerald-500 border-emerald-500/30" : "text-amber-500 border-amber-500/30"
          )}>
            {coveragePct >= 90 ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
            {coveragePct}% mapped
          </Badge>
        </div>
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
        </div>
        <div className="space-y-2">
          {localities.slice(0, 4).map((locality, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
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
          <div className="pt-2 border-t border-border/50 text-xs text-amber-500 flex items-center gap-1.5">
            <AlertCircle className="h-3 w-3" />
            {unmapped} assets unmapped
          </div>
        )}
      </CardContent>
    </Card>
  );
};
