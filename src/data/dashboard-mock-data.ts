// Mock data for the expanded dashboard widgets
import { mockAssetGroups } from './asset-groups-data';

export const dashboardGroupsData = mockAssetGroups.map((group, index) => ({
  id: group.id,
  name: group.name,
  count: group.assetCount,
  color: `hsl(var(--chart-${(index % 5) + 1}))`,
  isSystem: group.source === 'system',
}));

export const assetTypeDistribution = [
  { name: 'Server', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Workstation', value: 28, color: 'hsl(var(--chart-2))' },
  { name: 'Network Device', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Cloud Instance', value: 8, color: 'hsl(var(--chart-4))' },
  { name: 'IoT', value: 5, color: 'hsl(var(--chart-5))' },
  { name: 'Mobile', value: 4, color: 'hsl(var(--chart-1))' },
];

export const localitiesData = [
  { name: 'Internal', assetCount: 142, coverage: 95 },
  { name: 'DMZ', assetCount: 23, coverage: 88 },
  { name: 'Cloud', assetCount: 45, coverage: 92 },
  { name: 'External', assetCount: 18, coverage: 100 },
  { name: 'Guest', assetCount: 12, coverage: 70 },
];

export const zonesData = [
  { name: 'Production Core', assetCount: 67, hasGaps: false },
  { name: 'DMZ Web Tier', assetCount: 23, hasGaps: false },
  { name: 'Development', assetCount: 45, hasGaps: true },
  { name: 'Guest Network', assetCount: 12, hasGaps: true },
  { name: 'IoT Segment', assetCount: 8, hasGaps: false },
  { name: 'Remote Access', assetCount: 15, hasGaps: false },
];

export const coverageGaps = [
  '10.50.0.0/24',
  '172.20.5.0/24',
  '192.168.200.0/24',
];

export const recentlyAddedAssets = [
  { id: 'asset-007', name: 'guest-device-001', ip: '10.200.0.45', locality: 'guest', addedAgo: '3d' },
  { id: 'asset-006', name: 'aws-prod-k8s-node-01', ip: '172.31.10.50', locality: 'cloud', addedAgo: '5d' },
  { id: 'asset-005', name: 'LAPTOP-JSMITH', ip: '10.10.50.125', locality: 'internal', addedAgo: '7d' },
  { id: 'asset-011', name: 'dev-api-01', ip: '10.20.5.25', locality: 'internal', addedAgo: '8d' },
  { id: 'asset-002', name: 'web-prod-01', ip: '192.168.100.10', locality: 'dmz', addedAgo: '10d' },
];

export const hotZones = [
  { name: 'DMZ Web Tier', detections: 45, newAssets: 3, trend: 'up' as const, severity: 'high' as const },
  { name: 'Guest Network', detections: 28, newAssets: 8, trend: 'up' as const, severity: 'medium' as const },
  { name: 'Remote Access', detections: 12, newAssets: 2, trend: 'stable' as const, severity: 'medium' as const },
];

export const topGroupsByRogues = [
  { name: 'Guest / BYOD', rogueCount: 12, trend: 5 },
  { name: 'External / Internet Hosts', rogueCount: 8, trend: 2 },
  { name: 'Cloud Workloads', rogueCount: 5, trend: 0 },
  { name: 'DMZ Servers', rogueCount: 3, trend: 1 },
  { name: 'Internal Hosts', rogueCount: 2, trend: 0 },
];

export const staleBreakdown = [
  { locality: 'Internal', count: 12 },
  { locality: 'Cloud', count: 5 },
  { locality: 'DMZ', count: 2 },
  { locality: 'Guest', count: 1 },
];

export const staleTrendData = [
  { date: 'Mon', count: 15 },
  { date: 'Tue', count: 18 },
  { date: 'Wed', count: 17 },
  { date: 'Thu', count: 20 },
  { date: 'Fri', count: 19 },
  { date: 'Sat', count: 20 },
  { date: 'Sun', count: 20 },
];

export const newAssetsByGroup = [
  { name: 'Guest / BYOD', count: 8 },
  { name: 'Cloud Workloads', count: 5 },
  { name: 'Internal Hosts', count: 4 },
  { name: 'Workstations', count: 3 },
  { name: 'Kubernetes', count: 2 },
  { name: 'Database Servers', count: 1 },
];

export const uncoveredSubnets = [
  { cidr: '10.50.0.0/24', assetCount: 23, firstSeen: '2026-01-20', severity: 'high' as const },
  { cidr: '172.20.5.0/24', assetCount: 15, firstSeen: '2026-01-25', severity: 'medium' as const },
  { cidr: '192.168.200.0/24', assetCount: 8, firstSeen: '2026-01-28', severity: 'low' as const },
  { cidr: '10.100.0.0/24', assetCount: 5, firstSeen: '2026-01-22', severity: 'medium' as const },
];

export const recentTagChanges = [
  { assetName: 'web-prod-01', assetId: 'asset-002', action: 'added' as const, tag: 'pci-compliant', timestamp: '2h ago' },
  { assetName: 'db-prod-master', assetId: 'asset-003', action: 'added' as const, tag: 'backup-enabled', timestamp: '4h ago' },
  { assetName: 'old-file-server', assetId: 'asset-008', action: 'removed' as const, tag: 'active', timestamp: '6h ago' },
  { assetName: 'aws-prod-k8s-node-01', assetId: 'asset-006', action: 'added' as const, tag: 'auto-scaling', timestamp: '1d ago' },
  { assetName: 'LAPTOP-JSMITH', assetId: 'asset-005', action: 'added' as const, tag: 'vpn-user', timestamp: '2d ago' },
];

export const rogueAssets = [
  { ip: '204.79.197.200', count: 3200 },
  { ip: 'security-check.com', count: 2810 },
  { ip: '129.152.91.135', count: 1678 },
  { ip: 'user-management.com', count: 1289 },
  { ip: '176.92.55.22', count: 1210 },
  { ip: '129.152.91.133', count: 1678 },
];

export const mitreTactics = [
  { id: 'T1068', name: 'Privilege Escalation', count: 62 },
  { id: 'T1055', name: 'Defense Evasion', count: 43 },
  { id: 'T1053', name: 'Persistence', count: 23 },
  { id: 'T1059', name: 'Execution', count: 2 },
  { id: 'T1210', name: 'Exfiltration', count: 2 },
  { id: 'T1210', name: 'C&C', count: 2 },
];

export const trafficChartData = [
  { time: '00:00', inbound: 120, outbound: 80 },
  { time: '04:00', inbound: 80, outbound: 60 },
  { time: '08:00', inbound: 200, outbound: 150 },
  { time: '12:00', inbound: 350, outbound: 280 },
  { time: '16:00', inbound: 280, outbound: 220 },
  { time: '20:00', inbound: 180, outbound: 120 },
];
