import { createContext } from "react";
import type { PublicUser } from "../lib/auth";
import type { RegistrationInput } from "../lib/validation";

export type AuthContextValue = {
  user: PublicUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegistrationInput) => Promise<{
    needsEmailConfirmation: boolean;
  }>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
