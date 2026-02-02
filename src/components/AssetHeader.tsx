import { Asset } from "@/types/asset";
import { ScoreBadge } from "./ScoreBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  MoreHorizontal, 
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
  Trash2
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

  return (
    <div className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-start justify-between">
        {/* Left: Asset Identity */}
        <div className="flex items-center gap-4">
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
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-muted-foreground font-mono text-sm cursor-help">{asset.ip}</span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Click to copy IP address</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{asset.deviceType}</span>
              <span className="opacity-40">•</span>
              <span>{asset.roleTag}</span>
              <span className="opacity-40">•</span>
              <span>Owner: {asset.owner}</span>
            </div>
            {/* Tags */}
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {asset.tags.map((tag, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-2 py-0 cursor-help bg-primary/5 border-primary/20 text-primary"
                      >
                        {tag}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Asset tag: {tag}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                Open Alerts: 3
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                Incident: None
              </Badge>
              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                Identity: {asset.confidenceScore >= 85 ? "High" : asset.confidenceScore >= 65 ? "Medium" : "Low"}
              </Badge>
            </div>
            {(asset.status || asset.criticality || asset.locality || asset.groupNames?.length) && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] px-2 py-0",
                    isStale && "text-warning bg-warning/10 border-warning/30",
                  )}
                >
                  {statusLabel}
                </Badge>
                {asset.criticality && (
                  <Badge className={`badge-${asset.criticality} text-[10px] px-2 py-0`}>
                    {formatLabel(asset.criticality)}
                  </Badge>
                )}
                {asset.locality && (
                  <Badge className={`badge-${asset.locality} text-[10px] px-2 py-0`}>
                    {formatLabel(asset.locality)}
                  </Badge>
                )}
                {asset.groupNames && asset.groupNames.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    Groups: {asset.groupNames.length}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Scores, Metadata and Actions */}
        <div className="flex items-start gap-6">
          {/* Scores */}
          <div className="flex gap-4">
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
          <div className="flex gap-4 text-sm border-l border-border pl-4">
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
          
          {/* Actions Dropdown - Fixed alignment */}
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
