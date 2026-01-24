import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile } from "fs/promises";

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");

  // Bundle everything into a single file
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
    // Only exclude native modules that can't be bundled
    external: ["sharp", "bufferutil", "utf-8-validate", "@mapbox/node-pre-gyp"],
    logLevel: "info",
  });

  console.log("Build completed!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
