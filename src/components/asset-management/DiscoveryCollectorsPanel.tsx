import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const flowSources = [
  { name: "Core Router 01", type: "NetFlow v9", status: "Healthy", lastSeen: "2m ago", coverage: "DC-1, HQ" },
  { name: "WAN Edge", type: "IPFIX", status: "Degraded", lastSeen: "12m ago", coverage: "WAN" },
  { name: "Branch Aggregator", type: "sFlow", status: "Healthy", lastSeen: "1m ago", coverage: "Branch" },
  { name: "Cloud Sensor", type: "VPC Flow Logs", status: "Healthy", lastSeen: "4m ago", coverage: "AWS" },
];

export function DiscoveryCollectorsPanel() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Discovery Coverage</p>
          <p className="text-2xl font-semibold text-foreground">92%</p>
          <p className="text-[10px] text-muted-foreground">8 subnets uncovered</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Collectors Online</p>
          <p className="text-2xl font-semibold text-foreground">18/20</p>
          <p className="text-[10px] text-muted-foreground">2 degraded</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Flow Sources</p>
          <p className="text-2xl font-semibold text-foreground">42</p>
          <p className="text-[10px] text-muted-foreground">4 critical</p>
        </div>
        <div className="border border-border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground">Ingestion Latency</p>
          <p className="text-2xl font-semibold text-foreground">2m avg</p>
          <p className="text-[10px] text-muted-foreground">12m max</p>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Flow Sources</h3>
            <p className="text-sm text-muted-foreground">
              Monitor health, coverage, and telemetry freshness for each source.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Add Source
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary/30">
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Last Seen</TableHead>
                <TableHead className="text-xs">Coverage</TableHead>
                <TableHead className="text-xs">Sampling Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flowSources.map((source) => (
                <TableRow key={source.name}>
                  <TableCell className="text-sm font-medium">{source.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{source.type}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={source.status === "Healthy" ? "text-primary border-primary/30" : "text-warning border-warning/30"}
                    >
                      {source.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{source.lastSeen}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{source.coverage}</TableCell>
                  <TableCell>
                    <select className="text-[10px] bg-transparent border border-border rounded px-1" aria-label="Sampling rate">
                      <option>1:1 (Full)</option>
                      <option>1:100</option>
                      <option>1:1000</option>
                      <option>1:2000</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Discovery Controls</h3>
          <p className="text-sm text-muted-foreground">
            Tune how assets are identified and retained when flow data is incomplete.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-discover new assets</p>
              <p className="text-xs text-muted-foreground">Create assets from any new flow identity.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Suppress ephemeral assets</p>
              <p className="text-xs text-muted-foreground">Ignore hosts seen for less than 5 minutes.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Require identity correlation</p>
              <p className="text-xs text-muted-foreground">Only promote assets with DNS/DHCP correlation.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
}
