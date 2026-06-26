import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Search, ShieldCheck } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { roleLabels } from "../../shared/constants/enumLabels";
import { formatDate } from "../../shared/lib/format";
import type { RoleCode } from "../../shared/types/auth";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { Drawer } from "../../shared/ui/Drawer";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Pagination } from "../../shared/ui/Pagination";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Table } from "../../shared/ui/Table";
import {
  adminRoleCodes,
  getAdminUser,
  searchAdminUsers,
  updateAdminUserRoles,
  updateAdminUserStatus,
  type AdminUserRecord,
  type AdminUserSearchParams
} from "./adminUserApi";

const pageSize = 10;

const statusOptions = [
  { label: "Any status", value: "" },
  { label: "Pending verification", value: "PENDING_VERIFICATION" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Locked", value: "LOCKED" }
];

const roleOptions = [
  { label: "Any role", value: "" },
  ...adminRoleCodes.map((role) => ({ label: roleLabels[role], value: role }))
];

type UserFilters = {
  keyword: string;
  role: string;
  status: string;
};

type PendingAction =
  | { nextStatus: string; type: "status"; user: AdminUserRecord }
  | { nextRoles: RoleCode[]; type: "roles"; user: AdminUserRecord }
  | null;

function statusTone(status: string) {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "LOCKED") {
    return "danger";
  }

  if (status === "PENDING_VERIFICATION") {
    return "warning";
  }

  return "neutral";
}

