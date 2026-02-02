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
import { Badge } from '@/components/ui/badge';

const directoryConnections = [
  {
    id: 'dir-1',
    provider: 'Active Directory',
    status: 'Connected',
    lastSync: '12 minutes ago',
  },
];

export function IdentityDirectoryPanel() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Directory Connections</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Connect identity sources to enrich asset ownership and user activity context.
          </p>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/50">
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directoryConnections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium text-foreground">
                    {connection.provider}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-muted-foreground">
                      {connection.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {connection.lastSync}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Add Directory</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure a new identity source for syncing users and asset ownership.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Directory Provider</Label>
            <select className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm">
              <option>Active Directory</option>
              <option>LDAP</option>
              <option>Microsoft Entra ID</option>
              <option>Google Workspace</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <select className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm">
              <option>Every 4 hours</option>
              <option>Every 12 hours</option>
              <option>Daily</option>
              <option>Weekly</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Server URL</Label>
            <Input placeholder="ldaps://dc01.corp.local" className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Base DN</Label>
            <Input placeholder="DC=corp,DC=local" className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Bind User</Label>
            <Input placeholder="svc_ndr@corp.local" className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Bind Password</Label>
            <Input type="password" placeholder="••••••••" className="bg-input" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Sync asset ownership</Label>
              <p className="text-xs text-muted-foreground">
                Map device owners and departments from directory attributes.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Sync user groups</Label>
              <p className="text-xs text-muted-foreground">
                Use directory groups for enrichment and reporting.
              </p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Directory</Button>
        </div>
      </div>
    </div>
  );
}
