import { Asset } from "@/types/asset";
import { ScoreBadge } from "./ScoreBadge";
import { LifecycleStatusBadge } from "./LifecycleStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  MessageSquare, 
  UserPlus, 
  Download, 
  ExternalLink, 
  Tag,
  FileText,
  AlertTriangle,
  Flag,
  Eye,
  Copy,
  Layers,
  Play,
  Pause,
  Archive,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getLifecycleStatus } from "@/lib/asset-lifecycle";

interface AssetHeaderProps {
  asset: Asset;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'application', label: 'Application' },
  { id: 'network', label: 'Network Analytics' },
  { id: 'dependencies', label: 'Dependencies' },
  { id: 'topology', label: 'Topology' },
  { id: 'qos', label: 'QoS' },
  { id: 'protocol', label: 'L7 Protocols' },
  { id: 'activity', label: 'Activity', count: 27 },
  { id: 'comments', label: 'Comments', count: 2 },
];

const formatLabel = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const AssetHeader = ({ asset, activeTab, onTabChange }: AssetHeaderProps) => {
  const hasTags = asset.tags && asset.tags.length > 0;
  const hasGroups = asset.groupNames && asset.groupNames.length > 0;

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      {/* Main header row */}
      <div className="flex items-start justify-between gap-6">
        {/* Left: Asset Identity */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Threat Score Badge */}
          <div className="flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <ScoreBadge score={asset.threatScore} label="" size="lg" showLabel={false} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Threat Score: {asset.threatScore}/100</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* Row 1: Name + IP + Lifecycle Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
              <span className="text-muted-foreground font-mono text-sm bg-muted/50 px-2 py-0.5 rounded">
                {asset.ip}
              </span>
              <LifecycleStatusBadge firstSeen={asset.firstSeen} lastSeen={asset.lastSeen} />
            </div>
            
            {/* Row 2: Device metadata */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{asset.deviceType}</span>
              <span className="opacity-40">•</span>
              <span>{asset.roleTag}</span>
              <span className="opacity-40">•</span>
              <span>Owner: {asset.owner}</span>
            </div>

            {/* Row 3: Compact status line with popovers for tags/groups */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status badges */}
              {asset.criticality && (
                <Badge className={`badge-${asset.criticality} text-[10px] px-2 py-0.5`}>
                  {formatLabel(asset.criticality)}
                </Badge>
              )}
              {asset.locality && (
                <Badge className={`badge-${asset.locality} text-[10px] px-2 py-0.5`}>
                  {formatLabel(asset.locality)}
                </Badge>
              )}

              {/* Separator */}
              {(hasTags || hasGroups) && <span className="w-px h-4 bg-border mx-1" />}

              {/* Tags popover */}
              {hasTags && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted/50">
                      <Tag className="h-3 w-3" />
                      {asset.tags!.length}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      Asset Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags!.map((tag, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="text-xs px-2 py-0.5 bg-primary/5 border-primary/20 text-primary"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Groups popover */}
              {hasGroups && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted/50">
                      <Layers className="h-3 w-3" />
                      {asset.groupNames!.length}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Layers className="h-3 w-3" />
                      Group Membership
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.groupNames!.map((group, index) => (
                        <Badge 
                          key={index}
                          variant="secondary" 
                          className="text-xs px-2 py-0.5"
                        >
                          {group}
                        </Badge>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Separator */}
              <span className="w-px h-4 bg-border mx-1" />

              {/* Quick stats inline */}
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <AlertTriangle className="h-3 w-3 text-warning" />
                3 alerts
              </span>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">
                Identity: {asset.confidenceScore >= 85 ? "High" : asset.confidenceScore >= 65 ? "Medium" : "Low"}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Scores and Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Confidence */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help">
                <p className="text-[10px] text-muted-foreground">Confidence</p>
                <p className="text-lg font-bold font-mono text-foreground">{asset.confidenceScore}%</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Confidence level in threat assessment</p>
            </TooltipContent>
          </Tooltip>

          {/* Blast Radius */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center cursor-help">
                <p className="text-[10px] text-muted-foreground">Blast Radius</p>
                <p className="text-lg font-bold font-mono text-foreground">{asset.blastRadiusScore}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">Potential network impact if compromised</p>
            </TooltipContent>
          </Tooltip>

          {/* Timestamps */}
          <div className="flex gap-3 text-sm border-l border-border pl-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-muted-foreground text-[10px]">First seen</span>
                  <p className="font-mono text-foreground text-xs">{asset.firstSeen.split(' ')[0]}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{asset.firstSeen}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-muted-foreground text-[10px]">Last Seen</span>
                  <p className="font-mono text-foreground text-xs">{asset.lastSeen.split(' ')[0]}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{asset.lastSeen}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9">
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {/* Lifecycle Actions */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
                  <RotateCcw className="h-4 w-4" />
                  Change Lifecycle Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {(() => {
                    const status = getLifecycleStatus(asset.firstSeen, asset.lastSeen);
                    return (
                      <>
                        {status !== 'active' && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Play className="h-4 w-4 text-success" />
                            Mark as Active
                          </DropdownMenuItem>
                        )}
                        {status !== 'stale' && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Pause className="h-4 w-4 text-threat-medium" />
                            Mark as Stale
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Archive className="h-4 w-4 text-muted-foreground" />
                          Archive Asset
                        </DropdownMenuItem>
                        {status === 'stale' && (
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <RotateCcw className="h-4 w-4 text-primary" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </>
                    );
                  })()}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <MessageSquare className="h-4 w-4" />
                Add Comment
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserPlus className="h-4 w-4" />
                Assign Owner
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Tag className="h-4 w-4" />
                Manage Tags
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Flag className="h-4 w-4" />
                Flag for Review
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <AlertTriangle className="h-4 w-4" />
                Create Incident
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Add to Watchlist
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <FileText className="h-4 w-4" />
                Generate Report
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Download className="h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Copy className="h-4 w-4" />
                Copy Asset Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive">
                <ExternalLink className="h-4 w-4" />
                Drill to Incident
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 mt-4 -mb-4 border-b border-transparent">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px]',
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground hover:border-muted'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-primary/20" : "bg-muted"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};