import { Asset } from "@/types/asset";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface AssetListItemProps {
  asset: Asset;
  isSelected: boolean;
  onClick: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return 'bg-threat-critical text-white';
  if (score >= 70) return 'bg-threat-high text-white';
  if (score >= 40) return 'bg-threat-medium text-primary-foreground';
  return 'bg-threat-low text-primary-foreground';
};

export const AssetListItem = ({ asset, isSelected, onClick }: AssetListItemProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2',
        isSelected 
          ? 'bg-secondary border-l-primary' 
          : 'border-l-transparent hover:bg-secondary/50'
      )}
    >
      {/* Threat Score */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-mono flex-shrink-0',
        getScoreColor(asset.threatScore)
      )}>
        {asset.threatScore}
      </div>

      {/* Asset Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">{asset.name}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
          <span className="truncate">{asset.roleTag || 'Network Privilege Escalation'}</span>
        </div>
      </div>

      {/* Blast Radius */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-mono">{asset.blastRadiusScore}</span>
        <AlertTriangle className="h-3 w-3" />
      </div>
    </div>
  );
};
