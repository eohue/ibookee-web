import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, writeFile, cp } from "fs/promises";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });
  await rm(".vercel/output", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");

  // Build server with all dependencies bundled
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "dist/index.mjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: ["sharp", "bufferutil", "utf-8-validate"],
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    },
    logLevel: "info",
  });

  // Create Vercel Output API structure
  console.log("creating Vercel output structure...");

  await mkdir(".vercel/output/static", { recursive: true });
  await mkdir(".vercel/output/functions/index.func", { recursive: true });

  // Copy static files
  await cp("dist/public", ".vercel/output/static", { recursive: true });

  // Create wrapper for serverless function
  const wrapperCode = `
import express from 'express';
import { registerRoutes } from './routes.js';
import { serveStatic } from './static.js';
import { createServer } from 'http';
import { db } from './db.js';
import { sql } from 'drizzle-orm';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

let initialized = false;

async function initialize() {
  if (initialized) return;
  initialized = true;
  
  if (process.env.DATABASE_URL) {
    try {
      await db.execute(sql\`ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' NOT NULL\`);
    } catch (err) {
      console.error("Migration error:", err);
    }
  }
  
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app);
  
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  serveStatic(app);
}

export default async function handler(req, res) {
  await initialize();
  return app(req, res);
}
`;

  // Actually, let's just copy the bundled server
  await cp("dist/index.mjs", ".vercel/output/functions/index.func/index.mjs");

  // Create package.json for the function
  await writeFile(".vercel/output/functions/index.func/package.json", JSON.stringify({
    type: "module"
  }, null, 2));

  // Create function config
  await writeFile(".vercel/output/functions/index.func/.vc-config.json", JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
    shouldAddHelpers: true
  }, null, 2));

  // Create output config
  await writeFile(".vercel/output/config.json", JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/api/(.*)", dest: "/index" },
      { src: "/(.*)", dest: "/index" }
    ]
  }, null, 2));

  console.log("Vercel output created successfully!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
