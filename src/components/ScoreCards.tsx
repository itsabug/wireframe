import { Asset } from "@/types/asset";
import { ScoreBadge } from "./ScoreBadge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ScoreCardsProps {
  asset: Asset;
}

export const ScoreCards = ({ asset }: ScoreCardsProps) => {
  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title mb-0">Risk Assessment</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Risk scores calculated based on behavior analysis over the last 7 days. Updated every hour.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ScoreBadge score={asset.threatScore} label="Threat Score" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Likelihood of compromise based on observed threats, anomalies, and vulnerabilities</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ScoreBadge score={asset.confidenceScore} label="Confidence" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Confidence level in the threat assessment based on data quality and volume</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ScoreBadge score={asset.blastRadiusScore} label="Blast Radius" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">Potential impact on network if this asset is compromised, based on connectivity and privileges</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
