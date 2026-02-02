import { Asset } from "@/types/asset";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getDaysSince } from "@/lib/asset-lifecycle";
import { Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StaleAssetsWidgetProps {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

export const StaleAssetsWidget = ({ assets, onSelectAsset }: StaleAssetsWidgetProps) => {
  const { staleAfterDays } = useLifecycleSettings();

  const staleAssets = assets.filter((asset) => {
    const days = getDaysSince(asset.lastSeen);
    return days !== null && days > staleAfterDays;
  }).sort((a, b) => {
    const daysA = getDaysSince(a.lastSeen) ?? 0;
    const daysB = getDaysSince(b.lastSeen) ?? 0;
    return daysB - daysA;
  });

  if (staleAssets.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/20 rounded-md">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Stale Assets</h3>
            <p className="text-[10px] text-muted-foreground">No activity &gt;{staleAfterDays} days</p>
          </div>
        </div>
        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-xs">
          {staleAssets.length} stale
        </Badge>
      </div>
      
      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-1">
          {staleAssets.slice(0, 8).map((asset) => {
            const daysStale = getDaysSince(asset.lastSeen) ?? 0;
            return (
              <Tooltip key={asset.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-amber-500/10 transition-colors group"
                    onClick={() => onSelectAsset(asset.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysStale}d ago
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{asset.ip} - Last seen {daysStale} days ago</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {staleAssets.length > 8 && (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              +{staleAssets.length - 8} more stale assets
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
