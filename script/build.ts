import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, writeFile, cp } from "fs/promises";
import { existsSync } from "fs";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });
  await rm(".vercel/output", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");

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
    // Bundle everything except native modules
    external: ["sharp", "bufferutil", "utf-8-validate"],
    logLevel: "info",
  });

  // Create Vercel Output API structure
  console.log("creating Vercel output structure...");

  await mkdir(".vercel/output/static", { recursive: true });
  await mkdir(".vercel/output/functions/api.func", { recursive: true });

  // Copy static files
  await cp("dist/public", ".vercel/output/static", { recursive: true });

  // Copy server bundle to function
  const serverCode = await readFile("dist/index.cjs", "utf-8");
  await writeFile(".vercel/output/functions/api.func/index.js", serverCode);

  // Create function config
  await writeFile(".vercel/output/functions/api.func/.vc-config.json", JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.js",
    launcherType: "Nodejs"
  }, null, 2));

  // Create output config
  await writeFile(".vercel/output/config.json", JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/api/(.*)", dest: "/api" },
      { src: "/(.*)", dest: "/api" }
    ]
  }, null, 2));

  console.log("Vercel output created successfully!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
