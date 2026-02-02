export interface Asset {
  id: string;
  name: string;
  owner: string;
  ip: string;
  mac: string;
  hostname: string;
  deviceType: string;
  roleTag: string;
  status: 'online' | 'offline' | 'unknown';
  threatScore: number;
  confidenceScore: number;
  blastRadiusScore: number;
  firstSeen: string;
  lastSeen: string;
  category: string;
  location: string;
  network: string;
  interfaceType: string;
  osName?: string;
  osVersion?: string;
  vendor?: string;
  model?: string;
  serial?: string;
  criticality?: 'critical' | 'high' | 'medium' | 'low';
  locality?: 'internal' | 'external' | 'dmz' | 'cloud' | 'partner' | 'guest';
  exposure?: {
    hasPublicIP: boolean;
    publicIPs?: string[];
    hasInboundInternet: boolean;
    isNATed: boolean;
    exposedPorts?: number[];
  };
  groupIds?: string[];
  groupNames?: string[];
  lifecycleStatus?: 'active' | 'stale' | 'decommissioned' | 'unknown';
  trustListEntries?: {
    id: string;
    type: string;
    scope: string;
    reason?: string;
    isActive: boolean;
  }[];
  ipHistory: HistoryItem[];
  hostnameHistory: HistoryItem[];
  macHistory: HistoryItem[];
  managementTools: string[];
  // NMS/IPAM Integration
  connectionType: 'wired' | 'wireless' | 'unknown';
  connectedSwitch?: string;
  switchPort?: string;
  vlan?: string;
  subnet?: string;
  dhcpServer?: string;
  dnsServer?: string;
  gateway?: string;
  // Wireless specific
  ssid?: string;
  accessPoint?: string;
  accessPointMac?: string;
  channel?: number;
  frequency?: string;
  signalStrength?: number;
  noiseLevel?: number;
  snr?: number;
  authMethod?: string;
  encryptionType?: string;
  // Tags and Comments
  tags?: string[];
  comments?: AssetComment[];
  // User logins seen from this device
  userLogins?: UserLogin[];
  riskFactors?: RiskFactor[];
}

export interface RiskFactor {
  id: string;
  name: string;
  scoreContribution: number;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface AssetComment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface UserLogin {
  id: string;
  username: string;
  domain?: string;
  authType: 'Kerberos' | 'NTLM' | 'LDAP' | 'RADIUS' | 'Other';
  lastSeen: string;
  firstSeen: string;
  loginCount: number;
}

export interface HistoryItem {
  value: string;
  timestamp: string;
  isCurrent: boolean;
}

export interface TrafficStats {
  inbound: number;
  outbound: number;
  unit: string;
  changePercent?: number;
}

export interface FlowData {
  id: string;
  sourceIp: string;
  destIp: string;
  sourcePort: number;
  destPort: number;
  protocol: string;
  bytes: number;
  packets: number;
  timestamp: string;
  application: string;
  direction: 'inbound' | 'outbound';
}

export interface ThreatEvent {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp: string;
  description: string;
  mitreCategory?: string;
  mitreId?: string;
}

export interface Peer {
  id: string;
  name: string;
  ip: string;
  location: string;
  type: 'internal' | 'external';
  category: string;
  connectionCount: number;
  isNew?: boolean;
}

export interface MitreCategory {
  name: string;
  count: number;
  tactics: string[];
}

export interface ProtocolBreakdown {
  tcp: number;
  udp: number;
  icmp: number;
  other: number;
  unknownApps: string[];
}

export interface AnomalyDetail {
  id: string;
  type: string;
  description: string;
  confidence: number;
  timestamp: string;
  mitreId?: string;
  mitreCategory?: string;
}

export interface ApplicationData {
  id: string;
  name: string;
  category: string;
  bytes: number;
  packets: number;
  sessions: number;
  risk: 'low' | 'medium' | 'high';
}

export interface ConversationData {
  id: string;
  sourceIp: string;
  destIp: string;
  application: string;
  duration: string;
  bytesIn: number;
  bytesOut: number;
  startTime: string;
}

export interface QoSData {
  id: string;
  application: string;
  latency: number;
  jitter: number;
  packetLoss: number;
  mos: number;
}

export interface TimelineEvent {
  id: string;
  type: 'network' | 'security' | 'identity' | 'peer';
  title: string;
  description: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
}

export interface ChangeHistoryItem {
  id: string;
  changeType: 'ip' | 'mac' | 'hostname' | 'peer' | 'port' | 'vlan' | 'traffic';
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export interface NetworkBehavior {
  bandwidthToday: number;
  bandwidthYesterday: number;
  flowCountToday: number;
  flowCountYesterday: number;
  uniquePeersToday: number;
  uniquePeersYesterday: number;
  newPeersToday: number;
}

// Protocol Activity Types
export interface ProtocolTimeSeriesPoint {
  time: string;
  inbound: number;
  outbound: number;
}

export interface ProtocolActivityData {
  protocol: string;
  totalConnections: number;
  activeConnections: number;
  inboundBytes: number;
  outboundBytes: number;
  inboundPackets: number;
  outboundPackets: number;
  avgRtt: number;
  medianRtt: number;
  p95Rtt: number;
  timeSeries: ProtocolTimeSeriesPoint[];
}

export interface ProtocolStats {
  accepted: number;
  connected: number;
  externalAccepted: number;
  externalConnected: number;
  closed: number;
  abortedIn: number;
  abortedOut: number;
}

// DNS-specific types
export interface DNSQueryDomain {
  domain: string;
  count: number;
  color: string;
}

export interface DNSQueryType {
  type: string;
  count: number;
  color: string;
}

export interface DNSFailedQuery {
  errorType: string;
  totalQueries: number;
  failures: number;
  failureRate: string;
}

export interface DNSClient {
  name: string;
  count: number;
  color: string;
}

export interface DNSResponseCode {
  code: string;
  count: number;
  color: string;
}

export interface DNSData {
  totalQueries: number;
  uniqueDomains: number;
  totalErrors: number;
  avgResponseTime: number;
  topQueryType: string;
  topQueriedDomains: DNSQueryDomain[];
  queryTypeDistribution: DNSQueryType[];
  failedQueries: DNSFailedQuery[];
  serverProcessingTime: { time: string; value: number; p95?: number }[];
  topClientsByVolume: DNSClient[];
  responseCodeDistribution: DNSResponseCode[];
}

// DHCP-specific types
export interface DHCPClient {
  clientMac: string;
  hostName: string;
  requests: number;
}

export interface DHCPClientError {
  clientMac: string;
  hostName: string;
  errors: number;
}

export interface DHCPLeasedClient {
  clientMac: string;
  clientIp: string;
  hostName: string;
  leaseStartTime: string;
}

export interface DHCPClientResponseTime {
  clientMac: string;
  hostName: string;
  responseTime: number;
}

export interface DHCPData {
  totalRequests: number;
  uniqueClients: number;
  failureRate: string;
  avgResponseTime: number;
  topClientsByRequest: DHCPClient[];
  responseTimeTrend: { time: string; value: number; p95?: number }[];
  topClientsByError: DHCPClientError[];
  recentLeasedClients: DHCPLeasedClient[];
  topClientsByResponseTime: DHCPClientResponseTime[];
}
