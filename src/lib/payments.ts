import type { PlanId } from "../content/pricing";
import {
  getUserPayments,
  processSandboxCheckout,
  type PaymentRecord,
  type PaymentStatus,
} from "./subscriptions";

export type { PaymentRecord, PaymentStatus };

export function getPaymentsForUser(userId: string): Promise<PaymentRecord[]> {
  return getUserPayments(userId);
}

export function processSandboxPayment(
  userId: string,
  planId: PlanId,
  outcome: "succeeded" | "failed",
): Promise<PaymentRecord> {
  return processSandboxCheckout(userId, planId, outcome);
}
