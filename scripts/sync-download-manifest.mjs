#!/usr/bin/env node
/**
 * Scans public/downloads for DoubleMarkSetup-{version}*.exe
 * and writes public/downloads/manifest.json + patches update JSON URLs.
 */
import { createHash } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptDir, "..");
const PREFIX = "DoubleMarkSetup";
const PRODUCTION_BASE = "https://shamsyyy.github.io/doublemarksite/";

function sha256File(path) {
  const data = readFileSync(path);
  return createHash("sha256").update(data).digest("hex").toUpperCase();
}

function findByPrefix(dir, version) {
  if (!existsSync(dir)) {
    return null;
  }
  const needle = `${PREFIX}-${version}`;
  const matches = readdirSync(dir)
    .filter((name) => name.toLowerCase().endsWith(".exe"))
    .filter(
      (name) =>
        name.startsWith(needle) &&
        (name.length === needle.length + 4 || name[needle.length] === "-"),
    )
    .map((fileName) => {
      const fullPath = join(dir, fileName);
      return { fileName, fullPath, mtimeMs: statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return matches[0] ?? null;
}

function entryFor(version, dir, folder) {
  const hit = findByPrefix(dir, version);
  if (!hit) {
    return null;
  }
  const relativePath = `downloads/${folder === "current" ? "" : "archive/"}${hit.fileName}`.replace(
    "//",
    "/",
  );
  return {
    version,
    fileName: hit.fileName,
    relativePath,
    sha256: sha256File(hit.fullPath),
  };
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(projectRoot, rel), "utf8"));
}

function writeJson(rel, data) {
  writeFileSync(join(projectRoot, rel), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function main() {
  const downloadsDir = join(projectRoot, "public/downloads");
  const archiveDir = join(projectRoot, "public/downloads/archive");
  const versionsPath = join(projectRoot, "public/updates/versions.json");
  const updatePath = join(projectRoot, "public/updates/update.json");

  const manifest = {
    generatedAt: new Date().toISOString(),
    prefix: PREFIX,
    productionBaseUrl: PRODUCTION_BASE,
    current: {},
    archive: {},
  };

  if (existsSync(versionsPath)) {
    const versions = readJson("public/updates/versions.json");
    for (const item of versions.versions) {
      const scope = item.type === "archive" ? "archive" : "current";
      const dir = scope === "archive" ? archiveDir : downloadsDir;
      const entry = entryFor(item.version, dir, scope);
      if (entry) {
        manifest[scope][item.version] = entry;
        item.installerUrl = `${PRODUCTION_BASE}${entry.relativePath}`;
        item.sha256 = entry.sha256;
      }
    }
    writeJson("public/updates/versions.json", versions);

    const latest = versions.versions.find((v) => v.version === versions.latest);
    if (latest && manifest.current[versions.latest]) {
      const update = existsSync(updatePath)
        ? readJson("public/updates/update.json")
        : null;
      if (update) {
        update.installerUrl = latest.installerUrl;
        update.sha256 = latest.sha256;
        writeJson("public/updates/update.json", update);
      }
    }
  }

  writeJson("public/downloads/manifest.json", manifest);

  const currentCount = Object.keys(manifest.current).length;
  const archiveCount = Object.keys(manifest.archive).length;
  console.log(
    `downloads manifest: current=${currentCount}, archive=${archiveCount} (prefix ${PREFIX}-<version>)`,
  );
}

main();
