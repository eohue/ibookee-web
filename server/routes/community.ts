import type { Express } from "express";
import { storage } from "../storage";
import { insertCommunityPostSchema, insertCommunityPostCommentSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerCommunityRoutes(app: Express) {
    // Unified Community Feed
    app.get("/api/community-feed", async (req, res) => {
        try {
            const limit = parseInt(req.query.limit as string) || 20;
            const feed = await storage.getUnifiedCommunityFeed(limit);
            res.json(feed);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch community feed" });
        }
    });

    // Public Community Posts API
    app.get("/api/community-posts", async (req, res) => {
        try {
            const { hashtag } = req.query;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            let result;
            if (hashtag && typeof hashtag === 'string') {
                result = await storage.getCommunityPostsByHashtag(hashtag, page, limit);
            } else {
                result = await storage.getCommunityPosts(page, limit);
            }
            res.json(result);
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
    // Community Post Comments
    app.get("/api/community-posts/:id/comments", async (req, res) => {
        try {
            const comments = await storage.getCommunityPostComments(req.params.id);
            res.json(comments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch community post comments" });
        }
    });

    app.post("/api/community-posts/:id/comments", async (req, res) => {
        try {
            const parsed = insertCommunityPostCommentSchema.safeParse({ ...req.body, postId: req.params.id });
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid comment data", details: parsed.error });
            }
            const comment = await storage.createCommunityPostComment(parsed.data);
            res.status(201).json(comment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create community post comment" });
        }
    });

    app.delete("/api/community-posts/:postId/comments/:commentId", isAuthenticated, async (req, res) => {
        try {
            // Check if user is admin or author (implement author check if needed provided by schema)
            // For now, only admin or maybe author? User request said "Admin rights... delete comments".
            // So we check req.user.role === 'admin'
            /*
             User type definition might need verification. 
             Assuming req.user is populated by isAuthenticated and has role.
            */
            if ((req.user as any).role !== "admin") {
                return res.status(403).json({ error: "Unauthorized" });
            }

            await storage.deleteCommunityPostComment(req.params.commentId);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete comment" });
        }
    });

    app.post("/api/community-posts/:id/like", async (req, res) => {
        try {
            await storage.likeCommunityPost(req.params.id);
            res.status(200).json({ message: "Liked" });
        } catch (error) {
            res.status(500).json({ error: "Failed to like community post" });
        }
    });

    // Admin Community Posts CRUD
    app.get("/api/admin/community-posts", isAuthenticated, async (_req, res) => {
        try {
            const { posts } = await storage.getCommunityPosts(1, 1000); // Admin gets all (capped at 1000)
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
