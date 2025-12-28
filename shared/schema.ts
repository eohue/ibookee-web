import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Projects (Space)
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  location: text("location").notNull(),
  category: text("category").notNull(), // youth, single, social-mix, local-anchor
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  year: integer("year").notNull(),
  units: integer("units"),
  featured: boolean("featured").default(false),
});

export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Inquiries (Contact forms)
export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // move-in, business, recruit
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// Articles (Insight)
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull(),
  category: text("category").notNull(), // column, media, library
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").defaultNow(),
  featured: boolean("featured").default(false),
});

export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, publishedAt: true });
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articles.$inferSelect;

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  location: text("location"),
  likes: integer("likes").default(0),
  hashtags: text("hashtags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({ id: true, createdAt: true });
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  status: text("status").default("upcoming"), // upcoming, ongoing, completed
  registrationUrl: text("registration_url"),
  published: boolean("published").default(true),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Partners
export const partners = pgTable("partners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  logoUrl: text("logo_url").notNull(),
  category: text("category").notNull(), // government, finance, institution
});

export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// History milestones
export const historyMilestones = pgTable("history_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
});

export const insertHistoryMilestoneSchema = createInsertSchema(historyMilestones).omit({ id: true });
export type InsertHistoryMilestone = z.infer<typeof insertHistoryMilestoneSchema>;
export type HistoryMilestone = typeof historyMilestones.$inferSelect;

// Editable Pages (About Us, Business)
export const editablePages = pgTable("editable_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(), // about-us, business
  title: text("title").notNull(),
  titleEn: text("title_en"),
  subtitle: text("subtitle"),
  content: jsonb("content"), // JSON blocks for flexible content
  heroImageUrl: text("hero_image_url"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEditablePageSchema = createInsertSchema(editablePages).omit({ id: true, updatedAt: true });
export type InsertEditablePage = z.infer<typeof insertEditablePageSchema>;
export type EditablePage = typeof editablePages.$inferSelect;

// Resident Programs (소모임 지원, 공간 공유 공모전)
export const residentPrograms = pgTable("resident_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programType: text("program_type").notNull(), // small-group, space-sharing
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content"),
  imageUrl: text("image_url"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  status: text("status").default("open"), // open, closed, completed
  maxParticipants: integer("max_participants"),
  published: boolean("published").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResidentProgramSchema = createInsertSchema(residentPrograms).omit({ id: true, createdAt: true });
export type InsertResidentProgram = z.infer<typeof insertResidentProgramSchema>;
export type ResidentProgram = typeof residentPrograms.$inferSelect;

// Program Applications (프로그램 신청)
export const programApplications = pgTable("program_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: text("status").default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProgramApplicationSchema = createInsertSchema(programApplications).omit({ id: true, createdAt: true });
export type InsertProgramApplication = z.infer<typeof insertProgramApplicationSchema>;
export type ProgramApplication = typeof programApplications.$inferSelect;

// Project Images (프로젝트 갤러리)
export const projectImages = pgTable("project_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  displayOrder: integer("display_order").default(0),
});

export const insertProjectImageSchema = createInsertSchema(projectImages).omit({ id: true });
export type InsertProjectImage = z.infer<typeof insertProjectImageSchema>;
export type ProjectImage = typeof projectImages.$inferSelect;

// Re-export auth models
export * from "./models/auth";
