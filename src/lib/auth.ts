import { createId, createSalt, hashPassword } from "./crypto";
import { readJson, writeJson } from "./storage";
import {
  validateLogin,
  validateRegistration,
  type RegistrationInput,
} from "./validation";

const USERS_KEY = "dms_users";
const SESSION_KEY = "dms_session";

export type PublicUser = {
  id: string;
  email: string;
  companyName: string;
  inn: string;
  phone: string;
  createdAt: string;
};

type StoredUser = PublicUser & {
  passwordHash: string;
  salt: string;
};

export type Session = {
  token: string;
  user: PublicUser;
  expiresAt: string;
};

function loadUsers(): StoredUser[] {
  return readJson<StoredUser[]>(USERS_KEY, []);
}

function saveUsers(users: StoredUser[]): void {
  writeJson(USERS_KEY, users);
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    companyName: user.companyName,
    inn: user.inn,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export async function register(input: RegistrationInput): Promise<PublicUser> {
  const validation = validateRegistration(input);
  if (!validation.ok) {
    throw new Error(`Invalid registration: ${validation.errors.join(", ")}`);
  }

  const email = input.email.trim().toLowerCase();
  const users = loadUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("User already exists");
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(input.password, salt);
  const user: StoredUser = {
    id: createId("usr"),
    email,
    passwordHash,
    salt,
    companyName: input.companyName.trim(),
    inn: input.inn.replace(/\s/g, ""),
    phone: input.phone.trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  return toPublicUser(user);
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
  const user = loadUsers().find((u) => u.email === email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const passwordHash = await hashPassword(input.password, user.salt);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Invalid credentials");
  }

  const session: Session = {
    token: createId("sess"),
    user: toPublicUser(user),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getCurrentUser(): PublicUser | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    const session = JSON.parse(raw) as Session;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      logout();
      return null;
    }
    return session.user;
  } catch {
    logout();
    return null;
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function requestPasswordReset(email: string): { ok: true; message: string } {
  // Keep side effects deterministic while avoiding user enumeration details.
  void email.trim();
  return {
    ok: true,
    message:
      "Если аккаунт существует, инструкция по сбросу отправлена на email (симуляция в MVP).",
  };
}
