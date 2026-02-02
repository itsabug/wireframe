import { mockAssets as analyticsAssets } from "@/data/mockData";
import { mockAssets as governanceAssets, mockAssetGroups, mockTrustEntries } from "@/data/mock-asset-data";
import type { Asset as AnalyticsAsset, HistoryItem } from "@/types/asset";
import type { Asset as GovernanceAsset, AssetRole, AssetType, Criticality, Locality } from "@/types/asset-management";

const normalize = (value: string) => value.trim().toLowerCase();

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const formatAssetType = (type: GovernanceAsset["type"]) => titleCase(type);
const formatAssetRole = (role: GovernanceAsset["role"]) => titleCase(role);

const buildHistory = (values: string[], timestamp: string): HistoryItem[] =>
  values.length
    ? values.map((value, index) => ({
        value,
        timestamp,
        isCurrent: index === 0,
      }))
    : [];

const statusFromLifecycle = (status: GovernanceAsset["lifecycle"]["status"]) => {
  if (status === "active") return "online";
  if (status === "stale" || status === "decommissioned") return "offline";
  return "unknown";
};

const normalizeTimestamp = (value: string) => value.replace("T", " ").replace("Z", "");

const groupNameMap = new Map(mockAssetGroups.map((group) => [group.id, group.name]));

const mergeTags = (primary: string[] = [], secondary: string[] = []) => {
  const seen = new Set<string>();
  const combined: string[] = [];
  [...primary, ...secondary].forEach((tag) => {
    if (!tag) return;
    const key = normalize(tag);
    if (seen.has(key)) return;
    seen.add(key);
    combined.push(tag);
  });
  return combined;
};

const matchAnalyticsAsset = (asset: GovernanceAsset) => {
  const hostname = normalize(asset.identity.hostname);
  const ipv4 = asset.identity.ipv4Addresses;
  return analyticsAssets.find((candidate) => {
    if (normalize(candidate.hostname) === hostname) return true;
    if (normalize(candidate.name) === hostname) return true;
    return ipv4.some((ip) => ip === candidate.ip);
  });
};

const isPrivateIp = (ip: string) => {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return false;
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
};

const mapDeviceType = (value: string): AssetType => {
  const normalized = normalize(value);
  if (normalized.includes("server")) return "server";
  if (normalized.includes("laptop") || normalized.includes("workstation")) return "workstation";
  if (normalized.includes("switch") || normalized.includes("router")) return "network_device";
  if (normalized.includes("firewall")) return "network_device";
  if (normalized.includes("mobile") || normalized.includes("phone")) return "mobile";
  return "unknown";
};

const mapRoleTag = (value: string): AssetRole => {
  const normalized = normalize(value);
  if (normalized.includes("domain controller")) return "domain_controller";
  if (normalized.includes("database")) return "database_server";
  if (normalized.includes("web")) return "web_server";
  if (normalized.includes("mail")) return "mail_server";
  if (normalized.includes("file")) return "file_server";
  if (normalized.includes("proxy")) return "proxy_server";
  if (normalized.includes("firewall")) return "firewall";
  if (normalized.includes("router")) return "router";
  if (normalized.includes("switch")) return "switch";
  if (normalized.includes("scanner")) return "scanner";
  if (normalized.includes("endpoint") || normalized.includes("workstation")) return "endpoint";
  return "other";
};

const mapLocality = (value: string): Locality => {
  const normalized = normalize(value);
  if (normalized.includes("dmz") || normalized.includes("perimeter")) return "dmz";
  if (normalized.includes("external")) return "external";
  if (normalized.includes("cloud")) return "cloud";
  return "internal";
};

const mapCriticality = (score: number): Criticality => {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "medium";
  return "low";
};

const buildGovernanceAsset = (asset: AnalyticsAsset): GovernanceAsset => {
  const locality = mapLocality(asset.network || "");
  const hasPublicIP = asset.ip ? !isPrivateIp(asset.ip) : false;
  return {
    id: `asset-${asset.id}`,
    identity: {
      hostname: asset.hostname,
      fqdn: asset.hostname,
      ipv4Addresses: asset.ip ? [asset.ip] : [],
      ipv6Addresses: [],
      macAddresses: asset.mac ? [asset.mac] : [],
    },
    type: mapDeviceType(asset.deviceType),
    role: mapRoleTag(asset.roleTag),
    locality,
    criticality: mapCriticality(asset.threatScore),
    exposure: {
      hasPublicIP,
      publicIPs: hasPublicIP && asset.ip ? [asset.ip] : [],
      hasInboundInternet: false,
      isNATed: false,
    },
    metadata: {
      owner: asset.owner,
      businessUnit: "",
      site: asset.location,
      environment: "",
      tags: asset.tags || [],
    },
    lifecycle: {
      firstSeen: asset.firstSeen,
      lastSeen: asset.lastSeen,
      status: "unknown",
      createdAt: asset.firstSeen,
      updatedAt: asset.lastSeen,
    },
    groupIds: ["grp-unassigned"],
  };
};

