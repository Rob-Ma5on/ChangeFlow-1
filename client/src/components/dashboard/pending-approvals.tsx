import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PendingApprovals() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: approvals, isLoading } = useQuery({
    queryKey: ['/api/dashboard/pending-approvals'],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ approvalId, status }: { approvalId: string; status: string }) => {
      const response = await apiRequest("PUT", `/api/approvals/${approvalId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Approval updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update approval. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle>Pending Approvals</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  const handleApproval = (approvalId: string, status: 'approved' | 'rejected') => {
    approveMutation.mutate({ approvalId, status });
  };

  return (
    <Card className="shadow-sm" data-testid="pending-approvals">
      <CardHeader className="border-b border-border">
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {approvals && approvals.length > 0 ? (
            approvals.map((approval: any, index: number) => (
              <div key={approval.id} className="border border-border rounded-lg p-4" data-testid={`approval-item-${index}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground" data-testid={`approval-number-${index}`}>
                    {approval.entityType}-{approval.entityId?.slice(0, 8)}
                  </span>
                  <Badge variant={getPriorityVariant('high')} className="text-xs">
                    High Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3" data-testid={`approval-description-${index}`}>
                  Approval required for {approval.entityType.toLowerCase()}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-[hsl(147.1429,78.5047%,41.9608%)] hover:bg-[hsl(147.1429,78.5047%,35%)] text-white"
                    onClick={() => handleApproval(approval.id, 'approved')}
                    disabled={approveMutation.isPending}
                    data-testid={`button-approve-${index}`}
                  >
                    {approveMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleApproval(approval.id, 'rejected')}
                    disabled={approveMutation.isPending}
                    data-testid={`button-reject-${index}`}
                  >
                    {approveMutation.isPending ? 'Processing...' : 'Review'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8" data-testid="empty-approvals">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">No pending approvals</h3>
              <p className="text-muted-foreground">All items have been reviewed</p>
            </div>
          )}
        </div>
        {approvals && approvals.length > 0 && (
          <Button variant="link" className="mt-4 w-full p-0 h-auto text-[hsl(203.8863,88.2845%,53.1373%)]" data-testid="button-view-all-pending">
            View all pending
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
