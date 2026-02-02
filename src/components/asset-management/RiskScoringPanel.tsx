import { useState } from 'react';
import { BarChart3, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { updateRiskSettings, useRiskSettings } from '@/state/riskSettings';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CriticalityWeight {
  label: string;
  multiplier: number;
}

const defaultCriticalityWeights: CriticalityWeight[] = [
  { label: 'Low impact', multiplier: 0.8 },
  { label: 'Important', multiplier: 1.0 },
  { label: 'Very important', multiplier: 1.2 },
  { label: 'Business critical', multiplier: 1.5 },
];

export function RiskScoringPanel() {
  const [weights, setWeights] = useState(defaultCriticalityWeights);
  const { highRiskThreshold, criticalRiskThreshold } = useRiskSettings();

  const handleHighRiskChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateRiskSettings({ highRiskThreshold: Math.floor(parsed) });
  };

  const handleCriticalRiskChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return;
    updateRiskSettings({ criticalRiskThreshold: Math.floor(parsed) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Risk Scoring</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Tune how detections translate into severity and incident priority.
          </p>
        </div>
        <Button>Save Risk Settings</Button>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Score Weights</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Behavioral anomalies weight</Label>
            <Input type="number" min={0} max={100} defaultValue={35} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Threat intel weight</Label>
            <Input type="number" min={0} max={100} defaultValue={25} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Lateral movement weight</Label>
            <Input type="number" min={0} max={100} defaultValue={20} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Data exfiltration weight</Label>
            <Input type="number" min={0} max={100} defaultValue={20} className="bg-input" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-normal">Normalize weights to 100%</Label>
            <p className="text-xs text-muted-foreground">
              Automatically rebalance weights when values change.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          <h4 className="font-medium text-foreground">Severity Mapping</h4>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>High risk threshold (score ≥)</Label>
            <Input
              type="number"
              min={1}
              max={criticalRiskThreshold - 1}
              value={highRiskThreshold}
              onChange={(event) => handleHighRiskChange(event.target.value)}
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Assets with scores at or above this value are labeled High Risk.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Critical risk threshold (score ≥)</Label>
            <Input
              type="number"
              min={highRiskThreshold + 1}
              max={100}
              value={criticalRiskThreshold}
              onChange={(event) => handleCriticalRiskChange(event.target.value)}
              className="bg-input"
            />
            <p className="text-xs text-muted-foreground">
              Assets with scores at or above this value are labeled Critical Risk.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Low max</Label>
            <Input type="number" min={0} max={100} defaultValue={34} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Medium max</Label>
            <Input type="number" min={0} max={100} defaultValue={59} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>High max</Label>
            <Input type="number" min={0} max={100} defaultValue={84} className="bg-input" />
          </div>
          <div className="space-y-2">
            <Label>Critical max</Label>
            <Input type="number" min={0} max={100} defaultValue={100} className="bg-input" />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-normal">Minimum score to alert</Label>
            <p className="text-xs text-muted-foreground">
              Suppress detections below the threshold.
            </p>
          </div>
          <Input type="number" min={1} defaultValue={30} className="w-24 bg-input" />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Business Impact</TableHead>
              <TableHead>Multiplier</TableHead>
              <TableHead>Example Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weights.map((weight, index) => (
              <TableRow key={weight.label}>
                <TableCell className="font-medium text-foreground">{weight.label}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={0.5}
                    step={0.1}
                    value={weight.multiplier}
                    onChange={(event) => {
                      const next = [...weights];
                      next[index] = {
                        ...weight,
                        multiplier: Number(event.target.value) || 0,
                      };
                      setWeights(next);
                    }}
                    className="w-24 bg-input"
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {weight.label === 'Business critical' ? 'Tier-0 Infra' : 'Core Services'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="border border-border rounded-lg p-5 bg-card space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="confidence-weighting">Confidence weighting</Label>
            <select id="confidence-weighting" className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Confidence weighting">
              <option>Linear (default)</option>
              <option>Conservative</option>
              <option>Aggressive</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="intel-confidence">Threat intel confidence</Label>
            <select id="intel-confidence" className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm" aria-label="Threat intel confidence">
              <option>High confidence only</option>
              <option>Medium and above</option>
              <option>All intel</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Aggregation window</Label>
            <Input type="number" min={1} defaultValue={24} className="bg-input" />
            <p className="text-xs text-muted-foreground">Hours to aggregate related alerts.</p>
          </div>
          <div className="space-y-2">
            <Label>Score decay</Label>
            <Input type="number" min={1} defaultValue={7} className="bg-input" />
            <p className="text-xs text-muted-foreground">Days before scores return to baseline.</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label className="font-normal">Boost score for chained detections</Label>
            <p className="text-xs text-muted-foreground">
              Increase severity when multiple stages are observed.
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    </div>
  );
}
