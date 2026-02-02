import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function DataRetentionPanel() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Data Retention</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure how long metadata and packet data are stored for investigations.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Metadata retention (days)</Label>
            <Input type="number" min={1} defaultValue={180} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Packet retention (days)</Label>
            <Input type="number" min={1} defaultValue={30} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Session logs retention (days)</Label>
            <Input type="number" min={1} defaultValue={365} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Max storage per sensor (GB)</Label>
            <Input type="number" min={1} defaultValue={500} className="bg-input" />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Privacy Controls</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Apply data minimization and masking for sensitive fields.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Mask personal identifiers in metadata</Label>
              <p className="text-xs text-muted-foreground">
                Redact usernames, email addresses, and device owners.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Hash MAC addresses</Label>
              <p className="text-xs text-muted-foreground">
                Store MACs as hashes for privacy-safe correlation.
              </p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Anonymize external IPs in exports</Label>
              <p className="text-xs text-muted-foreground">
                Replace public IPs with masked values in reports.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Disable packet payload storage</Label>
              <p className="text-xs text-muted-foreground">
                Retain only headers while keeping flow context.
              </p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Retention Settings</Button>
        </div>
      </div>
    </div>
  );
}
