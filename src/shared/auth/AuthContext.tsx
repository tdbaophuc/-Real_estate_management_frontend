import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { configureApiClientAuth } from "../api/client";
import { authApi } from "./authApi";
import type { AuthContextValue, AuthSession, CurrentUser, RoleCode } from "../types/auth";

const STORAGE_KEY = "rem.auth.state";

const demoUser: CurrentUser = {
  id: 1,
  email: "admin@example.com",
  fullName: "Admin Demo",
  roles: ["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]
};

type StoredAuthState = {
  session: AuthSession | null;
  user: CurrentUser | null;
};

function readStoredAuthState(): StoredAuthState {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return { session: null, user: null };
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuthState | AuthSession;

    if (parsed && "accessToken" in parsed) {
      return {
        session: parsed,
        user: null
      };
    }

    return {
      session: parsed.session ?? null,
      user: parsed.user ?? null
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return { session: null, user: null };
  }
}

function persistAuthState(state: StoredAuthState) {
  if (!state.session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [storedAuthState] = useState(() => readStoredAuthState());
  const [session, setSession] = useState<AuthSession | null>(storedAuthState.session);
  const [user, setUser] = useState<CurrentUser | null>(storedAuthState.user);
  const [isSessionHydrated, setIsSessionHydrated] = useState(false);
  const sessionRef = useRef<AuthSession | null>(storedAuthState.session);
  const userRef = useRef<CurrentUser | null>(storedAuthState.user);

  const setAuthSession = useCallback((nextSession: AuthSession, nextUser?: CurrentUser) => {
    const nextUserState = nextUser ?? userRef.current;

    sessionRef.current = nextSession;
    userRef.current = nextUserState;
    setSession(nextSession);
    setUser(nextUserState);
    persistAuthState({
      session: nextSession,
      user: nextUserState
    });
  }, []);

  const setCurrentUser = useCallback((nextUser: CurrentUser | null) => {
    userRef.current = nextUser;
    setUser(nextUser);
    persistAuthState({
      session: sessionRef.current,
      user: nextUser
    });
  }, []);

  const clearAuthState = useCallback(() => {
    sessionRef.current = null;
    userRef.current = null;
    setSession(null);
    setUser(null);
    persistAuthState({ session: null, user: null });
  }, []);

  useEffect(() => {
    configureApiClientAuth({
      getAccessToken: () => sessionRef.current?.accessToken ?? null,
      getRefreshToken: () => sessionRef.current?.refreshToken ?? null,
      onRefresh: (nextSession) => {
        setAuthSession(nextSession, userRef.current ?? undefined);
      },
      onUnauthorized: clearAuthState
    });

    return () => configureApiClientAuth(null);
  }, [clearAuthState, setAuthSession]);

  const fetchCurrentUser = useCallback(async () => {
    if (!sessionRef.current?.accessToken) {
      setIsSessionHydrated(true);
      return null;
    }

    try {
      const currentUser = await authApi.getMe();
      setCurrentUser(currentUser);
      return currentUser;
    } catch {
      clearAuthState();
      return null;
    } finally {
      setIsSessionHydrated(true);
    }
  }, [clearAuthState, setCurrentUser]);

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const authResult = await authApi.login(credentials);

      sessionRef.current = authResult.session;
      setSession(authResult.session);

      if (authResult.user) {
        setCurrentUser(authResult.user);
        persistAuthState({
          session: authResult.session,
          user: authResult.user
        });
        return authResult.user;
      }

      persistAuthState({
        session: authResult.session,
        user: null
      });

      return fetchCurrentUser();
    },
    [fetchCurrentUser, setCurrentUser]
  );

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

  const logout = useCallback(async () => {
    const refreshToken = sessionRef.current?.refreshToken;

    try {
      await authApi.logout(refreshToken);
    } catch {
      // Logout must clear local state even if the backend session is already gone.
    } finally {
      clearAuthState();
    }
  }, [clearAuthState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      fetchCurrentUser,
      isAuthenticated: Boolean(session?.accessToken),
      isSessionHydrated,
      login,
      loginAsDemo,
      logout,
      session,
      setAuthSession,
      setCurrentUser,
      user
    }),
    [
      fetchCurrentUser,
      isSessionHydrated,
      login,
      loginAsDemo,
      logout,
      session,
      setAuthSession,
      setCurrentUser,
      user
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
