import { 
  users,
  organizations,
  organizationUsers,
  ecrs,
  ecos,
  ecns,
  approvals,
  comments,
  attachments,
  notifications,
  auditLog,
  type User,
  type UpsertUser,
  type Organization,
  type OrganizationUser,
  type ECR,
  type ECO,
  type ECN,
  type Approval,
  type Comment,
  type Attachment,
  type Notification,
  type AuditLog,
  type InsertOrganization,
  type InsertOrganizationUser,
  type InsertECR,
  type InsertECO,
  type InsertECN,
  type InsertApproval,
  type InsertComment,
  type InsertAttachment,
  type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Organization User operations
  getOrganizationUser(userId: string, orgId: string): Promise<OrganizationUser | undefined>;
  getOrganizationUsers(orgId: string): Promise<OrganizationUser[]>;
  createOrganizationUser(orgUser: InsertOrganizationUser): Promise<OrganizationUser>;
  
  // ECR operations
  createECR(ecr: InsertECR): Promise<ECR>;
  getECR(id: string): Promise<ECR | undefined>;
  getECRs(orgId: string, status?: string): Promise<ECR[]>;
  updateECR(id: string, updates: Partial<ECR>): Promise<ECR>;
  
  // ECO operations
  createECO(eco: InsertECO): Promise<ECO>;
  getECO(id: string): Promise<ECO | undefined>;
  getECOs(orgId: string, status?: string): Promise<ECO[]>;
  updateECO(id: string, updates: Partial<ECO>): Promise<ECO>;
  
  // ECN operations
  createECN(ecn: InsertECN): Promise<ECN>;
  getECN(id: string): Promise<ECN | undefined>;
  getECNs(orgId: string, status?: string): Promise<ECN[]>;
  updateECN(id: string, updates: Partial<ECN>): Promise<ECN>;
  
  // Approval operations
  createApproval(approval: InsertApproval): Promise<Approval>;
  getPendingApprovals(userId: string, orgId: string): Promise<Approval[]>;
  updateApproval(id: string, updates: Partial<Approval>): Promise<Approval>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(entityType: string, entityId: string): Promise<Comment[]>;
  
  // Attachment operations
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachments(entityType: string, entityId: string): Promise<Attachment[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string, orgId: string): Promise<Notification[]>;
  markNotificationRead(id: string): Promise<void>;
  
  // Dashboard metrics
  getDashboardMetrics(orgId: string): Promise<{
    activeECRs: number;
    inProgressECOs: number;
    pendingApprovals: number;
    completedThisMonth: number;
  }>;
  
  // Recent activity
  getRecentActivity(orgId: string, limit?: number): Promise<any[]>;
  
  // Generate next number
  generateNextNumber(orgId: string, type: 'ECR' | 'ECO' | 'ECN'): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization operations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationBySubdomain(subdomain: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.subdomain, subdomain));
    return org;
  }

  async createOrganization(orgData: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(orgData).returning();
    return org;
  }

  // Organization User operations
  async getOrganizationUser(userId: string, orgId: string): Promise<OrganizationUser | undefined> {
    const [orgUser] = await db
      .select()
      .from(organizationUsers)
      .where(and(eq(organizationUsers.userId, userId), eq(organizationUsers.orgId, orgId)));
    return orgUser;
  }

  async getOrganizationUsers(orgId: string): Promise<OrganizationUser[]> {
    return db.select().from(organizationUsers).where(eq(organizationUsers.orgId, orgId));
  }

  async createOrganizationUser(orgUserData: InsertOrganizationUser): Promise<OrganizationUser> {
    const [orgUser] = await db.insert(organizationUsers).values(orgUserData).returning();
    return orgUser;
  }

  // ECR operations
  async createECR(ecrData: InsertECR): Promise<ECR> {
    const [ecr] = await db.insert(ecrs).values(ecrData).returning();
    return ecr;
  }

  async getECR(id: string): Promise<ECR | undefined> {
    const [ecr] = await db.select().from(ecrs).where(eq(ecrs.id, id));
    return ecr;
  }

  async getECRs(orgId: string, status?: string): Promise<ECR[]> {
    const query = db.select().from(ecrs).where(eq(ecrs.orgId, orgId));
    if (status) {
      query.where(and(eq(ecrs.orgId, orgId), eq(ecrs.status, status)));
    }
    return query.orderBy(desc(ecrs.createdAt));
  }

  async updateECR(id: string, updates: Partial<ECR>): Promise<ECR> {
    const [ecr] = await db.update(ecrs).set(updates).where(eq(ecrs.id, id)).returning();
    return ecr;
  }

  // ECO operations
  async createECO(ecoData: InsertECO): Promise<ECO> {
    const [eco] = await db.insert(ecos).values(ecoData).returning();
    return eco;
  }

  async getECO(id: string): Promise<ECO | undefined> {
    const [eco] = await db.select().from(ecos).where(eq(ecos.id, id));
    return eco;
  }

  async getECOs(orgId: string, status?: string): Promise<ECO[]> {
    const query = db.select().from(ecos).where(eq(ecos.orgId, orgId));
    if (status) {
      query.where(and(eq(ecos.orgId, orgId), eq(ecos.status, status)));
    }
    return query.orderBy(desc(ecos.createdAt));
  }

  async updateECO(id: string, updates: Partial<ECO>): Promise<ECO> {
    const [eco] = await db.update(ecos).set(updates).where(eq(ecos.id, id)).returning();
    return eco;
  }

  // ECN operations
  async createECN(ecnData: InsertECN): Promise<ECN> {
    const [ecn] = await db.insert(ecns).values(ecnData).returning();
    return ecn;
  }

  async getECN(id: string): Promise<ECN | undefined> {
    const [ecn] = await db.select().from(ecns).where(eq(ecns.id, id));
    return ecn;
  }

  async getECNs(orgId: string, status?: string): Promise<ECN[]> {
    const query = db.select().from(ecns).where(eq(ecns.orgId, orgId));
    if (status) {
      query.where(and(eq(ecns.orgId, orgId), eq(ecns.implementationStatus, status)));
    }
    return query.orderBy(desc(ecns.createdAt));
  }

  async updateECN(id: string, updates: Partial<ECN>): Promise<ECN> {
    const [ecn] = await db.update(ecns).set(updates).where(eq(ecns.id, id)).returning();
    return ecn;
  }

  // Approval operations
  async createApproval(approvalData: InsertApproval): Promise<Approval> {
    const [approval] = await db.insert(approvals).values(approvalData).returning();
    return approval;
  }

  async getPendingApprovals(userId: string, orgId: string): Promise<Approval[]> {
    return db
      .select()
      .from(approvals)
      .where(and(eq(approvals.approverId, userId), eq(approvals.status, 'pending')))
      .orderBy(desc(approvals.createdAt));
  }

  async updateApproval(id: string, updates: Partial<Approval>): Promise<Approval> {
    const [approval] = await db.update(approvals).set(updates).where(eq(approvals.id, id)).returning();
    return approval;
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async getComments(entityType: string, entityId: string): Promise<Comment[]> {
    return db
      .select()
      .from(comments)
      .where(and(eq(comments.entityType, entityType), eq(comments.entityId, entityId)))
      .orderBy(desc(comments.createdAt));
  }

  // Attachment operations
  async createAttachment(attachmentData: InsertAttachment): Promise<Attachment> {
    const [attachment] = await db.insert(attachments).values(attachmentData).returning();
    return attachment;
  }

  async getAttachments(entityType: string, entityId: string): Promise<Attachment[]> {
    return db
      .select()
      .from(attachments)
      .where(and(eq(attachments.entityType, entityType), eq(attachments.entityId, entityId)))
      .orderBy(desc(attachments.createdAt));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getNotifications(userId: string, orgId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.orgId, orgId)))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  }

  async markNotificationRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notifications.id, id));
  }

  // Dashboard metrics
  async getDashboardMetrics(orgId: string) {
    const [activeECRsResult] = await db
      .select({ count: count() })
      .from(ecrs)
      .where(and(eq(ecrs.orgId, orgId), eq(ecrs.status, 'submitted')));

    const [inProgressECOsResult] = await db
      .select({ count: count() })
      .from(ecos)
      .where(and(eq(ecos.orgId, orgId), eq(ecos.status, 'in_progress')));

    const [pendingApprovalsResult] = await db
      .select({ count: count() })
      .from(approvals)
      .where(eq(approvals.status, 'pending'));

    const [completedThisMonthResult] = await db
      .select({ count: count() })
      .from(ecos)
      .where(and(
        eq(ecos.orgId, orgId),
        eq(ecos.status, 'completed'),
        sql`${ecos.completedAt} >= date_trunc('month', current_date)`
      ));

    return {
      activeECRs: activeECRsResult?.count || 0,
      inProgressECOs: inProgressECOsResult?.count || 0,
      pendingApprovals: pendingApprovalsResult?.count || 0,
      completedThisMonth: completedThisMonthResult?.count || 0,
    };
  }

  // Recent activity
  async getRecentActivity(orgId: string, limit: number = 10): Promise<any[]> {
    // This is a simplified version - in production, you'd want to create a proper activity feed
    const recentECRs = await db
      .select({
        id: ecrs.id,
        type: sql<string>`'ECR'`,
        title: ecrs.title,
        status: ecrs.status,
        createdAt: ecrs.createdAt,
        requestorId: ecrs.requestorId,
      })
      .from(ecrs)
      .where(eq(ecrs.orgId, orgId))
      .orderBy(desc(ecrs.createdAt))
      .limit(limit);

    return recentECRs;
  }

  // Generate next number
  async generateNextNumber(orgId: string, type: 'ECR' | 'ECO' | 'ECN'): Promise<string> {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = `${type}-${currentYear}-`;
    
    let table;
    let numberField;
    
    switch (type) {
      case 'ECR':
        table = ecrs;
        numberField = ecrs.ecrNumber;
        break;
      case 'ECO':
        table = ecos;
        numberField = ecos.ecoNumber;
        break;
      case 'ECN':
        table = ecns;
        numberField = ecns.ecnNumber;
        break;
    }

    const [result] = await db
      .select({ count: count() })
      .from(table)
      .where(and(
        eq(table.orgId, orgId),
        sql`${numberField} LIKE ${prefix + '%'}`
      ));

    const nextNumber = (result?.count || 0) + 1;
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  }
}

export const storage = new DatabaseStorage();
