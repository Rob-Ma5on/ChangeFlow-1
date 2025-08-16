import { sql } from 'drizzle-orm';
import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  jsonb, 
  integer, 
  boolean,
  index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  subdomain: varchar("subdomain", { length: 100 }).unique().notNull(),
  planType: varchar("plan_type", { enum: ['starter', 'professional', 'enterprise'] }).default('starter'),
  maxUsers: integer("max_users").default(5),
  currentUsers: integer("current_users").default(0),
  subscriptionStatus: varchar("subscription_status", { enum: ['active', 'trial', 'suspended', 'cancelled'] }).default('trial'),
  billingCycle: varchar("billing_cycle", { enum: ['monthly', 'annual'] }).default('monthly'),
  trialEndDate: timestamp("trial_end_date"),
  createdAt: timestamp("created_at").defaultNow(),
  settings: jsonb("settings").$type<{
    enableChangeReviewBoard: boolean;
    ecrPrefix: string;
    ecoPrefix: string;
    ecnPrefix: string;
    approvalLevels: string[];
    notificationSettings: Record<string, any>;
  }>(),
});

// Organization users table
export const organizationUsers = pgTable("organization_users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  orgId: uuid("org_id").references(() => organizations.id),
  role: varchar("role", { enum: ['admin', 'engineering_manager', 'engineer', 'requestor', 'viewer', 'custom'] }).default('requestor'),
  customPermissions: jsonb("custom_permissions"),
  department: varchar("department", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ECR (Engineering Change Requests) table
export const ecrs = pgTable("ecrs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  ecrNumber: varchar("ecr_number", { length: 20 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  businessJustification: text("business_justification"),
  requestorId: varchar("requestor_id").references(() => users.id),
  category: varchar("category", { length: 100 }),
  priority: varchar("priority", { enum: ['low', 'medium', 'high', 'critical'] }).default('medium'),
  status: varchar("status", { enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'more_info_needed', 'crb_review'] }).default('draft'),
  approvalType: varchar("approval_type", { enum: ['manager_only', 'change_review_board'] }).default('manager_only'),
  estimatedCost: integer("estimated_cost"),
  estimatedHours: integer("estimated_hours"),
  affectedProducts: jsonb("affected_products").$type<string[]>(),
  affectedDepartments: jsonb("affected_departments").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
  resolvedAt: timestamp("resolved_at"),
});

// ECO (Engineering Change Orders) table
export const ecos = pgTable("ecos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  ecoNumber: varchar("eco_number", { length: 20 }).notNull(),
  parentEcoId: uuid("parent_eco_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  technicalDetails: text("technical_details"),
  assignedEngineers: jsonb("assigned_engineers").$type<string[]>(),
  leadEngineerId: varchar("lead_engineer_id").references(() => users.id),
  status: varchar("status", { enum: ['backlog', 'in_progress', 'review', 'completed', 'on_hold'] }).default('backlog'),
  actualHours: integer("actual_hours"),
  estimatedHours: integer("estimated_hours"),
  linkedEcrIds: jsonb("linked_ecr_ids").$type<string[]>(),
  implementationNotes: text("implementation_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
});

// ECN (Engineering Change Notices) table
export const ecns = pgTable("ecns", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  ecnNumber: varchar("ecn_number", { length: 20 }).notNull(),
  ecoId: uuid("eco_id").references(() => ecos.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  implementationInstructions: text("implementation_instructions"),
  notificationType: varchar("notification_type", { enum: ['review_required', 'notification_only'] }).default('notification_only'),
  affectedDepartments: jsonb("affected_departments").$type<string[]>(),
  approvalStatus: varchar("approval_status", { enum: ['pending', 'approved', 'rejected'] }).default('pending'),
  implementationStatus: varchar("implementation_status", { enum: ['waiting', 'in_progress', 'completed'] }).default('waiting'),
  createdAt: timestamp("created_at").defaultNow(),
  implementedAt: timestamp("implemented_at"),
});

// Approvals table
export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { enum: ['ECR', 'ECO', 'ECN'] }).notNull(),
  entityId: uuid("entity_id").notNull(),
  approverId: varchar("approver_id").references(() => users.id).notNull(),
  approvalLevel: integer("approval_level").default(1),
  status: varchar("status", { enum: ['pending', 'approved', 'rejected', 'conditional'] }).default('pending'),
  comments: text("comments"),
  conditions: text("conditions"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { enum: ['ECR', 'ECO', 'ECN'] }).notNull(),
  entityId: uuid("entity_id").notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  commentText: text("comment_text").notNull(),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  editedAt: timestamp("edited_at"),
});

