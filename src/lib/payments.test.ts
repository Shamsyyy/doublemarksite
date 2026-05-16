import { describe, expect, it } from "vitest";
import { register, login } from "./auth";
import {
  createCheckout,
  getOrCreatePendingCheckout,
  processSandboxPayment,
  getPaymentsForUser,
} from "./payments";
import { getEntitlements, hasActiveLicense } from "./licenses";

describe("payments", () => {
  it("grants license only after successful sandbox payment", async () => {
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

    expect(hasActiveLicense(session.user.id)).toBe(false);

    const checkout = createCheckout(session.user.id, "standard-monthly");
    const failed = processSandboxPayment(checkout.id, "failed");
    expect(failed.status).toBe("failed");
    expect(hasActiveLicense(session.user.id)).toBe(false);

    const paid = processSandboxPayment(checkout.id, "succeeded");
    expect(paid.status).toBe("succeeded");
    expect(hasActiveLicense(session.user.id)).toBe(true);

    const history = getPaymentsForUser(session.user.id);
    expect(history).toHaveLength(2);
  });

  it("does not double-grant license on duplicate succeeded processing", async () => {
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

    const checkout = createCheckout(session.user.id, "standard-monthly");
    const first = processSandboxPayment(checkout.id, "succeeded");
    const second = processSandboxPayment(checkout.id, "succeeded");

    expect(second.id).toBe(first.id);
    expect(hasActiveLicense(session.user.id)).toBe(true);

    const activeEntitlements = getEntitlements().filter(
      (e) => e.userId === session.user.id && e.status === "active",
    );
    expect(activeEntitlements).toHaveLength(1);
    expect(getPaymentsForUser(session.user.id)).toHaveLength(1);
  });

  it("reuses pending checkout for the same user and plan", async () => {
    await register({
      email: "pending@example.com",
      password: "secure-pass-123",
      companyName: "ООО Пендинг",
      inn: "7707083893",
      phone: "",
      consent: true,
    });
    const session = await login({
      email: "pending@example.com",
      password: "secure-pass-123",
    });

    const first = getOrCreatePendingCheckout(session.user.id, "base-monthly");
    const second = getOrCreatePendingCheckout(session.user.id, "base-monthly");
    expect(second.id).toBe(first.id);

    processSandboxPayment(first.id, "succeeded");
    const third = getOrCreatePendingCheckout(session.user.id, "base-monthly");
    expect(third.id).not.toBe(first.id);
  });
});
