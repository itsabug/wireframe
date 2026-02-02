import { useState } from 'react';
import { Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupTreeNavigation } from './GroupTreeNavigation';
import { GroupDetailsPanel } from './GroupDetailsPanel';
import { DetectionRulesPanel } from './DetectionRulesPanel';
import { NetworkLocalitiesPanel } from './NetworkLocalitiesPanel';
import { TrustListsPanel } from './TrustListsPanel';
import { TagManagementPanel } from './TagManagementPanel';
import { AssetLifecyclePanel } from './AssetLifecyclePanel';
import { NatSettingsPanel } from './NatSettingsPanel';
import { ShadowItPolicyPanel } from './ShadowItPolicyPanel';
import { RiskScoringPanel } from './RiskScoringPanel';
import { DiscoveryCollectorsPanel } from './DiscoveryCollectorsPanel';
import { IdentityResolutionPanel } from './IdentityResolutionPanel';
import { IntegrationsPanel } from './IntegrationsPanel';
import { DataRetentionPanel } from './DataRetentionPanel';
import { AccessAuditPanel } from './AccessAuditPanel';
import {
  mockAssetGroups,
  mockTagCatalog,
  mockNetworkLocalities,
  mockNetworkSegments,
  mockTrustEntries,
} from '@/data/mock-asset-data';
import { unifiedGovernanceAssets } from '@/data/unified-assets';
import { AssetGroup } from '@/types/asset-management';
import type { SettingsPanel } from './SettingsSidebar';

interface SettingsContentProps {
  activePanel: SettingsPanel;
}

type PanelMode = 'new-group' | null;

export function SettingsContent({ activePanel }: SettingsContentProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);

  const selectedGroup = mockAssetGroups.find((g) => g.id === selectedGroupId) || null;

  const handleSelectGroup = (groupId: string | null) => {
    setSelectedGroupId(groupId);
    setPanelMode(null);
  };

  const handleEditGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPanelMode(null);
  };

  const handleCreateGroup = () => {
    setSelectedGroupId(null);
    setPanelMode('new-group');
  };

  const handleClosePanel = () => {
    setPanelMode(null);
  };

  const handleSaveGroup = (group: Partial<AssetGroup>) => {
    console.log('Save group:', group);
    setPanelMode(null);
  };

  const handleImportMemberships = (file: File | null) => {
    if (!file) return;
    console.log('Import group memberships CSV:', file.name);
  };

  const handleAcceptAiGroup = (groupId: string) => {
    console.log('Accept AI group:', groupId);
    // In real implementation: update group source to 'user' and status to 'active'
  };

  const handleRejectAiGroup = (groupId: string) => {
    console.log('Reject AI group:', groupId);
    // In real implementation: update group status to 'rejected'
  };

  const renderGroupsPanel = () => (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="w-80 min-h-0 h-full border-r border-border bg-card flex-shrink-0">
        <GroupTreeNavigation
          groups={mockAssetGroups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelectGroup}
          onCreateGroup={handleCreateGroup}
          onEditGroup={handleEditGroup}
          onDeleteGroup={(id) => console.log('Delete group:', id)}
          onAcceptAiGroup={handleAcceptAiGroup}
          onRejectAiGroup={handleRejectAiGroup}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-auto p-6">
        {panelMode === 'new-group' ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleCreateGroup}>
                  Create New Group
                </Button>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Import Memberships
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        handleImportMemberships(file);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                </Button>
              </div>
              <a
                href="/group-membership-import-sample.csv"
                download
                className="text-xs text-primary hover:underline"
              >
                Download membership CSV sample
              </a>
            </div>
            <GroupDetailsPanel
              group={null}
              isNew
              localities={mockNetworkLocalities}
              segments={mockNetworkSegments}
              onClose={handleClosePanel}
              onSave={handleSaveGroup}
            />
          </div>
        ) : selectedGroup ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex flex-col items-end gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleCreateGroup}>
                  Create New Group
                </Button>
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    Import Memberships
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        handleImportMemberships(file);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                </Button>
              </div>
              <a
                href="/group-membership-import-sample.csv"
                download
                className="text-xs text-primary hover:underline"
              >
                Download membership CSV sample
              </a>
            </div>
            <GroupDetailsPanel
              group={selectedGroup}
              localities={mockNetworkLocalities}
              segments={mockNetworkSegments}
              onClose={() => setSelectedGroupId(null)}
              onSave={handleSaveGroup}
              onDelete={() => console.log('Delete group')}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-16">
            <Network className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a Group</p>
            <p className="text-sm text-center mt-2 max-w-md">
              Choose or create an asset group to scope whitelisting and policy behavior.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={handleCreateGroup}>Create New Group</Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  Import Memberships
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      handleImportMemberships(file);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
              </Button>
            </div>
            <a
              href="/group-membership-import-sample.csv"
              download
              className="mt-3 text-xs text-primary hover:underline"
            >
              Download membership CSV sample
            </a>
          </div>
        )}
      </div>
    </div>
  );

  const renderContentPanel = () => {
    switch (activePanel) {
      case 'groups':
        return renderGroupsPanel();

      case 'tags':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <TagManagementPanel
                tags={mockTagCatalog}
                onCreateTag={(tag) => console.log('Create tag:', tag)}
                onEditTag={(tag) => console.log('Edit tag:', tag)}
                onDeleteTag={(id) => console.log('Delete tag:', id)}
              />
            </div>
          </div>
        );

      case 'lifecycle':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <AssetLifecyclePanel />
            </div>
          </div>
        );

      case 'localities':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <NetworkLocalitiesPanel
                localities={mockNetworkLocalities}
                segments={mockNetworkSegments}
                groups={mockAssetGroups}
                onEdit={(l) => console.log('Edit locality:', l)}
                onDelete={(id) => console.log('Delete locality:', id)}
              />
            </div>
          </div>
        );

      case 'nat':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <NatSettingsPanel />
            </div>
          </div>
        );

      case 'trust':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <TrustListsPanel
                entries={mockTrustEntries}
                assets={unifiedGovernanceAssets}
                groups={mockAssetGroups}
                onAdd={(e) => console.log('Add entry:', e)}
                onEdit={(e) => console.log('Edit entry:', e)}
                onDelete={(id) => console.log('Delete entry:', id)}
                onToggle={(id, active) => console.log('Toggle:', id, active)}
              />
            </div>
          </div>
        );

      case 'rules':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <DetectionRulesPanel assets={unifiedGovernanceAssets} groups={mockAssetGroups} />
            </div>
          </div>
        );

      case 'risk':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <RiskScoringPanel />
            </div>
          </div>
        );

      case 'shadow-it':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <ShadowItPolicyPanel />
            </div>
          </div>
        );

      case 'discovery':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <DiscoveryCollectorsPanel />
            </div>
          </div>
        );

      case 'identity':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <IdentityResolutionPanel />
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <IntegrationsPanel />
            </div>
          </div>
        );

      case 'retention':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <DataRetentionPanel />
            </div>
          </div>
        );

      case 'access':
        return (
          <div className="p-6 overflow-auto h-full">
            <div className="max-w-5xl mx-auto">
              <AccessAuditPanel />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background">
      {renderContentPanel()}
    </div>
  );
}
