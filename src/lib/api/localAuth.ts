import { PD_CONSENT_VERSION } from "../../config/legal";
import type {
  PublicUser,
  RegistrationResult,
  Session,
} from "../auth";
import type { RegistrationInput } from "../validation";
import { validateLogin, validateRegistration } from "../validation";
import {
  apiConfirmEmail,
  apiGetPayments,
  apiGetProfile,
  apiGetSubscription,
  apiLogin,
  apiLogout,
  apiRequestPasswordReset,
  apiRegister,
  apiResetPassword,
  apiBaseUrl,
  apiGetDevices,
  apiUpsertDevice,
  apiRevokeDevice,
  apiCreateCheckout,
  apiConfirmSandboxPayment,
  clearApiSession,
  loadApiSession,
  type ApiPayment,
  type ApiSubscription,
  type ApiCheckoutResponse,
} from "./client";
import type {
  PaymentRecord,
  PaymentStatus,
  SubscriptionRecord,
  SubscriptionStatus,
  UserDeviceRecord,
} from "../subscriptions";
import type { PlanId } from "../../content/pricing";
import { resolvePlanCheckout } from "../../content/pricing";

function toPublicUser(
  profile: {
    userId: string;
    email?: string | null;
    organization?: string | null;
    inn?: string | null;
    phone?: string | null;
    role?: string | null;
  },
  fallbackEmail?: string,
): PublicUser {
  return {
    id: profile.userId,
    email: profile.email ?? fallbackEmail ?? "",
    companyName: profile.organization ?? "",
    inn: profile.inn ?? "",
    phone: profile.phone ?? "",
    role: profile.role === "admin" ? "admin" : "user",
    createdAt: new Date().toISOString(),
  };
}

