// Unified Dashboard Data - Single source of truth for all dashboard metrics
// All counts MUST reconcile or explicitly state scope differences

import { mockAssetGroups } from './asset-groups-data';

// =============================================================================
// CORE ASSET COUNTS - The canonical source
// =============================================================================

export const ASSET_METRICS = {
  // Total managed host assets in inventory (excludes threat intel/IoC lists)
  TOTAL_MANAGED_ASSETS: 15,
  
  // Lifecycle breakdown (must sum to TOTAL_MANAGED_ASSETS)
  NEW_ASSETS: 3,      // firstSeen within newAssetHighlightDays
  ACTIVE_ASSETS: 11,  // active and not stale
  STALE_ASSETS: 1,    // lastSeen > staleAfterDays
  
  // Ownership breakdown (must sum to TOTAL_MANAGED_ASSETS)
  ASSIGNED_OWNER: 12,
  UNASSIGNED_OWNER: 3,
  OVERDUE_REVIEW: 2,
  
  // Rogue assets (NOT in managed inventory - separate count)
  ROGUE_ASSETS: 5,
} as const;

// Validate that lifecycle counts sum correctly
const lifecycleSum = ASSET_METRICS.NEW_ASSETS + ASSET_METRICS.ACTIVE_ASSETS + ASSET_METRICS.STALE_ASSETS;
if (lifecycleSum !== ASSET_METRICS.TOTAL_MANAGED_ASSETS) {
  console.warn(`[Data Consistency] Lifecycle sum (${lifecycleSum}) !== TOTAL_MANAGED_ASSETS (${ASSET_METRICS.TOTAL_MANAGED_ASSETS})`);
}

// Validate ownership counts
const ownershipSum = ASSET_METRICS.ASSIGNED_OWNER + ASSET_METRICS.UNASSIGNED_OWNER;
if (ownershipSum !== ASSET_METRICS.TOTAL_MANAGED_ASSETS) {
  console.warn(`[Data Consistency] Ownership sum (${ownershipSum}) !== TOTAL_MANAGED_ASSETS (${ASSET_METRICS.TOTAL_MANAGED_ASSETS})`);
}

// =============================================================================
// TIME WINDOWS - Standard time periods for widgets
// =============================================================================

export const TIME_WINDOWS = {
  LAST_24H: 'Last 24h',
  LAST_7D: 'Last 7 days',
  LAST_30D: 'Last 30 days',
  LAST_90D: 'Last 90 days',
} as const;

export const DEFAULT_TIME_WINDOW = TIME_WINDOWS.LAST_24H;

// =============================================================================
// SCOPE DEFINITIONS - Clear explanations for each widget
// =============================================================================

export const WIDGET_DEFINITIONS = {
  DISCOVERY_COVERAGE: {
    title: 'Discovery Coverage',
    definition: 'Percentage of observed network flow sources that are mapped to defined localities and zones.',
    scope: 'All assets',
    computation: '(Assets with locality assignment / Total managed assets) × 100',
  },
  ROGUE_ASSETS: {
    title: 'Rogue Assets',
    definition: 'Devices communicating on the network that are NOT in the managed asset inventory.',
    scope: 'Network-wide',
    categories: [
      { key: 'unmanaged', label: 'Not in inventory', description: 'Device IP/MAC not found in asset database' },
      { key: 'unknown_vendor', label: 'Unknown vendor', description: 'MAC prefix not in IEEE OUI database' },
      { key: 'shadow_it', label: 'Shadow IT', description: 'Personal or unauthorized device on corporate network' },
      { key: 'unauthorized', label: 'Unauthorized', description: 'Device in restricted zone without approval' },
    ],
  },
  MITRE_ATTACK: {
    title: 'MITRE ATT&CK Coverage',
    definition: 'Detection events mapped to MITRE ATT&CK tactics and techniques.',
    scope: 'All detections',
    computation: 'Events are tagged with technique IDs during detection rule evaluation.',
  },
  OWNERSHIP_COVERAGE: {
    title: 'Ownership Coverage',
    definition: 'Percentage of assets with an assigned owner for accountability and incident response.',
    scope: 'All managed assets',
    computation: '(Assets with owner / Total managed assets) × 100',
  },
  LOCALITY_COVERAGE: {
    title: 'Locality Coverage',
    definition: 'Assets mapped to network localities (Internal, DMZ, Cloud, etc.) for segmentation policy.',
    scope: 'All managed assets',
    computation: 'Count of assets per locality type.',
  },
  ZONE_COVERAGE: {
    title: 'Zone Coverage',
    definition: 'Network zones (subnets/VLANs) with defined security policies.',
    scope: 'All defined zones',
    computation: 'Zones with gaps = zones containing assets not matching any group rule.',
  },
  NEW_ASSETS: {
    title: 'New Assets',
    definition: 'Assets first observed within the configured "new asset highlight" window.',
    scope: 'All managed assets',
    computation: 'firstSeen > (now - newAssetHighlightDays)',
  },
  STALE_ASSETS: {
    title: 'Stale Assets',
    definition: 'Assets not observed for longer than the configured staleness threshold.',
    scope: 'All managed assets',
    computation: 'lastSeen < (now - staleAfterDays)',
  },
  HOT_ZONES: {
    title: 'Hot Zones',
    definition: 'Network zones with elevated detection activity or recent asset changes.',
    scope: 'All zones',
    computation: 'Ranked by detection count + new asset arrivals in time window.',
  },
} as const;

