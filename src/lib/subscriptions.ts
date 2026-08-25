import { resolvePlanCheckout, type PlanId, type PlanTier } from "../content/pricing";
import {
  localGetCurrentSubscription,
  localGetUserDevices,
  localGetUserPayments,
  localHasActiveSubscription,
  localProcessSandboxCheckout,
  localUpsertUserDevice,
} from "./api/localAuth";

export type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type SubscriptionRecord = {
  id: string;
  userId: string;
  orgId?: string | null;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  devicesLimit: number;
  activeDeviceCount?: number;
  provider: string | null;
  providerSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  planId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string | null;
  providerPaymentId: string | null;
  createdAt: string;
};

export type UserDeviceRecord = {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  platform: string | null;
  lastSeenAt: string;
  createdAt: string;
};

export function isSubscriptionActive(subscription: SubscriptionRecord | null): boolean {
  if (!subscription) {
    return false;
  }

  const now = Date.now();
  if (
    subscription.status === "active" &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() > now
  ) {
    return true;
  }

  return (
    subscription.status === "trialing" &&
    Boolean(subscription.trialEndsAt) &&
    new Date(subscription.trialEndsAt!).getTime() > now
  );
}

export async function getCurrentSubscription(
  userId: string,
): Promise<SubscriptionRecord | null> {
  void userId;
  return localGetCurrentSubscription();
}

export function hasActiveSubscription(userId: string): Promise<boolean> {
  return localHasActiveSubscription(userId);
}

export function getUserPayments(userId: string): Promise<PaymentRecord[]> {
  return localGetUserPayments(userId);
}

export function getUserDevices(userId: string): Promise<UserDeviceRecord[]> {
  void userId;
  return localGetUserDevices();
}

export function getDevicesLimitForPlan(planId: PlanId): number {
  const tier = planId.split("-")[0] as PlanTier;
  if (tier === "elite") {
    return 10;
  }
  if (tier === "standard") {
    return 3;
  }
  return 1;
}

export async function processSandboxCheckout(
  userId: string,
  planId: PlanId,
  outcome: "succeeded" | "failed",
): Promise<PaymentRecord> {
  if (!userId) {
    throw new Error("Authentication required");
  }
  if (outcome !== "succeeded") {
    const resolved = resolvePlanCheckout(planId);
    return {
      id: crypto.randomUUID(),
      userId,
      subscriptionId: null,
      planId,
      amount: resolved?.priceRub ?? 0,
      currency: "RUB",
      status: "failed",
      provider: "local-api",
      providerPaymentId: null,
      createdAt: new Date().toISOString(),
    };
  }
  return localProcessSandboxCheckout(userId, planId);
}

export function upsertUserDevice(input: {
  userId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
}): Promise<UserDeviceRecord> {
  return localUpsertUserDevice(input);
}
