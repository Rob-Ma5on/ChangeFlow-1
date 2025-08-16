import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ECR } from "@shared/schema";

export default function ECRIndex() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: ecrs, isLoading: ecrsLoading, error } = useQuery({
    queryKey: ['/api/ecr', statusFilter],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  const filteredECRs = ecrs?.filter((ecr: ECR) => {
    const matchesSearch = ecr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ecr.ecrNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ecr.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'submitted': return 'default';
      case 'under_review': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar 
          title="ECR Requests" 
          subtitle="Engineering Change Requests management"
          actions={
            <Link href="/ecr/create">
              <Button data-testid="button-create-ecr">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New ECR
              </Button>
            </Link>
          }
        />
        
        <div className="p-6">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search ECRs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-ecrs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ECR List */}
          {ecrsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading ECRs...</p>
            </div>
          ) : filteredECRs.length === 0 ? (
            <Card data-testid="card-empty-state">
              <CardContent className="text-center py-8">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No ECRs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter ? 'Try adjusting your filters' : 'Get started by creating your first ECR'}
                </p>
                <Link href="/ecr/create">
                  <Button data-testid="button-create-first-ecr">Create ECR</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredECRs.map((ecr: ECR) => (
                <Card key={ecr.id} className="hover:shadow-md transition-shadow" data-testid={`card-ecr-${ecr.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <CardTitle className="text-lg">{ecr.ecrNumber}</CardTitle>
                          <Badge variant={getStatusVariant(ecr.status)} data-testid={`badge-status-${ecr.status}`}>
                            {ecr.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getPriorityVariant(ecr.priority)} data-testid={`badge-priority-${ecr.priority}`}>
                            {ecr.priority}
                          </Badge>
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2" data-testid={`text-title-${ecr.id}`}>
                          {ecr.title}
                        </h3>
                        {ecr.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${ecr.id}`}>
                            {ecr.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p data-testid={`text-created-${ecr.id}`}>
                          Created {new Date(ecr.createdAt).toLocaleDateString()}
                        </p>
                        {ecr.submittedAt && (
                          <p data-testid={`text-submitted-${ecr.id}`}>
                            Submitted {new Date(ecr.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {ecr.category && (
                          <span data-testid={`text-category-${ecr.id}`}>Category: {ecr.category}</span>
                        )}
                        {ecr.estimatedCost && (
                          <span data-testid={`text-cost-${ecr.id}`}>
                            Est. Cost: ${ecr.estimatedCost.toLocaleString()}
                          </span>
                        )}
                        {ecr.estimatedHours && (
                          <span data-testid={`text-hours-${ecr.id}`}>
                            Est. Hours: {ecr.estimatedHours}
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-${ecr.id}`}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
