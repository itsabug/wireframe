import { Asset } from "@/types/asset";
import { useLifecycleSettings, isNewAsset, getNewAssetDays } from "@/state/lifecycleSettings";
import { Sparkles, ChevronRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface NewAssetsWidgetProps {
  assets: Asset[];
  onSelectAsset: (assetId: string) => void;
}

export const NewAssetsWidget = ({ assets, onSelectAsset }: NewAssetsWidgetProps) => {
  const { newAssetHighlightDays } = useLifecycleSettings();

  const newAssets = assets.filter((asset) => {
    // Parse firstSeen - handle different date formats
    const dateStr = asset.firstSeen.split(' ')[0];
    return isNewAsset(dateStr, newAssetHighlightDays);
  });

  const count = newAssets.length;

  return (
    <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-md">
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">New Assets</h3>
            <p className="text-[10px] text-muted-foreground">Last {newAssetHighlightDays} days</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
          {count} new
        </Badge>
      </div>
      
      {count === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-xs text-muted-foreground">No new assets discovered</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 max-h-[200px]">
          <div className="p-2 space-y-1">
            {newAssets.slice(0, 8).map((asset) => {
              const daysAgo = getNewAssetDays(asset.firstSeen.split(' ')[0]);
              return (
                <Tooltip key={asset.id}>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-md cursor-pointer hover:bg-emerald-500/10 transition-colors group"
                      onClick={() => onSelectAsset(asset.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Sparkles className="h-3 w-3 text-emerald-500 flex-shrink-0" />
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
            {count > 8 && (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                +{count - 8} more new assets
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};