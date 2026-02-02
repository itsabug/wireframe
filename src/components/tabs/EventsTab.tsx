import { ThreatEvent, MitreCategory } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { MitreAttackCard } from "../MitreAttackCard";

interface EventsTabProps {
  events: ThreatEvent[];
  mitreCategories: MitreCategory[];
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

export const EventsTab = ({ events, mitreCategories }: EventsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const criticalCount = events.filter(e => e.severity === 'critical').length;
  const highCount = events.filter(e => e.severity === 'high').length;
  const mediumCount = events.filter(e => e.severity === 'medium').length;
  const lowCount = events.filter(e => e.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Event Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Events</p>
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

      {/* MITRE ATT&CK Card */}
      <MitreAttackCard categories={mitreCategories} totalEvents={events.length} />

      {/* Events List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Threat Events</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 w-48 text-sm"
              />
            </div>
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
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              More Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
