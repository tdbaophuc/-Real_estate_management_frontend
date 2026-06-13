import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { AuthContextValue, AuthSession, CurrentUser, RoleCode } from "../types/auth";

const STORAGE_KEY = "rem.auth.session";

const demoUser: CurrentUser = {
  id: 1,
  email: "admin@example.com",
  fullName: "Admin Demo",
  roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
};

function readStoredSession(): AuthSession | null {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [user, setUser] = useState<CurrentUser | null>(() =>
    readStoredSession() ? demoUser : null
  );

  const setAuthSession = useCallback((nextSession: AuthSession, nextUser?: CurrentUser) => {
    setSession(nextSession);
    setUser(nextUser ?? demoUser);
    persistSession(nextSession);
  }, []);

  const loginAsDemo = useCallback((roles: RoleCode[] = demoUser.roles) => {
    const nextSession: AuthSession = {
      accessToken: "demo-access-token",
      refreshToken: "demo-refresh-token",
      expiresInSeconds: 1800
    };

    setAuthSession(nextSession, {
      ...demoUser,
      roles
    });
  }, [setAuthSession]);

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
    persistSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(session?.accessToken),
      loginAsDemo,
      logout,
      session,
      setAuthSession,
      user
    }),
    [loginAsDemo, logout, session, setAuthSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

