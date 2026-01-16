import type { Express } from "express";
import { storage } from "../storage";
import { insertResidentReporterSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerReporterRoutes(app: Express) {
    // Submit a new article (Resident only, but checks auth)
    app.post("/api/resident-reporter", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertResidentReporterSchema.omit({ userId: true, status: true }).safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid article data", details: parsed.error });
            }

            const article = await storage.createReporterArticle((req.user as any).id, { ...parsed.data, userId: (req.user as any).id });
            res.status(201).json(article);
        } catch (error) {
            console.error("Failed to create reporter article:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            res.status(500).json({ error: "Failed to create article", details: errorMessage });
        }
    });

    // Get user's own articles (all statuses)
    app.get("/api/my/reporter-articles", isAuthenticated, async (req, res) => {
        try {
            const articles = await storage.getReporterArticlesByUser((req.user as any).id);
            res.json(articles);
        } catch (error) {
            console.error("Failed to fetch user's reporter articles:", error);
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    });

    // Update user's own article (only if pending)
    app.put("/api/resident-reporter/:id", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertResidentReporterSchema.omit({ userId: true, status: true }).partial().safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid article data", details: parsed.error });
            }

            const article = await storage.updateReporterArticle(req.params.id, (req.user as any).id, parsed.data);
            if (!article) {
                return res.status(404).json({ error: "Article not found or not editable" });
            }
            res.json(article);
        } catch (error) {
            console.error("Failed to update reporter article:", error);
            res.status(500).json({ error: "Failed to update article" });
        }
    });

    // Get public approved articles (optionally include user's own pending articles)
    app.get("/api/resident-reporter", async (req, res) => {
        try {
            const articles = await storage.getReporterArticles("approved");
            res.json(articles);
        } catch (error) {
            console.error("Failed to fetch reporter articles:", error);
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    });

    // Admin: Get all articles
    app.get("/api/admin/resident-reporter", isAuthenticated, async (req, res) => {
        if ((req.user as any).role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        try {
            const articles = await storage.getReporterArticles(); // Fetch all
            res.json(articles);
        } catch (error) {
            console.error("Failed to fetch admin reporter articles:", error);
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    });

    // Admin: Update status
    app.patch("/api/admin/resident-reporter/:id/status", isAuthenticated, async (req, res) => {
        if ((req.user as any).role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        try {
            const { status } = req.body;
            if (!["pending", "approved", "rejected"].includes(status)) {
                return res.status(400).json({ error: "Invalid status" });
            }

            const article = await storage.updateReporterArticleStatus(req.params.id, status);
            if (!article) {
                return res.status(404).json({ error: "Article not found" });
            }
            res.json(article);
        } catch (error) {
            console.error("Failed to update article status:", error);
            res.status(500).json({ error: "Failed to update article status" });
        }
    });
}
