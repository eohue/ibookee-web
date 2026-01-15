import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated } from "../replit_integrations/auth/replitAuth";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerUserRoutes(app: Express) {
    // List all users (Admin only)
    app.get("/api/admin/users", isAuthenticated, async (req, res) => {
        try {
            const userId = (req.user as any).id;
            const user = await storage.getUser(userId);

            if (!user || user.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }

            const users = await storage.getUsers();
            res.json(users);
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // Update user role (Admin only)
    app.patch("/api/admin/users/:id/role", isAuthenticated, async (req, res) => {
        try {
            const adminId = (req.user as any).id;
            const admin = await storage.getUser(adminId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }

            const { id } = req.params;
            const { role } = req.body;

            if (!["admin", "resident", "user"].includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }

            const updatedUser = await storage.updateUserRole(id, role);
            res.json(updatedUser);
        } catch (error) {
            console.error("Error updating user role:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // Verify Real Name 
    app.post("/api/users/verify-real-name", isAuthenticated, async (req, res) => {
        try {
            const userId = (req.user as any).id;
            const { realName, phoneNumber } = req.body;

            if (!realName || !phoneNumber) {
                return res.status(400).json({ message: "Name and phone number are required" });
            }

            const updatedUser = await storage.verifyUserRealName(userId, realName, phoneNumber);

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(updatedUser);
        } catch (error) {
            console.error("Error verifying user:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
}
