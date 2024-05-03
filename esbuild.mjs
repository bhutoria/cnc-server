import esbuild from "esbuild";
import typescript from "esbuild-plugin-tsc";

const entryPoint = "src/index.ts";
const outfile = "dist/index.js";

esbuild
  .build({
    entryPoints: [entryPoint],
    outfile,
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "node",
    target: "es2020",
    plugins: [typescript()],
  })
  .catch(() => process.exit(1));
