import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, mkdir } from "fs/promises";

async function buildAll() {
  // Clean dist directory
  await rm("dist", { recursive: true, force: true });

  // Create api directory for Vercel function
  await mkdir("api", { recursive: true });

  console.log("Building client...");
  await viteBuild();

  console.log("Building server for local development...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: ["sharp", "bufferutil", "utf-8-validate", "@mapbox/node-pre-gyp"],
    logLevel: "info",
  });

  console.log("Building Vercel serverless API function...");
  await esbuild({
    entryPoints: ["server/vercel-api.ts"],
    platform: "node",
    bundle: true,
    format: "esm",
    outfile: "api/index.js",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    // Bundle ALL dependencies for Vercel
    external: ["sharp", "bufferutil", "utf-8-validate", "@mapbox/node-pre-gyp"],
    banner: {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`
    },
    logLevel: "info",
  });

  console.log("Build completed successfully!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
