import { useState } from 'react';
import { SettingsSidebar, type SettingsPanel } from './SettingsSidebar';
import { SettingsHeader } from './SettingsHeader';
import { SettingsContent } from './SettingsContent';

export function AssetManagementPage() {
  const [activePanel, setActivePanel] = useState<SettingsPanel>('groups');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SettingsHeader />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SettingsSidebar activePanel={activePanel} onPanelChange={setActivePanel} />
        <SettingsContent activePanel={activePanel} />
      </div>
    </div>
  );
}
