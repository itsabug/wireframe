import { useState } from "react";
import { DNSData, DHCPData, DNSQueryDomain, DNSQueryType, DNSClient, DNSResponseCode } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Search, RotateCcw, ExternalLink, AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ProtocolActivityTabProps {
  dnsData: DNSData;
  dhcpData: DHCPData;
}

type DonutDataItem = DNSQueryDomain | DNSQueryType | DNSClient | DNSResponseCode;

const DonutChart = <T extends DonutDataItem>({ 
  data, 
  dataKey, 
  nameKey, 
  total, 
  centerLabel 
}: { 
  data: T[]; 
  dataKey: keyof T; 
  nameKey: keyof T; 
  total: number;
  centerLabel: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="relative w-48 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            dataKey={dataKey as string}
            nameKey={nameKey as string}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">{total}</span>
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
    <div className="flex-1 space-y-1">
      {data.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground truncate max-w-[120px]">{String(item[nameKey])}</span>
          </div>
          <span className="font-medium">{String(item[dataKey])}</span>
        </div>
      ))}
    </div>
  </div>
);

const CardActions = () => (
  <div className="flex items-center gap-1 text-muted-foreground">
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="p-1 hover:bg-muted rounded">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">Refresh</p></TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="p-1 hover:bg-muted rounded">
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent><p className="text-xs">Expand</p></TooltipContent>
    </Tooltip>
  </div>
);

