import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface RogueAsset {
  ip: string;
  count: number;
}

interface RogueAssetsCardProps {
  totalRogues: number;
  assets: RogueAsset[];
  onViewAll?: () => void;
}

export const RogueAssetsCard = ({ totalRogues, assets, onViewAll }: RogueAssetsCardProps) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Rogue Assets</CardTitle>
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
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2.5 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-destructive">{totalRogues}</p>
            <p className="text-xs text-muted-foreground">Rogues</p>
          </div>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-destructive" style={{ width: '65%' }} />
          </div>
        </div>
        <ScrollArea className="h-[140px]">
          <div className="space-y-1">
            {assets.map((asset, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-xs font-mono">{asset.ip}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{asset.count.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
