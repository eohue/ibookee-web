import type { Express } from "express";
import { storage } from "../storage";
import { insertEventSchema } from "@shared/schema";
import { isAuthenticated, isAdmin } from "../replit_integrations/auth";

export function registerEventRoutes(app: Express) {
    // Public Events API
    app.get("/api/events", async (_req, res) => {
        try {
            const events = await storage.getEvents();
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch events" });
        }
    });

    app.get("/api/events/:id", async (req, res) => {
        try {
            const event = await storage.getEvent(req.params.id);
            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch event" });
        }
    });

    // Admin Events CRUD
    app.get("/api/admin/events", isAdmin, async (_req, res) => {
        try {
            const events = await storage.getEvents();
            res.json(events);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch events" });
        }
    });

    app.post("/api/admin/events", isAdmin, async (req, res) => {
        try {
            const parsed = insertEventSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid event data", details: parsed.error });
            }
            const event = await storage.createEvent(parsed.data);
            res.status(201).json(event);
        } catch (error) {
            res.status(500).json({ error: "Failed to create event" });
        }
    });

    app.put("/api/admin/events/:id", isAdmin, async (req, res) => {
        try {
            const event = await storage.updateEvent(req.params.id, req.body);
            if (!event) {
                return res.status(404).json({ error: "Event not found" });
            }
            res.json(event);
        } catch (error) {
            res.status(500).json({ error: "Failed to update event" });
        }
    });

    app.delete("/api/admin/events/:id", isAdmin, async (req, res) => {
        try {
            await storage.deleteEvent(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete event" });
        }
    });
}
