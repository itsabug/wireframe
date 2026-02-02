import { useSyncExternalStore } from "react";

export type LifecycleSettings = {
  staleAfterDays: number;
};

const DEFAULT_SETTINGS: LifecycleSettings = {
  staleAfterDays: 30,
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