// =============================================================================
// ASSET GROUPS DATA - Filtered for dashboard (excludes threat intel)
// =============================================================================

const threatIntelGroupIds = ['grp-known-threat-ips', 'grp-tor-exit-nodes'];
const hostGroups = mockAssetGroups.filter(g => !threatIntelGroupIds.includes(g.id));

export const dashboardGroupsData = hostGroups.map((group, index) => ({
  id: group.id,
  name: group.name,
  count: group.assetCount,
  color: `hsl(var(--chart-${(index % 5) + 1}))`,
  isSystem: group.source === 'system',
  source: group.source,
  status: group.status,
  parentId: group.parentId,
}));

// =============================================================================
// LOCALITY DATA - Must reconcile with TOTAL_MANAGED_ASSETS
// =============================================================================

export interface LocalityData {
  id: string;
  name: string;
  assetCount: number;
  coverage: number; // % of assets in this locality mapped to zones
}

// These counts should sum to TOTAL_MANAGED_ASSETS
export const localitiesData: LocalityData[] = [
  { id: 'loc-internal', name: 'Internal', assetCount: 11, coverage: 100 },
  { id: 'loc-dmz', name: 'DMZ', assetCount: 1, coverage: 100 },
  { id: 'loc-cloud', name: 'Cloud', assetCount: 1, coverage: 100 },
  { id: 'loc-guest', name: 'Guest', assetCount: 1, coverage: 100 },
  { id: 'loc-ot', name: 'OT Network', assetCount: 1, coverage: 85 },
];

// Validate locality sum
const localitySum = localitiesData.reduce((sum, l) => sum + l.assetCount, 0);
if (localitySum !== ASSET_METRICS.TOTAL_MANAGED_ASSETS) {
  console.warn(`[Data Consistency] Locality sum (${localitySum}) !== TOTAL_MANAGED_ASSETS (${ASSET_METRICS.TOTAL_MANAGED_ASSETS})`);
}

// =============================================================================
// ZONE DATA
// =============================================================================

export interface ZoneData {
  id: string;
  name: string;
  localityId: string;
  assetCount: number;
  hasGaps: boolean;
}

export const zonesData: ZoneData[] = [
  { id: 'zone-prod-core', name: 'Production Core', localityId: 'loc-internal', assetCount: 8, hasGaps: false },
  { id: 'zone-dmz-web', name: 'DMZ Web Tier', localityId: 'loc-dmz', assetCount: 1, hasGaps: false },
  { id: 'zone-dev', name: 'Development', localityId: 'loc-internal', assetCount: 2, hasGaps: true },
  { id: 'zone-guest', name: 'Guest Network', localityId: 'loc-guest', assetCount: 1, hasGaps: false },
  { id: 'zone-ot', name: 'OT Segment', localityId: 'loc-ot', assetCount: 1, hasGaps: true },
  { id: 'zone-remote', name: 'Remote Access', localityId: 'loc-internal', assetCount: 2, hasGaps: false },
];

// =============================================================================
// UNCOVERED SUBNETS - Subnets with traffic but no locality/zone mapping
// =============================================================================

export interface UncoveredSubnet {
  cidr: string;
  assetCount: number;
  firstSeen: string;
  lastSeen: string;
  severity: 'high' | 'medium' | 'low';
  suggestedCollector: string;
}

