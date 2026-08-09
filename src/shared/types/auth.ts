export type RoleCode = "ADMIN" | "MANAGER" | "AGENT" | "CUSTOMER" | "OWNER";

export type CurrentUser = {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  roles: RoleCode[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export type AuthContextValue = {
  fetchCurrentUser: () => Promise<CurrentUser | null>;
  isAuthenticated: boolean;
  isSessionHydrated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<CurrentUser | null>;
  loginAsDemo: (roles?: RoleCode[]) => void;
  logout: () => Promise<void>;
  session: AuthSession | null;
  setAuthSession: (session: AuthSession, user?: CurrentUser) => void;
  setCurrentUser: (user: CurrentUser | null) => void;
  user: CurrentUser | null;
};
