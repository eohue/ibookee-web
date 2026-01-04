import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerProjectRoutes } from "./routes/projects";
import { registerArticleRoutes } from "./routes/articles";
import { registerInquiryRoutes } from "./routes/inquiries";
import { registerCommunityRoutes } from "./routes/community";
import { registerEventRoutes } from "./routes/events";
import { registerProgramRoutes } from "./routes/programs";
import { registerPartnerRoutes } from "./routes/partners";
import { registerHistoryRoutes } from "./routes/history";
import { registerSocialRoutes } from "./routes/social";
import { registerSettingsRoutes } from "./routes/settings";
import { registerPageRoutes } from "./routes/pages";
import { registerStatsRoutes } from "./routes/stats";
import { registerUploadRoutes } from "./routes/upload";
import { registerUserRoutes } from "./routes/users";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup auth BEFORE other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerUploadRoutes(app);

  // Register domain routes
  registerProjectRoutes(app);
  registerArticleRoutes(app);
  registerInquiryRoutes(app);
  registerCommunityRoutes(app);
  registerEventRoutes(app);
  registerProgramRoutes(app);
  registerPartnerRoutes(app);
  registerHistoryRoutes(app);
  registerSocialRoutes(app);
  registerSettingsRoutes(app);
  registerPageRoutes(app);
  registerStatsRoutes(app);

  return httpServer;
}
