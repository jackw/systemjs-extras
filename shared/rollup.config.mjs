import path from "node:path";
import fse from "fs-extra/esm";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const REPO_ROOT_DIR = path.resolve(__dirname, "..");

function copyToPlayground(packageName) {
  return {
    name: "copy-to-playground",
    writeBundle(options, bundle) {
      // let playgroundDir = path.join(REPO_ROOT_DIR, "playground");
      // let playgrounds = await fs.promises.readdir(playgroundsDir);
      let writtenDir = path.resolve(process.cwd(), options.dir);
      // let distDir = path.join(playgroundsDir, packageName, "index.js");
      let destDir = writtenDir.replace("packages", "playground");
      console.log(`copy ${writtenDir} -> ${destDir}`);
      fse.copySync(writtenDir, destDir, { overwrite: true });
      // for (let playground of playgrounds) {
      //   let playgroundDir = path.join(playgroundsDir, playground);
      //   if (!fse.statSync(playgroundDir).isDirectory()) {
      //     continue;
      //   }

      //   fse.copySync(writtenDir, destDir);
      // }
    },
  };
}

export default (commandLineArgs) => {
  const packageName = commandLineArgs.configPackageName;
  return {
    external: ["global"],
    input: ["src/index.js"],
    output: {
      format: "iife",
      name: "MyBundle",
      globals: {
        global: 'typeof self !== "undefined" ? self : global',
      },
      dir: "dist",
    },
    plugins: [copyToPlayground(packageName)],
  };
};
