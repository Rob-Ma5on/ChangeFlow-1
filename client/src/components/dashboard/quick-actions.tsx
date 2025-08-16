import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Settings, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";

function QuickActions() {
  return (
    <Card data-testid="quick-actions-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Frequently used actions and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          <Link href="/ecr/create" data-testid="link-create-ecr">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Create New ECR
            </Button>
          </Link>
          
          <Link href="/ecr" data-testid="link-view-ecrs">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View All ECRs
            </Button>
          </Link>
          
          <Link href="/eco" data-testid="link-view-ecos">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Manage ECOs
            </Button>
          </Link>
          
          <Link href="/ecn" data-testid="link-view-ecns">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              View ECNs
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={() => window.open('/api/reports/export', '_blank')}
            data-testid="button-export-reports"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => alert('User management coming soon!')}
            data-testid="button-manage-users"
          >
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default QuickActions;