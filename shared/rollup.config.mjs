import path from "node:path";
import fse from "fs-extra/esm";
import { minify } from "rollup-plugin-esbuild";

const outDir = "dist";

function copyToPlayground(packageName) {
  return {
    name: "copy-to-playground",
    writeBundle(options) {
      let writtenDir = path.resolve(process.cwd(), outDir);
      let destDir = writtenDir.replace("packages", "playground");
      fse.copySync(writtenDir, destDir, { overwrite: true });
    },
  };
}

const globalDef = {
  global: 'typeof self !== "undefined" ? self : global',
};

export default (commandLineArgs) => {
  const packageName = commandLineArgs.configPackageName;
  return {
    external: ["global"],
    input: ["src/index.js"],
    output: [
      {
        file: `${outDir}/index.js`,
        format: "iife",
        name: "MyBundle",
        sourcemap: true,
        globals: globalDef,
      },
      {
        file: `${outDir}/index.min.js`,
        format: "iife",
        name: "MyBundle",
        sourcemap: true,
        globals: globalDef,
        plugins: [minify()],
      },
    ],
    plugins: [copyToPlayground(packageName)],
  };
};
