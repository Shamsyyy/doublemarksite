import {
  localConfirmEmail,
  localRequestPasswordReset,
  localUpdatePassword,
} from "./api/localAuth";

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

export {
  localRegister as register,
  localLogin as login,
  localLogout as logout,
  localGetCurrentUser as getCurrentUser,
} from "./api/localAuth";

export async function requestPasswordReset(
  email: string,
): Promise<{ ok: true; message: string }> {
  return localRequestPasswordReset(email);
}

export async function confirmEmail(token: string): Promise<Session> {
  return localConfirmEmail(token);
}

export async function updatePassword(token: string, password: string): Promise<string> {
  return localUpdatePassword(token, password);
}
