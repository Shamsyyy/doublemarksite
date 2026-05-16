import { resolvePlanCheckout, type PlanId } from "../content/pricing";
import { createId } from "./crypto";
import { grantLicense } from "./licenses";
import { readJson, writeJson } from "./storage";

const PAYMENTS_KEY = "dms_payments";
const CHECKOUTS_KEY = "dms_checkouts";

export type PaymentStatus = "pending" | "succeeded" | "failed";

export type PaymentRecord = {
  id: string;
  checkoutId: string;
  userId: string;
  planId: PlanId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: "sandbox";
  createdAt: string;
};

export type CheckoutSession = {
  id: string;
  userId: string;
  planId: PlanId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
};

type PaymentOutcome = "succeeded" | "failed";

function loadPayments(): PaymentRecord[] {
  return readJson<PaymentRecord[]>(PAYMENTS_KEY, []);
}

function savePayments(items: PaymentRecord[]): void {
  writeJson(PAYMENTS_KEY, items);
}

function loadCheckouts(): CheckoutSession[] {
  return readJson<CheckoutSession[]>(CHECKOUTS_KEY, []);
}

function saveCheckouts(items: CheckoutSession[]): void {
  writeJson(CHECKOUTS_KEY, items);
}

export function createCheckout(userId: string, planId: PlanId): CheckoutSession {
  const resolved = resolvePlanCheckout(planId);
  if (!resolved) {
    throw new Error("Unknown plan");
  }

  const checkout: CheckoutSession = {
    id: createId("chk"),
    userId,
    planId,
    amount: resolved.priceRub,
    currency: "RUB",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const checkouts = loadCheckouts();
  checkouts.push(checkout);
  saveCheckouts(checkouts);
  return checkout;
}

export function getOrCreatePendingCheckout(
  userId: string,
  planId: PlanId,
): CheckoutSession {
  const existing = loadCheckouts()
    .slice()
    .reverse()
    .find((checkout) => {
      return (
        checkout.userId === userId &&
        checkout.planId === planId &&
        checkout.status === "pending"
      );
    });
  if (existing) {
    return existing;
  }
  return createCheckout(userId, planId);
}

export function getCheckout(checkoutId: string): CheckoutSession | undefined {
  return loadCheckouts().find((c) => c.id === checkoutId);
}

function paymentsForCheckout(
  payments: PaymentRecord[],
  checkoutId: string,
): PaymentRecord[] {
  return payments.filter((p) => p.checkoutId === checkoutId);
}

export function processSandboxPayment(
  checkoutId: string,
  outcome: PaymentOutcome,
): PaymentRecord {
  const checkouts = loadCheckouts();
  const checkout = checkouts.find((c) => c.id === checkoutId);
  if (!checkout) {
    throw new Error("Checkout not found");
  }

  const payments = loadPayments();
  const existingForCheckout = paymentsForCheckout(payments, checkoutId);

  if (checkout.status === "succeeded") {
    const succeeded = existingForCheckout.find((p) => p.status === "succeeded");
    if (succeeded) {
      return succeeded;
    }
  }

  if (checkout.status === "failed" && outcome === "failed") {
    const failed = existingForCheckout.find((p) => p.status === "failed");
    if (failed) {
      return failed;
    }
  }

  checkout.status = outcome;
  saveCheckouts(checkouts);

  const payment: PaymentRecord = {
    id: createId("pay"),
    checkoutId: checkout.id,
    userId: checkout.userId,
    planId: checkout.planId,
    amount: checkout.amount,
    currency: checkout.currency,
    status: outcome,
    provider: "sandbox",
    createdAt: new Date().toISOString(),
  };

  payments.push(payment);
  savePayments(payments);

  if (outcome === "succeeded") {
    grantLicense(checkout.userId, checkout.planId);
  }

  return payment;
}

export function getPaymentsForUser(userId: string): PaymentRecord[] {
  return loadPayments().filter((p) => p.userId === userId);
}
