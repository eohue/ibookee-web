import type { Express } from "express";
import { storage } from "../../storage";
import { isAuthenticated } from "./replitAuth";

import passport from "passport";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    // ... (existing code found in previous steps, but I am replacing the whole function or just appending?)
    // I should be careful not to delete existing logic if I replace the whole block.
    // The existing function has a try/catch block for /api/auth/user.
    // I will append the new routes AFTER /api/auth/user handler.
    try {
      // ... (existing content logic)
      const userId = req.user.id || req.user.claims?.sub;
      if (!userId) throw new Error("User ID missing");
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Google
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/auth?error=google_login_failed" }),
    (req, res) => {
      const user = req.user as any;
      if (user?.role === "admin") {
        res.redirect("/dashboard");
      } else {
        res.redirect("/");
      }
    }
  );

  // Naver
  app.get("/api/auth/naver", passport.authenticate("naver"));
  app.get("/api/auth/naver/callback",
    passport.authenticate("naver", { failureRedirect: "/auth?error=naver_login_failed" }),
    (req, res) => {
      const user = req.user as any;
      if (user?.role === "admin") {
        res.redirect("/dashboard");
      } else {
        res.redirect("/");
      }
    }
  );

  // Kakao
  app.get("/api/auth/kakao", passport.authenticate("kakao"));
  app.get("/api/auth/kakao/callback",
    passport.authenticate("kakao", { failureRedirect: "/auth?error=kakao_login_failed" }),
    (req, res) => {
      const user = req.user as any;
      if (user?.role === "admin") {
        res.redirect("/dashboard");
      } else {
        res.redirect("/");
      }
    }
  );
}
