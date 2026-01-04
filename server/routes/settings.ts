import type { Express } from "express";
import { storage } from "../storage";
import { insertSiteSettingSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerSettingsRoutes(app: Express) {
    // Public site settings endpoint (specific keys only)
    app.get("/api/settings/:key", async (req, res) => {
        try {
            const setting = await storage.getSiteSetting(req.params.key);
            if (!setting) {
                return res.status(404).json({ error: "Setting not found" });
            }
            res.json(setting);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch setting" });
        }
    });

    // Admin Site Settings CRUD
    app.get("/api/admin/settings", isAuthenticated, async (_req, res) => {
        try {
            const settings = await storage.getSiteSettings();
            res.json(settings);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch site settings" });
        }
    });

    app.get("/api/admin/settings/:key", isAuthenticated, async (req, res) => {
        try {
            const setting = await storage.getSiteSetting(req.params.key);
            if (!setting) {
                return res.status(404).json({ error: "Setting not found" });
            }
            res.json(setting);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch setting" });
        }
    });

    app.put("/api/admin/settings/:key", isAuthenticated, async (req, res) => {
        try {
            const setting = await storage.upsertSiteSetting({
                key: req.params.key,
                value: req.body.value,
            });
            res.json(setting);
        } catch (error) {
            res.status(500).json({ error: "Failed to save setting" });
        }
    });
}
