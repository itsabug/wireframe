import { useSyncExternalStore } from "react";

export type RiskSettings = {
  highRiskThreshold: number;
  criticalRiskThreshold: number;
};

const DEFAULT_SETTINGS: RiskSettings = {
  highRiskThreshold: 60,
  criticalRiskThreshold: 80,
};

let currentSettings: RiskSettings = { ...DEFAULT_SETTINGS };
const listeners = new Set<() => void>();

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const getRiskSettings = () => currentSettings;

export const updateRiskSettings = (updates: Partial<RiskSettings>) => {
  const next = { ...currentSettings, ...updates };
  let highRiskThreshold = clamp(next.highRiskThreshold, 1, 99);
  let criticalRiskThreshold = clamp(next.criticalRiskThreshold, 2, 100);

  if (criticalRiskThreshold <= highRiskThreshold) {
    criticalRiskThreshold = clamp(highRiskThreshold + 1, 2, 100);
    if (criticalRiskThreshold <= highRiskThreshold) {
      highRiskThreshold = clamp(criticalRiskThreshold - 1, 1, 99);
    }
  }

  currentSettings = { highRiskThreshold, criticalRiskThreshold };
  listeners.forEach((listener) => listener());
};

export const useRiskSettings = () => {
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return useSyncExternalStore(subscribe, getRiskSettings, getRiskSettings);
};
