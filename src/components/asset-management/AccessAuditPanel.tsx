import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function AccessAuditPanel() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Role-Based Access Control</h3>
          <p className="text-sm text-muted-foreground">
            Limit visibility of sensitive asset data by role.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">SOC Analyst</p>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">View asset inventory</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">View identity details</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Modify asset tags</Label>
              <Switch />
            </div>
            <div className="pt-2 border-t border-border/30">
              <Label htmlFor="soc-scope" className="text-[10px] uppercase text-muted-foreground">Asset Group Scope</Label>
              <select id="soc-scope" className="w-full mt-1 text-xs bg-transparent border border-border rounded px-2 py-1" aria-label="SOC Analyst Asset Group Scope">
                <option>All Assets (Global)</option>
                <option>Regional: EMEA</option>
                <option>Regional: APAC</option>
                <option>Department: Finance</option>
              </select>
            </div>
          </div>
          <div className="border border-border/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Network Admin</p>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Configure collectors</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Manage integrations</Label>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Edit identity rules</Label>
              <Switch defaultChecked />
            </div>
            <div className="pt-2 border-t border-border/30">
              <Label htmlFor="admin-scope" className="text-[10px] uppercase text-muted-foreground">Asset Group Scope</Label>
              <select id="admin-scope" className="w-full mt-1 text-xs bg-transparent border border-border rounded px-2 py-1" aria-label="Network Admin Asset Group Scope">
                <option>All Assets (Global)</option>
                <option>Infrastructure Only</option>
                <option>Security Tools Only</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Audit Logging</h3>
          <p className="text-sm text-muted-foreground">
            Track configuration and asset changes for compliance.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Log asset changes</Label>
              <p className="text-xs text-muted-foreground">Tag, owner, and classification updates.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Log policy edits</Label>
              <p className="text-xs text-muted-foreground">Rules, trust lists, and detection tuning.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Export audit events to SIEM</Label>
              <p className="text-xs text-muted-foreground">Forward to Splunk, QRadar, or Sentinel.</p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Download Audit Log (CSV)</Button>
          <Button>Save Access Controls</Button>
        </div>
      </div>
    </div>
  );
}
