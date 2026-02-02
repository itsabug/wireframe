import { Asset, ThreatEvent, Peer, MitreCategory, FlowData, ProtocolBreakdown, AnomalyDetail, ChangeHistoryItem, ApplicationData, ConversationData } from "@/types/asset";
import { DeviceSummaryCard } from "../DeviceSummaryCard";
import { DetectionAlertsCard } from "../DetectionAlertsCard";
import { PeerSummaryCard } from "../PeerSummaryCard";
import { ApplicationHighlightsCard } from "../ApplicationHighlightsCard";
import { MitreSummaryCard } from "../MitreSummaryCard";
import { ScoreCards } from "../ScoreCards";
import { ChangeHistoryCard } from "../ChangeHistoryCard";
import { PeerMapCard } from "../PeerMapCard";
import { FlowsTable } from "../FlowsTable";
import { TrafficCard } from "../TrafficCard";
import {
  DependencySummaryCard,
  ExposureSummaryCard,
  IdentityConfidenceCard,
  IntegrationStatusCard,
} from "../AssetContextCards";
import { RiskBreakdownCard } from "../RiskBreakdownCard";

interface OverviewTabProps {
  asset: Asset;
  events: ThreatEvent[];
  peers: Peer[];
  mitreCategories: MitreCategory[];
  flows: FlowData[];
  protocols: ProtocolBreakdown;
  anomalies: AnomalyDetail[];
  changeHistory: ChangeHistoryItem[];
  applications: ApplicationData[];
  conversations: ConversationData[];
}

export const OverviewTab = ({
  asset,
  peers,
  mitreCategories,
  flows,
  anomalies,
  changeHistory,
  applications,
  conversations,
}: OverviewTabProps) => {
  return (
    <div className="space-y-3">
      {/* Row 1: Asset Summary (taller) + Right Column (Risk + Detection stacked) */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-4">
          <DeviceSummaryCard asset={asset} />
        </div>
        <div className="col-span-8">
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* Left sub-column: Risk + Traffic */}
            <div className="flex flex-col gap-3">
              <ScoreCards asset={asset} />
              <RiskBreakdownCard asset={asset} />
            </div>
            {/* Right sub-column: Detection Alerts */}
            <div className="flex flex-col gap-3">
              <DetectionAlertsCard anomalies={anomalies} />
              <TrafficCard inbound={2450} outbound={1230} />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Peer Context, Application Highlights, MITRE + Change History */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <PeerSummaryCard peers={peers} />
        </div>
        <div className="col-span-3">
          <ApplicationHighlightsCard applications={applications} conversations={conversations} />
        </div>
        <div className="col-span-3">
          <MitreSummaryCard categories={mitreCategories} totalEvents={27} />
        </div>
        <div className="col-span-3">
          <ChangeHistoryCard changes={changeHistory} />
        </div>
      </div>

      {/* Row 3: Identity, Exposure, Integrations, Dependencies */}
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-3">
          <IdentityConfidenceCard asset={asset} />
        </div>
        <div className="col-span-3">
          <ExposureSummaryCard asset={asset} />
        </div>
        <div className="col-span-3">
          <IntegrationStatusCard asset={asset} />
        </div>
        <div className="col-span-3">
          <DependencySummaryCard asset={asset} />
        </div>
      </div>

      {/* Row 4: Peer Map */}
      <PeerMapCard peers={peers} assetName={asset.name} />

      {/* Row 5: Flows Table */}
      <FlowsTable flows={flows} />
    </div>
  );
};
