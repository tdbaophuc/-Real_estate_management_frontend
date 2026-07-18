import type { Router } from "@remix-run/router";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { AppointmentDetailPage } from "../../features/appointments/AppointmentDetailPage";
import { AppointmentsPage } from "../../features/appointments/AppointmentsPage";
import { AdminUsersPage } from "../../features/admin/AdminUsersPage";
import { AuditLogsPage } from "../../features/admin/AuditLogsPage";
import { AiPage } from "../../features/ai/AiPage";
import { AccountPage } from "../../features/account/AccountPage";
import { ContractDetailPage } from "../../features/contracts/ContractDetailPage";
import { ContractFormPage } from "../../features/contracts/ContractFormPage";
import { ContractsPage } from "../../features/contracts/ContractsPage";
import { CommissionsPage } from "../../features/commissions/CommissionsPage";
import { ProtectedRoute } from "../../shared/auth/ProtectedRoute";
import { RoleGuard } from "../../shared/auth/RoleGuard";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
import { CustomerCreatePage } from "../../features/customers/CustomerCreatePage";
import { CustomerDetailPage } from "../../features/customers/CustomerDetailPage";
import { CustomersPage } from "../../features/customers/CustomersPage";
import { NotificationsPage } from "../../features/notifications/NotificationsPage";
import { ReportsPage } from "../../features/reports/ReportsPage";
import { ListingDetailPage } from "../../features/listings/ListingDetailPage";
import { ListingFormPage } from "../../features/listings/ListingFormPage";
import { ListingsPage } from "../../features/listings/ListingsPage";
import { LeadDetailPage } from "../../features/leads/LeadDetailPage";
import { LeadsPage } from "../../features/leads/LeadsPage";
import { FollowUpTasksPage } from "../../features/follow-up-tasks/FollowUpTasksPage";
import { PropertiesPage } from "../../features/properties/PropertiesPage";
import { PropertyDetailPage } from "../../features/properties/PropertyDetailPage";
import { PropertyFormPage } from "../../features/properties/PropertyFormPage";
import { TransactionDetailPage } from "../../features/transactions/TransactionDetailPage";
import { TransactionsPage } from "../../features/transactions/TransactionsPage";
import { FavoriteListingsPage } from "../../features/public-listings/FavoriteListingsPage";
import { PublicListingDetailPage } from "../../features/public-listings/PublicListingDetailPage";
import { PublicListingSearchPage } from "../../features/public-listings/PublicListingSearchPage";

export const router: Router = createBrowserRouter([
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
          <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER", "OWNER"]}>
            <AuthenticatedLayout />
          </RoleGuard>
        ),
        children: [
          {
            path: "/dashboard",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]}>
                <DashboardPage />
              </RoleGuard>
            )
          },
          { path: "/account", element: <AccountPage /> },
          {
            path: "/favorites",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]}>
                <FavoriteListingsPage />
              </RoleGuard>
            )
          },
          {
            path: "/properties",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <PropertiesPage />
              </RoleGuard>
            )
          },
          {
            path: "/properties/new",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <PropertyFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/properties/:id/edit",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <PropertyFormPage />
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
          {
            path: "/listings",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ListingsPage />
              </RoleGuard>
            )
          },
          {
            path: "/listings/new",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ListingFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/listings/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ListingDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/listings/:id/edit",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ListingFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/customers",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <CustomersPage />
              </RoleGuard>
            )
          },
          {
            path: "/customers/new",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <CustomerCreatePage />
              </RoleGuard>
            )
          },
          {
            path: "/customers/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <CustomerDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/leads",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <LeadsPage />
              </RoleGuard>
            )
          },
          {
            path: "/leads/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <LeadDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/follow-up-tasks",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <FollowUpTasksPage />
              </RoleGuard>
            )
          },
          {
            path: "/appointments",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <AppointmentsPage />
              </RoleGuard>
            )
          },
          {
            path: "/appointments/my",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <AppointmentsPage my />
              </RoleGuard>
            )
          },
          {
            path: "/appointments/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <AppointmentDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/contracts",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ContractsPage />
              </RoleGuard>
            )
          },
          {
            path: "/contracts/new",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ContractFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/contracts/:id/edit",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ContractFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/contracts/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <ContractDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/transactions",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <TransactionsPage />
              </RoleGuard>
            )
          },
          {
            path: "/transactions/:id",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <TransactionDetailPage />
              </RoleGuard>
            )
          },
          {
            path: "/commissions",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <CommissionsPage />
              </RoleGuard>
            )
          },
          {
            path: "/notifications",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]}>
                <NotificationsPage />
              </RoleGuard>
            )
          },
          {
            path: "/reports",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <ReportsPage />
              </RoleGuard>
            )
          },
          {
            path: "/ai",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT", "CUSTOMER"]}>
                <AiPage />
              </RoleGuard>
            )
          },
          {
            path: "/admin/users",
            element: (
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AdminUsersPage />
              </RoleGuard>
            )
          },
          {
            path: "/admin/audit-logs",
            element: (
              <RoleGuard allowedRoles={["ADMIN"]}>
                <AuditLogsPage />
              </RoleGuard>
            )
          }
        ]
      }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
