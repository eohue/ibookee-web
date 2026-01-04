import type { Express } from "express";
import { storage } from "../storage";
import { insertInquirySchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerInquiryRoutes(app: Express) {
    // Public Inquiries API
    app.post("/api/inquiries", async (req, res) => {
        try {
            const parsed = insertInquirySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid inquiry data", details: parsed.error });
            }
            const inquiry = await storage.createInquiry(parsed.data);
            res.status(201).json(inquiry);
        } catch (error) {
            res.status(500).json({ error: "Failed to create inquiry" });
        }
    });

    app.get("/api/inquiries", async (_req, res) => {
        try {
            const inquiries = await storage.getInquiries();
            res.json(inquiries);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch inquiries" });
        }
    });

    // Admin Inquiries API
    app.get("/api/admin/inquiries", isAuthenticated, async (_req, res) => {
        try {
            const inquiries = await storage.getInquiries();
            res.json(inquiries);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch inquiries" });
        }
    });

    app.delete("/api/admin/inquiries/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteInquiry(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete inquiry" });
        }
    });
}
