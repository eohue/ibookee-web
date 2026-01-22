import type { Express } from "express";
import { storage } from "../storage";
import { insertProjectSchema, insertSubprojectSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerProjectRoutes(app: Express) {
  // Public Projects API
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
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

  // Public subprojects API
  app.get("/api/projects/:id/subprojects", async (req, res) => {
    try {
      const subprojects = await storage.getSubprojects(req.params.id);
      res.json(subprojects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subprojects" });
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
        console.error("Project creation validation failed:", JSON.stringify(parsed.error, null, 2));
        console.error("Received payload:", req.body);
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
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

  // Admin Subprojects CRUD
  app.get("/api/admin/projects/:id/subprojects", isAuthenticated, async (req, res) => {
    try {
      const subprojects = await storage.getSubprojects(req.params.id);
      res.json(subprojects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subprojects" });
    }
  });

  app.post("/api/admin/projects/:id/subprojects", isAuthenticated, async (req, res) => {
    try {
      const data = { ...req.body, parentProjectId: req.params.id };
      const parsed = insertSubprojectSchema.safeParse(data);
      if (!parsed.success) {
        console.error("Subproject creation validation failed:", JSON.stringify(parsed.error, null, 2));
        return res.status(400).json({ error: "Invalid subproject data", details: parsed.error });
      }
      const subproject = await storage.createSubproject(parsed.data);
      res.status(201).json(subproject);
    } catch (error) {
      console.error("Subproject creation error:", error);
      res.status(500).json({ error: "Failed to create subproject" });
    }
  });

  app.put("/api/admin/subprojects/:id", isAuthenticated, async (req, res) => {
    try {
      const subproject = await storage.updateSubproject(req.params.id, req.body);
      if (!subproject) {
        return res.status(404).json({ error: "Subproject not found" });
      }
      res.json(subproject);
    } catch (error) {
      res.status(500).json({ error: "Failed to update subproject" });
    }
  });

  app.delete("/api/admin/subprojects/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteSubproject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete subproject" });
    }
  });
}
