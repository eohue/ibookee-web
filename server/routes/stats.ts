import type { Express } from "express";
import { storage } from "../storage";
import { isAdmin } from "../replit_integrations/auth";

export function registerStatsRoutes(app: Express) {
    app.get("/api/admin/stats", isAdmin, async (_req, res) => {
        try {
            const stats = await storage.getStatsCounts();
            res.json(stats);
        } catch (error: any) {
            console.error("Stats fetch error:", error);
            res.status(500).json({
                error: "Failed to fetch stats",
                details: error.message,
                code: error.code
            });
        }
    });
}
