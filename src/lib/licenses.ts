import {
  getCurrentSubscription,
  hasActiveSubscription,
  type SubscriptionRecord,
} from "./subscriptions";

export type Entitlement = SubscriptionRecord;

export function getActiveEntitlement(
  userId: string,
): Promise<SubscriptionRecord | null> {
  return getCurrentSubscription(userId);
}

export function hasActiveLicense(userId: string): Promise<boolean> {
  return hasActiveSubscription(userId);
}
