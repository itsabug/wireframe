import { useState } from "react";
import { Asset, ThreatEvent, Peer, MitreCategory, FlowData, ProtocolBreakdown, AnomalyDetail, ApplicationData, ConversationData, QoSData, TimelineEvent, ChangeHistoryItem, NetworkBehavior, DNSData, DHCPData } from "@/types/asset";
import { AssetHeader } from "./AssetHeader";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OverviewTab } from "./tabs/OverviewTab";
import { TrafficTab } from "./tabs/TrafficTab";
import { ApplicationTab } from "./tabs/ApplicationTab";
import { NetworkAnalyticsTab } from "./tabs/NetworkAnalyticsTab";
import { DependenciesTab } from "./tabs/DependenciesTab";
import { QoSTab } from "./tabs/QoSTab";
import { EventsTab } from "./tabs/EventsTab";
import { TimelineTab } from "./tabs/TimelineTab";
import { CommentsTab } from "./CommentsTab";
import { ProtocolActivityTab } from "./tabs/ProtocolActivityTab";
import { TopologyTab } from "./tabs/TopologyTab";

interface AssetDetailPanelProps {
  asset: Asset;
  events: ThreatEvent[];
  peers: Peer[];
  mitreCategories: MitreCategory[];
  flows: FlowData[];
  protocols: ProtocolBreakdown;
  anomalies: AnomalyDetail[];
  applications: ApplicationData[];
  conversations: ConversationData[];
  qosData: QoSData[];
  timelineEvents: TimelineEvent[];
  changeHistory: ChangeHistoryItem[];
  networkBehavior: NetworkBehavior;
  dnsData: DNSData;
  dhcpData: DHCPData;
}

export const AssetDetailPanel = ({
  asset,
  events,
  peers,
  mitreCategories,
  flows,
  protocols,
  anomalies,
  applications,
  conversations,
  qosData,
  timelineEvents,
  changeHistory,
  networkBehavior,
  dnsData,
  dhcpData,
}: AssetDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            asset={asset}
            events={events}
            peers={peers}
            mitreCategories={mitreCategories}
            flows={flows}
            protocols={protocols}
            anomalies={anomalies}
            changeHistory={changeHistory}
            applications={applications}
            conversations={conversations}
          />
        );
      case 'traffic':
        return <TrafficTab flows={flows} />;
      case 'application':
        return <ApplicationTab applications={applications} flows={flows} />;
      case 'protocol':
        return <ProtocolActivityTab dnsData={dnsData} dhcpData={dhcpData} />;
      case 'network':
        return (
          <NetworkAnalyticsTab 
            flows={flows} 
            peers={peers} 
            conversations={conversations}
          />
        );
      case 'dependencies':
        return <DependenciesTab asset={asset} flows={flows} peers={peers} />;
      case 'qos':
        return <QoSTab qosData={qosData} />;
      case 'events':
        return <EventsTab events={events} mitreCategories={mitreCategories} />;
      case 'timeline':
        return <TimelineTab timelineEvents={timelineEvents} changeHistory={changeHistory} />;
      case 'topology':
        return <TopologyTab asset={asset} peers={peers} flows={flows} />;
      case 'comments':
        return <CommentsTab asset={asset} />;
      default:
        return (
          <OverviewTab
            asset={asset}
            events={events}
            peers={peers}
            mitreCategories={mitreCategories}
            flows={flows}
            protocols={protocols}
            anomalies={anomalies}
            changeHistory={changeHistory}
            applications={applications}
            conversations={conversations}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="min-h-full">
          <AssetHeader asset={asset} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};
