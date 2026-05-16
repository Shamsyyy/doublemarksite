import { getSupabaseClient } from "./supabase/client";

export type AdminRecentUser = {
  id: string;
  email: string | null;
  companyName: string | null;
  role: string | null;
  createdAt: string;
};

export type AdminRecentPayment = {
  id: string;
  email: string | null;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type AdminDashboardStats = {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  expiredSubscriptions: number;
  totalPayments: number;
  successfulPayments: number;
  revenueTotal: number;
  revenue30d: number;
  registeredDevices: number;
  recentUsers: AdminRecentUser[];
  recentPayments: AdminRecentPayment[];
};

type AdminStatsPayload = {
  total_users?: number;
  new_users_7d?: number;
  new_users_30d?: number;
  active_subscriptions?: number;
  trialing_subscriptions?: number;
  expired_subscriptions?: number;
  total_payments?: number;
  successful_payments?: number;
  revenue_total?: number;
  revenue_30d?: number;
  registered_devices?: number;
  recent_users?: Array<{
    id: string;
    email: string | null;
    company_name: string | null;
    role: string | null;
    created_at: string;
  }>;
  recent_payments?: Array<{
    id: string;
    email: string | null;
    plan_id: string;
    amount: number;
    currency: string | null;
    status: string;
    created_at: string;
  }>;
};

function numberValue(value: number | undefined): number {
  return typeof value === "number" ? value : 0;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const { data, error } = await getSupabaseClient().rpc(
    "get_admin_dashboard_stats",
  );

  if (error) {
    throw new Error(error.message);
  }

  const payload = (data ?? {}) as AdminStatsPayload;

  return {
    totalUsers: numberValue(payload.total_users),
    newUsers7d: numberValue(payload.new_users_7d),
    newUsers30d: numberValue(payload.new_users_30d),
    activeSubscriptions: numberValue(payload.active_subscriptions),
    trialingSubscriptions: numberValue(payload.trialing_subscriptions),
    expiredSubscriptions: numberValue(payload.expired_subscriptions),
    totalPayments: numberValue(payload.total_payments),
    successfulPayments: numberValue(payload.successful_payments),
    revenueTotal: numberValue(payload.revenue_total),
    revenue30d: numberValue(payload.revenue_30d),
    registeredDevices: numberValue(payload.registered_devices),
    recentUsers: (payload.recent_users ?? []).map((user) => ({
      id: user.id,
      email: user.email,
      companyName: user.company_name,
      role: user.role,
      createdAt: user.created_at,
    })),
    recentPayments: (payload.recent_payments ?? []).map((payment) => ({
      id: payment.id,
      email: payment.email,
      planId: payment.plan_id,
      amount: payment.amount,
      currency: payment.currency ?? "RUB",
      status: payment.status,
      createdAt: payment.created_at,
    })),
  };
}
