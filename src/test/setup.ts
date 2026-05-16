import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

type MockUser = {
  id: string;
  email: string;
  password: string;
  user_metadata: Record<string, string>;
  created_at: string;
};

const mockSupabase = vi.hoisted(() => {
  let idCounter = 1;
  let currentUser: MockUser | null = null;
  const users = new Map<string, MockUser>();
  const profiles: Record<string, unknown>[] = [];
  const subscriptions: Record<string, unknown>[] = [];
  const payments: Record<string, unknown>[] = [];
  const userDevices: Record<string, unknown>[] = [];
  const listeners = new Set<() => void>();

  function nextId(prefix: string) {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  }

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function table(name: string) {
    if (name === "profiles") return profiles;
    if (name === "subscriptions") return subscriptions;
    if (name === "payments") return payments;
    if (name === "user_devices") return userDevices;
    throw new Error(`Unknown mock table ${name}`);
  }

  function createQuery(rows: Record<string, unknown>[]) {
    let result = [...rows];

    const query = {
      select: () => query,
      eq: (field: string, value: unknown) => {
        result = result.filter((row) => row[field] === value);
        return query;
      },
      order: (field: string, options?: { ascending?: boolean }) => {
        result = [...result].sort((a, b) => {
          const left = String(a[field] ?? "");
          const right = String(b[field] ?? "");
          return options?.ascending === false
            ? right.localeCompare(left)
            : left.localeCompare(right);
        });
        return query;
      },
      limit: (count: number) => {
        result = result.slice(0, count);
        return query;
      },
      maybeSingle: async () => ({ data: result[0] ?? null, error: null }),
      single: async () => ({ data: result[0] ?? null, error: null }),
      then: (
        resolve: (value: { data: Record<string, unknown>[]; error: null }) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve({ data: result, error: null }).then(resolve, reject),
    };

    return query;
  }

  const client = {
    auth: {
      signUp: async (input: {
        email: string;
        password: string;
        options?: { data?: Record<string, string> };
      }) => {
        if (users.has(input.email)) {
          return { data: { user: null, session: null }, error: { message: "User already exists" } };
        }

        const user: MockUser = {
          id: nextId("user"),
          email: input.email,
          password: input.password,
          user_metadata: input.options?.data ?? {},
          created_at: new Date().toISOString(),
        };
        users.set(input.email, user);
        profiles.push({
          id: user.id,
          email: user.email,
          company_name: user.user_metadata.company_name ?? "",
          inn: user.user_metadata.inn ?? "",
          phone: user.user_metadata.phone ?? "",
          role: user.email.startsWith("admin@") ? "admin" : "user",
          created_at: user.created_at,
        });
        currentUser = user;
        notify();
        return {
          data: { user, session: { access_token: nextId("token"), expires_at: 4_102_444_800 } },
          error: null,
        };
      },
      signInWithPassword: async (input: { email: string; password: string }) => {
        const user = users.get(input.email);
        if (!user || user.password !== input.password) {
          return { data: { user: null, session: null }, error: { message: "Invalid credentials" } };
        }

        currentUser = user;
        notify();
        return {
          data: { user, session: { access_token: nextId("token"), expires_at: 4_102_444_800 } },
          error: null,
        };
      },
      getUser: async () => ({ data: { user: currentUser }, error: null }),
      signOut: async () => {
        currentUser = null;
        notify();
        return { error: null };
      },
      resetPasswordForEmail: async () => ({ data: {}, error: null }),
      updateUser: async (input: { password?: string }) => {
        if (!currentUser) {
          return { data: { user: null }, error: { message: "Auth session missing" } };
        }
        if (input.password) {
          currentUser.password = input.password;
          users.set(currentUser.email, currentUser);
        }
        return { data: { user: currentUser }, error: null };
      },
      onAuthStateChange: (listener: () => void) => {
        listeners.add(listener);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(listener),
            },
          },
        };
      },
    },
    from: (name: string) => ({
      select: () => createQuery(table(name)),
      upsert: (input: Record<string, unknown>) => {
        const rows = table(name);
        const existingIndex = rows.findIndex(
          (row) =>
            row.user_id === input.user_id &&
            row.device_id === input.device_id,
        );
        const row = {
          id: existingIndex >= 0 ? rows[existingIndex].id : nextId("row"),
          created_at: existingIndex >= 0 ? rows[existingIndex].created_at : new Date().toISOString(),
          ...input,
        };
        if (existingIndex >= 0) {
          rows[existingIndex] = row;
        } else {
          rows.push(row);
        }
        return {
          select: () => ({
            single: async () => ({ data: row, error: null }),
          }),
        };
      },
    }),
    rpc: async (
      name: string,
      params?: {
        p_plan_id: string;
        p_amount: number;
        p_status: "succeeded" | "failed";
        p_period_days: number;
        p_devices_limit: number;
      },
    ) => {
      if (!currentUser) {
        return { data: null, error: { message: "RPC error" } };
      }

      if (name === "get_admin_dashboard_stats") {
        const currentProfile = profiles.find((profile) => profile.id === currentUser?.id);
        if (currentProfile?.role !== "admin") {
          return { data: null, error: { message: "Admin access required" } };
        }

        return {
          data: {
            total_users: profiles.length,
            new_users_7d: profiles.length,
            new_users_30d: profiles.length,
            active_subscriptions: subscriptions.filter(
              (item) => item.status === "active",
            ).length,
            trialing_subscriptions: subscriptions.filter(
              (item) => item.status === "trialing",
            ).length,
            expired_subscriptions: subscriptions.filter(
              (item) => item.status === "expired" || item.status === "canceled",
            ).length,
            total_payments: payments.length,
            successful_payments: payments.filter(
              (item) => item.status === "succeeded",
            ).length,
            revenue_total: payments
              .filter((item) => item.status === "succeeded")
              .reduce((sum, item) => sum + Number(item.amount), 0),
            revenue_30d: payments
              .filter((item) => item.status === "succeeded")
              .reduce((sum, item) => sum + Number(item.amount), 0),
            registered_devices: userDevices.length,
            recent_users: profiles.map((profile) => ({
              id: profile.id,
              email: profile.email,
              company_name: profile.company_name,
              role: profile.role,
              created_at: profile.created_at,
            })),
            recent_payments: payments.map((payment) => ({
              id: payment.id,
              email: profiles.find((profile) => profile.id === payment.user_id)?.email ?? null,
              plan_id: payment.plan_id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              created_at: payment.created_at,
            })),
          },
          error: null,
        };
      }

      if (name !== "process_sandbox_checkout" || !params) {
        return { data: null, error: { message: "RPC error" } };
      }

      let subscriptionId: string | null = null;
      if (params.p_status === "succeeded") {
        const now = new Date();
        const endsAt = new Date(now);
        endsAt.setDate(endsAt.getDate() + params.p_period_days);
        let subscription = subscriptions.find((item) => item.user_id === currentUser?.id);
        if (!subscription) {
          subscription = {
            id: nextId("sub"),
            user_id: currentUser.id,
            created_at: now.toISOString(),
          };
          subscriptions.push(subscription);
        }
        Object.assign(subscription, {
          plan_id: params.p_plan_id,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: endsAt.toISOString(),
          trial_ends_at: null,
          devices_limit: params.p_devices_limit,
          provider: "sandbox",
          provider_subscription_id: null,
          updated_at: now.toISOString(),
        });
        subscriptionId = String(subscription.id);
      }

      const payment = {
        id: nextId("pay"),
        user_id: currentUser.id,
        subscription_id: subscriptionId,
        plan_id: params.p_plan_id,
        amount: params.p_amount,
        currency: "RUB",
        status: params.p_status,
        provider: "sandbox",
        provider_payment_id: null,
        created_at: new Date().toISOString(),
      };
      payments.push(payment);

      return { data: payment, error: null };
    },
    reset: () => {
      idCounter = 1;
      currentUser = null;
      users.clear();
      profiles.length = 0;
      subscriptions.length = 0;
      payments.length = 0;
      userDevices.length = 0;
      listeners.clear();
    },
  };

  return client;
});

vi.mock("../lib/supabase/client", () => ({
  getSupabaseClient: () => mockSupabase,
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
}

vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

beforeEach(() => {
  mockSupabase.reset();
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});
