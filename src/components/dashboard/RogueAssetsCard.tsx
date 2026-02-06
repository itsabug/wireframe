import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight, UserPlus, Tag, Search, ShieldOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WidgetHeader } from "./ScopeChip";
import { WIDGET_DEFINITIONS, RogueAssetEntry, DEFAULT_TIME_WINDOW } from "@/data/unified-dashboard-data";

interface RogueAssetsCardProps {
  totalRogues: number;
  assets: RogueAssetEntry[];
  timeWindow?: string;
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

export const RogueAssetsCard = ({ 
  totalRogues, 
  assets, 
  timeWindow = DEFAULT_TIME_WINDOW,
  onViewAll, 
  onAction 
}: RogueAssetsCardProps) => {
  const topAssets = assets.slice(0, 5);
  const def = WIDGET_DEFINITIONS.ROGUE_ASSETS;

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <WidgetHeader
          title={def.title}
          definition={def.definition}
          scope={def.scope}
          timeWindow={timeWindow}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
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
                      <span>{asset.connectionCount} conns</span>
                      <span>•</span>
                      <span>Last: {asset.lastSeen}</span>
                    </div>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="icon"
                        onClick={() => onAction?.(asset.ip, asset.suggestedAction)}
                        className="opacity-0 group-hover:opacity-100 h-7 w-7 text-primary transition-all"
                      >
                        <ActionIcon className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <span className="text-xs">{getActionLabel(asset.suggestedAction)}</span>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
            {assets.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                No rogue assets detected
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
