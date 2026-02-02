import { useSyncExternalStore } from "react";

export type LifecycleSettings = {
  staleAfterDays: number;
  newAssetHighlightDays: number;
};

const DEFAULT_SETTINGS: LifecycleSettings = {
  staleAfterDays: 30,
  newAssetHighlightDays: 7,
};

let currentSettings: LifecycleSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

export const getLifecycleSettings = () => currentSettings;

export const updateLifecycleSettings = (updates: Partial<LifecycleSettings>) => {
  currentSettings = { ...currentSettings, ...updates };
  listeners.forEach((listener) => listener());
};

export const useLifecycleSettings = () => {
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return useSyncExternalStore(subscribe, getLifecycleSettings, getLifecycleSettings);
};

// Helper to check if an asset is "new" based on firstSeen date
export const isNewAsset = (firstSeen: string, highlightDays: number): boolean => {
  const firstSeenDate = new Date(firstSeen);
  const now = new Date();
  const diffMs = now.getTime() - firstSeenDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= highlightDays;
};

export const getNewAssetDays = (firstSeen: string): number => {
  const firstSeenDate = new Date(firstSeen);
  const now = new Date();
  const diffMs = now.getTime() - firstSeenDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};