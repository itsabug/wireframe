import { ProtocolBreakdown } from "@/types/asset";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ProtocolBreakdownCardProps {
  protocols: ProtocolBreakdown;
}

export const ProtocolBreakdownCard = ({ protocols }: ProtocolBreakdownCardProps) => {
  const data = [
    { name: 'TCP', value: protocols.tcp, color: 'hsl(195, 85%, 50%)' },
    { name: 'UDP', value: protocols.udp, color: 'hsl(280, 65%, 60%)' },
    { name: 'ICMP', value: protocols.icmp, color: 'hsl(142, 71%, 45%)' },
    { name: 'Other', value: protocols.other, color: 'hsl(25, 95%, 53%)' },
  ];

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title mb-0">Protocol Distribution</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Network protocol distribution by traffic volume over the last 24 hours</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {data.map((item) => (
            <Tooltip key={item.name}>
              <TooltipTrigger asChild>
                <div className="flex items-center justify-between p-1.5 rounded hover:bg-secondary/50 cursor-help transition-colors">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-mono font-medium">{item.value}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">{item.name} protocol accounts for {item.value}% of traffic</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {protocols.unknownApps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Unknown Applications</h4>
          <div className="flex flex-wrap gap-1.5">
            {protocols.unknownApps.map((app, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <span className="px-2 py-1 bg-secondary rounded text-xs font-mono text-muted-foreground hover:bg-secondary/80 cursor-help transition-colors">
                    {app}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Unidentified application using custom port</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
