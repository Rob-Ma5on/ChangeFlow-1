import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ActivityItem {
  id: string;
  type: string;
  entityType: 'ECR' | 'ECO' | 'ECN';
  entityId: string;
  entityNumber: string;
  title: string;
  action: string;
  userId: string;
  userEmail: string;
  createdAt: Date;
}

function RecentActivity() {
  const { data: activities = [], isLoading, error } = useQuery<ActivityItem[]>({
    queryKey: ['/api/dashboard/activity'],
  });

  if (isLoading) {
    return (
      <Card data-testid="recent-activity-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
      <Card data-testid="recent-activity-error">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Unable to load recent activity
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (entityType: string, action: string) => {
    if (action.includes('approved')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.includes('rejected')) return <XCircle className="h-4 w-4 text-red-600" />;
    return <FileText className="h-4 w-4 text-blue-600" />;
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'ECR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ECO': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ECN': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card data-testid="recent-activity-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest changes across all engineering processes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="no-activity">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30"
                data-testid={`activity-item-${activity.id}`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.entityType, activity.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className={getActivityColor(activity.entityType)}
                      data-testid={`badge-${activity.entityType.toLowerCase()}`}
                    >
                      {activity.entityNumber}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action} by {activity.userEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentActivity;