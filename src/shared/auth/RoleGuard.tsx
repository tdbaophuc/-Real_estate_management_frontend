import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { RoleCode } from "../types/auth";
import { EmptyState } from "../ui/EmptyState";

type RoleGuardProps = {
  allowedRoles: RoleCode[];
  children?: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { isAuthenticated, isSessionHydrated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isSessionHydrated && !user) {
    return (
      <div className="centered-state">
        <EmptyState
          title="Checking session"
          description="We are confirming your account permissions."
        />
      </div>
    );
  }

  const hasRole = user?.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    return (
      <div className="centered-state">
        <EmptyState
          title="Access denied"
          description="Your account does not have permission to open this area."
        />
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
}
