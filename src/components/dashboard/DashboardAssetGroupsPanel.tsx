import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useMemo } from "react";
import { Search, Pin, ChevronRight, Sparkles, Settings, FolderOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TOTAL_MANAGED_ASSETS } from "@/data/dashboard-mock-data";

interface AssetGroupItem {
  id: string;
  name: string;
  count: number;
  color: string;
  isSystem?: boolean;
  source?: 'system' | 'user' | 'ai_suggested';
  status?: string;
  parentId?: string;
}

interface DashboardAssetGroupsPanelProps {
  groups: AssetGroupItem[];
  totalAssets: number;
  onGroupClick?: (groupId: string) => void;
}

export const DashboardAssetGroupsPanel = ({
  groups,
  onGroupClick,
}: DashboardAssetGroupsPanelProps) => {
  const [activeTab, setActiveTab] = useState<"internal" | "external">("internal");
  const [searchQuery, setSearchQuery] = useState("");
  const [pinnedGroups, setPinnedGroups] = useState<Set<string>>(new Set(['grp-critical', 'grp-dmz']));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['system', 'user']));

  // Use the consistent total from mock data
  const displayTotal = TOTAL_MANAGED_ASSETS;

  // Categorize groups by Internal vs External (based on locality focus)
  const internalGroups = useMemo(() => 
    groups.filter(g => 
      !g.name.toLowerCase().includes('external') && 
      !g.name.toLowerCase().includes('saas') &&
      !g.name.toLowerCase().includes('partner') &&
      !g.name.toLowerCase().includes('third-party')
    ), [groups]);

  const externalGroups = useMemo(() => 
    groups.filter(g => 
      g.name.toLowerCase().includes('external') || 
      g.name.toLowerCase().includes('saas') ||
      g.name.toLowerCase().includes('partner') ||
      g.name.toLowerCase().includes('third-party')
    ), [groups]);

  const displayGroups = activeTab === "internal" ? internalGroups : externalGroups;

  // Filter by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return displayGroups;
    const query = searchQuery.toLowerCase();
    return displayGroups.filter(g => g.name.toLowerCase().includes(query));
  }, [displayGroups, searchQuery]);

  // Separate by source type
  const systemGroups = filteredGroups.filter(g => g.source === 'system' || g.isSystem);
  const userGroups = filteredGroups.filter(g => g.source === 'user' && !g.isSystem);
  const aiGroups = filteredGroups.filter(g => g.source === 'ai_suggested');
  const pinned = filteredGroups.filter(g => pinnedGroups.has(g.id));

  const togglePin = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const pieData = filteredGroups.slice(0, 8).map((g, i) => ({
    name: g.name,
    value: g.count,
    color: g.color || `hsl(var(--chart-${(i % 5) + 1}))`,
  }));

  const GroupItem = ({ group, index }: { group: AssetGroupItem; index: number }) => (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-colors group"
      onClick={() => onGroupClick?.(group.id)}
    >
      <div 
        className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
        style={{ backgroundColor: group.color || `hsl(var(--chart-${(index % 5) + 1}))` }}
      />
      <span className="text-xs text-foreground truncate flex-1">{group.name}</span>
      <span className="text-xs font-mono text-muted-foreground">{group.count}</span>
      <button
        onClick={(e) => togglePin(group.id, e)}
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity p-0.5",
          pinnedGroups.has(group.id) && "opacity-100 text-primary"
        )}
      >
        <Pin className="h-3 w-3" />
      </button>
    </div>
  );

  const GroupSection = ({ 
    title, 
    icon: Icon, 
    groups, 
    sectionKey,
    badge 
  }: { 
    title: string; 
    icon: React.ElementType; 
    groups: AssetGroupItem[]; 
    sectionKey: string;
    badge?: string;
  }) => {
    if (groups.length === 0) return null;
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleSection(sectionKey)}>
        <CollapsibleTrigger className="flex items-center gap-2 w-full py-1.5 px-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
          <Icon className="h-3 w-3" />
          <span>{title}</span>
          {badge && (
            <Badge variant="secondary" className="ml-auto text-[9px] h-4 px-1">
              {badge}
            </Badge>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="ml-2 border-l border-border/50 pl-2 space-y-0.5">
            {groups.map((group, index) => (
              <GroupItem key={group.id} group={group} index={index} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card className="bg-card border-border/50 h-full flex flex-col border-0 rounded-none">
      <CardHeader className="pb-2 flex-shrink-0 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">Asset Groups</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-[10px] font-mono cursor-help">
                {displayTotal} hosts
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">Total managed host assets in inventory. Excludes threat intel lists and IoC feeds.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-7 pl-7 text-xs"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mt-2">
          <TabsList className="h-7 w-full grid grid-cols-2">
            <TabsTrigger value="internal" className="text-xs h-6">Internal</TabsTrigger>
            <TabsTrigger value="external" className="text-xs h-6">External</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 pt-2 px-3">
        {/* Pie Chart */}
        <div className="h-[120px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={45}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <text
                x="50%"
                y="48%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground text-lg font-bold"
              >
                {displayTotal}
              </text>
              <text
                x="50%"
                y="60%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[9px]"
              >
                Assets
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Group List with Sections */}
        <ScrollArea className="flex-1 min-h-0 -mx-1">
          <div className="px-1 space-y-1">
            {/* Pinned Groups */}
            {pinned.length > 0 && (
              <GroupSection 
                title="Pinned" 
                icon={Pin} 
                groups={pinned} 
                sectionKey="pinned" 
              />
            )}

            {/* System Groups */}
            <GroupSection 
              title="System Groups" 
              icon={Settings} 
              groups={systemGroups.filter(g => !pinnedGroups.has(g.id))} 
              sectionKey="system"
              badge={`${systemGroups.length}`}
            />

            {/* User Groups */}
            <GroupSection 
              title="Custom Groups" 
              icon={FolderOpen} 
              groups={userGroups.filter(g => !pinnedGroups.has(g.id))} 
              sectionKey="user"
              badge={`${userGroups.length}`}
            />

            {/* AI Suggested */}
            {aiGroups.length > 0 && (
              <GroupSection 
                title="AI Suggested" 
                icon={Sparkles} 
                groups={aiGroups.filter(g => !pinnedGroups.has(g.id))} 
                sectionKey="ai"
                badge="Review"
              />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
