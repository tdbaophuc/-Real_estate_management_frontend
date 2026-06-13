import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { EmptyState } from "../ui/EmptyState";

export function ProtectedRoute() {
  const { isAuthenticated, isSessionHydrated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isSessionHydrated) {
    return (
      <div className="centered-state">
        <EmptyState
          title="Checking session"
          description="We are confirming your account permissions."
        />
      </div>
    );
  }

  return <Outlet />;
}
