import { Badge } from "@/components/ui/badge";
import { useLifecycleSettings } from "@/state/lifecycleSettings";
import { getDaysSince } from "@/lib/asset-lifecycle";
import { Sparkles, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleStatusBadgeProps {
  firstSeen: string;
  lastSeen: string;
  className?: string;
}

export type LifecycleStatus = "new" | "active" | "stale";

export const getLifecycleStatus = (
  firstSeen: string,
  lastSeen: string,
  newAssetHighlightDays: number,
  staleAfterDays: number
): LifecycleStatus => {
  const lastSeenDays = getDaysSince(lastSeen);
  const firstSeenDays = getDaysSince(firstSeen);

  // Check stale first (highest priority for warning)
  if (lastSeenDays !== null && lastSeenDays > staleAfterDays) {
    return "stale";
  }

  // Check if new
  if (firstSeenDays !== null && firstSeenDays <= newAssetHighlightDays) {
    return "new";
  }

  return "active";
};

export const LifecycleStatusBadge = ({ firstSeen, lastSeen, className }: LifecycleStatusBadgeProps) => {
  const { newAssetHighlightDays, staleAfterDays } = useLifecycleSettings();
  
  const status = getLifecycleStatus(firstSeen, lastSeen, newAssetHighlightDays, staleAfterDays);
  const lastSeenDays = getDaysSince(lastSeen);
  const firstSeenDays = getDaysSince(firstSeen);

  if (status === "new") {
    return (
      <Badge 
        className={cn(
          "bg-emerald-500/20 text-emerald-600 border-emerald-500/30 gap-1",
          className
        )}
      >
        <Sparkles className="h-3 w-3" />
        New
        <span className="text-[10px] opacity-75">
          ({firstSeenDays === 0 ? 'today' : `${firstSeenDays}d ago`})
        </span>
      </Badge>
    );
  }

  if (status === "stale") {
    return (
      <Badge 
        className={cn(
          "bg-amber-500/20 text-amber-600 border-amber-500/30 gap-1",
          className
        )}
      >
        <AlertTriangle className="h-3 w-3" />
        Stale
        <span className="text-[10px] opacity-75">
          ({lastSeenDays}d ago)
        </span>
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(
        "bg-blue-500/20 text-blue-600 border-blue-500/30 gap-1",
        className
      )}
    >
      <Activity className="h-3 w-3" />
      Active
    </Badge>
  );
};
