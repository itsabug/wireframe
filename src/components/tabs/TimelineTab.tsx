import { TimelineEvent, ChangeHistoryItem } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Network, Shield, User, Users, ArrowRight, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TimelineTabProps {
  timelineEvents: TimelineEvent[];
  changeHistory: ChangeHistoryItem[];
}

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

export const TimelineTab = ({ timelineEvents, changeHistory }: TimelineTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredEvents = timelineEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || event.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Timeline Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total Events</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">All network-detectable events in the last 24 hours</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold font-mono">{timelineEvents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Security Events</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Anomalies and detections with MITRE mapping</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold font-mono text-destructive">
              {timelineEvents.filter(e => e.type === 'security').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Network Events</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Bandwidth, port, and traffic pattern changes</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold font-mono text-primary">
              {timelineEvents.filter(e => e.type === 'network').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Identity Changes</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">IP, MAC, hostname, and VLAN changes detected via DHCP/ARP</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl font-bold font-mono">
              {timelineEvents.filter(e => e.type === 'identity').length + changeHistory.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Timeline */}
        <div className="col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Activity Timeline</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search timeline..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 w-48 text-sm"
                  />
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
                
                <div className="space-y-4">
                  {filteredEvents.map((event) => {
                    const Icon = getEventIcon(event.type);
                    const colorClasses = getEventColor(event.type, event.severity);
                    
                    return (
                      <div key={event.id} className="relative flex gap-4 pl-4">
                        {/* Timeline dot */}
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
                        
                        {/* Event content */}
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
            </CardContent>
          </Card>
        </div>

        {/* Change History Sidebar */}
        <div className="col-span-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Network Change History</CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">Changes detected via network packets: IP/MAC changes (DHCP/ARP), new peers, port activity, VLAN changes</p>
                </TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
