import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

type MockUser = {
  id: string;
  email: string;
  password: string;
  emailConfirmed: boolean;
  companyName: string;
  inn: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
};

type MockPayment = {
  id: string;
  createdAt: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
};

type MockDevice = {
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  createdAt: string;
  lastSeenAt: string;
};

const mockApi = vi.hoisted(() => {
  let idCounter = 1;
  const users = new Map<string, MockUser>();
  const sessions = new Map<string, string>();
  const payments = new Map<string, MockPayment[]>();
  const devices = new Map<string, MockDevice[]>();
  const subscriptions = new Map<string, { planId: string; status: string; devicesLimit: number }>();
  const pendingPayments = new Map<string, { userId: string; planId: string; amount: number }>();
  const confirmTokens = new Map<string, string>();
  const resetTokens = new Map<string, string>();
  const consentEvents: unknown[] = [];

  function nextId(prefix: string) {
    idCounter += 1;
    return `${prefix}-${idCounter}`;
  }

  function reset() {
    idCounter = 1;
    users.clear();
    sessions.clear();
    payments.clear();
    devices.clear();
    subscriptions.clear();
    pendingPayments.clear();
    confirmTokens.clear();
    resetTokens.clear();
    consentEvents.length = 0;
  }

  return {
    users,
    sessions,
    payments,
    devices,
    subscriptions,
    pendingPayments,
    confirmTokens,
    resetTokens,
    consentEvents,
    nextId,
    reset,
  };
});

function json(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as Response;
}

function empty(status: number): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => ({}),
  } as Response;
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

function requestMethod(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) return init.method.toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) return input.method.toUpperCase();
  return "GET";
}

async function requestBody(input: RequestInfo | URL, init?: RequestInit): Promise<Record<string, unknown>> {
  const raw =
    typeof init?.body === "string"
      ? init.body
      : typeof Request !== "undefined" && input instanceof Request
        ? await input.clone().text()
        : "";
  if (!raw) return {};
  return JSON.parse(raw) as Record<string, unknown>;
}

