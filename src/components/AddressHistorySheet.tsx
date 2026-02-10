import { useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HistoryItem } from "@/types/asset";
import { Info, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const formatShortDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
};

interface UsagePeriod {
  start: string;
  end: string;
}

interface AddressUsage {
  address: string;
  isCurrent: boolean;
  periods: UsagePeriod[];
}

/**
 * Groups history items by address and detects distinct usage periods.
 * A gap > gapThresholdMs between consecutive timestamps for the same address
 * creates a new period (re-allocation).
 */
const buildUsageData = (history: HistoryItem[], gapThresholdDays = 14): AddressUsage[] => {
  const gapMs = gapThresholdDays * 24 * 60 * 60 * 1000;

  // Group timestamps by address
  const grouped: Record<string, { timestamps: number[]; isCurrent: boolean }> = {};
  history.forEach((item) => {
    const ts = new Date(item.timestamp).getTime();
    if (!grouped[item.value]) {
      grouped[item.value] = { timestamps: [ts], isCurrent: item.isCurrent };
    } else {
      grouped[item.value].timestamps.push(ts);
      if (item.isCurrent) grouped[item.value].isCurrent = true;
    }
  });

  // Build periods with gap detection
  return Object.entries(grouped).map(([address, data]) => {
    const sorted = [...data.timestamps].sort((a, b) => a - b);
    const periods: UsagePeriod[] = [];
    let periodStart = sorted[0];
    let periodEnd = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] - periodEnd > gapMs) {
        // Gap detected — close current period, start new one
        periods.push({
          start: new Date(periodStart).toISOString(),
          end: new Date(periodEnd).toISOString(),
        });
        periodStart = sorted[i];
      }
      periodEnd = sorted[i];
    }
    // Close final period
    periods.push({
      start: new Date(periodStart).toISOString(),
      end: new Date(periodEnd).toISOString(),
    });

    return { address, isCurrent: data.isCurrent, periods };
  });
};

/** Generate intermediate tick marks for the timeline axis */
const generateTicks = (minTime: number, maxTime: number, count = 5) => {
  const ticks: { pos: number; label: string }[] = [];
  const range = maxTime - minTime;
  if (range <= 0) return ticks;
  for (let i = 0; i <= count; i++) {
    const time = minTime + (range * i) / count;
    ticks.push({
      pos: (i / count) * 100,
      label: formatShortDate(new Date(time).toISOString()),
    });
  }
  return ticks;
};

