import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, AlertCircle, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UncoveredSubnet {
  cidr: string;
  assetCount: number;
  firstSeen: string;
  severity: "high" | "medium" | "low";
}

interface UncoveredSubnetsCardProps {
  subnets: UncoveredSubnet[];
}

export const UncoveredSubnetsCard = ({ subnets }: UncoveredSubnetsCardProps) => {
  const [sortBy, setSortBy] = useState<"count" | "severity">("count");

  const sortedSubnets = [...subnets].sort((a, b) => {
    if (sortBy === "count") return b.assetCount - a.assetCount;
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  const getSeverityColor = (severity: UncoveredSubnet["severity"]) => {
    switch (severity) {
      case "high": return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium": return "bg-amber-500/20 text-amber-600 border-amber-500/30";
      case "low": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
    }
  };

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-sm font-medium text-muted-foreground">Uncovered Subnets</CardTitle>
          </div>
          <button
            onClick={() => setSortBy(sortBy === "count" ? "severity" : "count")}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortBy === "count" ? "by count" : "by severity"}
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[160px]">
          <div className="space-y-1.5">
            {sortedSubnets.map((subnet, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className={cn(
                    "h-3.5 w-3.5",
                    subnet.severity === "high" ? "text-destructive" :
                    subnet.severity === "medium" ? "text-amber-500" : "text-blue-500"
                  )} />
                  <span className="text-xs font-mono">{subnet.cidr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">{subnet.assetCount} assets</span>
                  <Badge variant="outline" className={cn("text-[9px]", getSeverityColor(subnet.severity))}>
                    {subnet.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {subnets.length === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            All subnets covered
          </div>
        )}
      </CardContent>
    </Card>
  );
};
