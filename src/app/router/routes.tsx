import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { RoleGuard } from "../../shared/auth/RoleGuard";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
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
    element: (
      <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]} />
    ),
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/properties", element: <PlaceholderPage title="Properties" /> },
          { path: "/listings", element: <PlaceholderPage title="Listings" /> },
          { path: "/customers", element: <PlaceholderPage title="Customers" /> },
          { path: "/leads", element: <PlaceholderPage title="Leads" /> },
          { path: "/appointments", element: <PlaceholderPage title="Appointments" /> },
          { path: "/contracts", element: <PlaceholderPage title="Contracts" /> },
          { path: "/transactions", element: <PlaceholderPage title="Transactions" /> },
          { path: "/commissions", element: <PlaceholderPage title="Commissions" /> },
          { path: "/notifications", element: <PlaceholderPage title="Notifications" /> },
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

