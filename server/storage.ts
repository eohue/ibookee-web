// Imports kept for IStorage interface definition
import {
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
  type HousingRecruitment,
  type InsertHousingRecruitment,
} from "@shared/schema";
import { ProjectRepository } from "./repositories/projectRepository";
import { ArticleRepository } from "./repositories/articleRepository";

export interface IStorage {
  // Projects
  getProjects(page?: number, limit?: number, titles?: string[]): Promise<{ projects: Project[], total: number }>;
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
  getArticles(page?: number, limit?: number): Promise<{ articles: Omit<Article, "content">[], total: number }>;
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByCategory(category: string, page?: number, limit?: number): Promise<{ articles: Omit<Article, "content">[], total: number }>;
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
  getReporterArticles(status?: string, page?: number, limit?: number): Promise<{ articles: Omit<ResidentReporter, "content">[], total: number }>;
  getReporterArticle(id: string): Promise<ResidentReporter | undefined>;
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

import { UserRepository } from "./repositories/userRepository";

import { CommunityRepository } from "./repositories/communityRepository";

import { InquiryRepository } from "./repositories/inquiryRepository";
import { EventRepository } from "./repositories/eventRepository";
import { ProgramRepository } from "./repositories/programRepository";

import { StatsRepository } from "./repositories/statsRepository";
import { SiteRepository } from "./repositories/siteRepository";
import { HousingRepository } from "./repositories/housingRepository";
import { ReporterRepository } from "./repositories/reporterRepository";

export class DatabaseStorage implements IStorage {
  private projectRepo = new ProjectRepository();
  private articleRepo = new ArticleRepository();
  private userRepo = new UserRepository();
  private communityRepo = new CommunityRepository();
  private inquiryRepo = new InquiryRepository();
  private eventRepo = new EventRepository();
  private programRepo = new ProgramRepository();
  private statsRepo = new StatsRepository();
  private siteRepo = new SiteRepository();
  private housingRepo = new HousingRepository();
  private reporterRepo = new ReporterRepository();

  // Projects
  async getProjects(page: number = 1, limit: number = 100, titles?: string[]): Promise<{ projects: Project[], total: number }> {
    return this.projectRepo.getProjects(page, limit, titles);
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projectRepo.getProject(id);
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return this.projectRepo.getProjectsByCategory(category);
  }

  async createProject(project: InsertProject): Promise<Project> {
    return this.projectRepo.createProject(project);
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    return this.projectRepo.updateProject(id, project);
  }

  async deleteProject(id: string): Promise<void> {
    return this.projectRepo.deleteProject(id);
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    return this.inquiryRepo.getInquiries();
  }

  async getInquiriesByType(type: string): Promise<Inquiry[]> {
    return this.inquiryRepo.getInquiriesByType(type);
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    return this.inquiryRepo.createInquiry(inquiry);
  }

  async deleteInquiry(id: string): Promise<void> {
    return this.inquiryRepo.deleteInquiry(id);
  }

  // Articles
  async getArticles(page: number = 1, limit: number = 100): Promise<{ articles: Omit<Article, "content">[], total: number }> {
    return this.articleRepo.getArticles(page, limit);
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articleRepo.getArticle(id);
  }

  async getArticlesByCategory(category: string, page: number = 1, limit: number = 100): Promise<{ articles: Omit<Article, "content">[], total: number }> {
    return this.articleRepo.getArticlesByCategory(category, page, limit);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    return this.articleRepo.createArticle(article);
  }

  async updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined> {
    return this.articleRepo.updateArticle(id, article);
  }

  async deleteArticle(id: string): Promise<void> {
    return this.articleRepo.deleteArticle(id);
  }

  // Stats Optimization
  async getStatsCounts() {
    return this.statsRepo.getStatsCounts();
  }

  // Social Accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    return this.siteRepo.getSocialAccounts();
  }

  async getSocialAccount(id: string): Promise<SocialAccount | undefined> {
    return this.siteRepo.getSocialAccount(id);
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    return this.siteRepo.createSocialAccount(account);
  }

