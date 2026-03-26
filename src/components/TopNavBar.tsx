import { NavLink } from "@/components/NavLink";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Calendar, Search } from "lucide-react";

const navItems = [
  { label: "Overview" },
  { label: "Detections" },
  { label: "Assets", to: "/assets" },
  { label: "Investigate" },
  { label: "Reports" },
  { label: "Settings", to: "/settings" },
];

export const TopNavBar = () => {
  return (
    <header className="h-11 bg-card border-b border-border flex items-center justify-between px-5">
      {/* Left - Navigation */}
      <nav className="flex items-center gap-0.5">
        {navItems.map((item) =>
          item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium transition-colors",
                "text-muted-foreground hover:text-foreground",
              )}
              activeClassName="text-primary font-semibold"
            >
              {item.label}
            </NavLink>
          ) : (
            <span
              key={item.label}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium transition-colors cursor-default",
                "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </span>
          ),
        )}
      </nav>

      {/* Right - Time Range + Search */}
      <div className="flex items-center gap-2">
        <Select defaultValue="24h">
          <SelectTrigger className="w-40 h-8 text-xs font-medium bg-card border-border">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
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
        <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Search className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
