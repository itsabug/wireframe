import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Eye, 
  TrendingUp, 
  Calendar,
  ChevronRight,
  Info
} from 'lucide-react';
import { updateLifecycleSettings, useLifecycleSettings } from '@/state/lifecycleSettings';
import { ASSET_METRICS } from '@/data/unified-dashboard-data';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Simulated data for lifecycle projection
const simulateLifecycleChanges = (staleAfterDays: number, archiveAfterDays: number, projectionDays: number) => {
  // This would normally come from actual asset data
  const mockAssets = [
    { id: 'asset-001', name: 'web-prod-01', lastSeen: 28, currentStatus: 'active' },
    { id: 'asset-002', name: 'db-backup-02', lastSeen: 45, currentStatus: 'stale' },
    { id: 'asset-003', name: 'dev-api-01', lastSeen: 15, currentStatus: 'active' },
    { id: 'asset-004', name: 'legacy-srv-03', lastSeen: 85, currentStatus: 'stale' },
    { id: 'asset-005', name: 'monitoring-01', lastSeen: 5, currentStatus: 'active' },
  ];

  const changes: Array<{
    assetId: string;
    assetName: string;
    currentStatus: string;
    newStatus: string;
    daysUntilChange: number;
    reason: string;
  }> = [];

  mockAssets.forEach(asset => {
    const daysUntilStale = staleAfterDays - asset.lastSeen;
    const daysUntilArchive = archiveAfterDays - asset.lastSeen;

    if (asset.currentStatus === 'active' && daysUntilStale > 0 && daysUntilStale <= projectionDays) {
      changes.push({
        assetId: asset.id,
        assetName: asset.name,
        currentStatus: 'Active',
        newStatus: 'Stale',
        daysUntilChange: daysUntilStale,
        reason: `No activity for ${staleAfterDays} days`,
      });
    }

    if (daysUntilArchive > 0 && daysUntilArchive <= projectionDays) {
      changes.push({
        assetId: asset.id,
        assetName: asset.name,
        currentStatus: asset.currentStatus === 'stale' ? 'Stale' : 'Active',
        newStatus: 'Archived',
        daysUntilChange: daysUntilArchive,
        reason: `No activity for ${archiveAfterDays} days`,
      });
    }
  });

  return changes.sort((a, b) => a.daysUntilChange - b.daysUntilChange);
};

