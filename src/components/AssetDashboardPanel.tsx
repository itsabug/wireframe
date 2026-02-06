import React, { useState } from "react";
import { Asset } from "@/types/asset";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Server,
  Monitor,
  Laptop,
  Network,
  Settings2,
  Tag,
  UserPlus,
  Clock,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import {
  DashboardAssetGroupsPanel,
  DiscoveryCoverageCard,
  RogueAssetsCard,
  MitreAttackSummaryCard,
  RecentlyAddedAssetsCard,
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
  ASSET_METRICS,
  dashboardGroupsData,
  localitiesData,
  zonesData,
  recentlyAddedAssets,
  hotZones,
  topGroupsByRogues,
  staleBreakdown,
  staleTrendData,
  newAssetsByGroup,
  uncoveredSubnets,
  rogueAssets,
  mitreTactics,
  DEFAULT_TIME_WINDOW,
} from "@/data/unified-dashboard-data";

import { ScopeChip } from "@/components/dashboard/ScopeChip";

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
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  
  // Use unified metrics
  const totalAssets = ASSET_METRICS.TOTAL_MANAGED_ASSETS;

  // Get the top assets for the table display
  const tableAssets = filteredAssets.slice(0, 15);

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const toggleAllSelection = () => {
    if (selectedAssets.size === tableAssets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(tableAssets.map(a => a.id)));
    }
  };

  // Convert zone data to legacy format for ZoneCoverageCard
  const zonesForCard = zonesData.map(z => ({
    name: z.name,
    assetCount: z.assetCount,
    hasGaps: z.hasGaps,
  }));

  const coverageGaps = uncoveredSubnets.map(s => s.cidr);

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
              <DiscoveryCoverageCard 
                totalAssets={totalAssets}
                timeWindow={DEFAULT_TIME_WINDOW}
              />
              <RogueAssetsCard
                totalRogues={ASSET_METRICS.ROGUE_ASSETS}
                assets={rogueAssets}
                timeWindow={DEFAULT_TIME_WINDOW}
                onViewAll={() => onViewFilterChange("rogue")}
              />
              <MitreAttackSummaryCard
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
                <NewAssetsByGroupCard data={newAssetsByGroup} />
                <StaleAssetBreakdownCard
                  breakdown={staleBreakdown}
                  trendData={staleTrendData}
                  totalStale={ASSET_METRICS.STALE_ASSETS}
                  trend={0}
                />
                <OwnershipCoverageCard
                  totalAssets={totalAssets}
                  assignedCount={ASSET_METRICS.ASSIGNED_OWNER}
                  overdueReviews={ASSET_METRICS.OVERDUE_REVIEW}
                  onViewUnassigned={() => onViewFilterChange("unassigned")}
                />

                {/* Network Segmentation */}
                <LocalityCoverageCard
                  localities={localitiesData}
                  totalAssets={totalAssets}
                  onViewUnmapped={() => onViewFilterChange("unmapped")}
                />
                <ZoneCoverageCard zones={zonesForCard} coverageGaps={coverageGaps} />
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
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-medium text-foreground">Assets</CardTitle>
                    <ScopeChip scope="All assets" timeWindow={DEFAULT_TIME_WINDOW} />
                    {selectedAssets.size > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {selectedAssets.size} selected
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAssets.size > 0 && (
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Tag className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Tag selected</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <UserPlus className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Assign owner</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Add to group</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    <button className="text-xs text-primary hover:underline flex items-center gap-1">
                      View all <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="px-4 py-2 bg-secondary/20 border-b border-border text-xs text-muted-foreground">
                  Showing {tableAssets.length} of {totalAssets} assets
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={selectedAssets.size === tableAssets.length && tableAssets.length > 0}
                          onCheckedChange={toggleAllSelection}
                        />
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
                          className={cn(
                            "cursor-pointer hover:bg-secondary/50",
                            selectedAssets.has(asset.id) && "bg-primary/5"
                          )}
                          onClick={() => onSelectAsset(asset.id)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox 
                              checked={selectedAssets.has(asset.id)}
                              onCheckedChange={() => toggleAssetSelection(asset.id)}
                            />
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
