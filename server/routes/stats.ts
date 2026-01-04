import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerStatsRoutes(app: Express) {
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
}
