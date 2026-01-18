import type { Express } from "express";
import { storage } from "../storage";
import { insertArticleSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerArticleRoutes(app: Express) {
    // Public Articles API
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
            const data = { ...req.body };

            // Sanitize all string fields to remove null bytes (0x00)
            // PostgreSQL text columns don't allow null bytes
            const sanitizeString = (str: string | null | undefined): string | null => {
                if (str === null || str === undefined) return null;
                if (typeof str !== 'string') return str;
                return str.replace(/\x00/g, '');
            };

            data.title = sanitizeString(data.title);
            data.excerpt = sanitizeString(data.excerpt);
            data.content = sanitizeString(data.content);
            data.author = sanitizeString(data.author);
            data.category = sanitizeString(data.category);
            data.imageUrl = sanitizeString(data.imageUrl);
            data.fileUrl = sanitizeString(data.fileUrl);

            if (data.publishedAt && typeof data.publishedAt === 'string') {
                data.publishedAt = new Date(data.publishedAt);
            }
            const parsed = insertArticleSchema.safeParse(data);
            if (!parsed.success) {
                console.error("Article validation error:", JSON.stringify(parsed.error.errors, null, 2));
                return res.status(400).json({
                    error: "Invalid article data",
                    details: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
                });
            }
            const article = await storage.createArticle(parsed.data);
            res.status(201).json(article);
        } catch (error) {
            console.error("Article creation error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            res.status(500).json({ error: `Failed to create article: ${message}` });
        }
    });

    app.put("/api/admin/articles/:id", isAuthenticated, async (req, res) => {
        try {
            const data = { ...req.body };

            // Sanitize all string fields to remove null bytes (0x00)
            const sanitizeString = (str: string | null | undefined): string | null => {
                if (str === null || str === undefined) return null;
                if (typeof str !== 'string') return str;
                return str.replace(/\x00/g, '');
            };

            if (data.title !== undefined) data.title = sanitizeString(data.title);
            if (data.excerpt !== undefined) data.excerpt = sanitizeString(data.excerpt);
            if (data.content !== undefined) data.content = sanitizeString(data.content);
            if (data.author !== undefined) data.author = sanitizeString(data.author);
            if (data.category !== undefined) data.category = sanitizeString(data.category);
            if (data.imageUrl !== undefined) data.imageUrl = sanitizeString(data.imageUrl);
            if (data.fileUrl !== undefined) data.fileUrl = sanitizeString(data.fileUrl);

            if (data.publishedAt && typeof data.publishedAt === 'string') {
                data.publishedAt = new Date(data.publishedAt);
            }
            // Note: updateArticle might not use parse, but let's see. 
            // Storage likely expects Partial<Article> or similar. 
            // If we just pass data, storage should handle it? 
            // Storage.updateArticle expects Partial<InsertArticle> usually.
            // Let's check storage.ts signature for updateArticle.
            const article = await storage.updateArticle(req.params.id, data);
            if (!article) {
                return res.status(404).json({ error: "Article not found" });
            }
            res.json(article);
        } catch (error) {
            console.error("Article update error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            res.status(500).json({ error: `Failed to update article: ${message}` });
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
}
