import { useState } from "react";
import { ThreatEvent, MitreCategory, TimelineEvent, ChangeHistoryItem } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, AlertTriangle, AlertCircle, Info, Network, Shield, User, Users, ArrowRight, Clock, List } from "lucide-react";
import { cn } from "@/lib/utils";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityTabProps {
  events: ThreatEvent[];
  mitreCategories: MitreCategory[];
  timelineEvents: TimelineEvent[];
  changeHistory: ChangeHistoryItem[];
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
    case 'high':
      return AlertTriangle;
    case 'medium':
      return AlertCircle;
    default:
      return Info;
  }
};

const getEventIcon = (type: string) => {
  switch (type) {
    case 'network':
      return Network;
    case 'security':
      return Shield;
    case 'peer':
      return Users;
    case 'identity':
      return User;
    default:
      return Network;
  }
};

const getEventColor = (type: string, severity?: string) => {
  if (severity === 'error') return 'text-destructive bg-destructive/10';
  if (severity === 'warning') return 'text-threat-medium bg-threat-medium/10';
  switch (type) {
    case 'security':
      return 'text-destructive bg-destructive/10';
    case 'network':
      return 'text-primary bg-primary/10';
    case 'peer':
      return 'text-traffic-out bg-traffic-out/10';
    case 'identity':
      return 'text-traffic-in bg-traffic-in/10';
    default:
      return 'text-muted-foreground bg-muted';
  }
};

const getChangeTypeColor = (type: string) => {
  switch (type) {
    case 'ip':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'mac':
      return 'bg-traffic-in/10 text-traffic-in border-traffic-in/30';
    case 'hostname':
      return 'bg-traffic-out/10 text-traffic-out border-traffic-out/30';
    case 'peer':
      return 'bg-threat-medium/10 text-threat-medium border-threat-medium/30';
    case 'port':
      return 'bg-threat-info/10 text-threat-info border-threat-info/30';
    case 'vlan':
      return 'bg-success/10 text-success border-success/30';
    case 'traffic':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    default:
      return 'bg-muted text-muted-foreground border-muted-foreground/30';
  }
};

export const ActivityTab = ({ events, mitreCategories, timelineEvents, changeHistory }: ActivityTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'events' | 'timeline'>('events');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const filteredTimelineEvents = timelineEvents.filter(event => {
    return event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const highCount = events.filter(e => e.severity === 'high').length;
  const mediumCount = events.filter(e => e.severity === 'medium').length;
  const lowCount = events.filter(e => e.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">All security and network events detected</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold font-mono">{events.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">Critical</p>
            <p className="text-2xl font-bold font-mono text-destructive">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">High</p>
            <p className="text-2xl font-bold font-mono text-destructive">{highCount}</p>
          </CardContent>
        </Card>
        <Card className="border-threat-medium/30">
          <CardContent className="pt-6">
            <p className="text-sm text-threat-medium">Medium</p>
            <p className="text-2xl font-bold font-mono text-threat-medium">{mediumCount}</p>
          </CardContent>
        </Card>
        <Card className="border-threat-low/30">
          <CardContent className="pt-6">
            <p className="text-sm text-threat-low">Low</p>
            <p className="text-2xl font-bold font-mono text-threat-low">{lowCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with View Toggle */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="text-base font-semibold">Activity</CardTitle>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'events' | 'timeline')}>
              <TabsList className="h-8">
                <TabsTrigger value="events" className="text-xs gap-1.5 px-3">
                  <List className="h-3.5 w-3.5" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs gap-1.5 px-3">
                  <Clock className="h-3.5 w-3.5" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search activity..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 w-48 text-sm"
              />
            </div>
            {viewMode === 'events' && (
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32 h-8 text-sm">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              More Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'events' ? (
            // Events List View
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const Icon = getSeverityIcon(event.severity);
                return (
                  <div 
                    key={event.id} 
                    className={cn(
                      "p-4 rounded-lg border transition-colors hover:bg-secondary/50 cursor-pointer",
                      event.severity === 'critical' && "border-l-4 border-l-destructive",
                      event.severity === 'high' && "border-l-4 border-l-destructive/70",
                      event.severity === 'medium' && "border-l-4 border-l-threat-medium",
                      event.severity === 'low' && "border-l-4 border-l-threat-low",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Icon className={cn(
                          "h-5 w-5 mt-0.5",
                          event.severity === 'critical' && "text-destructive",
                          event.severity === 'high' && "text-destructive",
                          event.severity === 'medium' && "text-threat-medium",
                          event.severity === 'low' && "text-threat-low",
                        )} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{event.name}</h4>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                'text-xs',
                                event.severity === 'critical' && 'bg-destructive/10 text-destructive border-destructive/30',
                                event.severity === 'high' && 'bg-destructive/10 text-destructive border-destructive/30',
                                event.severity === 'medium' && 'bg-threat-medium/10 text-threat-medium border-threat-medium/30',
                                event.severity === 'low' && 'bg-threat-low/10 text-threat-low border-threat-low/30',
                              )}
                            >
                              {event.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          {event.mitreCategory && (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs font-mono">
                                MITRE: {event.mitreId}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{event.mitreCategory}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Timeline View
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {filteredTimelineEvents.map((event) => {
                      const Icon = getEventIcon(event.type);
                      const colorClasses = getEventColor(event.type, event.severity);
                      
                      return (
                        <div key={event.id} className="relative flex gap-4 pl-4">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className={cn("relative z-10 p-2 rounded-full cursor-help", colorClasses)}>
                                <Icon className="h-4 w-4" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs capitalize">{event.type} event</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm">{event.title}</h4>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {event.type}
                                  </Badge>
                                  {event.severity && (
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        'text-xs',
                                        event.severity === 'error' && 'bg-destructive/10 text-destructive border-destructive/30',
                                        event.severity === 'warning' && 'bg-threat-medium/10 text-threat-medium border-threat-medium/30',
                                        event.severity === 'info' && 'bg-primary/10 text-primary border-primary/30',
                                      )}
                                    >
                                      {event.severity}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{event.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Change History Sidebar */}
              <div className="col-span-4">
                <div className="sticky top-0">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground">Network Changes</h4>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-xs">IP/MAC changes via DHCP/ARP, new peers, port activity</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-3">
                    {changeHistory.map((change) => (
                      <div key={change.id} className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className={cn("text-xs capitalize", getChangeTypeColor(change.changeType))}>
                            {change.changeType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{change.timestamp.split(' ')[0]}</span>
                        </div>
                        <p className="text-sm font-medium">{change.description}</p>
                        {change.oldValue && change.newValue && (
                          <div className="flex items-center gap-2 mt-2 text-xs">
                            <span className="text-muted-foreground truncate max-w-[100px]">{change.oldValue}</span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-foreground truncate max-w-[100px]">{change.newValue}</span>
                          </div>
                        )}
                        {!change.oldValue && change.newValue && (
                          <p className="text-xs text-muted-foreground mt-1">Detected: {change.newValue}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
