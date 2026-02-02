import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScoreBadge } from "./ScoreBadge";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Activity,
  ChevronRight,
  Download,
  Filter,
  Server,
  Settings,
  Shield,
} from "lucide-react";
import { deviceRoles, protocolStats, headerStats, getDeviceIcon } from "@/data/asset-dashboard";
import { useRiskSettings } from "@/state/riskSettings";

interface AssetDashboardPanelProps {
  assets: Asset[];
  filteredAssets: Asset[];
  activeRoleFilter: string | null;
  activeProtocolFilter: string | null;
  onRoleFilterChange: (roleId: string) => void;
  onProtocolFilterChange: (protocolName: string) => void;
  onViewFilterChange: (viewId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export const AssetDashboardPanel = ({
  assets,
  filteredAssets,
  activeRoleFilter,
  activeProtocolFilter,
  onRoleFilterChange,
  onProtocolFilterChange,
  onViewFilterChange,
  onSelectAsset,
}: AssetDashboardPanelProps) => {
  const { highRiskThreshold, criticalRiskThreshold } = useRiskSettings();
  const handleRoleClick = (roleId: string, count: number) => {
    if (count === 0) return;
    onRoleFilterChange(roleId);
  };

  const handleProtocolClick = (protocolName: string) => {
    onProtocolFilterChange(protocolName);
  };

  const criticalAssets = assets.filter(
    (asset) => asset.threatScore >= criticalRiskThreshold,
  ).length;
  const highRiskAssets = assets.filter(
    (asset) =>
      asset.threatScore >= highRiskThreshold && asset.threatScore < criticalRiskThreshold,
  ).length;

  const topRiskyAssets = [...filteredAssets]
    .sort((a, b) => b.threatScore - a.threatScore)
    .slice(0, 5);

  const totalBytesIn = 245600000;
  const totalBytesOut = 189400000;

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`;
    if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
    if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="min-h-full">
          <div className="bg-card border-b border-border px-6 py-3">
            <div className="flex items-center justify-end gap-3 mb-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {headerStats.map((stat, index) => (
                <div key={index} className="bg-secondary/30 border border-border/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-primary text-lg font-bold font-mono leading-none">
                    {stat.value}{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      {stat.label.toLowerCase().replace(/s$/, "").replace("device", "device")}
                      {stat.value !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Discovery Coverage</p>
                  <p className="text-xl font-bold font-mono text-foreground">92%</p>
                  <p className="text-[10px] text-muted-foreground">8 subnets uncovered</p>
                </div>
              </div>

              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-chart-2/10 rounded-lg">
                  <Server className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Flow Sources</p>
                  <p className="text-xl font-bold font-mono text-foreground">18/20</p>
                  <p className="text-[10px] text-muted-foreground">2 degraded</p>
                </div>
              </div>

              <div
                className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:bg-destructive/10 transition-colors"
                onClick={() => onViewFilterChange("rogue")}
              >
                <div className="p-2.5 bg-destructive/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Rogue Assets</p>
                  <p className="text-xl font-bold font-mono text-destructive">23</p>
                  <p className="text-[10px] text-muted-foreground">Unmanaged or unknown</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-7">
                <h2 className="text-sm font-medium text-foreground mb-3">Devices by Role</h2>
                <div className="grid grid-cols-3 gap-2">
                  {deviceRoles.map((role) => {
                    const IconComponent = role.icon;
                    const isActive = activeRoleFilter === role.id;
                    return (
                      <Tooltip key={role.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all h-[60px]",
                              role.count === 0
                                ? "bg-muted/10 border-border/30 opacity-50 cursor-not-allowed"
                                : isActive
                                  ? "bg-primary/10 border-primary ring-1 ring-primary"
                                  : "bg-secondary/30 border-border hover:bg-secondary/50 hover:border-primary/50",
                            )}
                            onClick={() => handleRoleClick(role.id, role.count)}
                          >
                            <IconComponent
                              className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive ? "text-primary" : "text-muted-foreground",
                              )}
                            />
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "text-sm font-medium truncate leading-tight",
                                  isActive && "text-primary",
                                )}
                              >
                                {role.label}
                              </p>
                              <p
                                className={cn(
                                  "text-xs font-mono leading-tight",
                                  role.count > 0
                                    ? isActive
                                      ? "text-primary"
                                      : "text-primary"
                                    : "text-muted-foreground",
                                )}
                              >
                                {role.count} Device{role.count !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            {role.count > 0
                              ? `Click to filter ${role.count} ${role.label} device${
                                  role.count !== 1 ? "s" : ""
                                }`
                              : `No ${role.label} devices`}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

              <div className="col-span-5">
                <h2 className="text-sm font-medium text-foreground mb-3">Devices by Protocol</h2>
                <div className="bg-secondary/20 rounded-lg border border-border/50 overflow-hidden">
                  <ScrollArea className="h-[460px]">
                    <div className="divide-y divide-border/30">
                      {protocolStats.map((protocol, index) => {
                        const isActive = activeProtocolFilter === protocol.name;
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn(
                                  "flex items-center justify-between px-4 py-3 cursor-pointer transition-all",
                                  isActive
                                    ? "bg-primary/10 border-l-2 border-l-primary"
                                    : "hover:bg-secondary/30 border-l-2 border-l-transparent",
                                )}
                                onClick={() => handleProtocolClick(protocol.name)}
                              >
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    isActive ? "text-primary" : "text-foreground",
                                  )}
                                >
                                  {protocol.name}
                                </span>
                                <div className="flex items-center gap-6">
                                  <span className="text-xs font-mono text-primary w-20 text-right">
                                    {protocol.servers} server{protocol.servers !== 1 ? "s" : ""}
                                  </span>
                                  <span className="text-xs font-mono text-chart-2 w-20 text-right">
                                    {protocol.clients} client{protocol.clients !== 1 ? "s" : ""}
                                  </span>
                                  <Settings className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Click to filter devices using {protocol.name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <ArrowDownLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Inbound Traffic</p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    {formatBytes(totalBytesIn)}
                  </p>
                </div>
              </div>

              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-chart-2/10 rounded-lg">
                  <ArrowUpRight className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Outbound Traffic</p>
                  <p className="text-xl font-bold font-mono text-foreground">
                    {formatBytes(totalBytesOut)}
                  </p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-destructive/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Critical Risk Assets</p>
                  <p className="text-xl font-bold font-mono text-destructive">
                    {criticalAssets}
                  </p>
                </div>
              </div>

              <div className="bg-threat-high/5 border border-threat-high/30 rounded-lg p-4 flex items-center gap-4">
                <div className="p-2.5 bg-threat-high/20 rounded-lg">
                  <Shield className="h-5 w-5 text-threat-high" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">High Risk Assets</p>
                  <p className="text-xl font-bold font-mono text-threat-high">
                    {highRiskAssets}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-foreground mb-3">Top Risky Assets</h2>
              <div className="grid grid-cols-5 gap-3">
                {topRiskyAssets.map((asset, index) => {
                  const DeviceIcon = getDeviceIcon(asset.deviceType);
                  return (
                    <Tooltip key={asset.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center justify-between p-3 bg-secondary/30 border border-border/50 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors h-[52px]"
                          onClick={() => onSelectAsset(asset.id)}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground">
                              #{index + 1}
                            </span>
                            <DeviceIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs font-medium truncate">{asset.name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ScoreBadge score={asset.threatScore} label="" size="sm" showLabel={false} />
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {asset.ip} - {asset.deviceType}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
