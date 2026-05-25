import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabase/client";
import {
  validateLogin,
  validateRegistration,
  type RegistrationInput,
} from "./validation";

export type PublicUser = {
  id: string;
  email: string;
  companyName: string;
  inn: string;
  phone: string;
  role: "user" | "admin";
  createdAt: string;
};

export type Session = {
  token: string;
  user: PublicUser;
  expiresAt: string;
};

export type RegistrationResult = {
  user: PublicUser | null;
  needsEmailConfirmation: boolean;
};

type ProfileRow = {
  id: string;
  email: string | null;
  company_name: string | null;
  inn: string | null;
  phone: string | null;
  role: "user" | "admin" | null;
  created_at: string | null;
};

function metadataString(user: User, key: string): string {
  const value = user.user_metadata?.[key];
  return typeof value === "string" ? value : "";
}

export function getAuthCallbackUrl(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  return new URL(
    "auth/callback",
    `${window.location.origin}${import.meta.env.BASE_URL}`,
  ).toString();
}

async function getProfile(userId: string): Promise<ProfileRow | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("profiles")
      .select("id,email,company_name,inn,phone,role,created_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      // Не блокируем вход: профиль может отсутствовать или быть временно недоступен.
      console.warn("Profile fetch:", error.message);
      return null;
    }

    return (data as ProfileRow | null) ?? null;
  } catch (error) {
    console.warn(
      "Profile fetch failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

async function toPublicUser(user: User): Promise<PublicUser> {
  const profile = await getProfile(user.id);
  return {
    id: user.id,
    email: profile?.email ?? user.email ?? "",
    companyName: profile?.company_name ?? metadataString(user, "company_name"),
    inn: profile?.inn ?? metadataString(user, "inn"),
    phone: profile?.phone ?? metadataString(user, "phone"),
    role: profile?.role === "admin" ? "admin" : "user",
    createdAt: profile?.created_at ?? user.created_at,
  };
}

export async function register(
  input: RegistrationInput,
): Promise<RegistrationResult> {
  const validation = validateRegistration(input);
  if (!validation.ok) {
    throw new Error(`Invalid registration: ${validation.errors.join(", ")}`);
  }

  const email = input.email.trim().toLowerCase();
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password: input.password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
      data: {
        company_name: input.companyName.trim(),
        inn: input.inn.replace(/\s/g, ""),
        phone: input.phone.trim(),
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user && data.session ? await toPublicUser(data.user) : null,
    needsEmailConfirmation: Boolean(data.user && !data.session),
  };
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<Session> {
  const validation = validateLogin(input);
  if (!validation.ok) {
    throw new Error(`Invalid login: ${validation.errors.join(", ")}`);
  }

  const email = input.email.trim().toLowerCase();
  let data;
  let error;
  try {
    const result = await getSupabaseClient().auth.signInWithPassword({
      email,
      password: input.password,
    });
    data = result.data;
    error = result.error;
  } catch (networkError) {
    const message =
      networkError instanceof Error ? networkError.message : String(networkError);
    if (message.toLowerCase().includes("fetch") || message.toLowerCase().includes("network")) {
      throw new Error(
        "Нет связи с сервером входа (Supabase). Проверьте интернет. Если ошибка повторяется — включите VPN или проверьте, не блокируется ли supabase.co провайдером или антивирусом.",
      );
    }
    throw networkError;
  }

  if (error || !data.user || !data.session) {
    const message = error?.message ?? "Invalid credentials";
    if (
      message.toLowerCase().includes("failed to fetch") ||
      message.toLowerCase().includes("network")
    ) {
      throw new Error(
        "Нет связи с сервером входа (Supabase). Проверьте интернет. Если ошибка повторяется — включите VPN или проверьте, не блокируется ли supabase.co провайдером или антивирусом.",
      );
    }
    if (message.toLowerCase().includes("email not confirmed")) {
      throw new Error(
        "Подтвердите email по ссылке из письма, затем войдите снова.",
      );
    }
    if (message.toLowerCase().includes("invalid login credentials")) {
      throw new Error("Неверный email или пароль.");
    }
    throw new Error(message);
  }

  const publicUser = await toPublicUser(data.user);
  const session: Session = {
    token: data.session.access_token,
    user: publicUser,
    expiresAt: data.session.expires_at
      ? new Date(data.session.expires_at * 1000).toISOString()
      : new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  };
  return session;
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const { data, error } = await getSupabaseClient().auth.getUser();
  if (error || !data.user) {
    return null;
  }
  return toPublicUser(data.user);
}

export async function logout(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true; message: string }> {
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: getAuthCallbackUrl() },
  );

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      throw new Error("Слишком много запросов. Попробуйте позже.");
    }
    throw new Error(error.message);
  }

  return {
    ok: true,
    message:
      "Если аккаунт существует, инструкция по сбросу отправлена на email.",
  };
}

export async function updatePassword(password: string): Promise<void> {
  if (password.length < 8) {
    throw new Error("Пароль должен быть не короче 8 символов.");
  }

  const { error } = await getSupabaseClient().auth.updateUser({ password });
  if (error) {
    throw new Error(error.message);
  }
}
