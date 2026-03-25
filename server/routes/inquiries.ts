import type { Express } from "express";
import { storage } from "../storage";
import { isAdmin } from "../replit_integrations/auth";

export function registerInquiryRoutes(app: Express) {
    // Public Inquiries API
    app.post("/api/inquiries", async (req, res) => {
        try {
            const { type, title, name, email, phone, company, password, message, preferredProject, isSecret } = req.body;
            if (!type || !name || !email) {
                return res.status(400).json({ error: "type, name, email are required" });
            }
            const inquiry = await storage.createInquiry({
                type,
                title: title || '',
                name,
                email,
                phone: phone || null,
                company: company || null,
                password: password || null,
                message: message || '',
                preferredProject: preferredProject || null,
                isSecret: isSecret ?? true,
            });
            res.status(201).json(inquiry);
        } catch (error) {
            console.error("Failed to create inquiry:", error);
            res.status(500).json({ error: "Failed to create inquiry" });
        }
    });

    // Public list - strip sensitive data if secret
    app.get("/api/inquiries", async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const type = req.query.type as string;

            const result = await storage.getInquiries(page, limit, type);

            const safeInquiries = result.inquiries.map(inq => {
                const isSecret = inq.isSecret;
                const maskedName = inq.name.substring(0, 1) + (inq.name.length > 2 ? '*' : '') + (inq.name.length > 2 ? inq.name.substring(2) : (inq.name.length > 1 ? '*' : ''));

                if (isSecret) {
                    return {
                        id: inq.id,
                        type: inq.type,
                        title: inq.title,
                        name: maskedName,
                        createdAt: inq.createdAt,
                        status: inq.status,
                        isSecret: inq.isSecret,
                        answeredAt: inq.answeredAt,
                    };
                }

                return {
                    id: inq.id,
                    type: inq.type,
                    title: inq.title,
                    name: maskedName,
                    message: inq.message,
                    answer: inq.answer,
                    createdAt: inq.createdAt,
                    status: inq.status,
                    isSecret: inq.isSecret,
                    answeredAt: inq.answeredAt,
                };
            });

            res.json({ inquiries: safeInquiries, total: result.total });
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch inquiries" });
        }
    });

    // Verify password to view full inquiry
    app.post("/api/inquiries/:id/verify", async (req, res) => {
        try {
            const { password } = req.body;
            const inquiry = await storage.getInquiry(req.params.id);
            if (!inquiry) {
                return res.status(404).json({ error: "Not found" });
            }
            // If it's not secret, no need to verify, but route usually shouldn't be called.
            if (inquiry.isSecret && inquiry.password !== password) {
                return res.status(401).json({ error: "Incorrect password" });
            }

            // Return full data minus the actual password
            const { password: _, ...safeData } = inquiry;
            res.json(safeData);
        } catch (error) {
            res.status(500).json({ error: "Failed to verify inquiry" });
        }
    });

    // Admin Inquiries API
    app.get("/api/admin/inquiries", isAdmin, async (req, res) => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const type = req.query.type as string;

            const result = await storage.getInquiries(page, limit, type);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch inquiries" });
        }
    });

    app.patch("/api/admin/inquiries/:id", isAdmin, async (req, res) => {
        try {
            const { answer, status } = req.body;
            const updateData: any = {};

            if (answer !== undefined) {
                updateData.answer = answer;
                updateData.status = answer ? 'answered' : 'pending';
                if (answer) updateData.answeredAt = new Date();
            }
            if (status) {
                updateData.status = status;
            }

            const inquiry = await storage.updateInquiry(req.params.id, updateData);
            if (!inquiry) return res.status(404).json({ error: "Not found" });
            res.json(inquiry);
        } catch (error) {
            res.status(500).json({ error: "Failed to update inquiry" });
        }
    });

    app.delete("/api/admin/inquiries/:id", isAdmin, async (req, res) => {
        try {
            await storage.deleteInquiry(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete inquiry" });
        }
    });
}
