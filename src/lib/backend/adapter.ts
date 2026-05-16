import {
  getCurrentUser,
  login,
  logout,
  register,
  requestPasswordReset,
  type PublicUser,
  type Session,
} from "../auth";
import {
  getOrCreatePendingCheckout,
  getPaymentsForUser,
  processSandboxPayment,
  type CheckoutSession,
  type PaymentRecord,
} from "../payments";
import {
  getActiveEntitlement,
  hasActiveLicense,
  type Entitlement,
} from "../licenses";
import type { RegistrationInput } from "../validation";
import type { PlanId } from "../../content/pricing";

export type PaymentOutcome = "succeeded" | "failed";

export type BackendAdapter = {
  getCurrentUser: () => PublicUser | null;
  login: (input: { email: string; password: string }) => Promise<Session>;
  register: (input: RegistrationInput) => Promise<PublicUser>;
  logout: () => void;
  requestPasswordReset: (email: string) => { ok: true; message: string };
  getOrCreatePendingCheckout: (
    userId: string,
    planId: PlanId,
  ) => CheckoutSession;
  processPaymentOutcome: (
    checkoutId: string,
    outcome: PaymentOutcome,
  ) => PaymentRecord;
  getPaymentsForUser: (userId: string) => PaymentRecord[];
  hasActiveLicense: (userId: string) => boolean;
  getActiveEntitlement: (userId: string) => Entitlement | null;
};

export const browserBackendAdapter: BackendAdapter = {
  getCurrentUser,
  login,
  register,
  logout,
  requestPasswordReset,
  getOrCreatePendingCheckout,
  processPaymentOutcome: processSandboxPayment,
  getPaymentsForUser,
  hasActiveLicense,
  getActiveEntitlement,
};

export const backendAdapter: BackendAdapter = browserBackendAdapter;