export function AssetLifecyclePanel() {
  const { staleAfterDays, newAssetHighlightDays } = useLifecycleSettings();
  const [archiveAfterDays, setArchiveAfterDays] = useState(90);
  const [reviewCadenceDays, setReviewCadenceDays] = useState(180);
  const [projectionDays, setProjectionDays] = useState(14);
  const [showSimulation, setShowSimulation] = useState(false);

  const handleStaleDaysChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateLifecycleSettings({ staleAfterDays: Math.max(1, Math.floor(parsed)) });
  };

  const handleNewAssetDaysChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateLifecycleSettings({ newAssetHighlightDays: Math.max(1, Math.floor(parsed)) });
  };

  // Lifecycle simulation
  const projectedChanges = useMemo(() => 
    simulateLifecycleChanges(staleAfterDays, archiveAfterDays, projectionDays),
    [staleAfterDays, archiveAfterDays, projectionDays]
  );

  const staleCount = projectedChanges.filter(c => c.newStatus === 'Stale').length;
  const archiveCount = projectedChanges.filter(c => c.newStatus === 'Archived').length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Lifecycle Projection
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Preview next</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={projectionDays}
                onChange={(e) => setProjectionDays(Math.max(1, Number(e.target.value) || 14))}
                className="w-16 h-7 text-xs"
              />
              <span className="text-xs text-muted-foreground">days</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/80">
              <p className="text-2xl font-bold font-mono">{ASSET_METRICS.TOTAL_MANAGED_ASSETS}</p>
              <p className="text-xs text-muted-foreground">Total assets</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10">
              <p className="text-2xl font-bold font-mono text-amber-600">{staleCount}</p>
              <p className="text-xs text-muted-foreground">Will become stale</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted">
              <p className="text-2xl font-bold font-mono text-muted-foreground">{archiveCount}</p>
              <p className="text-xs text-muted-foreground">Will be archived</p>
            </div>
          </div>

          {projectedChanges.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowSimulation(!showSimulation)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Eye className="h-3 w-3" />
                {showSimulation ? 'Hide' : 'View'} affected assets
                <ChevronRight className={`h-3 w-3 transition-transform ${showSimulation ? 'rotate-90' : ''}`} />
              </button>

              {showSimulation && (
                <div className="mt-3 space-y-2 max-h-[200px] overflow-auto">
                  {projectedChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{change.assetName}</span>
                        <Badge variant="outline" className="text-[9px]">{change.currentStatus}</Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <Badge 
                          variant="outline" 
                          className={`text-[9px] ${
                            change.newStatus === 'Stale' ? 'text-amber-600 border-amber-500/30' :
                            change.newStatus === 'Archived' ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {change.newStatus}
                        </Badge>
                      </div>
                      <span className="text-muted-foreground">in {change.daysUntilChange}d</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Discovery & Staleness</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Control how assets move between new, active, and stale states.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Mark asset as stale after (days inactive)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Assets with no network activity for this many days will be marked as "Stale" and flagged for review.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              type="number"
              min={1}
              value={staleAfterDays}
              onChange={(event) => handleStaleDaysChange(event.target.value)}
              className="bg-input"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Auto-archive after (days inactive)</Label>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Assets inactive for this many days will be archived. Archived assets are hidden from default views but retained for compliance.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Input 
              type="number" 
              min={1} 
              value={archiveAfterDays}
              onChange={(e) => setArchiveAfterDays(Math.max(1, Number(e.target.value) || 90))}
              className="bg-input" 
            />
          </div>
          <div className="space-y-2">
            <Label>New asset highlight window (days)</Label>
            <Input
              type="number"
              min={1}
              value={newAssetHighlightDays}
              onChange={(event) => handleNewAssetDaysChange(event.target.value)}
              className="bg-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Ownership review cadence (days)</Label>
            <Input 
              type="number" 
              min={1} 
              value={reviewCadenceDays}
              onChange={(e) => setReviewCadenceDays(Math.max(1, Number(e.target.value) || 180))}
              className="bg-input" 
            />
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lifecycle Automations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Apply labels and workflows as assets age or change state.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-tag new assets</Label>
              <p className="text-xs text-muted-foreground">Apply a "new-asset" tag for visibility.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-tag stale assets</Label>
              <p className="text-xs text-muted-foreground">Apply a "stale-asset" tag when inactive.</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Auto-remove assets on archive</Label>
              <p className="text-xs text-muted-foreground">
                Hide archived assets from default views.
              </p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Lifecycle Audit Log</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Recent lifecycle state changes across your asset inventory.
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            View Full Log
          </Button>
        </div>
        
        <div className="space-y-2">
          {[
            { asset: 'legacy-srv-03', from: 'Stale', to: 'Archived', when: '2 hours ago', by: 'System' },
            { asset: 'db-backup-02', from: 'Active', to: 'Stale', when: '1 day ago', by: 'System' },
            { asset: 'web-prod-01', from: 'Stale', to: 'Active', when: '3 days ago', by: 'admin@example.com' },
          ].map((entry, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono">{entry.asset}</span>
                <Badge variant="outline" className="text-[9px]">{entry.from}</Badge>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
                <Badge variant="outline" className="text-[9px]">{entry.to}</Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span>{entry.when}</span>
                <span>•</span>
                <span>{entry.by}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Auto-Merge & Dedupe</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidate duplicate assets detected across sensors and data sources.
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Enable auto-merge</Label>
              <p className="text-xs text-muted-foreground">
                Merge assets automatically when high-confidence matches are detected.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Merge threshold (confidence %)</Label>
              <Input type="number" min={50} max={100} defaultValue={90} className="bg-input" />
            </div>
            <div className="space-y-2">
              <Label>Retain merged aliases (days)</Label>
              <Input type="number" min={1} defaultValue={30} className="bg-input" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>Save Lifecycle Settings</Button>
      </div>
    </div>
  );
}
