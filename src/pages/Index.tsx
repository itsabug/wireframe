import { useEffect, useMemo, useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { AssetDetailPanel } from "@/components/AssetDetailPanel";
import { AssetDashboardPanel } from "@/components/AssetDashboardPanel";
import { AssetInventoryPanel } from "@/components/AssetInventoryPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { deviceRoles, roleToAssetMapping } from "@/data/asset-dashboard";
import { unifiedAssets } from "@/data/unified-assets";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { 
  mockFlows, 
  mockThreatEvents, 
  mockPeers, 
  mockMitreCategories,
  mockProtocolBreakdown,
  mockAnomalies,
  mockApplications,
  mockConversations,
  mockQoSData,
  mockTimelineEvents,
  mockChangeHistory,
  mockNetworkBehavior,
} from "@/data/mockData";
import { mockDNSData } from "@/data/dnsData";
import { mockDHCPData } from "@/data/dhcpData";

const Index = () => {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState<"dashboard" | "inventory">("dashboard");
  const [inventoryView, setInventoryView] = useState<"list" | "detail">("list");
  const [activeRoleFilter, setActiveRoleFilter] = useState<string | null>(null);
  const [activeProtocolFilter, setActiveProtocolFilter] = useState<string | null>(null);
  const [activeViewFilter, setActiveViewFilter] = useState<string>("all");

  const filteredAssets = useMemo(() => {
    let result = unifiedAssets;

    if (activeRoleFilter) {
      const matchingTypes = roleToAssetMapping[activeRoleFilter] || [];
      result = result.filter((asset) =>
        matchingTypes.some(
          (type) =>
            asset.deviceType.toLowerCase().includes(type.toLowerCase()) ||
            asset.roleTag.toLowerCase().includes(type.toLowerCase()),
        ),
      );
    }

    if (activeProtocolFilter) {
      result = result.filter((asset) => {
        const protocolLower = activeProtocolFilter.toLowerCase();
        if (protocolLower === "http") {
          return asset.deviceType.includes("Server") || asset.roleTag.includes("Web");
        }
        if (protocolLower === "dns") return true;
        if (protocolLower === "smb") {
          return asset.deviceType === "Server" || asset.deviceType === "Workstation";
        }
        if (protocolLower === "ssh") return asset.deviceType === "Server";
        if (protocolLower === "database") return asset.roleTag.includes("Database");
        if (protocolLower === "ldap" || protocolLower === "kerberos") {
          return asset.deviceType === "Server";
        }
        return true;
      });
    }

    return result;
  }, [activeProtocolFilter, activeRoleFilter]);

  const selectedAsset =
    filteredAssets.find((asset) => asset.id === selectedAssetId) ?? filteredAssets[0] ?? null;

  useEffect(() => {
    if (activeMainTab !== "inventory" || inventoryView !== "detail") return;
    if (filteredAssets.length === 0) return;
    if (selectedAssetId && filteredAssets.some((asset) => asset.id === selectedAssetId)) return;
    setSelectedAssetId(filteredAssets[0].id);
  }, [activeMainTab, filteredAssets, inventoryView, selectedAssetId]);

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setActiveMainTab("inventory");
    setInventoryView("detail");
  };

  const handleRoleFilterChange = (roleId: string) => {
    setActiveRoleFilter((prev) => (prev === roleId ? null : roleId));
    setActiveProtocolFilter(null);
    setActiveViewFilter("all");
    setActiveMainTab("inventory");
    setInventoryView("list");
  };

  const handleProtocolFilterChange = (protocolName: string) => {
    setActiveProtocolFilter((prev) => (prev === protocolName ? null : protocolName));
    setActiveRoleFilter(null);
    setActiveViewFilter("all");
    setActiveMainTab("inventory");
    setInventoryView("list");
  };

  const handleViewFilterChange = (viewId: string) => {
    setActiveViewFilter(viewId);
    setActiveRoleFilter(null);
    setActiveProtocolFilter(null);
    setActiveMainTab("inventory");
    setInventoryView("list");
  };

  const handleClearFilters = () => {
    setActiveRoleFilter(null);
    setActiveProtocolFilter(null);
    setActiveViewFilter("all");
    setInventoryView("list");
  };

  const hasActiveFilter = Boolean(activeRoleFilter || activeProtocolFilter);
  const activeFilterLabel = activeRoleFilter
    ? deviceRoles.find((role) => role.id === activeRoleFilter)?.label
    : activeProtocolFilter;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Navigation */}
      <TopNavBar />

      {/* Main Tabs with integrated back button */}
      <div className="border-b border-border bg-card px-6">
        <div className="flex items-center gap-4">
          {/* Back button - only show when viewing asset detail */}
          {activeMainTab === "inventory" && inventoryView === "detail" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setInventoryView("list")}
              className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Inventory
            </Button>
          )}
          
          <Tabs
            value={activeMainTab}
            onValueChange={(v) => {
              const nextTab = v as "dashboard" | "inventory";
              setActiveMainTab(nextTab);
              if (nextTab === "inventory") {
                setInventoryView("list");
              }
            }}
            className={activeMainTab === "inventory" && inventoryView === "detail" ? "border-l border-border pl-4" : ""}
          >
            <TabsList className="h-10 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="dashboard"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
              >
                Asset Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="inventory"
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
              >
                Asset Inventory
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeMainTab === "dashboard" ? (
          <AssetDashboardPanel
            assets={unifiedAssets}
            filteredAssets={filteredAssets}
            activeRoleFilter={activeRoleFilter}
            activeProtocolFilter={activeProtocolFilter}
            onRoleFilterChange={handleRoleFilterChange}
            onProtocolFilterChange={handleProtocolFilterChange}
            onViewFilterChange={handleViewFilterChange}
            onSelectAsset={handleSelectAsset}
          />
        ) : inventoryView === "list" ? (
          <AssetInventoryPanel
            assets={unifiedAssets}
            filteredAssets={filteredAssets}
            activeFilterLabel={activeFilterLabel}
            hasActiveFilter={hasActiveFilter}
            selectedAssetId={selectedAssetId}
            activeViewId={activeViewFilter}
            onViewChange={setActiveViewFilter}
            onClearFilters={handleClearFilters}
            onSelectAsset={handleSelectAsset}
          />
        ) : selectedAsset ? (
          <AssetDetailPanel
            asset={selectedAsset}
            events={mockThreatEvents}
            peers={mockPeers}
            mitreCategories={mockMitreCategories}
            flows={mockFlows}
            protocols={mockProtocolBreakdown}
            anomalies={mockAnomalies}
            applications={mockApplications}
            conversations={mockConversations}
            qosData={mockQoSData}
            timelineEvents={mockTimelineEvents}
            changeHistory={mockChangeHistory}
            networkBehavior={mockNetworkBehavior}
            dnsData={mockDNSData}
            dhcpData={mockDHCPData}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
            No assets match the current filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;