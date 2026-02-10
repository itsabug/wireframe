import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HistoryItem } from "@/types/asset";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AddressHistorySheetProps {
  ipHistory: HistoryItem[];
  macHistory: HistoryItem[];
  children: React.ReactNode;
  defaultTab?: "ip" | "mac";
}

const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const TimelineView = ({ history, label }: { history: HistoryItem[]; label: string }) => {
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const minTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : 0;
  const maxTime = sorted.length > 0 ? new Date(sorted[sorted.length - 1].timestamp).getTime() : 0;
  const timeRange = maxTime - minTime || 1;

  // Aggregate per unique address
  const usageData = history.reduce((acc, item) => {
    if (!acc[item.value]) {
      acc[item.value] = { firstSeen: item.timestamp, lastSeen: item.timestamp, isCurrent: item.isCurrent };
    } else {
      const e = acc[item.value];
      if (new Date(item.timestamp) < new Date(e.firstSeen)) e.firstSeen = item.timestamp;
      if (new Date(item.timestamp) > new Date(e.lastSeen)) e.lastSeen = item.timestamp;
      if (item.isCurrent) e.isCurrent = true;
    }
    return acc;
  }, {} as Record<string, { firstSeen: string; lastSeen: string; isCurrent: boolean }>);

  const getPos = (ts: string) => ((new Date(ts).getTime() - minTime) / timeRange) * 100;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-[180px_1fr] gap-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          {label}
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px]">
              <p className="text-xs font-medium mb-1">What is this?</p>
              <p className="text-xs text-muted-foreground">
                Periods of network activity by the device on each address used between the time the device was first and last seen.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div>Usage Timeline</div>
      </div>

      {/* Rows */}
      {Object.entries(usageData).map(([addr, data]) => {
        const startPos = getPos(data.firstSeen);
        const endPos = getPos(data.lastSeen);
        const width = Math.max(endPos - startPos, 2);

        return (
          <div
            key={addr}
            className="grid grid-cols-[180px_1fr] gap-4 py-3 border-b border-border/40 hover:bg-secondary/30 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono truncate">{addr}</span>
              {data.isCurrent && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-success/10 text-success border-success/30 shrink-0">
                  Current
                </Badge>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="relative h-5 flex items-center cursor-help">
                  {/* Timeline track */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  {/* Usage bar */}
                  <div
                    className={`absolute h-4 rounded-sm transition-all ${data.isCurrent ? 'bg-primary' : 'bg-primary/40'}`}
                    style={{
                      left: `${startPos}%`,
                      width: `${Math.max(width, 1)}%`,
                      minWidth: '4px',
                    }}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-xs"><span className="font-medium">First Seen:</span> {formatDate(data.firstSeen)}</p>
                  <p className="text-xs"><span className="font-medium">Last Seen:</span> {formatDate(data.lastSeen)}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}

      {/* Timeline axis */}
      {sorted.length > 0 && (
        <div className="flex justify-between text-[10px] text-muted-foreground pt-2 px-0.5">
          <span>{formatDate(sorted[0].timestamp)}</span>
          <span>{formatDate(sorted[sorted.length - 1].timestamp)}</span>
        </div>
      )}
    </div>
  );
};

export const AddressHistorySheet = ({ ipHistory, macHistory, children, defaultTab = "ip" }: AddressHistorySheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[520px] sm:max-w-[520px] bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <SheetTitle className="text-base font-semibold">Address History</SheetTitle>
          <p className="text-xs text-muted-foreground">
            Historical addresses observed for this device over time.
          </p>
        </SheetHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-5 mt-3 w-fit">
            <TabsTrigger value="ip" className="text-xs gap-1.5">
              IP Addresses
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{ipHistory.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mac" className="text-xs gap-1.5">
              MAC Addresses
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{macHistory.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 min-h-0 px-5 pb-5">
            <TabsContent value="ip" className="mt-3 data-[state=inactive]:hidden">
              <TimelineView history={ipHistory} label="IP Address" />
            </TabsContent>
            <TabsContent value="mac" className="mt-3 data-[state=inactive]:hidden">
              {macHistory.length > 0 ? (
                <TimelineView history={macHistory} label="MAC Address" />
              ) : (
                <p className="text-xs text-muted-foreground py-8 text-center">No MAC history available.</p>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