  async updateSocialAccount(id: string, account: Partial<InsertSocialAccount>): Promise<SocialAccount | undefined> {
    return this.siteRepo.updateSocialAccount(id, account);
  }

  async deleteSocialAccount(id: string): Promise<void> {
    return this.siteRepo.deleteSocialAccount(id);
  }

  // Community Posts
  async getCommunityPosts(page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    return this.communityRepo.getCommunityPosts(page, limit);
  }

  async getCommunityPost(id: string): Promise<CommunityPost | undefined> {
    return this.communityRepo.getCommunityPost(id);
  }

  async getCommunityPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<{ posts: CommunityPost[], total: number }> {
    return this.communityRepo.getCommunityPostsByHashtag(hashtag, page, limit);
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    return this.communityRepo.createCommunityPost(post);
  }

  async updateCommunityPost(id: string, post: Partial<InsertCommunityPost>): Promise<CommunityPost | undefined> {
    return this.communityRepo.updateCommunityPost(id, post);
  }

  async deleteCommunityPost(id: string): Promise<void> {
    return this.communityRepo.deleteCommunityPost(id);
  }

  async getCommunityPostComments(postId: string): Promise<CommunityPostComment[]> {
    return this.communityRepo.getCommunityPostComments(postId);
  }

  async createCommunityPostComment(comment: InsertCommunityPostComment): Promise<CommunityPostComment> {
    return this.communityRepo.createCommunityPostComment(comment);
  }

  async deleteCommunityPostComment(id: string): Promise<void> {
    return this.communityRepo.deleteCommunityPostComment(id);
  }

  async likeCommunityPost(id: string): Promise<void> {
    return this.communityRepo.likeCommunityPost(id);
  }

