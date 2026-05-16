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

export const backendAdapter: BackendAdapter = supabaseBackendAdapter;
