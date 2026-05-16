import { describe, expect, it } from "vitest";
import { register, login } from "./auth";
import {
  processSandboxPayment,
  getPaymentsForUser,
} from "./payments";
import { hasActiveLicense } from "./licenses";
import { getCurrentSubscription, getUserDevices, upsertUserDevice } from "./subscriptions";

describe("payments", () => {
  it("activates subscription only after successful sandbox payment", async () => {
    await register({
      email: "pay@example.com",
      password: "secure-pass-123",
      companyName: "ООО Оплата",
      inn: "7707083893",
      phone: "",
      consent: true,
    });
    const session = await login({
      email: "pay@example.com",
      password: "secure-pass-123",
    });

    expect(await hasActiveLicense(session.user.id)).toBe(false);

    const failed = await processSandboxPayment(session.user.id, "standard-monthly", "failed");
    expect(failed.status).toBe("failed");
    expect(await hasActiveLicense(session.user.id)).toBe(false);

    const paid = await processSandboxPayment(session.user.id, "standard-monthly", "succeeded");
    expect(paid.status).toBe("succeeded");
    expect(await hasActiveLicense(session.user.id)).toBe(true);

    const history = await getPaymentsForUser(session.user.id);
    expect(history).toHaveLength(2);
  });

  it("updates the current subscription on another successful sandbox payment", async () => {
    await register({
      email: "idem@example.com",
      password: "secure-pass-123",
      companyName: "ООО Идемпотент",
      inn: "7707083893",
      phone: "",
      consent: true,
    });
    const session = await login({
      email: "idem@example.com",
      password: "secure-pass-123",
    });

    const first = await processSandboxPayment(session.user.id, "standard-monthly", "succeeded");
    const second = await processSandboxPayment(session.user.id, "elite-yearly", "succeeded");

    expect(second.id).not.toBe(first.id);
    expect(await hasActiveLicense(session.user.id)).toBe(true);

    const subscription = await getCurrentSubscription(session.user.id);
    expect(subscription?.planId).toBe("elite-yearly");
    expect(subscription?.devicesLimit).toBe(10);
    expect(await getPaymentsForUser(session.user.id)).toHaveLength(2);
  });

  it("tracks devices by user and device id for future apps", async () => {
    await register({
      email: "device@example.com",
      password: "secure-pass-123",
      companyName: "ООО Устройства",
      inn: "7707083893",
      phone: "",
      consent: true,
    });
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
