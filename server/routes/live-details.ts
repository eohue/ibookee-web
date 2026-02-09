import type { Express } from "express";
import { db } from "../db";
import { liveProjectDetails, projects } from "@shared/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export function registerLiveDetailRoutes(app: Express) {
    // Get Live Detail for a Project
    app.get("/api/projects/:projectId/live-detail", async (req, res) => {
        try {
            const { projectId } = req.params;
            const detail = await db.query.liveProjectDetails.findFirst({
                where: eq(liveProjectDetails.projectId, projectId),
            });

            // If no detail exists yet, return empty object (not error)
            if (!detail) {
                return res.json({});
            }

            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            res.json(detail);
        } catch (error) {
            console.error("Error fetching live details:", error);
            res.status(500).json({ message: "Failed to fetch live details" });
        }
    });

    // Update/Create Live Detail (Admin)
    app.post("/api/admin/projects/:projectId/live-detail", async (req, res) => {
        try {
            requireAuth(req, res); // Ensure admin
            const { projectId } = req.params;
            const data = req.body;

            const existing = await db.query.liveProjectDetails.findFirst({
                where: eq(liveProjectDetails.projectId, projectId),
            });

            if (existing) {
                // Update
                const [updated] = await db
                    .update(liveProjectDetails)
                    .set({
                        ...data,
                        updatedAt: new Date(),
                    })
                    .where(eq(liveProjectDetails.id, existing.id))
                    .returning();
                res.json(updated);
            } else {
                // Create
                const [created] = await db
                    .insert(liveProjectDetails)
                    .values({
                        projectId,
                        ...data,
                    })
                    .returning();
                res.json(created);
            }
        } catch (error) {
            console.error("Error updating live details:", error);
            res.status(500).json({ message: "Failed to update live details" });
        }
    });

    // Toggle Project Live Status (Admin)
    app.put("/api/admin/projects/:id/live-status", async (req, res) => {
        try {
            requireAuth(req, res);
            const { id } = req.params;
            const { isLive, rentStatus } = req.body;

            const [updated] = await db
                .update(projects)
                .set({ isLive, rentStatus })
                .where(eq(projects.id, id))
                .returning();

            res.json(updated);
        } catch (error) {
            console.error("Error updating project live status:", error);
            res.status(500).json({ message: "Failed to update status" });
        }
    });
}

function requireAuth(req: any, res: any) {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
        throw new Error("Unauthorized");
    }
}
