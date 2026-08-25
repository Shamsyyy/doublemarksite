import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type PublicUser } from "../lib/auth";
import type { RegistrationInput } from "../lib/validation";
import { AuthContext } from "./auth-context";
import { backendAdapter } from "../lib/backend/adapter";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      try {
        const currentUser = await backendAdapter.getCurrentUser();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void syncUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await backendAdapter.login({ email, password });
    setUser(session.user);
  }, []);

  const register = useCallback(async (input: RegistrationInput) => {
    const result = await backendAdapter.register(input);
    setUser(result.user);
    return { needsEmailConfirmation: result.needsEmailConfirmation };
  }, []);

  const logout = useCallback(async () => {
    await backendAdapter.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
