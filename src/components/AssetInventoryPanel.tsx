import { useMemo, useState } from "react";
import { Asset } from "@/types/asset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScoreBadge } from "./ScoreBadge";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Columns, Search, Filter, X } from "lucide-react";
import { getDeviceIcon } from "@/data/asset-dashboard";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getDaysSince, getStaleInfo } from "@/lib/asset-lifecycle";
import { useRiskSettings } from "@/state/riskSettings";
import { mockNetworkLocalities } from "@/data/mock-asset-data";
import { matchLocalityByIp } from "@/lib/network-locality";

interface AssetInventoryPanelProps {
  assets: Asset[];
  filteredAssets: Asset[];
  activeFilterLabel?: string;
  hasActiveFilter: boolean;
  selectedAssetId: string | null;
  activeViewId: string;
  onViewChange: (viewId: string) => void;
  onClearFilters: () => void;
  onSelectAsset: (assetId: string) => void;
}

export const AssetInventoryPanel = ({
  assets,
  filteredAssets,
  activeFilterLabel,
  hasActiveFilter,
  selectedAssetId,
  activeViewId,
  onViewChange,
  onClearFilters,
  onSelectAsset,
}: AssetInventoryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rowDensity, setRowDensity] = useState<"comfortable" | "compact">("compact");
  const [pageIndex, setPageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const { staleAfterDays } = useLifecycleSettings();
  const { highRiskThreshold, criticalRiskThreshold } = useRiskSettings();
  const [selectedLocalityIds, setSelectedLocalityIds] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState({
    ip: true,
    type: true,
    role: true,
    owner: true,
    exposure: true,
    criticality: true,
    status: true,
    threat: true,
    confidence: true,
    lastSeen: true,
  });

  const pageSize = 15;

  const views = [
    {
      id: "all",
      label: "All Assets",
      description: "All discovered assets",
      filter: () => true,
    },
    {
      id: "high-risk",
      label: "High Risk",
      description:
        criticalRiskThreshold > highRiskThreshold
          ? `Threat score ${highRiskThreshold}-${criticalRiskThreshold - 1}`
          : `Threat score >= ${highRiskThreshold}`,
      filter: (asset: Asset) =>
        asset.threatScore >= highRiskThreshold && asset.threatScore < criticalRiskThreshold,
    },
    {
      id: "stale",
      label: "Stale Assets",
      description: `Last seen > ${staleAfterDays} days`,
      filter: (asset: Asset) => {
        const days = getDaysSince(asset.lastSeen);
        return days !== null && days > staleAfterDays;
      },
    },
    {
      id: "public",
      label: "Public Exposure",
      description: "Public IP or inbound internet",
      filter: (asset: Asset) =>
        Boolean(asset.exposure?.hasPublicIP || asset.exposure?.hasInboundInternet),
    },
    {
      id: "rogue",
      label: "Rogue Assets",
      description: "Unmanaged or unknown devices",
      filter: (asset: Asset) => asset.status === "unknown" || asset.roleTag === "Unmanaged",
    },
  ];

  const activeView = views.find((view) => view.id === activeViewId) ?? views[0];

  const localityGroups = useMemo(() => {
    const grouped = new Map<string, typeof mockNetworkLocalities>();
    mockNetworkLocalities.forEach((locality) => {
      const key = locality.type;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)?.push(locality);
    });
    return Array.from(grouped.entries());
  }, []);

  const viewFilteredAssets = useMemo(() => {
    return filteredAssets.filter(activeView.filter);
  }, [activeView, filteredAssets]);

  const localityFilteredAssets = useMemo(() => {
    if (selectedLocalityIds.length === 0) return viewFilteredAssets;
    return viewFilteredAssets.filter((asset) => {
      const match = matchLocalityByIp(asset.ip, mockNetworkLocalities);
      if (!match) {
        return selectedLocalityIds.includes("unknown");
      }
      return selectedLocalityIds.includes(match.id);
    });
  }, [selectedLocalityIds, viewFilteredAssets]);

  const searchedAssets = useMemo(() => {
    if (!searchQuery) return localityFilteredAssets;
    const query = searchQuery.toLowerCase();
    return localityFilteredAssets.filter(
      (asset) => asset.name.toLowerCase().includes(query) || asset.ip.includes(searchQuery),
    );
  }, [searchQuery, localityFilteredAssets]);

  const totalPages = Math.max(1, Math.ceil(searchedAssets.length / pageSize));
  const currentPage = Math.min(pageIndex, totalPages - 1);
  const pagedAssets = searchedAssets.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const showEmptyState = pagedAssets.length === 0;
  const selectionCount = selectedIds.length;
  const allVisibleSelected = pagedAssets.length > 0 && pagedAssets.every((asset) => selectedIds.includes(asset.id));
  const someVisibleSelected = pagedAssets.some((asset) => selectedIds.includes(asset.id));
  const rowPadding = rowDensity === "compact" ? "py-1" : "py-2.5";

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pagedAssets.some((asset) => asset.id === id)));
      return;
    }

    const newIds = pagedAssets
      .map((asset) => asset.id)
      .filter((id) => !selectedIds.includes(id));
    setSelectedIds((prev) => [...prev, ...newIds]);
  };

  const toggleSelectAsset = (assetId: string) => {
    setSelectedIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId],
    );
  };

  const toggleLocality = (localityId: string) => {
    setSelectedLocalityIds((prev) =>
      prev.includes(localityId) ? prev.filter((id) => id !== localityId) : [...prev, localityId],
    );
  };

  const handleResetAll = () => {
    setSelectedLocalityIds([]);
    onClearFilters();
  };

  const formatLocalityType = (value: string) =>
    value
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const columnOptions = [
    { id: "ip", label: "IP Address" },
    { id: "type", label: "Type" },
    { id: "role", label: "Role" },
    { id: "owner", label: "Owner" },
    { id: "exposure", label: "Exposure" },
    { id: "criticality", label: "Criticality" },
    { id: "status", label: "Status" },
    { id: "threat", label: "Threat Score" },
    { id: "confidence", label: "Confidence" },
    { id: "lastSeen", label: "Last Seen" },
  ];

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-background min-h-0">
      {/* Filter Sidebar */}
      {showFilters && (
        <div className="w-72 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              Faceted Filters
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowFilters(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-5">
              {/* Criticality Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    Criticality
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Critical', 'High', 'Medium', 'Low'].map(level => (
                    <label 
                      key={level} 
                      htmlFor={`crit-${level}`} 
                      className="flex items-center gap-2 p-2 rounded-md border border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
                    >
                      <Checkbox id={`crit-${level}`} />
                      <span className="text-xs">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Locality Section */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Locality (Network Segments)
                </Label>
                <div className="space-y-3">
                  {localityGroups.map(([type, localities]) => {
                    const selectedCount = localities.filter((locality) =>
                      selectedLocalityIds.includes(locality.id),
                    ).length;
                    return (
                      <div key={type} className="rounded-lg border border-border/60 bg-secondary/10 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-secondary/20 border-b border-border/40">
                          <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
                            {formatLocalityType(type)}
                          </p>
                          {selectedCount > 0 && (
                            <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] h-5 px-1.5">
                              {selectedCount}
                            </Badge>
                          )}
                        </div>
                        <div className="p-2 space-y-1.5">
                          {localities.map((locality) => {
                            const id = `loc-${locality.id}`;
                            const checked = selectedLocalityIds.includes(locality.id);
                            return (
                              <label
                                key={locality.id}
                                htmlFor={id}
                                className={cn(
                                  "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-xs transition-all cursor-pointer",
                                  checked
                                    ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                                    : "border-border/50 bg-background hover:bg-secondary/30 hover:border-border",
                                )}
                              >
                                <span className="flex items-center gap-2">
                                  <Checkbox
                                    id={id}
                                    checked={checked}
                                    onCheckedChange={() => toggleLocality(locality.id)}
                                  />
                                  <span className="font-medium">{locality.name}</span>
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                                  {locality.cidrBlocks[0]}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Unknown locality */}
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border/40">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                        Unknown
                      </p>
                    </div>
                    <div className="p-2">
                      <label
                        htmlFor="loc-unknown"
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-md border px-2.5 py-2 text-xs transition-all cursor-pointer",
                          selectedLocalityIds.includes("unknown")
                            ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                            : "border-border/50 bg-background hover:bg-secondary/30",
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <Checkbox
                            id="loc-unknown"
                            checked={selectedLocalityIds.includes("unknown")}
                            onCheckedChange={() => toggleLocality("unknown")}
                          />
                          <span className="font-medium">Unmatched CIDR</span>
                        </span>
                        <span className="text-[10px] text-muted-foreground">—</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Exposure Section */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Exposure
                </Label>
                <div className="space-y-2">
                  <label 
                    htmlFor="exp-public" 
                    className="flex items-center gap-2 p-2 rounded-md border border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <Checkbox id="exp-public" />
                    <span className="text-xs">Publicly Exposed</span>
                  </label>
                  <label 
                    htmlFor="exp-internal" 
                    className="flex items-center gap-2 p-2 rounded-md border border-border/60 hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <Checkbox id="exp-internal" />
                    <span className="text-xs">Internal Only</span>
                  </label>
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-border bg-secondary/10">
            <Button variant="outline" size="sm" className="w-full text-xs gap-2" onClick={handleResetAll}>
              <X className="h-3 w-3" />
              Reset All Filters
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
      <div className="px-6 py-3 border-b border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!showFilters && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilters(true)}>
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {activeView.label}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {views.map((view) => (
                  <DropdownMenuCheckboxItem
                    key={view.id}
                    checked={view.id === activeViewId}
                    onCheckedChange={() => {
                      onViewChange(view.id);
                      setPageIndex(0);
                    }}
                  >
                    <div>
                      <p className="text-sm font-medium">{view.label}</p>
                      <p className="text-xs text-muted-foreground">{view.description}</p>
                    </div>
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {hasActiveFilter && (
              <div className="flex items-center gap-2">
                {activeFilterLabel && (
                  <Badge variant="secondary" className="gap-1.5 pr-1">
                    <span className="text-xs">{activeFilterLabel}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={onClearFilters}
                    >
                      <span className="sr-only">Clear filters</span>
                      x
                    </Button>
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {filteredAssets.length} of {assets.length}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs h-8">
                Clear Filters
              </Button>
            )}
            <ToggleGroup
              type="single"
              value={rowDensity}
              onValueChange={(value) => {
                if (value === "comfortable" || value === "compact") {
                  setRowDensity(value);
                }
              }}
              className="bg-secondary/30 rounded-md p-1"
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="comfortable" className="text-xs px-2">
                Comfort
              </ToggleGroupItem>
              <ToggleGroupItem value="compact" className="text-xs px-2">
                Compact
              </ToggleGroupItem>
            </ToggleGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Columns className="h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {columnOptions.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={visibleColumns[column.id as keyof typeof visibleColumns]}
                    onCheckedChange={(checked) =>
                      setVisibleColumns((prev) => ({
                        ...prev,
                        [column.id]: Boolean(checked),
                      }))
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPageIndex(0);
                }}
                className="pl-9 h-8 w-64 text-sm bg-secondary/30 border-border/50"
              />
            </div>
          </div>
        </div>
        {selectionCount > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">
              {selectionCount} selected
            </span>
            <div className="flex items-center gap-2">
              {activeViewId === "rogue" && (
                <Button variant="default" size="sm" className="h-7 text-xs bg-primary hover:bg-primary/90">
                  Authorize Assets
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Assign Owner
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Add Tag
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Add to Group
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Export
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          <div className="rounded-lg border border-border/50 overflow-hidden bg-secondary/20">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30 border-b border-border/50">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-muted-foreground">Asset Name</TableHead>
                  {visibleColumns.ip && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">IP Address</TableHead>
                  )}
                  {visibleColumns.type && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Type</TableHead>
                  )}
                  {visibleColumns.role && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Role</TableHead>
                  )}
                  {visibleColumns.owner && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Owner</TableHead>
                  )}
                  {visibleColumns.exposure && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Exposure</TableHead>
                  )}
                  {visibleColumns.criticality && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Criticality</TableHead>
                  )}
                  {visibleColumns.status && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Status</TableHead>
                  )}
                  {visibleColumns.threat && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Threat Score</TableHead>
                  )}
                  {visibleColumns.confidence && (
                    <TableHead className="text-xs font-semibold text-muted-foreground text-center">Confidence</TableHead>
                  )}
                  {visibleColumns.lastSeen && (
                    <TableHead className="text-xs font-semibold text-muted-foreground">Last Seen</TableHead>
                  )}
                  <TableHead className="text-xs font-semibold text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {showEmptyState ? (
                  <TableRow>
                    <TableCell colSpan={12} className="py-12 text-center text-sm text-muted-foreground">
                      No assets match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedAssets.map((asset) => {
                    const DeviceIcon = getDeviceIcon(asset.deviceType);
                    const isSelected = selectedIds.includes(asset.id);
                    const { isStale, staleDays } = getStaleInfo(asset.lastSeen, staleAfterDays);
                    const exposureLabel =
                      asset.exposure?.hasPublicIP || asset.exposure?.hasInboundInternet
                        ? "Public"
                        : "Internal";
                    const criticalityLabel = asset.criticality ? asset.criticality.toUpperCase() : "UNKNOWN";
                    return (
                      <TableRow
                        key={asset.id}
                        className={cn(
                          "cursor-pointer hover:bg-secondary/40 transition-colors border-b border-border/30",
                          selectedAssetId === asset.id && "bg-primary/10",
                          isSelected && "bg-secondary/50",
                        )}
                        onClick={() => onSelectAsset(asset.id)}
                      >
                        <TableCell className={rowPadding} onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectAsset(asset.id)}
                            aria-label={`Select ${asset.name}`}
                          />
                        </TableCell>
                        <TableCell className={rowPadding}>
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">{asset.name}</span>
                          </div>
                        </TableCell>
                        {visibleColumns.ip && (
                          <TableCell className={cn(rowPadding, "font-mono text-xs text-foreground")}>
                            {asset.ip}
                          </TableCell>
                        )}
                        {visibleColumns.type && (
                          <TableCell className={cn(rowPadding, "text-xs text-muted-foreground")}>
                            {asset.deviceType}
                          </TableCell>
                        )}
                        {visibleColumns.role && (
                          <TableCell className={rowPadding}>
                            <Badge variant="outline" className="text-xs">{asset.roleTag}</Badge>
                          </TableCell>
                        )}
                        {visibleColumns.owner && (
                          <TableCell className={cn(rowPadding, "text-xs text-muted-foreground")}>
                            {asset.owner || "Unassigned"}
                          </TableCell>
                        )}
                        {visibleColumns.exposure && (
                          <TableCell className={rowPadding}>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                exposureLabel === "Public" && "border-destructive/30 text-destructive bg-destructive/5",
                              )}
                            >
                              {exposureLabel}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.criticality && (
                          <TableCell className={rowPadding}>
                            <Badge variant="secondary" className="text-xs">
                              {criticalityLabel}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell className={rowPadding}>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                isStale && "border-warning/40 text-warning bg-warning/10",
                              )}
                            >
                              {isStale && staleDays !== null
                                ? `Stale ${staleDays}d`
                                : asset.status}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.threat && (
                          <TableCell className={cn(rowPadding, "text-center")}>
                            <ScoreBadge score={asset.threatScore} label="" size="sm" showLabel={false} />
                          </TableCell>
                        )}
                        {visibleColumns.confidence && (
                          <TableCell className={cn(rowPadding, "text-center")}>
                            <span className="text-xs font-mono text-muted-foreground">{asset.confidenceScore}%</span>
                          </TableCell>
                        )}
                        {visibleColumns.lastSeen && (
                          <TableCell className={cn(rowPadding, "text-xs text-muted-foreground")}>
                            {asset.lastSeen.split(" ")[0]}
                          </TableCell>
                        )}
                        <TableCell className={rowPadding}>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {pagedAssets.length} of {searchedAssets.length} assets
            </p>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPageIndex((prev) => Math.max(prev - 1, 0));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      setPageIndex((prev) => Math.min(prev + 1, totalPages - 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </ScrollArea>
      </div>
    </div>
  );
};
