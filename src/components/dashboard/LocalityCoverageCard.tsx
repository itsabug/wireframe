import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TOTAL_MANAGED_ASSETS } from "@/data/dashboard-mock-data";

interface LocalityData {
  name: string;
  assetCount: number;
  coverage: number;
}

interface LocalityCoverageCardProps {
  localities: LocalityData[];
}

export const LocalityCoverageCard = ({
  localities,
}: LocalityCoverageCardProps) => {
  // Use consistent total from mock data
  const consistentTotal = TOTAL_MANAGED_ASSETS;
  const totalLocalityAssets = localities.reduce((sum, l) => sum + l.assetCount, 0);
  const coveragePct = Math.round((totalLocalityAssets / consistentTotal) * 100);
  const unmapped = consistentTotal - totalLocalityAssets;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Locality Coverage</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-xs">Assets mapped to network localities (Internal, DMZ, Cloud, etc.). Scope: All managed host assets.</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="text-[10px] cursor-help">
                {consistentTotal} assets
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Total managed host assets</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="space-y-2">
          {localities.slice(0, 5).map((locality, index) => (
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
