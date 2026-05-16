import { describe, expect, it } from "vitest";
import { login, register } from "./auth";
import { processSandboxPayment } from "./payments";
import { getAdminDashboardStats } from "./admin";

describe("admin dashboard", () => {
  it("returns aggregated stats for admin users", async () => {
    await register({
      email: "user@example.com",
      password: "secure-pass-123",
      companyName: "ООО Пользователь",
      inn: "",
      phone: "",
      consent: true,
    });
    const userSession = await login({
      email: "user@example.com",
      password: "secure-pass-123",
    });
    await processSandboxPayment(userSession.user.id, "standard-monthly", "succeeded");

    await register({
      email: "admin@example.com",
      password: "secure-pass-123",
      companyName: "ООО Админ",
      inn: "",
      phone: "",
      consent: true,
    });
    await login({
      email: "admin@example.com",
      password: "secure-pass-123",
    });

    const stats = await getAdminDashboardStats();

    expect(stats.totalUsers).toBe(2);
    expect(stats.activeSubscriptions).toBe(1);
    expect(stats.successfulPayments).toBe(1);
    expect(stats.revenueTotal).toBe(5000);
    expect(stats.recentUsers).toHaveLength(2);
    expect(stats.recentPayments).toHaveLength(1);
  });

  it("rejects non-admin users", async () => {
    await register({
      email: "regular@example.com",
      password: "secure-pass-123",
      companyName: "ООО Обычный",
      inn: "",
      phone: "",
      consent: true,
    });
    await login({
      email: "regular@example.com",
      password: "secure-pass-123",
    });

    await expect(getAdminDashboardStats()).rejects.toThrow(/admin access required/i);
  });
});
