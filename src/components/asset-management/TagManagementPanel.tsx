import { useEffect, useState } from 'react';
import { TagDefinition } from '@/types/asset-management';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit2, Plus, Tag, Trash2, X, Zap, Settings2 } from 'lucide-react';

interface TagManagementPanelProps {
  tags: TagDefinition[];
  onCreateTag?: (tag: TagDefinition) => void;
  onEditTag?: (tag: TagDefinition) => void;
  onDeleteTag?: (tagId: string) => void;
}

interface AutoTagCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface AutoTagRule {
  id: string;
  name: string;
  tag: string;
  enabled: boolean;
  match: 'all' | 'any';
  conditions: AutoTagCondition[];
}

const packetFields = [
  { value: 'src_ip', label: 'Source IP' },
  { value: 'dst_ip', label: 'Destination IP' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'src_port', label: 'Source Port' },
  { value: 'dst_port', label: 'Destination Port' },
  { value: 'application', label: 'Application' },
];

const packetOperators = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'matches_regex', label: 'matches regex' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
];

export function TagManagementPanel({
  tags,
  onCreateTag,
  onEditTag,
  onDeleteTag,
}: TagManagementPanelProps) {
  const [catalog, setCatalog] = useState<TagDefinition[]>(tags);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
  });
  const [autoTagRules, setAutoTagRules] = useState<AutoTagRule[]>([
    {
      id: 'auto-tag-1',
      name: 'Tag PCI Web Traffic',
      tag: 'pci',
      enabled: true,
      match: 'all',
      conditions: [
        { id: 'cond-1', field: 'src_ip', operator: 'contains', value: '10.40.' },
        { id: 'cond-2', field: 'dst_ip', operator: 'contains', value: '10.50.' },
      ],
    },
    {
      id: 'auto-tag-2',
      name: 'Tag Scanners',
      tag: 'vulnerability-scanner',
      enabled: true,
      match: 'any',
      conditions: [
        { id: 'cond-3', field: 'src_ip', operator: 'contains', value: '10.0.0.' },
        { id: 'cond-4', field: 'dst_ip', operator: 'contains', value: '10.0.1.' },
      ],
    },
  ]);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState<AutoTagRule>({
    id: '',
    name: '',
    tag: '',
    enabled: true,
    match: 'all',
    conditions: [
      {
        id: 'cond-new-1',
        field: 'src_ip',
        operator: 'equals',
        value: '',
      },
    ],
  });

  useEffect(() => {
    setCatalog(tags);
  }, [tags]);

  const handleStartCreate = () => {
    setShowCreateForm(true);
    setNewTag({ name: '', description: '' });
  };

  const handleCreateTag = () => {
    const trimmedName = newTag.name.trim();
    if (!trimmedName) return;

    const now = new Date().toISOString();
    const createdTag: TagDefinition = {
      id: `tag-${trimmedName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: trimmedName,
      description: newTag.description.trim() || undefined,
      category: 'Uncategorized',
      status: 'proposed',
      createdAt: now,
      updatedAt: now,
    };

    setCatalog((prev) => [createdTag, ...prev]);
    setShowCreateForm(false);
    onCreateTag?.(createdTag);
  };

  const handleStartRuleCreate = () => {
    setShowRuleForm(true);
    setNewRule({
      id: '',
      name: '',
      tag: '',
      enabled: true,
      match: 'all',
      conditions: [
        {
          id: `cond-${Date.now()}`,
          field: 'src_ip',
          operator: 'equals',
          value: '',
        },
      ],
    });
  };

  const handleAddCondition = () => {
    setNewRule((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: `cond-${Date.now()}`,
          field: 'src_ip',
          operator: 'equals',
          value: '',
        },
      ],
    }));
  };

  const handleCreateRule = () => {
    const trimmedName = newRule.name.trim();
    const trimmedTag = newRule.tag.trim();
    if (!trimmedName || !trimmedTag) return;

    const hasEmptyCondition = newRule.conditions.some((condition) => !condition.value.trim());
    if (hasEmptyCondition) return;

    const createdRule: AutoTagRule = {
      ...newRule,
      id: `auto-tag-${Date.now()}`,
      name: trimmedName,
      tag: trimmedTag,
    };

    setAutoTagRules((prev) => [createdRule, ...prev]);
    setShowRuleForm(false);
  };

  const renderRuleConditionForm = () => (
    <div className="space-y-2">
      {newRule.conditions.map((condition, index) => (
        <div key={condition.id} className="space-y-2">
          <div className="grid gap-2 md:grid-cols-[200px_180px_1fr_auto]">
            <Select
              value={condition.field}
              onValueChange={(value) =>
                setNewRule((prev) => ({
                  ...prev,
                  conditions: prev.conditions.map((item, idx) =>
                    idx === index ? { ...item, field: value } : item,
                  ),
                }))
              }
            >
              <SelectTrigger className="bg-input h-9" aria-label="Field">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[180px]">
                {packetFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={condition.operator}
              onValueChange={(value) =>
                setNewRule((prev) => ({
                  ...prev,
                  conditions: prev.conditions.map((item, idx) =>
                    idx === index ? { ...item, operator: value } : item,
                  ),
                }))
              }
            >
              <SelectTrigger className="bg-input h-9" aria-label="Operator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="min-w-[160px]">
                {packetOperators.map((op) => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={condition.value}
              onChange={(e) =>
                setNewRule((prev) => ({
                  ...prev,
                  conditions: prev.conditions.map((item, idx) =>
                    idx === index ? { ...item, value: e.target.value } : item,
                  ),
                }))
              }
              placeholder={condition.operator === 'matches_regex' ? 'e.g., ^10\\.0\\..*$' : 'Value'}
              className="bg-input h-9"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() =>
                setNewRule((prev) => ({
                  ...prev,
                  conditions: prev.conditions.filter((_, idx) => idx !== index),
                }))
              }
              disabled={newRule.conditions.length === 1}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          {(condition.operator === 'matches_regex' ||
            condition.operator === 'contains' ||
            condition.operator === 'starts_with' ||
            condition.operator === 'ends_with') && (
            <div className="ml-0 p-2 bg-muted/50 rounded text-[11px] text-muted-foreground">
              {condition.operator === 'matches_regex' ? (
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Regex Pattern Help:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>
                      <code className="font-mono bg-secondary px-1 rounded">^</code> matches start •{' '}
                      <code className="font-mono bg-secondary px-1 rounded">$</code> matches end
                    </li>
                    <li>
                      <code className="font-mono bg-secondary px-1 rounded">\d+</code> one or more digits •{' '}
                      <code className="font-mono bg-secondary px-1 rounded">.*</code> any characters
                    </li>
                    <li>
                      <code className="font-mono bg-secondary px-1 rounded">\.</code> literal dot (escape special chars
                      with \)
                    </li>
                  </ul>
                  <p className="mt-1">
                    <span className="font-medium">Examples:</span>{' '}
                    <code className="font-mono bg-secondary px-1 rounded">^10\.0\..*$</code> matches{' '}
                    <code className="font-mono">10.0.1.5</code> •{' '}
                    <code className="font-mono bg-secondary px-1 rounded">:443$</code> matches port 443
                  </p>
                </div>
              ) : (
                <p>
                  Pattern matching on {packetFields.find((f) => f.value === condition.field)?.label || condition.field}.
                  For advanced patterns, use "matches regex".
                </p>
              )}
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={handleAddCondition}>
        <Plus className="w-4 h-4 mr-1" />
        Add Condition
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Tag Management</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tags and automation rules for asset categorization.
          </p>
        </div>
      </div>

      <Tabs defaultValue="auto-rules" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="auto-rules" className="gap-2">
            <Zap className="w-4 h-4" />
            Auto-Tag Rules
            {autoTagRules.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {autoTagRules.filter((r) => r.enabled).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="catalog" className="gap-2">
            <Settings2 className="w-4 h-4" />
            Tag Catalog
            {catalog.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                {catalog.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Auto-Tag Rules Tab */}
        <TabsContent value="auto-rules" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Automatically apply tags based on packet-level attributes observed by NDR sensors.
            </p>
            <Button onClick={handleStartRuleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Auto-Tag Rule
            </Button>
          </div>

          {showRuleForm && (
            <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">New Auto-Tag Rule</h4>
                <Button variant="ghost" size="icon" onClick={() => setShowRuleForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Rule Name *</label>
                  <Input
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g., Tag TLS Exfil"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tag *</label>
                  <Select value={newRule.tag} onValueChange={(value) => setNewRule({ ...newRule, tag: value })}>
                    <SelectTrigger className="bg-input" aria-label="Select tag">
                      <SelectValue placeholder="Select tag" />
                    </SelectTrigger>
                    <SelectContent>
                      {catalog.map((tag) => (
                        <SelectItem key={tag.id} value={tag.name}>
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-foreground">Match</label>
                  <Select
                    value={newRule.match}
                    onValueChange={(value) => setNewRule({ ...newRule, match: value as 'all' | 'any' })}
                  >
                    <SelectTrigger className="bg-input h-9 w-[160px]" aria-label="Match type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All conditions</SelectItem>
                      <SelectItem value="any">Any condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {renderRuleConditionForm()}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowRuleForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRule} disabled={!newRule.name.trim() || !newRule.tag.trim()}>
                  Save Rule
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead className="text-right">Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {autoTagRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No auto-tag rules configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  autoTagRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{rule.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Match {rule.match === 'all' ? 'all' : 'any'} conditions
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{rule.tag}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {rule.conditions
                          .map((condition) => `${condition.field} ${condition.operator} ${condition.value}`)
                          .join(' • ')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) =>
                            setAutoTagRules((prev) =>
                              prev.map((item) => (item.id === rule.id ? { ...item, enabled: checked } : item)),
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => setAutoTagRules((prev) => prev.filter((item) => item.id !== rule.id))}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tag Catalog Tab */}
        <TabsContent value="catalog" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Define tags used for whitelisting, policy scoping, and asset categorization.
            </p>
            <Button onClick={handleStartCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Tag
            </Button>
          </div>

          {showCreateForm && (
            <div className="border border-primary/50 rounded-lg p-4 space-y-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Create Tag</h4>
                <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tag Name *</label>
                  <Input
                    value={newTag.name}
                    onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                    placeholder="e.g., pci, finance, internet-facing"
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Input
                    value={newTag.description}
                    onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                    placeholder="Why this tag matters"
                    className="bg-input"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTag} disabled={!newTag.name.trim()}>
                  Save Tag
                </Button>
              </div>
            </div>
          )}

          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No tags configured.
                    </TableCell>
                  </TableRow>
                ) : (
                  catalog.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{tag.description || '—'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onEditTag?.(tag)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => onDeleteTag?.(tag.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
