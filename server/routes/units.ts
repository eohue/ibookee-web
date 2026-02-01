import type { Express } from "express";
import { storage } from "../storage";
import { insertProjectUnitSchema } from "@shared/schema";

export function registerUnitRoutes(app: Express) {
    // Get units for a project
    app.get("/api/projects/:projectId/units", async (req, res) => {
        try {
            const units = await storage.getProjectUnits(req.params.projectId);
            res.json(units);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch units" });
        }
    });

    // Get single unit
    app.get("/api/units/:id", async (req, res) => {
        try {
            const unit = await storage.getProjectUnit(req.params.id);
            if (!unit) {
                return res.status(404).json({ message: "Unit not found" });
            }
            res.json(unit);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch unit" });
        }
    });

    // Create unit (Admin only - middleware should be added in production)
    app.post("/api/admin/units", async (req, res) => {
        try {
            const unitData = insertProjectUnitSchema.parse(req.body);
            const unit = await storage.createProjectUnit(unitData);
            res.status(201).json(unit);
        } catch (error) {
            res.status(400).json({ message: "Invalid unit data", error });
        }
    });

    // Update unit (Admin only)
    app.patch("/api/admin/units/:id", async (req, res) => {
        try {
            const unitData = insertProjectUnitSchema.partial().parse(req.body);
            const unit = await storage.updateProjectUnit(req.params.id, unitData);
            if (!unit) {
                return res.status(404).json({ message: "Unit not found" });
            }
            res.json(unit);
        } catch (error) {
            res.status(400).json({ message: "Invalid unit data", error });
        }
    });

    // Delete unit (Admin only)
    app.delete("/api/admin/units/:id", async (req, res) => {
        try {
            await storage.deleteProjectUnit(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: "Failed to delete unit" });
        }
    });
}
