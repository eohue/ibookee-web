import type { Express } from "express";
import { storage } from "../storage";
import { insertArticleSchema } from "@shared/schema";
import { sanitizeObject } from "@shared/utils";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerArticleRoutes(app: Express) {
    // Public Articles API
    app.get("/api/articles", async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 999; // Default high limit for backward compatibility

            const result = await storage.getArticles(page, limit);

            // Add caching to reduce DB load
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            res.json(result);
        } catch (error: any) {
            console.error("Fetch articles error:", error);
            res.status(500).json({
                error: "Failed to fetch articles",
                details: error.message,
                code: error.code // PostgreSQL error code
            });
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
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            res.json(articles);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    });

    // Admin Articles CRUD
    app.get("/api/admin/articles", isAuthenticated, async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 100;

            const result = await storage.getArticles(page, limit);
            // Admin dashboard might expect array, but it should handle object. 
            // If strictly array needed by frontend: res.json(result.articles);
            // Let's return full result for future pagination Support in Admin.
            res.json(result.articles);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch articles" });
        }
    });

    app.post("/api/admin/articles", isAuthenticated, async (req, res) => {
        try {
            // Sanitize all string fields to remove null bytes (0x00)
            const data = sanitizeObject({ ...req.body });

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
            console.log(`[API] Updating article ${req.params.id}. Body keys: ${Object.keys(req.body).join(', ')}`);
            if (req.body.imageUrl) console.log(`[API] Image URL provided: ${req.body.imageUrl}`);

            // Sanitize all string fields to remove null bytes (0x00)
            const data = sanitizeObject({ ...req.body });

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
