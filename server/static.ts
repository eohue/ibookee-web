import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Hashed static assets (JS, CSS, images) — 1 year cache, immutable
  app.use(express.static(distPath, {
    maxAge: "1y",
    immutable: true,
    etag: true,
    index: false, // Don't serve index.html from here
  }));

  // SPA fallback — index.html always fresh (no-cache)
  app.use("*", (_req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