// Attachments table
export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: varchar("entity_type", { enum: ['ECR', 'ECO', 'ECN'] }).notNull(),
  entityId: uuid("entity_id").notNull(),
  uploadedBy: varchar("uploaded_by").references(() => users.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit log table
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  entityType: varchar("entity_type", { enum: ['ECR', 'ECO', 'ECN', 'USER', 'ORGANIZATION'] }).notNull(),
  entityId: uuid("entity_id"),
  action: varchar("action", { length: 100 }).notNull(),
  changes: jsonb("changes"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  orgId: uuid("org_id").references(() => organizations.id).notNull(),
  entityType: varchar("entity_type", { enum: ['ECR', 'ECO', 'ECN'] }),
  entityId: uuid("entity_id"),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  actionUrl: varchar("action_url", { length: 500 }),
  isRead: boolean("is_read").default(false),
  isEmailSent: boolean("is_email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(organizationUsers),
  ecrs: many(ecrs),
  ecos: many(ecos),
  ecns: many(ecns),
}));

export const organizationUsersRelations = relations(organizationUsers, ({ one }) => ({
  user: one(users, { fields: [organizationUsers.userId], references: [users.id] }),
  organization: one(organizations, { fields: [organizationUsers.orgId], references: [organizations.id] }),
}));

export const ecrsRelations = relations(ecrs, ({ one, many }) => ({
  organization: one(organizations, { fields: [ecrs.orgId], references: [organizations.id] }),
  requestor: one(users, { fields: [ecrs.requestorId], references: [users.id] }),
  comments: many(comments),
  attachments: many(attachments),
  approvals: many(approvals),
}));

export const ecosRelations = relations(ecos, ({ one, many }) => ({
  organization: one(organizations, { fields: [ecos.orgId], references: [organizations.id] }),
  leadEngineer: one(users, { fields: [ecos.leadEngineerId], references: [users.id] }),
  parentEco: one(ecos, { fields: [ecos.parentEcoId], references: [ecos.id] }),
  subEcos: many(ecos),
  ecns: many(ecns),
  comments: many(comments),
  attachments: many(attachments),
  approvals: many(approvals),
}));

export const ecnsRelations = relations(ecns, ({ one, many }) => ({
  organization: one(organizations, { fields: [ecns.orgId], references: [organizations.id] }),
  eco: one(ecos, { fields: [ecns.ecoId], references: [ecos.id] }),
  comments: many(comments),
  attachments: many(attachments),
  approvals: many(approvals),
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations);
export const insertOrganizationUserSchema = createInsertSchema(organizationUsers);
export const insertEcrSchema = createInsertSchema(ecrs);
export const insertEcoSchema = createInsertSchema(ecos);
export const insertEcnSchema = createInsertSchema(ecns);
export const insertApprovalSchema = createInsertSchema(approvals);
export const insertCommentSchema = createInsertSchema(comments);
export const insertAttachmentSchema = createInsertSchema(attachments);
export const insertNotificationSchema = createInsertSchema(notifications);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type OrganizationUser = typeof organizationUsers.$inferSelect;
export type ECR = typeof ecrs.$inferSelect;
export type ECO = typeof ecos.$inferSelect;
export type ECN = typeof ecns.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertOrganizationUser = z.infer<typeof insertOrganizationUserSchema>;
export type InsertECR = z.infer<typeof insertEcrSchema>;
export type InsertECO = z.infer<typeof insertEcoSchema>;
export type InsertECN = z.infer<typeof insertEcnSchema>;
export type InsertApproval = z.infer<typeof insertApprovalSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
