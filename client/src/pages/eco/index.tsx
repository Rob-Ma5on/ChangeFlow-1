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
import type { ECO } from "@shared/schema";

export default function ECOIndex() {
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

  const { data: ecos, isLoading: ecosLoading, error } = useQuery({
    queryKey: ['/api/eco', statusFilter],
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

  const filteredECOs = ecos?.filter((eco: ECO) => {
    const matchesSearch = eco.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eco.ecoNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || eco.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'backlog': return 'secondary';
      case 'in_progress': return 'default';
      case 'review': return 'outline';
      case 'completed': return 'default';
      case 'on_hold': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar 
          title="ECO Orders" 
          subtitle="Engineering Change Orders management"
          actions={
            <Button data-testid="button-create-eco">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New ECO
            </Button>
          }
        />
        
        <div className="p-6">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search ECOs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-ecos"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ECO List */}
          {ecosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading ECOs...</p>
            </div>
          ) : filteredECOs.length === 0 ? (
            <Card data-testid="card-empty-state">
              <CardContent className="text-center py-8">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">No ECOs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter ? 'Try adjusting your filters' : 'No Engineering Change Orders available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredECOs.map((eco: ECO) => (
                <Card key={eco.id} className="hover:shadow-md transition-shadow" data-testid={`card-eco-${eco.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <CardTitle className="text-lg">{eco.ecoNumber}</CardTitle>
                          <Badge variant={getStatusVariant(eco.status)} data-testid={`badge-status-${eco.status}`}>
                            {eco.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-base font-medium text-foreground mb-2" data-testid={`text-title-${eco.id}`}>
                          {eco.title}
                        </h3>
                        {eco.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${eco.id}`}>
                            {eco.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p data-testid={`text-created-${eco.id}`}>
                          Created {new Date(eco.createdAt).toLocaleDateString()}
                        </p>
                        {eco.startedAt && (
                          <p data-testid={`text-started-${eco.id}`}>
                            Started {new Date(eco.startedAt).toLocaleDateString()}
                          </p>
                        )}
                        {eco.completedAt && (
                          <p data-testid={`text-completed-${eco.id}`}>
                            Completed {new Date(eco.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {eco.estimatedHours && (
                          <span data-testid={`text-estimated-hours-${eco.id}`}>
                            Est: {eco.estimatedHours}h
                          </span>
                        )}
                        {eco.actualHours && (
                          <span data-testid={`text-actual-hours-${eco.id}`}>
                            Actual: {eco.actualHours}h
                          </span>
                        )}
                        {eco.assignedEngineers && eco.assignedEngineers.length > 0 && (
                          <span data-testid={`text-engineers-${eco.id}`}>
                            Engineers: {eco.assignedEngineers.length}
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-${eco.id}`}>
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
