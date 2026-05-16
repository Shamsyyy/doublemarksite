import { describe, expect, it } from "vitest";
import {
  getCurrentUser,
  login,
  register,
  logout,
  updatePassword,
} from "./auth";

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

  it("does not use the old browser session storage", async () => {
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
    });
    await login({ email: "logout@example.com", password: "secure-pass-123" });
    await logout();
    expect(await getCurrentUser()).toBeNull();
  });

  it("updates password for the current recovery session", async () => {
    await register({
      email: "reset@example.com",
      password: "secure-pass-123",
      companyName: "ООО Сброс",
      inn: "",
      phone: "",
      consent: true,
    });

    await updatePassword("new-secure-pass-123");
    await logout();

    const session = await login({
      email: "reset@example.com",
      password: "new-secure-pass-123",
    });
    expect(session.user.email).toBe("reset@example.com");
  });
});
