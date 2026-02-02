import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const integrations = [
  { name: "CMDB (ServiceNow)", status: "Not Connected", description: "Asset ownership, criticality, and business service data." },
  { name: "EDR (Defender)", status: "Connected", description: "Endpoint posture, device health, and isolation status." },
  { name: "Vulnerability Scanner", status: "Connected", description: "Host vulnerabilities, CVE exposure, and patch status." },
  { name: "IAM / Directory", status: "Partial", description: "User identity and login correlation." },
];

export function IntegrationsPanel() {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Enrich assets with context from enterprise systems.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <div key={integration.name} className="border border-border/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-foreground">{integration.name}</h4>
                <Badge variant="outline" className="text-xs">
                  {integration.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{integration.description}</p>
              <Button size="sm" variant="outline">
                Configure
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sync & Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Control how external fields map into NDR asset attributes.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-border/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Sync cadence</p>
            <p className="text-sm font-medium text-foreground">Every 30 minutes</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Conflict policy</p>
            <p className="text-sm font-medium text-foreground">Prefer CMDB owner</p>
          </div>
          <div className="border border-border/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Enrichment coverage</p>
            <p className="text-sm font-medium text-foreground">68% of assets</p>
          </div>
        </div>
      </div>
    </div>
  );
}
