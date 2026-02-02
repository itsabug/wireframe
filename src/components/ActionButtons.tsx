import { Button } from "@/components/ui/button";
import { MessageSquare, UserPlus, Download, ExternalLink } from "lucide-react";

export const ActionButtons = () => {
  return (
    <div className="panel-card">
      <h3 className="section-title">Actions</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <MessageSquare className="h-4 w-4" />
          Add Comment
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <UserPlus className="h-4 w-4" />
          Assign Owner
        </Button>
        <Button variant="outline" size="sm" className="justify-start gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button variant="default" size="sm" className="justify-start gap-2">
          <ExternalLink className="h-4 w-4" />
          Drill to Incident
        </Button>
      </div>
    </div>
  );
};
