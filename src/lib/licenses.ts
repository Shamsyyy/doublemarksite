import { resolvePlanCheckout, type PlanId } from "../content/pricing";
import { createId } from "./crypto";
import { readJson, writeJson } from "./storage";

const ENTITLEMENTS_KEY = "dms_entitlements";

export type Entitlement = {
  id: string;
  userId: string;
  planId: PlanId;
  status: "active" | "expired";
  validUntil: string;
  createdAt: string;
};

export function getEntitlements(): Entitlement[] {
  return readJson<Entitlement[]>(ENTITLEMENTS_KEY, []);
}

function saveEntitlements(items: Entitlement[]): void {
  writeJson(ENTITLEMENTS_KEY, items);
}

export function grantLicense(userId: string, planId: PlanId): Entitlement {
  const resolved = resolvePlanCheckout(planId);
  if (!resolved) {
    throw new Error("Unknown plan");
  }

  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + resolved.subscriptionDays);

  const items = getEntitlements().filter(
    (e) => !(e.userId === userId && e.status === "active"),
  );

  const entitlement: Entitlement = {
    id: createId("ent"),
    userId,
    planId,
    status: "active",
    validUntil: validUntil.toISOString(),
    createdAt: now.toISOString(),
  };
  items.push(entitlement);
  saveEntitlements(items);
  return entitlement;
}

export function getActiveEntitlement(userId: string): Entitlement | null {
  const now = Date.now();
  return (
    getEntitlements().find(
      (e) =>
        e.userId === userId &&
        e.status === "active" &&
        new Date(e.validUntil).getTime() > now,
    ) ?? null
  );
}

export function hasActiveLicense(userId: string): boolean {
  return getActiveEntitlement(userId) !== null;
}
