import { Asset } from "@/types/asset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Link2, Layers, AlertTriangle } from "lucide-react";

const formatLabel = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatBytes = (bytes: number): string => {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const IdentityConfidenceCard = ({ asset }: { asset: Asset }) => {
  const evidenceSources = [
    asset.dhcpServer ? "DHCP" : null,
    asset.dnsServer ? "DNS" : null,
    asset.hostname ? "NetBIOS/DNS" : null,
    asset.mac ? "ARP" : null,
    asset.ip ? "Flow" : null,
  ].filter(Boolean) as string[];

  const confidenceLabel =
    asset.confidenceScore >= 85 ? "High" : asset.confidenceScore >= 65 ? "Medium" : "Low";

  return (
    <div className="panel-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Identity Confidence</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {confidenceLabel} ({asset.confidenceScore}%)
        </Badge>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        <p>
          Identity resolution uses multiple telemetry sources to correlate hostnames, IPs, and
          MACs.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {evidenceSources.map((source) => (
            <Badge key={source} variant="secondary" className="text-[10px]">
              {source}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" className="h-7 text-xs">
            Request Merge
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs">
            Split Asset
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ExposureSummaryCard = ({ asset }: { asset: Asset }) => {
  const exposure = asset.exposure;
  const hasExposure = Boolean(exposure);

  return (
    <div className="panel-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Exposure & Attack Surface</h3>
        </div>
        {hasExposure && exposure?.hasPublicIP && (
          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/30">
            Public Exposure
          </Badge>
        )}
      </div>
      {hasExposure ? (
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Public IP</span>
            <span className="text-foreground">
              {exposure?.hasPublicIP ? exposure.publicIPs?.join(", ") || "Yes" : "No"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Inbound Internet</span>
            <span className="text-foreground">{exposure?.hasInboundInternet ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>NAT</span>
            <span className="text-foreground">{exposure?.isNATed ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Exposed Ports</span>
            <span className="text-foreground">
              {exposure?.exposedPorts?.length ? exposure.exposedPorts.join(", ") : "None"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          Exposure analysis is not available. Enable flow sources and NAT mappings to enrich
          attack surface data.
        </div>
      )}
    </div>
  );
};

export const IntegrationStatusCard = ({ asset }: { asset: Asset }) => {
  const integrations = [
    { name: "EDR", status: asset.managementTools.includes("EDR") ? "Connected" : "Not Connected" },
    { name: "CMDB", status: "Not Connected" },
    { name: "Vulnerability Scanner", status: "Connected" },
    { name: "IAM/Directory", status: asset.userLogins?.length ? "Connected" : "Partial" },
  ];

  return (
    <div className="panel-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Security Context</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {asset.managementTools.length} sources
        </Badge>
      </div>
      <div className="space-y-2 text-xs text-muted-foreground">
        {integrations.map((integration) => (
          <div key={integration.name} className="flex items-center justify-between">
            <span>{integration.name}</span>
            <span className="text-foreground">{integration.status}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" className="h-7 text-xs">
            Configure Integrations
          </Button>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            <span>Some sources missing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DependencySummaryCard = ({ asset }: { asset: Asset }) => {
  const dependencies = [
    { name: "Active Directory", impact: "High", traffic: 2_400_000 },
    { name: "DNS Core", impact: "Medium", traffic: 620_000 },
    { name: "Backup Cluster", impact: "Medium", traffic: 410_000 },
  ];

  return (
    <div className="panel-card h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Service Dependencies</h3>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {dependencies.length} linked services
        </Badge>
      </div>
      <div className="space-y-2">
        {dependencies.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <span className="text-foreground">{item.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {formatLabel(item.impact)}
              </Badge>
              <span className="text-muted-foreground">{formatBytes(item.traffic)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
