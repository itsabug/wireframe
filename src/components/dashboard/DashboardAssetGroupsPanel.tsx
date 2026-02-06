import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface AssetGroupItem {
  id: string;
  name: string;
  count: number;
  color: string;
  isSystem?: boolean;
}

interface DashboardAssetGroupsPanelProps {
  groups: AssetGroupItem[];
  totalAssets: number;
  onGroupClick?: (groupId: string) => void;
}

export const DashboardAssetGroupsPanel = ({
  groups,
  totalAssets,
  onGroupClick,
}: DashboardAssetGroupsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  
  // Mock categorization - in real app would come from data
  const internalGroups = groups.filter(g => 
    !g.name.toLowerCase().includes('external') && 
    !g.name.toLowerCase().includes('threat') &&
    !g.name.toLowerCase().includes('tor')
  );
  const externalGroups = groups.filter(g => 
    g.name.toLowerCase().includes('external') || 
    g.name.toLowerCase().includes('threat') ||
    g.name.toLowerCase().includes('tor') ||
    g.name.toLowerCase().includes('saas') ||
    g.name.toLowerCase().includes('partner')
  );

  const displayGroups = activeTab === "internal" ? internalGroups : externalGroups;
  const pieData = displayGroups.slice(0, 8).map((g, i) => ({
    name: g.name,
    value: g.count,
    color: g.color || `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  return (
    <Card className="bg-card border-border/50 h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Asset Groups</CardTitle>
          <Badge variant="secondary" className="text-[10px] font-mono">{groups.length}</Badge>
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-2">
          <TabsList className="h-7 w-full grid grid-cols-2">
            <TabsTrigger value="internal" className="text-xs h-6">Internal</TabsTrigger>
            <TabsTrigger value="external" className="text-xs h-6">External</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 pt-2">
        {/* Pie Chart */}
        <div className="h-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-lg font-bold"
              >
                {totalAssets}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[9px]"
              >
                Assets
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Group List */}
        <ScrollArea className="flex-1 min-h-0 -mx-2">
          <div className="px-2 space-y-1">
            {displayGroups.map((group, index) => (
              <div
                key={group.id}
                className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors"
                onClick={() => onGroupClick?.(group.id)}
              >
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: group.color || `hsl(var(--chart-${(index % 5) + 1}))` }}
                />
                <span className="text-xs text-foreground truncate flex-1">{group.name}</span>
                <span className="text-xs font-mono text-muted-foreground">{group.count}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
