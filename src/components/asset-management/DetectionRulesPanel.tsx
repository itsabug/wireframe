import { useEffect, useMemo, useState } from 'react';
import { Asset, AssetGroup, NetworkSegment } from '@/types/asset-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, ChevronRight, Save, Server, FolderTree, Layers, Shield } from 'lucide-react';
import { mockNetworkSegments } from '@/data/mock-asset-data';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type ThresholdScope = 'source' | 'target' | 'both';
type OverrideFilter = 'all' | 'source' | 'target' | 'both' | 'disabled';
type GroupAreaFilter = 'all' | 'inside' | 'outside';

interface RuleThresholds {
  tolerance: number;
  minPerHour: number;
  learningDays: number;
}

interface RuleOverride {
  id: string;
  scope: ThresholdScope;
  thresholdPerHour: number;
  tolerance: number;
  assetId?: string;
  groupId?: string;
  zoneId?: string;
}

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  defaultThresholds: RuleThresholds;
  assetOverrides: RuleOverride[];
  groupOverrides: RuleOverride[];
  zoneOverrides: RuleOverride[];
}

interface OverrideValues {
  enabled: boolean;
  thresholdPerHour: number;
  tolerance: number;
}

interface OverrideRow {
  id: string;
  label: string;
  searchText: string;
  source: OverrideValues;
  target: OverrideValues;
  area?: 'inside' | 'outside';
  extra?: string;
}

const severityClasses: Record<Severity, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const outsideGroupIds = new Set([
  'grp-external',
  'grp-internet-facing',
  'grp-guest',
  'grp-third-party',
  'grp-saas',
  'grp-external-apis',
  'grp-cdn',
  'grp-customer',
]);

interface DetectionRulesPanelProps {
  assets: Asset[];
  groups: AssetGroup[];
}

