import { NavLink } from "@/components/NavLink";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const navItems = [
  { label: "Overview" },
  { label: "Investigate" },
  { label: "Assets", to: "/assets" },
  { label: "Events" },
  { label: "Reports" },
  { label: "Settings", to: "/settings" },
];

export const TopNavBar = () => {
  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
      {/* Left - Navigation */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
              activeClassName="bg-primary/10 text-primary"
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors rounded-md",
                "text-muted-foreground/70",
              )}
            >
              {item.label}
            </span>
          ),
        )}
      </nav>

      {/* Right - Time Range */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Live</span>
        </div>
        <Select defaultValue="10d">
          <SelectTrigger className="w-44 h-8 text-xs font-medium bg-secondary/30 border-border/50">
            <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15m">Last 15 minutes</SelectItem>
            <SelectItem value="1h">Last 1 hour</SelectItem>
            <SelectItem value="6h">Last 6 hours</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="10d">Last 10 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="custom" className="text-primary font-medium">Custom Range...</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </header>
  );
};