function toSubscription(row: ApiSubscription): SubscriptionRecord {
  return {
    id: row.id,
    userId: row.userId,
    orgId: row.orgId ?? null,
    planId: row.planId ?? "base-monthly",
    status: (row.status as SubscriptionStatus) || "active",
    currentPeriodStart: row.currentPeriodStart ?? null,
    currentPeriodEnd: row.currentPeriodEnd ?? null,
    trialEndsAt: row.trialEndsAt ?? null,
    devicesLimit: row.devicesLimit ?? 1,
    activeDeviceCount: row.activeDeviceCount ?? 0,
    provider: "local-api",
    providerSubscriptionId: row.providerSubscriptionId ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function toPayment(row: ApiPayment, userId: string): PaymentRecord {
  return {
    id: row.id,
    userId,
    subscriptionId: null,
    planId: row.planId ?? "",
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "RUB",
    status: (row.status as PaymentStatus) || "succeeded",
    provider: "local-api",
    providerPaymentId: null,
    createdAt: row.createdAt,
  };
}

export async function localRegister(
  input: RegistrationInput,
): Promise<RegistrationResult> {
  const validation = validateRegistration(input);
  if (!validation.ok) {
    throw new Error(`Invalid registration: ${validation.errors.join(", ")}`);
  }

  try {
    const result = await apiRegister({
      email: input.email,
      password: input.password,
      companyName: input.companyName,
      inn: input.inn,
      phone: input.phone,
      personalDataConsent: input.consent,
      personalDataConsentVersion:
        input.personalDataConsentVersion ?? PD_CONSENT_VERSION,
    });
    return {
      user: null,
      needsEmailConfirmation: result.needsEmailConfirmation,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("уже существует") || message.includes("409")) {
      throw new Error("User already exists");
    }
    if (
      error instanceof TypeError ||
      /failed to fetch|networkerror|load failed/i.test(message)
    ) {
      throw new Error(
        `Нет связи с API DoubleMark (${apiBaseUrl()}).`,
      );
    }
    throw error;
  }
}

export async function localLogin(input: {
  email: string;
  password: string;
}): Promise<Session> {
  const validation = validateLogin(input);
  if (!validation.ok) {
    throw new Error(`Invalid login: ${validation.errors.join(", ")}`);
  }

  try {
    const tokens = await apiLogin({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });
    const profile = await apiGetProfile();
    return {
      token: tokens.accessToken,
      user: toPublicUser(profile, tokens.email),
      expiresAt: tokens.expiresAtUtc,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      error instanceof TypeError ||
      /failed to fetch|networkerror|load failed/i.test(message)
    ) {
      throw new Error(
        `Нет связи с API DoubleMark (${apiBaseUrl()}).`,
      );
    }
    if (message.toLowerCase().includes("неверный") || message.includes("401")) {
      throw new Error("Неверный email или пароль.");
    }
    throw error;
  }
}

export async function localGetCurrentUser(): Promise<PublicUser | null> {
  const session = loadApiSession();
  if (!session?.accessToken) return null;
  try {
    const profile = await apiGetProfile();
    return toPublicUser(profile, session.email);
  } catch {
    clearApiSession();
    return null;
  }
}

export async function localLogout(): Promise<void> {
  await apiLogout();
}

export async function localRequestPasswordReset(email: string): Promise<{
  ok: true;
  message: string;
}> {
  return apiRequestPasswordReset(email);
}

export async function localConfirmEmail(token: string): Promise<Session> {
  try {
    const session = await apiConfirmEmail(token);
    const profile = await apiGetProfile();
    return {
      token: session.accessToken,
      user: toPublicUser(profile, session.email),
      expiresAt: session.expiresAtUtc,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      error instanceof TypeError ||
      /failed to fetch|networkerror|load failed/i.test(message)
    ) {
      throw new Error(`Нет связи с API DoubleMark (${apiBaseUrl()}).`);
    }
    throw error;
  }
}

export async function localUpdatePassword(token: string, password: string): Promise<string> {
  try {
    const result = await apiResetPassword(token, password);
    return result.message;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      error instanceof TypeError ||
      /failed to fetch|networkerror|load failed/i.test(message)
    ) {
      throw new Error(`Нет связи с API DoubleMark (${apiBaseUrl()}).`);
    }
    throw error;
  }
}

export async function localGetCurrentSubscription(): Promise<SubscriptionRecord | null> {
  const row = await apiGetSubscription();
  return row ? toSubscription(row) : null;
}

export async function localHasActiveSubscription(userId: string): Promise<boolean> {
  void userId;
  const sub = await localGetCurrentSubscription();
  if (!sub) return false;
  const now = Date.now();
  if (sub.status === "active" && sub.currentPeriodEnd) {
    return new Date(sub.currentPeriodEnd).getTime() > now;
  }
  if (sub.status === "trialing" && sub.trialEndsAt) {
    return new Date(sub.trialEndsAt).getTime() > now;
  }
  return sub.status === "active";
}

export async function localGetUserPayments(userId: string): Promise<PaymentRecord[]> {
  const rows = await apiGetPayments();
  return rows.map((row) => toPayment(row, userId));
}

/** Start billing checkout via API (Alpha Bank or sandbox confirm URL). */
export async function localStartCheckout(
  userId: string,
  planId: PlanId,
): Promise<ApiCheckoutResponse> {
  if (!userId) {
    throw new Error("Authentication required");
  }
  void resolvePlanCheckout(planId);
  return apiCreateCheckout(planId);
}

/** Confirm sandbox payment when AlphaBank credentials are not configured. */
export async function localConfirmSandboxCheckout(
  userId: string,
  paymentId: string,
): Promise<PaymentRecord> {
  void userId;
  const row = await apiConfirmSandboxPayment(paymentId);
  return {
    id: row.id,
    userId,
    subscriptionId: null,
    planId: row.planId ?? "",
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? "RUB",
    status: (row.status as PaymentStatus) || "succeeded",
    provider: "alpha-bank",
    providerPaymentId: row.providerPaymentId ?? null,
    createdAt: row.createdAt,
  };
}

/** @deprecated Prefer localStartCheckout — kept for tests that still call sandbox outcome. */
export async function localProcessSandboxCheckout(
  userId: string,
  planId: PlanId,
): Promise<PaymentRecord> {
  const checkout = await localStartCheckout(userId, planId);
  if (checkout.sandbox) {
    return localConfirmSandboxCheckout(userId, checkout.paymentId);
  }
  const plan = resolvePlanCheckout(planId);
  return {
    id: checkout.paymentId,
    userId,
    subscriptionId: null,
    planId,
    amount: plan?.priceRub ?? checkout.amount,
    currency: checkout.currency,
    status: "pending",
    provider: "alpha-bank",
    providerPaymentId: null,
    createdAt: new Date().toISOString(),
  };
}

export async function localGetUserDevices(): Promise<UserDeviceRecord[]> {
  const rows = await apiGetDevices();
  return rows.map((row) => ({
    id: `${row.userId}:${row.deviceId}`,
    userId: row.userId,
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    platform: row.platform,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
  }));
}

export async function localRevokeUserDevice(deviceId: string): Promise<void> {
  await apiRevokeDevice(deviceId);
}

export async function localUpsertUserDevice(input: {
  userId: string;
  deviceId: string;
  deviceName?: string;
  platform?: string;
}): Promise<UserDeviceRecord> {
  void input.userId;
  const row = await apiUpsertDevice({
    deviceId: input.deviceId,
    deviceName: input.deviceName,
    platform: input.platform,
  });
  return {
    id: `${row.userId}:${row.deviceId}`,
    userId: row.userId,
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    platform: row.platform,
    lastSeenAt: row.lastSeenAt,
    createdAt: row.createdAt,
  };
}
