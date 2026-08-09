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
import { useAuth } from "../../shared/auth/useAuth";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { LoginPage } from "../../features/auth/LoginPage";
import { RegisterPage } from "../../features/auth/RegisterPage";
import { CustomerCreatePage } from "../../features/customers/CustomerCreatePage";
import { CustomerDetailPage } from "../../features/customers/CustomerDetailPage";
import { CustomersPage } from "../../features/customers/CustomersPage";
import { ReportsPage } from "../../features/reports/ReportsPage";
import { ListingDetailPage } from "../../features/listings/ListingDetailPage";
import { ListingFormPage } from "../../features/listings/ListingFormPage";
import { ListingReviewQueuePage } from "../../features/listings/ListingReviewQueuePage";
import { ListingsPage } from "../../features/listings/ListingsPage";
import { LeadDetailPage } from "../../features/leads/LeadDetailPage";
import { LeadsPage } from "../../features/leads/LeadsPage";
import { FollowUpTasksPage } from "../../features/follow-up-tasks/FollowUpTasksPage";
import { OwnerPortalPage } from "../../features/owner/OwnerPortalPage";
import { PropertiesPage } from "../../features/properties/PropertiesPage";
import { PropertyDetailPage } from "../../features/properties/PropertyDetailPage";
import { PropertyFormPage } from "../../features/properties/PropertyFormPage";
import { TransactionDetailPage } from "../../features/transactions/TransactionDetailPage";
import { TransactionFormPage } from "../../features/transactions/TransactionFormPage";
import { TransactionsPage } from "../../features/transactions/TransactionsPage";
import { FavoriteListingsPage } from "../../features/public-listings/FavoriteListingsPage";
import { LandingPage } from "../../features/public-listings/LandingPage";
import { PublicListingDetailPage } from "../../features/public-listings/PublicListingDetailPage";

function AuthenticatedHomeRedirect() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];
  const href = roles.includes("OWNER") && roles.length === 1 ? "/owner/dashboard" : "/dashboard";

  return <Navigate to={href} replace />;
}

export const router: Router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/search", element: <LandingPage /> },
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
            path: "/owner/dashboard",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="dashboard" />
              </RoleGuard>
            )
          },
          {
            path: "/owner/properties",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="properties" />
              </RoleGuard>
            )
          },
          {
            path: "/owner/listings",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="listings" />
              </RoleGuard>
            )
          },
          {
            path: "/owner/documents",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="documents" />
              </RoleGuard>
            )
          },
          {
            path: "/owner/contracts",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="contracts" />
              </RoleGuard>
            )
          },
          {
            path: "/owner/transactions",
            element: (
              <RoleGuard allowedRoles={["OWNER"]}>
                <OwnerPortalPage view="transactions" />
              </RoleGuard>
            )
          },
          {
            path: "/favorites",
            element: (
              <RoleGuard allowedRoles={["CUSTOMER"]}>
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
            path: "/listings/review-queue",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <ListingReviewQueuePage />
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
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
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
            path: "/transactions/create",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <TransactionFormPage />
              </RoleGuard>
            )
          },
          {
            path: "/transactions/:id/edit",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <TransactionFormPage />
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
            element: <Navigate to="/commissions/my" replace />
          },
          {
            path: "/commissions/my",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER", "AGENT"]}>
                <CommissionsPage view="my" />
              </RoleGuard>
            )
          },
          {
            path: "/commissions/manage",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <CommissionsPage view="manage" />
              </RoleGuard>
            )
          },
          {
            path: "/commissions/rules",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <CommissionsPage view="rules" />
              </RoleGuard>
            )
          },
          {
            path: "/commissions/rules/new",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <CommissionsPage view="rule-form" />
              </RoleGuard>
            )
          },
          {
            path: "/commissions/rules/:ruleId/edit",
            element: (
              <RoleGuard allowedRoles={["ADMIN", "MANAGER"]}>
                <CommissionsPage view="rule-form" />
              </RoleGuard>
            )
          },
          {
            path: "/notifications",
            element: <AuthenticatedHomeRedirect />
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
          },
          {
            path: "/admin/audit-logs/:auditLogId",
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