  async getUnifiedCommunityFeed(limit: number): Promise<CommunityFeedItem[]> {
    return this.communityRepo.getUnifiedCommunityFeed(limit);
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return this.eventRepo.getEvents();
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.eventRepo.getEvent(id);
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    return this.eventRepo.createEvent(event);
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined> {
    return this.eventRepo.updateEvent(id, event);
  }

  async deleteEvent(id: string): Promise<void> {
    return this.eventRepo.deleteEvent(id);
  }

  // Editable Pages
  async getEditablePages(): Promise<EditablePage[]> {
    return this.siteRepo.getEditablePages();
  }

  async getEditablePage(slug: string): Promise<EditablePage | undefined> {
    return this.siteRepo.getEditablePage(slug);
  }

  async upsertEditablePage(page: InsertEditablePage): Promise<EditablePage> {
    return this.siteRepo.upsertEditablePage(page);
  }

  // Resident Programs
  async getResidentPrograms(): Promise<ResidentProgram[]> {
    return this.programRepo.getResidentPrograms();
  }

  async getResidentProgram(id: string): Promise<ResidentProgram | undefined> {
    return this.programRepo.getResidentProgram(id);
  }

  async getResidentProgramsByType(type: string): Promise<ResidentProgram[]> {
    return this.programRepo.getResidentProgramsByType(type);
  }

  async createResidentProgram(program: InsertResidentProgram): Promise<ResidentProgram> {
    return this.programRepo.createResidentProgram(program);
  }

  async updateResidentProgram(id: string, program: Partial<InsertResidentProgram>): Promise<ResidentProgram | undefined> {
    return this.programRepo.updateResidentProgram(id, program);
  }

  async deleteResidentProgram(id: string): Promise<void> {
    return this.programRepo.deleteResidentProgram(id);
  }

  // Program Applications
  async getProgramApplications(): Promise<ProgramApplication[]> {
    return this.programRepo.getProgramApplications();
  }

  async getProgramApplicationsByProgram(programId: string): Promise<ProgramApplication[]> {
    return this.programRepo.getProgramApplicationsByProgram(programId);
  }

  async getProgramApplicationsByUser(userId: string): Promise<ProgramApplication[]> {
    return this.programRepo.getProgramApplicationsByUser(userId);
  }

  async createProgramApplication(application: InsertProgramApplication): Promise<ProgramApplication> {
    return this.programRepo.createProgramApplication(application);
  }

  async updateProgramApplicationStatus(id: string, status: string): Promise<ProgramApplication | undefined> {
    return this.programRepo.updateProgramApplicationStatus(id, status);
  }

  async deleteProgramApplication(id: string): Promise<void> {
    return this.programRepo.deleteProgramApplication(id);
  }

  // Project Images
  async getProjectImages(projectId: string): Promise<ProjectImage[]> {
    return this.projectRepo.getProjectImages(projectId);
  }

  async createProjectImage(image: InsertProjectImage): Promise<ProjectImage> {
    return this.projectRepo.createProjectImage(image);
  }

  async deleteProjectImage(id: string): Promise<void> {
    return this.projectRepo.deleteProjectImage(id);
  }

  // Subprojects
  async getSubprojects(parentProjectId: string): Promise<Subproject[]> {
    return this.projectRepo.getSubprojects(parentProjectId);
  }

  async getSubproject(id: string): Promise<Subproject | undefined> {
    return this.projectRepo.getSubproject(id);
  }

  async createSubproject(subproject: InsertSubproject): Promise<Subproject> {
    return this.projectRepo.createSubproject(subproject);
  }

  async updateSubproject(id: string, subproject: Partial<InsertSubproject>): Promise<Subproject | undefined> {
    return this.projectRepo.updateSubproject(id, subproject);
  }

  async deleteSubproject(id: string): Promise<void> {
    return this.projectRepo.deleteSubproject(id);
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return this.siteRepo.getPartners();
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    return this.siteRepo.createPartner(partner);
  }

  async updatePartner(id: string, partner: Partial<InsertPartner>): Promise<Partner | undefined> {
    return this.siteRepo.updatePartner(id, partner);
  }

  async deletePartner(id: string): Promise<void> {
    return this.siteRepo.deletePartner(id);
  }

  // History Milestones
  async getHistoryMilestones(): Promise<HistoryMilestone[]> {
    return this.siteRepo.getHistoryMilestones();
  }

  async createHistoryMilestone(milestone: InsertHistoryMilestone): Promise<HistoryMilestone> {
    return this.siteRepo.createHistoryMilestone(milestone);
  }

  async updateHistoryMilestone(id: string, milestone: Partial<InsertHistoryMilestone>): Promise<HistoryMilestone | undefined> {
    return this.siteRepo.updateHistoryMilestone(id, milestone);
  }

  async deleteHistoryMilestone(id: string): Promise<void> {
    return this.siteRepo.deleteHistoryMilestone(id);
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSetting[]> {
    return this.siteRepo.getSiteSettings();
  }

  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    return this.siteRepo.getSiteSetting(key);
  }

  async upsertSiteSetting(setting: InsertSiteSetting): Promise<SiteSetting> {
    return this.siteRepo.upsertSiteSetting(setting);
  }

  async deleteSiteSetting(key: string): Promise<void> {
    return this.siteRepo.deleteSiteSetting(key);
  }

  // Page Images
  async getPageImages(): Promise<PageImage[]> {
    return this.siteRepo.getPageImages();
  }

  async getPageImagesByPage(pageKey: string): Promise<PageImage[]> {
    return this.siteRepo.getPageImagesByPage(pageKey);
  }

  async getPageImage(pageKey: string, imageKey: string): Promise<PageImage | undefined> {
    return this.siteRepo.getPageImage(pageKey, imageKey);
  }

  async upsertPageImage(image: InsertPageImage): Promise<PageImage> {
    return this.siteRepo.upsertPageImage(image);
  }

  async replacePageImages(pageKey: string, imageKey: string, images: InsertPageImage[]): Promise<PageImage[]> {
    return this.siteRepo.replacePageImages(pageKey, imageKey, images);
  }

  async deletePageImage(id: string): Promise<void> {
    return this.siteRepo.deletePageImage(id);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.userRepo.getUser(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.userRepo.getUserByEmail(email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return this.userRepo.getUserByGoogleId(googleId);
  }

  async getUserByNaverId(naverId: string): Promise<User | undefined> {
    return this.userRepo.getUserByNaverId(naverId);
  }

  async getUserByKakaoId(kakaoId: string): Promise<User | undefined> {
    return this.userRepo.getUserByKakaoId(kakaoId);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return this.userRepo.upsertUser(userData);
  }

  async getUsers(): Promise<User[]> {
    return this.userRepo.getUsers();
  }

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    return this.userRepo.updateUserRole(id, role);
  }

  async verifyUserRealName(id: string, realName: string, phoneNumber: string): Promise<User | undefined> {
    return this.userRepo.verifyUserRealName(id, realName, phoneNumber);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepo.deleteUser(id);
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<User | undefined> {
    return this.userRepo.updateUserPassword(id, hashedPassword);
  }

  async updateUserProfile(id: string, data: { realName?: string; nickname?: string }): Promise<User | undefined> {
    return this.userRepo.updateUserProfile(id, data);
  }

  async updateUserProfileImage(userId: string, profileImageUrl: string): Promise<User | undefined> {
    return this.userRepo.updateUserProfileImage(userId, profileImageUrl);
  }

  // Resident Reporter
  // Resident Reporter
  async createReporterArticle(userId: string, data: InsertResidentReporter): Promise<ResidentReporter> {
    return this.reporterRepo.createReporterArticle(userId, data);
  }

  async getReporterArticles(status?: string, page: number = 1, limit: number = 20): Promise<{ articles: Omit<ResidentReporter, "content">[], total: number }> {
    return this.reporterRepo.getReporterArticles(status, page, limit);
  }

  async getReporterArticlesByUser(userId: string): Promise<ResidentReporter[]> {
    return this.reporterRepo.getReporterArticlesByUser(userId);
  }

  async getReporterArticle(id: string): Promise<ResidentReporter | undefined> {
    return this.reporterRepo.getReporterArticle(id);
  }

  async updateReporterArticle(id: string, userId: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
    return this.reporterRepo.updateReporterArticle(id, userId, data);
  }

  async updateReporterArticleStatus(id: string, status: string): Promise<ResidentReporter | undefined> {
    return this.reporterRepo.updateReporterArticleStatus(id, status);
  }

  async adminUpdateReporterArticle(id: string, data: Partial<InsertResidentReporter>): Promise<ResidentReporter | undefined> {
    return this.reporterRepo.adminUpdateReporterArticle(id, data);
  }

  async deleteReporterArticle(id: string): Promise<boolean> {
    return this.reporterRepo.deleteReporterArticle(id);
  }

  async likeReporterArticle(id: string): Promise<void> {
    return this.reporterRepo.likeReporterArticle(id);
  }

  // Stats
  async getReporterArticleComments(articleId: string): Promise<ResidentReporterComment[]> {
    return this.reporterRepo.getReporterArticleComments(articleId);
  }

  async createReporterArticleComment(comment: InsertResidentReporterComment): Promise<ResidentReporterComment> {
    return this.reporterRepo.createReporterArticleComment(comment);
  }

  async deleteReporterArticleComment(commentId: string): Promise<void> {
    return this.reporterRepo.deleteReporterArticleComment(commentId);
  }

  // Housing Recruitments
  async getHousingRecruitments(): Promise<HousingRecruitment[]> {
    return this.housingRepo.getHousingRecruitments();
  }

  async getHousingRecruitment(id: string): Promise<HousingRecruitment | undefined> {
    return this.housingRepo.getHousingRecruitment(id);
  }

  async getPublishedHousingRecruitments(): Promise<HousingRecruitment[]> {
    return this.housingRepo.getPublishedHousingRecruitments();
  }

  async createHousingRecruitment(recruitment: InsertHousingRecruitment): Promise<HousingRecruitment> {
    return this.housingRepo.createHousingRecruitment(recruitment);
  }

  async updateHousingRecruitment(id: string, recruitment: Partial<InsertHousingRecruitment>): Promise<HousingRecruitment | undefined> {
    return this.housingRepo.updateHousingRecruitment(id, recruitment);
  }

  async deleteHousingRecruitment(id: string): Promise<void> {
    return this.housingRepo.deleteHousingRecruitment(id);
  }
}

export const storage = new DatabaseStorage();
