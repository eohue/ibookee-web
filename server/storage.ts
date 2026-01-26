import { eq, and, arrayContains, sql, desc, count } from "drizzle-orm";
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
  subprojects,
  historyMilestones,
  siteSettings,
  pageImages,
  users,
  communityPostComments,
  residentReporters,
  housingRecruitments,
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
  type Subproject,
  type InsertSubproject,
  type HistoryMilestone,
  type InsertHistoryMilestone,
  type SiteSetting,
  type InsertSiteSetting,
  type PageImage,
  type InsertPageImage,
  type User,
  type UpsertUser,
  type CommunityPostComment,
  type InsertCommunityPostComment,
  type CommunityFeedItem,
  type ResidentReporter,
  type InsertResidentReporter,
  type ResidentReporterComment,
  type InsertResidentReporterComment,
  residentReporterComments,
  type HousingRecruitment,
  type InsertHousingRecruitment,
} from "@shared/schema";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid"; // Added nanoid import

export interface IStorage {
  // Projects
  getProjects(page?: number, limit?: number): Promise<{ projects: Project[], total: number }>;
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
  // Articles
  getArticles(page?: number, limit?: number): Promise<{ articles: Article[], total: number }>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string, page?: number, limit?: number): Promise<{ articles: Article[], total: number }>;
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
  createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment>;
  deleteCommunityPostComment(id: string): Promise<void>;
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

  // Subprojects
  getSubprojects(parentProjectId: string): Promise<Subproject[]>;
  getSubproject(id: string): Promise<Subproject | undefined>;
  createSubproject(subproject: InsertSubproject): Promise<Subproject>;
  updateSubproject(id: string, subproject: Partial<InsertSubproject>): Promise<Subproject | undefined>;
  deleteSubproject(id: string): Promise<void>;

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
  verifyUserRealName(userId: string, realName: string, phoneNumber: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined>;
  updateUserProfile(id: string, data: { realName?: string; nickname?: string }): Promise<User | undefined>;


  // Resident Reporter
  createReporterArticle(userId: string, data: InsertResidentReporter): Promise<ResidentReporter>;
  getReporterArticles(status?: string): Promise<ResidentReporter[]>;
  getReporterArticlesByUser(userId: string): Promise<ResidentReporter[]>;
  updateReporterArticle(id: string, userId: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined>;
  updateReporterArticleStatus(id: string, status: string): Promise<ResidentReporter | undefined>;
  adminUpdateReporterArticle(id: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined>;
  deleteReporterArticle(id: string): Promise<boolean>;
  updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User | undefined>;
  likeReporterArticle(id: string): Promise<void>;

  // Stats
  getStatsCounts(): Promise<any>;
  getReporterArticleComments(articleId: string): Promise<ResidentReporterComment[]>;
  createReporterArticleComment(comment: InsertResidentReporterComment): Promise<ResidentReporterComment>;
  deleteReporterArticleComment(commentId: string): Promise<void>;

  // Housing Recruitments
  getHousingRecruitments(): Promise<HousingRecruitment[]>;
  getHousingRecruitment(id: string): Promise<HousingRecruitment | undefined>;
  getPublishedHousingRecruitments(): Promise<HousingRecruitment[]>;
  createHousingRecruitment(recruitment: InsertHousingRecruitment): Promise<HousingRecruitment>;
  updateHousingRecruitment(id: string, recruitment: Partial<InsertHousingRecruitment>): Promise<HousingRecruitment | undefined>;
  deleteHousingRecruitment(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(page: number = 1, limit: number = 100): Promise<{ projects: Project[], total: number }> {
    const offset = (page - 1) * limit;

    const [projectsResult, countResult] = await Promise.all([
      db.select({
        id: projects.id,
        title: projects.title,
        titleEn: projects.titleEn,
        location: projects.location,
        category: projects.category,
        imageUrl: projects.imageUrl,
        year: projects.year,
        completionMonth: projects.completionMonth,
        units: projects.units,
        siteArea: projects.siteArea,
        grossFloorArea: projects.grossFloorArea,
        scale: projects.scale,
        featured: projects.featured,
        partnerLogos: projects.partnerLogos,
        pdfUrl: projects.pdfUrl,
        description: projects.description,
        relatedArticles: projects.relatedArticles,
      })
        .from(projects)
        .orderBy(desc(projects.year))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() }).from(projects)
    ]);

    return {
      projects: projectsResult,
      total: countResult[0]?.count || 0
    };
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
  async getArticles(page: number = 1, limit: number = 100): Promise<{ articles: Article[], total: number }> {
    const offset = (page - 1) * limit;

    const [articlesResult, countResult] = await Promise.all([
      db.select({
        id: articles.id,
        title: articles.title,
        excerpt: articles.excerpt,
        author: articles.author,
        category: articles.category,
        imageUrl: articles.imageUrl,
        fileUrl: articles.fileUrl,
        sourceUrl: articles.sourceUrl,
        publishedAt: articles.publishedAt,
        featured: articles.featured,
        content: articles.content,
      })
        .from(articles)
        .orderBy(desc(articles.publishedAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() }).from(articles)
    ]);

    return {
      articles: articlesResult,
      total: countResult[0]?.count || 0
    };
  }

  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id));
    return result[0];
  }

  async getArticlesByCategory(category: string, page: number = 1, limit: number = 100): Promise<{ articles: Article[], total: number }> {
    const offset = (page - 1) * limit;

    const [articlesResult, countResult] = await Promise.all([
      db.select({
        id: articles.id,
        title: articles.title,
        excerpt: articles.excerpt,
        author: articles.author,
        category: articles.category,
        imageUrl: articles.imageUrl,
        fileUrl: articles.fileUrl,
        sourceUrl: articles.sourceUrl,
        publishedAt: articles.publishedAt,
        featured: articles.featured,
        content: articles.content,
      })
        .from(articles)
        .where(eq(articles.category, category))
        .orderBy(desc(articles.publishedAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: count() }).from(articles).where(eq(articles.category, category))
    ]);

    return {
      articles: articlesResult,
      total: countResult[0]?.count || 0
    };
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

  // Stats Optimization
  async getStatsCounts() {
    const [
      projectCount,
      inquiryCount,
      articleCount,
      communityPostCount,
      eventCount,
      programCount,
      partnerCount,
      userCount,
      adminCount,
      residentCount,
      milestoneCount,
      reporterArticleCount,
      pendingReporterCount,
      approvedReporterCount,
      programApplicationCount,
      pendingApplicationCount
    ] = await Promise.all([
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(inquiries),
      db.select({ count: count() }).from(articles),
      db.select({ count: count() }).from(communityPosts),
      db.select({ count: count() }).from(events),
      db.select({ count: count() }).from(residentPrograms),
      db.select({ count: count() }).from(partners),
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(users).where(eq(users.role, 'admin')),
      db.select({ count: count() }).from(users).where(eq(users.role, 'resident')),
      db.select({ count: count() }).from(historyMilestones),
      db.select({ count: count() }).from(residentReporters),
      db.select({ count: count() }).from(residentReporters).where(eq(residentReporters.status, 'pending')),
      db.select({ count: count() }).from(residentReporters).where(eq(residentReporters.status, 'approved')),
      db.select({ count: count() }).from(programApplications),
      db.select({ count: count() }).from(programApplications).where(eq(programApplications.status, 'pending')),
    ]);

    return {
      projectCount: projectCount[0].count,
      inquiryCount: inquiryCount[0].count,
      articleCount: articleCount[0].count,
      communityPostCount: communityPostCount[0].count,
      eventCount: eventCount[0].count,
      programCount: programCount[0].count,
      partnerCount: partnerCount[0].count,
      userCount: userCount[0].count,
      adminCount: adminCount[0].count,
      residentCount: residentCount[0].count,
      milestoneCount: milestoneCount[0].count,
      reporterArticleCount: reporterArticleCount[0].count,
      pendingReporterCount: pendingReporterCount[0].count,
      approvedReporterCount: approvedReporterCount[0].count,
      applicationCount: programApplicationCount[0].count,
      pendingApplicationCount: pendingApplicationCount[0].count,
    };
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

  // Subprojects
  async getSubprojects(parentProjectId: string): Promise<Subproject[]> {
    return db.select().from(subprojects)
      .where(eq(subprojects.parentProjectId, parentProjectId))
      .orderBy(subprojects.displayOrder);
  }

  async getSubproject(id: string): Promise<Subproject | undefined> {
    const result = await db.select().from(subprojects).where(eq(subprojects.id, id));
    return result[0];
  }

  async createSubproject(subproject: InsertSubproject): Promise<Subproject> {
    const result = await db.insert(subprojects).values(subproject).returning();
    return result[0];
  }

  async updateSubproject(id: string, subproject: Partial<InsertSubproject>): Promise<Subproject | undefined> {
    const result = await db.update(subprojects).set(subproject).where(eq(subprojects.id, id)).returning();
    return result[0];
  }

  async deleteSubproject(id: string): Promise<void> {
    await db.delete(subprojects).where(eq(subprojects.id, id));
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

  async verifyUserRealName(id: string, realName: string, phoneNumber: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        realName,
        phoneNumber,
        isVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: { realName?: string; nickname?: string }): Promise<User | undefined> {
    const updateData: any = { updatedAt: new Date() };
    if (data.realName !== undefined) updateData.realName = data.realName;
    if (data.realName !== undefined) updateData.firstName = data.realName; // Also update firstName for display
    if (data.nickname !== undefined) updateData.nickname = data.nickname;

    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Resident Reporter
  async createReporterArticle(userId: string, data: InsertResidentReporter): Promise<ResidentReporter> {
    const [article] = await db.insert(residentReporters).values({
      ...data,
      userId,
      status: "pending",
      createdAt: new Date(),
      approvedAt: null,
    }).returning();
    return article;
  }

  async getReporterArticles(status?: string): Promise<ResidentReporter[]> {
    if (status) {
      return db.select().from(residentReporters).where(eq(residentReporters.status, status)).orderBy(desc(residentReporters.createdAt));
    }
    return db.select().from(residentReporters).orderBy(desc(residentReporters.createdAt));
  }

  async updateReporterArticleStatus(id: string, status: string): Promise<ResidentReporter | undefined> {
    const [updatedArticle] = await db.update(residentReporters).set({
      status,
      approvedAt: status === 'approved' ? new Date() : null,
    }).where(eq(residentReporters.id, id)).returning();
    return updatedArticle;
  }

  async getReporterArticlesByUser(userId: string): Promise<ResidentReporter[]> {
    return db.select().from(residentReporters).where(eq(residentReporters.userId, userId)).orderBy(desc(residentReporters.createdAt));
  }

  async updateReporterArticle(id: string, userId: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
    // Only allow update if the article belongs to the user and is still pending
    const [existing] = await db.select().from(residentReporters).where(and(eq(residentReporters.id, id), eq(residentReporters.userId, userId)));
    if (!existing || existing.status !== 'pending') return undefined;

    const [updatedArticle] = await db.update(residentReporters).set({
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      authorName: data.authorName ?? existing.authorName,
      imageUrl: data.imageUrl ?? existing.imageUrl,
    }).where(eq(residentReporters.id, id)).returning();
    return updatedArticle;
  }

  async adminUpdateReporterArticle(id: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
    const [existing] = await db.select().from(residentReporters).where(eq(residentReporters.id, id));
    if (!existing) return undefined;

    const [updatedArticle] = await db.update(residentReporters).set({
      title: data.title ?? existing.title,
      content: data.content ?? existing.content,
      authorName: data.authorName ?? existing.authorName,
      imageUrl: data.imageUrl ?? existing.imageUrl,
      updatedAt: new Date(),
    }).where(eq(residentReporters.id, id)).returning();
    return updatedArticle;
  }

  async deleteReporterArticle(id: string): Promise<boolean> {
    const [existing] = await db.select().from(residentReporters).where(eq(residentReporters.id, id));
    if (!existing) return false;

    await db.delete(residentReporters).where(eq(residentReporters.id, id));
    return true;
  }

  async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      profileImageUrl,
      updatedAt: new Date()
    }).where(eq(users.id, userId)).returning();
    return user;
  }

  async likeReporterArticle(id: string): Promise<void> {
    await db.update(residentReporters)
      .set({ likes: sql`${residentReporters.likes} + 1` })
      .where(eq(residentReporters.id, id));
  }

  async getReporterArticleComments(articleId: string): Promise<ResidentReporterComment[]> {
    return db.select().from(residentReporterComments).where(eq(residentReporterComments.articleId, articleId)).orderBy(residentReporterComments.createdAt);
  }

  async createReporterArticleComment(comment: InsertResidentReporterComment): Promise<ResidentReporterComment> {
    const [newComment] = await db.insert(residentReporterComments).values(comment).returning();

    await db.update(residentReporters)
      .set({ commentCount: sql`${residentReporters.commentCount} + 1` })
      .where(eq(residentReporters.id, comment.articleId));

    return newComment;
  }

  async deleteReporterArticleComment(commentId: string): Promise<void> {
    const [comment] = await db.delete(residentReporterComments).where(eq(residentReporterComments.id, commentId)).returning();

    if (comment) {
      await db.update(residentReporters)
        .set({ commentCount: sql`${residentReporters.commentCount} - 1` })
        .where(eq(residentReporters.id, comment.articleId));
    }
  }

  // Housing Recruitments
  async getHousingRecruitments(): Promise<HousingRecruitment[]> {
    return db.select().from(housingRecruitments).orderBy(desc(housingRecruitments.createdAt));
  }

  async getHousingRecruitment(id: string): Promise<HousingRecruitment | undefined> {
    const result = await db.select().from(housingRecruitments).where(eq(housingRecruitments.id, id));
    return result[0];
  }

  async getPublishedHousingRecruitments(): Promise<HousingRecruitment[]> {
    return db.select().from(housingRecruitments)
      .where(eq(housingRecruitments.published, true))
      .orderBy(desc(housingRecruitments.createdAt));
  }

  async createHousingRecruitment(recruitment: InsertHousingRecruitment): Promise<HousingRecruitment> {
    const result = await db.insert(housingRecruitments).values(recruitment).returning();
    return result[0];
  }

  async updateHousingRecruitment(id: string, recruitment: Partial<InsertHousingRecruitment>): Promise<HousingRecruitment | undefined> {
    const result = await db.update(housingRecruitments).set(recruitment).where(eq(housingRecruitments.id, id)).returning();
    return result[0];
  }

  async deleteHousingRecruitment(id: string): Promise<void> {
    await db.delete(housingRecruitments).where(eq(housingRecruitments.id, id));
  }
}

export const storage = new DatabaseStorage();
