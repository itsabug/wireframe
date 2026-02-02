import { AnomalyDetail } from "@/types/asset";
import { cn } from "@/lib/utils";
import { AlertTriangle, Shield, Info, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface DetectionAlertsCardProps {
  anomalies: AnomalyDetail[];
}

export const DetectionAlertsCard = ({ anomalies }: DetectionAlertsCardProps) => {
  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h3 className="section-title mb-0">Detection Alerts</h3>
          <Badge variant="destructive" className="text-xs px-1.5 py-0">
            {anomalies.length}
          </Badge>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Anomalies detected by ML models, mapped to MITRE ATT&CK tactics</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="space-y-2">
        {anomalies.slice(0, 4).map((anomaly) => (
          <Tooltip key={anomaly.id}>
            <TooltipTrigger asChild>
              <div 
                className={cn(
                  "p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                  anomaly.confidence >= 90 
                    ? 'bg-destructive/5 border-destructive/30 hover:bg-destructive/10' 
                    : anomaly.confidence >= 70
                    ? 'bg-threat-medium/5 border-threat-medium/30 hover:bg-threat-medium/10'
                    : 'bg-secondary/30 border-border hover:bg-secondary/50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-medium text-foreground">{anomaly.type}</h4>
                      {anomaly.mitreId && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                          {anomaly.mitreId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{anomaly.description}</p>
                  </div>
                  <div className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded flex-shrink-0',
                    anomaly.confidence >= 90 ? 'bg-destructive/20 text-destructive' :
                    anomaly.confidence >= 70 ? 'bg-threat-medium/20 text-threat-medium' :
                    'bg-threat-info/20 text-threat-info'
                  )}>
                    {anomaly.confidence}%
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>{anomaly.mitreCategory || 'Uncategorized'}</span>
                  </div>
                  <span className="font-mono">{anomaly.timestamp.split(' ')[1]}</span>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium">{anomaly.type}</p>
                <p className="text-xs">{anomaly.description}</p>
                <p className="text-xs text-muted-foreground">Confidence: {anomaly.confidence}% | {anomaly.mitreId} - {anomaly.mitreCategory}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <button className="link-text flex items-center gap-1 mt-3 w-full justify-center text-xs">
        View all detections <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
