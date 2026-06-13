import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { ProtectedRoute } from "../../shared/auth/ProtectedRoute";
import { RoleGuard } from "../../shared/auth/RoleGuard";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
import { NotificationsPage } from "../../features/notifications/NotificationsPage";
import { PropertiesPage } from "../../features/properties/PropertiesPage";
import { PropertyDetailPage } from "../../features/properties/PropertyDetailPage";
import { FavoriteListingsPage } from "../../features/public-listings/FavoriteListingsPage";
import { PublicListingDetailPage } from "../../features/public-listings/PublicListingDetailPage";
import { PublicListingSearchPage } from "../../features/public-listings/PublicListingSearchPage";
import { PlaceholderPage } from "../../shared/components/PlaceholderPage";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <PublicListingSearchPage /> },
      { path: "/listing/:slug", element: <PublicListingDetailPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> }
    ]
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: (
          <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]}>
            <AuthenticatedLayout />
          </RoleGuard>
        ),
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/favorites", element: <FavoriteListingsPage /> },
          {
            path: "/properties",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <PropertiesPage />
              </RoleGuard>
            )
          },
          {
            path: "/properties/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <PropertyDetailPage />
              </RoleGuard>
            )
          },
          { path: "/listings", element: <PlaceholderPage title="Listings" /> },
          { path: "/customers", element: <PlaceholderPage title="Customers" /> },
          { path: "/leads", element: <PlaceholderPage title="Leads" /> },
          { path: "/appointments", element: <PlaceholderPage title="Appointments" /> },
          { path: "/contracts", element: <PlaceholderPage title="Contracts" /> },
          { path: "/transactions", element: <PlaceholderPage title="Transactions" /> },
          { path: "/commissions", element: <PlaceholderPage title="Commissions" /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/reports", element: <PlaceholderPage title="Reports" /> },
          { path: "/ai", element: <PlaceholderPage title="AI Assistant" /> },
          {
            path: "/admin/users",
            element: (
              <RoleGuard allowedRoles={["ADMIN"]}>
                <PlaceholderPage title="Admin Users" />
              </RoleGuard>
            )
          },
          {
            path: "/admin/audit-logs",
            element: (
              <RoleGuard allowedRoles={["ADMIN"]}>
                <PlaceholderPage title="Audit Logs" />
              </RoleGuard>
            )
          }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
