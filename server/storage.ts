import { eq, and, arrayContains, sql } from "drizzle-orm";
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
  historyMilestones,
  siteSettings,
  pageImages,
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
  type HistoryMilestone,
  type InsertHistoryMilestone,
  type SiteSetting,
  type InsertSiteSetting,
  type PageImage,
  type InsertPageImage,
  users,
  type User,
  type UpsertUser,
  communityPostComments,
  type CommunityPostComment,
  type InsertCommunityPostComment,
  type CommunityFeedItem,
} from "@shared/schema";
import fs from "fs";
import path from "path";

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
  getCommunityPosts(page?: number, limit?: number): Promise<{ posts: CommunityPost[], total: number }>;
  getCommunityPost(id: string): Promise<CommunityPost | undefined>;
  getCommunityPostsByHashtag(hashtag: string, page?: number, limit?: number): Promise<{ posts: CommunityPost[], total: number }>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: string): Promise<void>;
  getCommunityPostComments(postId: string): Promise<CommunityPostComment[]>;
  getCommunityPostComments(postId: string): Promise<CommunityPostComment[]>;
  createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment>;
  deleteCommunityPostComment(id: string): Promise<void>;
  likeCommunityPost(id: string): Promise<void>;
  likeCommunityPost(id: string): Promise<void>;
  getUnifiedCommunityFeed(limit: number): Promise<CommunityFeedItem[]>;

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
  getProgramApplicationsByUser(userId: string): Promise<ProgramApplication[]>;
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

  // History Milestones
  getHistoryMilestones(): Promise<HistoryMilestone[]>;
  createHistoryMilestone(milestone: InsertHistoryMilestone): Promise<HistoryMilestone>;
  updateHistoryMilestone(id: string, milestone: Partial<InsertHistoryMilestone>): Promise<HistoryMilestone | undefined>;
  deleteHistoryMilestone(id: string): Promise<void>;

  // Site Settings
  getSiteSettings(): Promise<SiteSetting[]>;
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting>;
  deleteSiteSetting(key: string): Promise<void>;

  // Page Images
  getPageImages(): Promise<PageImage[]>;
  getPageImagesByPage(pageKey: string): Promise<PageImage[]>;
  getPageImage(pageKey: string, imageKey: string): Promise<PageImage | undefined>;
  upsertPageImage(image: InsertPageImage): Promise<PageImage>;
  replacePageImages(pageKey: string, imageKey: string, images: InsertPageImage[]): Promise<PageImage[]>;
  deletePageImage(id: string): Promise<void>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByNaverId(naverId: string): Promise<User | undefined>;
  getUserByKakaoId(kakaoId: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return db.select().from(projects).orderBy(sql`${projects.year} DESC`);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return db.select().from(projects).where(arrayContains(projects.category, [category])).orderBy(sql`${projects.year} DESC`);
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
  async getCommunityPosts(page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(communityPosts);
    const posts = await db.select().from(communityPosts)
      .orderBy(communityPosts.postedAt, communityPosts.createdAt)
      .limit(limit)
      .offset(offset);
    return { posts, total: Number(totalResult?.count || 0) };
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    const result = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return result[0];
  }

  async getCommunityPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    const offset = (page - 1) * limit;
    const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(communityPosts)
      .where(arrayContains(communityPosts.hashtags, [hashtag]));
    const posts = await db.select().from(communityPosts)
      .where(arrayContains(communityPosts.hashtags, [hashtag]))
      .orderBy(communityPosts.postedAt, communityPosts.createdAt)
      .limit(limit)
      .offset(offset);
    return { posts, total: Number(totalResult?.count || 0) };
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

  async getCommunityPostComments(postId: string): Promise<CommunityPostComment[]> {
    return await db.select().from(communityPostComments).where(eq(communityPostComments.postId, postId)).orderBy(communityPostComments.createdAt);
  }

  async createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
    const [newComment] = await db
      .insert(communityPostComments)
      .values(comment)
      .returning();

    // Increment comment count
    await db.update(communityPosts)
      .set({ commentCount: sql`${communityPosts.commentCount} + 1` })
      .where(eq(communityPosts.id, comment.postId));

    return newComment;
  }

  async deleteCommunityPostComment(id: string): Promise<void> {
    const [comment] = await db
      .delete(communityPostComments)
      .where(eq(communityPostComments.id, id))
      .returning();

    if (comment) {
      await db.update(communityPosts)
        .set({ commentCount: sql`${communityPosts.commentCount} - 1` })
        .where(eq(communityPosts.id, comment.postId));
    }
  }

  async likeCommunityPost(id: string): Promise<void> {
    await db.update(communityPosts)
      .set({ likes: sql`${communityPosts.likes} + 1` })
      .where(eq(communityPosts.id, id));
  }

  async getUnifiedCommunityFeed(limit: number): Promise<CommunityFeedItem[]> {
    const socialPosts = await db.select().from(communityPosts).orderBy(sql`${communityPosts.postedAt} DESC`).limit(limit);
    const programList = await db.select().from(residentPrograms).where(eq(residentPrograms.published, true)).orderBy(sql`${residentPrograms.createdAt} DESC`).limit(limit);
    const eventList = await db.select().from(events).where(eq(events.published, true)).orderBy(sql`${events.date} DESC`).limit(limit);

    const items: CommunityFeedItem[] = [
      ...socialPosts.map(post => ({
        id: post.id,
        type: 'social' as const,
        title: post.caption || "",
        imageUrl: post.imageUrl || (post.images && post.images.length > 0 ? post.images[0] : null),
        date: post.postedAt,
        likes: post.likes || 0,
        comments: post.commentCount || 0,
        hashtags: post.hashtags || []
      })),
      ...programList.map(program => ({
        id: program.id,
        type: 'program' as const,
        title: program.title,
        imageUrl: program.imageUrl,
        date: program.createdAt, // or startDate? using createdAt for feed usually
      })),
      ...eventList.map(event => ({
        id: event.id,
        type: 'event' as const,
        title: event.title,
        imageUrl: event.imageUrl,
        date: event.date
      }))
    ];

    return items
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
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

  async getProgramApplicationsByUser(userId: string): Promise<ProgramApplication[]> {
    return db.select().from(programApplications).where(eq(programApplications.userId, userId));
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

  // History Milestones
  async getHistoryMilestones(): Promise<HistoryMilestone[]> {
    return db.select().from(historyMilestones).orderBy(historyMilestones.year);
  }

  async createHistoryMilestone(milestone: InsertHistoryMilestone): Promise<HistoryMilestone> {
    const result = await db.insert(historyMilestones).values(milestone).returning();
    return result[0];
  }

  async updateHistoryMilestone(id: string, milestone: Partial<InsertHistoryMilestone>): Promise<HistoryMilestone | undefined> {
    const result = await db.update(historyMilestones).set(milestone).where(eq(historyMilestones.id, id)).returning();
    return result[0];
  }

  async deleteHistoryMilestone(id: string): Promise<void> {
    await db.delete(historyMilestones).where(eq(historyMilestones.id, id));
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return result[0];
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(setting.key);
    if (existing) {
      const result = await db.update(siteSettings).set({ value: setting.value, updatedAt: new Date() }).where(eq(siteSettings.key, setting.key)).returning();
      return result[0];
    }
    const result = await db.insert(siteSettings).values(setting).returning();
    return result[0];
  }

  async deleteSiteSetting(key: string): Promise<void> {
    await db.delete(siteSettings).where(eq(siteSettings.key, key));
  }

  // Page Images
  async getPageImages(): Promise<PageImage[]> {
    return db.select().from(pageImages);
  }

  async getPageImagesByPage(pageKey: string): Promise<PageImage[]> {
    return db.select().from(pageImages).where(eq(pageImages.pageKey, pageKey));
  }

  async getPageImage(pageKey: string, imageKey: string): Promise<PageImage | undefined> {
    const result = await db.select().from(pageImages)
      .where(and(eq(pageImages.pageKey, pageKey), eq(pageImages.imageKey, imageKey)));
    return result[0];
  }

  async upsertPageImage(image: InsertPageImage): Promise<PageImage> {
    const existing = await this.getPageImage(image.pageKey, image.imageKey);
    if (existing) {
      const result = await db.update(pageImages)
        .set({ imageUrl: image.imageUrl, altText: image.altText })
        .where(eq(pageImages.id, existing.id))
        .returning();
      return result[0];
    }
    const result = await db.insert(pageImages).values(image).returning();
    return result[0];
  }

  async replacePageImages(pageKey: string, imageKey: string, images: InsertPageImage[]): Promise<PageImage[]> {
    // Transactional replacement: delete all matching, then insert new ones
    return await db.transaction(async (tx) => {
      // Delete existing images for this key
      await tx.delete(pageImages)
        .where(and(eq(pageImages.pageKey, pageKey), eq(pageImages.imageKey, imageKey)));

      if (images.length === 0) return [];

      // Insert new images
      const results = await tx.insert(pageImages).values(images).returning();
      return results;
    });
  }

  async deletePageImage(id: string): Promise<void> {
    await db.delete(pageImages).where(eq(pageImages.id, id));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByNaverId(naverId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.naverId, naverId));
    return user;
  }

  async getUserByKakaoId(kakaoId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.kakaoId, kakaoId));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          role: userData.role,
          googleId: userData.googleId,
          naverId: userData.naverId,
          kakaoId: userData.kakaoId,
          isVerified: userData.isVerified,
          realName: userData.realName,
          phoneNumber: userData.phoneNumber,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project> = new Map();
  private inquiries: Map<string, Inquiry> = new Map();
  private articles: Map<string, Article> = new Map();
  private socialAccounts: Map<string, SocialAccount> = new Map();
  private communityPosts: Map<string, CommunityPost> = new Map();
  private communityPostComments: Map<string, CommunityPostComment> = new Map();
  private events: Map<string, Event> = new Map();
  private editablePages: Map<string, EditablePage> = new Map();
  private residentPrograms: Map<string, ResidentProgram> = new Map();
  private programApplications: Map<string, ProgramApplication> = new Map();
  private projectImages: Map<string, ProjectImage> = new Map();
  private partners: Map<string, Partner> = new Map();
  private historyMilestones: Map<string, HistoryMilestone> = new Map();
  private siteSettings: Map<string, SiteSetting> = new Map();
  private pageImages: Map<string, PageImage> = new Map();
  private users: Map<string, User> = new Map();

  async getUnifiedCommunityFeed(limit: number): Promise<CommunityFeedItem[]> {
    const socialPosts = Array.from(this.communityPosts.values()).map(post => ({
      id: post.id,
      type: 'social' as const,
      title: post.caption || "",
      imageUrl: post.imageUrl || (post.images && post.images.length > 0 ? post.images[0] : null),
      date: post.postedAt,
      likes: post.likes || 0,
      comments: post.commentCount || 0,
      hashtags: post.hashtags || []
    }));

    const programs = Array.from(this.residentPrograms.values())
      .filter(p => p.published)
      .map(program => ({
        id: program.id,
        type: 'program' as const,
        title: program.title,
        imageUrl: program.imageUrl,
        date: program.createdAt
      }));

    const events = Array.from(this.events.values())
      .filter(e => e.published)
      .map(event => ({
        id: event.id,
        type: 'event' as const,
        title: event.title,
        imageUrl: event.imageUrl,
        date: event.date
      }));

    return [...socialPosts, ...programs, ...events]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  private idCounter = 1;
  private dbFile = path.resolve(process.cwd(), "db.json");

  constructor() {
    this.load();
    if (!this.siteSettings.has("company_stats")) {
      this.siteSettings.set("company_stats", {
        key: "company_stats",
        value: {
          projectCount: { value: "20+", label: "프로젝트" },
          householdCount: { value: "1000+", label: "세대" },
          yearsInBusiness: { value: "13", label: "년" },
          awardCount: { value: "500+", label: "커뮤니티 지원" }
        },
        id: "13",
        updatedAt: new Date()
      });
    }
  }

  private persist() {
    const data = {
      projects: Array.from(this.projects.entries()),
      inquiries: Array.from(this.inquiries.entries()),
      articles: Array.from(this.articles.entries()),
      socialAccounts: Array.from(this.socialAccounts.entries()),
      communityPosts: Array.from(this.communityPosts.entries()),
      communityPostComments: Array.from(this.communityPostComments.entries()),
      events: Array.from(this.events.entries()),
      editablePages: Array.from(this.editablePages.entries()),
      residentPrograms: Array.from(this.residentPrograms.entries()),
      programApplications: Array.from(this.programApplications.entries()),
      projectImages: Array.from(this.projectImages.entries()),
      partners: Array.from(this.partners.entries()),
      historyMilestones: Array.from(this.historyMilestones.entries()),
      siteSettings: Array.from(this.siteSettings.entries()),
      pageImages: Array.from(this.pageImages.entries()),
      users: Array.from(this.users.entries()),
      idCounter: this.idCounter
    };
    fs.writeFileSync(this.dbFile, JSON.stringify(data, null, 2));
  }

  private load() {
    if (fs.existsSync(this.dbFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dbFile, 'utf-8'));
        this.projects = new Map(data.projects);
        this.inquiries = new Map(data.inquiries);
        this.articles = new Map(data.articles);
        this.socialAccounts = new Map(data.socialAccounts);
        this.communityPosts = new Map(data.communityPosts);
        this.communityPostComments = new Map(data.communityPostComments || []);
        this.events = new Map(data.events);
        this.editablePages = new Map(data.editablePages);
        this.residentPrograms = new Map(data.residentPrograms);
        this.programApplications = new Map(data.programApplications);
        this.projectImages = new Map(data.projectImages);
        this.partners = new Map(data.partners);
        this.historyMilestones = new Map(data.historyMilestones);
        this.historyMilestones = new Map(data.historyMilestones);
        this.siteSettings = new Map(data.siteSettings);
        // Ensure pageImages is loaded correctly as a Map
        this.pageImages = new Map(data.pageImages || []);
        this.users = new Map(data.users);
        this.idCounter = data.idCounter || 1;

        // Sync comment counts
        const commentCounts = new Map<string, number>();
        this.communityPostComments.forEach(comment => {
          const current = commentCounts.get(comment.postId) || 0;
          commentCounts.set(comment.postId, current + 1);
        });

        this.communityPosts.forEach(post => {
          const count = commentCounts.get(post.id) || 0;
          // Only update if different or undefined to avoid unnecessary writes, but for MemStorage strict sync is fine.
          // Also ensure we don't overwrite if DB has it but we want to trust the actual comments count? 
          // Better to trust actual comments count for consistency.
          if (post.commentCount !== count) {
            post.commentCount = count;
            this.communityPosts.set(post.id, post);
          }
        });
      } catch (error) {
        console.error("Failed to load db.json:", error);
      }
    }
  }

  private getId(): string {
    const id = String(this.idCounter++);
    this.persist();
    return id;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => b.year - a.year);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(p => p.category.includes(category)).sort((a, b) => b.year - a.year);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.getId();
    const newProject: Project = { ...project, id, featured: project.featured ?? false, titleEn: project.titleEn ?? null, units: project.units ?? null, partnerLogos: project.partnerLogos ?? null };
    this.projects.set(id, newProject);
    this.persist();
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    this.persist();
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }

  async getInquiriesByType(type: string): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(i => i.type === type);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.getId();
    const newInquiry: Inquiry = { ...inquiry, id, phone: inquiry.phone ?? null, company: inquiry.company ?? null, createdAt: new Date() };
    this.inquiries.set(id, newInquiry);
    this.persist();
    return newInquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    this.inquiries.delete(id);
    this.persist();
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(a => a.category === category);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const id = this.getId();
    const newArticle: Article = {
      ...article,
      id,
      imageUrl: article.imageUrl ?? null,
      featured: article.featured ?? false,
      publishedAt: new Date(),
      fileUrl: article.fileUrl ?? null
    };
    this.articles.set(id, newArticle);
    this.persist();
    return newArticle;
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    const existing = this.articles.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...article };
    this.articles.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    this.articles.delete(id);
    this.persist();
  }

  // Social Accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values());
  }

  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return this.socialAccounts.get(id);
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const id = this.getId();
    const newAccount: SocialAccount = {
      ...account,
      id,
      isActive: account.isActive ?? true,
      profileUrl: account.profileUrl ?? null,
      profileImageUrl: account.profileImageUrl ?? null,
      createdAt: new Date()
    };
    this.socialAccounts.set(id, newAccount);
    this.persist();
    return newAccount;
  }

  async updateSocialAccount(id: string, account: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    const existing = this.socialAccounts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    this.socialAccounts.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteSocialAccount(id: string): Promise<void> {
    this.socialAccounts.delete(id);
    this.persist();
  }

  // Community Posts
  async getCommunityPosts(page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    const allPosts = Array.from(this.communityPosts.values())
      .sort((a, b) => {
        const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return dateB - dateA;
      });
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);
    return { posts, total: allPosts.length };
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getCommunityPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    const allPosts = Array.from(this.communityPosts.values())
      .filter(p => p.hashtags?.includes(hashtag))
      .sort((a, b) => {
        const dateA = a.postedAt ? new Date(a.postedAt).getTime() : 0;
        const dateB = b.postedAt ? new Date(b.postedAt).getTime() : 0;
        return dateB - dateA;
      });
    const offset = (page - 1) * limit;
    const posts = allPosts.slice(offset, offset + limit);
    return { posts, total: allPosts.length };
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.getId();
    const newPost: CommunityPost = {
      ...post,
      id,
      createdAt: new Date(),
      likes: 0,
      commentCount: 0,
      caption: post.caption ?? null,
      location: post.location ?? null,
      imageUrl: post.imageUrl ?? null,
      accountId: post.accountId ?? null,
      hashtags: post.hashtags ?? null,
      sourceUrl: post.sourceUrl ?? null,
      externalId: post.externalId ?? null,
      embedCode: post.embedCode ?? null,
      images: post.images ?? null,
      postedAt: new Date()
    };
    this.communityPosts.set(id, newPost);
    this.persist();
    return newPost;
  }

  async updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    const existing = this.communityPosts.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...post };
    this.communityPosts.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteCommunityPost(id: string): Promise<void> {
    this.communityPosts.delete(id);
    this.persist();
  }

  // Community Post Comments
  async getCommunityPostComments(postId: string): Promise<CommunityPostComment[]> {
    return Array.from(this.communityPostComments.values()).filter(
      (comment) => comment.postId === postId
    );
  }

  async createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
    const id = this.getId(); // Use getId() for consistency
    const newComment: CommunityPostComment = {
      ...comment,
      id,
      createdAt: new Date(),
    };
    this.communityPostComments.set(newComment.id, newComment);

    // Update comment count
    const post = this.communityPosts.get(newComment.postId);
    if (post) {
      post.commentCount = (post.commentCount || 0) + 1;
      this.communityPosts.set(post.id, post);
    }

    this.persist();
    return newComment;
  }

  async deleteCommunityPostComment(id: string): Promise<void> {
    const comment = this.communityPostComments.get(id);
    if (!comment) return;

    this.communityPostComments.delete(id);

    // Update comment count
    const post = this.communityPosts.get(comment.postId);
    if (post) {
      post.commentCount = Math.max((post.commentCount || 1) - 1, 0); // Ensure not negative
      this.communityPosts.set(post.id, post);
    }

    this.persist();
  }

  async likeCommunityPost(id: string): Promise<void> {
    const post = this.communityPosts.get(id);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.communityPosts.set(id, post);
      this.persist();
    }
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.getId();
    const newEvent: Event = {
      ...event,
      id,
      status: event.status ?? "upcoming",
      endDate: event.endDate ?? null,
      imageUrl: event.imageUrl ?? null,
      registrationUrl: event.registrationUrl ?? null,
      published: event.published ?? true
    };
    this.events.set(id, newEvent);
    this.persist();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existing = this.events.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...event };
    this.events.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
    this.persist();
  }

  // Editable Pages
  async getEditablePages(): Promise<EditablePage[]> {
    return Array.from(this.editablePages.values());
  }

  async getEditablePage(slug: string): Promise<EditablePage | undefined> {
    return this.editablePages.get(slug);
  }

  async upsertEditablePage(page: InsertEditablePage): Promise<EditablePage> {
    // MemStorage generally uses ID, but here slug is primary-ish
    // Just overwrite if exists
    const existing = this.editablePages.get(page.slug);
    const id = existing ? existing.id : this.getId();
    const newPage: EditablePage = {
      ...page,
      id,
      updatedAt: new Date(),
      titleEn: page.titleEn ?? null,
      subtitle: page.subtitle ?? null,
      content: page.content ?? null,
      heroImageUrl: page.heroImageUrl ?? null
    };
    this.editablePages.set(page.slug, newPage);
    this.persist();
    return newPage;
  }

  // Resident Programs
  async getResidentPrograms(): Promise<ResidentProgram[]> {
    return Array.from(this.residentPrograms.values());
  }

  async getResidentProgram(id: string): Promise<ResidentProgram | undefined> {
    return this.residentPrograms.get(id);
  }

  async getResidentProgramsByType(type: string): Promise<ResidentProgram[]> {
    return Array.from(this.residentPrograms.values()).filter(p => p.programType === type);
  }

  async createResidentProgram(program: InsertResidentProgram): Promise<ResidentProgram> {
    const id = this.getId();
    const newProgram: ResidentProgram = {
      ...program,
      id,
      maxParticipants: program.maxParticipants ?? null,
      content: program.content ?? null,
      imageUrl: program.imageUrl ?? null,
      startDate: program.startDate ?? null,
      endDate: program.endDate ?? null,
      createdAt: new Date(),
      published: program.published ?? true,
      displayOrder: program.displayOrder ?? 0,
      status: program.status ?? "open"
    };
    this.residentPrograms.set(id, newProgram);
    this.persist();
    return newProgram;
  }

  async updateResidentProgram(id: string, program: Partial<InsertResidentProgram>): Promise<ResidentProgram | undefined> {
    const existing = this.residentPrograms.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...program };
    this.residentPrograms.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteResidentProgram(id: string): Promise<void> {
    this.residentPrograms.delete(id);
    this.persist();
  }

  // Program Applications
  async getProgramApplications(): Promise<ProgramApplication[]> {
    return Array.from(this.programApplications.values());
  }

  async getProgramApplicationsByProgram(programId: string): Promise<ProgramApplication[]> {
    return Array.from(this.programApplications.values()).filter(a => a.programId === programId);
  }

  async getProgramApplicationsByUser(userId: string): Promise<ProgramApplication[]> {
    return Array.from(this.programApplications.values()).filter(a => a.userId === userId);
  }

  async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
    const id = this.getId();
    const newApp: ProgramApplication = {
      ...application,
      id,
      userId: application.userId ?? null,
      status: application.status ?? "pending",
      createdAt: new Date(),
      phone: application.phone ?? null,
      message: application.message ?? null
    };
    this.programApplications.set(id, newApp);
    this.persist();
    return newApp;
  }

  async updateProgramApplicationStatus(id: string, status: string): Promise<ProgramApplication | undefined> {
    const existing = this.programApplications.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this.programApplications.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteProgramApplication(id: string): Promise<void> {
    this.programApplications.delete(id);
    this.persist();
  }

  // Project Images
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    return Array.from(this.projectImages.values()).filter(i => i.projectId === projectId);
  }

  async createProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
    const id = this.getId();
    const newImage: ProjectImage = {
      ...image,
      id,
      caption: image.caption ?? null,
      displayOrder: image.displayOrder ?? 0
    };
    this.projectImages.set(id, newImage);
    this.persist();
    return newImage;
  }

  async deleteProjectImage(id: string): Promise<void> {
    this.projectImages.delete(id);
    this.persist();
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return Array.from(this.partners.values());
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const id = this.getId();
    const newPartner: Partner = { ...partner, id, logoUrl: partner.logoUrl, displayOrder: partner.displayOrder ?? 0 };
    this.partners.set(id, newPartner);
    this.persist();
    return newPartner;
  }

  async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    const existing = this.partners.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partner };
    this.partners.set(id, updated);
    this.persist();
    return updated;
  }

  async deletePartner(id: string): Promise<void> {
    this.partners.delete(id);
    this.persist();
  }

  // History Milestones
  async getHistoryMilestones(): Promise<HistoryMilestone[]> {
    return Array.from(this.historyMilestones.values()).sort((a, b) => a.year - b.year);
  }

  async createHistoryMilestone(milestone: InsertHistoryMilestone): Promise<HistoryMilestone> {
    const id = this.getId();
    const newMilestone: HistoryMilestone = {
      ...milestone,
      id,
      month: milestone.month ?? null,
      link: milestone.link ?? null,
      description: milestone.description ?? null,
      imageUrl: milestone.imageUrl ?? null,
      isHighlight: milestone.isHighlight ?? false,
      displayOrder: milestone.displayOrder ?? 0
    };
    this.historyMilestones.set(id, newMilestone);
    this.persist();
    return newMilestone;
  }

  async updateHistoryMilestone(id: string, milestone: Partial<InsertHistoryMilestone>): Promise<HistoryMilestone | undefined> {
    const existing = this.historyMilestones.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...milestone, month: milestone.month ?? existing.month, link: milestone.link ?? existing.link, description: milestone.description ?? existing.description };
    this.historyMilestones.set(id, updated);
    this.persist();
    return updated;
  }

  async deleteHistoryMilestone(id: string): Promise<void> {
    this.historyMilestones.delete(id);
    this.persist();
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return Array.from(this.siteSettings.values());
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.siteSettings.get(key);
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    const existing = this.siteSettings.get(setting.key);
    const id = existing ? existing.id : this.getId();
    const newSetting: SiteSetting = { ...setting, id, updatedAt: new Date() };
    this.siteSettings.set(setting.key, newSetting);
    this.persist();
    return newSetting;
  }

  async deleteSiteSetting(key: string): Promise<void> {
    this.siteSettings.delete(key);
    this.persist();
  }

  // Page Images
  async getPageImages(): Promise<PageImage[]> {
    return Array.from(this.pageImages.values());
  }

  async getPageImagesByPage(pageKey: string): Promise<PageImage[]> {
    return Array.from(this.pageImages.values()).filter(p => p.pageKey === pageKey);
  }

  async getPageImage(pageKey: string, imageKey: string): Promise<PageImage | undefined> {
    return Array.from(this.pageImages.values()).find(p => p.pageKey === pageKey && p.imageKey === imageKey);
  }

  async upsertPageImage(image: InsertPageImage): Promise<PageImage> {
    const existing = await this.getPageImage(image.pageKey, image.imageKey);
    const id = existing ? existing.id : this.getId();
    const newImage: PageImage = { ...image, id, altText: image.altText ?? null, displayOrder: image.displayOrder ?? 0 };
    this.pageImages.set(id, newImage);
    this.persist();
    return newImage;
  }

  async deletePageImage(id: string): Promise<void> {
    this.pageImages.delete(id);
    this.persist();
  }

  async replacePageImages(pageKey: string, imageKey: string, images: InsertPageImage[]): Promise<PageImage[]> {
    // 1. Remove existing
    const entries = Array.from(this.pageImages.entries());
    for (const [id, img] of entries) {
      if (img.pageKey === pageKey && img.imageKey === imageKey) {
        this.pageImages.delete(id);
      }
    }

    // 2. Insert new
    const results: PageImage[] = [];
    for (const img of images) {
      const id = this.getId();
      const newImg: PageImage = {
        ...img,
        id,
        displayOrder: img.displayOrder ?? 0,
        altText: img.altText ?? null
      };
      this.pageImages.set(id, newImg);
      results.push(newImg);
    }
    this.persist();
    return results;
  }


  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.googleId === googleId);
  }

  async getUserByNaverId(naverId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.naverId === naverId);
  }

  async getUserByKakaoId(kakaoId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.kakaoId === kakaoId);
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    const email = user.email!;
    const existing = await this.getUserByEmail(email);
    const id = existing ? existing.id : (user.id ?? this.getId());
    const newUser: User = {
      ...user,
      id,
      email: email,
      password: user.password ?? existing?.password ?? null,
      createdAt: existing?.createdAt ?? new Date(),
      updatedAt: new Date(),
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      profileImageUrl: user.profileImageUrl ?? null,
      role: user.role ?? "user",
      googleId: user.googleId ?? existing?.googleId ?? null,
      naverId: user.naverId ?? existing?.naverId ?? null,
      kakaoId: user.kakaoId ?? existing?.kakaoId ?? null,
      isVerified: user.isVerified ?? existing?.isVerified ?? false,
      realName: user.realName ?? existing?.realName ?? null,
      phoneNumber: user.phoneNumber ?? existing?.phoneNumber ?? null,
    };
    this.users.set(id, newUser);
    this.persist();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, role, updatedAt: new Date() };
    this.users.set(id, updated);
    this.persist();
    return updated;
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
