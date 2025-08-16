import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PendingApproval {
  id: string;
  entityType: 'ECR' | 'ECO' | 'ECN';
  entityId: string;
  entityNumber: string;
  title: string;
  requestorEmail: string;
  approvalLevel: number;
  priority?: string;
  createdAt: Date;
}

function PendingApprovals() {
  const { toast } = useToast();
  const { data: approvals = [], isLoading, error } = useQuery<PendingApproval[]>({
    queryKey: ['/api/dashboard/pending-approvals'],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      await apiRequest(`/api/approvals/${id}/${action}`, {
        method: 'POST',
      });
    },
    onSuccess: (_, { action }) => {
      toast({
        title: "Success",
        description: `Request ${action}d successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process approval",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card data-testid="pending-approvals-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-muted rounded"></div>
                  <div className="h-8 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card data-testid="pending-approvals-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Unable to load pending approvals
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'ECR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ECO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ECN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card data-testid="pending-approvals-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Approvals
          {approvals.length > 0 && (
            <Badge variant="destructive" data-testid="approval-count">
              {approvals.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Requests awaiting your approval decision
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {approvals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-approvals">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No pending approvals</p>
            </div>
          ) : (
            approvals.map((approval) => (
              <div
                key={approval.id}
                className="flex items-center justify-between p-4 border rounded-lg"
                data-testid={`approval-item-${approval.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="secondary"
                      className={getEntityColor(approval.entityType)}
                      data-testid={`badge-${approval.entityType.toLowerCase()}`}
                    >
                      {approval.entityNumber}
                    </Badge>
                    {approval.priority && (
                      <Badge
                        variant="secondary"
                        className={getPriorityColor(approval.priority)}
                        data-testid={`priority-${approval.priority}`}
                      >
                        {approval.priority}
                      </Badge>
                    )}
                  </div>
                  <h4 className="font-medium text-foreground mb-1">
                    {approval.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Submitted by {approval.requestorEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(approval.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    onClick={() => approveMutation.mutate({ id: approval.id, action: 'approve' })}
                    disabled={approveMutation.isPending}
                    data-testid={`approve-${approval.id}`}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => approveMutation.mutate({ id: approval.id, action: 'reject' })}
                    disabled={approveMutation.isPending}
                    data-testid={`reject-${approval.id}`}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PendingApprovals;