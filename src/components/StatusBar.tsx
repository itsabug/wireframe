import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertTriangle, Info, Bell, Shield, ChevronUp } from "lucide-react";

interface StatusBarProps {
  className?: string;
}

export const StatusBar = ({ className }: StatusBarProps) => {
  return (
    <div className={cn(
      "h-8 bg-[hsl(var(--status-bar))] text-[hsl(var(--status-bar-foreground))] flex items-center justify-between px-4 text-xs font-mono",
      className
    )}>
      {/* Left: health summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-3.5 w-3.5 text-[hsl(var(--status-active))]" />
          <span className="font-semibold text-[hsl(var(--status-active))]">17</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="h-3.5 w-3.5 text-[hsl(var(--threat-critical))]" />
          <span className="font-semibold text-[hsl(var(--threat-critical))]">5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--threat-medium))]" />
          <span className="font-semibold text-[hsl(var(--threat-medium))]">1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-[hsl(var(--threat-info))]" />
          <span className="font-semibold text-[hsl(var(--threat-info))]">3</span>
        </div>
        <span className="text-[hsl(var(--status-bar-foreground))] opacity-50 mx-1">|</span>
        <div className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          <span>245</span>
        </div>
      </div>

      {/* Center: status message */}
      <div className="flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[hsl(var(--threat-critical))] animate-pulse" />
        <span className="text-[hsl(var(--status-bar-foreground))]">
          Microsoft Exchange Mailbox Assistants Service is Down
        </span>
        <span className="opacity-50 ml-1">5 Seconds ago</span>
        <button className="flex items-center gap-0.5 ml-2 text-[hsl(var(--status-bar-foreground))] hover:text-white transition-colors">
          Expand <ChevronUp className="h-3 w-3" />
        </button>
      </div>

      {/* Right: discovery status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Discovery in Progress</span>
        </div>
      </div>
    </div>
  );
};
