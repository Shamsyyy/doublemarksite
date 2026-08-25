import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { CONSENT_VERSION } from "../config/legal";
import { getCookieConsent, hasCookieDecision } from "../lib/consent";

const ANALYTICS_HOST = /google-analytics|googletagmanager|mc\.yandex|metrika|facebook|hotjar|clarity/i;

function analyticsCalls(): unknown[] {
  const fetchMock = fetch as unknown as { mock?: { calls: unknown[][] } };
  return (fetchMock.mock?.calls ?? []).filter((call) => ANALYTICS_HOST.test(String(call[0])));
}

describe("cookie consent UX", () => {
  it("does not send analytics requests for a new visitor", () => {
    render(<App />);
    expect(screen.getByRole("region", { name: /файлы cookie/i })).toBeInTheDocument();
    expect(analyticsCalls()).toHaveLength(0);
    expect(hasCookieDecision()).toBe(false);
  });

  it("keeps analytics off after rejecting optional cookies and reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: "Отклонить необязательные" }));
    expect(getCookieConsent()?.analytics).toBe(false);
    unmount();
    render(<App />);
    expect(screen.queryByRole("region", { name: /файлы cookie/i })).not.toBeInTheDocument();
    expect(analyticsCalls()).toHaveLength(0);
  });

  it("records accept without loading a third-party analytics script", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Принять" }));
    expect(getCookieConsent()?.analytics).toBe(true);
    expect(analyticsCalls()).toHaveLength(0);
    expect(document.querySelector('script[src*="google-analytics"]')).toBeNull();
  });

  it("disables analytics from cookie settings and keeps it off after remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await user.click(screen.getByRole("button", { name: "Принять" }));
    await user.click(screen.getByRole("button", { name: "Настройки cookie" }));
    const dialog = screen.getByRole("dialog", { name: "Настройки cookie" });
    const analytics = within(dialog).getByRole("checkbox", { name: /аналитика/i });
    if ((analytics as HTMLInputElement).checked) {
      await user.click(analytics);
    }
    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));
    expect(getCookieConsent()?.analytics).toBe(false);
    unmount();
    render(<App />);
    expect(analyticsCalls()).toHaveLength(0);
  });

  it("keeps consent when navigating between pages", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Отклонить необязательные" }));
    await user.click(screen.getAllByRole("link", { name: "Тарифы" })[0]);
    expect(await screen.findByRole("heading", { name: "Тарифы" })).toBeInTheDocument();
    expect(getCookieConsent()?.version).toBe(CONSENT_VERSION);
    expect(screen.queryByRole("region", { name: /файлы cookie/i })).not.toBeInTheDocument();
  });

  it("asks again when CONSENT_VERSION no longer matches stored consent", () => {
    localStorage.setItem(
      "cookie_consent",
      JSON.stringify({
        id: "stale",
        version: "2000-01-01.0",
        timestamp: new Date().toISOString(),
        necessary: true,
        analytics: true,
        functional: false,
        marketing: false,
      }),
    );
    render(<App />);
    expect(screen.getByRole("region", { name: /файлы cookie/i })).toBeInTheDocument();
  });

  it("has no pre-consent third-party analytics request", () => {
    render(<App />);
    expect(analyticsCalls()).toHaveLength(0);
  });

  it("does not pre-check personal data consent on registration", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("link", { name: "Регистрация" }));
    const pd = screen.getByRole("checkbox", { name: /согласие на обработку персональных данных/i });
    const offer = screen.getByRole("checkbox", { name: /публичную оферту/i });
    expect(pd).not.toBeChecked();
    expect(offer).not.toBeChecked();
  });

  it("exposes privacy and cookie links in the footer", () => {
    render(<App />);
    expect(
      screen.getByRole("link", { name: "Политика обработки персональных данных" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Политика использования cookie" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Настройки cookie" })).toBeInTheDocument();
  });

  it("lets the keyboard reach cookie banner actions", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.tab();
    await user.tab();
    const accept = screen.getByRole("button", { name: "Принять" });
    const reject = screen.getByRole("button", { name: "Отклонить необязательные" });
    const settings = screen.getByRole("button", { name: "Настроить" });
    expect(accept).toBeEnabled();
    expect(reject).toBeEnabled();
    expect(settings).toBeEnabled();
    settings.focus();
    expect(settings).toHaveFocus();
  });
});
