import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock } from "lucide-react";

interface DiscoveryCoverageCardProps {
  coverage: number;
  lastUpdated: string;
}

export const DiscoveryCoverageCard = ({ coverage, lastUpdated }: DiscoveryCoverageCardProps) => {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Discovery Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold font-mono">{coverage}%</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastUpdated}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
