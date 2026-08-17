import {
  getCurrentUser,
  login,
  logout,
  register,
  requestPasswordReset,
  type PublicUser,
  type RegistrationResult,
  type Session,
} from "../auth";
import {
  getCurrentSubscription,
  getUserPayments,
  hasActiveSubscription,
  processSandboxCheckout,
  type PaymentRecord,
  type SubscriptionRecord,
} from "../subscriptions";
import type { RegistrationInput } from "../validation";
import type { PlanId } from "../../content/pricing";
import { isLocalApiBackend } from "../api/client";
import {
  localGetCurrentSubscription,
  localGetCurrentUser,
  localGetUserPayments,
  localHasActiveSubscription,
  localLogin,
  localLogout,
  localProcessSandboxCheckout,
  localRegister,
  localRequestPasswordReset,
} from "../api/localAuth";

export type PaymentOutcome = "succeeded" | "failed";

export type BackendAdapter = {
  getCurrentUser: () => Promise<PublicUser | null>;
  login: (input: { email: string; password: string }) => Promise<Session>;
  register: (input: RegistrationInput) => Promise<RegistrationResult>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: true; message: string }>;
  processPaymentOutcome: (
    userId: string,
    planId: PlanId,
    outcome: PaymentOutcome,
  ) => Promise<PaymentRecord>;
  getPaymentsForUser: (userId: string) => Promise<PaymentRecord[]>;
  hasActiveLicense: (userId: string) => Promise<boolean>;
  getActiveEntitlement: (userId: string) => Promise<SubscriptionRecord | null>;
};

export const supabaseBackendAdapter: BackendAdapter = {
  getCurrentUser,
  login,
  register,
  logout,
  requestPasswordReset,
  processPaymentOutcome: processSandboxCheckout,
  getPaymentsForUser: getUserPayments,
  hasActiveLicense: hasActiveSubscription,
  getActiveEntitlement: getCurrentSubscription,
};

export const localApiBackendAdapter: BackendAdapter = {
  getCurrentUser: localGetCurrentUser,
  login: localLogin,
  register: localRegister,
  logout: localLogout,
  requestPasswordReset: async () => localRequestPasswordReset(),
  processPaymentOutcome: async (userId, planId, outcome) => {
    if (outcome !== "succeeded") {
      return {
        id: crypto.randomUUID(),
        userId,
        subscriptionId: null,
        planId,
        amount: 0,
        currency: "RUB",
        status: "failed",
        provider: "local-api",
        providerPaymentId: null,
        createdAt: new Date().toISOString(),
      };
    }
    return localProcessSandboxCheckout(userId, planId);
  },
  getPaymentsForUser: localGetUserPayments,
  hasActiveLicense: localHasActiveSubscription,
  getActiveEntitlement: localGetCurrentSubscription,
};

export const backendAdapter: BackendAdapter = isLocalApiBackend()
  ? localApiBackendAdapter
  : supabaseBackendAdapter;
