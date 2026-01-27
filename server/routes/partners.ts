import type { Express } from "express";
import { storage } from "../storage";
import { insertPartnerSchema } from "@shared/schema";
import { isAdmin } from "../replit_integrations/auth";

export function registerPartnerRoutes(app: Express) {
    // Public Partners API
    app.get("/api/partners", async (_req, res) => {
        try {
            const partners = await storage.getPartners();
            res.json(partners);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch partners" });
        }
    });

    // Admin Partners CRUD
    app.get("/api/admin/partners", isAdmin, async (_req, res) => {
        try {
            const partners = await storage.getPartners();
            res.json(partners);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch partners" });
        }
    });

    app.post("/api/admin/partners", isAdmin, async (req, res) => {
        try {
            const parsed = insertPartnerSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid partner data", details: parsed.error });
            }
            const partner = await storage.createPartner(parsed.data);
            res.status(201).json(partner);
        } catch (error) {
            res.status(500).json({ error: "Failed to create partner" });
        }
    });

    app.put("/api/admin/partners/:id", isAdmin, async (req, res) => {
        try {
            const partner = await storage.updatePartner(req.params.id, req.body);
            if (!partner) {
                return res.status(404).json({ error: "Partner not found" });
            }
            res.json(partner);
        } catch (error) {
            res.status(500).json({ error: "Failed to update partner" });
        }
    });

    app.delete("/api/admin/partners/:id", isAdmin, async (req, res) => {
        try {
            await storage.deletePartner(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete partner" });
        }
    });
}
