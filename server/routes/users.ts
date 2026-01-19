import type { Express } from "express";
import { storage } from "../storage";
import { isAuthenticated, hashPassword } from "../replit_integrations/auth/replitAuth";
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

    // Get single user (Admin only)
    app.get("/api/admin/users/:id", isAuthenticated, async (req, res) => {
        try {
            const adminId = (req.user as any).id;
            const admin = await storage.getUser(adminId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }

            const { id } = req.params;
            const user = await storage.getUser(id);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Remove password from response
            const { password, ...userWithoutPassword } = user;
            res.json(userWithoutPassword);
        } catch (error) {
            console.error("Error fetching user:", error);
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

    // Update user password (Admin only)
    app.patch("/api/admin/users/:id/password", isAuthenticated, async (req, res) => {
        try {
            const adminId = (req.user as any).id;
            const admin = await storage.getUser(adminId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }

            const { id } = req.params;
            const { password } = req.body;

            if (!password || password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }

            const hashedPassword = await hashPassword(password);
            const updatedUser = await storage.updateUserPassword(id, hashedPassword);

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({ message: "Password updated successfully" });
        } catch (error) {
            console.error("Error updating user password:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    // Delete user (Admin only)
    app.delete("/api/admin/users/:id", isAuthenticated, async (req, res) => {
        try {
            const adminId = (req.user as any).id;
            const admin = await storage.getUser(adminId);

            if (!admin || admin.role !== "admin") {
                return res.status(403).json({ message: "Forbidden" });
            }

            const { id } = req.params;

            // Prevent admin from deleting themselves
            if (id === adminId) {
                return res.status(400).json({ message: "Cannot delete your own account" });
            }

            const userToDelete = await storage.getUser(id);
            if (!userToDelete) {
                return res.status(404).json({ message: "User not found" });
            }

            await storage.deleteUser(id);
            res.json({ message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
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

    // Update Profile Image
    app.post("/api/users/profile-image", isAuthenticated, async (req, res) => {
        try {
            const userId = (req.user as any).id;
            const { profileImageUrl } = req.body;

            if (!profileImageUrl) {
                return res.status(400).json({ message: "Profile image URL is required" });
            }

            const updatedUser = await storage.updateUserProfileImage(userId, profileImageUrl);

            if (!updatedUser) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(updatedUser);
        } catch (error) {
            console.error("Error updating profile image:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });
}

