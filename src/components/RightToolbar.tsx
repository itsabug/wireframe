import { cn } from "@/lib/utils";
import { Bell, Settings, Zap, Users, Square, MessageSquare, Send } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RightToolbarProps {
  className?: string;
}

const tools = [
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
  { icon: Zap, label: "Automation" },
  { icon: Users, label: "Users" },
  { icon: Square, label: "Widgets" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Send, label: "Share" },
];

export const RightToolbar = ({ className }: RightToolbarProps) => {
  return (
    <div className={cn(
      "w-10 bg-card border-l border-border flex flex-col items-center py-3 gap-1",
      className
    )}>
      {tools.map((tool) => (
        <Tooltip key={tool.label}>
          <TooltipTrigger asChild>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors">
              <tool.icon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p className="text-xs">{tool.label}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
