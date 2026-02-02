import { AssetGroup, GroupOptions, DynamicGroupRule, AiClusteringMetadata, GroupSource, GroupStatus } from '@/types/asset-management';

const defaultOptions: GroupOptions = {
  enableBaselining: true,
  disableSecurityEventsExcludedServices: false,
  disableFloodAlarms: false,
  trapUnusedAddresses: false,
};

const noBaselineOptions: GroupOptions = {
  enableBaselining: false,
  disableSecurityEventsExcludedServices: true,
  disableFloodAlarms: true,
  trapUnusedAddresses: false,
};

interface GroupConfig {
  id: string;
  name: string;
  description: string;
  type: 'static' | 'dynamic';
  source: GroupSource;
  status: GroupStatus;
  parentId?: string;
  icon?: string;
  businessCriticality?: 'not_important' | 'important' | 'very_important' | 'business_critical';
  priority: number;
  rules?: DynamicGroupRule[];
  ipRanges?: string[];
  options?: Partial<GroupOptions>;
  assetCount: number;
  isDefault?: boolean;
  aiMetadata?: AiClusteringMetadata;
}

function createGroup(config: GroupConfig): AssetGroup {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    type: config.type,
    source: config.source,
    status: config.status,
    parentId: config.parentId,
    icon: config.icon,
    businessCriticality: config.businessCriticality,
    priority: config.priority,
    rules: config.rules,
    ipRanges: config.ipRanges,
    options: { ...defaultOptions, ...config.options },
    assetCount: config.assetCount,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
    isDefault: config.isDefault,
    aiMetadata: config.aiMetadata,
  };
}

// System default groups
const systemGroups: AssetGroup[] = [
  createGroup({
    id: 'grp-critical',
    name: 'Critical Infrastructure',
    description: 'Mission-critical systems including domain controllers, core databases, and authentication services',
    type: 'dynamic',
    source: 'system',
    status: 'active',
    priority: 100,
    businessCriticality: 'business_critical',
    rules: [{ field: 'criticality', operator: 'equals', value: 'critical' }],
    assetCount: 2,
    isDefault: true,
  }),
  createGroup({
    id: 'grp-unassigned',
    name: 'Unassigned Assets',
    description: 'System group for assets that have not yet been categorized',
    type: 'static',
    source: 'system',
    status: 'active',
    priority: 5,
    icon: 'alert',
    businessCriticality: 'important',
    options: noBaselineOptions,
    assetCount: 1,
    isDefault: true,
  }),
  createGroup({
    id: 'grp-stale',
    name: 'Stale Assets',
    description: 'Assets not seen for 30+ days that require review or cleanup',
    type: 'static',
    source: 'system',
    status: 'active',
    priority: 15,
    icon: 'alert',
    businessCriticality: 'not_important',
    options: noBaselineOptions,
    assetCount: 1,
    isDefault: true,
  }),
  createGroup({
    id: 'grp-internal',
    name: 'Internal Hosts',
    description: 'All assets on internal RFC1918 address space',
    type: 'dynamic',
    source: 'system',
    status: 'active',
    priority: 50,
    businessCriticality: 'important',
    rules: [{ field: 'locality', operator: 'equals', value: 'internal' }],
    ipRanges: ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'],
    assetCount: 14,
    isDefault: true,
  }),
  createGroup({
    id: 'grp-external',
    name: 'External / Internet Hosts',
    description: 'Known external hosts for monitoring and correlation',
    type: 'static',
    source: 'system',
    status: 'active',
    priority: 10,
    businessCriticality: 'not_important',
    options: noBaselineOptions,
    assetCount: 5,
    isDefault: true,
  }),
];

