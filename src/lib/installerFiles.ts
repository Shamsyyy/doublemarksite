export const INSTALLER_FILE_PREFIX = "DoubleMarkSetup";

export type DownloadFileEntry = {
  version: string;
  fileName: string;
  relativePath: string;
  sha256: string;
};

export type DownloadsManifest = {
  generatedAt: string | null;
  prefix: string;
  productionBaseUrl: string;
  current: Record<string, DownloadFileEntry>;
  archive: Record<string, DownloadFileEntry>;
};

export function installerFilePrefix(version: string): string {
  return `${INSTALLER_FILE_PREFIX}-${version}`;
}

function manifestUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return new URL(path, `${origin}${base}`).href;
}

const DOWNLOADS_MANIFEST_URL = manifestUrl("downloads/manifest.json");

let cachedManifest: DownloadsManifest | null = null;

export async function loadDownloadsManifest(): Promise<DownloadsManifest | null> {
  if (cachedManifest) {
    return cachedManifest;
  }
  try {
    const response = await fetch(DOWNLOADS_MANIFEST_URL, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    cachedManifest = (await response.json()) as DownloadsManifest;
    return cachedManifest;
  } catch {
    return null;
  }
}

export function clearDownloadsManifestCache(): void {
  cachedManifest = null;
}

export function resolveInstallerRelativePath(
  version: string,
  type: "latest" | "archive",
  manifest: DownloadsManifest | null,
): string | null {
  const scope = type === "archive" ? "archive" : "current";
  const entry = manifest?.[scope]?.[version];
  if (entry?.relativePath) {
    return entry.relativePath;
  }
  return null;
}

export function toAbsoluteInstallerUrl(relativeOrAbsolute: string): string {
  if (relativeOrAbsolute.startsWith("http://") || relativeOrAbsolute.startsWith("https://")) {
    return relativeOrAbsolute;
  }
  const base = import.meta.env.BASE_URL || "/";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const path = relativeOrAbsolute.startsWith("downloads/")
    ? relativeOrAbsolute
    : `downloads/${relativeOrAbsolute}`;
  return new URL(path, `${origin}${base}`).href;
}

export function fallbackInstallerRelativePath(version: string, type: "latest" | "archive"): string {
  const fileName = `${installerFilePrefix(version)}.exe`;
  return type === "archive" ? `downloads/archive/${fileName}` : `downloads/${fileName}`;
}
