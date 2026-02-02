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
