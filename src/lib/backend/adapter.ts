import type { RegistrationInput } from "../validation";
import type { PlanId } from "../../content/pricing";
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
  localStartCheckout,
} from "../api/localAuth";
import type { PublicUser, RegistrationResult, Session } from "../auth";
import type { PaymentRecord, SubscriptionRecord } from "../subscriptions";
import type { ApiCheckoutResponse } from "../api/client";

export type PaymentOutcome = "succeeded" | "failed";

export type BackendAdapter = {
  getCurrentUser: () => Promise<PublicUser | null>;
  login: (input: { email: string; password: string }) => Promise<Session>;
  register: (input: RegistrationInput) => Promise<RegistrationResult>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: true; message: string }>;
  startCheckout: (userId: string, planId: PlanId) => Promise<ApiCheckoutResponse>;
  processPaymentOutcome: (
    userId: string,
    planId: PlanId,
    outcome: PaymentOutcome,
  ) => Promise<PaymentRecord>;
  getPaymentsForUser: (userId: string) => Promise<PaymentRecord[]>;
  hasActiveLicense: (userId: string) => Promise<boolean>;
  getActiveEntitlement: (userId: string) => Promise<SubscriptionRecord | null>;
};

export const backendAdapter: BackendAdapter = {
  getCurrentUser: localGetCurrentUser,
  login: localLogin,
  register: localRegister,
  logout: localLogout,
  requestPasswordReset: async (email) => localRequestPasswordReset(email),
  startCheckout: localStartCheckout,
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
        provider: "alpha-bank",
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
