import { FlowData } from "@/types/asset";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, ArrowUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FlowsTableProps {
  flows: FlowData[];
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1000000) return `${(bytes / 1000000).toFixed(1)} MB`;
  if (bytes >= 1000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${bytes} B`;
};

export const FlowsTable = ({ flows }: FlowsTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlows = flows.filter(flow => 
    flow.sourceIp.includes(searchQuery) ||
    flow.destIp.includes(searchQuery) ||
    flow.application.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="section-title mb-0">Network Flow Analytics</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="text-xs">NetFlow records captured over the last 1 hour showing source/destination communication patterns</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter flows..." 
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
          <Button variant="default" size="sm" className="h-8 bg-primary hover:bg-primary/90">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download PCAP
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">
                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                  Source IP <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold">Dest IP</TableHead>
              <TableHead className="text-xs font-semibold">Protocol</TableHead>
              <TableHead className="text-xs font-semibold">Ports</TableHead>
              <TableHead className="text-xs font-semibold">Application</TableHead>
              <TableHead className="text-xs font-semibold text-right">Bytes</TableHead>
              <TableHead className="text-xs font-semibold text-right">Packets</TableHead>
              <TableHead className="text-xs font-semibold">Direction</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFlows.map((flow) => (
              <TableRow 
                key={flow.id} 
                className="hover:bg-secondary/50 cursor-pointer text-sm"
              >
                <TableCell className="font-mono text-xs">{flow.sourceIp}</TableCell>
                <TableCell className="font-mono text-xs">{flow.destIp}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs font-mono">
                    {flow.protocol}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {flow.sourcePort} → {flow.destPort}
                </TableCell>
                <TableCell className="text-xs">{flow.application}</TableCell>
                <TableCell className="text-right font-mono text-xs">{formatBytes(flow.bytes)}</TableCell>
                <TableCell className="text-right font-mono text-xs">{flow.packets.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs',
                      flow.direction === 'inbound' 
                        ? 'bg-traffic-in/10 text-traffic-in border-traffic-in/30'
                        : 'bg-traffic-out/10 text-traffic-out border-traffic-out/30'
                    )}
                  >
                    {flow.direction === 'inbound' ? '↓ IN' : '↑ OUT'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