export const uncoveredSubnets: UncoveredSubnet[] = [
  { 
    cidr: '10.50.0.0/24', 
    assetCount: 3, 
    firstSeen: '2026-01-20',
    lastSeen: '2026-02-05',
    severity: 'medium',
    suggestedCollector: 'Add SPAN port on Core-SW-03'
  },
  { 
    cidr: '172.20.5.0/24', 
    assetCount: 2, 
    firstSeen: '2026-01-25',
    lastSeen: '2026-02-04',
    severity: 'low',
    suggestedCollector: 'Deploy sensor in Building B'
  },
];

// =============================================================================
// ROGUE ASSETS
// =============================================================================

export interface RogueAssetEntry {
  ip: string;
  hostname?: string;
  connectionCount: number;
  firstSeen: string;
  lastSeen: string;
  reason: 'unmanaged' | 'unknown_vendor' | 'unauthorized' | 'shadow_it';
  reasonLabel: string;
  suggestedAction: 'assign_owner' | 'tag' | 'investigate' | 'block';
}

export const rogueAssets: RogueAssetEntry[] = [
  { 
    ip: '10.200.0.88', 
    hostname: 'unknown-device-1',
    connectionCount: 342, 
    firstSeen: '2d ago',
    lastSeen: '1h ago',
    reason: 'unmanaged',
    reasonLabel: 'Not in inventory',
    suggestedAction: 'assign_owner'
  },
  { 
    ip: '10.200.0.91', 
    connectionCount: 215, 
    firstSeen: '5d ago',
    lastSeen: '3h ago',
    reason: 'unknown_vendor',
    reasonLabel: 'Unknown vendor MAC',
    suggestedAction: 'investigate'
  },
  { 
    ip: '10.10.99.45', 
    hostname: 'personal-nas',
    connectionCount: 178, 
    firstSeen: '1d ago',
    lastSeen: '30m ago',
    reason: 'shadow_it',
    reasonLabel: 'Shadow IT device',
    suggestedAction: 'tag'
  },
  { 
    ip: '192.168.100.99', 
    connectionCount: 89, 
    firstSeen: '3h ago',
    lastSeen: '5m ago',
    reason: 'unauthorized',
    reasonLabel: 'Unauthorized in DMZ',
    suggestedAction: 'block'
  },
  { 
    ip: '10.200.0.102', 
    connectionCount: 56, 
    firstSeen: '12h ago',
    lastSeen: '2h ago',
    reason: 'unmanaged',
    reasonLabel: 'Not in inventory',
    suggestedAction: 'assign_owner'
  },
];

// =============================================================================
// HOT ZONES
// =============================================================================

export interface HotZone {
  zoneId: string;
  name: string;
  detections: number;
  newAssets: number;
  trend: 'up' | 'down' | 'stable';
  severity: 'high' | 'medium' | 'low';
}

export const hotZones: HotZone[] = [
  { zoneId: 'zone-dmz-web', name: 'DMZ Web Tier', detections: 12, newAssets: 0, trend: 'up', severity: 'high' },
  { zoneId: 'zone-guest', name: 'Guest Network', detections: 8, newAssets: 1, trend: 'up', severity: 'medium' },
  { zoneId: 'zone-remote', name: 'Remote Access', detections: 3, newAssets: 0, trend: 'stable', severity: 'low' },
];

// =============================================================================
// TOP GROUPS BY ROGUES
// =============================================================================

export interface GroupRogue {
  groupId: string;
  name: string;
  rogueCount: number;
  trend: number;
}

export const topGroupsByRogues: GroupRogue[] = [
  { groupId: 'grp-guest', name: 'Guest / BYOD', rogueCount: 3, trend: 1 },
  { groupId: 'grp-cloud', name: 'Cloud Workloads', rogueCount: 1, trend: 0 },
  { groupId: 'grp-internal', name: 'Internal Hosts', rogueCount: 1, trend: 0 },
];

// =============================================================================
// STALE ASSETS BREAKDOWN
// =============================================================================

export interface StaleBreakdown {
  localityId: string;
  locality: string;
  count: number;
}

export const staleBreakdown: StaleBreakdown[] = [
  { localityId: 'loc-internal', locality: 'Internal', count: 1 },
];

export const staleTrendData = [
  { date: 'Mon', count: 1 },
  { date: 'Tue', count: 1 },
  { date: 'Wed', count: 1 },
  { date: 'Thu', count: 1 },
  { date: 'Fri', count: 1 },
  { date: 'Sat', count: 1 },
  { date: 'Sun', count: 1 },
];

// =============================================================================
// NEW ASSETS BY GROUP
// =============================================================================