// User-created rule-based groups
const userGroups: AssetGroup[] = [
  createGroup({
    id: 'grp-dmz',
    name: 'DMZ Servers',
    description: 'Systems in the demilitarized zone, exposed to partial external access',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 80,
    businessCriticality: 'very_important',
    rules: [{ field: 'zone', operator: 'equals', value: 'seg-dmz-web' }],
    ipRanges: ['192.168.100.0/24'],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-internet-facing',
    name: 'Internet-Facing Assets',
    description: 'Assets with public IP addresses exposed to the internet',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 90,
    businessCriticality: 'very_important',
    rules: [{ field: 'exposure.hasPublicIP', operator: 'equals', value: 'true' }],
    assetCount: 5,
  }),
  createGroup({
    id: 'grp-cloud',
    name: 'Cloud Workloads',
    description: 'Virtual machines and containers running in cloud environments (AWS, Azure, GCP)',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 60,
    businessCriticality: 'important',
    rules: [{ field: 'locality', operator: 'equals', value: 'cloud' }],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-kubernetes',
    name: 'Kubernetes Workloads',
    description: 'Kubernetes nodes and cluster services across environments',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 58,
    icon: 'cloud',
    businessCriticality: 'important',
    rules: [{ field: 'tag', operator: 'contains', value: 'kubernetes' }],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-guest',
    name: 'Guest / BYOD',
    description: 'Guest network and bring-your-own-device endpoints with limited trust',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 20,
    businessCriticality: 'not_important',
    rules: [{ field: 'locality', operator: 'equals', value: 'guest' }],
    ipRanges: ['10.200.0.0/16'],
    options: noBaselineOptions,
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-scanners',
    name: 'Trusted Scanners',
    description: 'Authorized vulnerability scanners and security assessment tools',
    type: 'static',
    source: 'user',
    status: 'active',
    priority: 95,
    businessCriticality: 'not_important',
    options: noBaselineOptions,
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-databases',
    name: 'Database Servers',
    description: 'All database servers across the organization',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    parentId: 'grp-internal',
    priority: 75,
    businessCriticality: 'very_important',
    rules: [{ field: 'role', operator: 'equals', value: 'database_server' }],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-workstations',
    name: 'Workstations',
    description: 'End-user workstations and laptops',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    parentId: 'grp-internal',
    priority: 30,
    businessCriticality: 'important',
    rules: [{ field: 'type', operator: 'equals', value: 'workstation' }],
    options: noBaselineOptions,
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-finance',
    name: 'Finance Systems',
    description: 'Finance applications and data stores handling billing and revenue workflows',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 70,
    icon: 'alert',
    businessCriticality: 'very_important',
    rules: [
      { field: 'owner', operator: 'contains', value: 'Finance' },
      { field: 'tag', operator: 'contains', value: 'finance' },
    ],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-hr',
    name: 'HR Systems',
    description: 'Human resources platforms and employee record systems',
    type: 'dynamic',
    source: 'user',
    status: 'active',
    priority: 65,
    icon: 'users',
    businessCriticality: 'very_important',
    rules: [
      { field: 'owner', operator: 'contains', value: 'HR' },
      { field: 'tag', operator: 'contains', value: 'hr' },
    ],
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-third-party',
    name: 'Third-Party Partners',
    description: 'Partner networks and vendor-managed systems outside the organization',
    type: 'static',
    source: 'user',
    status: 'active',
    priority: 15,
    icon: 'globe',
    businessCriticality: 'important',
    options: noBaselineOptions,
    assetCount: 1,
  }),
  createGroup({
    id: 'grp-saas',
    name: 'SaaS Providers',
    description: 'External SaaS endpoints and cloud applications accessed by users',
    type: 'static',
    source: 'user',
    status: 'active',
    priority: 12,
    icon: 'cloud',
    businessCriticality: 'important',
    options: noBaselineOptions,
    assetCount: 1,
  }),
];

