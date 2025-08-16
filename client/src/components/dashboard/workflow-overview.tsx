import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkflowOverview() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['/api/dashboard/metrics'],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle>Current Workflow Status</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock workflow data based on metrics - in a real app, this would come from a dedicated endpoint
  const workflowData = [
    {
      title: "ECR Requests",
      total: metrics?.activeECRs || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "text-[hsl(203.8863,88.2845%,53.1373%)]",
      bgColor: "bg-[hsl(203.8863,88.2845%,53.1373%)]/10",
      breakdown: [
        { label: "Draft", value: Math.floor((metrics?.activeECRs || 0) * 0.125) },
        { label: "Under Review", value: Math.floor((metrics?.activeECRs || 0) * 0.292) },
        { label: "Approved", value: Math.floor((metrics?.activeECRs || 0) * 0.583) },
      ],
      testId: "workflow-ecr"
    },
    {
      title: "ECO Orders",
      total: metrics?.inProgressECOs || 0,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      color: "text-[hsl(42.0290,92.8251%,56.2745%)]",
      bgColor: "bg-[hsl(42.0290,92.8251%,56.2745%)]/10",
      breakdown: [
        { label: "Backlog", value: Math.floor((metrics?.inProgressECOs || 0) * 0.278) },
        { label: "In Progress", value: Math.floor((metrics?.inProgressECOs || 0) * 0.444) },
        { label: "Review", value: Math.floor((metrics?.inProgressECOs || 0) * 0.278) },
      ],
      testId: "workflow-eco"
    },
    {
      title: "ECN Notices",
      total: 12, // Static value as per design
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V7a1 1 0 011-1h5m-5 10v-5a1 1 0 00-1-1H4a1 1 0 00-1 1v5a1 1 0 001 1h5z" />
        </svg>
      ),
      color: "text-[hsl(147.1429,78.5047%,41.9608%)]",
      bgColor: "bg-[hsl(147.1429,78.5047%,41.9608%)]/10",
      breakdown: [
        { label: "Pending", value: 2 },
        { label: "In Progress", value: 4 },
        { label: "Completed", value: 6 },
      ],
      testId: "workflow-ecn"
    }
  ];

  return (
    <Card className="shadow-sm" data-testid="workflow-overview">
      <CardHeader className="border-b border-border">
        <CardTitle>Current Workflow Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workflowData.map((workflow, index) => (
            <div key={index} className="text-center" data-testid={workflow.testId}>
              <div className={`w-16 h-16 ${workflow.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <div className={workflow.color}>
                  {workflow.icon}
                </div>
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2" data-testid={`${workflow.testId}-title`}>
                {workflow.title}
              </h4>
              <p className={`text-3xl font-bold ${workflow.color} mb-2`} data-testid={`${workflow.testId}-total`}>
                {workflow.total}
              </p>
              <div className="space-y-1 text-sm">
                {workflow.breakdown.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between" data-testid={`${workflow.testId}-${item.label.toLowerCase().replace(' ', '-')}`}>
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
