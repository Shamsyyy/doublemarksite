/** DoubleMark local/self-hosted API client for the marketing site. */

const TOKEN_KEY = "doublemark_api_session";

export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
};

export type ApiRegisterResponse = {
  needsEmailConfirmation: boolean;
  message: string;
};

export type ApiMessageResponse = {
  ok: true;
  message: string;
};

export type ApiProfile = {
  userId: string;
  email?: string | null;
  organization?: string | null;
  inn?: string | null;
  phone?: string | null;
  role?: string | null;
  orgId?: string | null;
  orgRole?: string | null;
};

export type ApiSubscription = {
  id: string;
  userId: string;
  orgId?: string | null;
  planId?: string | null;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  devicesLimit: number;
  providerSubscriptionId?: string | null;
  activeDeviceCount?: number;
};

export type ApiPayment = {
  id: string;
  createdAt: string;
  planId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
};

export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  return (raw && raw.length > 0 ? raw : "http://localhost:5080").replace(/\/$/, "");
}

export function isLocalApiBackend(): boolean {
  const mode = (import.meta.env.VITE_BACKEND ?? "local").toLowerCase();
  return mode !== "none";
}

export function loadApiSession(): ApiSession | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApiSession;
  } catch {
    return null;
  }
}

export function saveApiSession(session: ApiSession): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(session));
}

export function clearApiSession(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) return data.error;
  } catch {
    // ignore
  }
  return `HTTP ${response.status}`;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const session = loadApiSession();
    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }
  }

  let response = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers });

  if (auth && response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const retryHeaders = new Headers(init.headers);
      if (!retryHeaders.has("Content-Type") && init.body) {
        retryHeaders.set("Content-Type", "application/json");
      }
      retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
      response = await fetch(`${apiBaseUrl()}${path}`, { ...init, headers: retryHeaders });
    }
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function tryRefresh(): Promise<ApiSession | null> {
  const current = loadApiSession();
  if (!current?.refreshToken) return null;
  try {
    const next = await request<ApiSession>(
      "/api/auth/refresh",
      {
        method: "POST",
        body: JSON.stringify({ refreshToken: current.refreshToken }),
      },
      false,
    );
    saveApiSession(next);
    return next;
  } catch {
    clearApiSession();
    return null;
  }
}

export async function apiRegister(input: {
  email: string;
  password: string;
  companyName?: string;
  inn?: string;
  phone?: string;
  personalDataConsent?: boolean;
  personalDataConsentVersion?: string;
}): Promise<ApiRegisterResponse> {
  return request<ApiRegisterResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        companyName: input.companyName ?? null,
        inn: input.inn ?? null,
        phone: input.phone ?? null,
        personalDataConsent: input.personalDataConsent ?? false,
        personalDataConsentVersion: input.personalDataConsentVersion ?? null,
      }),
    },
    false,
  );
}

export type CookieConsentLogPayload = {
  consentId: string;
  consentVersion: string;
  timestamp: string;
  necessary: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  action: "grant" | "update" | "revoke";
};

export async function apiRecordCookieConsent(
  payload: CookieConsentLogPayload,
): Promise<void> {
  try {
    await request("/api/consent", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false);
  } catch {
    // Журнал согласия не должен ломать сайт, если API недоступен.
  }
}

export type ApiDevice = {
  userId: string;
  orgId?: string | null;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt?: string | null;
};

export function apiGetDevices(): Promise<ApiDevice[]> {
  return request<ApiDevice[]>("/api/me/devices");
}

export async function apiUpsertDevice(input: {
  deviceId: string;
  deviceName?: string;
  platform?: string;
}): Promise<ApiDevice> {
  const result = await request<{ success: boolean; error?: string; device?: ApiDevice }>(
    "/api/me/devices",
    {
      method: "POST",
      body: JSON.stringify({
        deviceId: input.deviceId,
        deviceName: input.deviceName ?? "browser",
        platform: input.platform ?? "web",
      }),
    },
  );
  if (!result.device) {
    throw new Error(result.error ?? "Не удалось сохранить устройство");
  }
  return result.device;
}

export async function apiRevokeDevice(deviceId: string): Promise<void> {
  await request(`/api/me/devices/${encodeURIComponent(deviceId)}`, {
    method: "DELETE",
  });
}

export type ApiCheckoutResponse = {
  paymentId: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  paymentUrl: string;
  sandbox: boolean;
};

export type ApiPaymentStatus = {
  id: string;
  planId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  providerPaymentId?: string | null;
  createdAt: string;
};

