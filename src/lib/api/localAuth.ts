import type {
  PublicUser,
  RegistrationResult,
  Session,
} from "../auth";
import type { RegistrationInput } from "../validation";
import { validateLogin, validateRegistration } from "../validation";
import {
  apiGetPayments,
  apiGetProfile,
  apiGetSubscription,
  apiLogin,
  apiLogout,
  apiRegister,
  apiUpdateProfile,
  clearApiSession,
  loadApiSession,
  type ApiPayment,
  type ApiSubscription,
} from "./client";
import type {
  PaymentRecord,
  PaymentStatus,
  SubscriptionRecord,
  SubscriptionStatus,
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
    planId: row.planId ?? "local-dev",
    status: (row.status as SubscriptionStatus) || "active",
    currentPeriodStart: row.currentPeriodStart ?? null,
    currentPeriodEnd: row.currentPeriodEnd ?? null,
    trialEndsAt: row.trialEndsAt ?? null,
    devicesLimit: row.devicesLimit ?? 1,
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
    const session = await apiRegister({
      email: input.email,
      password: input.password,
      companyName: input.companyName,
      inn: input.inn,
      phone: input.phone,
    });
    // Ensure profile fields are stored (register already writes them; refresh for UI).
    await apiUpdateProfile({
      organization: input.companyName.trim(),
      inn: input.inn.replace(/\s/g, ""),
      phone: input.phone.trim(),
    }).catch(() => undefined);

    const profile = await apiGetProfile();
    return {
      user: toPublicUser(profile, session.email),
      needsEmailConfirmation: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("уже существует") || message.includes("409")) {
      throw new Error("User already exists");
    }
    if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network")) {
      throw new Error(
        "Нет связи с локальным API DoubleMark. Запустите Postgres и DoubleMark.Api (http://localhost:5080).",
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
    if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network")) {
      throw new Error(
        "Нет связи с локальным API DoubleMark. Запустите Postgres и DoubleMark.Api (http://localhost:5080).",
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

export async function localRequestPasswordReset(): Promise<{
  ok: true;
  message: string;
}> {
  return {
    ok: true,
    message:
      "В локальном режиме сброс пароля по email недоступен. Создайте нового пользователя или смените пароль через API/БД.",
  };
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

/** Local/dev checkout stub: subscription is already active after register. */
export async function localProcessSandboxCheckout(
  userId: string,
  planId: PlanId,
): Promise<PaymentRecord> {
  const plan = resolvePlanCheckout(planId);
  return {
    id: crypto.randomUUID(),
    userId,
    subscriptionId: null,
    planId,
    amount: plan?.priceRub ?? 0,
    currency: "RUB",
    status: "succeeded",
    provider: "local-api",
    providerPaymentId: null,
    createdAt: new Date().toISOString(),
  };
}
