import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { HistoryItem } from "@/types/asset";
import { Info, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IPHistoryModalProps {
  ipHistory: HistoryItem[];
  children: React.ReactNode;
}

export const IPHistoryModal = ({ ipHistory, children }: IPHistoryModalProps) => {
  // Calculate min and max timestamps for the timeline
  const sortedHistory = [...ipHistory].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  const minTime = sortedHistory.length > 0 ? new Date(sortedHistory[0].timestamp).getTime() : 0;
  const maxTime = sortedHistory.length > 0 ? new Date(sortedHistory[sortedHistory.length - 1].timestamp).getTime() : 0;
  const timeRange = maxTime - minTime || 1;

  // Parse timestamp and calculate position
  const getPosition = (timestamp: string) => {
    const time = new Date(timestamp).getTime();
    return ((time - minTime) / timeRange) * 100;
  };

  // Format date for display
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get first and last seen for each IP
  const ipUsageData = ipHistory.reduce((acc, item) => {
    if (!acc[item.value]) {
      acc[item.value] = { firstSeen: item.timestamp, lastSeen: item.timestamp, isCurrent: item.isCurrent };
    } else {
      const existing = acc[item.value];
      if (new Date(item.timestamp) < new Date(existing.firstSeen)) {
        existing.firstSeen = item.timestamp;
      }
      if (new Date(item.timestamp) > new Date(existing.lastSeen)) {
        existing.lastSeen = item.timestamp;
      }
      if (item.isCurrent) existing.isCurrent = true;
    }
    return acc;
  }, {} as Record<string, { firstSeen: string; lastSeen: string; isCurrent: boolean }>);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">IP Addresses</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4">
          <ScrollArea className="flex-1 max-h-[400px]">
            <div className="space-y-0">
              {/* Header */}
              <div className="grid grid-cols-[160px_1fr] gap-4 py-2 border-b border-border text-xs text-muted-foreground font-medium">
                <div className="flex items-center gap-1">
                  IP Address
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Historical IP addresses assigned to this device</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div>IP Usage</div>
              </div>

              {/* IP Rows */}
              {Object.entries(ipUsageData).map(([ip, data], idx) => {
                const startPos = getPosition(data.firstSeen);
                const endPos = getPosition(data.lastSeen);
                const width = Math.max(endPos - startPos, 2);
                
                return (
                  <div 
                    key={ip}
                    className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-border/50 hover:bg-secondary/30 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono">{ip}</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground/50" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium text-xs">What is this?</p>
                            <p className="text-xs text-muted-foreground">
                              Periods of network activity by the device on each address used between the time the device was first and last seen.
                            </p>
                            <div className="pt-2 space-y-1">
                              <p className="text-xs"><span className="font-medium">First Seen:</span> {formatDate(data.firstSeen)}</p>
                              <p className="text-xs"><span className="font-medium">Last Seen:</span> {formatDate(data.lastSeen)}</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative h-5 flex items-center">
                      {/* Timeline background */}
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-border" />
                      </div>
                      {/* Usage bar */}
                      <div 
                        className={`absolute h-4 rounded-sm transition-all ${data.isCurrent ? 'bg-primary' : 'bg-primary/50'}`}
                        style={{ 
                          left: `${startPos}%`, 
                          width: `${Math.max(width, 1)}%`,
                          minWidth: '4px'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timeline footer */}
            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground px-1">
              <span>{sortedHistory.length > 0 ? formatDate(sortedHistory[0].timestamp) : '-'}</span>
              <span>{sortedHistory.length > 0 ? formatDate(sortedHistory[sortedHistory.length - 1].timestamp) : '-'}</span>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