// DNS Tab Content
const DNSTabContent = ({ dnsData }: { dnsData: DNSData }) => (
  <div className="space-y-4">
    {/* Summary Cards */}
    <div className="grid grid-cols-5 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total DNS Queries</p>
          <p className="text-3xl font-bold">{dnsData.totalQueries}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Unique Domains Queried</p>
          <p className="text-3xl font-bold">{dnsData.uniqueDomains}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total Errors</p>
          <p className="text-3xl font-bold text-destructive">{dnsData.totalErrors}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Average Server Response Time</p>
          <p className="text-3xl font-bold">{dnsData.avgResponseTime}<span className="text-lg text-muted-foreground">ms</span></p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Top DNS Query Type</p>
          <p className="text-3xl font-bold">{dnsData.topQueryType}</p>
        </CardContent>
      </Card>
    </div>

    {/* Charts Row 1 */}
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Top Queried Domains</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DonutChart 
            data={dnsData.topQueriedDomains} 
            dataKey="count" 
            nameKey="domain" 
            total={dnsData.topQueriedDomains.reduce((sum, d) => sum + d.count, 0)}
            centerLabel="Total"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">DNS Server Processing Time</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dnsData.serverProcessingTime}>
                <defs>
                  <linearGradient id="colorDnsTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a3e635" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 100]} />
                <ReferenceLine y={60} stroke="#f97316" strokeDasharray="5 5" label={{ value: '95th Percentile', position: 'left', fontSize: 10, fill: '#f97316' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#a3e635" strokeWidth={2} fillOpacity={1} fill="url(#colorDnsTime)" name="Server Processing Time" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Charts Row 2 */}
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">DNS Query Type Distribution</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DonutChart 
            data={dnsData.queryTypeDistribution} 
            dataKey="count" 
            nameKey="type" 
            total={dnsData.queryTypeDistribution.reduce((sum, d) => sum + d.count, 0)}
            centerLabel="Total"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Top Clients by Query Volume</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DonutChart 
            data={dnsData.topClientsByVolume} 
            dataKey="count" 
            nameKey="name" 
            total={dnsData.topClientsByVolume.reduce((sum, d) => sum + d.count, 0)}
            centerLabel="Clients"
          />
        </CardContent>
      </Card>
    </div>

    {/* Failed Queries Table & Response Codes */}
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Failed DNS Queries</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input className="h-7 w-32 rounded border bg-background pl-7 pr-2 text-xs" placeholder="Search..." />
            </div>
            <CardActions />
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Rogue Server IP</TableHead>
                <TableHead className="text-xs">Total Queries</TableHead>
                <TableHead className="text-xs">Number of Failures</TableHead>
                <TableHead className="text-xs">% Failure Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dnsData.failedQueries.map((query, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium">{query.errorType}</TableCell>
                  <TableCell className="text-sm">{query.totalQueries}</TableCell>
                  <TableCell className="text-sm">{query.failures}</TableCell>
                  <TableCell className="text-sm">{query.failureRate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Page 1 of 10</span>
            <span>View 1 - 1 of 1</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">DNS Response Codes Distribution</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <DonutChart 
            data={dnsData.responseCodeDistribution} 
            dataKey="count" 
            nameKey="code" 
            total={dnsData.responseCodeDistribution.reduce((sum, d) => sum + d.count, 0)}
            centerLabel="Clients"
          />
        </CardContent>
      </Card>
    </div>
  </div>
);

// DHCP Tab Content
const DHCPTabContent = ({ dhcpData }: { dhcpData: DHCPData }) => (
  <div className="space-y-4">
    {/* Summary Cards */}
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Total DHCP Requests</p>
          <p className="text-3xl font-bold">{dhcpData.totalRequests}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Unique Clients</p>
          <p className="text-3xl font-bold">{dhcpData.uniqueClients}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Failure Rate</p>
          <p className="text-3xl font-bold text-green-500">{dhcpData.failureRate}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Average Response Time</p>
          <p className="text-3xl font-bold">{dhcpData.avgResponseTime}<span className="text-lg text-muted-foreground"> ms</span></p>
        </CardContent>
      </Card>
    </div>

    {/* Top Clients by Request & Response Time Trend */}
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Top Clients by Request count</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Client MAC</TableHead>
                <TableHead className="text-xs">Host Name</TableHead>
                <TableHead className="text-xs">Number of requests</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dhcpData.topClientsByRequest.map((client, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-mono">{client.clientMac}</TableCell>
                  <TableCell className="text-sm">{client.hostName}</TableCell>
                  <TableCell className="text-sm font-medium">{client.requests}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">DHCP Response Time Trend</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dhcpData.responseTimeTrend}>
                <defs>
                  <linearGradient id="colorDhcpTime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} label={{ value: 'Time (HH:MM)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 7000]} label={{ value: 'Response Time (ms)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                <ReferenceLine y={6440} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '95th Percentile : 6440 ms', position: 'right', fontSize: 10, fill: '#ef4444' }} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorDhcpTime)" name="Response Time" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Error Volume & Response Time Tables */}
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            Top Clients by Error volume
            {dhcpData.topClientsByError.length === 0 && (
              <span className="text-xs text-muted-foreground">[No Data]</span>
            )}
          </CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {dhcpData.topClientsByError.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Client MAC</TableHead>
                  <TableHead className="text-xs">Host Name</TableHead>
                  <TableHead className="text-xs">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dhcpData.topClientsByError.map((client, i) => (
                  <TableRow key={i} className="bg-red-50 dark:bg-red-950/20">
                    <TableCell className="text-sm font-mono">{client.clientMac}</TableCell>
                    <TableCell className="text-sm">{client.hostName}</TableCell>
                    <TableCell className="text-sm font-medium text-destructive">{client.errors}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-2" />
              No error data available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Top Clients by Response Time (ms)</CardTitle>
          <CardActions />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Client MAC</TableHead>
                  <TableHead className="text-xs">Host Name</TableHead>
                  <TableHead className="text-xs">Response Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dhcpData.topClientsByResponseTime.map((client, i) => (
                  <TableRow key={i} className={client.responseTime > 5000 ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                    <TableCell className="text-sm font-mono">{client.clientMac}</TableCell>
                    <TableCell className="text-sm">{client.hostName}</TableCell>
                    <TableCell className="text-sm font-medium">{client.responseTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>

    {/* Recent Leased Clients */}
    <Card>
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">Recent Leased Clients</CardTitle>
        <CardActions />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Client MAC</TableHead>
              <TableHead className="text-xs">Client IP</TableHead>
              <TableHead className="text-xs">Host Name</TableHead>
              <TableHead className="text-xs">Lease start time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dhcpData.recentLeasedClients.map((client, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-mono">{client.clientMac}</TableCell>
                <TableCell className="text-sm">{client.clientIp}</TableCell>
                <TableCell className="text-sm">{client.hostName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{client.leaseStartTime}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export const ProtocolActivityTab = ({ dnsData, dhcpData }: ProtocolActivityTabProps) => {
  const [selectedProtocol, setSelectedProtocol] = useState<'DNS' | 'DHCP'>('DNS');
  const [trafficDirection, setTrafficDirection] = useState<'client' | 'server'>('client');

  const protocols = [
    { id: 'DNS' as const, label: 'DNS', count: dnsData.totalQueries },
    { id: 'DHCP' as const, label: 'DHCP', count: dhcpData.totalRequests },
  ];

  return (
    <div className="flex gap-4 h-[calc(100vh-220px)]">
      {/* Protocol Navigation Sidebar - Compact */}
      <div className="w-44 flex-shrink-0">
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              L7 Protocols
            </CardTitle>
          </CardHeader>
          <div className="px-2 pb-2 space-y-0.5">
            {protocols.map((protocol) => (
              <Tooltip key={protocol.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setSelectedProtocol(protocol.id)}
                    className={cn(
                      "w-full px-3 py-2.5 rounded-md text-left transition-colors flex items-center justify-between group",
                      selectedProtocol === protocol.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span className="font-medium text-sm">{protocol.label}</span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      selectedProtocol === protocol.id
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted-foreground/10"
                    )}>
                      {protocol.count}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">{protocol.label} Protocol Activity</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="pr-4">
          {/* Header with Traffic Direction Toggle */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{selectedProtocol} Activity</h2>
              <span className="text-sm text-muted-foreground">
                {trafficDirection === 'client' 
                  ? `Showing ${selectedProtocol} queries made by this device`
                  : `Showing ${selectedProtocol} requests received by this device as a server`
                }
              </span>
            </div>
            
            {/* Traffic Direction Toggle - Moved to right pane header */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Direction:</span>
              <ToggleGroup 
                type="single" 
                value={trafficDirection} 
                onValueChange={(value) => value && setTrafficDirection(value as 'client' | 'server')}
                className="bg-muted/50 rounded-lg p-0.5"
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="client" 
                      className={cn(
                        "px-3 py-1.5 text-xs gap-1.5 data-[state=on]:bg-chart-2 data-[state=on]:text-white",
                      )}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Egress
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View outbound {selectedProtocol} requests from this device</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem 
                      value="server" 
                      className={cn(
                        "px-3 py-1.5 text-xs gap-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
                      )}
                    >
                      <ArrowDownLeft className="h-3.5 w-3.5" />
                      Ingress
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">View inbound {selectedProtocol} requests to this device (if it's a {selectedProtocol} server)</p>
                  </TooltipContent>
                </Tooltip>
              </ToggleGroup>
            </div>
          </div>
          
          {selectedProtocol === 'DNS' && <DNSTabContent dnsData={dnsData} />}
          {selectedProtocol === 'DHCP' && <DHCPTabContent dhcpData={dhcpData} />}
        </div>
      </ScrollArea>
    </div>
  );
};
