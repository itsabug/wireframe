import { useState } from 'react';
import { BadgeCheck, Edit2, Plus, ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type ShadowStatus = 'approved' | 'monitored' | 'blocked' | 'review';

interface ShadowService {
  id: string;
  name: string;
  category: string;
  status: ShadowStatus;
  risk: string;
  lastSeen: string;
  signals: string;
}

const statusStyles: Record<ShadowStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-700',
  monitored: 'bg-blue-500/10 text-blue-700',
  blocked: 'bg-rose-500/10 text-rose-700',
  review: 'bg-amber-500/10 text-amber-700',
};

const initialServices: ShadowService[] = [
  {
    id: 'shadow-1',
    name: 'Dropbox',
    category: 'File Sharing',
    status: 'approved',
    risk: 'Medium',
    lastSeen: '2h ago',
    signals: 'DNS + TLS SNI',
  },
  {
    id: 'shadow-2',
    name: 'UnknownCRM',
    category: 'CRM',
    status: 'review',
    risk: 'High',
    lastSeen: '30m ago',
    signals: 'DNS + HTTP Host',
  },
  {
    id: 'shadow-3',
    name: 'Pastebin',
    category: 'Data Sharing',
    status: 'blocked',
    risk: 'High',
    lastSeen: '1d ago',
    signals: 'TLS SNI',
  },
  {
    id: 'shadow-4',
    name: 'Zoom',
    category: 'Collaboration',
    status: 'monitored',
    risk: 'Low',
    lastSeen: '5h ago',
    signals: 'DNS + TLS SNI',
  },
];

export function ShadowItPolicyPanel() {
  const [services, setServices] = useState<ShadowService[]>(initialServices);
  const [showForm, setShowForm] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    status: 'review' as ShadowStatus,
    domains: '',
  });

  const handleCreate = () => {
    if (!newService.name.trim()) return;
    const created: ShadowService = {
      id: `shadow-${Date.now()}`,
      name: newService.name.trim(),
      category: newService.category.trim() || 'Uncategorized',
      status: newService.status,
      risk: newService.status === 'blocked' ? 'High' : 'Medium',
      lastSeen: 'Just now',
      signals: 'Policy entry',
    };
    setServices((prev) => [created, ...prev]);
    setShowForm(false);
    setNewService({ name: '', category: '', status: 'review', domains: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Shadow IT Discovery</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Classify newly observed SaaS and third-party services from packet-level signals.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">New Service Policy</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service Name *</Label>
              <Input
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="e.g., NewCRM"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={newService.category}
                onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                placeholder="e.g., CRM, File Sharing"
                className="bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-select">Status</Label>
              <select
                id="status-select"
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                aria-label="Status"
                value={newService.status}
                onChange={(e) =>
                  setNewService({ ...newService, status: e.target.value as ShadowStatus })
                }
              >
                <option value="review">Needs review</option>
                <option value="approved">Approved</option>
                <option value="monitored">Monitored</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Known Domains</Label>
              <Input
                value={newService.domains}
                onChange={(e) => setNewService({ ...newService, domains: e.target.value })}
                placeholder="crm.example.com, api.example.com"
                className="bg-input font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newService.name.trim()}>
              Save Service
            </Button>
          </div>
        </div>
      )}

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Discovery Controls</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Minimum distinct assets</Label>
            <Input type="number" min={1} defaultValue={3} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Minimum sessions before alerting</Label>
            <Input type="number" min={1} defaultValue={25} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Minimum data volume (MB)</Label>
            <Input type="number" min={1} defaultValue={100} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-baseline">Risk baseline</Label>
            <select id="risk-baseline" className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Risk baseline">
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Enable shadow IT discovery</Label>
              <p className="text-xs text-muted-foreground">
                Track newly observed SaaS domains from DNS and TLS metadata.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Alert on unsanctioned services</Label>
              <p className="text-xs text-muted-foreground">
                Create detections when a service is not approved.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-approve low-risk services</Label>
              <p className="text-xs text-muted-foreground">
                Mark services as approved when the risk score is low.
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Approved Domains</h4>
        </div>
        <div className="space-y-2">
          <Label>Domain allowlist</Label>
          <Textarea
            className="bg-input min-h-[90px] resize-none font-mono"
            placeholder="example.com
trusted-saas.com
corp-approved.net"
          />
          <p className="text-xs text-muted-foreground">
            Add one domain per line to auto-classify approved services.
          </p>
        </div>
        <div className="flex justify-end">
          <Button>Save Shadow IT Settings</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Signals</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium text-foreground">{service.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{service.category}</TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[service.status]}`}
                  >
                    {service.status === 'review'
                      ? 'Needs review'
                      : service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{service.risk}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{service.lastSeen}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{service.signals}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
