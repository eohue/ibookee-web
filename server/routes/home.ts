import type { Express } from "express";
import { storage } from "../storage";

export function registerHomeRoutes(app: Express) {
    app.get("/api/home", async (_req, res) => {
        try {
            // Execute independent queries in parallel
            const [projectsResult, reportersResult, statsSettings] = await Promise.all([
                storage.getProjects(1, 10), // Fetch first 10 projects (frontend filters for featured)
                storage.getReporterArticles("approved", 1, 6), // Only approved articles, limit 6
                storage.getSiteSetting("company-stats"),
            ]);

            res.json({
                projects: projectsResult.projects,
                reporters: reportersResult.articles, // Limit already applied in DB
                stats: statsSettings?.value || null,
            });
        } catch (error) {
            console.error("Home data fetch error:", error);
            res.status(500).json({ error: "Failed to fetch home data" });
        }
    });
}
