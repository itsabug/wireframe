import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const duplicateCandidates = [
  { id: "dup-1", name: "CentralServer-01", ip: "10.0.0.10", confidence: "High" },
  { id: "dup-2", name: "CentralServer-01", ip: "10.0.0.11", confidence: "Medium" },
];

export function IdentityResolutionPanel() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Identity Resolution</h3>
          <p className="text-sm text-muted-foreground">
            Control how NDR merges identities across DHCP, DNS, MAC, and flow telemetry.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Auto-merge confidence threshold</Label>
            <Input type="number" min={50} max={100} defaultValue={85} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Identity decay window (days)</Label>
            <Input type="number" min={1} defaultValue={30} className="bg-input" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Prefer DHCP hostname over DNS</p>
              <p className="text-xs text-muted-foreground">Reduce conflicts in dynamic networks.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Allow MAC-based merge across IPs</p>
              <p className="text-xs text-muted-foreground">Useful for mobile/roaming devices.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Block merges for high-risk assets</p>
              <p className="text-xs text-muted-foreground">Force manual review for crown jewels.</p>
            </div>
            <Switch />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>Save Resolution Rules</Button>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Potential Duplicates</h3>
          <p className="text-sm text-muted-foreground">
            Review high-confidence identity collisions detected in the last 24 hours.
          </p>
        </div>
        <div className="space-y-3">
          {duplicateCandidates.map((candidate) => (
            <div key={candidate.id} className="flex items-center justify-between border border-border/50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-foreground">{candidate.name}</p>
                <p className="text-xs text-muted-foreground">{candidate.ip}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {candidate.confidence}
                </Badge>
                <Button size="sm" variant="outline" aria-label={`Review duplicate candidate ${candidate.name}`}>
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
