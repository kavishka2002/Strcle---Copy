import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const nextCli = require.resolve("next/dist/bin/next");

function run(command, args, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(command)} failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}.`));
    });
  });
}

try {
  await run(process.execPath, [nextCli, "build"], {
    ...process.env,
    LITTLEPAPER_DESKTOP_BUILD: "1"
  });
  await run(process.execPath, [path.join(projectRoot, "scripts", "prepare-desktop.mjs")]);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
