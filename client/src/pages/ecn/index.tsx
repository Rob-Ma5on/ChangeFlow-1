import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { ECN } from "@shared/schema";

export default function ECNIndex() {
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

  const { data: ecns, isLoading: ecnsLoading, error } = useQuery({
    queryKey: ['/api/ecn', statusFilter],
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

  const filteredECNs = ecns?.filter((ecn: ECN) => {
    const matchesSearch = ecn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ecn.ecnNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || ecn.implementationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'waiting': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getApprovalVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar 
          title="ECN Notices" 
          subtitle="Engineering Change Notices management"
          actions={
            <Button data-testid="button-create-ecn">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New ECN
            </Button>
          }
        />
        
        <div className="p-6">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search ECNs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-ecns"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="waiting">Waiting</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ECN List */}
          {ecnsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading ECNs...</p>
            </div>
          ) : filteredECNs.length === 0 ? (
            <Card data-testid="card-empty-state">
              <CardContent className="text-center py-8">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V7a1 1 0 011-1h5m-5 10v-5a1 1 0 00-1-1H4a1 1 0 00-1 1v5a1 1 0 001 1h5z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No ECNs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter ? 'Try adjusting your filters' : 'No Engineering Change Notices available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredECNs.map((ecn: ECN) => (
                <Card key={ecn.id} className="hover:shadow-md transition-shadow" data-testid={`card-ecn-${ecn.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <CardTitle className="text-lg">{ecn.ecnNumber}</CardTitle>
                          <Badge variant={getStatusVariant(ecn.implementationStatus)} data-testid={`badge-implementation-${ecn.implementationStatus}`}>
                            {ecn.implementationStatus.replace('_', ' ')}
                          </Badge>
                          <Badge variant={getApprovalVariant(ecn.approvalStatus)} data-testid={`badge-approval-${ecn.approvalStatus}`}>
                            {ecn.approvalStatus}
                          </Badge>
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2" data-testid={`text-title-${ecn.id}`}>
                          {ecn.title}
                        </h3>
                        {ecn.implementationInstructions && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-instructions-${ecn.id}`}>
                            {ecn.implementationInstructions}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p data-testid={`text-created-${ecn.id}`}>
                          Created {new Date(ecn.createdAt).toLocaleDateString()}
                        </p>
                        {ecn.implementedAt && (
                          <p data-testid={`text-implemented-${ecn.id}`}>
                            Implemented {new Date(ecn.implementedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span data-testid={`text-notification-type-${ecn.id}`}>
                          Type: {ecn.notificationType.replace('_', ' ')}
                        </span>
                        {ecn.affectedDepartments && ecn.affectedDepartments.length > 0 && (
                          <span data-testid={`text-departments-${ecn.id}`}>
                            Departments: {ecn.affectedDepartments.length}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {ecn.approvalStatus === 'pending' && (
                          <Button size="sm" data-testid={`button-approve-${ecn.id}`}>
                            Approve
                          </Button>
                        )}
                        <Button variant="outline" size="sm" data-testid={`button-view-${ecn.id}`}>
                          View Details
                        </Button>
                      </div>
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
