import {
  apiAdminDeleteUser,
  apiAdminGetDevices,
  apiAdminGetOrganizations,
  apiAdminGetOverview,
  apiAdminGetPayments,
  apiAdminGetUsers,
  apiAdminResendConfirmation,
  apiAdminResetPassword,
  apiAdminSetUserRole,
  type AdminDevicePayload,
  type AdminOrganizationPayload,
  type AdminPaymentPayload,
  type AdminUserPayload,
} from "./api/client";

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
  organizations: number;
  markingCodes: number;
  codeOperations: number;
  recentUsers: AdminRecentUser[];
  recentPayments: AdminRecentPayment[];
};

export type AdminUser = AdminUserPayload;
export type AdminOrganization = AdminOrganizationPayload;
export type AdminPayment = AdminPaymentPayload;
export type AdminDevice = AdminDevicePayload;

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const payload = await apiAdminGetOverview();
  return {
    totalUsers: payload.totalUsers,
    newUsers7d: payload.newUsers7d,
    newUsers30d: payload.newUsers30d,
    activeSubscriptions: payload.activeSubscriptions,
    trialingSubscriptions: payload.trialingSubscriptions,
    expiredSubscriptions: payload.expiredSubscriptions,
    totalPayments: payload.totalPayments,
    successfulPayments: payload.successfulPayments,
    revenueTotal: payload.revenueTotal,
    revenue30d: payload.revenue30d,
    registeredDevices: payload.registeredDevices,
    organizations: payload.organizations,
    markingCodes: payload.markingCodes,
    codeOperations: payload.codeOperations,
    recentUsers: payload.recentUsers.map((user) => ({
      id: user.id,
      email: user.email,
      companyName: user.companyName,
      role: user.role,
      createdAt: user.createdAt,
    })),
    recentPayments: payload.recentPayments.map((payment) => ({
      id: payment.id,
      email: payment.email,
      planId: payment.planId,
      amount: payment.amount,
      currency: payment.currency ?? "RUB",
      status: payment.status ?? "",
      createdAt: payment.createdAt,
    })),
  };
}

export function getAdminUsers(): Promise<AdminUser[]> {
  return apiAdminGetUsers();
}

export function getAdminOrganizations(): Promise<AdminOrganization[]> {
  return apiAdminGetOrganizations();
}

export function getAdminPayments(): Promise<AdminPayment[]> {
  return apiAdminGetPayments();
}

export function getAdminDevices(): Promise<AdminDevice[]> {
  return apiAdminGetDevices();
}

export function setAdminUserRole(
  userId: string,
  role: "admin" | "user",
): Promise<AdminUser> {
  return apiAdminSetUserRole(userId, role);
}

export function adminResetUserPassword(userId: string): Promise<{ ok: boolean; message: string }> {
  return apiAdminResetPassword(userId);
}

export function adminResendUserConfirmation(
  userId: string,
): Promise<{ ok: boolean; message: string }> {
  return apiAdminResendConfirmation(userId);
}

export function adminDeleteUser(userId: string): Promise<void> {
  return apiAdminDeleteUser(userId);
}
