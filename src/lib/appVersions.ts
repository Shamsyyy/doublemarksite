export type AppVersionType = "latest" | "archive";

export type AppVersion = {
  version: string;
  releaseDate: string;
  title: string;
  type: AppVersionType;
  recommended: boolean;
  mandatory: boolean;
  installerUrl: string;
  sha256: string;
  notes: string[];
};

export type VersionsManifest = {
  latest: string;
  versions: AppVersion[];
};

export type UpdateManifest = {
  version: string;
  releaseDate: string;
  mandatory: boolean;
  title: string;
  notes: string[];
  installerUrl: string;
  sha256: string;
  minSupportedVersion: string;
};

function manifestUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  return new URL(path, `${origin}${base}`).href;
}

const VERSIONS_URL = manifestUrl("updates/versions.json");
const UPDATE_URL = manifestUrl("updates/update.json");

function resolveInstallerUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("/")) {
    return `${window.location.origin}${url}`;
  }
  return new URL(url, window.location.href).toString();
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${url}`);
  }
  return (await response.json()) as T;
}

export async function loadVersionsManifest(): Promise<VersionsManifest> {
  return fetchJson<VersionsManifest>(VERSIONS_URL);
}

export async function loadUpdateManifest(): Promise<UpdateManifest> {
  return fetchJson<UpdateManifest>(UPDATE_URL);
}

export async function getLatestVersion(): Promise<AppVersion | null> {
  const manifest = await loadVersionsManifest();
  return (
    manifest.versions.find((entry) => entry.version === manifest.latest) ??
    manifest.versions.find((entry) => entry.type === "latest") ??
    null
  );
}

export async function getAllVersions(): Promise<AppVersion[]> {
  const manifest = await loadVersionsManifest();
  return [...manifest.versions].sort((a, b) =>
    b.version.localeCompare(a.version, undefined, { numeric: true }),
  );
}

export async function getArchivedVersions(): Promise<AppVersion[]> {
  const manifest = await loadVersionsManifest();
  return manifest.versions.filter((entry) => entry.type === "archive");
}

export function getInstallerDownloadUrl(version: AppVersion): string {
  return resolveInstallerUrl(version.installerUrl);
}

export function isSha256Placeholder(sha256: string): boolean {
  return !sha256 || sha256 === "PUT_SHA256_HASH_HERE";
}
