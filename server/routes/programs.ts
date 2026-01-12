import type { Express } from "express";
import { storage } from "../storage";
import { insertResidentProgramSchema, insertProgramApplicationSchema } from "@shared/schema";
import { isAuthenticated } from "../replit_integrations/auth";

export function registerProgramRoutes(app: Express) {
    // Public Programs API
    app.get("/api/programs", async (req, res) => {
        try {
            const type = req.query.type as string | undefined;
            const programs = type
                ? await storage.getResidentProgramsByType(type)
                : await storage.getResidentPrograms();
            res.json(programs);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch programs" });
        }
    });

    // Public Application Submission
    app.post("/api/applications", async (req, res) => {
        try {
            const parsed = insertProgramApplicationSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid application data", details: parsed.error });
            }
            const application = await storage.createProgramApplication(parsed.data);
            res.status(201).json(application);
        } catch (error) {
            res.status(500).json({ error: "Failed to submit application" });
        }
    });

    // Get User's Applications
    app.get("/api/my-applications", isAuthenticated, async (req, res) => {
        try {
            const userId = (req.user as any)!.id; // isAuthenticated middleware ensures user exists
            const applications = await storage.getProgramApplicationsByUser(userId);
            res.json(applications);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch applications" });
        }
    });

    // Admin Resident Programs CRUD
    app.get("/api/admin/programs", isAuthenticated, async (req, res) => {
        try {
            const type = req.query.type as string | undefined;
            const programs = type
                ? await storage.getResidentProgramsByType(type)
                : await storage.getResidentPrograms();
            res.json(programs);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch programs" });
        }
    });

    app.post("/api/admin/programs", isAuthenticated, async (req, res) => {
        try {
            const parsed = insertResidentProgramSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ error: "Invalid program data", details: parsed.error });
            }
            const program = await storage.createResidentProgram(parsed.data);
            res.status(201).json(program);
        } catch (error) {
            res.status(500).json({ error: "Failed to create program" });
        }
    });

    app.put("/api/admin/programs/:id", isAuthenticated, async (req, res) => {
        try {
            const program = await storage.updateResidentProgram(req.params.id, req.body);
            if (!program) {
                return res.status(404).json({ error: "Program not found" });
            }
            res.json(program);
        } catch (error) {
            res.status(500).json({ error: "Failed to update program" });
        }
    });

    app.delete("/api/admin/programs/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteResidentProgram(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete program" });
        }
    });

    // Admin Program Applications
    app.get("/api/admin/applications", isAuthenticated, async (req, res) => {
        try {
            const programId = req.query.programId as string | undefined;
            const applications = programId
                ? await storage.getProgramApplicationsByProgram(programId)
                : await storage.getProgramApplications();
            res.json(applications);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch applications" });
        }
    });

    app.put("/api/admin/applications/:id/status", isAuthenticated, async (req, res) => {
        try {
            const { status } = req.body;
            const application = await storage.updateProgramApplicationStatus(req.params.id, status);
            if (!application) {
                return res.status(404).json({ error: "Application not found" });
            }
            res.json(application);
        } catch (error) {
            res.status(500).json({ error: "Failed to update application status" });
        }
    });

    app.delete("/api/admin/applications/:id", isAuthenticated, async (req, res) => {
        try {
            await storage.deleteProgramApplication(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Failed to delete application" });
        }
    });
}