// AI-suggested groups based on behavioral clustering
const aiSuggestedGroups: AssetGroup[] = [
  createGroup({
    id: 'grp-ai-print-cluster',
    name: 'Print Services Cluster',
    description: 'Assets primarily communicating with print protocols (LPR, IPP, SMB printing)',
    type: 'dynamic',
    source: 'ai_suggested',
    status: 'pending_review',
    priority: 25,
    icon: 'server',
    businessCriticality: 'not_important',
    rules: [
      { field: 'dst_port', operator: 'in', value: ['515', '631', '9100'] },
    ],
    assetCount: 4,
    aiMetadata: {
      confidence: 0.87,
      clusteringMethod: 'protocol_similarity',
      suggestedAt: '2026-01-28T08:00:00Z',
      reasoning: 'Detected 4 assets with >80% traffic to print protocols. Suggests a dedicated printer services group for better baseline tuning.',
      matchedAssetIds: ['asset-p1', 'asset-p2', 'asset-p3', 'asset-p4'],
    },
  }),
  createGroup({
    id: 'grp-ai-backup-clients',
    name: 'Backup Agent Cluster',
    description: 'Assets with regular communication patterns to backup infrastructure',
    type: 'dynamic',
    source: 'ai_suggested',
    status: 'pending_review',
    priority: 40,
    icon: 'shield',
    businessCriticality: 'important',
    rules: [
      { field: 'dst_ip', operator: 'cidr_match', value: '10.0.70.0/24' },
      { field: 'dst_port', operator: 'in', value: ['2049', '3260', '10000'] },
    ],
    assetCount: 12,
    aiMetadata: {
      confidence: 0.92,
      clusteringMethod: 'communication_pattern',
      suggestedAt: '2026-01-27T14:30:00Z',
      reasoning: 'Identified 12 assets with nightly scheduled connections to backup vault subnet. Creating this group enables backup-aware anomaly detection.',
      matchedAssetIds: ['asset-b1', 'asset-b2', 'asset-b3'],
    },
  }),
  createGroup({
    id: 'grp-ai-dev-cluster',
    name: 'CI/CD Pipeline Nodes',
    description: 'Assets exhibiting development tooling traffic (Git, Docker Registry, artifact repos)',
    type: 'dynamic',
    source: 'ai_suggested',
    status: 'pending_review',
    priority: 28,
    icon: 'cloud',
    businessCriticality: 'not_important',
    rules: [
      { field: 'dst_port', operator: 'in', value: ['22', '443', '5000', '8080'] },
      { field: 'tag', operator: 'contains', value: 'dev' },
    ],
    assetCount: 8,
    aiMetadata: {
      confidence: 0.78,
      clusteringMethod: 'behavioral',
      suggestedAt: '2026-01-26T10:15:00Z',
      reasoning: 'Behavioral clustering detected 8 assets with high-frequency connections to internal Git and Docker registry. Grouping reduces false positives from legitimate CI/CD activity.',
      matchedAssetIds: ['asset-d1', 'asset-d2'],
    },
  }),
  createGroup({
    id: 'grp-ai-after-hours',
    name: 'After-Hours Active Cluster',
    description: 'Assets with significant network activity outside business hours (10PM-6AM)',
    type: 'dynamic',
    source: 'ai_suggested',
    status: 'pending_review',
    priority: 35,
    icon: 'alert',
    businessCriticality: 'important',
    rules: [],
    assetCount: 6,
    aiMetadata: {
      confidence: 0.71,
      clusteringMethod: 'temporal',
      suggestedAt: '2026-01-25T06:00:00Z',
      reasoning: 'Temporal analysis found 6 assets with >40% of traffic occurring outside business hours. Review recommended to distinguish legitimate batch processing from suspicious activity.',
      matchedAssetIds: ['asset-ah1', 'asset-ah2'],
    },
  }),
];

export const mockAssetGroups: AssetGroup[] = [
  ...systemGroups,
  ...userGroups,
  ...aiSuggestedGroups,
];

export { systemGroups, userGroups, aiSuggestedGroups };
