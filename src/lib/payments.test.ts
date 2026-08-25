import { describe, expect, it } from "vitest";
import { confirmEmail, register, login } from "./auth";
import { processSandboxPayment, getPaymentsForUser } from "./payments";
import { hasActiveLicense } from "./licenses";
import { getCurrentSubscription, getUserDevices, upsertUserDevice } from "./subscriptions";

describe("payments", () => {
  it("starts with trial subscription and activates plan via sandbox checkout", async () => {
    await register({
      email: "pay@example.com",
      password: "secure-pass-123",
      companyName: "ООО Оплата",
      inn: "7707083893",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:pay@example.com");
    const session = await login({
      email: "pay@example.com",
      password: "secure-pass-123",
    });

    expect(await hasActiveLicense(session.user.id)).toBe(true);
    const before = await getCurrentSubscription(session.user.id);
    expect(before?.planId).toBe("base-monthly");
    expect(before?.status).toBe("trialing");

    const failed = await processSandboxPayment(session.user.id, "standard-monthly", "failed");
    expect(failed.status).toBe("failed");

    const paid = await processSandboxPayment(session.user.id, "standard-monthly", "succeeded");
    expect(paid.status).toBe("succeeded");
    expect(await getPaymentsForUser(session.user.id)).toHaveLength(1);

    const after = await getCurrentSubscription(session.user.id);
    expect(after?.planId).toBe("standard-monthly");
    expect(after?.status).toBe("active");
    expect(after?.devicesLimit).toBe(3);
  });

  it("upgrades plan idempotently through checkout", async () => {
    await register({
      email: "idem@example.com",
      password: "secure-pass-123",
      companyName: "ООО Идемпотент",
      inn: "7707083893",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:idem@example.com");
    const session = await login({
      email: "idem@example.com",
      password: "secure-pass-123",
    });

    await processSandboxPayment(session.user.id, "elite-yearly", "succeeded");
    const subscription = await getCurrentSubscription(session.user.id);
    expect(subscription?.planId).toBe("elite-yearly");
    expect(subscription?.devicesLimit).toBe(10);
    expect(await hasActiveLicense(session.user.id)).toBe(true);
  });

  it("tracks devices by user and device id", async () => {
    await register({
      email: "device@example.com",
      password: "secure-pass-123",
      companyName: "ООО Устройства",
      inn: "7707083893",
      phone: "",
      consent: true,
      acceptOffer: true,
    });
    await confirmEmail("confirm:device@example.com");
    const session = await login({
      email: "device@example.com",
      password: "secure-pass-123",
    });

    await upsertUserDevice({
      userId: session.user.id,
      deviceId: "desktop-1",
      deviceName: "Office PC",
      platform: "windows",
    });
    await upsertUserDevice({
      userId: session.user.id,
      deviceId: "desktop-1",
      deviceName: "Office PC",
      platform: "windows",
    });

    const devices = await getUserDevices(session.user.id);
    expect(devices).toHaveLength(1);
    expect(devices[0].platform).toBe("windows");
  });
});
