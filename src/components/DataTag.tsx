import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DataTagProps {
  value: string;
  isCurrent?: boolean;
  showInfo?: boolean;
  className?: string;
}

export const DataTag = ({ value, isCurrent = false, showInfo = false, className }: DataTagProps) => {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'font-mono text-xs gap-1.5 py-1 px-2.5',
        isCurrent && 'bg-primary/15 text-primary border border-primary/30',
        className
      )}
    >
      {value}
      {isCurrent && <span className="text-[10px] opacity-70">(Current)</span>}
      {showInfo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 opacity-50 hover:opacity-100 cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p>Click for details</p>
          </TooltipContent>
        </Tooltip>
      )}
    </Badge>
  );
};
