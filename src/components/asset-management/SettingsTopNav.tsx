import { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Clock,
  Cloud,
  Database,
  Fingerprint,
  Globe,
  Link2,
  Network,
  Server,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SettingsPanel } from './SettingsSidebar';

type SettingsCategory = 'assets' | 'network' | 'security' | 'platform';

interface SettingsTopNavProps {
  activePanel: SettingsPanel;
  onPanelChange: (panel: SettingsPanel) => void;
}

interface CategoryConfig {
  id: SettingsCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: {
    id: SettingsPanel;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const categories: CategoryConfig[] = [
  {
    id: 'assets',
    label: 'Asset Management',
    icon: Server,
    items: [
      { id: 'groups', label: 'Asset Groups', icon: Network },
      { id: 'tags', label: 'Tag Management', icon: Tags },
      { id: 'lifecycle', label: 'Asset Lifecycle', icon: Clock },
    ],
  },
  {
    id: 'network',
    label: 'Network Configuration',
    icon: Globe,
    items: [
      { id: 'localities', label: 'Network Segmentation', icon: Globe },
      { id: 'nat', label: 'NAT Settings', icon: ArrowLeftRight },
    ],
  },
  {
    id: 'security',
    label: 'Security & Detection',
    icon: ShieldCheck,
    items: [
      { id: 'trust', label: 'Trust Lists', icon: Shield },
      { id: 'rules', label: 'Detection Rules', icon: SlidersHorizontal },
      { id: 'risk', label: 'Risk Scoring', icon: BarChart3 },
      { id: 'shadow-it', label: 'Shadow IT Policy', icon: Cloud },
    ],
  },
  {
    id: 'platform',
    label: 'Platform & Integrations',
    icon: Link2,
    items: [
      { id: 'discovery', label: 'Discovery & Collectors', icon: Network },
      { id: 'identity', label: 'Identity Resolution', icon: Fingerprint },
      { id: 'integrations', label: 'Integrations', icon: Link2 },
      { id: 'retention', label: 'Data Retention', icon: Database },
      { id: 'access', label: 'Access & Audit', icon: Shield },
    ],
  },
];

export function SettingsTopNav({ activePanel, onPanelChange }: SettingsTopNavProps) {
  const getActiveCategoryId = (): SettingsCategory => {
    for (const category of categories) {
      if (category.items.some((item) => item.id === activePanel)) {
        return category.id;
      }
    }
    return 'assets';
  };

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>(getActiveCategoryId());
  
  const currentCategoryItems = categories.find((c) => c.id === activeCategory)?.items ?? [];

  const handleCategoryClick = (categoryId: SettingsCategory) => {
    setActiveCategory(categoryId);
    // Auto-select first item in category
    const category = categories.find((c) => c.id === categoryId);
    if (category && category.items.length > 0) {
      onPanelChange(category.items[0].id);
    }
  };

  return (
    <div className="border-b border-border bg-card">
      {/* Primary category row */}
      <div className="flex items-center px-4 h-12 gap-1 border-b border-border/50 bg-secondary/30">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary submenu row */}
      <div className="flex items-center px-4 h-11 gap-1 overflow-x-auto">
        {currentCategoryItems.map((item) => {
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPanelChange(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
