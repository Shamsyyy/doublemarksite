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

async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await getSupabaseClient()
    .from("profiles")
    .select("id,email,company_name,inn,phone,role,created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (
      error.message.includes("public.profiles") ||
      error.message.includes("schema cache")
    ) {
      return null;
    }
    throw new Error(error.message);
  }

  return (data as ProfileRow | null) ?? null;
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
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password: input.password,
  });

  if (error || !data.user || !data.session) {
    throw new Error(error?.message ?? "Invalid credentials");
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
  const baseUrl = import.meta.env.BASE_URL;
  const redirectTo =
    typeof window === "undefined"
      ? undefined
      : new URL("update-password", `${window.location.origin}${baseUrl}`).toString();
  const { error } = await getSupabaseClient().auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo },
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
