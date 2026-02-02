import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const getScoreLevel = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

export const ScoreBadge = ({ score, label, size = 'md', showLabel = true }: ScoreBadgeProps) => {
  const level = getScoreLevel(score);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn(
        'rounded-full flex items-center justify-center font-bold font-mono',
        sizeClasses[size],
        level === 'critical' && 'bg-threat-critical/20 text-threat-critical ring-2 ring-threat-critical/40',
        level === 'high' && 'bg-threat-high/20 text-threat-high ring-2 ring-threat-high/40',
        level === 'medium' && 'bg-threat-medium/20 text-threat-medium ring-2 ring-threat-medium/40',
        level === 'low' && 'bg-threat-low/20 text-threat-low ring-2 ring-threat-low/40',
      )}>
        {score}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      )}
    </div>
  );
};
