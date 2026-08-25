#!/usr/bin/env node
/**
 * Deploy dist/ to VPS from this computer (no GitHub).
 *
 * Env:
 *   DEPLOY_HOST     default: 46.149.70.172
 *   DEPLOY_USER     default: root
 *   DEPLOY_PATH     default: /var/www/doublemark
 *   DEPLOY_PORT     default: 22
 *   DEPLOY_KEY      optional path to private key
 */
import { existsSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(root, "dist");

const host = process.env.DEPLOY_HOST ?? "46.149.70.172";
const user = process.env.DEPLOY_USER ?? "root";
const remotePath = process.env.DEPLOY_PATH ?? "/var/www/doublemark";
const port = process.env.DEPLOY_PORT ?? "22";
const defaultKey = join(homedir(), ".ssh", "id_ed25519");
const keyPath = (process.env.DEPLOY_KEY ?? (existsSync(defaultKey) ? defaultKey : "")).trim();

function run(command, args, extra = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    windowsHide: true,
    cwd: root,
    env: process.env,
    ...extra,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

process.env.VITE_BASE_PATH = process.env.VITE_BASE_PATH || "/";
process.env.VITE_BACKEND = "local";
process.env.VITE_API_BASE_URL =
  process.env.VITE_API_BASE_URL_PROD || "https://api.doublemark.ru";

console.log(
  `Building for production: VITE_BACKEND=${process.env.VITE_BACKEND} VITE_API_BASE_URL=${process.env.VITE_API_BASE_URL}`,
);
run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "build"], { shell: true });

if (!existsSync(distDir)) {
  console.error("dist/ not found — production build failed");
  process.exit(1);
}

const sshOpts = [
  "-p",
  port,
  ...(keyPath ? ["-i", keyPath] : []),
  "-o",
  "BatchMode=yes",
  "-o",
  "ConnectTimeout=10",
  "-o",
  "StrictHostKeyChecking=accept-new",
];

const scpOpts = [
  "-P",
  port,
  ...(keyPath ? ["-i", keyPath] : []),
  "-o",
  "BatchMode=yes",
  "-o",
  "ConnectTimeout=10",
  "-o",
  "StrictHostKeyChecking=accept-new",
];

const target = `${user}@${host}:${remotePath}/`;
console.log(`Deploying ${distDir} -> ${target}`);
if (keyPath) {
  console.log(`SSH key: ${keyPath}`);
}

run("ssh", [...sshOpts, `${user}@${host}`, `mkdir -p ${remotePath}`]);

const entries = readdirSync(distDir)
  .filter((name) => name !== "Photo")
  .map((name) => join(distDir, name))
  .filter((fullPath) => {
    try {
      const st = statSync(fullPath);
      return st.isFile() || st.isDirectory();
    } catch {
      return false;
    }
  });

run("scp", [...scpOpts, "-r", ...entries, target]);

console.log("Deploy complete:", "https://doublemark.ru/");
