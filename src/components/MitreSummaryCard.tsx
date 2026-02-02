import { MitreCategory } from "@/types/asset";
import { Shield, Info, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface MitreSummaryCardProps {
  categories: MitreCategory[];
  totalEvents: number;
}

export const MitreSummaryCard = ({ categories, totalEvents }: MitreSummaryCardProps) => {
  const activeCategories = categories.filter(c => c.count > 0);
  const topCategories = [...categories].sort((a, b) => b.count - a.count).filter(c => c.count > 0).slice(0, 4);

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">MITRE ATT&CK</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Events mapped to MITRE ATT&CK framework tactics</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg mb-4">
        <div>
          <p className="text-2xl font-bold font-mono">{totalEvents}</p>
          <p className="text-xs text-muted-foreground">Total Events</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-lg font-semibold">{activeCategories.length}</p>
          <p className="text-xs text-muted-foreground">Active Tactics</p>
        </div>
      </div>

      {/* Top Tactics */}
      <div className="space-y-2">
        {topCategories.map((category) => (
          <Tooltip key={category.name}>
            <TooltipTrigger asChild>
              <div className={cn(
                'flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-help',
                category.count >= 10 ? 'bg-destructive/5 border-destructive/20 hover:bg-destructive/10' :
                category.count >= 5 ? 'bg-threat-medium/5 border-threat-medium/20 hover:bg-threat-medium/10' :
                'bg-secondary/30 border-border hover:bg-secondary/50'
              )}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={cn(
                    'flex-shrink-0 w-7 h-7 rounded flex items-center justify-center font-bold text-sm font-mono',
                    category.count >= 10 ? 'bg-destructive/15 text-destructive' :
                    category.count >= 5 ? 'bg-threat-medium/15 text-threat-medium' :
                    'bg-threat-info/15 text-threat-info'
                  )}>
                    {category.count}
                  </div>
                  <span className="text-sm font-medium truncate text-foreground">
                    {category.name}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono flex-shrink-0 ml-2">
                  {category.tactics[0]}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="space-y-1">
                <p className="text-xs font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">Techniques: {category.tactics.join(', ')}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <button className="link-text flex items-center gap-1 mt-3 w-full justify-center text-xs">
        View full matrix <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
