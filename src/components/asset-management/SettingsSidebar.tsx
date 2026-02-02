import {
  ArrowLeftRight,
  BarChart3,
  ChevronDown,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { useState } from 'react';

type SettingsCategory = 'assets' | 'network' | 'security' | 'platform';
type SettingsPanel =
  | 'groups'
  | 'tags'
  | 'lifecycle'
  | 'localities'
  | 'nat'
  | 'trust'
  | 'rules'
  | 'risk'
  | 'shadow-it'
  | 'discovery'
  | 'identity'
  | 'integrations'
  | 'retention'
  | 'access';

interface SettingsSidebarProps {
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

export function SettingsSidebar({ activePanel, onPanelChange }: SettingsSidebarProps) {
  const getActiveCategoryId = (): SettingsCategory => {
    for (const category of categories) {
      if (category.items.some((item) => item.id === activePanel)) {
        return category.id;
      }
    }
    return 'assets';
  };

  const [openCategories, setOpenCategories] = useState<Set<SettingsCategory>>(() => {
    const activeCategory = getActiveCategoryId();
    return new Set([activeCategory]);
  });

  const toggleCategory = (categoryId: SettingsCategory) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="px-2 py-1 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Configuration
          </p>
        </div>

        <div className="space-y-1">
          {categories.map((category) => {
            const isOpen = openCategories.has(category.id);
            const hasActiveItem = category.items.some((item) => item.id === activePanel);

            return (
              <Collapsible
                key={category.id}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    hasActiveItem && !isOpen && 'bg-primary/5 text-primary'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-1 pb-2">
                  <div className="ml-4 border-l border-border pl-2 space-y-0.5">
                    {category.items.map((item) => {
                      const isActive = activePanel === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => onPanelChange(item.id)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
                            isActive &&
                              'bg-primary/10 text-primary font-medium border-l-2 border-primary -ml-[9px] pl-[17px]'
                          )}
                        >
                          <item.icon className="h-3.5 w-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            System Health
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Collectors</span>
            <span className="text-primary font-semibold">18/20</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1.5">
            <span className="text-muted-foreground">Storage</span>
            <span className="text-amber-500 font-semibold">82%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { SettingsPanel };
