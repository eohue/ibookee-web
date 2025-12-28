import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInquirySchema, 
  insertProjectSchema, 
  insertArticleSchema,
  insertEventSchema,
  insertEditablePageSchema,
  insertResidentProgramSchema,
  insertProgramApplicationSchema,
  insertCommunityPostSchema,
  insertPartnerSchema,
} from "@shared/schema";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth BEFORE other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  // Projects API
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.get("/api/projects/category/:category", async (req, res) => {
    try {
      const projects = await storage.getProjectsByCategory(req.params.category);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Articles API
  app.get("/api/articles", async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.get("/api/articles/category/:category", async (req, res) => {
    try {
      const articles = await storage.getArticlesByCategory(req.params.category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // Inquiries API
  app.post("/api/inquiries", async (req, res) => {
    try {
      const parsed = insertInquirySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid inquiry data", details: parsed.error });
      }
      const inquiry = await storage.createInquiry(parsed.data);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });

  app.get("/api/inquiries", async (_req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  // Community Posts API
  app.get("/api/community-posts", async (_req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community posts" });
    }
  });

  // Events API
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Admin API - Protected routes
  app.get("/api/admin/inquiries", isAuthenticated, async (_req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.delete("/api/admin/inquiries/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteInquiry(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inquiry" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, async (_req, res) => {
    try {
      const [projects, inquiries, articles, communityPosts, events, programs] = await Promise.all([
        storage.getProjects(),
        storage.getInquiries(),
        storage.getArticles(),
        storage.getCommunityPosts(),
        storage.getEvents(),
        storage.getResidentPrograms(),
      ]);
      res.json({
        projectCount: projects.length,
        inquiryCount: inquiries.length,
        articleCount: articles.length,
        communityPostCount: communityPosts.length,
        eventCount: events.length,
        programCount: programs.length,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin Projects CRUD
  app.get("/api/admin/projects", isAuthenticated, async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/admin/projects", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Admin Articles CRUD
  app.get("/api/admin/articles", isAuthenticated, async (_req, res) => {
    try {
      const articles = await storage.getArticles();
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.post("/api/admin/articles", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertArticleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid article data", details: parsed.error });
      }
      const article = await storage.createArticle(parsed.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.put("/api/admin/articles/:id", isAuthenticated, async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  app.delete("/api/admin/articles/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  // Admin Events CRUD
  app.get("/api/admin/events", isAuthenticated, async (_req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/admin/events", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid event data", details: parsed.error });
      }
      const event = await storage.createEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/admin/events/:id", isAuthenticated, async (req, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/admin/events/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Admin Editable Pages CRUD
  app.get("/api/admin/pages", isAuthenticated, async (_req, res) => {
    try {
      const pages = await storage.getEditablePages();
      res.json(pages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/admin/pages/:slug", isAuthenticated, async (req, res) => {
    try {
      const page = await storage.getEditablePage(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.put("/api/admin/pages/:slug", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertEditablePageSchema.safeParse({ ...req.body, slug: req.params.slug });
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid page data", details: parsed.error });
      }
      const page = await storage.upsertEditablePage(parsed.data);
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  // Public page endpoint
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const page = await storage.getEditablePage(req.params.slug);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  // Admin Resident Programs CRUD
  app.get("/api/admin/programs", isAuthenticated, async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const programs = type 
        ? await storage.getResidentProgramsByType(type)
        : await storage.getResidentPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  app.post("/api/admin/programs", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertResidentProgramSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid program data", details: parsed.error });
      }
      const program = await storage.createResidentProgram(parsed.data);
      res.status(201).json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to create program" });
    }
  });

  app.put("/api/admin/programs/:id", isAuthenticated, async (req, res) => {
    try {
      const program = await storage.updateResidentProgram(req.params.id, req.body);
      if (!program) {
        return res.status(404).json({ error: "Program not found" });
      }
      res.json(program);
    } catch (error) {
      res.status(500).json({ error: "Failed to update program" });
    }
  });

  app.delete("/api/admin/programs/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteResidentProgram(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete program" });
    }
  });

  // Public programs endpoint
  app.get("/api/programs", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const programs = type 
        ? await storage.getResidentProgramsByType(type)
        : await storage.getResidentPrograms();
      res.json(programs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch programs" });
    }
  });

  // Program Applications
  app.get("/api/admin/applications", isAuthenticated, async (req, res) => {
    try {
      const programId = req.query.programId as string | undefined;
      const applications = programId
        ? await storage.getProgramApplicationsByProgram(programId)
        : await storage.getProgramApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.put("/api/admin/applications/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const application = await storage.updateProgramApplicationStatus(req.params.id, status);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  app.delete("/api/admin/applications/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteProgramApplication(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete application" });
    }
  });

  // Public application submission
  app.post("/api/applications", async (req, res) => {
    try {
      const parsed = insertProgramApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid application data", details: parsed.error });
      }
      const application = await storage.createProgramApplication(parsed.data);
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  // Admin Community Posts CRUD
  app.get("/api/admin/community-posts", isAuthenticated, async (_req, res) => {
    try {
      const posts = await storage.getCommunityPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community posts" });
    }
  });

  app.post("/api/admin/community-posts", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertCommunityPostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid post data", details: parsed.error });
      }
      const post = await storage.createCommunityPost(parsed.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.delete("/api/admin/community-posts/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCommunityPost(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // Admin Partners CRUD
  app.get("/api/admin/partners", isAuthenticated, async (_req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/admin/partners", isAuthenticated, async (req, res) => {
    try {
      const parsed = insertPartnerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid partner data", details: parsed.error });
      }
      const partner = await storage.createPartner(parsed.data);
      res.status(201).json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to create partner" });
    }
  });

  app.put("/api/admin/partners/:id", isAuthenticated, async (req, res) => {
    try {
      const partner = await storage.updatePartner(req.params.id, req.body);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete("/api/admin/partners/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deletePartner(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete partner" });
    }
  });

  // Public partners endpoint
  app.get("/api/partners", async (_req, res) => {
    try {
      const partners = await storage.getPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  return httpServer;
}
