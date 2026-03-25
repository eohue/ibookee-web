import type { Express } from "express";
import { storage } from "../storage";
import { insertHousingRecruitmentSchema } from "@shared/schema";
import { isAdmin } from "../replit_integrations/auth";

export function registerRecruitmentRoutes(app: Express) {
    // Public API - Get published recruitments
    app.get("/api/recruitments", async (req, res) => {
        try {
            const recruitments = await storage.getPublishedHousingRecruitments();
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            res.json(recruitments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitments" });
        }
    });

    // Public API - Get single recruitment
    app.get("/api/recruitments/:id", async (req, res) => {
        try {
            const recruitment = await storage.getHousingRecruitment(req.params.id);
            if (!recruitment) {
                return res.status(404).json({ error: "Recruitment not found" });
            }
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            res.json(recruitment);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitment" });
        }
    });

    // Admin API - Get all recruitments
    app.get("/api/admin/recruitments", isAdmin, async (req, res) => {
        try {
            const recruitments = await storage.getHousingRecruitments();
            res.json(recruitments);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch recruitments" });
        }
    });

    // Admin API - Get single recruitment
    app.get("/api/admin/recruitments/:id", isAdmin, async (req, res) => {
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
    app.post("/api/admin/recruitments", isAdmin, async (req, res) => {
        try {
            const { title, content, files, published } = req.body;
            if (!title || typeof title !== 'string') {
                return res.status(400).json({ error: "Title is required" });
            }
            const recruitment = await storage.createHousingRecruitment({
                title,
                content: content || null,
                files: files || null,
                published: published ?? true,
            });
            res.status(201).json(recruitment);
        } catch (error) {
            console.error("Failed to create recruitment:", error);
            res.status(500).json({ error: "Failed to create recruitment" });
        }
    });

    // Admin API - Update recruitment
    app.put("/api/admin/recruitments/:id", isAdmin, async (req, res) => {
        try {
            const { title, content, files, published } = req.body;
            const updateData: Record<string, any> = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (files !== undefined) updateData.files = files;
            if (published !== undefined) updateData.published = published;

            const recruitment = await storage.updateHousingRecruitment(req.params.id, updateData);
            if (!recruitment) {
                return res.status(404).json({ error: "Recruitment not found" });
            }
            res.json(recruitment);
        } catch (error) {
            console.error("Failed to update recruitment:", error);
            res.status(500).json({ error: "Failed to update recruitment" });
        }
    });

    // Admin API - Delete recruitment
    app.delete("/api/admin/recruitments/:id", isAdmin, async (req, res) => {
        try {
            await storage.deleteHousingRecruitment(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete recruitment" });
        }
    });
}
