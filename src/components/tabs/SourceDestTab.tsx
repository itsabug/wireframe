import { FlowData, Peer } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Globe, Server } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SourceDestTabProps {
  flows: FlowData[];
  peers: Peer[];
  type: 'source' | 'destination';
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`;
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const SourceDestTab = ({ flows, peers, type }: SourceDestTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate data by IP
  const aggregatedData = flows.reduce((acc, flow) => {
    const ip = type === 'source' ? flow.sourceIp : flow.destIp;
    if (!acc[ip]) {
      acc[ip] = { ip, bytes: 0, packets: 0, flows: 0, protocols: new Set<string>() };
    }
    acc[ip].bytes += flow.bytes;
    acc[ip].packets += flow.packets;
    acc[ip].flows += 1;
    acc[ip].protocols.add(flow.protocol);
    return acc;
  }, {} as Record<string, { ip: string; bytes: number; packets: number; flows: number; protocols: Set<string> }>);

  const tableData = Object.values(aggregatedData)
    .sort((a, b) => b.bytes - a.bytes)
    .filter(item => item.ip.includes(searchQuery));

  const internalCount = peers.filter(p => p.type === 'internal').length;
  const externalCount = peers.filter(p => p.type === 'external').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique {type === 'source' ? 'Sources' : 'Destinations'}</p>
                <p className="text-2xl font-bold font-mono">{Object.keys(aggregatedData).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Internal Peers</p>
            <p className="text-2xl font-bold font-mono">{internalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-traffic-out/10 rounded-lg">
                <Globe className="h-5 w-5 text-traffic-out" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">External Peers</p>
                <p className="text-2xl font-bold font-mono">{externalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Data</p>
            <p className="text-2xl font-bold font-mono">{formatBytes(flows.reduce((sum, f) => sum + f.bytes, 0))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">{type === 'source' ? 'Source' : 'Destination'} IP Analysis</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by IP..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-8 w-48 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold">IP Address</TableHead>
                  <TableHead className="text-xs font-semibold">Type</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Bytes</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Packets</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Flows</TableHead>
                  <TableHead className="text-xs font-semibold">Protocols</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((item) => {
                  const peer = peers.find(p => p.ip === item.ip);
                  const isInternal = item.ip.startsWith('10.') || item.ip.startsWith('192.168.') || item.ip.startsWith('172.');
                  
                  return (
                    <TableRow key={item.ip} className="hover:bg-secondary/50">
                      <TableCell className="font-mono text-sm">{item.ip}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'text-xs',
                            isInternal ? 'text-primary border-primary/30' : 'text-traffic-out border-traffic-out/30'
                          )}
                        >
                          {isInternal ? 'Internal' : 'External'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatBytes(item.bytes)}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{item.packets.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{item.flows}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {Array.from(item.protocols).map(proto => (
                            <Badge key={proto} variant="outline" className="text-xs font-mono">
                              {proto}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Peer Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Peer Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {peers.slice(0, 6).map((peer) => (
              <div key={peer.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{peer.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{peer.ip}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={peer.type === 'internal' ? 'text-primary border-primary/30' : 'text-traffic-out border-traffic-out/30'}>
                    {peer.type}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{peer.connectionCount.toLocaleString()} connections</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
