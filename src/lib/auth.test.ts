import { describe, expect, it } from "vitest";
import { getCurrentUser, login, register, logout } from "./auth";

describe("auth", () => {
  it("registers and logs in user", async () => {
    await register({
      email: "owner@example.com",
      password: "secure-pass-123",
      companyName: "ООО Пример",
      inn: "7707083893",
      phone: "+79001234567",
      consent: true,
    });

    const session = await login({
      email: "owner@example.com",
      password: "secure-pass-123",
    });
    expect(session.user.email).toBe("owner@example.com");

    const current = getCurrentUser();
    expect(current?.companyName).toBe("ООО Пример");
  });

  it("rejects duplicate registration", async () => {
    await register({
      email: "dup@example.com",
      password: "secure-pass-123",
      companyName: "ООО Дубль",
      inn: "",
      phone: "",
      consent: true,
    });

    await expect(
      register({
        email: "dup@example.com",
        password: "secure-pass-123",
        companyName: "ООО Дубль 2",
        inn: "",
        phone: "",
        consent: true,
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it("does not store password secrets in sessionStorage", async () => {
    await register({
      email: "session@example.com",
      password: "secure-pass-123",
      companyName: "ООО Сессия",
      inn: "",
      phone: "",
      consent: true,
    });
    await login({
      email: "session@example.com",
      password: "secure-pass-123",
    });

    const raw = sessionStorage.getItem("dms_session");
    expect(raw).toBeTruthy();
    expect(raw).not.toContain("passwordHash");
    expect(raw).not.toContain("salt");

    const session = JSON.parse(raw!) as { user: Record<string, unknown> };
    expect(session.user).not.toHaveProperty("passwordHash");
    expect(session.user).not.toHaveProperty("salt");
  });

  it("clears session on logout", async () => {
    await register({
      email: "logout@example.com",
      password: "secure-pass-123",
      companyName: "ООО Выход",
      inn: "",
      phone: "",
      consent: true,
    });
    await login({ email: "logout@example.com", password: "secure-pass-123" });
    logout();
    expect(getCurrentUser()).toBeNull();
  });

  it("removes malformed session payload", () => {
    sessionStorage.setItem("dms_session", "{not-json");
    expect(getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem("dms_session")).toBeNull();
  });
});
