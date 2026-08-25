import { describe, expect, it } from "vitest";
import {
  confirmEmail,
  getCurrentUser,
  login,
  register,
  logout,
  requestPasswordReset,
  updatePassword,
} from "./auth";

describe("auth", () => {
  it("requires email confirmation before login", async () => {
    const result = await register({
      email: "owner@example.com",
      password: "secure-pass-123",
      companyName: "ООО Пример",
      inn: "7707083893",
      phone: "+79001234567",
      consent: true,
      acceptOffer: true,
    });
    expect(result.needsEmailConfirmation).toBe(true);

    await expect(
      login({
        email: "owner@example.com",
        password: "secure-pass-123",
      }),
    ).rejects.toThrow(/подтвердите email/i);

    await confirmEmail("confirm:owner@example.com");

    const session = await login({
      email: "owner@example.com",
      password: "secure-pass-123",
    });
    expect(session.user.email).toBe("owner@example.com");

    const current = await getCurrentUser();
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
      acceptOffer: true,
    });

    await expect(
      register({
        email: "dup@example.com",
        password: "secure-pass-123",
        companyName: "ООО Дубль 2",
        inn: "",
        phone: "",
        consent: true,
        acceptOffer: true,
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it("does not use the old browser session storage", async () => {
    await register({
      email: "session@example.com",
      password: "secure-pass-123",
      companyName: "ООО Сессия",
      inn: "",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:session@example.com");
    await login({
      email: "session@example.com",
      password: "secure-pass-123",
    });

    const raw = sessionStorage.getItem("dms_session");
    expect(raw).toBeNull();
  });

  it("clears session on logout", async () => {
    await register({
      email: "logout@example.com",
      password: "secure-pass-123",
      companyName: "ООО Выход",
      inn: "",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:logout@example.com");
    await login({ email: "logout@example.com", password: "secure-pass-123" });
    await logout();
    expect(await getCurrentUser()).toBeNull();
  });

  it("sends password-reset request and updates password by token", async () => {
    await register({
      email: "reset@example.com",
      password: "secure-pass-123",
      companyName: "ООО Сброс",
      inn: "",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:reset@example.com");

    const result = await requestPasswordReset("reset@example.com");
    expect(result.ok).toBe(true);
    expect(result.message).toMatch(/если аккаунт/i);

    const message = await updatePassword("reset:reset@example.com", "new-pass-456");
    expect(message).toMatch(/пароль обновлён/i);

    const session = await login({
      email: "reset@example.com",
      password: "new-pass-456",
    });
    expect(session.user.email).toBe("reset@example.com");
  });
});
