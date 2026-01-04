import type { Express } from "express";
import { storage } from "../storage";
import { insertSocialAccountSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerSocialRoutes(app: Express) {
    // Public Social Accounts API
    app.get("/api/social-accounts", async (_req, res) => {
        try {
            const accounts = await storage.getSocialAccounts();
            res.json(accounts.filter(a => a.isActive));
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch social accounts" });
        }
    });

    // Admin Social Accounts CRUD
    app.get("/api/admin/social-accounts", isAuthenticated, async (_req, res) => {
        try {
            const accounts = await storage.getSocialAccounts();
            res.json(accounts);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch social accounts" });
        }
    });

    app.post("/api/admin/social-accounts", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertSocialAccountSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid account data", details: parsed.error });
            }
            const account = await storage.createSocialAccount(parsed.data);
            res.status(201).json(account);
        } catch (error) {
            res.status(500).json({ error: "Failed to create social account" });
        }
    });

    app.put("/api/admin/social-accounts/:id", isAuthenticated, async (req, res) => {
        try {
            const account = await storage.updateSocialAccount(req.params.id, req.body);
            if (!account) {
                return res.status(404).json({ error: "Social account not found" });
            }
            res.json(account);
        } catch (error) {
            res.status(500).json({ error: "Failed to update social account" });
        }
    });

    app.delete("/api/admin/social-accounts/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteSocialAccount(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete social account" });
        }
    });
}
