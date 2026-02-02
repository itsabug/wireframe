import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { updateLifecycleSettings, useLifecycleSettings } from '@/state/lifecycleSettings';

export function AssetLifecyclePanel() {
  const { staleAfterDays } = useLifecycleSettings();

  const handleStaleDaysChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateLifecycleSettings({ staleAfterDays: Math.max(1, Math.floor(parsed)) });
  };

  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Discovery & Staleness</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control how assets move between new, active, and stale states.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Mark asset as stale after (days inactive)</Label>
            <Input
              type="number"
              min={1}
              value={staleAfterDays}
              onChange={(event) => handleStaleDaysChange(event.target.value)}
              className="bg-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Auto-archive after (days inactive)</Label>
            <Input type="number" min={1} defaultValue={90} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>New asset highlight window (days)</Label>
            <Input type="number" min={1} defaultValue={7} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Ownership review cadence (days)</Label>
            <Input type="number" min={1} defaultValue={180} className="bg-input" />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lifecycle Automations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Apply labels and workflows as assets age or change state.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-tag new assets</Label>
              <p className="text-xs text-muted-foreground">Apply a “new-asset” tag for visibility.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-tag stale assets</Label>
              <p className="text-xs text-muted-foreground">Apply a “stale-asset” tag when inactive.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-remove assets on archive</Label>
              <p className="text-xs text-muted-foreground">
                Hide archived assets from default views.
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Auto-Merge & Dedupe</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidate duplicate assets detected across sensors and data sources.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Enable auto-merge</Label>
              <p className="text-xs text-muted-foreground">
                Merge assets automatically when high-confidence matches are detected.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Merge threshold (confidence %)</Label>
              <Input type="number" min={50} max={100} defaultValue={90} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label>Retain merged aliases (days)</Label>
              <Input type="number" min={1} defaultValue={30} className="bg-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Match criteria</Label>
            <div className="grid gap-2 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" defaultChecked />
                MAC address
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" defaultChecked />
                Hostname + IP
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" />
                Certificate fingerprint
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" />
                DHCP client ID
              </label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Require review for low-confidence merges</Label>
              <p className="text-xs text-muted-foreground">
                Queue merges below the threshold for approval.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Notifications & SLAs</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Route lifecycle alerts and enforce response time objectives.
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Notify on new critical assets</Label>
              <select className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Notify on new critical assets">
                <option>Immediately</option>
                <option>Hourly digest</option>
                <option>Daily digest</option>
                <option>Off</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notify on stale critical assets</Label>
              <select className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Notify on stale critical assets">
                <option>Immediately</option>
                <option>Hourly digest</option>
                <option>Daily digest</option>
                <option>Off</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Ownership attestation overdue</Label>
              <Input type="number" min={1} defaultValue={14} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label>Auto-escalate after (hours)</Label>
              <Input type="number" min={1} defaultValue={48} className="bg-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Default notification channel</Label>
            <select className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Default notification channel">
              <option>Security Operations</option>
              <option>IT Operations</option>
              <option>Email only</option>
              <option>Webhook</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Create tickets for SLA breaches</Label>
              <p className="text-xs text-muted-foreground">
                Open a case when lifecycle SLAs are missed.
              </p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Notification Settings</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Decommission Policy</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define how long to retain asset history after decommissioning.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Retention after decommission (days)</Label>
            <Input type="number" min={1} defaultValue={365} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Approval notes template</Label>
            <Textarea
              placeholder="Reason for decommission, approval reference, change ticket..."
              className="bg-input min-h-[80px] resize-none"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Lifecycle Settings</Button>
        </div>
      </div>
    </div>
  );
}