export function DetectionRulesPanel({ assets, groups }: DetectionRulesPanelProps) {
  const zones: NetworkSegment[] = mockNetworkSegments;

  const rules = useMemo<DetectionRule[]>(() => {
    const assetOverrides = assets.slice(0, 3).map((asset, index) => ({
      id: `ov-asset-${asset.id}`,
      assetId: asset.id,
      scope: (index === 0 ? 'source' : index === 1 ? 'target' : 'both') as ThresholdScope,
      thresholdPerHour: 900 + index * 150,
      tolerance: 45 + index * 5,
    }));
    const groupOverrides = groups.slice(0, 2).map((group, index) => ({
      id: `ov-group-${group.id}`,
      groupId: group.id,
      scope: (index === 0 ? 'both' : 'source') as ThresholdScope,
      thresholdPerHour: 700 + index * 200,
      tolerance: 40 + index * 10,
    }));
    const zoneOverrides = zones.slice(0, 2).map((zone, index) => ({
      id: `ov-zone-${zone.id}`,
      zoneId: zone.id,
      scope: (index === 0 ? 'source' : 'both') as ThresholdScope,
      thresholdPerHour: 600 + index * 100,
      tolerance: 35 + index * 5,
    }));

    return [
      {
        id: 'rule-brute-force',
        name: 'Brute Force Login',
        description:
          'Detect repeated authentication failures that indicate brute force or credential stuffing behavior.',
        severity: 'critical',
        defaultThresholds: {
          tolerance: 54,
          minPerHour: 1200,
          learningDays: 7,
        },
        assetOverrides,
        groupOverrides,
        zoneOverrides,
      },
      {
        id: 'rule-dns-tunneling',
        name: 'DNS Tunneling',
        description:
          'Identify unusual DNS query patterns that suggest data exfiltration over DNS.',
        severity: 'high',
        defaultThresholds: {
          tolerance: 42,
          minPerHour: 800,
          learningDays: 14,
        },
        assetOverrides: assetOverrides.slice(0, 2),
        groupOverrides: groupOverrides.slice(0, 1),
        zoneOverrides: zoneOverrides.slice(0, 1),
      },
      {
        id: 'rule-port-scan',
        name: 'Port Scan Activity',
        description:
          'Surface aggressive connection attempts across multiple ports from a single source.',
        severity: 'medium',
        defaultThresholds: {
          tolerance: 35,
          minPerHour: 500,
          learningDays: 10,
        },
        assetOverrides: [],
        groupOverrides: [],
        zoneOverrides: [],
      },
      {
        id: 'rule-lateral-movement',
        name: 'Lateral Movement',
        description:
          'Detect suspicious east-west movement between internal assets with abnormal traffic bursts.',
        severity: 'high',
        defaultThresholds: {
          tolerance: 48,
          minPerHour: 650,
          learningDays: 12,
        },
        assetOverrides: assetOverrides.slice(1, 3),
        groupOverrides: groupOverrides,
        zoneOverrides: zoneOverrides,
      },
    ];
  }, [assets, groups, zones]);

  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id ?? '');
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [ruleSortBy, setRuleSortBy] = useState('severity');
  const [activeOverrideTab, setActiveOverrideTab] = useState('assets');

  const filteredRules = useMemo(() => {
    let result = rules.filter(r =>
      r.name.toLowerCase().includes(ruleSearchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(ruleSearchQuery.toLowerCase())
    );

    if (ruleSortBy === 'severity') {
      const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      result.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    } else if (ruleSortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (ruleSortBy === 'overrides') {
      result.sort((a, b) => (b.assetOverrides.length + b.groupOverrides.length + b.zoneOverrides.length) - (a.assetOverrides.length + a.groupOverrides.length + a.zoneOverrides.length));
    }

    return result;
  }, [rules, ruleSearchQuery, ruleSortBy]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? filteredRules[0] ?? rules[0];

  const [thresholds, setThresholds] = useState<RuleThresholds>(selectedRule.defaultThresholds);
  const [severity, setSeverity] = useState<Severity>(selectedRule.severity);
  const [assetOverrides, setAssetOverrides] = useState<OverrideRow[]>([]);
  const [groupOverrides, setGroupOverrides] = useState<OverrideRow[]>([]);
  const [zoneOverrides, setZoneOverrides] = useState<OverrideRow[]>([]);
  const [assetFilter, setAssetFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [assetScopeFilter, setAssetScopeFilter] = useState<OverrideFilter>('all');
  const [groupScopeFilter, setGroupScopeFilter] = useState<OverrideFilter>('all');
  const [zoneScopeFilter, setZoneScopeFilter] = useState<OverrideFilter>('all');
  const [groupAreaFilter, setGroupAreaFilter] = useState<GroupAreaFilter>('all');

  const handleSaveOverrides = () => {
    console.log('Save overrides:', {
      ruleId: selectedRule.id,
      assetOverrides,
      groupOverrides,
      zoneOverrides,
    });
  };

  useEffect(() => {
    if (!selectedRule) return;
    const defaultThresholds = selectedRule.defaultThresholds;
    const buildRows = (
      entities: Array<{ id: string; label: string; searchText: string; area?: 'inside' | 'outside'; extra?: string }>,
      overrides: RuleOverride[],
    ) => {
      const baseRows = new Map<string, OverrideRow>();

      entities.forEach((entity) => {
        baseRows.set(entity.id, {
          id: entity.id,
          label: entity.label,
          searchText: entity.searchText,
          area: entity.area,
          extra: entity.extra,
          source: {
            enabled: true,
            thresholdPerHour: defaultThresholds.minPerHour,
            tolerance: defaultThresholds.tolerance,
          },
          target: {
            enabled: true,
            thresholdPerHour: defaultThresholds.minPerHour,
            tolerance: defaultThresholds.tolerance,
          },
        });
      });

      const applyOverride = (row: OverrideRow, override: RuleOverride) => {
        const applyValues = (segment: OverrideValues) => {
          segment.thresholdPerHour = override.thresholdPerHour;
          segment.tolerance = override.tolerance;
        };

        if (override.scope === 'source') {
          applyValues(row.source);
        } else if (override.scope === 'target') {
          applyValues(row.target);
        } else {
          applyValues(row.source);
          applyValues(row.target);
        }
      };

      overrides.forEach((override) => {
        const id = override.assetId ?? override.groupId ?? override.zoneId;
        if (!id) return;
        const row = baseRows.get(id);
        if (!row) return;
        applyOverride(row, override);
      });

      return Array.from(baseRows.values());
    };

    const assetRows = buildRows(
      assets.map((asset) => ({
        id: asset.id,
        label: formatAssetLabel(asset),
        searchText: `${asset.identity.hostname} ${asset.identity.ipv4Addresses.join(' ')}`,
      })),
      selectedRule.assetOverrides,
    );
    const groupRows = buildRows(
      groups.map((group) => ({
        id: group.id,
        label: group.name,
        searchText: group.name,
        area: outsideGroupIds.has(group.id) ? 'outside' : 'inside',
      })),
      selectedRule.groupOverrides,
    );
    const zoneRows = buildRows(
      zones.map((zone) => ({
        id: zone.id,
        label: zone.name,
        searchText: `${zone.name} ${zone.cidr}`,
        extra: zone.cidr,
      })),
      selectedRule.zoneOverrides,
    );

    setThresholds(defaultThresholds);
    setSeverity(selectedRule.severity);
    setAssetOverrides(assetRows);
    setGroupOverrides(groupRows);
    setZoneOverrides(zoneRows);
    setAssetFilter('');
    setGroupFilter('');
    setZoneFilter('');
    setAssetScopeFilter('all');
    setGroupScopeFilter('all');
    setZoneScopeFilter('all');
    setGroupAreaFilter('all');
  }, [selectedRuleId, selectedRule, assets, groups, zones]);

  const formatAssetLabel = (asset: Asset) => {
    const ip = asset.identity.ipv4Addresses[0] ? ` • ${asset.identity.ipv4Addresses[0]}` : '';
    return `${asset.identity.hostname}${ip}`;
  };

  const matchesScopeFilter = (row: OverrideRow, filter: OverrideFilter) => {
    const sourceEnabled = row.source.enabled;
    const targetEnabled = row.target.enabled;

    if (filter === 'source') return sourceEnabled && !targetEnabled;
    if (filter === 'target') return !sourceEnabled && targetEnabled;
    if (filter === 'both') return sourceEnabled && targetEnabled;
    if (filter === 'disabled') return !sourceEnabled && !targetEnabled;
    return true;
  };

  const matchesGroupAreaFilter = (row: OverrideRow, filter: GroupAreaFilter) => {
    if (filter === 'all') return true;
    if (!row.area) return false;
    return row.area === filter;
  };

  const filteredAssetOverrides = assetOverrides.filter((row) => {
    const matchesSearch = row.searchText.toLowerCase().includes(assetFilter.toLowerCase());
    return matchesSearch && matchesScopeFilter(row, assetScopeFilter);
  });
  const filteredGroupOverrides = groupOverrides.filter((row) => {
    const matchesSearch = row.searchText.toLowerCase().includes(groupFilter.toLowerCase());
    return matchesSearch && matchesScopeFilter(row, groupScopeFilter) && matchesGroupAreaFilter(row, groupAreaFilter);
  });
  const filteredZoneOverrides = zoneOverrides.filter((row) => {
    const matchesSearch = row.searchText.toLowerCase().includes(zoneFilter.toLowerCase());
    return matchesSearch && matchesScopeFilter(row, zoneScopeFilter);
  });

  const getOverrideCount = (type: 'assets' | 'groups' | 'zones') => {
    if (type === 'assets') return selectedRule.assetOverrides.length;
    if (type === 'groups') return selectedRule.groupOverrides.length;
    return selectedRule.zoneOverrides.length;
  };

  if (!selectedRule) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No detection rules configured.
      </div>
    );
  }

  const renderOverrideTable = (
    rows: OverrideRow[],
    setRows: React.Dispatch<React.SetStateAction<OverrideRow[]>>,
    showAreaColumn: boolean = false,
    showExtraColumn: boolean = false,
  ) => (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50">
            <TableHead className="min-w-[200px]">Name</TableHead>
            {showExtraColumn && <TableHead>CIDR</TableHead>}
            {showAreaColumn && <TableHead>Area</TableHead>}
            <TableHead>Source Threshold/hr</TableHead>
            <TableHead>Source Tolerance</TableHead>
            <TableHead>Target Threshold/hr</TableHead>
            <TableHead>Target Tolerance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showAreaColumn || showExtraColumn ? 7 : 5} className="text-center text-muted-foreground py-8">
                No items match your filter.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((override) => (
              <TableRow key={override.id}>
                <TableCell>
                  <div className="font-medium text-foreground">{override.label}</div>
                </TableCell>
                {showExtraColumn && (
                  <TableCell>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{override.extra || '—'}</code>
                  </TableCell>
                )}
                {showAreaColumn && (
                  <TableCell>
                    {override.area ? (
                      <Badge
                        variant="outline"
                        className={
                          override.area === 'outside'
                            ? 'border-external/40 text-external'
                            : 'border-internal/40 text-internal'
                        }
                      >
                        {override.area === 'outside' ? 'Outside' : 'Inside'}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <Input
                    value={override.source.thresholdPerHour}
                    disabled={!override.source.enabled}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((item) =>
                          item.id === override.id
                            ? { ...item, source: { ...item.source, thresholdPerHour: Number(e.target.value) || 0 } }
                            : item
                        )
                      )
                    }
                    className="bg-input h-9 w-[120px] disabled:bg-muted"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      value={override.source.tolerance}
                      disabled={!override.source.enabled}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === override.id
                              ? { ...item, source: { ...item.source, tolerance: Number(e.target.value) || 0 } }
                              : item
                          )
                        )
                      }
                      className="bg-input h-9 w-[90px] disabled:bg-muted"
                    />
                    <Switch
                      checked={override.source.enabled}
                      onCheckedChange={(checked) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === override.id
                              ? { ...item, source: { ...item.source, enabled: checked } }
                              : item
                          )
                        )
                      }
                      aria-label="Enable source thresholds"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Input
                    value={override.target.thresholdPerHour}
                    disabled={!override.target.enabled}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((item) =>
                          item.id === override.id
                            ? { ...item, target: { ...item.target, thresholdPerHour: Number(e.target.value) || 0 } }
                            : item
                        )
                      )
                    }
                    className="bg-input h-9 w-[120px] disabled:bg-muted"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      value={override.target.tolerance}
                      disabled={!override.target.enabled}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === override.id
                              ? { ...item, target: { ...item.target, tolerance: Number(e.target.value) || 0 } }
                              : item
                          )
                        )
                      }
                      className="bg-input h-9 w-[90px] disabled:bg-muted"
                    />
                    <Switch
                      checked={override.target.enabled}
                      onCheckedChange={(checked) =>
                        setRows((prev) =>
                          prev.map((item) =>
                            item.id === override.id
                              ? { ...item, target: { ...item.target, enabled: checked } }
                              : item
                          )
                        )
                      }
                      aria-label="Enable target thresholds"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex min-h-0 h-full overflow-hidden">
      {/* Left sidebar: Rule list */}
      <div className="w-80 border-r border-border bg-card flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-border space-y-3">
          <div className="text-sm font-semibold text-foreground">Detection Rules</div>
          <div className="relative">
            <Input
              placeholder="Search rules..."
              className="bg-input"
              value={ruleSearchQuery}
              onChange={(e) => setRuleSearchQuery(e.target.value)}
            />
          </div>
          <Select value={ruleSortBy} onValueChange={setRuleSortBy}>
            <SelectTrigger className="bg-input h-9 text-xs" aria-label="Sort rules">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Sort by Severity</SelectItem>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="overrides">Sort by Overrides</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto ndr-scrollbar p-2 space-y-1">
          {filteredRules.map((rule) => (
            <button
              key={rule.id}
              onClick={() => setSelectedRuleId(rule.id)}
              className={`w-full text-left p-3 rounded-md border transition-colors ${
                rule.id === selectedRuleId
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-transparent hover:bg-secondary/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={severityClasses[rule.severity]}>
                    {rule.severity.toUpperCase()}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">{rule.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{rule.assetOverrides.length + rule.groupOverrides.length + rule.zoneOverrides.length} overrides</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right content: Rule details + tabbed overrides */}
      <div className="flex-1 min-h-0 overflow-auto p-6 space-y-5">
        {/* Rule Header */}
        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedRule.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedRule.description}</p>
            </div>
            <Button size="sm" onClick={handleSaveOverrides}>
              <Save className="w-4 h-4 mr-1" />
              Save All
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-xs">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger className="bg-input h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Learning Period (days)</Label>
              <Input
                value={thresholds.learningDays}
                onChange={(e) =>
                  setThresholds({ ...thresholds, learningDays: Number(e.target.value) || 0 })
                }
                className="bg-input h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tolerance (%)</Label>
              <Input
                value={thresholds.tolerance}
                onChange={(e) =>
                  setThresholds({ ...thresholds, tolerance: Number(e.target.value) || 0 })
                }
                className="bg-input h-9"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Min Threshold/hr</Label>
              <Input
                value={thresholds.minPerHour}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minPerHour: Number(e.target.value) || 0 })
                }
                className="bg-input h-9"
              />
            </div>
          </div>
        </div>

        {/* Precedence Info */}
        <div className="flex items-start gap-3 p-3 bg-info/10 rounded-lg border border-info/20">
          <AlertTriangle className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Override precedence:</span>{' '}
            Rule defaults → Network Zone → Asset Group → Individual Asset (most specific wins).
          </p>
        </div>

        {/* Tabbed Override Sections */}
        <div className="border border-border rounded-lg bg-card overflow-hidden">
          <Tabs value={activeOverrideTab} onValueChange={setActiveOverrideTab} className="w-full">
            <div className="border-b border-border bg-secondary/30 px-4">
              <TabsList className="h-12 bg-transparent p-0 gap-0">
                <TabsTrigger
                  value="assets"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary px-5 py-2.5 gap-2"
                >
                  <Server className="w-4 h-4" />
                  <span>Individual Assets</span>
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {getOverrideCount('assets')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="groups"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary px-5 py-2.5 gap-2"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Asset Groups</span>
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {getOverrideCount('groups')}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="zones"
                  className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary px-5 py-2.5 gap-2"
                >
                  <Layers className="w-4 h-4" />
                  <span>Network Zones</span>
                  <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                    {getOverrideCount('zones')}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="assets" className="p-4 space-y-4 mt-0">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  placeholder="Filter by hostname or IP..."
                  className="bg-input max-w-sm h-9"
                />
                <Select value={assetScopeFilter} onValueChange={(value) => setAssetScopeFilter(value as OverrideFilter)}>
                  <SelectTrigger className="bg-input h-9 w-[160px]">
                    <SelectValue placeholder="Filter by scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="source">Source only</SelectItem>
                    <SelectItem value="target">Target only</SelectItem>
                    <SelectItem value="both">Source + Target</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderOverrideTable(filteredAssetOverrides, setAssetOverrides, false, false)}
            </TabsContent>

            <TabsContent value="groups" className="p-4 space-y-4 mt-0">
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  placeholder="Filter groups..."
                  className="bg-input max-w-sm h-9"
                />
                <Select value={groupAreaFilter} onValueChange={(value) => setGroupAreaFilter(value as GroupAreaFilter)}>
                  <SelectTrigger className="bg-input h-9 w-[150px]">
                    <SelectValue placeholder="Filter by area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="inside">Inside Assets</SelectItem>
                    <SelectItem value="outside">Outside Assets</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={groupScopeFilter} onValueChange={(value) => setGroupScopeFilter(value as OverrideFilter)}>
                  <SelectTrigger className="bg-input h-9 w-[160px]">
                    <SelectValue placeholder="Filter by scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="source">Source only</SelectItem>
                    <SelectItem value="target">Target only</SelectItem>
                    <SelectItem value="both">Source + Target</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderOverrideTable(filteredGroupOverrides, setGroupOverrides, true, false)}
            </TabsContent>

            <TabsContent value="zones" className="p-4 space-y-4 mt-0">
              <div className="flex items-center justify-between gap-3">
                <Input
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  placeholder="Filter by zone name or CIDR..."
                  className="bg-input max-w-sm h-9"
                />
                <Select value={zoneScopeFilter} onValueChange={(value) => setZoneScopeFilter(value as OverrideFilter)}>
                  <SelectTrigger className="bg-input h-9 w-[160px]">
                    <SelectValue placeholder="Filter by scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scopes</SelectItem>
                    <SelectItem value="source">Source only</SelectItem>
                    <SelectItem value="target">Target only</SelectItem>
                    <SelectItem value="both">Source + Target</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderOverrideTable(filteredZoneOverrides, setZoneOverrides, false, true)}
            </TabsContent>
          </Tabs>
        </div>

        {/* Global Suppression Link */}
        <div className="border border-border rounded-lg p-5 bg-card space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Global Suppression Rules</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Rule-wide exclusions are managed in Trust Lists with detection-scoped entries.
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 border border-border/50 rounded-lg bg-secondary/20">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Trust Lists</p>
              <p className="text-xs text-muted-foreground">
                Create detection-scoped trust entries to suppress alerts globally
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
