import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
interface AssetTypeData {
  name: string;
  value: number;
  color: string;
}

interface AssetTypeDistributionCardProps {
  data: AssetTypeData[];
}

export const AssetTypeDistributionCard = ({ data }: AssetTypeDistributionCardProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Asset Type Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value} (${Math.round((value / total) * 100)}%)`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground truncate">{item.name}</span>
              <span className="font-mono ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
