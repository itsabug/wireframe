import { useState } from 'react';
import { SettingsTopNav } from './SettingsTopNav';
import { SettingsContent } from './SettingsContent';
import type { SettingsPanel } from './SettingsSidebar';

export function AssetManagementPage() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('groups');

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <SettingsTopNav activePanel={activePanel} onPanelChange={setActivePanel} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <SettingsContent activePanel={activePanel} />
      </div>
    </div>
  );
}
