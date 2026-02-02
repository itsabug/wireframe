import { useState } from 'react';
import { Asset, AssetGroup, TrustEntry, TrustType } from '@/types/asset-management';
import { 
  Plus, 
  X, 
  Edit2, 
  Trash2,
  Shield,
  Globe,
  ScanLine,
  Server,
  Folder,
  AlertTriangle,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface TrustListsPanelProps {
  entries: TrustEntry[];
  assets: Asset[];
  groups: AssetGroup[];
  onAdd?: (entry: Partial<TrustEntry>) => void;
  onEdit?: (entry: TrustEntry) => void;
  onDelete?: (entryId: string) => void;
  onToggle?: (entryId: string, isActive: boolean) => void;
  onNavigateToRules?: () => void;
}

const typeIcons: Record<TrustType, React.ReactNode> = {
  asset: <Server className="w-4 h-4" />,
  asset_group: <Folder className="w-4 h-4" />,
  domain: <Globe className="w-4 h-4" />,
  scanner: <ScanLine className="w-4 h-4" />,
  ip_range: <Shield className="w-4 h-4" />,
};

const typeLabels: Record<TrustType, string> = {
  asset: 'Asset',
  asset_group: 'Asset Group',
  domain: 'Domain',
  scanner: 'Scanner',
  ip_range: 'IP/IP Range',
};

const scopeLabels: Record<TrustEntry['scope'], string> = {
  global: 'Global',
  detection: 'Specific Detection',
  event: 'Specific Event',
};

const trustIconOptions = [
  { value: 'server', label: 'Server', icon: <Server className="w-4 h-4" /> },
  { value: 'folder', label: 'Folder', icon: <Folder className="w-4 h-4" /> },
  { value: 'globe', label: 'Globe', icon: <Globe className="w-4 h-4" /> },
  { value: 'shield', label: 'Shield', icon: <Shield className="w-4 h-4" /> },
  { value: 'scanner', label: 'Scanner', icon: <ScanLine className="w-4 h-4" /> },
  { value: 'alert', label: 'Alert', icon: <AlertTriangle className="w-4 h-4" /> },
];

const trustIconLibrary: Record<string, React.ReactNode> = {
  server: <Server className="w-4 h-4 text-muted-foreground" />,
  folder: <Folder className="w-4 h-4 text-muted-foreground" />,
  globe: <Globe className="w-4 h-4 text-muted-foreground" />,
  shield: <Shield className="w-4 h-4 text-muted-foreground" />,
  scanner: <ScanLine className="w-4 h-4 text-muted-foreground" />,
  alert: <AlertTriangle className="w-4 h-4 text-muted-foreground" />,
};

const detectionOptions = [
  { value: 'rule-brute-force', label: 'Brute Force Login' },
  { value: 'rule-dns-tunneling', label: 'DNS Tunneling' },
  { value: 'rule-port-scan', label: 'Port Scan Activity' },
  { value: 'rule-lateral-movement', label: 'Lateral Movement' },
];

const eventOptions = [
  { value: 'event-traffic-spike', label: 'Traffic Volume Spike' },
  { value: 'event-external-connection', label: 'New External Connection' },
  { value: 'event-protocol-anomaly', label: 'Protocol Anomaly' },
  { value: 'event-beaconing', label: 'Beaconing Pattern' },
];

export function TrustListsPanel({
  entries,
  assets,
  groups,
  onAdd,
  onEdit,
  onDelete,
  onNavigateToRules,
}: TrustListsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState<{
    type: TrustType;
    value: string;
    scope: 'global' | 'detection' | 'event';
    scopeValue: string[];
    icon: string;
    reason: string;
  }>({
    type: 'domain',
    value: '',
    scope: 'global',
    scopeValue: [],
    icon: '',
    reason: '',
  });
  const filteredEntries = entries;
  const scopeOptions = newEntry.scope === 'detection' ? detectionOptions : eventOptions;
  const selectedScopeOptions = scopeOptions.filter((option) =>
    newEntry.scopeValue.includes(option.value),
  );
  const detectionLabelMap = new Map(detectionOptions.map((option) => [option.value, option.label]));
  const eventLabelMap = new Map(eventOptions.map((option) => [option.value, option.label]));
  const assetLabelMap = new Map(assets.map((asset) => [asset.id, asset.identity.hostname]));
  const scannerAssets = assets.filter((asset) => asset.role === 'scanner');
  const groupLabelMap = new Map(groups.map((group) => [group.id, group.name]));

  const handleSubmit = () => {
    onAdd?.({
      ...newEntry,
      icon: newEntry.icon || undefined,
    });
    setShowAddForm(false);
    setNewEntry({
      type: 'domain',
      value: '',
      scope: 'global',
      scopeValue: [],
      icon: '',
      reason: '',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const toggleScopeValue = (value: string) => {
    const selected = newEntry.scopeValue.includes(value);
    const updatedValues = selected
      ? newEntry.scopeValue.filter((item) => item !== value)
      : [...newEntry.scopeValue, value];
    setNewEntry({ ...newEntry, scopeValue: updatedValues });
  };

  const getValueLabel = (type: TrustType) => {
    switch (type) {
      case 'asset':
        return 'Asset';
      case 'asset_group':
        return 'Asset Group';
      case 'scanner':
        return 'Scanner Asset';
      case 'ip_range':
        return 'IP/IP Range';
      default:
        return 'Domain';
    }
  };

  const renderValueInput = () => {
    if (newEntry.type === 'asset') {
      return (
        <Select
          value={newEntry.value || undefined}
          onValueChange={(v) => setNewEntry({ ...newEntry, value: v })}
        >
          <SelectTrigger className="bg-input">
            <SelectValue placeholder="Select asset" />
          </SelectTrigger>
          <SelectContent>
            {assets.map((asset) => (
              <SelectItem key={asset.id} value={asset.id}>
                {asset.identity.hostname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (newEntry.type === 'asset_group') {
      return (
        <Select
          value={newEntry.value || undefined}
          onValueChange={(v) => setNewEntry({ ...newEntry, value: v })}
        >
          <SelectTrigger className="bg-input">
            <SelectValue placeholder="Select asset group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (newEntry.type === 'scanner') {
      return (
        <Select
          value={newEntry.value || undefined}
          onValueChange={(v) => setNewEntry({ ...newEntry, value: v })}
        >
          <SelectTrigger className="bg-input">
            <SelectValue placeholder="Select scanner asset" />
          </SelectTrigger>
          <SelectContent>
            {scannerAssets.length === 0 ? (
              <SelectItem value="none" disabled>
                No scanner assets found
              </SelectItem>
            ) : (
              scannerAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.identity.hostname}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      );
    }

    const placeholder = newEntry.type === 'ip_range' ? '10.0.0.0/24' : '*.example.com';

    return (
      <Input
        value={newEntry.value}
        onChange={(e) => setNewEntry({ ...newEntry, value: e.target.value })}
        placeholder={placeholder}
        className="bg-input font-mono"
      />
    );
  };

  const resolveEntryValue = (entry: TrustEntry) => {
    if (entry.type === 'asset' || entry.type === 'scanner') {
      return assetLabelMap.get(entry.value) || entry.value;
    }

    if (entry.type === 'asset_group') {
      return groupLabelMap.get(entry.value) || entry.value;
    }

    return entry.value;
  };

  const resolveScopeValue = (entry: TrustEntry) => {
    if (!entry.scopeValue || entry.scopeValue.length === 0) return '';
    const labelMap = entry.scope === 'detection' ? detectionLabelMap : eventLabelMap;
    return entry.scopeValue
      .map((value) => labelMap.get(value) || value)
      .join(', ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Trust Lists</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage trusted assets, asset groups, scanners, domains, and IP ranges to reduce false positives and tune detection rules.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Add Trust Entry</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select 
                value={newEntry.type}
                onValueChange={(v) =>
                  setNewEntry({ ...newEntry, type: v as TrustType, value: '' })
                }
              >
                <SelectTrigger className="bg-input" aria-label="Trust type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="domain">Domain</SelectItem>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="asset_group">Asset Group</SelectItem>
                  <SelectItem value="scanner">Scanner</SelectItem>
                  <SelectItem value="ip_range">IP/IP Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select 
                value={newEntry.scope}
                onValueChange={(v) => setNewEntry({ 
                  ...newEntry, 
                  scope: v as 'global' | 'detection' | 'event',
                  scopeValue: [],
                })}
              >
                <SelectTrigger className="bg-input" aria-label="Trust scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global</SelectItem>
                  <SelectItem value="detection">Specific Detection</SelectItem>
                  <SelectItem value="event">Specific Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon (Optional)</Label>
            <Select
              value={newEntry.icon || 'default'}
              onValueChange={(value) =>
                setNewEntry({ ...newEntry, icon: value === 'default' ? '' : value })
              }
            >
              <SelectTrigger className="bg-input" aria-label="Trust icon">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                {trustIconOptions.map((option) => (
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

          {newEntry.scope !== 'global' && (
            <div className="space-y-2">
              <Label>{newEntry.scope === 'detection' ? 'Detections' : 'Events'}</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedScopeOptions.length > 0
                      ? `${selectedScopeOptions.length} selected`
                      : `Select ${newEntry.scope}`}
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[280px]">
                  {scopeOptions.map((option) => (
                    <DropdownMenuCheckboxItem
                      key={option.value}
                      checked={newEntry.scopeValue.includes(option.value)}
                      onCheckedChange={() => toggleScopeValue(option.value)}
                    >
                      {option.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedScopeOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedScopeOptions.map((option) => (
                    <Badge key={option.value} variant="secondary" className="flex items-center gap-1">
                      {option.label}
                      <button
                        type="button"
                        onClick={() => toggleScopeValue(option.value)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>{getValueLabel(newEntry.type)}</Label>
            {renderValueInput()}
          </div>

          <div className="space-y-2">
            <Label>Reason (required)</Label>
            <Textarea
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
              placeholder="Explain why this entry is being trusted..."
              className="bg-input min-h-[60px] resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !newEntry.value.trim() ||
                !newEntry.reason.trim() ||
                (newEntry.scope !== 'global' && newEntry.scopeValue.length === 0)
              }
            >
              Add Entry
            </Button>
          </div>
        </div>
      )}

      {/* Entries Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-10"></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => {
              const scopeValueLabel = resolveScopeValue(entry);
              const entryIcon = entry.icon ? trustIconLibrary[entry.icon] : typeIcons[entry.type];
              return (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="text-muted-foreground">
                      {entryIcon}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[entry.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {resolveEntryValue(entry)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {scopeLabels[entry.scope]}
                      {scopeValueLabel && `: ${scopeValueLabel}`}
                    </span>
                  </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                    {entry.reason}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(entry.createdAt)}
                </TableCell>
                <TableCell>
                  {entry.isActive ? (
                    <Badge className="bg-low/20 text-low border-low/30">
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit?.(entry)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => onDelete?.(entry.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                </TableRow>
              );
            })}
            {filteredEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No trust entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
        <AlertTriangle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
        <div className="text-sm flex-1">
          <p className="font-medium text-foreground">Trust entries affect detection behavior</p>
          <p className="text-muted-foreground mt-1">
            Adding entries to trust lists will suppress related detections. Ensure proper justification 
            and approval before adding entries to prevent security blind spots.
          </p>
          {onNavigateToRules && (
            <button
              onClick={onNavigateToRules}
              className="mt-2 text-primary hover:underline text-xs font-medium"
            >
              Configure per-rule suppression in Detection Rules →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
