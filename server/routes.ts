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
import { registerUploadRoutes, setupStaticAssets } from "./routes/upload";
import { registerUserRoutes } from "./routes/users";
import { registerMetadataRoutes } from "./routes/metadata";
import { registerReporterRoutes } from "./routes/reporters";
import { registerRecruitmentRoutes } from "./routes/recruitments";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // 1. Static assets (no auth required, no db session check)
  // This prevents "MaxClientsInSessionMode" errors when loading many images
  setupStaticAssets(app);

  // 2. Setup auth (DB session check)
  await setupAuth(app);

  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerUploadRoutes(app);
  registerMetadataRoutes(app);

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
  registerPageRoutes(app);
  registerStatsRoutes(app);
  registerReporterRoutes(app);
  registerRecruitmentRoutes(app);

  return httpServer;
}
