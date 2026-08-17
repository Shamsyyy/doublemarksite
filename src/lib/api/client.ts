/** DoubleMark local/self-hosted API client for the marketing site. */

const TOKEN_KEY = "doublemark_api_session";

export type ApiSession = {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
};

export type ApiProfile = {
  userId: string;
  email?: string | null;
  organization?: string | null;
  inn?: string | null;
  phone?: string | null;
  role?: string | null;
};

export type ApiSubscription = {
  id: string;
  userId: string;
  planId?: string | null;
  status: string;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  devicesLimit: number;
  providerSubscriptionId?: string | null;
};

export type ApiPayment = {
  id: string;
  createdAt: string;
  planId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
};

function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  return (raw && raw.length > 0 ? raw : "http://localhost:5080").replace(/\/$/, "");
}

export function isLocalApiBackend(): boolean {
  const mode = (import.meta.env.VITE_BACKEND ?? "supabase").toLowerCase();
  return mode === "local" || mode === "localapi" || mode === "api";
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
}): Promise<ApiSession> {
  const session = await request<ApiSession>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        companyName: input.companyName ?? null,
        inn: input.inn ?? null,
        phone: input.phone ?? null,
      }),
    },
    false,
  );
  saveApiSession(session);
  return session;
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
