import { createContext } from "react";
import type { PublicUser } from "../lib/auth";
import type { RegistrationInput } from "../lib/validation";

export type AuthContextValue = {
  user: PublicUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegistrationInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
