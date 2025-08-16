import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertEcrSchema, 
  insertEcoSchema, 
  insertEcnSchema,
  insertCommentSchema,
  insertApprovalSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard API
  app.get('/api/dashboard/metrics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // For now, use a default org - in production, get from user's org membership
      const orgId = "default-org-id";
      
      const metrics = await storage.getDashboardMetrics(orgId);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  app.get('/api/dashboard/activity', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = "default-org-id";
      
      const activity = await storage.getRecentActivity(orgId, 10);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  app.get('/api/dashboard/pending-approvals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = "default-org-id";
      
      const approvals = await storage.getPendingApprovals(userId, orgId);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch approvals" });
    }
  });

  // ECR routes
  app.get('/api/ecr', isAuthenticated, async (req: any, res) => {
    try {
      const orgId = "default-org-id";
      const status = req.query.status as string;
      
      const ecrs = await storage.getECRs(orgId, status);
      res.json(ecrs);
    } catch (error) {
      console.error("Error fetching ECRs:", error);
      res.status(500).json({ message: "Failed to fetch ECRs" });
    }
  });

  app.post('/api/ecr', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = "default-org-id";
      
      const validatedData = insertEcrSchema.parse({
        ...req.body,
        orgId,
        requestorId: userId,
        ecrNumber: await storage.generateNextNumber(orgId, 'ECR')
      });

      const ecr = await storage.createECR(validatedData);
      res.status(201).json(ecr);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating ECR:", error);
      res.status(500).json({ message: "Failed to create ECR" });
    }
  });

  app.get('/api/ecr/:id', isAuthenticated, async (req, res) => {
    try {
      const ecr = await storage.getECR(req.params.id);
      if (!ecr) {
        return res.status(404).json({ message: "ECR not found" });
      }
      res.json(ecr);
    } catch (error) {
      console.error("Error fetching ECR:", error);
      res.status(500).json({ message: "Failed to fetch ECR" });
    }
  });

  app.put('/api/ecr/:id', isAuthenticated, async (req, res) => {
    try {
      const ecr = await storage.updateECR(req.params.id, req.body);
      res.json(ecr);
    } catch (error) {
      console.error("Error updating ECR:", error);
      res.status(500).json({ message: "Failed to update ECR" });
    }
  });

  app.post('/api/ecr/:id/submit', isAuthenticated, async (req, res) => {
    try {
      const ecr = await storage.updateECR(req.params.id, {
        status: 'submitted',
        submittedAt: new Date()
      });
      res.json(ecr);
    } catch (error) {
      console.error("Error submitting ECR:", error);
      res.status(500).json({ message: "Failed to submit ECR" });
    }
  });

  // ECO routes
  app.get('/api/eco', isAuthenticated, async (req: any, res) => {
    try {
      const orgId = "default-org-id";
      const status = req.query.status as string;
      
      const ecos = await storage.getECOs(orgId, status);
      res.json(ecos);
    } catch (error) {
      console.error("Error fetching ECOs:", error);
      res.status(500).json({ message: "Failed to fetch ECOs" });
    }
  });

  app.post('/api/eco', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = "default-org-id";
      
      const validatedData = insertEcoSchema.parse({
        ...req.body,
        orgId,
        leadEngineerId: userId,
        ecoNumber: await storage.generateNextNumber(orgId, 'ECO')
      });

      const eco = await storage.createECO(validatedData);
      res.status(201).json(eco);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating ECO:", error);
      res.status(500).json({ message: "Failed to create ECO" });
    }
  });

  app.get('/api/eco/:id', isAuthenticated, async (req, res) => {
    try {
      const eco = await storage.getECO(req.params.id);
      if (!eco) {
        return res.status(404).json({ message: "ECO not found" });
      }
      res.json(eco);
    } catch (error) {
      console.error("Error fetching ECO:", error);
      res.status(500).json({ message: "Failed to fetch ECO" });
    }
  });

  app.put('/api/eco/:id', isAuthenticated, async (req, res) => {
    try {
      const eco = await storage.updateECO(req.params.id, req.body);
      res.json(eco);
    } catch (error) {
      console.error("Error updating ECO:", error);
      res.status(500).json({ message: "Failed to update ECO" });
    }
  });

  // ECN routes
  app.get('/api/ecn', isAuthenticated, async (req: any, res) => {
    try {
      const orgId = "default-org-id";
      const status = req.query.status as string;
      
      const ecns = await storage.getECNs(orgId, status);
      res.json(ecns);
    } catch (error) {
      console.error("Error fetching ECNs:", error);
      res.status(500).json({ message: "Failed to fetch ECNs" });
    }
  });

  app.post('/api/ecn', isAuthenticated, async (req: any, res) => {
    try {
      const orgId = "default-org-id";
      
      const validatedData = insertEcnSchema.parse({
        ...req.body,
        orgId,
        ecnNumber: await storage.generateNextNumber(orgId, 'ECN')
      });

      const ecn = await storage.createECN(validatedData);
      res.status(201).json(ecn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating ECN:", error);
      res.status(500).json({ message: "Failed to create ECN" });
    }
  });

  // Approval routes
  app.post('/api/approvals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertApprovalSchema.parse({
        ...req.body,
        approverId: userId
      });

      const approval = await storage.createApproval(validatedData);
      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating approval:", error);
      res.status(500).json({ message: "Failed to create approval" });
    }
  });

  app.put('/api/approvals/:id', isAuthenticated, async (req, res) => {
    try {
      const approval = await storage.updateApproval(req.params.id, {
        ...req.body,
        resolvedAt: new Date()
      });
      res.json(approval);
    } catch (error) {
      console.error("Error updating approval:", error);
      res.status(500).json({ message: "Failed to update approval" });
    }
  });

  // Comment routes
  app.post('/api/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId
      });

      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get('/api/comments/:entityType/:entityId', isAuthenticated, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const comments = await storage.getComments(entityType, entityId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Notifications routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orgId = "default-org-id";
      
      const notifications = await storage.getNotifications(userId, orgId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
