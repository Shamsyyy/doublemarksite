const CONSENT_KEY = "dms_cookie_consent";

export type CookieConsent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

function isCookieConsent(value: unknown): value is CookieConsent {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const decidedAtMs = Date.parse(String(candidate.decidedAt ?? ""));
  return (
    candidate.necessary === true &&
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    Number.isFinite(decidedAtMs)
  );
}

export function getCookieConsent(): CookieConsent | null {
  const raw = localStorage.getItem(CONSENT_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isCookieConsent(parsed)) {
      localStorage.removeItem(CONSENT_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(CONSENT_KEY);
    return null;
  }
}

export function saveCookieConsent(
  analytics: boolean,
  marketing: boolean,
): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    analytics,
    marketing,
    decidedAt: new Date().toISOString(),
  };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

export function hasCookieDecision(): boolean {
  return getCookieConsent() !== null;
}
