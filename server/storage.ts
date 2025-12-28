import { randomUUID } from "crypto";
import type {
  Project,
  InsertProject,
  Inquiry,
  InsertInquiry,
  Article,
  InsertArticle,
  CommunityPost,
  InsertCommunityPost,
  Event,
  InsertEvent,
} from "@shared/schema";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByCategory(category: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;

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

  // Community Posts
  getCommunityPosts(): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private inquiries: Map<string, Inquiry>;
  private articles: Map<string, Article>;
  private communityPosts: Map<string, CommunityPost>;
  private events: Map<string, Event>;

  constructor() {
    this.projects = new Map();
    this.inquiries = new Map();
    this.articles = new Map();
    this.communityPosts = new Map();
    this.events = new Map();

    this.seedData();
  }

  private seedData() {
    const sampleProjects: InsertProject[] = [
      {
        title: "안암생활",
        titleEn: "Anam Life",
        location: "서울 성북구",
        category: "youth",
        description: "청년 특화 주거 공간으로, 코워킹 스페이스와 창업 지원 프로그램을 갖춘 대규모 커뮤니티",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
        year: 2022,
        units: 86,
        featured: true,
      },
      {
        title: "홍시주택",
        titleEn: "Hongsi House",
        location: "서울 마포구",
        category: "single",
        description: "1인 여성 가구를 위한 안전하고 편리한 주거 공간",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        year: 2021,
        units: 45,
        featured: true,
      },
      {
        title: "장안생활",
        titleEn: "Jangan Life",
        location: "서울 동대문구",
        category: "local-anchor",
        description: "도시재생형 복합 주거 시설로, 지역 상권과 연계된 커뮤니티 앵커 역할",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        year: 2023,
        units: 120,
        featured: true,
      },
    ];

    sampleProjects.forEach((project) => {
      const id = randomUUID();
      this.projects.set(id, {
        id,
        title: project.title,
        titleEn: project.titleEn ?? null,
        location: project.location,
        category: project.category,
        description: project.description,
        imageUrl: project.imageUrl,
        year: project.year,
        units: project.units ?? null,
        featured: project.featured ?? null,
      });
    });

    const sampleArticles: InsertArticle[] = [
      {
        title: "사회주택, 왜 지금 한국에 필요한가",
        excerpt: "오스트리아 빈의 사회주택 모델과 한국적 적용 방안에 대한 고찰",
        content: "사회주택의 필요성과 한국적 적용...",
        author: "김아이 대표",
        category: "column",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        featured: true,
      },
      {
        title: "청년 주거 문제, 커뮤니티가 답이다",
        excerpt: "혼자가 아닌 함께의 가치",
        content: "커뮤니티 주거의 가능성...",
        author: "박운영 팀장",
        category: "column",
        imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
        featured: true,
      },
    ];

    sampleArticles.forEach((article) => {
      const id = randomUUID();
      this.articles.set(id, {
        id,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        author: article.author,
        category: article.category,
        imageUrl: article.imageUrl ?? null,
        featured: article.featured ?? null,
        publishedAt: new Date(),
      });
    });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByCategory(category: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.category === category
    );
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = {
      id,
      title: insertProject.title,
      titleEn: insertProject.titleEn ?? null,
      location: insertProject.location,
      category: insertProject.category,
      description: insertProject.description,
      imageUrl: insertProject.imageUrl,
      year: insertProject.year,
      units: insertProject.units ?? null,
      featured: insertProject.featured ?? null,
    };
    this.projects.set(id, project);
    return project;
  }

  // Inquiries
  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }

  async getInquiriesByType(type: string): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values()).filter(
      (inquiry) => inquiry.type === type
    );
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = {
      id,
      type: insertInquiry.type,
      name: insertInquiry.name,
      email: insertInquiry.email,
      phone: insertInquiry.phone ?? null,
      company: insertInquiry.company ?? null,
      message: insertInquiry.message,
      createdAt: new Date(),
    };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    this.inquiries.delete(id);
  }

  // Articles
  async getArticles(): Promise<Article[]> {
    return Array.from(this.articles.values());
  }

  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticlesByCategory(category: string): Promise<Article[]> {
    return Array.from(this.articles.values()).filter(
      (article) => article.category === category
    );
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const article: Article = {
      id,
      title: insertArticle.title,
      excerpt: insertArticle.excerpt,
      content: insertArticle.content,
      author: insertArticle.author,
      category: insertArticle.category,
      imageUrl: insertArticle.imageUrl ?? null,
      featured: insertArticle.featured ?? null,
      publishedAt: new Date(),
    };
    this.articles.set(id, article);
    return article;
  }

  // Community Posts
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values());
  }

  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = randomUUID();
    const post: CommunityPost = {
      id,
      imageUrl: insertPost.imageUrl,
      caption: insertPost.caption ?? null,
      location: insertPost.location ?? null,
      likes: insertPost.likes ?? null,
      hashtags: insertPost.hashtags ?? null,
      createdAt: new Date(),
    };
    this.communityPosts.set(id, post);
    return post;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const event: Event = {
      id,
      title: insertEvent.title,
      description: insertEvent.description,
      date: insertEvent.date,
      location: insertEvent.location,
      imageUrl: insertEvent.imageUrl ?? null,
    };
    this.events.set(id, event);
    return event;
  }
}

export const storage = new MemStorage();
