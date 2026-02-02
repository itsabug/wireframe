import { useState } from "react";
import { FlowData, Peer, ConversationData } from "@/types/asset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Network, 
  ChevronDown, 
  ChevronUp,
  Search,
  Download,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkAnalyticsTabProps {
  flows: FlowData[];
  peers: Peer[];
  conversations: ConversationData[];
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`;
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const NetworkAnalyticsTab = ({ flows, peers, conversations }: NetworkAnalyticsTabProps) => {
  const [showAllConversations, setShowAllConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllFlows, setShowAllFlows] = useState(false);

  const sourcePeers = peers.filter((_, i) => i < 5);
  const destPeers = peers.filter((_, i) => i >= 5 || peers.length <= 5);

  const topTalkers = Array.from(
    flows.reduce((acc, flow) => {
      const ip = flow.direction === 'outbound' ? flow.destIp : flow.sourceIp;
      const key = `${flow.direction}-${ip}`;
      const existing = acc.get(key);

      if (existing) {
        existing.bytes += flow.bytes;
        return acc;
      }

      acc.set(key, { ip, bytes: flow.bytes, direction: flow.direction });
      return acc;
    }, new Map<string, { ip: string; bytes: number; direction: 'inbound' | 'outbound' }>())
  )
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);

  const filteredConversations = conversations.filter(conv =>
    conv.sourceIp.includes(searchQuery) ||
    conv.destIp.includes(searchQuery) ||
    conv.application.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedConversations = showAllConversations ? filteredConversations : filteredConversations.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Source/Destination Analysis */}
      <div className="grid grid-cols-2 gap-4">
        {/* Source Analysis */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-chart-2" />
              Source Analysis (Outbound)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ScrollArea className="h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Peer</TableHead>
                    <TableHead className="text-xs">IP Address</TableHead>
                    <TableHead className="text-xs">Conn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(sourcePeers.length > 0 ? sourcePeers : peers).map((peer, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium truncate max-w-[100px]">{peer.name}</TableCell>
                      <TableCell className="text-xs font-mono">{peer.ip}</TableCell>
                      <TableCell className="text-xs">{peer.connectionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Destination Analysis */}
        <Card>
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ArrowDownLeft className="h-4 w-4 text-primary" />
              Destination Analysis (Inbound)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <ScrollArea className="h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Peer</TableHead>
                    <TableHead className="text-xs">IP Address</TableHead>
                    <TableHead className="text-xs">Conn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(destPeers.length > 0 ? destPeers : peers).map((peer, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs font-medium truncate max-w-[100px]">{peer.name}</TableCell>
                      <TableCell className="text-xs font-mono">{peer.ip}</TableCell>
                      <TableCell className="text-xs">{peer.connectionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Top Talkers */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            Top Talkers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {topTalkers.length > 0 ? (
            <div className="grid grid-cols-5 gap-3">
              {topTalkers.map((talker, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">#{index + 1}</span>
                    <span className="font-mono text-xs">{talker.ip}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      talker.direction === 'inbound' ? 'text-primary border-primary/30' : 'text-traffic-out border-traffic-out/30'
                    )}>
                      {talker.direction === 'inbound' ? '↓' : '↑'}
                    </Badge>
                    <span className="font-mono text-xs">{formatBytes(talker.bytes)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No flow data available for top talkers.</div>
          )}
        </CardContent>
      </Card>

      {/* Conversations - Expandable */}
      <Card>
        <Collapsible open={showAllConversations} onOpenChange={setShowAllConversations}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              Conversations
              <Badge variant="secondary" className="text-xs">{conversations.length}</Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Filter..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-7 w-36 text-xs"
                />
              </div>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  {showAllConversations ? (
                    <>Show Less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>Show All <ChevronDown className="h-3 w-3" /></>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-xs font-semibold">Source IP</TableHead>
                    <TableHead className="text-xs font-semibold w-8"></TableHead>
                    <TableHead className="text-xs font-semibold">Destination IP</TableHead>
                    <TableHead className="text-xs font-semibold">Application</TableHead>
                    <TableHead className="text-xs font-semibold">Duration</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Bytes In</TableHead>
                    <TableHead className="text-xs font-semibold text-right">Bytes Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedConversations.map((conv) => (
                    <TableRow key={conv.id} className="hover:bg-secondary/50">
                      <TableCell className="font-mono text-xs">{conv.sourceIp}</TableCell>
                      <TableCell>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{conv.destIp}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {conv.application}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{conv.duration}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-primary">{formatBytes(conv.bytesIn)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-traffic-out">{formatBytes(conv.bytesOut)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <CollapsibleContent>
              {/* This expands the table to show all conversations */}
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>

      {/* Flow Summary - Expandable */}
      <Card>
        <Collapsible open={showAllFlows} onOpenChange={setShowAllFlows}>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              Flow Connections
              <Badge variant="secondary" className="text-xs">{flows.length}</Badge>
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                {showAllFlows ? (
                  <>Show Less <ChevronUp className="h-3 w-3" /></>
                ) : (
                  <>Show All <ChevronDown className="h-3 w-3" /></>
                )}
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Source IP</TableHead>
                  <TableHead className="text-xs">Destination IP</TableHead>
                  <TableHead className="text-xs">Protocol</TableHead>
                  <TableHead className="text-xs">Port</TableHead>
                  <TableHead className="text-xs">Bytes</TableHead>
                  <TableHead className="text-xs">Packets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(showAllFlows ? flows : flows.slice(0, 5)).map((flow, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{flow.sourceIp}</TableCell>
                    <TableCell className="text-xs font-mono">{flow.destIp}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{flow.protocol}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{flow.destPort}</TableCell>
                    <TableCell className="text-xs">{flow.bytes}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{flow.packets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Collapsible>
      </Card>
    </div>
  );
};
