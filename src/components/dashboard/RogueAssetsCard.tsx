import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight, HelpCircle, UserPlus, Tag, Search, ShieldOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RogueAssetEntry } from "@/data/dashboard-mock-data";

interface RogueAssetsCardProps {
  totalRogues: number;
  assets: RogueAssetEntry[];
  onViewAll?: () => void;
  onAction?: (assetIp: string, action: RogueAssetEntry['suggestedAction']) => void;
}

const getActionIcon = (action: RogueAssetEntry['suggestedAction']) => {
  switch (action) {
    case 'assign_owner': return UserPlus;
    case 'tag': return Tag;
    case 'investigate': return Search;
    case 'block': return ShieldOff;
  }
};

const getActionLabel = (action: RogueAssetEntry['suggestedAction']) => {
  switch (action) {
    case 'assign_owner': return 'Assign Owner';
    case 'tag': return 'Add Tag';
    case 'investigate': return 'Investigate';
    case 'block': return 'Block';
  }
};

const getReasonBadgeColor = (reason: RogueAssetEntry['reason']) => {
  switch (reason) {
    case 'unauthorized': return 'bg-destructive/15 text-destructive border-destructive/30';
    case 'shadow_it': return 'bg-amber-500/15 text-amber-600 border-amber-500/30';
    case 'unknown_vendor': return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
    case 'unmanaged': return 'bg-muted text-muted-foreground border-border';
  }
};

export const RogueAssetsCard = ({ totalRogues, assets, onViewAll, onAction }: RogueAssetsCardProps) => {
  const topAssets = assets.slice(0, 5);

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rogue Assets</CardTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-2 text-xs">
                  <p className="font-semibold">What are Rogue Assets?</p>
                  <p>Devices communicating on the network that are NOT in the managed asset inventory:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Unmanaged</strong>: Not in inventory</li>
                    <li><strong>Unknown Vendor</strong>: Unrecognized MAC prefix</li>
                    <li><strong>Shadow IT</strong>: Unauthorized personal devices</li>
                    <li><strong>Unauthorized</strong>: In restricted zones</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
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
        <div className="flex items-center gap-4 mb-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-destructive">{totalRogues}</p>
            <p className="text-[10px] text-muted-foreground">Unmanaged devices</p>
          </div>
        </div>

        <ScrollArea className="h-[160px]">
          <div className="space-y-2">
            {topAssets.map((asset, index) => {
              const ActionIcon = getActionIcon(asset.suggestedAction);
              return (
                <div
                  key={index}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono truncate">{asset.hostname || asset.ip}</span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-[9px] px-1 py-0 h-4", getReasonBadgeColor(asset.reason))}
                      >
                        {asset.reasonLabel}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {asset.hostname && <span className="font-mono">{asset.ip}</span>}
                      <span>•</span>
                      <span>{asset.connectionCount} connections</span>
                      <span>•</span>
                      <span>{asset.firstSeen}</span>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        onClick={() => onAction?.(asset.ip, asset.suggestedAction)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-primary/10 text-primary transition-all"
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <span className="text-xs">{getActionLabel(asset.suggestedAction)}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
