import { Badge } from "@/components/ui/badge";
import { HelpCircle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ScopeChipProps {
  scope: string;
  timeWindow?: string;
  className?: string;
}

export const ScopeChip = ({ scope, timeWindow, className }: ScopeChipProps) => {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 border-border text-muted-foreground">
        {scope}
      </Badge>
      {timeWindow && (
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-muted/50 border-border text-muted-foreground flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" />
          {timeWindow}
        </Badge>
      )}
    </div>
  );
};

interface DefinitionTooltipProps {
  title: string;
  definition: string;
  scope?: string;
  computation?: string;
  children?: React.ReactNode;
}

export const DefinitionTooltip = ({ 
  title, 
  definition, 
  scope, 
  computation,
  children 
}: DefinitionTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children || (
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1.5 text-xs">
          <p className="font-semibold text-foreground">{title}</p>
          <p className="text-muted-foreground">{definition}</p>
          {scope && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Scope:</span> {scope}
            </p>
          )}
          {computation && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Computed as:</span> {computation}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

interface WidgetHeaderProps {
  title: string;
  definition: string;
  scope: string;
  timeWindow?: string;
  computation?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const WidgetHeader = ({
  title,
  definition,
  scope,
  timeWindow,
  computation,
  action,
  icon,
}: WidgetHeaderProps) => {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="text-sm font-medium text-muted-foreground truncate">{title}</span>
        <DefinitionTooltip 
          title={title} 
          definition={definition}
          scope={scope}
          computation={computation}
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <ScopeChip scope={scope} timeWindow={timeWindow} />
        {action}
      </div>
    </div>
  );
};
