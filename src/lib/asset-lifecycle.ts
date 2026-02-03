export const parseAssetTimestamp = (value: string) => {
  if (!value) return null;
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const getDaysSince = (value: string, now = Date.now()) => {
  const parsed = parseAssetTimestamp(value);
  if (!parsed) return null;
  const diffMs = now - parsed.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

export const getStaleInfo = (lastSeen: string, staleAfterDays: number) => {
  const days = getDaysSince(lastSeen);
  if (days === null) {
    return { isStale: false, staleDays: null };
  }
  return { isStale: days > staleAfterDays, staleDays: days };
};

export type LifecycleStatus = 'new' | 'active' | 'stale';

export const getLifecycleStatus = (
  firstSeen: string,
  lastSeen: string,
  newThresholdDays = 7,
  staleThresholdDays = 30
): LifecycleStatus => {
  const firstSeenDays = getDaysSince(firstSeen);
  const lastSeenDays = getDaysSince(lastSeen);
  
  // If we can't parse dates, default to active
  if (firstSeenDays === null || lastSeenDays === null) {
    return 'active';
  }
  
  // Stale: not seen for more than staleThresholdDays
  if (lastSeenDays > staleThresholdDays) {
    return 'stale';
  }
  
  // New: first seen within newThresholdDays
  if (firstSeenDays <= newThresholdDays) {
    return 'new';
  }
  
  return 'active';
};
