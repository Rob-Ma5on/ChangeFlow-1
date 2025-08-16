import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/dashboard/activity'],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start space-x-4">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'ECR':
        return (
          <div className="w-8 h-8 bg-[hsl(203.8863,88.2845%,53.1373%)]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[hsl(203.8863,88.2845%,53.1373%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'ECO':
        return (
          <div className="w-8 h-8 bg-[hsl(147.1429,78.5047%,41.9608%)]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[hsl(147.1429,78.5047%,41.9608%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-[hsl(203.8863,88.2845%,53.1373%)]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[hsl(203.8863,88.2845%,53.1373%)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V7a1 1 0 011-1h5m-5 10v-5a1 1 0 00-1-1H4a1 1 0 00-1 1v5a1 1 0 001 1h5z" />
            </svg>
          </div>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'submitted': { variant: 'outline' as const, label: 'Pending Review' },
      'approved': { variant: 'default' as const, label: 'Approved' },
      'completed': { variant: 'default' as const, label: 'Completed' },
      'rejected': { variant: 'destructive' as const, label: 'Rejected' },
      'draft': { variant: 'secondary' as const, label: 'Draft' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <Card className="shadow-sm" data-testid="recent-activity">
      <CardHeader className="border-b border-border">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {activities && activities.length > 0 ? (
            activities.map((activity: any, index: number) => (
              <div key={activity.id || index} className="flex items-start space-x-4" data-testid={`activity-item-${index}`}>
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-foreground" data-testid={`activity-description-${index}`}>
                    Activity for <span className="font-medium">{activity.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`activity-time-${index}`}>
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
                {getStatusBadge(activity.status)}
              </div>
            ))
          ) : (
            <div className="text-center py-8" data-testid="empty-activity">
              <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-medium text-foreground mb-2">No recent activity</h3>
              <p className="text-muted-foreground">Activity will appear here as you work with ECRs, ECOs, and ECNs</p>
            </div>
          )}
        </div>
        {activities && activities.length > 0 && (
          <Button variant="link" className="mt-4 p-0 h-auto text-[hsl(203.8863,88.2845%,53.1373%)]" data-testid="button-view-all-activity">
            View all activity
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
