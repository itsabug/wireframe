import { SlidersHorizontal } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-lg">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">NDR Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage asset governance, network controls, trust lists, and detection tuning.
          </p>
        </div>
      </div>
    </div>
  );
}
