import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getArchivedVersions,
  getInstallerDownloadUrl,
  getLatestVersion,
  isSha256Placeholder,
  loadVersionsManifest,
} from "./appVersions";

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
      installerUrl: "/doublemarksite/downloads/DoubleMarkSetup-2.1.1.exe",
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
      installerUrl: "/doublemarksite/downloads/archive/DoubleMarkSetup-2.1.0.exe",
      sha256: "def456",
      notes: ["old"],
    },
  ],
};

describe("appVersions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads versions manifest", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => sampleManifest,
    } as Response);

    const manifest = await loadVersionsManifest();
    expect(manifest.latest).toBe("2.1.1");
    expect(manifest.versions).toHaveLength(2);
  });

  it("returns latest version", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => sampleManifest,
    } as Response);

    const latest = await getLatestVersion();
    expect(latest?.version).toBe("2.1.1");
  });

  it("returns archived versions only", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => sampleManifest,
    } as Response);

    const archived = await getArchivedVersions();
    expect(archived).toHaveLength(1);
    expect(archived[0].version).toBe("2.1.0");
  });

  it("detects sha256 placeholder", () => {
    expect(isSha256Placeholder("PUT_SHA256_HASH_HERE")).toBe(true);
    expect(isSha256Placeholder("abc")).toBe(false);
  });

  it("builds absolute installer url", () => {
    const url = getInstallerDownloadUrl(sampleManifest.versions[0]);
    expect(url).toContain("/doublemarksite/downloads/DoubleMarkSetup-2.1.1.exe");
  });
});
