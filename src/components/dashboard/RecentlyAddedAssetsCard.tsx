import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecentAsset {
  id: string;
  name: string;
  ip: string;
  locality: string;
  zone?: string;
  addedAgo: string;
}

interface RecentlyAddedAssetsCardProps {
  assets: RecentAsset[];
  onSelectAsset?: (assetId: string) => void;
  onViewAll?: () => void;
}

export const RecentlyAddedAssetsCard = ({
  assets,
  onSelectAsset,
  onViewAll,
}: RecentlyAddedAssetsCardProps) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Recently Added</CardTitle>
          </div>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[180px]">
          <div className="space-y-1">
            {assets.map((asset, index) => (
              <div
                key={asset.id}
                className={cn(
                  "flex items-center justify-between py-2 px-2 rounded-md cursor-pointer hover:bg-secondary/50 transition-colors",
                  index % 2 === 0 && "bg-secondary/20"
                )}
                onClick={() => onSelectAsset?.(asset.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{asset.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{asset.ip}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {asset.locality}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{asset.addedAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
