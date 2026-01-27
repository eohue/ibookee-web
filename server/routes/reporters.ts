import type { Express } from "express";
import { storage } from "../storage";
import { insertResidentReporterSchema, insertResidentReporterCommentSchema } from "@shared/schema";
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

    // Like an article
    app.post("/api/resident-reporter/:id/like", isAuthenticated, async (req, res) => {
        try {
            await storage.likeReporterArticle(req.params.id);
            res.status(200).json({ message: "Liked" });
        } catch (error) {
            console.error("Failed to like article:", error);
            res.status(500).json({ error: "Failed to like article" });
        }
    });

    // Get comments for an article
    app.get("/api/resident-reporter/:id/comments", async (req, res) => {
        try {
            const comments = await storage.getReporterArticleComments(req.params.id);
            res.json(comments);
        } catch (error) {
            console.error("Failed to fetch comments:", error);
            res.status(500).json({ error: "Failed to fetch comments" });
        }
    });

    // Post a comment
    app.post("/api/resident-reporter/:id/comments", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertResidentReporterCommentSchema.safeParse({
                ...req.body,
                articleId: req.params.id,
                userId: (req.user as any).id,
                nickname: (req.user as any).nickname || (req.user as any).realName || (req.user as any).firstName || "Anonymous"
            });

            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid comment data", details: parsed.error });
            }

            const comment = await storage.createReporterArticleComment(parsed.data);
            res.status(201).json(comment);
        } catch (error) {
            console.error("Failed to create comment:", error);
            res.status(500).json({ error: "Failed to create comment" });
        }
    });

    // Delete a comment
    app.delete("/api/resident-reporter/:articleId/comments/:commentId", isAuthenticated, async (req, res) => {
        try {
            // Basic permission check: only admin can delete. 
            // Ideally author check too, but consistent with community posts for now.
            if ((req.user as any).role !== "admin") {
                return res.status(403).json({ error: "Unauthorized" });
            }

            await storage.deleteReporterArticleComment(req.params.commentId);
            res.status(204).send();
        } catch (error) {
            console.error("Failed to delete comment:", error);
            res.status(500).json({ error: "Failed to delete comment" });
        }
    });

    // Get single article (public)
    app.get("/api/resident-reporter/:id", async (req, res) => {
        try {
            const article = await storage.getReporterArticle(req.params.id);
            if (!article) {
                return res.status(404).json({ error: "Article not found" });
            }
            res.json(article);
        } catch (error) {
            console.error("Failed to fetch reporter article:", error);
            res.status(500).json({ error: "Failed to fetch article" });
        }
    });

    // Get public approved articles (optionally include user's own pending articles)
    app.get("/api/resident-reporter", async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await storage.getReporterArticles("approved", page, limit);
            res.json(result);
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
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const status = req.query.status as string | undefined;

            const result = await storage.getReporterArticles(status, page, limit);
            res.json(result);
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

    // Admin: Update article (edit content)
    app.put("/api/admin/resident-reporter/:id", isAuthenticated, async (req, res) => {
        if ((req.user as any).role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        try {
            const { title, content, authorName, imageUrl } = req.body;
            const article = await storage.adminUpdateReporterArticle(req.params.id, {
                title,
                content,
                authorName,
                imageUrl,
            });
            if (!article) {
                return res.status(404).json({ error: "Article not found" });
            }
            res.json(article);
        } catch (error) {
            console.error("Failed to update article:", error);
            res.status(500).json({ error: "Failed to update article" });
        }
    });

    // Admin: Delete article
    app.delete("/api/admin/resident-reporter/:id", isAuthenticated, async (req, res) => {
        if ((req.user as any).role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }
        try {
            const success = await storage.deleteReporterArticle(req.params.id);
            if (!success) {
                return res.status(404).json({ error: "Article not found" });
            }
            res.json({ success: true });
        } catch (error) {
            console.error("Failed to delete article:", error);
            res.status(500).json({ error: "Failed to delete article" });
        }
    });
}
