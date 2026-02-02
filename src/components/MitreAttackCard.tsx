import { MitreCategory } from "@/types/asset";
import { ArrowRight, Info, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MitreAttackCardProps {
  categories: MitreCategory[];
  totalEvents: number;
}

export const MitreAttackCard = ({ categories, totalEvents }: MitreAttackCardProps) => {
  const activeCategories = categories.filter(c => c.count > 0);
  const topCategories = [...categories].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">MITRE ATT&CK Tactics</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Events mapped to MITRE ATT&CK framework over the last 7 days. Shows adversary tactics detected on this asset.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/30 rounded-lg">
          <div className="flex-shrink-0">
            <div className="text-3xl font-bold font-mono text-foreground">{totalEvents}</div>
            <div className="text-xs text-muted-foreground">Total Events</div>
          </div>
          <div className="border-l border-border pl-3">
            <div className="text-lg font-semibold text-foreground">{activeCategories.length}</div>
            <div className="text-xs text-muted-foreground">Active Tactics</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Top Tactics
          </div>
          {topCategories.map((category) => (
            <div
              key={category.name}
              className={cn(
                'flex items-center justify-between p-2.5 rounded-lg border transition-all',
                category.count > 0
                  ? 'bg-card border-border hover:border-primary/50 hover:shadow-sm cursor-pointer'
                  : 'bg-muted/30 border-transparent opacity-60'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  'flex-shrink-0 w-8 h-8 rounded flex items-center justify-center font-bold text-sm font-mono',
                  category.count >= 10 ? 'bg-threat-high/15 text-threat-high' :
                  category.count >= 5 ? 'bg-threat-medium/15 text-threat-medium' :
                  category.count > 0 ? 'bg-threat-info/15 text-threat-info' :
                  'bg-muted text-muted-foreground'
                )}>
                  {category.count > 0 ? category.count : '0'}
                </div>
                <span className={cn(
                  'text-sm font-medium truncate',
                  category.count > 0 ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {category.name}
                </span>
              </div>
              {category.count > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-xs font-mono cursor-help flex-shrink-0 ml-2">
                      {category.tactics.slice(0, 1).join(', ')}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">Techniques:</p>
                      {category.tactics.map(t => (
                        <p key={t}>• {t}</p>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          ))}
        </div>

        <button className="link-text flex items-center gap-1 mt-4 w-full justify-center py-2 hover:bg-secondary/50 rounded transition-colors">
          View Full Analysis <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
