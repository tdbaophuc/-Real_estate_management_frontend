export type RoleCode = "ADMIN" | "MANAGER" | "AGENT" | "CUSTOMER" | "OWNER";

export type CurrentUser = {
  id: number;
  email: string;
  fullName: string;
  roles: RoleCode[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  loginAsDemo: (roles?: RoleCode[]) => void;
  logout: () => void;
  session: AuthSession | null;
  setAuthSession: (session: AuthSession, user?: CurrentUser) => void;
  user: CurrentUser | null;
};

