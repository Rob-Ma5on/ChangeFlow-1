import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertEcrSchema } from "@shared/schema";
import { z } from "zod";

const createEcrSchema = insertEcrSchema.pick({
  title: true,
  description: true,
  businessJustification: true,
  category: true,
  priority: true,
  estimatedCost: true,
  estimatedHours: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  businessJustification: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimatedCost: z.number().optional(),
  estimatedHours: z.number().optional(),
});

type CreateEcrForm = z.infer<typeof createEcrSchema>;

export default function CreateECR() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

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

  const form = useForm<CreateEcrForm>({
    resolver: zodResolver(createEcrSchema),
    defaultValues: {
      title: "",
      description: "",
      businessJustification: "",
      category: "",
      priority: "medium",
      estimatedCost: undefined,
      estimatedHours: undefined,
    },
  });

  const createEcrMutation = useMutation({
    mutationFn: async (data: CreateEcrForm) => {
      const response = await apiRequest("POST", "/api/ecr", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "ECR created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ecr'] });
      setLocation('/ecr');
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
        description: "Failed to create ECR. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateEcrForm) => {
    createEcrMutation.mutate(data);
  };

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

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <TopBar 
          title="Create ECR" 
          subtitle="Engineering Change Request"
          actions={
            <Button 
              variant="outline" 
              onClick={() => setLocation('/ecr')}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          }
        />
        
        <div className="p-6">
          <Card className="max-w-4xl">
            <CardHeader>
              <CardTitle data-testid="title-create-ecr">Create New Engineering Change Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-create-ecr">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Brief description of the change"
                              data-testid="input-title"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Design, Process, Materials"
                              data-testid="input-category"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Cost ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              data-testid="input-estimated-cost"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estimatedHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Hours</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="0"
                              data-testid="input-estimated-hours"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Detailed description of the proposed change"
                              className="min-h-24"
                              data-testid="textarea-description"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a detailed description of what needs to be changed and why.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessJustification"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Business Justification</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Business case for this change"
                              className="min-h-24"
                              data-testid="textarea-business-justification"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Explain the business reasons and benefits for implementing this change.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setLocation('/ecr')}
                      data-testid="button-cancel-form"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createEcrMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createEcrMutation.isPending ? "Creating..." : "Create ECR"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
