import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '50mb' }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (process.env.NODE_ENV !== "production") {
        log(logLine);
      }
    }
  });

  next();
});

// Initialization promise for serverless
let initPromise: Promise<void> | null = null;

async function initialize() {
  // Migration removed to improve startup performance
  // Use 'npm run db:push' for schema changes

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  }
}

// Export handler for Vercel serverless
export default async function handler(req: Request, res: Response) {
  if (!initPromise) {
    initPromise = initialize();
  }
  await initPromise;
  return app(req, res);
}

// Start server for local development (non-Vercel)
if (!process.env.VERCEL) {
  (async () => {
    await initialize();

    if (process.env.NODE_ENV !== "production") {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    const port = parseInt(process.env.PORT || "5001", 10);
    httpServer.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  })();
}
