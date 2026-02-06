import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tag, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagChange {
  assetName: string;
  assetId: string;
  action: "added" | "removed";
  tag: string;
  timestamp: string;
}

interface RecentlyRetaggedCardProps {
  changes: TagChange[];
  onSelectAsset?: (assetId: string) => void;
}

export const RecentlyRetaggedCard = ({ changes, onSelectAsset }: RecentlyRetaggedCardProps) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium text-muted-foreground">Recently Retagged</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[160px]">
          <div className="space-y-2">
            {changes.map((change, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => onSelectAsset?.(change.assetId)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                    change.action === "added" ? "bg-emerald-500/20" : "bg-destructive/20"
                  )}>
                    {change.action === "added" ? (
                      <Plus className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-destructive" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{change.assetName}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] mt-0.5",
                        change.action === "added" 
                          ? "text-emerald-500 border-emerald-500/30" 
                          : "text-destructive border-destructive/30 line-through"
                      )}
                    >
                      {change.tag}
                    </Badge>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{change.timestamp}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
        {changes.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            No recent tag changes
          </div>
        )}
      </CardContent>
    </Card>
  );
};