const buildFallbackAsset = (asset: GovernanceAsset): AnalyticsAsset => {
  const hostname = asset.identity.hostname;
  const ip = asset.identity.ipv4Addresses[0] || "0.0.0.0";
  const mac = asset.identity.macAddresses[0] || "00:00:00:00:00:00";
  const firstSeen = normalizeTimestamp(asset.lifecycle.firstSeen);
  const lastSeen = normalizeTimestamp(asset.lifecycle.lastSeen);

  return {
    id: asset.id,
    name: hostname,
    owner: asset.metadata.owner || "Unassigned",
    ip,
    mac,
    hostname,
    deviceType: formatAssetType(asset.type),
    roleTag: formatAssetRole(asset.role),
    status: statusFromLifecycle(asset.lifecycle.status),
    threatScore: 0,
    confidenceScore: 0,
    blastRadiusScore: 0,
    firstSeen,
    lastSeen,
    category: asset.type,
    location: asset.metadata.site || "—",
    network: asset.locality,
    interfaceType: asset.type === "network_device" ? "Ethernet" : "Unknown",
    connectionType: "unknown",
    ipHistory: buildHistory(asset.identity.ipv4Addresses, firstSeen),
    hostnameHistory: buildHistory([hostname], firstSeen),
    macHistory: buildHistory(asset.identity.macAddresses, firstSeen),
    managementTools: [],
  };
};

const mergeAssetData = (governance: GovernanceAsset, analytics?: AnalyticsAsset) => {
  const base = analytics ?? buildFallbackAsset(governance);
  const firstSeen = analytics?.firstSeen || normalizeTimestamp(governance.lifecycle.firstSeen);
  const lastSeen = analytics?.lastSeen || normalizeTimestamp(governance.lifecycle.lastSeen);
  const groupNames = governance.groupIds
    .map((id) => groupNameMap.get(id))
    .filter((name): name is string => Boolean(name));

  const trustListEntries = mockTrustEntries
    .filter((entry) => (entry.type === "asset" || entry.type === "scanner") && entry.value === governance.id)
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      scope: entry.scope,
      reason: entry.reason,
      isActive: entry.isActive,
    }));

  return {
    ...base,
    id: governance.id,
    name: analytics?.name || governance.identity.hostname,
    hostname: governance.identity.hostname,
    owner: governance.metadata.owner || base.owner,
    ip: governance.identity.ipv4Addresses[0] || base.ip,
    mac: governance.identity.macAddresses[0] || base.mac,
    deviceType: analytics?.deviceType || formatAssetType(governance.type),
    roleTag: analytics?.roleTag || formatAssetRole(governance.role),
    status: analytics?.status || statusFromLifecycle(governance.lifecycle.status),
    firstSeen,
    lastSeen,
    category: analytics?.category || governance.type,
    location: governance.metadata.site || base.location,
    network: governance.locality || base.network,
    tags: mergeTags(base.tags || [], governance.metadata.tags || []),
    criticality: governance.criticality,
    locality: governance.locality,
    exposure: governance.exposure,
    groupIds: governance.groupIds,
    groupNames,
    lifecycleStatus: governance.lifecycle.status,
    trustListEntries,
  } satisfies AnalyticsAsset;
};

const matchedAnalyticsIds = new Set<string>();

governanceAssets.forEach((asset) => {
  const match = matchAnalyticsAsset(asset);
  if (match) {
    matchedAnalyticsIds.add(match.id);
  }
});

export const unifiedGovernanceAssets = [
  ...governanceAssets,
  ...analyticsAssets
    .filter((asset) => !matchedAnalyticsIds.has(asset.id))
    .map(buildGovernanceAsset),
];

export const unifiedAssets = unifiedGovernanceAssets.map((asset) =>
  mergeAssetData(asset, matchAnalyticsAsset(asset)),
);
