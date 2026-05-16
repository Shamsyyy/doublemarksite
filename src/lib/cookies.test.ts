import { describe, expect, it } from "vitest";
import { getCookieConsent, hasCookieDecision, saveCookieConsent } from "./cookies";

describe("cookies", () => {
  it("stores and reads valid consent", () => {
    saveCookieConsent(true, false);
    const consent = getCookieConsent();
    expect(consent).not.toBeNull();
    expect(consent?.necessary).toBe(true);
    expect(consent?.analytics).toBe(true);
    expect(hasCookieDecision()).toBe(true);
  });

  it("clears malformed consent payload", () => {
    localStorage.setItem("dms_cookie_consent", JSON.stringify({ foo: "bar" }));
    expect(getCookieConsent()).toBeNull();
    expect(localStorage.getItem("dms_cookie_consent")).toBeNull();
    expect(hasCookieDecision()).toBe(false);
  });
});
