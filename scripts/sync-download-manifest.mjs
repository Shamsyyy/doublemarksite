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
import { PRODUCTION_BASE } from "./site-config.mjs";

const PREFIX = "DoubleMarkSetup";

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

function listCurrentInstallers(downloadsDir) {
  if (!existsSync(downloadsDir)) {
    return [];
  }
  return readdirSync(downloadsDir)
    .filter((name) => name.toLowerCase().endsWith(".exe"))
    .filter((name) => name.startsWith(`${PREFIX}-`));
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
  const raw = readFileSync(join(projectRoot, rel), "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw);
}

function writeJson(rel, data) {
  writeFileSync(join(projectRoot, rel), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeProductionUrl(url) {
  if (!url || typeof url !== "string") {
    return url;
  }
  return url
    .replace("https://shamsyyy.github.io/doublemarksite/", PRODUCTION_BASE)
    .replace("http://shamsyyy.github.io/doublemarksite/", PRODUCTION_BASE)
    .replace("https://doublemark.ru/", PRODUCTION_BASE)
    .replace("http://doublemark.ru/", PRODUCTION_BASE);
}

function alignVersionsWithUpdate(versions, update) {
  if (!update?.version) {
    return;
  }

  const updateVersion = String(update.version).trim();
  if (versions.latest === updateVersion) {
    return;
  }

  console.warn(
    `WARN: versions.json latest=${versions.latest}, update.json version=${updateVersion} — выравниваем`,
  );

  for (const item of versions.versions) {
    if (item.type === "latest") {
      item.type = "archive";
      item.recommended = false;
    }
  }

  let entry = versions.versions.find((item) => item.version === updateVersion);
  if (!entry) {
    entry = {
      version: updateVersion,
      releaseDate: update.releaseDate ?? new Date().toISOString().slice(0, 10),
      title: update.title ?? `DoubleMark ${updateVersion}`,
      type: "latest",
      recommended: true,
      mandatory: Boolean(update.mandatory),
      installerUrl: "",
      sha256: String(update.sha256 ?? "PUT_SHA256_HASH_HERE").toUpperCase(),
      notes: Array.isArray(update.notes) ? update.notes : [],
    };
    versions.versions.unshift(entry);
  } else {
    entry.type = "latest";
    entry.recommended = true;
    if (Array.isArray(update.notes) && update.notes.length > 0) {
      entry.notes = update.notes;
    }
    if (update.releaseDate) {
      entry.releaseDate = update.releaseDate;
    }
    if (update.title) {
      entry.title = update.title;
    }
  }

  versions.latest = updateVersion;
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

  let update = null;
  if (existsSync(updatePath)) {
    update = readJson("public/updates/update.json");
    update.installerUrl = normalizeProductionUrl(update.installerUrl ?? update.downloadUrl);
    if (update.downloadUrl) {
      update.downloadUrl = normalizeProductionUrl(update.downloadUrl);
    }
    if (update.sha256) {
      update.sha256 = String(update.sha256).toUpperCase();
    }
  }

  if (existsSync(versionsPath)) {
    const versions = readJson("public/updates/versions.json");
    if (update) {
      alignVersionsWithUpdate(versions, update);
    }

    for (const item of versions.versions) {
      const isLatest = item.version === versions.latest;
      item.type = isLatest ? "latest" : "archive";
      item.recommended = isLatest;
      if (!isLatest) {
        item.mandatory = false;
      }

      const folder = isLatest ? "current" : "archive";
      const dir = isLatest ? downloadsDir : archiveDir;
      const entry = entryFor(item.version, dir, folder);
      if (entry) {
        if (isLatest) {
          manifest.current[item.version] = entry;
        } else {
          manifest.archive[item.version] = entry;
        }
        item.installerUrl = `${PRODUCTION_BASE}${entry.relativePath}`;
        item.sha256 = entry.sha256;
      } else {
        // Fallback: archive entry may still sit in downloads/ root from older publishes.
        if (!isLatest) {
          const rootEntry = entryFor(item.version, downloadsDir, "current");
          if (rootEntry) {
            manifest.archive[item.version] = {
              ...rootEntry,
              relativePath: `downloads/${rootEntry.fileName}`,
            };
            item.installerUrl = `${PRODUCTION_BASE}downloads/${rootEntry.fileName}`;
            item.sha256 = rootEntry.sha256;
            continue;
          }
        }
        item.installerUrl = normalizeProductionUrl(item.installerUrl ?? "");
      }
    }

    versions.versions.sort((a, b) =>
      String(b.version).localeCompare(String(a.version), undefined, { numeric: true }),
    );
    writeJson("public/updates/versions.json", versions);

    const latest = versions.versions.find((v) => v.version === versions.latest);
    if (latest && manifest.current[versions.latest] && update) {
      update.version = versions.latest;
      update.installerUrl = latest.installerUrl;
      update.downloadUrl = latest.installerUrl;
      update.sha256 = latest.sha256;
      if (!update.releaseDate && latest.releaseDate) {
        update.releaseDate = latest.releaseDate;
      }
      if (!update.title && latest.title) {
        update.title = latest.title;
      }
      writeJson("public/updates/update.json", update);
    }
  }

  writeJson("public/downloads/manifest.json", manifest);

  const currentCount = Object.keys(manifest.current).length;
  const archiveCount = Object.keys(manifest.archive).length;
  console.log(
    `downloads manifest: current=${currentCount}, archive=${archiveCount} (prefix ${PREFIX}-<version>)`,
  );

  if (currentCount === 0 && existsSync(versionsPath)) {
    const versions = readJson("public/updates/versions.json");
    const onDisk = listCurrentInstallers(downloadsDir);
    console.warn(
      `WARN: нет current для latest=${versions.latest} в public/downloads/`,
    );
    if (onDisk.length > 0) {
      console.warn(`      на диске: ${onDisk.join(", ")}`);
      console.warn("      обновите update.json version или положите нужный .exe в downloads/");
    } else {
      console.warn("      положите DoubleMarkSetup-<version>*.exe в public/downloads/");
    }
  }
}

main();
