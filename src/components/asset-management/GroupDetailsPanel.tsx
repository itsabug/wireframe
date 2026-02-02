import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AssetGroup, GroupOptions, DynamicGroupRule, NetworkLocality, NetworkSegment } from '@/types/asset-management';
import { 
  X, 
  Save, 
  Plus,
  Trash2,
  Info,
  ChevronDown,
  Folder,
  Server,
  Globe,
  Shield,
  Cloud,
  Users,
  AlertTriangle,
  ScanLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const localityOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'dmz', label: 'DMZ' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'partner', label: 'Partner' },
  { value: 'guest', label: 'Guest' },
];

const criticalityOptions = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const assetTypeOptions = [
  { value: 'server', label: 'Server' },
  { value: 'workstation', label: 'Workstation' },
  { value: 'network_device', label: 'Network Device' },
  { value: 'iot', label: 'IoT' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'virtual_machine', label: 'Virtual Machine' },
  { value: 'container', label: 'Container' },
  { value: 'cloud_instance', label: 'Cloud Instance' },
  { value: 'unknown', label: 'Unknown' },
];

const booleanOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const groupIconOptions = [
  { value: 'folder', label: 'Folder', icon: <Folder className="w-4 h-4" /> },
  { value: 'server', label: 'Server', icon: <Server className="w-4 h-4" /> },
  { value: 'globe', label: 'Globe', icon: <Globe className="w-4 h-4" /> },
  { value: 'shield', label: 'Shield', icon: <Shield className="w-4 h-4" /> },
  { value: 'cloud', label: 'Cloud', icon: <Cloud className="w-4 h-4" /> },
  { value: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { value: 'alert', label: 'Alert', icon: <AlertTriangle className="w-4 h-4" /> },
  { value: 'scanner', label: 'Scanner', icon: <ScanLine className="w-4 h-4" /> },
];

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

const resolveParentGroupId = (group: AssetGroup | null, isNew: boolean) => {
  if (isNew) return 'grp-internal';
  if (!group) return 'none';
  if (group.parentId) return group.parentId;
  if (group.id === 'grp-internal' || group.id === 'grp-external') return 'none';
  return outsideGroupIds.has(group.id) ? 'grp-external' : 'grp-internal';
};

const businessCriticalityOptions = [
  {
    value: 'not_important',
    title: 'Low impact',
    description: 'Can be offline with minimal disruption.',
  },
  {
    value: 'important',
    title: 'Important',
    description: 'Some business impact if compromised.',
  },
  {
    value: 'very_important',
    title: 'Very important',
    description: 'Significant impact and escalated response.',
  },
  {
    value: 'business_critical',
    title: 'Business critical',
    description: 'Severe impact; immediate response required.',
  },
];

interface GroupDetailsPanelProps {
  group: AssetGroup | null;
  isNew?: boolean;
  localities: NetworkLocality[];
  segments: NetworkSegment[];
  onClose: () => void;
  onSave: (group: Partial<AssetGroup>) => void;
  onDelete?: () => void;
}

export function GroupDetailsPanel({
  group,
  isNew = false,
  localities,
  segments,
  onClose,
  onSave,
  onDelete,
}: GroupDetailsPanelProps) {
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [groupType, setGroupType] = useState<'static' | 'dynamic'>(group?.type || 'static');
  const [icon, setIcon] = useState(group?.icon || '');
  const [businessCriticality, setBusinessCriticality] = useState(group?.businessCriticality || '');
  const [parentGroupId, setParentGroupId] = useState(resolveParentGroupId(group, isNew));
  const [ipRanges, setIpRanges] = useState(group?.ipRanges?.join('\n') || '');
  const [rules, setRules] = useState<DynamicGroupRule[]>(group?.rules || []);
  const [deviceImportFile, setDeviceImportFile] = useState<File | null>(null);
  const [options, setOptions] = useState<GroupOptions>(group?.options || {
    enableBaselining: true,
    disableSecurityEventsExcludedServices: false,
    disableFloodAlarms: false,
    trapUnusedAddresses: false,
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const localityOptionsResolved = (() => {
    const baseOptions = localityOptions.map((option) => ({
      value: option.value,
      label: `${option.label} (Any)`,
    }));
    const localityEntries = localities.map((locality) => ({
      value: locality.id,
      label: `${locality.name} (${locality.type})`,
    }));
    const combined = [...baseOptions, ...localityEntries];
    const seen = new Set<string>();
    return combined.filter((option) => {
      if (seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
  })();

  const localityById = new Map(localities.map((locality) => [locality.id, locality.name]));

  const zoneOptionsResolved = segments.map((segment) => ({
    value: segment.id,
    label: `${segment.name} • ${segment.cidr}`,
    locality: segment.localityId ? localityById.get(segment.localityId) : undefined,
  }));

  useEffect(() => {
    setName(group?.name || '');
    setDescription(group?.description || '');
    setGroupType(group?.type || 'static');
    setIcon(group?.icon || '');
    setBusinessCriticality(group?.businessCriticality || '');
    setParentGroupId(resolveParentGroupId(group, isNew));
    setIpRanges(group?.ipRanges?.join('\n') || '');
    setRules(group?.rules || []);
    setOptions(group?.options || {
      enableBaselining: true,
      disableSecurityEventsExcludedServices: false,
      disableFloodAlarms: false,
      trapUnusedAddresses: false,
    });
  }, [group, isNew]);

  const handleSave = () => {
    onSave({
      name,
      description,
      type: groupType,
      icon: icon || undefined,
      businessCriticality: (businessCriticality || undefined) as any,
      parentId: parentGroupId === 'none' ? undefined : parentGroupId,
      ipRanges: ipRanges.split(/[\n,]+/).map(r => r.trim()).filter(Boolean),
      rules: groupType === 'dynamic' ? rules : undefined,
      options,
    });
  };

  const handleImportDevices = () => {
    if (!deviceImportFile) return;
    console.log('Import devices CSV:', deviceImportFile.name);
    setDeviceImportFile(null);
  };

  const addRule = () => {
    setRules([...rules, { field: 'type', operator: 'equals', value: '' }]);
  };

  const updateRule = (index: number, updates: Partial<DynamicGroupRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold text-foreground">
            {isNew ? 'Create New Group' : group?.name}
          </h3>
          {!isNew && group && (
            <p className="text-xs text-muted-foreground">Group ID: {group.id}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto ndr-scrollbar p-4 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Asset Group Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              className="bg-input"
            />
          </div>

          <div className="space-y-2">
            <Label>How important are these assets to the business?</Label>
            <div className="grid gap-2 md:grid-cols-2">
              {businessCriticalityOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2"
                >
                  <input
                    type="radio"
                    name="businessCriticality"
                    value={option.value}
                    checked={businessCriticality === option.value}
                    onChange={() => setBusinessCriticality(option.value)}
                    className="mt-1 h-4 w-4 text-primary"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{option.title}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent">Parent Asset Group</Label>
            <Select value={parentGroupId} onValueChange={setParentGroupId}>
              <SelectTrigger className="bg-input" aria-label="Parent Asset Group">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— (No Parent)</SelectItem>
                <SelectItem value="grp-internal">Internal Assets</SelectItem>
                <SelectItem value="grp-external">External Assets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Group Icon (Optional)</Label>
            <Select
              value={icon || 'default'}
              onValueChange={(value) => setIcon(value === 'default' ? '' : value)}
            >
              <SelectTrigger className="bg-input" aria-label="Group Icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {groupIconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (512 Char Max)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this group's purpose..."
              className="bg-input min-h-[80px] resize-none"
              maxLength={512}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/512
            </p>
          </div>
        </div>


        {/* Group Type */}
        <div className="space-y-4">
          <Label>Group Type</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="groupType"
                checked={groupType === 'static'}
                onChange={() => setGroupType('static')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">Static (Manual membership)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="groupType"
                checked={groupType === 'dynamic'}
                onChange={() => setGroupType('dynamic')}
                className="w-4 h-4 text-primary"
              />
              <span className="text-sm">Dynamic (Rule-based)</span>
            </label>
          </div>
        </div>

        {/* IP Ranges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="ipRanges">IP Addresses And Ranges</Label>
            <Info className="w-4 h-4 text-muted-foreground" />
          </div>
          <Textarea
            id="ipRanges"
            value={ipRanges}
            onChange={(e) => setIpRanges(e.target.value)}
            placeholder="ex. 192.168.10.10, 192.168.10, 192.168.10-100, 192.168.10.0/24"
            className="bg-input min-h-[100px] resize-none font-mono text-sm"
          />
          <Button variant="link" size="sm" className="text-primary p-0 h-auto">
            Import IP Addresses and Ranges
          </Button>
        </div>

        {/* Device Import (Static Groups) */}
        {groupType === 'static' && (
          <div className="space-y-2">
            <Label>Import to This Group</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setDeviceImportFile(e.target.files?.[0] || null)}
                className="bg-input"
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImportDevices}
                  disabled={!deviceImportFile}
                >
                  Import to Group
                </Button>
                <Button variant="link" size="sm" className="text-primary p-0 h-auto" asChild>
                  <a href="/group-device-import-sample.csv" download>
                    Download group CSV
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Rules */}
        {groupType === 'dynamic' && (
          <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Membership Rules</Label>
            <Button variant="outline" size="sm" onClick={addRule}>
              <Plus className="w-4 h-4 mr-1" />
              Add Rule
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Define conditions that automatically include assets in this group.
          </p>

            {rules.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 bg-secondary/30 rounded-lg">
                No rules defined. Add rules to dynamically include assets.
              </div>
            ) : (
              <div className="space-y-3">
                {rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-secondary/30 rounded-lg"
                  >
                    <Select 
                      value={rule.field}
                      onValueChange={(v) => updateRule(index, { field: v })}
                    >
                      <SelectTrigger className="w-32 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="src_ip">Source IP (CIDR)</SelectItem>
                        <SelectItem value="dst_ip">Destination IP (CIDR)</SelectItem>
                        <SelectItem value="host_name">Asset Hostname</SelectItem>
                        <SelectItem value="criticality">Criticality</SelectItem>
                        <SelectItem value="type">Asset Type</SelectItem>
                        <SelectItem value="role">Asset Role</SelectItem>
                        <SelectItem value="locality">Network Locality</SelectItem>
                        <SelectItem value="zone">Network Zone</SelectItem>
                        <SelectItem value="exposure.hasPublicIP">Public IP Exposure</SelectItem>
                        <SelectItem value="tag">Tag</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={rule.operator}
                      onValueChange={(v) =>
                        updateRule(index, { operator: v as DynamicGroupRule['operator'] })
                      }
                    >
                      <SelectTrigger className="w-28 bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">equals</SelectItem>
                        <SelectItem value="not_equals">not equals</SelectItem>
                        <SelectItem value="contains">contains</SelectItem>
                        <SelectItem value="starts_with">starts with</SelectItem>
                        <SelectItem value="ends_with">ends with</SelectItem>
                        <SelectItem value="matches_regex">matches regex</SelectItem>
                        <SelectItem value="greater_than">greater than</SelectItem>
                        <SelectItem value="less_than">less than</SelectItem>
                      </SelectContent>
                    </Select>

                    {rule.field === 'locality' ? (
                      <Select
                        value={rule.value ? String(rule.value) : undefined}
                        onValueChange={(v) => updateRule(index, { value: v })}
                      >
                        <SelectTrigger className="flex-1 bg-input">
                          <SelectValue placeholder="Select locality" />
                        </SelectTrigger>
                        <SelectContent>
                          {localityOptionsResolved.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No localities configured
                            </SelectItem>
                          ) : (
                            localityOptionsResolved.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : rule.field === 'zone' ? (
                      <Select
                        value={rule.value ? String(rule.value) : undefined}
                        onValueChange={(v) => updateRule(index, { value: v })}
                      >
                        <SelectTrigger className="flex-1 bg-input">
                          <SelectValue placeholder="Select zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {zoneOptionsResolved.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No zones configured
                            </SelectItem>
                          ) : (
                            zoneOptionsResolved.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                                {option.locality ? ` • ${option.locality}` : ""}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    ) : rule.field === 'criticality' ? (
                      <Select
                        value={rule.value ? String(rule.value) : undefined}
                        onValueChange={(v) => updateRule(index, { value: v })}
                      >
                        <SelectTrigger className="flex-1 bg-input">
                          <SelectValue placeholder="Select criticality" />
                        </SelectTrigger>
                        <SelectContent>
                          {criticalityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : rule.field === 'type' ? (
                      <Select
                        value={rule.value ? String(rule.value) : undefined}
                        onValueChange={(v) => updateRule(index, { value: v })}
                      >
                        <SelectTrigger className="flex-1 bg-input">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {assetTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : rule.field === 'exposure.hasPublicIP' ? (
                      <Select
                        value={rule.value ? String(rule.value) : undefined}
                        onValueChange={(v) => updateRule(index, { value: v })}
                      >
                        <SelectTrigger className="flex-1 bg-input">
                          <SelectValue placeholder="Select exposure" />
                        </SelectTrigger>
                        <SelectContent>
                          {booleanOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex-1 space-y-1">
                        <Input
                          value={rule.value as string}
                          onChange={(e) => updateRule(index, { value: e.target.value })}
                          placeholder="Value"
                          className="bg-input"
                        />
                        {rule.operator === 'matches_regex' && (
                          <p className="text-[11px] text-muted-foreground">
                            Regex uses patterns: <span className="font-mono">^</span> = start,
                            <span className="font-mono">$</span> = end,
                            <span className="font-mono">\\d+</span> = digits. Example{' '}
                            <span className="font-mono">^web-\\d+$</span> matches
                            <span className="font-mono">web-01</span> or <span className="font-mono">web-123</span>.
                          </p>
                        )}
                      </div>
                    )}

                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeRule(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Advanced Options */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Advanced Options</span>
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 transition-transform",
                advancedOpen && "rotate-180"
              )} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Enable baselining for assets in this group</Label>
                  <p className="text-xs text-muted-foreground">
                    Collect behavioral baseline data for anomaly detection
                  </p>
                </div>
                <Switch
                  checked={options.enableBaselining}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, enableBaselining: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Disable security events using excluded services</Label>
                  <p className="text-xs text-muted-foreground">
                    Suppress alerts for known-good services
                  </p>
                </div>
                <Switch
                  checked={options.disableSecurityEventsExcludedServices}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, disableSecurityEventsExcludedServices: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Disable flood alarms when an asset in this group is the target</Label>
                  <p className="text-xs text-muted-foreground">
                    Prevent alert storms from high-traffic assets
                  </p>
                </div>
                <Switch
                  checked={options.disableFloodAlarms}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, disableFloodAlarms: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="font-normal">Trap assets that scan unused addresses in this group</Label>
                  <p className="text-xs text-muted-foreground">
                    Detect reconnaissance of dark/unused IP space
                  </p>
                </div>
                <Switch
                  checked={options.trapUnusedAddresses}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, trapUnusedAddresses: checked })
                  }
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            {isNew ? 'Create Group' : 'Save Changes'}
          </Button>
        </div>
        {!isNew && onDelete && (
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={group?.isDefault}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete Group
          </Button>
        )}
      </div>
    </div>
  );
}
