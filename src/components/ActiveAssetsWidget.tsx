import { Asset } from "@/types/asset";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getDaysSince } from "@/lib/asset-lifecycle";
import { Activity, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActiveAssetsWidgetProps {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

export const ActiveAssetsWidget = ({ assets, onSelectAsset }: ActiveAssetsWidgetProps) => {
  const { staleAfterDays, newAssetHighlightDays } = useLifecycleSettings();

  // Active assets: seen recently (not stale) and not new
  const activeAssets = assets.filter((asset) => {
    const days = getDaysSince(asset.lastSeen);
    if (days === null) return false;
    
    // Not stale
    const isStale = days > staleAfterDays;
    
    // Not new (check firstSeen)
    const firstSeenDays = getDaysSince(asset.firstSeen);
    const isNew = firstSeenDays !== null && firstSeenDays <= newAssetHighlightDays;
    
    return !isStale && !isNew;
  }).sort((a, b) => {
    const daysA = getDaysSince(a.lastSeen) ?? 0;
    const daysB = getDaysSince(b.lastSeen) ?? 0;
    return daysA - daysB; // Most recently seen first
  });

  return (
    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-blue-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/20 rounded-md">
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">Active Assets</h3>
            <p className="text-[10px] text-muted-foreground">Recently active devices</p>
          </div>
        </div>
        <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-xs">
          {activeAssets.length} active
        </Badge>
      </div>
      
      <ScrollArea className="max-h-[200px]">
        <div className="p-2 space-y-1">
          {activeAssets.slice(0, 8).map((asset) => {
            const daysAgo = getDaysSince(asset.lastSeen) ?? 0;
            return (
              <Tooltip key={asset.id}>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-blue-500/10 transition-colors group"
                    onClick={() => onSelectAsset(asset.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="h-3 w-3 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{asset.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{asset.ip} - {asset.deviceType}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
          {activeAssets.length > 8 && (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              +{activeAssets.length - 8} more active assets
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
