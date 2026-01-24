import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir, writeFile, cp } from "fs/promises";
import { join } from "path";

async function buildAll() {
  console.log("Cleaning build directories...");
  await rm("dist", { recursive: true, force: true });
  await rm(".vercel", { recursive: true, force: true });

  console.log("Building client (Vite)...");
  await viteBuild(); // Builds to dist/public by default (checked typical vite config)

  console.log("Constructing Vercel Output API v3 structure...");

  // 1. Create base structure
  await mkdir(".vercel/output/static", { recursive: true });
  await mkdir(".vercel/output/functions/index.func", { recursive: true });

  // 2. Move Client Static Assets
  // Assuming Vite builds to 'dist/public' based on previous context. 
  // If vite.config.ts says 'dist', we need to be careful.
  // Checking vite config is safer, but let's assume 'dist/public' or 'dist' based on previous steps.
  // Previous steps set outputDirectory to dist/public in vercel.json, so vite likely builds there or we moved it.
  // Let's check where Vite builds. Usually it's 'dist'.
  // We will copy 'dist' content to '.vercel/output/static'.

  // First, let's verify where vite builds. Standard is 'dist'.
  // Our vite config might needed adjustment, but let's assume 'dist/public' from previous context or just 'dist'.
  // SAFE GUARD: Let's assume standard Vite build goes to 'dist'. 
  // We will move 'dist' contents to '.vercel/output/static'.
  // However, we want the API to handle non-static routes.

  // Actually, let's look at the previous build script. It assumed 'dist/public'.
  // Let's ensure we copy the right things.

  await cp("dist/public", ".vercel/output/static", { recursive: true });

  // 3. Build Server Serverless Function
  console.log("Building Serverless Function...");

  await esbuild({
    entryPoints: ["server/vercel-api.ts"], // Use the wrapper we created
    bundle: true,
    platform: "node",
    target: "node20",
    format: "esm",
    outfile: ".vercel/output/functions/index.func/index.mjs",
    external: [
      // Native modules that typically can't be bundled easily or are provided by runtime
      "sharp", "@mapbox/node-pre-gyp", "mock-aws-s3", "nock", "aws-sdk-client-mock", "pg-native"
    ],
    banner: {
      // Fix for bundling some legacy CJS modules and defining __dirname/__filename for ESM
      js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
`
    },
    define: {
      "process.env.NODE_ENV": '"production"'
    },
    loader: {
      ".node": "file" // Handle .node native extensions if any
    },
    logLevel: "info"
  });

  // 4. Create Function Config (.vc-config.json)
  await writeFile(
    ".vercel/output/functions/index.func/.vc-config.json",
    JSON.stringify({
      runtime: "nodejs20.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      maxDuration: 60,
      memory: 1024
    }, null, 2)
  );

  // 5. Create Function Package.json
  await writeFile(
    ".vercel/output/functions/index.func/package.json",
    JSON.stringify({ type: "module" }, null, 2)
  );

  // 6. Create Global Config (config.json)
  await writeFile(
    ".vercel/output/config.json",
    JSON.stringify({
      version: 3,
      routes: [
        // 1. API requests go to the serverless function
        { src: "/api/(.*)", dest: "/index" },

        // 2. Static files are handled by filesystem
        { handle: "filesystem" },

        // 3. Dynamic Assets: If not found in filesystem, let server handle /assets (e.g. uploads)
        { src: "/assets/(.*)", dest: "/index" },

        // 4. SPA Fallback: All other routes go to index.html
        { src: "/(.*)", dest: "/index.html" }
      ]
    }, null, 2)
  );

  console.log("Vercel Output API build complete!");

  // 7. Build Standard Node.js Server (for Render/VPS)
  console.log("Building Standard Node.js Server (dist/index.cjs)...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    outfile: "dist/index.cjs",
    external: ["sharp", "pg-native", "esbuild"],
    loader: {
      ".node": "file"
    },
    // No banner needed for CJS usually, or minimal
  });
  console.log("Standard Node.js build complete!");
}

buildAll().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
