// Mock data for the expanded dashboard widgets
// All counts are now based on the unified asset data for consistency
import { mockAssetGroups } from './asset-groups-data';

// IMPORTANT: These totals represent unified, consistent counts
// - Total managed assets: 15 (from mock-asset-data.ts)
// - The dashboard shows ONLY host assets, excluding threat intel lists
export const TOTAL_MANAGED_ASSETS = 15;

// Filter out threat intel lists from asset groups for the dashboard
// Threat intel (Known Threat IPs, Tor Exit Nodes) are NOT assets - they're IoC lists
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

// Threat intel lists - separate from asset groups
export const threatIntelLists = [
  { id: 'list-threat-ips', name: 'Known Threat IPs', entryCount: 1247, lastUpdated: '2h ago', source: 'Threat Feed' },
  { id: 'list-tor-nodes', name: 'Tor Exit Nodes', entryCount: 892, lastUpdated: '4h ago', source: 'Tor Project' },
  { id: 'list-c2-domains', name: 'C2 Domains', entryCount: 3421, lastUpdated: '1h ago', source: 'Threat Feed' },
];

// Trust/suppress lists - for detection tuning
export const trustLists = [
  { id: 'trust-scanners', name: 'Authorized Scanners', entryCount: 5, scope: 'All Detections' },
  { id: 'trust-backup', name: 'Backup Infrastructure', entryCount: 12, scope: 'Lateral Movement' },
];

export const localitiesData = [
  { name: 'Internal', assetCount: 11, coverage: 100 },
  { name: 'DMZ', assetCount: 1, coverage: 100 },
  { name: 'Cloud', assetCount: 1, coverage: 100 },
  { name: 'Guest', assetCount: 1, coverage: 100 },
  { name: 'OT Network', assetCount: 1, coverage: 85 },
];

export const zonesData = [
  { name: 'Production Core', assetCount: 8, hasGaps: false },
  { name: 'DMZ Web Tier', assetCount: 1, hasGaps: false },
  { name: 'Development', assetCount: 2, hasGaps: true },
  { name: 'Guest Network', assetCount: 1, hasGaps: false },
  { name: 'OT Segment', assetCount: 1, hasGaps: true },
  { name: 'Remote Access', assetCount: 2, hasGaps: false },
];

export const coverageGaps = [
  '10.50.0.0/24',
  '172.20.5.0/24',
];

export const recentlyAddedAssets = [
  { id: 'asset-007', name: 'guest-device-001', ip: '10.200.0.45', locality: 'guest', addedAgo: '3d' },
  { id: 'asset-006', name: 'aws-prod-k8s-node-01', ip: '172.31.10.50', locality: 'cloud', addedAgo: '5d' },
  { id: 'asset-005', name: 'LAPTOP-JSMITH', ip: '10.10.50.125', locality: 'internal', addedAgo: '7d' },
  { id: 'asset-011', name: 'dev-api-01', ip: '10.20.5.25', locality: 'internal', addedAgo: '8d' },
  { id: 'asset-002', name: 'web-prod-01', ip: '192.168.100.10', locality: 'dmz', addedAgo: '10d' },
];

export const hotZones = [
  { name: 'DMZ Web Tier', detections: 12, newAssets: 0, trend: 'up' as const, severity: 'high' as const },
  { name: 'Guest Network', detections: 8, newAssets: 1, trend: 'up' as const, severity: 'medium' as const },
  { name: 'Remote Access', detections: 3, newAssets: 0, trend: 'stable' as const, severity: 'low' as const },
];

export const topGroupsByRogues = [
  { name: 'Guest / BYOD', rogueCount: 3, trend: 1 },
  { name: 'Cloud Workloads', rogueCount: 1, trend: 0 },
  { name: 'Internal Hosts', rogueCount: 1, trend: 0 },
];

export const staleBreakdown = [
  { locality: 'Internal', count: 1 },
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

export const newAssetsByGroup = [
  { name: 'Guest / BYOD', count: 1 },
  { name: 'Cloud Workloads', count: 1 },
  { name: 'Workstations', count: 1 },
];

export const uncoveredSubnets = [
  { cidr: '10.50.0.0/24', assetCount: 3, firstSeen: '2026-01-20', severity: 'medium' as const },
  { cidr: '172.20.5.0/24', assetCount: 2, firstSeen: '2026-01-25', severity: 'low' as const },
];

// Rogue assets with clear definitions and actionable data
// Definition: Assets communicating with the network but NOT in the managed asset inventory
export interface RogueAssetEntry {
  ip: string;
  hostname?: string;
  connectionCount: number;
  firstSeen: string;
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
    reason: 'unmanaged',
    reasonLabel: 'Not in inventory',
    suggestedAction: 'assign_owner'
  },
  { 
    ip: '10.200.0.91', 
    connectionCount: 215, 
    firstSeen: '5d ago',
    reason: 'unknown_vendor',
    reasonLabel: 'Unknown vendor MAC',
    suggestedAction: 'investigate'
  },
  { 
    ip: '10.10.99.45', 
    hostname: 'personal-nas',
    connectionCount: 178, 
    firstSeen: '1d ago',
    reason: 'shadow_it',
    reasonLabel: 'Shadow IT device',
    suggestedAction: 'tag'
  },
  { 
    ip: '192.168.100.99', 
    connectionCount: 89, 
    firstSeen: '3h ago',
    reason: 'unauthorized',
    reasonLabel: 'Unauthorized in DMZ',
    suggestedAction: 'block'
  },
  { 
    ip: '10.200.0.102', 
    connectionCount: 56, 
    firstSeen: '12h ago',
    reason: 'unmanaged',
    reasonLabel: 'Not in inventory',
    suggestedAction: 'assign_owner'
  },
];

// MITRE ATT&CK with ACCURATE tactic and technique mapping
// Each entry uses proper MITRE tactic IDs and technique codes
export interface MitreTacticEntry {
  tacticId: string;       // e.g., TA0001
  tacticName: string;     // e.g., Initial Access
  techniqueCount: number; // Number of unique techniques observed
  eventCount: number;     // Total events for this tactic
  topTechniques: Array<{
    id: string;           // e.g., T1566
    name: string;         // e.g., Phishing
    count: number;
  }>;
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
  { 
    tacticId: 'TA0010',
    tacticName: 'Exfiltration',
    techniqueCount: 1,
    eventCount: 5,
    topTechniques: [
      { id: 'T1041', name: 'Exfiltration Over C2 Channel', count: 5 },
    ]
  },
  { 
    tacticId: 'TA0011',
    tacticName: 'Command and Control',
    techniqueCount: 2,
    eventCount: 4,
    topTechniques: [
      { id: 'T1071', name: 'Application Layer Protocol', count: 3 },
      { id: 'T1573', name: 'Encrypted Channel', count: 1 },
    ]
  },
];

// Helper to get total MITRE events
export const getTotalMitreEvents = () => mitreTactics.reduce((sum, t) => sum + t.eventCount, 0);
export const getActiveMitreTactics = () => mitreTactics.filter(t => t.eventCount > 0).length;
