#!/usr/bin/env node
/**
 * Pre-release checks for DoubleMark app update files.
 * Run: npm run release:check
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");

const FORBIDDEN = [
  "shamsyy.github.io",
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

function main() {
  const updatePath = join(projectRoot, "public/updates/update.json");
  const versionsPath = join(projectRoot, "public/updates/versions.json");

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

  if (!update.installerUrl.includes("shamsyyy.github.io/doublemarksite/")) {
    fail("update.json installerUrl must use shamsyyy.github.io/doublemarksite/");
  }

  if (update.sha256 === "PUT_SHA256_HASH_HERE") {
    warn("update.json sha256 is still PUT_SHA256_HASH_HERE — replace before production");
  }

  for (const entry of versions.versions) {
    if (!entry.installerUrl.includes("shamsyyy.github.io/doublemarksite/")) {
      fail(`Version ${entry.version} installerUrl must use shamsyyy.github.io/doublemarksite/`);
    }
    if (entry.sha256 === "PUT_SHA256_HASH_HERE") {
      warn(`Version ${entry.version} sha256 is still PUT_SHA256_HASH_HERE`);
    }
  }

  const installerName = `DoubleMarkSetup-${update.version}.exe`;
  const installerPath = join(projectRoot, "public/downloads", installerName);
  if (!existsSync(installerPath)) {
    warn(
      `Installer not found at public/downloads/${installerName} — upload before deploy (see public/downloads/README.md)`,
    );
  }

  if (failed) {
    console.error("\nRelease check FAILED");
    process.exit(1);
  }

  console.log("Release check passed (review warnings above if any).");
}

main();
