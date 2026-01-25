import type { Express } from "express";
import { storage } from "../storage";
import { insertHousingRecruitmentSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerRecruitmentRoutes(app: Express) {
    // Public API - Get published recruitments
    app.get("/api/recruitments", async (req, res) => {
        try {
            const recruitments = await storage.getPublishedHousingRecruitments();
            res.json(recruitments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitments" });
        }
    });

    // Admin API - Get all recruitments
    app.get("/api/admin/recruitments", isAuthenticated, async (req, res) => {
        try {
            const recruitments = await storage.getHousingRecruitments();
            res.json(recruitments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitments" });
        }
    });

    // Admin API - Get single recruitment
    app.get("/api/admin/recruitments/:id", isAuthenticated, async (req, res) => {
        try {
            const recruitment = await storage.getHousingRecruitment(req.params.id);
            if (!recruitment) {
                return res.status(404).json({ error: "Recruitment not found" });
            }
            res.json(recruitment);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitment" });
        }
    });

    // Admin API - Create recruitment
    app.post("/api/admin/recruitments", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertHousingRecruitmentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid recruitment data", details: parsed.error });
            }
            const recruitment = await storage.createHousingRecruitment(parsed.data);
            res.status(201).json(recruitment);
        } catch (error) {
            res.status(500).json({ error: "Failed to create recruitment" });
        }
    });

    // Admin API - Update recruitment
    app.put("/api/admin/recruitments/:id", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertHousingRecruitmentSchema.partial().safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid recruitment data", details: parsed.error });
            }
            const recruitment = await storage.updateHousingRecruitment(req.params.id, parsed.data);
            if (!recruitment) {
                return res.status(404).json({ error: "Recruitment not found" });
            }
            res.json(recruitment);
        } catch (error) {
            res.status(500).json({ error: "Failed to update recruitment" });
        }
    });

    // Admin API - Delete recruitment
    app.delete("/api/admin/recruitments/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteHousingRecruitment(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete recruitment" });
        }
    });
}
