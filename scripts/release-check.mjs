#!/usr/bin/env node
/**
 * Pre-release checks for DoubleMark app update files.
 * Run: npm run release:check
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTION_BASE } from "./site-config.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const PREFIX = "DoubleMarkSetup";

const FORBIDDEN = [
  "shamsyy.github.io",
  "shamsyyy.github.io/doublemarksite",
  "dublimarksite",
  "DubliMark",
  "Dublimark",
  "dublimark",
];

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

function warn(msg) {
  console.warn(`WARN: ${msg}`);
}

function readJson(relPath) {
  return JSON.parse(readFileSync(join(projectRoot, relPath), "utf8"));
}

function grepForbidden(text, label) {
  for (const term of FORBIDDEN) {
    if (text.includes(term)) {
      fail(`Found forbidden reference "${term}" in ${label}`);
    }
  }
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
    .map((fileName) => join(dir, fileName));

  return matches[0] ?? null;
}

function main() {
  const updatePath = join(projectRoot, "public/updates/update.json");
  const versionsPath = join(projectRoot, "public/updates/versions.json");
  const manifestPath = join(projectRoot, "public/downloads/manifest.json");

  if (!existsSync(updatePath)) {
    fail("Missing public/updates/update.json");
  }
  if (!existsSync(versionsPath)) {
    fail("Missing public/updates/versions.json");
  }

  const update = readJson("public/updates/update.json");
  const versions = readJson("public/updates/versions.json");

  grepForbidden(JSON.stringify(update), "update.json");
  grepForbidden(JSON.stringify(versions), "versions.json");

  if (update.version !== versions.latest) {
    fail(
      `update.json version (${update.version}) must match versions.json latest (${versions.latest})`,
    );
  }

  const latestEntry = versions.versions.find((v) => v.version === versions.latest);
  if (!latestEntry) {
    fail("No version entry matching versions.latest");
  }

  if (!update.installerUrl.includes("doublemark.ru/")) {
    fail(`update.json installerUrl must use ${PRODUCTION_BASE}`);
  }

  if (update.sha256 === "PUT_SHA256_HASH_HERE") {
    warn("update.json sha256 is still PUT_SHA256_HASH_HERE — run npm run downloads:sync after adding .exe");
  }

  for (const entry of versions.versions) {
    if (!entry.installerUrl.includes("doublemark.ru/")) {
      fail(`Version ${entry.version} installerUrl must use ${PRODUCTION_BASE}`);
    }
    if (entry.sha256 === "PUT_SHA256_HASH_HERE") {
      warn(`Version ${entry.version} sha256 is still PUT_SHA256_HASH_HERE`);
    }
  }

  const downloadsDir = join(projectRoot, "public/downloads");
  const archiveDir = join(projectRoot, "public/downloads/archive");
  const latestFile =
    findByPrefix(downloadsDir, update.version) ??
    (existsSync(manifestPath)
      ? readJson("public/downloads/manifest.json").current?.[update.version]?.fileName
      : null);

  if (!latestFile) {
    warn(
      `No installer matching prefix ${PREFIX}-${update.version} in public/downloads/ — add .exe and run npm run downloads:sync`,
    );
  } else if (typeof latestFile === "string" && !existsSync(join(downloadsDir, latestFile))) {
    warn(`Manifest references missing file: ${latestFile}`);
  }

  if (failed) {
    console.error("\nRelease check FAILED");
    process.exit(1);
  }

  console.log("Release check passed (review warnings above if any).");
}

main();
