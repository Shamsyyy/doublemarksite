import { CONSENT_VERSION } from "../config/legal";
import { apiRecordCookieConsent } from "./api/client";

export const COOKIE_CONSENT_STORAGE_KEY = "cookie_consent";
export const COOKIE_CONSENT_COOKIE_NAME = "cookie_consent";
const LEGACY_STORAGE_KEY = "dms_cookie_consent";
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentAction = "grant" | "update" | "revoke";

export type CookieConsent = {
  id: string;
  version: string;
  timestamp: string;
  necessary: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
};

export type CookieConsentInput = {
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  action: ConsentAction;
  existingId?: string;
};

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const timestampMs = Date.parse(String(candidate.timestamp ?? ""));
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    candidate.version === CONSENT_VERSION &&
    Number.isFinite(timestampMs) &&
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.functional === "boolean" &&
    typeof candidate.marketing === "boolean"
  );
}

function readRawConsent(): string | null {
  const fromStorage = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (fromStorage) {
    return fromStorage;
  }
  const fromCookie = readConsentCookie();
  if (fromCookie) {
    return fromCookie;
  }
  return localStorage.getItem(LEGACY_STORAGE_KEY);
}

function readConsentCookie(): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const prefix = `${COOKIE_CONSENT_COOKIE_NAME}=`;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  if (!match) {
    return null;
  }
  try {
    return decodeURIComponent(match.slice(prefix.length));
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: CookieConsent): void {
  if (typeof document === "undefined") {
    return;
  }
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = [
    `${COOKIE_CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}`,
    "Path=/",
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    secure,
  ]
    .filter(Boolean)
    .join("; ");
}

function persistConsent(consent: CookieConsent): void {
  localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  writeConsentCookie(consent);
}

export function getCookieConsent(): CookieConsent | null {
  const raw = readRawConsent();
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isCookieConsent(parsed)) {
      localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return null;
  }
}

export function hasCookieDecision(): boolean {
  return getCookieConsent() !== null;
}

export function saveCookieConsent(input: CookieConsentInput): CookieConsent {
  const consent: CookieConsent = {
    id: input.existingId ?? crypto.randomUUID(),
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    necessary: true,
    analytics: input.analytics,
    functional: input.functional,
    marketing: input.marketing,
  };
  persistConsent(consent);
  void apiRecordCookieConsent({
    consentId: consent.id,
    consentVersion: consent.version,
    timestamp: consent.timestamp,
    necessary: consent.necessary,
    analytics: consent.analytics,
    functional: consent.functional,
    marketing: consent.marketing,
    action: input.action,
  }).catch(() => undefined);
  return consent;
}

export function acceptAllCookies(): CookieConsent {
  const current = getCookieConsent();
  return saveCookieConsent({
    analytics: true,
    functional: true,
    marketing: true,
    action: current ? "update" : "grant",
    existingId: current?.id,
  });
}

export function rejectOptionalCookies(): CookieConsent {
  const current = getCookieConsent();
  const hadOptional = Boolean(current?.analytics || current?.functional || current?.marketing);
  return saveCookieConsent({
    analytics: false,
    functional: false,
    marketing: false,
    action: current && hadOptional ? "revoke" : current ? "update" : "grant",
    existingId: current?.id,
  });
}

export function applyConsentSideEffects(consent: CookieConsent | null): void {
  if (!consent || !consent.analytics) {
    clearKnownOptionalIdentifiers();
  }
}

function clearKnownOptionalIdentifiers(): void {
  // На сайте нет подключённых аналитических/маркетинговых идентификаторов.
}
