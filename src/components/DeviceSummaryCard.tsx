import { Asset } from "@/types/asset";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info, Server, MapPin, Clock, Wifi, Cable, Link2, Edit3, User, Users, Shield, History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getStaleInfo } from "@/lib/asset-lifecycle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddressHistorySheet } from "./AddressHistorySheet";

interface DeviceSummaryCardProps {
  asset: Asset;
}

const InfoRow = ({ label, value, tooltip, editable }: { label: string; value: React.ReactNode; tooltip?: string; editable?: boolean }) => (
  <div className="flex items-start justify-between py-1.5 border-b border-border/50 last:border-0">
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
    <div className="flex items-center gap-1.5">
      <div className="text-xs font-medium text-foreground text-right max-w-[180px] truncate">{value}</div>
      {editable && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground/50 hover:text-primary transition-colors">
              <Edit3 className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Click to edit manually</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  </div>
);

const IntegrationBanner = ({ description }: { description: string }) => (
  <div className="flex items-center gap-2 p-2 bg-primary/5 border border-dashed border-primary/30 rounded-lg mb-2">
    <Link2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
    <p className="text-[10px] text-muted-foreground flex-1">{description}</p>
    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2">
      Connect
    </Button>
  </div>
);

const formatLabel = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const DeviceSummaryCard = ({ asset }: DeviceSummaryCardProps) => {
  const { staleAfterDays } = useLifecycleSettings();
  const { isStale, staleDays } = getStaleInfo(asset.lastSeen, staleAfterDays);
  const statusLabel =
    isStale && staleDays !== null ? `Stale ${staleDays}d` : formatLabel(asset.status);

  const currentIP = asset.ipHistory.find(ip => ip.isCurrent);
  const currentMAC = asset.macHistory.find(mac => mac.isCurrent);

  // Determine if integration data is available (simulated check)
  const hasNMSIntegration = !!(asset.connectedSwitch || asset.switchPort);
  const hasWirelessIntegration = !!(asset.accessPoint || asset.ssid);
  const hasDeviceTypeData = !!(asset.deviceType && asset.deviceType !== 'Unknown');
  const hasRoleData = !!(asset.roleTag && asset.roleTag !== 'Unknown');
  const hasGovernance =
    asset.status ||
    asset.criticality ||
    asset.locality ||
    asset.exposure ||
    (asset.groupNames && asset.groupNames.length > 0) ||
    asset.lifecycleStatus;

  return (
    <div className="panel-card h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="section-title mb-0">Asset Summary</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Device summary from network traffic analysis and optional integrations</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-4">
        {/* Section 1: Network Identity */}
        <div className="space-y-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">
              Network Identity
            </Badge>
          </div>
          
          <InfoRow label="Hostname" value={asset.hostname} tooltip="Hostname detected from DNS queries, DHCP, or NetBIOS" />
          
          {/* Current IP with sheet for history */}
          <div className="py-1.5 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">IP Address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium">{currentIP?.value}</span>
                {asset.ipHistory.length >= 1 && (
                  <AddressHistorySheet ipHistory={asset.ipHistory} macHistory={asset.macHistory} defaultTab="ip">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/60 hover:text-primary transition-colors">
                          <History className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">View address history</p>
                      </TooltipContent>
                    </Tooltip>
                  </AddressHistorySheet>
                )}
              </div>
            </div>
          </div>

          {/* Current MAC with sheet for history */}
          <div className="py-1.5 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">MAC Address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-medium">{currentMAC?.value}</span>
                {asset.macHistory.length >= 1 && (
                  <AddressHistorySheet ipHistory={asset.ipHistory} macHistory={asset.macHistory} defaultTab="mac">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="text-muted-foreground/60 hover:text-primary transition-colors">
                          <History className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p className="text-xs">View address history</p>
                      </TooltipContent>
                    </Tooltip>
                  </AddressHistorySheet>
                )}
              </div>
            </div>
          </div>

          {asset.network && (
            <InfoRow label="Network" value={asset.network} tooltip="Network or zone assigned to this asset" />
          )}
          {asset.interfaceType && (
            <InfoRow label="Interface" value={asset.interfaceType} tooltip="Primary interface type" />
          )}
          {asset.dhcpServer && (
            <InfoRow label="DHCP Server" value={asset.dhcpServer} tooltip="DHCP server leasing the address" />
          )}
          {asset.dnsServer && (
            <InfoRow label="DNS Server" value={asset.dnsServer} tooltip="Primary DNS resolver observed" />
          )}

          {/* First/Last Seen - from packet data */}
          <div className="grid grid-cols-2 gap-2 py-2">
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">First Seen</p>
                <p className="text-xs font-mono">{asset.firstSeen}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Last Seen</p>
                <p className="text-xs font-mono">{asset.lastSeen.split(' ')[1]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Device & Infrastructure Details (from Integration) */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-warning/10 text-warning border-warning/30">
              Device & Infrastructure Details
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">Device classification and infrastructure details - auto-populated via OpManager Plus integration or enter manually</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Show integration banner if no integration data */}
          {!hasDeviceTypeData && !hasRoleData && !hasNMSIntegration && !hasWirelessIntegration && (
            <IntegrationBanner description="Connect OpManager Plus to auto-populate device and infrastructure details" />
          )}

          {/* Device Classification - always show fields */}
          <div className="space-y-0 bg-secondary/30 rounded-lg p-2 mb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Classification</p>
            <InfoRow 
              label="Device Type" 
              value={hasDeviceTypeData ? asset.deviceType : <span className="text-muted-foreground/50 italic">Not specified</span>} 
              tooltip="Device classification - auto-populated via integration or enter manually"
              editable
            />
            <InfoRow 
              label="Role" 
              value={hasRoleData ? asset.roleTag : <span className="text-muted-foreground/50 italic">Not specified</span>} 
              tooltip="Assigned role - auto-populated via integration or enter manually"
              editable
            />
            <InfoRow 
              label="Category" 
              value={asset.category || <span className="text-muted-foreground/50 italic">Not specified</span>} 
              tooltip="Asset category for grouping"
              editable
            />
          </div>

          <div className="space-y-0 bg-secondary/30 rounded-lg p-2 mb-2">
            <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">System Profile</p>
            <InfoRow
              label="OS"
              value={
                asset.osName
                  ? `${asset.osName}${asset.osVersion ? ` ${asset.osVersion}` : ""}`
                  : <span className="text-muted-foreground/50 italic">Not specified</span>
              }
              tooltip="Operating system identified from network telemetry or integration"
              editable
            />
            <InfoRow
              label="Vendor"
              value={asset.vendor || <span className="text-muted-foreground/50 italic">Not specified</span>}
              tooltip="Hardware vendor"
              editable
            />
            <InfoRow
              label="Model"
              value={asset.model || <span className="text-muted-foreground/50 italic">Not specified</span>}
              tooltip="Hardware model"
              editable
            />
            <InfoRow
              label="Serial"
              value={asset.serial || <span className="text-muted-foreground/50 italic">Not specified</span>}
              tooltip="Device serial number"
              editable
            />
          </div>

          {/* Infrastructure - Wired */}
          {asset.connectionType === 'wired' && (
            <div className="space-y-0 bg-secondary/30 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Cable className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground font-medium">Wired Connection</p>
              </div>
              <InfoRow 
                label="Switch" 
                value={hasNMSIntegration && asset.connectedSwitch ? asset.connectedSwitch : <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Connected switch - auto-populated via integration or enter manually"
                editable
              />
              <InfoRow 
                label="Port" 
                value={hasNMSIntegration && asset.switchPort ? asset.switchPort : <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Switch port - auto-populated via integration or enter manually"
                editable
              />
              <InfoRow 
                label="VLAN" 
                value={asset.vlan || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="VLAN assignment"
                editable
              />
              <InfoRow 
                label="Subnet" 
                value={asset.subnet || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="IP subnet"
                editable
              />
              <InfoRow 
                label="Gateway" 
                value={asset.gateway || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Default gateway"
                editable
              />
            </div>
          )}

          {/* Infrastructure - Wireless */}
          {asset.connectionType === 'wireless' && (
            <div className="space-y-0 bg-secondary/30 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Wifi className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground font-medium">Wireless Connection</p>
              </div>
              <InfoRow 
                label="SSID" 
                value={hasWirelessIntegration && asset.ssid ? asset.ssid : <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Wireless network name - auto-populated via integration or enter manually"
                editable
              />
              <InfoRow 
                label="Access Point" 
                value={hasWirelessIntegration && asset.accessPoint ? (
                  <div className="text-right">
                    <div>{asset.accessPoint}</div>
                    {asset.accessPointMac && (
                      <div className="text-[10px] font-mono text-muted-foreground">{asset.accessPointMac}</div>
                    )}
                  </div>
                ) : <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Connected access point - auto-populated via integration or enter manually"
                editable
              />
              {hasWirelessIntegration && asset.frequency && (
                <InfoRow 
                  label="Frequency" 
                  value={`${asset.frequency} (Ch ${asset.channel})`} 
                  tooltip="Wireless frequency band and channel" 
                />
              )}
              {hasWirelessIntegration && asset.signalStrength !== undefined && (
                <InfoRow 
                  label="Signal" 
                  value={
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((bar) => (
                          <div 
                            key={bar} 
                            className={cn(
                              "w-1 rounded-sm",
                              bar === 1 ? "h-1" : bar === 2 ? "h-2" : bar === 3 ? "h-3" : bar === 4 ? "h-3.5" : "h-4",
                              asset.signalStrength! >= -50 ? (bar <= 5 ? "bg-success" : "bg-muted") :
                              asset.signalStrength! >= -60 ? (bar <= 4 ? "bg-success" : "bg-muted") :
                              asset.signalStrength! >= -70 ? (bar <= 3 ? "bg-warning" : "bg-muted") :
                              asset.signalStrength! >= -80 ? (bar <= 2 ? "bg-destructive" : "bg-muted") :
                              (bar <= 1 ? "bg-destructive" : "bg-muted")
                            )}
                          />
                        ))}
                      </div>
                      <span>{asset.signalStrength} dBm</span>
                    </div>
                  } 
                  tooltip={`Signal strength: ${asset.signalStrength} dBm${asset.snr ? `, SNR: ${asset.snr} dB` : ''}`} 
                />
              )}
              {hasWirelessIntegration && asset.authMethod && (
                <InfoRow 
                  label="Security" 
                  value={
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-success/10 text-success border-success/30">
                      {asset.authMethod}
                    </Badge>
                  } 
                  tooltip={`Authentication: ${asset.authMethod}${asset.encryptionType ? `, Encryption: ${asset.encryptionType}` : ''}`} 
                />
              )}
              <InfoRow 
                label="VLAN" 
                value={asset.vlan || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="VLAN assignment"
                editable
              />
              <InfoRow 
                label="Subnet" 
                value={asset.subnet || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="IP subnet"
                editable
              />
              <InfoRow 
                label="Gateway" 
                value={asset.gateway || <span className="text-muted-foreground/50 italic">Not specified</span>} 
                tooltip="Default gateway"
                editable
              />
            </div>
          )}
        </div>

        {/* Section 4: Governance & Exposure */}
        {hasGovernance && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 bg-secondary/60 text-foreground border-border"
              >
                <Shield className="h-3 w-3 mr-1" />
                Governance
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0",
                    isStale && "text-warning bg-warning/10 border-warning/30",
                  )}
                >
                  {statusLabel}
                </Badge>
                {asset.criticality && (
                  <Badge className={`badge-${asset.criticality} text-[10px] px-2 py-0`}>
                    {formatLabel(asset.criticality)}
                  </Badge>
                )}
                {asset.locality && (
                  <Badge className={`badge-${asset.locality} text-[10px] px-2 py-0`}>
                    {formatLabel(asset.locality)}
                  </Badge>
                )}
                {asset.lifecycleStatus && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    {formatLabel(asset.lifecycleStatus)}
                  </Badge>
                )}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Groups</p>
                {asset.groupNames && asset.groupNames.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {asset.groupNames.map((group) => (
                      <Badge key={group} variant="secondary" className="text-[10px] px-2 py-0">
                        {group}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No groups assigned</p>
                )}
              </div>

              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Trust List</p>
                {asset.trustListEntries && asset.trustListEntries.length > 0 ? (
                  <div className="space-y-1.5">
                    {asset.trustListEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between text-xs">
                        <span className="text-foreground">
                          {formatLabel(entry.type)} ({entry.scope})
                        </span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {entry.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No trust list exceptions</p>
                )}
              </div>

              {asset.exposure && (
                <div className="space-y-0 bg-secondary/30 rounded-lg p-2">
                  <p className="text-[10px] text-muted-foreground mb-1.5 font-medium">Exposure</p>
                  <InfoRow
                    label="Public IP"
                    value={asset.exposure.hasPublicIP ? asset.exposure.publicIPs?.join(", ") || "Yes" : "No"}
                  />
                  <InfoRow
                    label="Inbound Internet"
                    value={asset.exposure.hasInboundInternet ? "Yes" : "No"}
                  />
                  <InfoRow label="NAT" value={asset.exposure.isNATed ? "Yes" : "No"} />
                  <InfoRow
                    label="Exposed Ports"
                    value={asset.exposure.exposedPorts?.length ? asset.exposure.exposedPorts.join(", ") : "None"}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 5: Users (from Identity protocols - Kerberos, NTLM, LDAP, RADIUS) */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
              <Users className="h-3 w-3 mr-1" />
              Users
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground/60 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">User accounts seen authenticating from this device via Kerberos, NTLM, LDAP, or RADIUS protocols</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {asset.userLogins && asset.userLogins.length > 0 ? (
            <div className="space-y-1.5">
              {asset.userLogins.slice(0, 4).map((login) => (
                <div key={login.id} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg group hover:bg-secondary/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">
                        {login.domain ? `${login.domain}\\${login.username}` : login.username}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Last: {login.lastSeen.split(' ')[0]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-help">
                          {login.authType}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="text-xs">{login.loginCount} logins since {login.firstSeen.split(' ')[0]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
              {asset.userLogins.length > 4 && (
                <button className="w-full text-xs text-primary hover:underline py-1">
                  +{asset.userLogins.length - 4} more users
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-xs text-muted-foreground italic">No user logins detected</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">User logins are captured from Kerberos, NTLM, LDAP, RADIUS traffic</p>
            </div>
          )}
        </div>

        {/* Section 6: Location (Integration or Manual) */}
        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-[10px] text-muted-foreground">Location</p>
              <p className="text-xs font-medium">{asset.location || 'Not specified'}</p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/50 hover:text-primary transition-colors">
                  <Edit3 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Click to edit location</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Management Tools Detected */}
        {asset.managementTools.length > 0 && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Management Detected</p>
            <div className="flex flex-wrap gap-1.5">
              {asset.managementTools.map((tool, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Badge variant="secondary" className="text-xs cursor-help">
                      {tool}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Detected via network traffic analysis</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