export function apiCreateCheckout(planId: string): Promise<ApiCheckoutResponse> {
  return request<ApiCheckoutResponse>("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
}

export function apiGetPaymentStatus(paymentId: string): Promise<ApiPaymentStatus> {
  return request<ApiPaymentStatus>(`/api/billing/payments/${paymentId}`);
}

export function apiConfirmSandboxPayment(paymentId: string): Promise<ApiPaymentStatus> {
  return request<ApiPaymentStatus>(
    `/api/billing/sandbox/confirm?paymentId=${encodeURIComponent(paymentId)}`,
    { method: "POST" },
  );
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<ApiSession> {
  const session = await request<ApiSession>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
  );
  saveApiSession(session);
  return session;
}

export async function apiConfirmEmail(token: string): Promise<ApiSession> {
  const session = await request<ApiSession>(
    "/api/auth/confirm-email",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
    false,
  );
  saveApiSession(session);
  return session;
}

export function apiRequestPasswordReset(email: string): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({ email }),
    },
    false,
  );
}

export function apiResetPassword(token: string, password: string): Promise<ApiMessageResponse> {
  return request<ApiMessageResponse>(
    "/api/auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify({ token, password }),
    },
    false,
  );
}

export async function apiLogout(): Promise<void> {
  const session = loadApiSession();
  try {
    if (session?.refreshToken) {
      await request("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });
    }
  } finally {
    clearApiSession();
  }
}

export function apiGetProfile(): Promise<ApiProfile> {
  return request<ApiProfile>("/api/me/profile");
}

export function apiUpdateProfile(input: {
  organization?: string | null;
  inn?: string | null;
  phone?: string | null;
}): Promise<ApiProfile> {
  return request<ApiProfile>("/api/me/profile", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function apiGetSubscription(): Promise<ApiSubscription | null> {
  return request<ApiSubscription | null>("/api/me/subscription");
}

export function apiGetPayments(): Promise<ApiPayment[]> {
  return request<ApiPayment[]>("/api/me/payments");
}

export function apiAdminGetOverview(): Promise<AdminOverviewPayload> {
  return request<AdminOverviewPayload>("/api/admin/overview");
}

export function apiAdminGetUsers(): Promise<AdminUserPayload[]> {
  return request<AdminUserPayload[]>("/api/admin/users");
}

export function apiAdminGetOrganizations(): Promise<AdminOrganizationPayload[]> {
  return request<AdminOrganizationPayload[]>("/api/admin/organizations");
}

export function apiAdminGetPayments(): Promise<AdminPaymentPayload[]> {
  return request<AdminPaymentPayload[]>("/api/admin/payments");
}

export function apiAdminGetDevices(): Promise<AdminDevicePayload[]> {
  return request<AdminDevicePayload[]>("/api/admin/devices");
}

export function apiAdminSetUserRole(userId: string, role: "admin" | "user"): Promise<AdminUserPayload> {
  return request<AdminUserPayload>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export type AdminActionMessage = { ok: boolean; message: string };

export function apiAdminResetPassword(userId: string): Promise<AdminActionMessage> {
  return request<AdminActionMessage>(`/api/admin/users/${userId}/reset-password`, {
    method: "POST",
  });
}

export function apiAdminResendConfirmation(userId: string): Promise<AdminActionMessage> {
  return request<AdminActionMessage>(`/api/admin/users/${userId}/resend-confirmation`, {
    method: "POST",
  });
}

export function apiAdminDeleteUser(userId: string): Promise<void> {
  return request<void>(`/api/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export function apiRecordInstallerDownload(input: {
  version?: string;
  fileName?: string;
}): Promise<{ id: string; version: string | null; fileName: string | null; createdAt: string }> {
  return request("/api/me/downloads/installer", {
    method: "POST",
    body: JSON.stringify({
      version: input.version ?? null,
      fileName: input.fileName ?? null,
    }),
  });
}

export type AdminOverviewPayload = {
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
  recentUsers: Array<{
    id: string;
    email: string | null;
    companyName: string | null;
    role: string | null;
    createdAt: string;
  }>;
  recentPayments: Array<{
    id: string;
    email: string | null;
    planId: string;
    amount: number;
    currency: string;
    status: string | null;
    createdAt: string;
  }>;
};

export type AdminUserPayload = {
  id: string;
  email: string;
  companyName: string | null;
  inn: string | null;
  phone: string | null;
  role: string;
  orgRole: string;
  orgId: string | null;
  orgName: string | null;
  createdAt: string;
  subscriptionStatus: string | null;
  planId: string | null;
  deviceCount: number;
  scanCount: number;
  emailConfirmed: boolean;
  emailConfirmedAt: string | null;
  hasDownloadedInstaller: boolean;
  lastInstallerDownloadAt: string | null;
  hasRegisteredDevice: boolean;
};

export type AdminOrganizationPayload = {
  id: string;
  legalName: string;
  inn: string | null;
  phone: string | null;
  email: string | null;
  createdAt: string;
  memberCount: number;
  canDownload: boolean;
  devicesLimit: number;
};

export type AdminPaymentPayload = {
  id: string;
  userId: string;
  email: string | null;
  planId: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  createdAt: string;
};

export type AdminDevicePayload = {
  userId: string;
  email: string | null;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
};
