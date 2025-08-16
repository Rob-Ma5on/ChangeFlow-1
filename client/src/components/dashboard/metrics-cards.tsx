import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Settings, Bell, CheckCircle, TrendingUp, AlertTriangle } from "lucide-react";

interface MetricData {
  activeECRs: number;
  inProgressECOs: number;
  pendingApprovals: number;
  completedThisMonth: number;
}

function MetricsCards() {
  const { data: metrics = {} as MetricData, isLoading, error } = useQuery<MetricData>({
    queryKey: ['/api/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="metrics-loading">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-12 mb-2"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="metrics-error">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Unable to load metrics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Active ECRs",
      value: metrics.activeECRs || 0,
      description: "Engineering Change Requests",
      icon: FileText,
      trend: "+12% from last month",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      testId: "metric-active-ecrs"
    },
    {
      title: "ECOs in Progress",
      value: metrics.inProgressECOs || 0,
      description: "Engineering Change Orders",
      icon: Settings,
      trend: "+8% from last month",
      color: "text-green-600",
      bgColor: "bg-green-50",
      testId: "metric-ecos-progress"
    },
    {
      title: "Pending Approvals",
      value: metrics.pendingApprovals || 0,
      description: "Awaiting review",
      icon: AlertTriangle,
      trend: "-5% from last month",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      testId: "metric-pending-approvals"
    },
    {
      title: "Completed This Month",
      value: metrics.completedThisMonth || 0,
      description: "ECNs implemented",
      icon: CheckCircle,
      trend: "+15% from last month",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      testId: "metric-completed-month"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="metrics-cards">
      {metricCards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.title} data-testid={card.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-full`}>
                <IconComponent className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground" data-testid={`value-${card.testId}`}>
                {card.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
                <p className="text-xs text-emerald-600">
                  {card.trend}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default MetricsCards;