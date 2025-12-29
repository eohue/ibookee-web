import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  projects,
  inquiries,
  articles,
  communityPosts,
  socialAccounts,
  events,
  editablePages,
  residentPrograms,
  programApplications,
  projectImages,
  partners,
  type Project,
  type InsertProject,
  type Inquiry,
  type InsertInquiry,
  type Article,
  type InsertArticle,
  type CommunityPost,
  type InsertCommunityPost,
  type SocialAccount,
  type InsertSocialAccount,
  type Event,
  type InsertEvent,
  type EditablePage,
  type InsertEditablePage,
  type ResidentProgram,
  type InsertResidentProgram,
  type ProgramApplication,
  type InsertProgramApplication,
  type ProjectImage,
  type InsertProjectImage,
  type Partner,
  type InsertPartner,
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;

  // Inquiries
  getInquiries(): Promise<Inquiry[]>;
  getInquiriesByType(type: string): Promise<Inquiry[]>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<void>;

  // Articles
  getArticles(): Promise<Article[]>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<void>;

  // Social Accounts
  getSocialAccounts(): Promise<SocialAccount[]>;
  getSocialAccount(id: string): Promise<SocialAccount | undefined>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: string, account: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: string): Promise<void>;

  // Community Posts
  getCommunityPosts(): Promise<CommunityPost[]>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getCommunityPostsByHashtag(hashtag: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: string): Promise<void>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;

  // Editable Pages
  getEditablePages(): Promise<EditablePage[]>;
  getEditablePage(slug: string): Promise<EditablePage | undefined>;
  upsertEditablePage(page: InsertEditablePage): Promise<EditablePage>;

  // Resident Programs
  getResidentPrograms(): Promise<ResidentProgram[]>;
  getResidentProgram(id: string): Promise<ResidentProgram | undefined>;
  getResidentProgramsByType(type: string): Promise<ResidentProgram[]>;
  createResidentProgram(program: InsertResidentProgram): Promise<ResidentProgram>;
  updateResidentProgram(id: string, program: Partial<InsertResidentProgram>): Promise<ResidentProgram | undefined>;
  deleteResidentProgram(id: string): Promise<void>;

  // Program Applications
  getProgramApplications(): Promise<ProgramApplication[]>;
  getProgramApplicationsByProgram(programId: string): Promise<ProgramApplication[]>;
  createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication>;
  updateProgramApplicationStatus(id: string, status: string): Promise<ProgramApplication | undefined>;
  deleteProgramApplication(id: string): Promise<void>;

  // Project Images
  getProjectImages(projectId: string): Promise<ProjectImage[]>;
  createProjectImage(image: InsertProjectImage): Promise<ProjectImage>;
  deleteProjectImage(id: string): Promise<void>;

  // Partners
  getPartners(): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined>;
  deletePartner(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.category, category));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const result = await db.insert(projects).values(project).returning();
    return result[0];
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const result = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return result[0];
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    return db.select().from(inquiries);
  }

  async getInquiriesByType(type: string): Promise<Inquiry[]> {
    return db.select().from(inquiries).where(eq(inquiries.type, type));
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiry).returning();
    return result[0];
  }

  async deleteInquiry(id: string): Promise<void> {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return db.select().from(articles);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id));
    return result[0];
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return db.select().from(articles).where(eq(articles.category, category));
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await db.insert(articles).values(article).returning();
    return result[0];
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const result = await db.update(articles).set(article).where(eq(articles.id, id)).returning();
    return result[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Social Accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return db.select().from(socialAccounts);
  }

  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    const result = await db.select().from(socialAccounts).where(eq(socialAccounts.id, id));
    return result[0];
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const result = await db.insert(socialAccounts).values(account).returning();
    return result[0];
  }

  async updateSocialAccount(id: string, account: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const result = await db.update(socialAccounts).set(account).where(eq(socialAccounts.id, id)).returning();
    return result[0];
  }

  async deleteSocialAccount(id: string): Promise<void> {
    await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
  }

  // Community Posts
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return db.select().from(communityPosts);
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return result[0];
  }

  async getCommunityPostsByHashtag(hashtag: string): Promise<CommunityPost[]> {
    const allPosts = await db.select().from(communityPosts);
    return allPosts.filter(post => post.hashtags?.includes(hashtag));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const result = await db.insert(communityPosts).values(post).returning();
    return result[0];
  }

  async updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const result = await db.update(communityPosts).set(post).where(eq(communityPosts.id, id)).returning();
    return result[0];
  }

  async deleteCommunityPost(id: string): Promise<void> {
    await db.delete(communityPosts).where(eq(communityPosts.id, id));
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return db.select().from(events);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.id, id));
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const result = await db.insert(events).values(event).returning();
    return result[0];
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const result = await db.update(events).set(event).where(eq(events.id, id)).returning();
    return result[0];
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Editable Pages
  async getEditablePages(): Promise<EditablePage[]> {
    return db.select().from(editablePages);
  }

  async getEditablePage(slug: string): Promise<EditablePage | undefined> {
    const result = await db.select().from(editablePages).where(eq(editablePages.slug, slug));
    return result[0];
  }

  async upsertEditablePage(page: InsertEditablePage): Promise<EditablePage> {
    const existing = await this.getEditablePage(page.slug);
    if (existing) {
      const result = await db.update(editablePages)
        .set({ ...page, updatedAt: new Date() })
        .where(eq(editablePages.slug, page.slug))
        .returning();
      return result[0];
    }
    const result = await db.insert(editablePages).values(page).returning();
    return result[0];
  }

  // Resident Programs
  async getResidentPrograms(): Promise<ResidentProgram[]> {
    return db.select().from(residentPrograms);
  }

  async getResidentProgram(id: string): Promise<ResidentProgram | undefined> {
    const result = await db.select().from(residentPrograms).where(eq(residentPrograms.id, id));
    return result[0];
  }

  async getResidentProgramsByType(type: string): Promise<ResidentProgram[]> {
    return db.select().from(residentPrograms).where(eq(residentPrograms.programType, type));
  }

  async createResidentProgram(program: InsertResidentProgram): Promise<ResidentProgram> {
    const result = await db.insert(residentPrograms).values(program).returning();
    return result[0];
  }

  async updateResidentProgram(id: string, program: Partial<InsertResidentProgram>): Promise<ResidentProgram | undefined> {
    const result = await db.update(residentPrograms).set(program).where(eq(residentPrograms.id, id)).returning();
    return result[0];
  }

  async deleteResidentProgram(id: string): Promise<void> {
    await db.delete(residentPrograms).where(eq(residentPrograms.id, id));
  }

  // Program Applications
  async getProgramApplications(): Promise<ProgramApplication[]> {
    return db.select().from(programApplications);
  }

  async getProgramApplicationsByProgram(programId: string): Promise<ProgramApplication[]> {
    return db.select().from(programApplications).where(eq(programApplications.programId, programId));
  }

  async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
    const result = await db.insert(programApplications).values(application).returning();
    return result[0];
  }

  async updateProgramApplicationStatus(id: string, status: string): Promise<ProgramApplication | undefined> {
    const result = await db.update(programApplications).set({ status }).where(eq(programApplications.id, id)).returning();
    return result[0];
  }

  async deleteProgramApplication(id: string): Promise<void> {
    await db.delete(programApplications).where(eq(programApplications.id, id));
  }

  // Project Images
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    return db.select().from(projectImages).where(eq(projectImages.projectId, projectId));
  }

  async createProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
    const result = await db.insert(projectImages).values(image).returning();
    return result[0];
  }

  async deleteProjectImage(id: string): Promise<void> {
    await db.delete(projectImages).where(eq(projectImages.id, id));
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return db.select().from(partners);
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const result = await db.insert(partners).values(partner).returning();
    return result[0];
  }

  async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const result = await db.update(partners).set(partner).where(eq(partners.id, id)).returning();
    return result[0];
  }

  async deletePartner(id: string): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }
}

export const storage = new DatabaseStorage();
