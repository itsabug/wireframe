import { useMemo, useState } from 'react';
import { AssetGroup, Locality, NetworkLocality, NetworkSegment } from '@/types/asset-management';
import { 
  Plus, 
  X, 
  AlertTriangle,
  Layers,
  Globe,
  Server,
  Edit2,
  MapPin,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface NetworkLocalitiesPanelProps {
  localities: NetworkLocality[];
  segments: NetworkSegment[];
  groups: AssetGroup[];
  onEdit?: (locality: NetworkLocality) => void;
  onDelete?: (localityId: string) => void;
}

const businessImpactOptions = [
  { value: 'not_important', label: 'Low impact' },
  { value: 'important', label: 'Important' },
  { value: 'very_important', label: 'Very important' },
  { value: 'business_critical', label: 'Business critical' },
];

const localityTypeOptions: Array<{ value: Locality; label: string }> = [
  { value: 'internal', label: 'Internal' },
  { value: 'dmz', label: 'DMZ' },
  { value: 'cloud', label: 'Cloud' },
  { value: 'external', label: 'External' },
  { value: 'partner', label: 'Partner' },
  { value: 'guest', label: 'Guest' },
];

export function NetworkLocalitiesPanel({
  localities,
  segments,
  groups,
  onEdit,
  onDelete,
}: NetworkLocalitiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'localities' | 'zones'>('localities');
  const [newLocality, setNewLocality] = useState<{
    name: string;
    type: Locality;
    cidrBlocks: string;
    description: string;
    site: string;
  } | null>(null);
  const [newSegment, setNewSegment] = useState<{
    name: string;
    cidr: string;
    vlanId: string;
    vlanName: string;
    description: string;
    localityId: string;
    locality: NetworkSegment['locality'];
    defaultGroupId: string;
    businessCriticality: string;
    overrideDynamicRules: boolean;
  } | null>(null);

  const localityById = useMemo(
    () => new Map(localities.map((locality) => [locality.id, locality])),
    [localities],
  );

  const handleStartAdd = () => {
    setNewLocality({
      name: '',
      type: 'internal',
      cidrBlocks: '',
      description: '',
      site: '',
    });
  };

  const handleCancelAdd = () => {
    setNewLocality(null);
  };

  const handleStartAddSegment = () => {
    const defaultLocalityId = localities[0]?.id || '';
    const defaultLocalityType = defaultLocalityId
      ? localityById.get(defaultLocalityId)?.type ?? 'internal'
      : 'internal';
    setNewSegment({
      name: '',
      cidr: '',
      vlanId: '',
      vlanName: '',
      description: '',
      localityId: defaultLocalityId,
      locality: defaultLocalityType,
      defaultGroupId: '',
      businessCriticality: '',
      overrideDynamicRules: true,
    });
  };

  const handleCancelAddSegment = () => {
    setNewSegment(null);
  };

  const handleAddSegment = () => {
    if (!newSegment) return;
    console.log('Add segment:', newSegment);
    setNewSegment(null);
  };

  const hasLocalities = localities.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Network Segmentation</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define network localities and zones to classify assets and apply policy defaults.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-3">
        <AlertTriangle className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-foreground">Classification first, overrides second</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Localities classify assets for policy and reporting. Zones are subnet/VLAN slices that can override dynamic group rules.
          </p>
        </div>
      </div>

      {/* Tabs for Localities and Zones */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'localities' | 'zones')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="localities" className="gap-2">
            <MapPin className="h-4 w-4" />
            Network Localities
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full ml-1">{localities.length}</span>
          </TabsTrigger>
          <TabsTrigger value="zones" className="gap-2">
            <Network className="h-4 w-4" />
            Network Zones
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full ml-1">{segments.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* Localities Tab */}
        <TabsContent value="localities" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              High-level locations to classify assets and apply policy defaults.
            </p>
            {!newLocality && (
              <Button onClick={handleStartAdd} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Locality
              </Button>
            )}
          </div>

          {newLocality && (
            <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">New Network Locality</h4>
                <Button variant="ghost" size="icon" onClick={handleCancelAdd}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newLocality.name}
                    onChange={(e) => setNewLocality({ ...newLocality, name: e.target.value })}
                    placeholder="e.g., HQ Corporate"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Site</Label>
                  <Input
                    value={newLocality.site}
                    onChange={(e) => setNewLocality({ ...newLocality, site: e.target.value })}
                    placeholder="e.g., HQ-NYC"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Locality Type</Label>
                  <Select
                    value={newLocality.type}
                    onValueChange={(value) =>
                      setNewLocality({ ...newLocality, type: value as Locality })
                    }
                  >
                    <SelectTrigger className="bg-input" aria-label="Locality Type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {localityTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>IP Addresses and CIDR Blocks</Label>
                  <Input
                    value={newLocality.cidrBlocks}
                    onChange={(e) => setNewLocality({ ...newLocality, cidrBlocks: e.target.value })}
                    placeholder="e.g., 10.0.0.0/16; 10.1.0.0/16"
                    className="bg-input font-mono"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newLocality.description}
                    onChange={(e) => setNewLocality({ ...newLocality, description: e.target.value })}
                    placeholder="Optional description..."
                    className="bg-input min-h-[60px] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleCancelAdd}>
                  Cancel
                </Button>
                <Button
                  disabled={!newLocality.name.trim() || !newLocality.cidrBlocks.trim()}
                  onClick={() => {
                    console.log('Add locality:', {
                      ...newLocality,
                      cidrBlocks: newLocality.cidrBlocks.split(/[\n,;]+/).map(c => c.trim()).filter(Boolean)
                    });
                    setNewLocality(null);
                  }}
                >
                  Add Locality
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>CIDR Blocks</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No network localities configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  localities.map((locality) => (
                    <TableRow key={locality.id}>
                      <TableCell>
                        <div className="text-muted-foreground">
                          {locality.type === 'internal' ? (
                            <Server className="w-4 h-4 text-primary" />
                          ) : (
                            <Globe className="w-4 h-4 text-chart-2" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {locality.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground capitalize">
                        {locality.type}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {locality.cidrBlocks.slice(0, 2).map((cidr) => (
                            <span
                              key={cidr}
                              className="px-1.5 py-0.5 bg-secondary rounded text-xs font-mono"
                            >
                              {cidr}
                            </span>
                          ))}
                          {locality.cidrBlocks.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{locality.cidrBlocks.length - 2} more
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {locality.site || '—'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                        {locality.description || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit?.(locality)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => onDelete?.(locality.id)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Subnets and VLANs inside a locality that can override dynamic group rules.
            </p>
            {!newSegment && (
              <Button variant="outline" onClick={handleStartAddSegment} disabled={!hasLocalities} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Zone
              </Button>
            )}
          </div>

          {!hasLocalities && (
            <div className="rounded-lg border border-border bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
              Create at least one Network Locality first to add zones.
            </div>
          )}

          {newSegment && (
            <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">New Network Zone</h4>
                <Button variant="ghost" size="icon" onClick={handleCancelAddSegment}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="e.g., HQ Core"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subnet / CIDR</Label>
                  <Input
                    value={newSegment.cidr}
                    onChange={(e) => setNewSegment({ ...newSegment, cidr: e.target.value })}
                    placeholder="e.g., 10.0.1.0/24"
                    className="bg-input font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>VLAN ID</Label>
                  <Input
                    value={newSegment.vlanId}
                    onChange={(e) => setNewSegment({ ...newSegment, vlanId: e.target.value })}
                    placeholder="e.g., 10"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>VLAN Name</Label>
                  <Input
                    value={newSegment.vlanName}
                    onChange={(e) => setNewSegment({ ...newSegment, vlanName: e.target.value })}
                    placeholder="e.g., Core"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locality-select">Network Locality</Label>
                  <select
                    id="locality-select"
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                    value={newSegment.localityId}
                    onChange={(e) => {
                      const nextId = e.target.value;
                      const locality = localityById.get(nextId);
                      setNewSegment({
                        ...newSegment,
                        localityId: nextId,
                        locality: locality?.type ?? 'internal',
                      });
                    }}
                  >
                    {localities.map((locality) => (
                      <option key={locality.id} value={locality.id}>
                        {locality.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-select">Default Asset Group</Label>
                  <select
                    id="group-select"
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                    value={newSegment.defaultGroupId}
                    onChange={(e) => setNewSegment({ ...newSegment, defaultGroupId: e.target.value })}
                  >
                    <option value="">—</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    placeholder="e.g., Finance VLAN for billing apps"
                    className="bg-input min-h-[60px] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impact-select">Business Impact</Label>
                  <select
                    id="impact-select"
                    className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                    value={newSegment.businessCriticality}
                    onChange={(e) =>
                      setNewSegment({ ...newSegment, businessCriticality: e.target.value })
                    }
                  >
                    <option value="">—</option>
                    {businessImpactOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
                  <div>
                    <Label className="text-sm">Override dynamic group rules</Label>
                    <p className="text-xs text-muted-foreground">
                      Force assets in this subnet into the default group.
                    </p>
                  </div>
                  <Switch
                    checked={newSegment.overrideDynamicRules}
                    onCheckedChange={(checked) =>
                      setNewSegment({ ...newSegment, overrideDynamicRules: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={handleCancelAddSegment}>
                  Cancel
                </Button>
                <Button onClick={handleAddSegment} disabled={!newSegment.cidr.trim()}>
                  Add Network Zone
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>VLAN</TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Default Group</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Impact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {segments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No network zones configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  segments.map((segment) => {
                    const groupName = groups.find((group) => group.id === segment.defaultGroupId)?.name;
                    const localityName = segment.localityId
                      ? localityById.get(segment.localityId)?.name
                      : segment.locality;
                    return (
                      <TableRow key={segment.id}>
                        <TableCell>
                          <Layers className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-foreground">{segment.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{segment.cidr}</div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {segment.vlanId ? `VLAN ${segment.vlanId}` : '—'}
                          {segment.vlanName ? ` • ${segment.vlanName}` : ''}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {localityName || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {groupName || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {segment.overrideDynamicRules ? 'Yes' : 'No'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {segment.businessCriticality
                            ? businessImpactOptions.find(
                                (option) => option.value === segment.businessCriticality,
                              )?.label
                            : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}