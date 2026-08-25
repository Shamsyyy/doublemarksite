import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getArchivedVersions,
  getInstallerDownloadUrl,
  getInstallerFileName,
  getLatestVersion,
  isSha256Placeholder,
  loadVersionsManifest,
} from "./appVersions";
import { clearDownloadsManifestCache } from "./installerFiles";

const sampleManifest = {
  latest: "2.1.1",
  versions: [
    {
      version: "2.1.1",
      releaseDate: "2026-05-21",
      title: "DoubleMark 2.1.1",
      type: "latest" as const,
      recommended: true,
      mandatory: false,
      installerUrl: "https://doublemark.ru/downloads/DoubleMarkSetup-2.1.1.exe",
      sha256: "abc123",
      notes: ["note1"],
    },
    {
      version: "2.1.0",
      releaseDate: "2026-05-18",
      title: "DoubleMark 2.1.0",
      type: "archive" as const,
      recommended: false,
      mandatory: false,
      installerUrl: "https://doublemark.ru/downloads/archive/DoubleMarkSetup-2.1.0.exe",
      sha256: "def456",
      notes: ["old"],
    },
  ],
};

const downloadsManifest = {
  generatedAt: "2026-05-21T00:00:00.000Z",
  prefix: "DoubleMarkSetup",
  productionBaseUrl: "https://doublemark.ru/",
  current: {
    "2.1.1": {
      version: "2.1.1",
      fileName: "DoubleMarkSetup-2.1.1-20260521-124531.exe",
      relativePath: "downloads/DoubleMarkSetup-2.1.1-20260521-124531.exe",
      sha256: "abc123",
    },
  },
  archive: {
    "2.1.0": {
      version: "2.1.0",
      fileName: "DoubleMarkSetup-2.1.0-old.exe",
      relativePath: "downloads/archive/DoubleMarkSetup-2.1.0-old.exe",
      sha256: "def456",
    },
  },
};

describe("appVersions", () => {
  beforeEach(() => {
    clearDownloadsManifestCache();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("downloads/manifest.json")) {
          return { ok: true, json: async () => downloadsManifest } as Response;
        }
        if (url.includes("versions.json")) {
          return { ok: true, json: async () => sampleManifest } as Response;
        }
        return { ok: false, status: 404 } as Response;
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearDownloadsManifestCache();
  });

  it("loads versions manifest", async () => {
    const manifest = await loadVersionsManifest();
    expect(manifest.latest).toBe("2.1.1");
    expect(manifest.versions).toHaveLength(2);
  });

  it("returns latest version", async () => {
    const latest = await getLatestVersion();
    expect(latest?.version).toBe("2.1.1");
  });

  it("returns archived versions only", async () => {
    const archived = await getArchivedVersions();
    expect(archived).toHaveLength(1);
    expect(archived[0].version).toBe("2.1.0");
  });

  it("detects sha256 placeholder", () => {
    expect(isSha256Placeholder("PUT_SHA256_HASH_HERE")).toBe(true);
    expect(isSha256Placeholder("abc")).toBe(false);
  });

  it("resolves installer url by prefix from downloads manifest", async () => {
    const url = await getInstallerDownloadUrl(sampleManifest.versions[0]);
    expect(url).toContain("DoubleMarkSetup-2.1.1-20260521-124531.exe");
    const fileName = getInstallerFileName(sampleManifest.versions[0], url);
    expect(fileName).toBe("DoubleMarkSetup-2.1.1-20260521-124531.exe");
  });
});
