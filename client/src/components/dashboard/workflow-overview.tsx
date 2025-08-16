import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3 } from "lucide-react";

interface MetricData {
  activeECRs: number;
  inProgressECOs: number;
  pendingApprovals: number;
  completedThisMonth: number;
}

function WorkflowOverview() {
  const { data: metrics = {} as MetricData, isLoading, error } = useQuery<MetricData>({
    queryKey: ['/api/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <Card data-testid="workflow-overview-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workflow Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="workflow-overview-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Workflow Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Unable to load workflow data
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActive = (metrics.activeECRs || 0) + (metrics.inProgressECOs || 0);
  const ecrProgress = totalActive > 0 ? ((metrics.activeECRs || 0) / totalActive) * 100 : 0;
  const ecoProgress = totalActive > 0 ? ((metrics.inProgressECOs || 0) / totalActive) * 100 : 0;

  return (
    <Card data-testid="workflow-overview-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Workflow Overview
        </CardTitle>
        <CardDescription>
          Current progress across the ECR → ECO → ECN workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* ECR Section */}
          <div className="space-y-3" data-testid="ecr-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  ECR
                </Badge>
                <span className="text-sm font-medium">Engineering Change Requests</span>
              </div>
              <Badge variant="secondary" data-testid="ecr-count">
                {metrics.activeECRs || 0} active
              </Badge>
            </div>
            <Progress 
              value={ecrProgress} 
              className="h-2"
              data-testid="ecr-progress"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Submitted for review</span>
              <span>{(metrics.activeECRs || 0)} requests</span>
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex items-center justify-center" data-testid="flow-arrow">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* ECO Section */}
          <div className="space-y-3" data-testid="eco-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  ECO
                </Badge>
                <span className="text-sm font-medium">Engineering Change Orders</span>
              </div>
              <Badge variant="secondary" data-testid="eco-count">
                {metrics.inProgressECOs || 0} in progress
              </Badge>
            </div>
            <Progress 
              value={ecoProgress} 
              className="h-2"
              data-testid="eco-progress"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Implementation in progress</span>
              <span>{(metrics.inProgressECOs || 0)} orders</span>
            </div>
          </div>

          {/* Flow Arrow */}
          <div className="flex items-center justify-center" data-testid="flow-arrow-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* ECN Section */}
          <div className="space-y-3" data-testid="ecn-section">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  ECN
                </Badge>
                <span className="text-sm font-medium">Engineering Change Notices</span>
              </div>
              <Badge variant="secondary" data-testid="completed-count">
                {metrics.completedThisMonth || 0} completed
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Notifications sent and implemented this month
            </div>
          </div>

          {/* Summary */}
          <div className="pt-4 border-t" data-testid="workflow-summary">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground" data-testid="total-active">
                  {totalActive}
                </div>
                <div className="text-xs text-muted-foreground">Total Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground" data-testid="pending-approvals">
                  {metrics.pendingApprovals || 0}
                </div>
                <div className="text-xs text-muted-foreground">Pending Approvals</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkflowOverview;