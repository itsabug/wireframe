import { Peer } from "@/types/asset";
import { Monitor, Globe, Server, Database, Users, Laptop, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PeerMapCardProps {
  peers: Peer[];
  assetName: string;
}

const getCategoryIcon = (category: string) => {
  if (category.includes('Domain')) return Server;
  if (category.includes('Database')) return Database;
  if (category.includes('End User') || category.includes('Desktop')) return Laptop;
  if (category.includes('Internet') || category.includes('External')) return Globe;
  return Monitor;
};

export const PeerMapCard = ({ peers, assetName }: PeerMapCardProps) => {
  const internalPeers = peers.filter(p => p.type === 'internal');
  const externalPeers = peers.filter(p => p.type === 'external');

  return (
    <div className="panel-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="section-title mb-0">Network Peers</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground">
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="text-xs">Network communication peers detected in the last 24 hours based on flow data</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="relative min-h-[300px]">
        {/* Left side - Categories */}
        <div className="absolute left-0 top-0 bottom-0 w-32 flex flex-col justify-center gap-2">
          {peers.slice(0, 8).map((peer, index) => {
            const Icon = getCategoryIcon(peer.category);
            return (
              <div 
                key={peer.id}
                className="flex items-center gap-2 text-xs text-muted-foreground truncate"
              >
                <span className="truncate">{peer.category.split(' ')[0]}...</span>
              </div>
            );
          })}
        </div>

        {/* Center - Asset Node */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="relative">
            {/* Connection Lines */}
            <svg className="absolute -left-32 -top-32 w-64 h-64 pointer-events-none" style={{ zIndex: -1 }}>
              {peers.slice(0, 8).map((_, index) => {
                const angle = (index * 45) - 90;
                const radians = (angle * Math.PI) / 180;
                const endX = 128 + Math.cos(radians) * 100;
                const endY = 128 + Math.sin(radians) * 100;
                return (
                  <line
                    key={index}
                    x1="128"
                    y1="128"
                    x2={endX}
                    y2={endY}
                    stroke="hsl(var(--muted))"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="opacity-40"
                  />
                );
              })}
            </svg>
            
            {/* Asset Icon */}
            <div className="w-16 h-16 rounded-lg bg-secondary border-2 border-muted flex items-center justify-center">
              <Monitor className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-center mt-2 font-medium">{assetName}</p>
          </div>
        </div>

        {/* Right side - Locations */}
        <div className="absolute right-0 top-0 bottom-0 w-32 flex flex-col justify-center gap-2">
          {peers.slice(0, 8).map((peer, index) => (
            <div 
              key={peer.id}
              className="flex items-center gap-2 text-xs"
            >
              <div className={cn(
                'w-2 h-2 rounded-full',
                peer.type === 'internal' ? 'bg-threat-info' : 'bg-threat-medium'
              )} />
              <span className="text-muted-foreground">{peer.location}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