function bearer(input: RequestInfo | URL, init?: RequestInit): string | null {
  const headers = new Headers(
    init?.headers ?? (typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined),
  );
  const value = headers.get("Authorization") ?? "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

function userFromAuth(input: RequestInfo | URL, init?: RequestInit): MockUser | null {
  const token = bearer(input, init);
  if (!token) return null;
  const userId = mockApi.sessions.get(token);
  if (!userId) return null;
  return [...mockApi.users.values()].find((user) => user.id === userId) ?? null;
}

function subscriptionFor(user: MockUser) {
  const now = new Date();
  const stored = mockApi.subscriptions.get(user.id) ?? {
    planId: "base-monthly",
    status: "trialing",
    devicesLimit: 1,
  };
  const end = new Date(now);
  end.setDate(end.getDate() + (stored.status === "active" ? 30 : 14));
  const trial = new Date(now);
  trial.setDate(trial.getDate() + 14);
  return {
    id: `sub-${user.id}`,
    userId: user.id,
    orgId: `org-${user.id}`,
    planId: stored.planId,
    status: stored.status,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: end.toISOString(),
    trialEndsAt: stored.status === "trialing" ? trial.toISOString() : null,
    devicesLimit: stored.devicesLimit,
    providerSubscriptionId: null,
    activeDeviceCount: (mockApi.devices.get(user.id) ?? []).length,
  };
}

function issueSession(user: MockUser) {
  const accessToken = mockApi.nextId("token");
  mockApi.sessions.set(accessToken, user.id);
  return {
    accessToken,
    refreshToken: mockApi.nextId("refresh"),
    expiresAtUtc: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: user.id,
    email: user.email,
  };
}

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
vi.stubGlobal(
  "matchMedia",
  vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
);

const defaultVersionsManifest = {
  latest: "2.1.1",
  versions: [
    {
      version: "2.1.1",
      releaseDate: "2026-05-21",
      title: "DoubleMark 2.1.1",
      type: "latest",
      recommended: true,
      mandatory: false,
      installerUrl: "https://doublemark.ru/downloads/DoubleMarkSetup-2.1.1.exe",
      sha256: "PUT_SHA256_HASH_HERE",
      notes: ["Исправлена работа HID/RawInput"],
    },
    {
      version: "2.1.0",
      releaseDate: "2026-05-18",
      title: "DoubleMark 2.1.0",
      type: "archive",
      recommended: false,
      mandatory: false,
      installerUrl: "https://doublemark.ru/downloads/archive/DoubleMarkSetup-2.1.0.exe",
      sha256: "PUT_SHA256_HASH_HERE",
      notes: ["Production-сборка"],
    },
  ],
};

const defaultDownloadsManifest = {
  generatedAt: new Date().toISOString(),
  prefix: "DoubleMarkSetup",
  productionBaseUrl: "https://doublemark.ru/",
  current: {
    "2.1.1": {
      version: "2.1.1",
      fileName: "DoubleMarkSetup-2.1.1-20260521-124531.exe",
      relativePath: "downloads/DoubleMarkSetup-2.1.1-20260521-124531.exe",
      sha256: "abc123",
    },
  },
  archive: {
    "2.1.0": {
      version: "2.1.0",
      fileName: "DoubleMarkSetup-2.1.0.exe",
      relativePath: "downloads/archive/DoubleMarkSetup-2.1.0.exe",
      sha256: "def456",
    },
  },
};

const defaultUpdateManifest = {
  version: "2.1.1",
  releaseDate: "2026-05-21",
  mandatory: false,
  title: "DoubleMark 2.1.1",
  notes: ["Исправлена работа HID/RawInput"],
  installerUrl: "https://doublemark.ru/downloads/DoubleMarkSetup-2.1.1.exe",
  sha256: "PUT_SHA256_HASH_HERE",
  minSupportedVersion: "2.1.0",
};

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const localStorageMock = createStorageMock();
const sessionStorageMock = createStorageMock();
vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("sessionStorage", sessionStorageMock);

beforeEach(() => {
  mockApi.reset();
  localStorageMock.clear();
  sessionStorageMock.clear();
  document.cookie.split(";").forEach((part) => {
    const name = part.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
    }
  });

  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = requestUrl(input);
      const method = requestMethod(input, init);

      if (url.includes("downloads/manifest.json")) return json(defaultDownloadsManifest);
      if (url.includes("versions.json")) return json(defaultVersionsManifest);
      if (url.includes("update.json")) return json(defaultUpdateManifest);

      if (url.includes("/api/consent") && method === "POST") {
        mockApi.consentEvents.push(await requestBody(input, init));
        return empty(204);
      }

      if (url.includes("/api/auth/register") && method === "POST") {
        const body = await requestBody(input, init);
        const email = String(body.email ?? "").trim().toLowerCase();
        if (mockApi.users.has(email)) {
          return json({ error: "Пользователь с таким email уже существует." }, 409);
        }
        const user: MockUser = {
          id: mockApi.nextId("user"),
          email,
          password: String(body.password ?? ""),
          emailConfirmed: false,
          companyName: String(body.companyName ?? ""),
          inn: String(body.inn ?? ""),
          phone: String(body.phone ?? ""),
          role: email.startsWith("admin@") ? "admin" : "user",
          createdAt: new Date().toISOString(),
        };
        mockApi.users.set(email, user);
        mockApi.payments.set(user.id, []);
        mockApi.devices.set(user.id, []);
        mockApi.subscriptions.set(user.id, {
          planId: "base-monthly",
          status: "trialing",
          devicesLimit: 1,
        });
        mockApi.confirmTokens.set(`confirm:${email}`, email);
        return json({
          needsEmailConfirmation: true,
          message: "Проверьте почту и подтвердите email, чтобы завершить регистрацию.",
        });
      }

      if (url.includes("/api/auth/login") && method === "POST") {
        const body = await requestBody(input, init);
        const email = String(body.email ?? "").trim().toLowerCase();
        const user = mockApi.users.get(email);
        if (!user || user.password !== body.password) {
          return json({ error: "Неверный email или пароль." }, 401);
        }
        if (!user.emailConfirmed) {
          return json({ error: "Подтвердите email, чтобы войти в аккаунт." }, 401);
        }
        return json(issueSession(user));
      }

      if (url.includes("/api/auth/confirm-email") && method === "POST") {
        const body = await requestBody(input, init);
        const token = String(body.token ?? "");
        const email = mockApi.confirmTokens.get(token);
        if (!email) {
          return json({ error: "Ссылка подтверждения недействительна или истекла." }, 401);
        }
        const user = mockApi.users.get(email);
        if (!user) {
          return json({ error: "Ссылка подтверждения недействительна или истекла." }, 401);
        }
        user.emailConfirmed = true;
        mockApi.confirmTokens.delete(token);
        return json(issueSession(user));
      }

      if (url.includes("/api/auth/forgot-password") && method === "POST") {
        const body = await requestBody(input, init);
        const email = String(body.email ?? "").trim().toLowerCase();
        if (mockApi.users.has(email)) {
          mockApi.resetTokens.set(`reset:${email}`, email);
        }
        return json({
          ok: true,
          message: "Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.",
        });
      }

      if (url.includes("/api/auth/reset-password") && method === "POST") {
        const body = await requestBody(input, init);
        const token = String(body.token ?? "");
        const email = mockApi.resetTokens.get(token);
        if (!email) {
          return json({ error: "Ссылка сброса пароля недействительна или истекла." }, 401);
        }
        const user = mockApi.users.get(email);
        if (!user) {
          return json({ error: "Ссылка сброса пароля недействительна или истекла." }, 401);
        }
        user.password = String(body.password ?? "");
        mockApi.resetTokens.delete(token);
        for (const [sessionToken, userId] of mockApi.sessions) {
          if (userId === user.id) mockApi.sessions.delete(sessionToken);
        }
        return json({
          ok: true,
          message: "Пароль обновлён. Теперь можно войти с новым паролем.",
        });
      }

      if (url.includes("/api/auth/logout") && method === "POST") {
        const current = userFromAuth(input, init);
        if (current) {
          for (const [token, userId] of mockApi.sessions) {
            if (userId === current.id) mockApi.sessions.delete(token);
          }
        }
        return empty(204);
      }

      const current = userFromAuth(input, init);

      if (url.includes("/api/me/profile") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        return json({
          userId: current.id,
          email: current.email,
          organization: current.companyName,
          inn: current.inn,
          phone: current.phone,
          role: current.role,
        });
      }

      if (url.includes("/api/me/profile") && method === "PUT") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const body = await requestBody(input, init);
        if (typeof body.organization === "string") current.companyName = body.organization;
        if (typeof body.inn === "string") current.inn = body.inn;
        if (typeof body.phone === "string") current.phone = body.phone;
        return json({
          userId: current.id,
          email: current.email,
          organization: current.companyName,
          inn: current.inn,
          phone: current.phone,
          role: current.role,
        });
      }

      if (url.includes("/api/me/subscription") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        return json(subscriptionFor(current));
      }

      if (url.includes("/api/me/payments") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        return json(mockApi.payments.get(current.id) ?? []);
      }

      if (url.includes("/api/me/devices") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        return json(mockApi.devices.get(current.id) ?? []);
      }

      if (url.includes("/api/me/devices") && method === "POST") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const body = await requestBody(input, init);
        const list = mockApi.devices.get(current.id) ?? [];
        const existing = list.find((row) => row.deviceId === body.deviceId);
        const now = new Date().toISOString();
        const limit = mockApi.subscriptions.get(current.id)?.devicesLimit ?? 1;
        if (existing) {
          existing.deviceName = String(body.deviceName ?? existing.deviceName);
          existing.platform = String(body.platform ?? existing.platform);
          existing.lastSeenAt = now;
          return json({ success: true, device: existing });
        }
        if (list.length >= limit) {
          return json(
            { success: false, error: "Превышен лимит устройств по текущему тарифу." },
            403,
          );
        }
        const created: MockDevice = {
          userId: current.id,
          deviceId: String(body.deviceId),
          deviceName: String(body.deviceName ?? "browser"),
          platform: String(body.platform ?? "web"),
          createdAt: now,
          lastSeenAt: now,
        };
        list.push(created);
        mockApi.devices.set(current.id, list);
        return json({ success: true, device: created });
      }

      if (url.includes("/api/me/devices/") && method === "DELETE") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const deviceId = decodeURIComponent(url.split("/api/me/devices/")[1] ?? "");
        const list = mockApi.devices.get(current.id) ?? [];
        mockApi.devices.set(
          current.id,
          list.filter((row) => row.deviceId !== deviceId),
        );
        return empty(204);
      }

      if (url.includes("/api/billing/checkout") && method === "POST") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const body = await requestBody(input, init);
        const planId = String(body.planId ?? "base-monthly");
        const paymentId = mockApi.nextId("pay");
        const amount = planId.includes("elite") ? 10000 : planId.includes("standard") ? 5000 : 3000;
        mockApi.pendingPayments.set(paymentId, {
          userId: current.id,
          planId,
          amount,
        });
        return json({
          paymentId,
          planId,
          amount,
          currency: "RUB",
          status: "pending",
          paymentUrl: `/api/billing/sandbox/confirm?paymentId=${paymentId}`,
          sandbox: true,
        });
      }

      if (url.includes("/api/billing/sandbox/confirm") && method === "POST") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const paymentId =
          new URL(url, "http://localhost").searchParams.get("paymentId") ?? "";
        const pending = mockApi.pendingPayments.get(paymentId);
        if (!pending || pending.userId !== current.id) {
          return json({ error: "Платёж не найден." }, 404);
        }
        const devicesLimit = pending.planId.startsWith("elite")
          ? 10
          : pending.planId.startsWith("standard")
            ? 3
            : 1;
        mockApi.subscriptions.set(current.id, {
          planId: pending.planId,
          status: "active",
          devicesLimit,
        });
        const payment: MockPayment = {
          id: paymentId,
          createdAt: new Date().toISOString(),
          planId: pending.planId,
          amount: pending.amount,
          currency: "RUB",
          status: "succeeded",
        };
        const list = mockApi.payments.get(current.id) ?? [];
        list.unshift(payment);
        mockApi.payments.set(current.id, list);
        mockApi.pendingPayments.delete(paymentId);
        return json({
          id: payment.id,
          planId: payment.planId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          providerPaymentId: paymentId,
          createdAt: payment.createdAt,
        });
      }

      if (url.includes("/api/billing/payments/") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        const paymentId = url.split("/api/billing/payments/")[1] ?? "";
        const list = mockApi.payments.get(current.id) ?? [];
        const found = list.find((row) => row.id === paymentId);
        if (found) {
          return json({
            id: found.id,
            planId: found.planId,
            amount: found.amount,
            currency: found.currency,
            status: found.status,
            providerPaymentId: found.id,
            createdAt: found.createdAt,
          });
        }
        const pending = mockApi.pendingPayments.get(paymentId);
        if (pending && pending.userId === current.id) {
          return json({
            id: paymentId,
            planId: pending.planId,
            amount: pending.amount,
            currency: "RUB",
            status: "pending",
            providerPaymentId: null,
            createdAt: new Date().toISOString(),
          });
        }
        return json({ error: "Платёж не найден." }, 404);
      }

      if (url.includes("/api/admin/overview") && method === "GET") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        if (current.role !== "admin") return json({ error: "Admin access required" }, 403);
        const allUsers = [...mockApi.users.values()];
        const allPayments = [...mockApi.payments.values()].flat();
        return json({
          totalUsers: allUsers.length,
          newUsers7d: allUsers.length,
          newUsers30d: allUsers.length,
          activeSubscriptions: allUsers.length,
          trialingSubscriptions: 0,
          expiredSubscriptions: 0,
          totalPayments: allPayments.length,
          successfulPayments: allPayments.filter((item) => item.status === "succeeded").length,
          revenueTotal: allPayments
            .filter((item) => item.status === "succeeded")
            .reduce((sum, item) => sum + item.amount, 0),
          revenue30d: 0,
          registeredDevices: [...mockApi.devices.values()].flat().length,
          organizations: allUsers.length,
          markingCodes: 0,
          codeOperations: 0,
          recentUsers: allUsers.map((user) => ({
            id: user.id,
            email: user.email,
            companyName: user.companyName,
            role: user.role,
            createdAt: user.createdAt,
          })),
          recentPayments: allPayments.map((payment) => ({
            id: payment.id,
            email: null,
            planId: payment.planId,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            createdAt: payment.createdAt,
          })),
        });
      }

      if (url.includes("/api/admin/users/") && url.includes("/reset-password") && method === "POST") {
        if (!current || current.role !== "admin") return json({ error: "Admin access required" }, 403);
        return json({ ok: true, message: "Письмо для сброса пароля отправлено." });
      }

      if (url.includes("/api/admin/users/") && url.includes("/resend-confirmation") && method === "POST") {
        if (!current || current.role !== "admin") return json({ error: "Admin access required" }, 403);
        return json({ ok: true, message: "Письмо подтверждения отправлено." });
      }

      if (url.includes("/api/admin/users/") && method === "DELETE") {
        if (!current || current.role !== "admin") return json({ error: "Admin access required" }, 403);
        return empty(204);
      }

      if (url.includes("/api/me/downloads/installer") && method === "POST") {
        if (!current) return json({ error: "Unauthorized" }, 401);
        return json({
          id: mockApi.nextId("dl"),
          version: "3.0.2",
          fileName: "DoubleMarkSetup-3.0.2.exe",
          createdAt: new Date().toISOString(),
        });
      }

      return { ok: false, status: 404 } as Response;
    }),
  );
});

afterEach(() => {
  cleanup();
});
