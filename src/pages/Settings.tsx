import { AssetManagementPage } from "@/components/asset-management/AssetManagementPage";
import { TopNavBar } from "@/components/TopNavBar";

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavBar />
      <div className="flex-1 flex flex-col">
        <AssetManagementPage />
      </div>
    </div>
  );
};

export default Settings;
