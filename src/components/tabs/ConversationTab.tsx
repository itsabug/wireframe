import { ConversationData } from "@/types/asset";
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
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, ArrowRight } from "lucide-react";
import { useState } from "react";

interface ConversationTabProps {
  conversations: ConversationData[];
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000000) return `${(bytes / 1000000000).toFixed(1)} GB`;
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const ConversationTab = ({ conversations }: ConversationTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.sourceIp.includes(searchQuery) ||
    conv.destIp.includes(searchQuery) ||
    conv.application.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBytesIn = conversations.reduce((sum, c) => sum + c.bytesIn, 0);
  const totalBytesOut = conversations.reduce((sum, c) => sum + c.bytesOut, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active Conversations</p>
            <p className="text-2xl font-bold font-mono">{conversations.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Bytes In</p>
            <p className="text-2xl font-bold font-mono">{formatBytes(totalBytesIn)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Bytes Out</p>
            <p className="text-2xl font-bold font-mono">{formatBytes(totalBytesOut)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Unique Peers</p>
            <p className="text-2xl font-bold font-mono">
              {new Set([...conversations.map(c => c.sourceIp), ...conversations.map(c => c.destIp)]).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conversations Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Active Conversations</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 w-48 text-sm"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-semibold">Source IP</TableHead>
                  <TableHead className="text-xs font-semibold"></TableHead>
                  <TableHead className="text-xs font-semibold">Destination IP</TableHead>
                  <TableHead className="text-xs font-semibold">Application</TableHead>
                  <TableHead className="text-xs font-semibold">Duration</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Bytes In</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Bytes Out</TableHead>
                  <TableHead className="text-xs font-semibold">Start Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConversations.map((conv) => (
                  <TableRow key={conv.id} className="hover:bg-secondary/50">
                    <TableCell className="font-mono text-xs">{conv.sourceIp}</TableCell>
                    <TableCell>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell className="font-mono text-xs">{conv.destIp}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {conv.application}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{conv.duration}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-primary">{formatBytes(conv.bytesIn)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-traffic-out">{formatBytes(conv.bytesOut)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{conv.startTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Conversation Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversations.slice(0, 4).map((conv) => (
              <div key={conv.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-mono text-sm">{conv.sourceIp}</p>
                  <p className="text-xs text-muted-foreground">Source</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary">{formatBytes(conv.bytesIn)} →</span>
                    <Badge variant="outline" className="text-xs">{conv.application}</Badge>
                    <span className="text-xs text-traffic-out">← {formatBytes(conv.bytesOut)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{conv.duration}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-mono text-sm">{conv.destIp}</p>
                  <p className="text-xs text-muted-foreground">Destination</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
