import { resolvePlanCheckout, type PlanId, type PlanTier } from "../content/pricing";
import { getSupabaseClient } from "./supabase/client";

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
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  devicesLimit: number;
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

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_ends_at: string | null;
  devices_limit: number | null;
  provider: string | null;
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  plan_id: string;
  amount: number;
  currency: string | null;
  status: PaymentStatus;
  provider: string | null;
  provider_payment_id: string | null;
  created_at: string;
};

type UserDeviceRow = {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string | null;
  platform: string | null;
  last_seen_at: string;
  created_at: string;
};

function toSubscription(row: SubscriptionRow): SubscriptionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    planId: row.plan_id,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    trialEndsAt: row.trial_ends_at,
    devicesLimit: row.devices_limit ?? 1,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    userId: row.user_id,
    subscriptionId: row.subscription_id,
    planId: row.plan_id,
    amount: row.amount,
    currency: row.currency ?? "RUB",
    status: row.status,
    provider: row.provider,
    providerPaymentId: row.provider_payment_id,
    createdAt: row.created_at,
  };
}

function toDevice(row: UserDeviceRow): UserDeviceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    deviceName: row.device_name,
    platform: row.platform,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
  };
}

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
  const { data, error } = await getSupabaseClient()
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? toSubscription(data as SubscriptionRow) : null;
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  return isSubscriptionActive(await getCurrentSubscription(userId));
}

export async function getUserPayments(userId: string): Promise<PaymentRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as PaymentRow[]).map(toPayment);
}

export async function getUserDevices(userId: string): Promise<UserDeviceRecord[]> {
  const { data, error } = await getSupabaseClient()
    .from("user_devices")
    .select("*")
    .eq("user_id", userId)
    .order("last_seen_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as UserDeviceRow[]).map(toDevice);
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

  const resolved = resolvePlanCheckout(planId);
  if (!resolved) {
    throw new Error("Unknown plan");
  }

  // TODO: В продакшене заменить на YooKassa/CloudPayments webhook. Не активировать подписку только с frontend.
  const { data, error } = await getSupabaseClient().rpc("process_sandbox_checkout", {
    p_plan_id: planId,
    p_amount: resolved.priceRub,
    p_status: outcome,
    p_period_days: resolved.period === "yearly" ? 365 : 30,
    p_devices_limit: getDevicesLimitForPlan(planId),
  });

  if (error) {
    throw new Error(error.message);
  }

  return toPayment(data as PaymentRow);
}

export async function upsertUserDevice(input: {
  userId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
}): Promise<UserDeviceRecord> {
  // Desktop and mobile apps can use this with the same Supabase user_id after login.
  const { data, error } = await getSupabaseClient()
    .from("user_devices")
    .upsert(
      {
        user_id: input.userId,
        device_id: input.deviceId,
        device_name: input.deviceName ?? null,
        platform: input.platform ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "user_id,device_id" },
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return toDevice(data as UserDeviceRow);
}
