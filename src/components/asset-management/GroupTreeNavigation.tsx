import { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  Server,
  Globe,
  Shield,
  Cloud,
  Users,
  ScanLine,
  AlertTriangle,
  MoreHorizontal,
  Plus,
  Sparkles,
  Check,
  X,
  Cpu,
  Eye
} from 'lucide-react';
import { AssetGroup } from '@/types/asset-management';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GroupTreeNavigationProps {
  groups: AssetGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup?: () => void;
  onEditGroup?: (groupId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
  onAcceptAiGroup?: (groupId: string) => void;
  onRejectAiGroup?: (groupId: string) => void;
}

const groupIconLibrary: Record<string, React.ReactNode> = {
  folder: <Folder className="w-4 h-4 text-muted-foreground" />,
  server: <Server className="w-4 h-4 text-muted-foreground" />,
  globe: <Globe className="w-4 h-4 text-muted-foreground" />,
  shield: <Shield className="w-4 h-4 text-muted-foreground" />,
  cloud: <Cloud className="w-4 h-4 text-muted-foreground" />,
  users: <Users className="w-4 h-4 text-muted-foreground" />,
  alert: <AlertTriangle className="w-4 h-4 text-muted-foreground" />,
  scanner: <ScanLine className="w-4 h-4 text-muted-foreground" />,
};

export function GroupTreeNavigation({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onAcceptAiGroup,
  onRejectAiGroup,
}: GroupTreeNavigationProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['system', 'user', 'ai'])
  );

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Filter and categorize groups
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemGroups = filteredGroups.filter(g => g.source === 'system');
  const userGroups = filteredGroups.filter(g => g.source === 'user' && g.status === 'active');
  const aiSuggestedGroups = filteredGroups.filter(g => g.source === 'ai_suggested' && g.status === 'pending_review');

  const totalAssets = groups.reduce((sum, g) => sum + g.assetCount, 0);

  const getGroupIcon = (group: AssetGroup) => {
    if (group.icon && groupIconLibrary[group.icon]) {
      return groupIconLibrary[group.icon];
    }
    
    // Default icons based on source
    if (group.source === 'system') {
      return <Cpu className="w-4 h-4 text-muted-foreground" />;
    }
    if (group.source === 'ai_suggested') {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    return <Folder className="w-4 h-4 text-muted-foreground" />;
  };

  const renderGroupItem = (group: AssetGroup, isAiSuggested = false) => {
    const isSelected = selectedGroupId === group.id;

    return (
      <div
        key={group.id}
        className={cn(
          'group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md transition-colors',
          isSelected 
            ? 'bg-primary/15 text-primary border border-primary/30' 
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
          isAiSuggested && 'border border-dashed border-amber-500/40 bg-amber-500/5'
        )}
      >
        <div 
          className="flex items-center gap-2 flex-1 min-w-0"
          onClick={() => onSelectGroup(group.id)}
        >
          {getGroupIcon(group)}
          <span className="truncate flex-1">{group.name}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
            {group.assetCount}
          </span>
        </div>

        {isAiSuggested && group.aiMetadata && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/10 text-amber-600 border-amber-500/30"
                  >
                    {Math.round(group.aiMetadata.confidence * 100)}%
                  </Badge>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcceptAiGroup?.(group.id);
                    }}
                    className="p-1 rounded hover:bg-green-500/20 text-green-600 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRejectAiGroup?.(group.id);
                    }}
                    className="p-1 rounded hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="font-medium mb-1">{group.aiMetadata.clusteringMethod} clustering</p>
                <p className="text-xs text-muted-foreground">{group.aiMetadata.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {!isAiSuggested && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEditGroup?.(group.id)}>
                <Eye className="w-3.5 h-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              {group.source !== 'system' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDeleteGroup?.(group.id)}
                  >
                    Delete Group
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  const renderSection = (
    id: string,
    title: string,
    icon: React.ReactNode,
    sectionGroups: AssetGroup[],
    options?: { isAiSection?: boolean; badge?: React.ReactNode }
  ) => {
    const isExpanded = expandedSections.has(id);
    const sectionAssetCount = sectionGroups.reduce((sum, g) => sum + g.assetCount, 0);

    if (sectionGroups.length === 0 && !options?.isAiSection) return null;

    return (
      <div key={id} className="mb-3">
        <button
          onClick={() => toggleSection(id)}
          className={cn(
            'flex items-center gap-2 w-full px-2 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors',
            'text-muted-foreground/80 hover:bg-secondary hover:text-foreground'
          )}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          {icon}
          <span className="flex-1 text-left">{title}</span>
          {options?.badge}
          <span className="text-[10px] font-normal text-muted-foreground/60 tabular-nums">
            {sectionGroups.length} / {sectionAssetCount}
          </span>
        </button>

        {isExpanded && (
          <div className="mt-1 ml-2 space-y-1">
            {sectionGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 px-3 py-2 italic">
                No suggestions at this time
              </p>
            ) : (
              sectionGroups.map(group => renderGroupItem(group, options?.isAiSection))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <input
          type="text"
          placeholder="Filter groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* All Assets */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2.5 text-sm font-medium cursor-pointer rounded-md transition-colors',
            selectedGroupId === null 
              ? 'bg-primary/15 text-primary border border-primary/30' 
              : 'text-foreground hover:bg-secondary'
          )}
          onClick={() => onSelectGroup(null)}
        >
          <Server className="w-4 h-4" />
          <span className="flex-1">All Assets</span>
          <span className="text-xs text-muted-foreground tabular-nums">{totalAssets}</span>
        </div>

        <div className="h-px bg-border my-3" />

        {/* System Groups */}
        {renderSection(
          'system',
          'System Groups',
          <Cpu className="w-3.5 h-3.5" />,
          systemGroups
        )}

        {/* User Groups */}
        {renderSection(
          'user',
          'Custom Groups',
          <Folder className="w-3.5 h-3.5" />,
          userGroups
        )}

        {/* AI-Suggested Groups */}
        {renderSection(
          'ai',
          'AI Suggestions',
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />,
          aiSuggestedGroups,
          { 
            isAiSection: true,
            badge: aiSuggestedGroups.length > 0 && (
              <Badge className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-600 border-0">
                {aiSuggestedGroups.length} new
              </Badge>
            )
          }
        )}
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={onCreateGroup}
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Group
        </button>
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors">
            Import
          </button>
          <button className="flex-1 px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-md hover:bg-secondary transition-colors">
            Export
          </button>
        </div>
        <a
          href="/host-groups-import-sample.csv"
          download
          className="block text-center text-xs text-primary hover:underline"
        >
          Download sample CSV
        </a>
      </div>
    </div>
  );
}