export interface NewAssetByGroup {
  groupId: string;
  name: string;
  count: number;
}

export const newAssetsByGroup: NewAssetByGroup[] = [
  { groupId: 'grp-guest', name: 'Guest / BYOD', count: 1 },
  { groupId: 'grp-cloud', name: 'Cloud Workloads', count: 1 },
  { groupId: 'grp-workstations', name: 'Workstations', count: 1 },
];

// =============================================================================
// RECENTLY ADDED ASSETS
// =============================================================================

export interface RecentAsset {
  id: string;
  name: string;
  ip: string;
  locality: string;
  addedAgo: string;
}

export const recentlyAddedAssets: RecentAsset[] = [
  { id: 'asset-007', name: 'guest-device-001', ip: '10.200.0.45', locality: 'guest', addedAgo: '3d' },
  { id: 'asset-006', name: 'aws-prod-k8s-node-01', ip: '172.31.10.50', locality: 'cloud', addedAgo: '5d' },
  { id: 'asset-005', name: 'LAPTOP-JSMITH', ip: '10.10.50.125', locality: 'internal', addedAgo: '7d' },
];

// =============================================================================
// MITRE ATT&CK DATA
// =============================================================================

export interface MitreTechnique {
  id: string;
  name: string;
  count: number;
}

export interface MitreTacticEntry {
  tacticId: string;
  tacticName: string;
  techniqueCount: number;
  eventCount: number;
  topTechniques: MitreTechnique[];
}

export const mitreTactics: MitreTacticEntry[] = [
  { 
    tacticId: 'TA0004',
    tacticName: 'Privilege Escalation',
    techniqueCount: 3,
    eventCount: 62,
    topTechniques: [
      { id: 'T1068', name: 'Exploitation for Privilege Escalation', count: 35 },
      { id: 'T1548', name: 'Abuse Elevation Control Mechanism', count: 18 },
      { id: 'T1134', name: 'Access Token Manipulation', count: 9 },
    ]
  },
  { 
    tacticId: 'TA0005',
    tacticName: 'Defense Evasion',
    techniqueCount: 4,
    eventCount: 43,
    topTechniques: [
      { id: 'T1055', name: 'Process Injection', count: 22 },
      { id: 'T1562', name: 'Impair Defenses', count: 12 },
      { id: 'T1070', name: 'Indicator Removal', count: 9 },
    ]
  },
  { 
    tacticId: 'TA0003',
    tacticName: 'Persistence',
    techniqueCount: 2,
    eventCount: 23,
    topTechniques: [
      { id: 'T1053', name: 'Scheduled Task/Job', count: 15 },
      { id: 'T1547', name: 'Boot or Logon Autostart Execution', count: 8 },
    ]
  },
  { 
    tacticId: 'TA0002',
    tacticName: 'Execution',
    techniqueCount: 1,
    eventCount: 8,
    topTechniques: [
      { id: 'T1059', name: 'Command and Scripting Interpreter', count: 8 },
    ]
  },
];

export const getTotalMitreEvents = () => mitreTactics.reduce((sum, t) => sum + t.eventCount, 0);
export const getActiveMitreTactics = () => mitreTactics.filter(t => t.eventCount > 0).length;

// =============================================================================
// THREAT INTEL LISTS (Separate from asset groups)
// =============================================================================

export interface ThreatIntelList {
  id: string;
  name: string;
  entryCount: number;
  lastUpdated: string;
  source: string;
}

export const threatIntelLists: ThreatIntelList[] = [
  { id: 'list-threat-ips', name: 'Known Threat IPs', entryCount: 1247, lastUpdated: '2h ago', source: 'Threat Feed' },
  { id: 'list-tor-nodes', name: 'Tor Exit Nodes', entryCount: 892, lastUpdated: '4h ago', source: 'Tor Project' },
  { id: 'list-c2-domains', name: 'C2 Domains', entryCount: 3421, lastUpdated: '1h ago', source: 'Threat Feed' },
];

// =============================================================================
// TRUST LISTS (For detection tuning)
// =============================================================================

export interface TrustList {
  id: string;
  name: string;
  entryCount: number;
  scope: string;
}

export const trustLists: TrustList[] = [
  { id: 'trust-scanners', name: 'Authorized Scanners', entryCount: 5, scope: 'All Detections' },
  { id: 'trust-backup', name: 'Backup Infrastructure', entryCount: 12, scope: 'Lateral Movement' },
];
