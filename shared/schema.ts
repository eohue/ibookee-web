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

// Social Accounts (Instagram, Blog)
export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // 계정 이름 (예: 아이부키 공식, 안암생활)
  platform: text("platform").notNull(), // instagram, blog, etc.
  username: text("username").notNull(), // @username or blog URL
  profileUrl: text("profile_url"), // 프로필 링크
  profileImageUrl: text("profile_image_url"), // 프로필 이미지
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({ id: true, createdAt: true });
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

// Community Posts (Social Stream)
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  accountId: varchar("account_id").references(() => socialAccounts.id), // 연결된 소셜 계정
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  location: text("location"),
  likes: integer("likes").default(0),
  hashtags: text("hashtags").array(), // ["소모임", "파티", "원데이클래스"]
  sourceUrl: text("source_url"), // 원본 게시물 링크
  externalId: text("external_id"), // 외부 플랫폼 게시물 ID (API 연동용)
  postedAt: timestamp("posted_at").defaultNow(), // 원본 게시 시간
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
  displayOrder: integer("display_order").default(0),
});

export const insertPartnerSchema = createInsertSchema(partners).omit({ id: true });
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

// History milestones
export const historyMilestones = pgTable("history_milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  year: integer("year").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  isHighlight: boolean("is_highlight").default(false),
  displayOrder: integer("display_order").default(0),
});

export const insertHistoryMilestoneSchema = createInsertSchema(historyMilestones).omit({ id: true });
export type InsertHistoryMilestone = z.infer<typeof insertHistoryMilestoneSchema>;
export type HistoryMilestone = typeof historyMilestones.$inferSelect;

// Site Settings (JSON configuration for various pages)
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(), // e.g., 'company-stats', 'footer', 'ceo-message', 'esg-metrics'
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({ id: true, updatedAt: true });
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;

// Type definitions for site settings JSON values
export interface CompanyStats {
  projects: { value: string; label: string; labelEn: string };
  households: { value: string; label: string; labelEn: string };
  years: { value: string; label: string; labelEn: string };
  awards: { value: string; label: string; labelEn: string };
}

export interface FooterSettings {
  tagline: string;
  taglineEn: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

export interface CeoMessage {
  name: string;
  title: string;
  imageUrl: string;
  quote: string;
  paragraphs: string[];
}

export interface BusinessSolution {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  features: string[];
  caseProjectId?: string; // Links to a project
  caseImageUrl?: string;
}

export interface EsgCategory {
  category: string;
  metrics: { label: string; value: string; desc: string }[];
}

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
