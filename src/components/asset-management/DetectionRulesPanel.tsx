import { useEffect, useMemo, useState } from 'react';
import { Asset, AssetGroup } from '@/types/asset-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { AlertTriangle, ChevronRight, Save } from 'lucide-react';

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
}

interface DetectionRule {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  defaultThresholds: RuleThresholds;
  assetOverrides: RuleOverride[];
  groupOverrides: RuleOverride[];
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
      },
    ];
  }, [assets, groups]);

  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id ?? '');
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [ruleSortBy, setRuleSortBy] = useState('severity');

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
      result.sort((a, b) => (b.assetOverrides.length + b.groupOverrides.length) - (a.assetOverrides.length + a.groupOverrides.length));
    }

    return result;
  }, [rules, ruleSearchQuery, ruleSortBy]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? filteredRules[0] ?? rules[0];

  const [thresholds, setThresholds] = useState<RuleThresholds>(selectedRule.defaultThresholds);
  const [severity, setSeverity] = useState<Severity>(selectedRule.severity);
  const [assetOverrides, setAssetOverrides] = useState<OverrideRow[]>([]);
  const [groupOverrides, setGroupOverrides] = useState<OverrideRow[]>([]);
  const [assetFilter, setAssetFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [assetScopeFilter, setAssetScopeFilter] = useState<OverrideFilter>('all');
  const [groupScopeFilter, setGroupScopeFilter] = useState<OverrideFilter>('all');
  const [groupAreaFilter, setGroupAreaFilter] = useState<GroupAreaFilter>('all');

  const handleSaveOverrides = () => {
    console.log('Save overrides:', {
      ruleId: selectedRule.id,
      assetOverrides,
      groupOverrides,
    });
  };

  useEffect(() => {
    if (!selectedRule) return;
    const defaultThresholds = selectedRule.defaultThresholds;
    const buildRows = (
      entities: Array<{ id: string; label: string; searchText: string; area?: 'inside' | 'outside' }>,
      overrides: RuleOverride[],
    ) => {
      const baseRows = new Map<string, OverrideRow>();

      entities.forEach((entity) => {
        baseRows.set(entity.id, {
          id: entity.id,
          label: entity.label,
          searchText: entity.searchText,
          area: entity.area,
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
        const id = override.assetId ?? override.groupId;
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

    setThresholds(defaultThresholds);
    setSeverity(selectedRule.severity);
    setAssetOverrides(assetRows);
    setGroupOverrides(groupRows);
    setAssetFilter('');
    setGroupFilter('');
    setAssetScopeFilter('all');
    setGroupScopeFilter('all');
    setGroupAreaFilter('all');
  }, [selectedRuleId, selectedRule]);

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

  if (!selectedRule) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No detection rules configured.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 h-full overflow-hidden border border-border rounded-lg">
      <div className="w-80 border-r border-border bg-card flex flex-col">
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
                <span>{rule.assetOverrides.length} asset overrides</span>
                <span>•</span>
                <span>{rule.groupOverrides.length} group overrides</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{selectedRule.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{selectedRule.description}</p>
            </div>
            <Button size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                <SelectTrigger className="bg-input">
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
              <Label>Learning Period (days)</Label>
              <Input
                value={thresholds.learningDays}
                onChange={(e) =>
                  setThresholds({ ...thresholds, learningDays: Number(e.target.value) || 0 })
                }
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Tolerance (%)</Label>
              <Input
                value={thresholds.tolerance}
                onChange={(e) =>
                  setThresholds({ ...thresholds, tolerance: Number(e.target.value) || 0 })
                }
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Never trigger when less than (per hour)</Label>
              <Input
                value={thresholds.minPerHour}
                onChange={(e) =>
                  setThresholds({ ...thresholds, minPerHour: Number(e.target.value) || 0 })
                }
                className="bg-input"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
          <AlertTriangle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Override precedence for this rule</p>
            <p className="text-muted-foreground mt-1">
              Rule defaults apply to all assets. Group overrides replace defaults, and asset overrides
              replace group settings when both exist. Turning off Source/Target excludes that direction
              for the asset or group (turn both off to exclude the rule entirely).
            </p>
          </div>
        </div>

        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Asset Threshold Overrides</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Override thresholds for specific assets or IPs that require different sensitivity.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Input
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              placeholder="Filter assets by hostname or IP..."
              className="bg-input max-w-sm"
            />
            <Select value={assetScopeFilter} onValueChange={(value) => setAssetScopeFilter(value as OverrideFilter)}>
              <SelectTrigger className="bg-input h-9 w-[180px]">
                <SelectValue placeholder="Filter by scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="source">Source only</SelectItem>
                <SelectItem value="target">Target only</SelectItem>
                <SelectItem value="both">Source + Target</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Asset/IP</TableHead>
                  <TableHead>Source Threshold/hr</TableHead>
                  <TableHead>Source Tolerance</TableHead>
                  <TableHead>Target Threshold/hr</TableHead>
                  <TableHead>Target Tolerance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssetOverrides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No assets match your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssetOverrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{override.label}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={override.source.thresholdPerHour}
                          disabled={!override.source.enabled}
                          onChange={(e) =>
                            setAssetOverrides((prev) =>
                              prev.map((item) =>
                                item.id === override.id
                                  ? {
                                      ...item,
                                      source: {
                                        ...item.source,
                                        thresholdPerHour: Number(e.target.value) || 0,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="bg-input h-9 w-[140px] disabled:bg-muted"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={override.source.tolerance}
                            disabled={!override.source.enabled}
                            onChange={(e) =>
                              setAssetOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? {
                                        ...item,
                                        source: {
                                          ...item.source,
                                          tolerance: Number(e.target.value) || 0,
                                        },
                                      }
                                    : item,
                                ),
                              )
                            }
                            className="bg-input h-9 w-[110px] disabled:bg-muted"
                          />
                          <Switch
                            checked={override.source.enabled}
                            onCheckedChange={(checked) =>
                              setAssetOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? { ...item, source: { ...item.source, enabled: checked } }
                                    : item,
                                ),
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
                            setAssetOverrides((prev) =>
                              prev.map((item) =>
                                item.id === override.id
                                  ? {
                                      ...item,
                                      target: {
                                        ...item.target,
                                        thresholdPerHour: Number(e.target.value) || 0,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="bg-input h-9 w-[140px] disabled:bg-muted"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={override.target.tolerance}
                            disabled={!override.target.enabled}
                            onChange={(e) =>
                              setAssetOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? {
                                        ...item,
                                        target: {
                                          ...item.target,
                                          tolerance: Number(e.target.value) || 0,
                                        },
                                      }
                                    : item,
                                ),
                            )
                          }
                            className="bg-input h-9 w-[110px] disabled:bg-muted"
                          />
                          <Switch
                            checked={override.target.enabled}
                            onCheckedChange={(checked) =>
                              setAssetOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? { ...item, target: { ...item.target, enabled: checked } }
                                    : item,
                                ),
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
        </div>

        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-foreground">Group Threshold Overrides</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Apply rule thresholds to entire asset groups for consistent tuning.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Input
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              placeholder="Filter groups..."
              className="bg-input max-w-sm"
            />
            <Select
              value={groupAreaFilter}
              onValueChange={(value) => setGroupAreaFilter(value as GroupAreaFilter)}
            >
              <SelectTrigger className="bg-input h-9 w-[170px]">
                <SelectValue placeholder="Filter by area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="inside">Inside Assets</SelectItem>
                <SelectItem value="outside">Outside Assets</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupScopeFilter} onValueChange={(value) => setGroupScopeFilter(value as OverrideFilter)}>
              <SelectTrigger className="bg-input h-9 w-[180px]">
                <SelectValue placeholder="Filter by scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="source">Source only</SelectItem>
                <SelectItem value="target">Target only</SelectItem>
                <SelectItem value="both">Source + Target</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>Group</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Source Threshold/hr</TableHead>
                  <TableHead>Source Tolerance</TableHead>
                  <TableHead>Target Threshold/hr</TableHead>
                  <TableHead>Target Tolerance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGroupOverrides.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No groups match your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroupOverrides.map((override) => (
                    <TableRow key={override.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{override.label}</div>
                      </TableCell>
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
                      <TableCell>
                        <Input
                          value={override.source.thresholdPerHour}
                          disabled={!override.source.enabled}
                          onChange={(e) =>
                            setGroupOverrides((prev) =>
                              prev.map((item) =>
                                item.id === override.id
                                  ? {
                                      ...item,
                                      source: {
                                        ...item.source,
                                        thresholdPerHour: Number(e.target.value) || 0,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="bg-input h-9 w-[140px] disabled:bg-muted"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={override.source.tolerance}
                            disabled={!override.source.enabled}
                            onChange={(e) =>
                              setGroupOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? {
                                        ...item,
                                        source: {
                                          ...item.source,
                                          tolerance: Number(e.target.value) || 0,
                                        },
                                      }
                                    : item,
                                ),
                            )
                          }
                            className="bg-input h-9 w-[110px] disabled:bg-muted"
                          />
                          <Switch
                            checked={override.source.enabled}
                            onCheckedChange={(checked) =>
                              setGroupOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? { ...item, source: { ...item.source, enabled: checked } }
                                    : item,
                                ),
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
                            setGroupOverrides((prev) =>
                              prev.map((item) =>
                                item.id === override.id
                                  ? {
                                      ...item,
                                      target: {
                                        ...item.target,
                                        thresholdPerHour: Number(e.target.value) || 0,
                                      },
                                    }
                                  : item,
                              ),
                            )
                          }
                          className="bg-input h-9 w-[140px] disabled:bg-muted"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Input
                            value={override.target.tolerance}
                            disabled={!override.target.enabled}
                            onChange={(e) =>
                              setGroupOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? {
                                        ...item,
                                        target: {
                                          ...item.target,
                                          tolerance: Number(e.target.value) || 0,
                                        },
                                      }
                                    : item,
                                ),
                            )
                          }
                            className="bg-input h-9 w-[110px] disabled:bg-muted"
                          />
                          <Switch
                            checked={override.target.enabled}
                            onCheckedChange={(checked) =>
                              setGroupOverrides((prev) =>
                                prev.map((item) =>
                                  item.id === override.id
                                    ? { ...item, target: { ...item.target, enabled: checked } }
                                    : item,
                                ),
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
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveOverrides}>
            <Save className="w-4 h-4 mr-2" />
            Save Overrides
          </Button>
        </div>

        <div className="border border-border rounded-lg p-5 bg-card space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Global Suppression Rules</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Define conditions to automatically suppress alerts (e.g., vulnerability scanners, backup windows).
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-secondary/20">
              <div>
                <p className="text-sm font-medium">Vulnerability Scanner Exclusion</p>
                <p className="text-xs text-muted-foreground">Suppress all alerts from 10.0.5.50 (Qualys Scanner)</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Active</Badge>
                <Switch defaultChecked />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg bg-secondary/20">
              <div>
                <p className="text-sm font-medium">Backup Window Suppression</p>
                <p className="text-xs text-muted-foreground">Suppress "Large Data Transfer" during 02:00 - 05:00 UTC</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Active</Badge>
                <Switch defaultChecked />
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full border-dashed">
              + Add Suppression Rule
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