const TimelineView = ({ history, label, printRef }: { history: HistoryItem[]; label: string; printRef?: React.RefObject<HTMLDivElement> }) => {
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const minTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : 0;
  const maxTime = sorted.length > 0 ? new Date(sorted[sorted.length - 1].timestamp).getTime() : 0;
  const timeRange = maxTime - minTime || 1;

  const usageData = buildUsageData(history);
  const ticks = generateTicks(minTime, maxTime, 5);

  const getPos = (ts: string) => ((new Date(ts).getTime() - minTime) / timeRange) * 100;

  return (
    <div ref={printRef} className="space-y-0">
      {/* Header */}
      <div className="grid grid-cols-[160px_1fr] gap-4 py-2.5 border-b border-border text-xs text-muted-foreground font-medium">
        <div className="flex items-center gap-1.5">
          {label}
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3 w-3" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px]">
              <p className="text-xs font-medium mb-1">What is this?</p>
              <p className="text-xs text-muted-foreground">
                Periods of network activity by the device on each address. The timeline spans the device's full lifetime (first seen to last seen). If the same address is re-allocated after a gap, it shows as separate bars on the same row.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div>Usage Timeline (Device Lifetime)</div>
      </div>

      {/* Rows */}
      {usageData.map((usage) => {
        const isReAllocated = usage.periods.length > 1;
        return (
          <div
            key={usage.address}
            className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-border/40 hover:bg-secondary/30 transition-colors group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono truncate">{usage.address}</span>
              {usage.isCurrent && (
                <Badge variant="outline" className="text-[9px] px-1 py-0 bg-success/10 text-success border-success/30 shrink-0">
                  Current
                </Badge>
              )}
              {isReAllocated && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[9px] px-1 py-0 bg-warning/10 text-warning border-warning/30 shrink-0">
                      ×{usage.periods.length}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">This address was re-allocated {usage.periods.length} times</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="relative h-5 flex items-center">
              {/* Timeline track */}
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-border" />
              </div>
              {/* Tick marks */}
              {ticks.map((tick, i) => (
                <div
                  key={i}
                  className="absolute h-2 w-px bg-border/60"
                  style={{ left: `${tick.pos}%`, top: '50%', transform: 'translateY(-50%)' }}
                />
              ))}
              {/* Usage bars — one per period */}
              {usage.periods.map((period, pIdx) => {
                const startPos = getPos(period.start);
                const endPos = getPos(period.end);
                const width = Math.max(endPos - startPos, 1);
                return (
                  <Tooltip key={pIdx}>
                    <TooltipTrigger asChild>
                      <div
                        className={`absolute h-4 rounded-sm cursor-help transition-all ${usage.isCurrent ? 'bg-primary' : 'bg-primary/40'} ${isReAllocated && pIdx > 0 ? 'border-l-2 border-dashed border-warning' : ''}`}
                        style={{
                          left: `${startPos}%`,
                          width: `${Math.max(width, 0.5)}%`,
                          minWidth: '4px',
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div className="space-y-1">
                        {isReAllocated && (
                          <p className="text-[10px] text-warning font-medium">Period {pIdx + 1} of {usage.periods.length}</p>
                        )}
                        <p className="text-xs"><span className="font-medium">First Seen:</span> {formatDate(period.start)}</p>
                        <p className="text-xs"><span className="font-medium">Last Seen:</span> {formatDate(period.end)}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Timeline axis with ticks */}
      {sorted.length > 0 && (
        <div className="relative h-6 mt-1">
          {ticks.map((tick, i) => (
            <span
              key={i}
              className="absolute text-[9px] text-muted-foreground whitespace-nowrap"
              style={{
                left: `${tick.pos}%`,
                transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                paddingLeft: i === 0 ? '0' : undefined,
              }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 pt-3 border-t border-border/40 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2.5 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted-foreground">Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2.5 rounded-sm bg-primary/40" />
          <span className="text-[10px] text-muted-foreground">Historical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2.5 rounded-sm bg-primary/40 border-l-2 border-dashed border-warning" />
          <span className="text-[10px] text-muted-foreground">Re-allocated</span>
        </div>
      </div>
    </div>
  );
};

const handleExportPDF = (contentRef: React.RefObject<HTMLDivElement>) => {
  if (!contentRef.current) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const content = contentRef.current.innerHTML;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Address History Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; color: #1a1a2e; background: white; }
        h1 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
        .subtitle { font-size: 11px; color: #666; margin-bottom: 16px; }
        .grid-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; padding: 10px 0; border-bottom: 1px solid #e5e5e5; align-items: center; }
        .grid-row.header { font-size: 11px; color: #888; font-weight: 500; border-bottom: 2px solid #ddd; }
        .addr { font-size: 11px; font-family: 'SF Mono', 'Fira Code', monospace; }
        .badge { display: inline-block; font-size: 9px; padding: 1px 5px; border-radius: 3px; margin-left: 6px; }
        .badge-current { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-realloc { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
        .timeline { position: relative; height: 16px; }
        .timeline-track { position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e5e5; }
        .timeline-bar { position: absolute; height: 14px; top: 1px; border-radius: 2px; }
        .bar-current { background: #3b82f6; }
        .bar-historical { background: rgba(59,130,246,0.35); }
        .bar-realloc { border-left: 2px dashed #eab308; }
        .tick-mark { position: absolute; height: 8px; width: 1px; background: #ddd; top: 50%; transform: translateY(-50%); }
        .axis { position: relative; height: 18px; margin-top: 4px; }
        .axis-label { position: absolute; font-size: 8px; color: #999; white-space: nowrap; }
        .period-info { font-size: 9px; color: #666; margin-top: 2px; }
        .legend { display: flex; gap: 16px; margin-top: 12px; padding-top: 10px; border-top: 1px solid #e5e5e5; }
        .legend-item { display: flex; align-items: center; gap: 4px; font-size: 9px; color: #888; }
        .legend-swatch { width: 12px; height: 10px; border-radius: 2px; }
        .footer { margin-top: 24px; font-size: 9px; color: #aaa; border-top: 1px solid #e5e5e5; padding-top: 8px; }
        @media print { body { padding: 12px; } }
      </style>
    </head>
    <body>
      <h1>Address History Report</h1>
      <p class="subtitle">Generated ${new Date().toLocaleString()} — Device Lifetime Timeline</p>
      ${content}
      <div class="footer">
        <p>Report generated from NDR Asset Management Platform</p>
      </div>
      <script>window.onload = function() { window.print(); }</script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

/** Renders a print-friendly version of the timeline */
const PrintableTimeline = ({ history, label, printRef }: { history: HistoryItem[]; label: string; printRef: React.RefObject<HTMLDivElement> }) => {
  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const minTime = sorted.length > 0 ? new Date(sorted[0].timestamp).getTime() : 0;
  const maxTime = sorted.length > 0 ? new Date(sorted[sorted.length - 1].timestamp).getTime() : 0;
  const timeRange = maxTime - minTime || 1;
  const usageData = buildUsageData(history);
  const ticks = generateTicks(minTime, maxTime, 5);
  const getPos = (ts: string) => ((new Date(ts).getTime() - minTime) / timeRange) * 100;

  return (
    <div ref={printRef} style={{ display: 'none' }}>
      <div className="grid-row header">
        <div>{label}</div>
        <div>Usage Timeline (Device Lifetime)</div>
      </div>
      {usageData.map((usage) => (
        <div key={usage.address} className="grid-row">
          <div className="addr">
            {usage.address}
            {usage.isCurrent && <span className="badge badge-current">Current</span>}
            {usage.periods.length > 1 && <span className="badge badge-realloc">×{usage.periods.length}</span>}
            {usage.periods.map((p, i) => (
              <div key={i} className="period-info">
                {usage.periods.length > 1 ? `Period ${i + 1}: ` : ''}{formatDate(p.start)} → {formatDate(p.end)}
              </div>
            ))}
          </div>
          <div>
            <div className="timeline">
              <div className="timeline-track" />
              {ticks.map((tick, i) => (
                <div key={i} className="tick-mark" style={{ left: `${tick.pos}%` }} />
              ))}
              {usage.periods.map((period, pIdx) => {
                const startPos = getPos(period.start);
                const endPos = getPos(period.end);
                const width = Math.max(endPos - startPos, 1);
                return (
                  <div
                    key={pIdx}
                    className={`timeline-bar ${usage.isCurrent ? 'bar-current' : 'bar-historical'} ${pIdx > 0 ? 'bar-realloc' : ''}`}
                    style={{ left: `${startPos}%`, width: `${Math.max(width, 0.5)}%`, minWidth: '3px' }}
                  />
                );
              })}
            </div>
            <div className="axis">
              {ticks.map((tick, i) => (
                <span
                  key={i}
                  className="axis-label"
                  style={{
                    left: `${tick.pos}%`,
                    transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : 'translateX(-50%)',
                  }}
                >
                  {tick.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
      <div className="legend">
        <div className="legend-item"><div className="legend-swatch bar-current" style={{ background: '#3b82f6' }} />Current</div>
        <div className="legend-item"><div className="legend-swatch bar-historical" style={{ background: 'rgba(59,130,246,0.35)' }} />Historical</div>
        <div className="legend-item"><div className="legend-swatch bar-realloc" style={{ background: 'rgba(59,130,246,0.35)', borderLeft: '2px dashed #eab308' }} />Re-allocated</div>
      </div>
    </div>
  );
};

export const AddressHistorySheet = ({ ipHistory, macHistory, children, defaultTab = "ip" }: AddressHistorySheetProps) => {
  const ipPrintRef = useRef<HTMLDivElement>(null);
  const macPrintRef = useRef<HTMLDivElement>(null);

  const uniqueIPs = new Set(ipHistory.map(h => h.value)).size;
  const uniqueMACs = new Set(macHistory.map(h => h.value)).size;

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[560px] sm:max-w-[560px] bg-card border-border p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold">Address History</SheetTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => {
                    // Export whichever tab has data
                    if (ipPrintRef.current) handleExportPDF(ipPrintRef);
                    else if (macPrintRef.current) handleExportPDF(macPrintRef);
                  }}
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Export address history as a printable PDF report</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-muted-foreground">
            Timeline spans the device's full lifetime. Bars show active usage periods per address.
          </p>
        </SheetHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-5 mt-3 w-fit">
            <TabsTrigger value="ip" className="text-xs gap-1.5">
              IP Addresses
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{uniqueIPs}</Badge>
            </TabsTrigger>
            <TabsTrigger value="mac" className="text-xs gap-1.5">
              MAC Addresses
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-1">{uniqueMACs}</Badge>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 min-h-0 px-5 pb-5">
            <TabsContent value="ip" className="mt-3 data-[state=inactive]:hidden">
              <TimelineView history={ipHistory} label="IP Address" />
              <PrintableTimeline history={ipHistory} label="IP Address" printRef={ipPrintRef} />
            </TabsContent>
            <TabsContent value="mac" className="mt-3 data-[state=inactive]:hidden">
              {macHistory.length > 0 ? (
                <>
                  <TimelineView history={macHistory} label="MAC Address" />
                  <PrintableTimeline history={macHistory} label="MAC Address" printRef={macPrintRef} />
                </>
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
