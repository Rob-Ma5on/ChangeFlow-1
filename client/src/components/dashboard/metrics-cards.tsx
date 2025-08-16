import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MetricsCards() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <div className="mt-4 flex items-center">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20 ml-2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const metricsData = [
    {
      title: "Active ECRs",
      value: metrics?.activeECRs || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      change: "+12%",
      changeType: "positive",
      bgColor: "bg-[hsl(203.8863,88.2845%,53.1373%)]/10",
      iconColor: "text-[hsl(203.8863,88.2845%,53.1373%)]",
      testId: "metrics-active-ecrs"
    },
    {
      title: "In Progress ECOs",
      value: metrics?.inProgressECOs || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      change: "+5%",
      changeType: "positive",
      bgColor: "bg-[hsl(42.0290,92.8251%,56.2745%)]/10",
      iconColor: "text-[hsl(42.0290,92.8251%,56.2745%)]",
      testId: "metrics-in-progress-ecos"
    },
    {
      title: "Pending Approvals",
      value: metrics?.pendingApprovals || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      change: "-8%",
      changeType: "negative",
      bgColor: "bg-[hsl(356.3033,90.5579%,54.3137%)]/10",
      iconColor: "text-[hsl(356.3033,90.5579%,54.3137%)]",
      testId: "metrics-pending-approvals"
    },
    {
      title: "Completed This Month",
      value: metrics?.completedThisMonth || 0,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      change: "+18%",
      changeType: "positive",
      bgColor: "bg-[hsl(147.1429,78.5047%,41.9608%)]/10",
      iconColor: "text-[hsl(147.1429,78.5047%,41.9608%)]",
      testId: "metrics-completed-month"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="metrics-cards">
      {metricsData.map((metric, index) => (
        <Card key={index} className="shadow-sm" data-testid={metric.testId}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground" data-testid={`text-${metric.testId}-title`}>
                  {metric.title}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1" data-testid={`text-${metric.testId}-value`}>
                  {metric.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                <div className={metric.iconColor}>
                  {metric.icon}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={metric.changeType === 'positive' ? 'text-[hsl(147.1429,78.5047%,41.9608%)]' : 'text-[hsl(356.3033,90.5579%,54.3137%)]'} data-testid={`text-${metric.testId}-change`}>
                {metric.change}
              </span>
              <span className="text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
