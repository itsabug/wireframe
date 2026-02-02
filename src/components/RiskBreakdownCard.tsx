import { Asset, RiskFactor } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBreakdownCardProps {
  asset: Asset;
}

const defaultRiskFactors: RiskFactor[] = [
  {
    id: "rf-1",
    name: "Lateral Movement Detected",
    scoreContribution: 35,
    description: "Observed unusual RDP/SSH patterns to internal servers.",
    severity: "high",
  },
  {
    id: "rf-2",
    name: "Publicly Exposed Services",
    scoreContribution: 25,
    description: "Asset is reachable from the internet on port 443.",
    severity: "medium",
  },
  {
    id: "rf-3",
    name: "Data Exfiltration Attempt",
    scoreContribution: 25,
    description: "Large outbound transfer to unknown external IP.",
    severity: "critical",
  },
];

export const RiskBreakdownCard = ({ asset }: RiskBreakdownCardProps) => {
  const factors = asset.riskFactors || defaultRiskFactors;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-primary" />
          Risk Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Total Threat Score</span>
          <span className="text-lg font-bold font-mono">{asset.threatScore}</span>
        </div>
        <div className="space-y-2">
          {factors.map((factor) => (
            <div key={factor.id} className="flex flex-col gap-1 p-2 rounded-md bg-secondary/20 border border-border/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{factor.name}</span>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] px-1 h-4",
                    factor.severity === 'critical' && "border-destructive text-destructive bg-destructive/5",
                    factor.severity === 'high' && "border-orange-500 text-orange-500 bg-orange-500/5",
                    factor.severity === 'medium' && "border-warning text-warning bg-warning/5",
                  )}
                >
                  +{factor.scoreContribution}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
        <div className="pt-2 flex items-start gap-2">
          <Info className="h-3 w-3 text-muted-foreground mt-0.5" />
          <p className="text-[10px] text-muted-foreground italic">
            Scores are calculated based on behavioral baselines and threat intelligence correlation.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
