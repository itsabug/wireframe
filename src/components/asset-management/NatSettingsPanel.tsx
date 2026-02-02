import { useState } from 'react';
import { ArrowLeftRight, Edit2, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type NatStatus = 'active' | 'paused';

interface NatMapping {
  id: string;
  name: string;
  publicIp: string;
  publicPort: string;
  privateIp: string;
  privatePort: string;
  protocol: string;
  device: string;
  locality: string;
  status: NatStatus;
}

const statusStyles: Record<NatStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-700',
  paused: 'bg-amber-500/10 text-amber-700',
};

const initialMappings: NatMapping[] = [
  {
    id: 'nat-1',
    name: 'DMZ Web',
    publicIp: '203.0.113.10',
    publicPort: '443',
    privateIp: '10.20.30.40',
    privatePort: '443',
    protocol: 'TCP',
    device: 'Edge FW-1',
    locality: 'HQ',
    status: 'active',
  },
  {
    id: 'nat-2',
    name: 'Remote VPN Portal',
    publicIp: '198.51.100.55',
    publicPort: '8443',
    privateIp: '10.90.4.12',
    privatePort: '8443',
    protocol: 'TCP',
    device: 'Edge FW-2',
    locality: 'London',
    status: 'active',
  },
  {
    id: 'nat-3',
    name: 'Legacy FTP',
    publicIp: '203.0.113.30',
    publicPort: '21',
    privateIp: '10.22.9.18',
    privatePort: '21',
    protocol: 'TCP',
    device: 'Edge FW-1',
    locality: 'HQ',
    status: 'paused',
  },
];

const protocolOptions = ['Any', 'TCP', 'UDP', 'ICMP'];

export function NatSettingsPanel() {
  const [mappings, setMappings] = useState<NatMapping[]>(initialMappings);
  const [showForm, setShowForm] = useState(false);
  const [newMapping, setNewMapping] = useState({
    name: '',
    publicIp: '',
    publicPort: '',
    privateIp: '',
    privatePort: '',
    protocol: 'TCP',
    device: '',
    locality: '',
  });

  const handleCreate = () => {
    if (!newMapping.name.trim() || !newMapping.publicIp.trim() || !newMapping.privateIp.trim()) {
      return;
    }

    const created: NatMapping = {
      id: `nat-${Date.now()}`,
      name: newMapping.name.trim(),
      publicIp: newMapping.publicIp.trim(),
      publicPort: newMapping.publicPort.trim(),
      privateIp: newMapping.privateIp.trim(),
      privatePort: newMapping.privatePort.trim(),
      protocol: newMapping.protocol,
      device: newMapping.device.trim() || 'Unspecified',
      locality: newMapping.locality.trim() || 'Unassigned',
      status: 'active',
    };

    setMappings((prev) => [created, ...prev]);
    setShowForm(false);
    setNewMapping({
      name: '',
      publicIp: '',
      publicPort: '',
      privateIp: '',
      privatePort: '',
      protocol: 'TCP',
      device: '',
      locality: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">NAT Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Map public to private addresses so detections attribute traffic to the right assets.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add NAT Mapping
        </Button>
      </div>

      {showForm && (
        <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">New NAT Mapping</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Mapping Name *</Label>
              <Input
                value={newMapping.name}
                onChange={(e) => setNewMapping({ ...newMapping, name: e.target.value })}
                placeholder="e.g., DMZ Web"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Protocol</Label>
              <select
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                aria-label="Protocol"
                value={newMapping.protocol}
                onChange={(e) => setNewMapping({ ...newMapping, protocol: e.target.value })}
              >
                {protocolOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Public IP *</Label>
              <Input
                value={newMapping.publicIp}
                onChange={(e) => setNewMapping({ ...newMapping, publicIp: e.target.value })}
                placeholder="203.0.113.10"
                className="bg-input font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Port</Label>
              <Input
                value={newMapping.publicPort}
                onChange={(e) => setNewMapping({ ...newMapping, publicPort: e.target.value })}
                placeholder="443"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Private IP *</Label>
              <Input
                value={newMapping.privateIp}
                onChange={(e) => setNewMapping({ ...newMapping, privateIp: e.target.value })}
                placeholder="10.20.30.40"
                className="bg-input font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Private Port</Label>
              <Input
                value={newMapping.privatePort}
                onChange={(e) => setNewMapping({ ...newMapping, privatePort: e.target.value })}
                placeholder="443"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>NAT Device</Label>
              <Input
                value={newMapping.device}
                onChange={(e) => setNewMapping({ ...newMapping, device: e.target.value })}
                placeholder="e.g., Edge FW-1"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Locality</Label>
              <Input
                value={newMapping.locality}
                onChange={(e) => setNewMapping({ ...newMapping, locality: e.target.value })}
                placeholder="e.g., HQ"
                className="bg-input"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newMapping.name.trim()}>
              Save Mapping
            </Button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Attribution Behavior</h4>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Use NAT mappings for alert attribution</Label>
              <p className="text-xs text-muted-foreground">
                Translate public IPs to internal assets in detections and timelines.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-import mappings from sensors</Label>
              <p className="text-xs text-muted-foreground">
                Pull translations observed on firewalls and edge sensors.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Prefer explicit mappings over heuristics</Label>
              <p className="text-xs text-muted-foreground">
                Avoid guessing when a configured mapping exists.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Mapping</TableHead>
              <TableHead>Public</TableHead>
              <TableHead>Private</TableHead>
              <TableHead>Protocol</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Locality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell className="font-medium text-foreground">{mapping.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="font-mono">{mapping.publicIp}</div>
                  <div className="text-xs text-muted-foreground">{mapping.publicPort || '—'}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="font-mono">{mapping.privateIp}</div>
                  <div className="text-xs text-muted-foreground">{mapping.privatePort || '—'}</div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{mapping.protocol}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{mapping.device}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{mapping.locality}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[mapping.status]}`}
                  >
                    {mapping.status === 'active' ? 'Active' : 'Paused'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
