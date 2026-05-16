import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type PublicUser,
} from "../lib/auth";
import type { RegistrationInput } from "../lib/validation";
import { AuthContext } from "./auth-context";
import { backendAdapter } from "../lib/backend/adapter";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() =>
    backendAdapter.getCurrentUser(),
  );

  useEffect(() => {
    const syncUser = () => {
      setUser(backendAdapter.getCurrentUser());
    };

    const intervalId = window.setInterval(syncUser, 30_000);
    window.addEventListener("visibilitychange", syncUser);
    window.addEventListener("focus", syncUser);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("visibilitychange", syncUser);
      window.removeEventListener("focus", syncUser);
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const session = await backendAdapter.login({ email, password });
      setUser(session.user);
    },
    [],
  );

  const register = useCallback(async (input: RegistrationInput) => {
    await backendAdapter.register(input);
    const session = await backendAdapter.login({
      email: input.email,
      password: input.password,
    });
    setUser(session.user);
  }, []);

  const logout = useCallback(() => {
    backendAdapter.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
