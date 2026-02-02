import { Asset } from "@/types/asset";
import { ScoreBadge } from "./ScoreBadge";
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
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getStaleInfo } from "@/lib/asset-lifecycle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
  { id: 'events', label: 'Events', count: 27 },
  { id: 'timeline', label: 'Timeline' },
  { id: 'comments', label: 'Comments', count: 2 },
];

const formatLabel = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const AssetHeader = ({ asset, activeTab, onTabChange }: AssetHeaderProps) => {
  const { staleAfterDays } = useLifecycleSettings();
  const { isStale, staleDays } = getStaleInfo(asset.lastSeen, staleAfterDays);
  const statusLabel =
    isStale && staleDays !== null ? `Stale ${staleDays}d` : formatLabel(asset.status);

  const hasTags = asset.tags && asset.tags.length > 0;
  const hasGroups = asset.groupNames && asset.groupNames.length > 0;

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Asset Identity */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex-shrink-0">
                <ScoreBadge score={asset.threatScore} label="" size="lg" showLabel={false} />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Threat Score: {asset.threatScore}/100</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="space-y-2 min-w-0 flex-1">
            {/* Row 1: Name + IP + Status badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground font-mono text-sm cursor-help bg-muted/50 px-2 py-0.5 rounded">
                    {asset.ip}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Click to copy IP address</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Status badges inline */}
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0.5",
                    isStale && "text-warning bg-warning/10 border-warning/30",
                  )}
                >
                  {statusLabel}
                </Badge>
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
              </div>
            </div>
            
            {/* Row 2: Device type, role, owner */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{asset.deviceType}</span>
              <span className="opacity-40">•</span>
              <span>{asset.roleTag}</span>
              <span className="opacity-40">•</span>
              <span>Owner: {asset.owner}</span>
            </div>

            {/* Row 3: Tags & Groups in compact hover cards */}
            <div className="flex items-center gap-3">
              {/* Tags hover card */}
              {hasTags && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Tag className="h-3 w-3" />
                      <span>{asset.tags!.length} tag{asset.tags!.length !== 1 ? 's' : ''}</span>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-3" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
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
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}

              {/* Groups hover card */}
              {hasGroups && (
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Layers className="h-3 w-3" />
                      <span>{asset.groupNames!.length} group{asset.groupNames!.length !== 1 ? 's' : ''}</span>
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-64 p-3" align="start">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
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
                    </div>
                  </HoverCardContent>
                </HoverCard>
              )}

              {/* Quick stats */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-3">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-warning" />
                  3 alerts
                </span>
                <span className="opacity-40">•</span>
                <span>
                  Identity: {asset.confidenceScore >= 85 ? "High" : asset.confidenceScore >= 65 ? "Medium" : "Low"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Scores, Metadata and Actions */}
        <div className="flex items-start gap-4 flex-shrink-0">
          {/* Scores */}
          <div className="flex gap-4 border-r border-border pr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold font-mono text-foreground">{asset.confidenceScore}%</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Confidence level in threat assessment based on data quality</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center cursor-help">
                  <p className="text-xs text-muted-foreground">Blast Radius</p>
                  <p className="text-lg font-bold font-mono text-foreground">{asset.blastRadiusScore}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Potential network impact if this asset is compromised</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Timestamps */}
          <div className="flex gap-4 text-sm border-r border-border pr-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-muted-foreground text-xs">First seen</span>
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
                  <span className="text-muted-foreground text-xs">Last Seen</span>
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
          <Tooltip key={tab.id}>
            <TooltipTrigger asChild>
              <button
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
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{tab.label} tab</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};