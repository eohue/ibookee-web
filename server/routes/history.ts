import type { Express } from "express";
import { storage } from "../storage";
import { insertHistoryMilestoneSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerHistoryRoutes(app: Express) {
    // Public History API
    app.get("/api/history", async (_req, res) => {
        try {
            const milestones = await storage.getHistoryMilestones();
            res.json(milestones);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch history" });
        }
    });

    // Admin History Milestones CRUD
    app.get("/api/admin/history", isAuthenticated, async (_req, res) => {
        try {
            const milestones = await storage.getHistoryMilestones();
            res.json(milestones);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch history milestones" });
        }
    });

    app.post("/api/admin/history", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertHistoryMilestoneSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid milestone data", details: parsed.error });
            }
            const milestone = await storage.createHistoryMilestone(parsed.data);
            res.status(201).json(milestone);
        } catch (error) {
            res.status(500).json({ error: "Failed to create milestone" });
        }
    });

    app.put("/api/admin/history/:id", isAuthenticated, async (req, res) => {
        try {
            const milestone = await storage.updateHistoryMilestone(req.params.id, req.body);
            if (!milestone) {
                return res.status(404).json({ error: "Milestone not found" });
            }
            res.json(milestone);
        } catch (error) {
            res.status(500).json({ error: "Failed to update milestone" });
        }
    });

    app.delete("/api/admin/history/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteHistoryMilestone(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete milestone" });
        }
    });
}
