import { useState } from "react";
import { Asset } from "@/types/asset";
import { AssetListItem } from "./AssetListItem";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssetListPanelProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  variant?: "sidebar" | "full";
}

export const AssetListPanel = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  variant = "sidebar",
}: AssetListPanelProps) => {
  const [sortBy, setSortBy] = useState('score');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.ip.includes(searchQuery)
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === 'score') return b.threatScore - a.threatScore;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const containerClass =
    variant === "full" ? "h-full flex flex-col bg-card" : "h-full flex flex-col bg-card border-r border-border";

  return (
    <div className={containerClass}>
      {/* Header Controls */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-24 h-8 text-xs">
              <SlidersHorizontal className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="15">
            <SelectTrigger className="w-16 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto">
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
      </div>

      {/* Asset List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {sortedAssets.map((asset) => (
            <AssetListItem
              key={asset.id}
              asset={asset}
              isSelected={asset.id === selectedAssetId}
              onClick={() => onSelectAsset(asset.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
