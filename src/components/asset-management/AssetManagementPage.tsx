import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Database,
  Fingerprint,
  Cloud,
  Link2,
  Network,
  Server,
  Shield,
  ShieldCheck,
  Globe,
  Tags,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  mockTrustEntries 
} from '@/data/mock-asset-data';
import { unifiedGovernanceAssets } from '@/data/unified-assets';
import { AssetGroup } from '@/types/asset-management';

type PanelMode = 'new-group' | null;

export function AssetManagementPage() {
  const [settingsTab, setSettingsTab] = useState('assets');
  const [assetTab, setAssetTab] = useState('groups');
  const [platformTab, setPlatformTab] = useState('discovery');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const settingsTabContainerRef = useRef<HTMLDivElement | null>(null);
  const assetTabContainerRef = useRef<HTMLDivElement | null>(null);
  const platformTabContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedGroup = mockAssetGroups.find(g => g.id === selectedGroupId) || null;
  const HeaderIcon = SlidersHorizontal;
  const headerTitle = 'NDR Settings';
  const headerDescription =
    'Manage asset governance, network controls, trust lists, and detection tuning.';

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

  const scrollActiveTabToTop = (container: HTMLDivElement | null) => {
    if (!container) return;
    const activePanel = container.querySelector<HTMLElement>('[data-state="active"][role="tabpanel"]');
    if (!activePanel) return;
    const scrollTarget = activePanel.classList.contains('settings-scroll')
      ? activePanel
      : activePanel.querySelector<HTMLElement>('.settings-scroll');
    if (!scrollTarget) return;
    if (typeof scrollTarget.scrollTo === 'function') {
      scrollTarget.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      scrollTarget.scrollTop = 0;
    }
  };

  useEffect(() => {
    scrollActiveTabToTop(settingsTabContainerRef.current);
    if (settingsTab === 'assets') {
      scrollActiveTabToTop(assetTabContainerRef.current);
    }
    if (settingsTab === 'platform') {
      scrollActiveTabToTop(platformTabContainerRef.current);
    }
  }, [settingsTab]);

  useEffect(() => {
    scrollActiveTabToTop(assetTabContainerRef.current);
  }, [assetTab]);

  useEffect(() => {
    scrollActiveTabToTop(platformTabContainerRef.current);
  }, [platformTab]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <HeaderIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">{headerDescription}</p>
          </div>
        </div>
        <div />
      </div>

      {/* Main Tabs */}
      <Tabs
        value={settingsTab}
        onValueChange={setSettingsTab}
        className="flex-1 min-h-0 flex overflow-hidden"
      >
        {/* Vertical Sidebar */}
        <div className="w-64 border-r border-border bg-card flex flex-col">
          <div className="p-4 space-y-4">
            <div className="px-2 py-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Configuration</p>
            </div>
            <TabsList className="flex flex-col h-auto bg-transparent gap-1 items-stretch">
              <TabsTrigger
                value="assets"
                className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 h-10 border border-transparent data-[state=active]:border-primary/20"
              >
                <Server className="w-4 h-4 mr-2" />
                Asset Settings
              </TabsTrigger>
              <TabsTrigger
                value="rules"
                className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 h-10 border border-transparent data-[state=active]:border-primary/20"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Detection Rules
              </TabsTrigger>
              <TabsTrigger
                value="platform"
                className="justify-start data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4 py-2 h-10 border border-transparent data-[state=active]:border-primary/20"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Platform Settings
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-auto p-4 border-t border-border">
            <div className="bg-secondary/30 rounded-lg p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">System Health</p>
              <div className="flex items-center justify-between text-xs">
                <span>Collectors</span>
                <span className="text-primary font-bold">18/20</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span>Storage</span>
                <span className="text-warning font-bold">82%</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={settingsTabContainerRef} className="flex-1 flex flex-col overflow-hidden">
        <TabsContent value="assets" className="min-h-0 overflow-hidden m-0 p-0 data-[state=active]:flex flex-col">
          <div ref={assetTabContainerRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Tabs
              value={assetTab}
              onValueChange={setAssetTab}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
            <div className="px-6 border-b border-border">
              <TabsList className="h-12 bg-transparent gap-1">
                <TabsTrigger
                  value="groups"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Asset Groups
                </TabsTrigger>
                <TabsTrigger
                  value="tags"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Tags className="w-4 h-4 mr-2" />
                  Tag Management
                </TabsTrigger>
                <TabsTrigger
                  value="localities"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Network Segmentation
                </TabsTrigger>
                <TabsTrigger
                  value="trust"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Trust Lists
                </TabsTrigger>
                <TabsTrigger
                  value="lifecycle"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Asset Lifecycle
                </TabsTrigger>
                <TabsTrigger
                  value="nat"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <ArrowLeftRight className="w-4 h-4 mr-2" />
                  NAT Settings
                </TabsTrigger>
                <TabsTrigger
                  value="shadow-it"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  Shadow IT
                </TabsTrigger>
                <TabsTrigger
                  value="risk"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Risk Scoring
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Asset Groups Tab */}
            <TabsContent value="groups" className="min-h-0 flex overflow-hidden m-0 p-0">
              <div className="w-72 min-h-0 h-full border-r border-border bg-card flex-shrink-0">
                <GroupTreeNavigation
                  groups={mockAssetGroups}
                  selectedGroupId={selectedGroupId}
                  onSelectGroup={handleSelectGroup}
                  onCreateGroup={handleCreateGroup}
                  onEditGroup={handleEditGroup}
                  onDeleteGroup={(id) => console.log('Delete group:', id)}
                />
              </div>

              <div className="settings-scroll flex-1 min-h-0 overflow-auto px-6 pt-4 pb-6">
                {panelMode === 'new-group' ? (
                  <div className="max-w-3xl">
                    <div className="mb-4 flex flex-col items-end gap-1">
                      <div className="flex flex-wrap items-center justify-end gap-2">
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
                  <div className="max-w-3xl">
                    <div className="mb-4 flex flex-col items-end gap-1">
                      <div className="flex flex-wrap items-center justify-end gap-2">
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
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Network className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select a Group</p>
                    <p className="text-sm text-center mt-2">
                      Choose or create an asset group to scope whitelisting and policy behavior.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                      <Button onClick={handleCreateGroup}>
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
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      Download membership CSV sample
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tags" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <TagManagementPanel
                tags={mockTagCatalog}
                onCreateTag={(tag) => console.log('Create tag:', tag)}
                onEditTag={(tag) => console.log('Edit tag:', tag)}
                onDeleteTag={(id) => console.log('Delete tag:', id)}
              />
            </TabsContent>

            <TabsContent value="localities" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <NetworkLocalitiesPanel
                localities={mockNetworkLocalities}
                segments={mockNetworkSegments}
                groups={mockAssetGroups}
                onEdit={(l) => console.log('Edit locality:', l)}
                onDelete={(id) => console.log('Delete locality:', id)}
              />
            </TabsContent>

            <TabsContent value="trust" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <TrustListsPanel
                entries={mockTrustEntries}
                assets={unifiedGovernanceAssets}
                groups={mockAssetGroups}
                onAdd={(e) => console.log('Add entry:', e)}
                onEdit={(e) => console.log('Edit entry:', e)}
                onDelete={(id) => console.log('Delete entry:', id)}
                onToggle={(id, active) => console.log('Toggle:', id, active)}
              />
            </TabsContent>

            <TabsContent value="lifecycle" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <AssetLifecyclePanel />
            </TabsContent>

            <TabsContent value="nat" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <NatSettingsPanel />
            </TabsContent>

            <TabsContent value="shadow-it" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <ShadowItPolicyPanel />
            </TabsContent>

            <TabsContent value="risk" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <RiskScoringPanel />
            </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6 data-[state=active]:flex flex-col">
          <DetectionRulesPanel assets={unifiedGovernanceAssets} groups={mockAssetGroups} />
        </TabsContent>

        <TabsContent value="platform" className="min-h-0 overflow-hidden m-0 p-0 data-[state=active]:flex flex-col">
          <div ref={platformTabContainerRef} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Tabs
              value={platformTab}
              onValueChange={setPlatformTab}
              className="flex-1 min-h-0 flex flex-col overflow-hidden"
            >
            <div className="px-6 border-b border-border">
              <TabsList className="h-12 bg-transparent gap-1">
                <TabsTrigger
                  value="discovery"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Network className="w-4 h-4 mr-2" />
                  Discovery & Collectors
                </TabsTrigger>
                <TabsTrigger
                  value="identity"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Fingerprint className="w-4 h-4 mr-2" />
                  Identity Resolution
                </TabsTrigger>
                <TabsTrigger
                  value="integrations"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Integrations
                </TabsTrigger>
                <TabsTrigger
                  value="retention"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Data Retention
                </TabsTrigger>
                <TabsTrigger
                  value="access"
                  className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary px-4"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Access & Audit
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discovery" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <DiscoveryCollectorsPanel />
            </TabsContent>

            <TabsContent value="identity" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <IdentityResolutionPanel />
            </TabsContent>

            <TabsContent value="integrations" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <IntegrationsPanel />
            </TabsContent>

            <TabsContent value="retention" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <DataRetentionPanel />
            </TabsContent>

            <TabsContent value="access" className="settings-scroll min-h-0 overflow-auto m-0 px-6 pt-4 pb-6">
              <AccessAuditPanel />
            </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