function formatMaybeDate(value: string) {
  if (!value) {
    return "Updating";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : formatDate(parsed);
}

function toApiParams(filters: UserFilters, page: number): AdminUserSearchParams {
  return {
    keyword: filters.keyword,
    page,
    role: filters.role,
    size: pageSize,
    status: filters.status
  };
}

function sameRoles(left: RoleCode[], right: RoleCode[]) {
  const leftSorted = [...left].sort().join("|");
  const rightSorted = [...right].sort().join("|");
  return leftSorted === rightSorted;
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<UserFilters>({ keyword: "", role: "", status: "" });
  const [committedFilters, setCommittedFilters] = useState<UserFilters>({ keyword: "", role: "", status: "" });
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<RoleCode[]>([]);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const apiParams = useMemo(() => toApiParams(committedFilters, page), [committedFilters, page]);
  const usersQuery = useQuery({
    queryFn: () => searchAdminUsers(apiParams),
    queryKey: ["admin-users", apiParams],
    retry: 1
  });
  const selectedUserQuery = useQuery({
    enabled: selectedUserId !== null,
    queryFn: () => getAdminUser(selectedUserId as number | string),
    queryKey: ["admin-user", selectedUserId],
    retry: 1
  });
  const statusMutation = useMutation({
    mutationFn: ({ nextStatus, user }: { nextStatus: string; user: AdminUserRecord }) =>
      updateAdminUserStatus(user.id, nextStatus),
    onSuccess: (user) => {
      queryClient.setQueryData(["admin-user", user.id], user);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedStatus(user.status);
      setPendingAction(null);
    }
  });
  const rolesMutation = useMutation({
    mutationFn: ({ nextRoles, user }: { nextRoles: RoleCode[]; user: AdminUserRecord }) =>
      updateAdminUserRoles(user.id, nextRoles),
    onSuccess: (user) => {
      queryClient.setQueryData(["admin-user", user.id], user);
      void queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedRoles(user.roles);
      setPendingAction(null);
    }
  });
  const normalizedError = usersQuery.error ? normalizeUnknownError(usersQuery.error) : null;
  const selectedUser = selectedUserQuery.data;

  useEffect(() => {
    if (selectedUser) {
      setSelectedStatus(selectedUser.status);
      setSelectedRoles(selectedUser.roles);
    }
  }, [selectedUser]);

  function updateFilter(field: keyof UserFilters, value: string) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCommittedFilters(filters);
    setPage(0);
  }

  function resetSearch() {
    const nextFilters = { keyword: "", role: "", status: "" };
    setFilters(nextFilters);
    setCommittedFilters(nextFilters);
    setPage(0);
  }

  function toggleRole(role: RoleCode) {
    setSelectedRoles((current) =>
      current.includes(role) ? current.filter((item) => item !== role) : [...current, role]
    );
  }

  function confirmPendingAction() {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.type === "status") {
      statusMutation.mutate({ nextStatus: pendingAction.nextStatus, user: pendingAction.user });
      return;
    }

    rolesMutation.mutate({ nextRoles: pendingAction.nextRoles, user: pendingAction.user });
  }

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>User management</h2>
        </div>
      </div>
      <form className="filter-bar admin-user-filter-bar" onSubmit={submitSearch}>
        <Input
          label="Keyword"
          placeholder="Name, email, phone"
          value={filters.keyword}
          onChange={(event) => updateFilter("keyword", event.target.value)}
        />
        <Select label="Status" options={statusOptions} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)} />
        <Select label="Role" options={roleOptions} value={filters.role} onChange={(event) => updateFilter("role", event.target.value)} />
        <div className="filter-actions">
          <Button type="submit" disabled={usersQuery.isFetching}>
            <Search size={16} />
            Search
          </Button>
          <Button type="button" variant="secondary" onClick={resetSearch}>
            Reset
          </Button>
        </div>
      </form>
      {normalizedError ? (
        <div className="content-section">
          <EmptyState
            title="Users could not be loaded"
            description={normalizedError.message}
            action={<Button onClick={() => usersQuery.refetch()}>Retry</Button>}
          />
        </div>
      ) : null}
      {usersQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
        </div>
      ) : null}
      {usersQuery.data?.content.length === 0 ? (
        <div className="content-section">
          <EmptyState title="No users found" description="Adjust filters to find matching accounts." action={<Button onClick={resetSearch}>Clear filters</Button>} />
        </div>
      ) : null}
      {usersQuery.data && usersQuery.data.content.length > 0 ? (
        <>
          <Table>
            <thead>
              <tr>
                <th>User</th>
                <th>Status</th>
                <th>Roles</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {usersQuery.data.content.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.fullName}</strong>
                    <small>{user.email || user.phone || user.id}</small>
                  </td>
                  <td><StatusBadge tone={statusTone(user.status)}>{user.status.replace(/_/g, " ")}</StatusBadge></td>
                  <td>
                    <div className="admin-role-list">
                      {user.roles.length ? user.roles.map((role) => <span key={role}>{roleLabels[role]}</span>) : <span>No roles</span>}
                    </div>
                  </td>
                  <td>{formatMaybeDate(user.createdAt)}</td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedUserId(user.id)}>
                      <Eye size={16} />
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={usersQuery.data.page} totalPages={usersQuery.data.totalPages} onPageChange={setPage} />
        </>
      ) : null}
      <Drawer open={selectedUserId !== null} title="User detail" onClose={() => setSelectedUserId(null)}>
        <div className="dialog-body admin-detail-drawer">
          {selectedUserQuery.error ? (
            <EmptyState
              title="User detail could not be loaded"
              description={normalizeUnknownError(selectedUserQuery.error).message}
              action={<Button onClick={() => selectedUserQuery.refetch()}>Retry</Button>}
            />
          ) : null}
          {selectedUserQuery.isLoading ? <div className="detail-skeleton"><div /><div /></div> : null}
          {selectedUser ? (
            <>
              <section className="admin-profile-card">
                <div>
                  <span>Name</span>
                  <strong>{selectedUser.fullName}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedUser.email || "Updating"}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedUser.phone || "Updating"}</strong>
                </div>
                <div>
                  <span>Updated</span>
                  <strong>{formatMaybeDate(selectedUser.updatedAt)}</strong>
                </div>
              </section>
              <section className="admin-action-panel">
                <h3>Status</h3>
                <Select label="Account status" options={statusOptions.filter((option) => option.value)} value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} />
                <Button
                  disabled={selectedStatus === selectedUser.status || statusMutation.isPending}
                  onClick={() => setPendingAction({ nextStatus: selectedStatus, type: "status", user: selectedUser })}
                  variant="secondary"
                >
                  <ShieldCheck size={16} />
                  Change status
                </Button>
              </section>
              <section className="admin-action-panel">
                <h3>Roles</h3>
                <div className="admin-role-editor">
                  {adminRoleCodes.map((role) => (
                    <label key={role}>
                      <input checked={selectedRoles.includes(role)} type="checkbox" onChange={() => toggleRole(role)} />
                      <span>{roleLabels[role]}</span>
                    </label>
                  ))}
                </div>
                <Button
                  disabled={!selectedRoles.length || sameRoles(selectedRoles, selectedUser.roles) || rolesMutation.isPending}
                  onClick={() => setPendingAction({ nextRoles: selectedRoles, type: "roles", user: selectedUser })}
                  variant="secondary"
                >
                  <ShieldCheck size={16} />
                  Save roles
                </Button>
                <small className="muted">The full selected role set will be sent, so unchanged roles stay assigned.</small>
              </section>
              {statusMutation.error || rolesMutation.error ? (
                <p className="form-alert">{normalizeUnknownError(statusMutation.error ?? rolesMutation.error).message}</p>
              ) : null}
            </>
          ) : null}
        </div>
      </Drawer>
      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction?.type === "roles" ? "Confirm role update" : "Confirm status update"}
        description={
          pendingAction?.type === "roles"
            ? `Replace roles for ${pendingAction.user.fullName} with ${pendingAction.nextRoles.map((role) => roleLabels[role]).join(", ")}?`
            : `Change ${pendingAction?.user.fullName ?? "this user"} status to ${pendingAction?.nextStatus.replace(/_/g, " ")}?`
        }
        onCancel={() => setPendingAction(null)}
        onConfirm={confirmPendingAction}
      />
    </section>
  );
}
