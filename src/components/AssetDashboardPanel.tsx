import React, { useState } from "react";
import { Asset } from "@/types/asset";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Server,
  Monitor,
  Laptop,
  Network,
} from "lucide-react";

import {
  DashboardAssetGroupsPanel,
  DiscoveryCoverageCard,
  RogueAssetsCard,
  MitreAttackSummaryCard,
  RecentlyAddedAssetsCard,
  AssetGroupHealthCard,
  OwnershipCoverageCard,
  LocalityCoverageCard,
  ZoneCoverageCard,
  StaleAssetBreakdownCard,
  NewAssetsByGroupCard,
  HotZonesCard,
  TopGroupsByRoguesCard,
  UncoveredSubnetsCard,
} from "@/components/dashboard";

import {
  dashboardGroupsData,
  localitiesData,
  zonesData,
  coverageGaps,
  recentlyAddedAssets,
  hotZones,
  topGroupsByRogues,
  staleBreakdown,
  staleTrendData,
  newAssetsByGroup,
  uncoveredSubnets,
  rogueAssets,
  mitreTactics,
} from "@/data/dashboard-mock-data";

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

const getDeviceIcon = (deviceType: string) => {
  switch (deviceType.toLowerCase()) {
    case "server": return Server;
    case "laptop":
    case "workstation": return Laptop;
    case "network_device": return Network;
    default: return Monitor;
  }
};

export const AssetDashboardPanel = ({
  assets,
  filteredAssets,
  onViewFilterChange,
  onSelectAsset,
}: AssetDashboardPanelProps) => {
  const [widgetsVisible, setWidgetsVisible] = useState(true);
  const totalAssets = assets.length;

  // Get the top assets for the table display
  const tableAssets = filteredAssets.slice(0, 15);

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background min-h-0">
      {/* Left Panel - Asset Groups */}
      <div className="w-[260px] border-r border-border flex flex-col min-h-0">
        <DashboardAssetGroupsPanel
          groups={dashboardGroupsData}
          totalAssets={totalAssets}
          onGroupClick={(groupId) => onViewFilterChange(groupId)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-4">
            {/* Top Stats Row */}
            <div className="grid grid-cols-4 gap-3">
              <DiscoveryCoverageCard coverage={95} lastUpdated="Last 24 hours" />
              <RogueAssetsCard
                totalRogues={43}
                assets={rogueAssets}
                onViewAll={() => onViewFilterChange("rogue")}
              />
              <MitreAttackSummaryCard
                activeEvents={226}
                totalEvents={340}
                tactics={mitreTactics}
              />
              <RecentlyAddedAssetsCard
                assets={recentlyAddedAssets}
                onSelectAsset={onSelectAsset}
                onViewAll={() => onViewFilterChange("new")}
              />
            </div>

            {/* Toggle Widgets Button */}
            <button
              onClick={() => setWidgetsVisible(!widgetsVisible)}
              className="flex items-center justify-center gap-2 w-full py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {widgetsVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {widgetsVisible ? "Hide Widgets" : "Show Widgets"} 
              <span className="text-[10px]">↑</span>
            </button>

            {/* Collapsible Widget Grid */}
            {widgetsVisible && (
              <div className="grid grid-cols-4 gap-3">
                {/* Inventory & Lifecycle */}
                <AssetGroupHealthCard
                  totalGroups={dashboardGroupsData.length}
                  internalCount={16}
                  externalCount={8}
                  trend={5}
                />
                <NewAssetsByGroupCard data={newAssetsByGroup} />
                <StaleAssetBreakdownCard
                  breakdown={staleBreakdown}
                  trendData={staleTrendData}
                  totalStale={20}
                  trend={8}
                />
                <OwnershipCoverageCard
                  totalAssets={totalAssets}
                  assignedCount={Math.floor(totalAssets * 0.85)}
                  overdueReviews={3}
                />

                {/* Network Segmentation */}
                <LocalityCoverageCard
                  localities={localitiesData}
                  totalMapped={220}
                  totalAssets={240}
                />
                <ZoneCoverageCard zones={zonesData} coverageGaps={coverageGaps} />
                <UncoveredSubnetsCard subnets={uncoveredSubnets} />

                {/* Quick Updates / Tiles */}
                <TopGroupsByRoguesCard groups={topGroupsByRogues} timeWindow="7 days" />
                <HotZonesCard zones={hotZones} />
              </div>
            )}

            {/* Asset Table */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-foreground">Assets</CardTitle>
                  <button className="text-xs text-primary hover:underline flex items-center gap-1">
                    View all <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead className="w-10">
                        <Checkbox />
                      </TableHead>
                      <TableHead className="text-xs font-medium">Device</TableHead>
                      <TableHead className="text-xs font-medium">IP Address</TableHead>
                      <TableHead className="text-xs font-medium">MAC Address</TableHead>
                      <TableHead className="text-xs font-medium">First Seen</TableHead>
                      <TableHead className="text-xs font-medium">Device Type</TableHead>
                      <TableHead className="text-xs font-medium">Model</TableHead>
                      <TableHead className="text-xs font-medium">Uplink Device</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableAssets.map((asset, index) => {
                      const DeviceIcon = getDeviceIcon(asset.deviceType);
                      return (
                        <TableRow
                          key={asset.id}
                          className="cursor-pointer hover:bg-secondary/50"
                          onClick={() => onSelectAsset(asset.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                index % 3 === 0 ? "bg-destructive" : "bg-primary"
                              )} />
                              <span className="text-xs font-medium text-primary hover:underline">
                                {asset.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-mono">{asset.ip}</TableCell>
                          <TableCell className="text-xs font-mono text-muted-foreground">{asset.mac}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{asset.firstSeen}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{asset.deviceType}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {asset.roleTag || '-'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {asset.category === 'server' ? 'LAN-Gateway Switch' : '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
