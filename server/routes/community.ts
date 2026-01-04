import type { Express } from "express";
import { storage } from "../storage";
import { insertCommunityPostSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerCommunityRoutes(app: Express) {
    // Public Community Posts API
    app.get("/api/community-posts", async (req, res) => {
        try {
            const { hashtag } = req.query;
            let posts;
            if (hashtag && typeof hashtag === 'string') {
                posts = await storage.getCommunityPostsByHashtag(hashtag);
            } else {
                posts = await storage.getCommunityPosts();
            }
            res.json(posts);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch community posts" });
        }
    });

    app.get("/api/community-posts/:id", async (req, res) => {
        try {
            const post = await storage.getCommunityPost(req.params.id);
            if (!post) {
                return res.status(404).json({ error: "Post not found" });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch community post" });
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
            res.status(500).json({ error: "Failed to create community post" });
        }
    });

    app.put("/api/admin/community-posts/:id", isAuthenticated, async (req, res) => {
        try {
            const post = await storage.updateCommunityPost(req.params.id, req.body);
            if (!post) {
                return res.status(404).json({ error: "Community post not found" });
            }
            res.json(post);
        } catch (error) {
            res.status(500).json({ error: "Failed to update community post" });
        }
    });

    app.delete("/api/admin/community-posts/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteCommunityPost(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete community post" });
        }
    });
}
