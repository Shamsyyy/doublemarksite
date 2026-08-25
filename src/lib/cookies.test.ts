import { describe, expect, it } from "vitest";
import { CONSENT_VERSION } from "../config/legal";
import {
  getCookieConsent,
  hasCookieDecision,
  rejectOptionalCookies,
  saveCookieConsent,
} from "./consent";

describe("cookie consent storage", () => {
  it("stores versioned consent without extra personal data", () => {
    const consent = saveCookieConsent({
      analytics: true,
      functional: false,
      marketing: false,
      action: "grant",
    });
    expect(consent.version).toBe(CONSENT_VERSION);
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(hasCookieDecision()).toBe(true);
    expect(JSON.stringify(consent)).not.toMatch(/@/);
  });

  it("treats an old consent version as missing", () => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        id: "old",
        version: "1999-01-01.0",
        timestamp: new Date().toISOString(),
        necessary: true,
        analytics: true,
        functional: false,
        marketing: false,
      }),
    );
    expect(getCookieConsent()).toBeNull();
    expect(hasCookieDecision()).toBe(false);
  });

  it("can reject optional categories after accept", () => {
    saveCookieConsent({
      analytics: true,
      functional: true,
      marketing: true,
      action: "grant",
    });
    const next = rejectOptionalCookies();
    expect(next.analytics).toBe(false);
    expect(next.functional).toBe(false);
    expect(next.marketing).toBe(false);
  });
});
