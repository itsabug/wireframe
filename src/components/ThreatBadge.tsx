import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ThreatBadgeProps {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  children: React.ReactNode;
  className?: string;
}

export const ThreatBadge = ({ severity, children, className }: ThreatBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium text-xs',
        severity === 'critical' && 'bg-threat-critical/15 text-threat-critical border-threat-critical/30',
        severity === 'high' && 'bg-threat-high/15 text-threat-high border-threat-high/30',
        severity === 'medium' && 'bg-threat-medium/15 text-threat-medium border-threat-medium/30',
        severity === 'low' && 'bg-threat-low/15 text-threat-low border-threat-low/30',
        severity === 'info' && 'bg-threat-info/15 text-threat-info border-threat-info/30',
        className
      )}
    >
      {children}
    </Badge>
  );
};
