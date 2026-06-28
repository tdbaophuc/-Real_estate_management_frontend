import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, KeyRound, MonitorCheck, Save, ShieldCheck, Trash2, UserRound, XCircle } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { authApi } from "../../shared/auth/authApi";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FileUploader } from "../../shared/ui/FileUploader";
import { Input } from "../../shared/ui/Input";
import { formatDate } from "../../shared/lib/format";

type PasswordForm = {
  confirmPassword: string;
  currentPassword: string;
  newPassword: string;
};

const emptyPasswordForm: PasswordForm = {
  confirmPassword: "",
  currentPassword: "",
  newPassword: ""
};

function formatDateTime(value: string) {
  if (!value) {
    return "Updating";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AccountPage() {
  const { fetchCurrentUser, logout, setCurrentUser, user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [pendingSessionId, setPendingSessionId] = useState<number | string | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const sessionsQuery = useQuery({
    queryFn: authApi.getSessions,
    queryKey: ["auth", "sessions"],
    retry: 1
  });

  const profileMutation = useMutation({
    mutationFn: () =>
      authApi.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined
      }),
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser);
      setProfileSuccess("Profile updated.");
    }
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: async (updatedUser) => {
      setCurrentUser(updatedUser);
      await fetchCurrentUser();
      setProfileSuccess("Avatar updated.");
    }
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: authApi.deleteAvatar,
    onSuccess: async () => {
      await fetchCurrentUser();
      setProfileSuccess("Avatar removed.");
    }
  });

  const passwordMutation = useMutation({
    mutationFn: () => authApi.changePassword(passwordForm),
    onSuccess: () => {
      setPasswordForm(emptyPasswordForm);
      setPasswordSuccess("Password changed. Please sign in again.");
      window.setTimeout(() => {
        void logout();
      }, 900);
    }
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: number | string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      setPendingSessionId(null);
      return queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    }
  });

  const revokeAllMutation = useMutation({
    mutationFn: authApi.revokeAllSessions,
    onSuccess: () => {
      setRevokeAllOpen(false);
      return queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    }
  });

  const profileError = profileMutation.error ?? avatarMutation.error ?? deleteAvatarMutation.error;
  const passwordError = passwordMutation.error;
  const sessionError = sessionsQuery.error ?? revokeSessionMutation.error ?? revokeAllMutation.error;
  const normalizedProfileError = profileError ? normalizeUnknownError(profileError) : null;
  const normalizedPasswordError = passwordError ? normalizeUnknownError(passwordError) : null;
  const normalizedSessionError = sessionError ? normalizeUnknownError(sessionError) : null;

  useEffect(() => {
    setFullName(user?.fullName ?? "");
    setPhone(user?.phone ?? "");
  }, [user?.fullName, user?.phone]);

  function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileSuccess("");
    profileMutation.mutate();
  }

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      passwordMutation.reset();
      setPasswordSuccess("");
      return;
    }

    passwordMutation.mutate();
  }

  function updatePasswordField(field: keyof PasswordForm, value: string) {
    setPasswordForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  const passwordMismatch =
    passwordForm.confirmPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword !== passwordForm.newPassword;

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Account</p>
          <h2>Profile and security</h2>
        </div>
      </div>
      <div className="account-grid">
        <section className="content-section account-profile-card">
          <div className="account-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} />
            ) : (
              <UserRound size={32} />
            )}
            <div>
              <strong>{user?.fullName ?? "User"}</strong>
              <span>{user?.email ?? "No email"}</span>
              <small>{user?.roles.join(", ") || "No role"}</small>
            </div>
          </div>
          <form className="form-stack" onSubmit={handleProfileSubmit}>
            <Input
              label="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <Input
              label="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+84901234567"
            />
            {normalizedProfileError ? <p className="form-alert">{normalizedProfileError.message}</p> : null}
            {profileSuccess ? <p className="form-success">{profileSuccess}</p> : null}
            <div className="account-actions">
              <Button type="submit" disabled={!fullName.trim() || profileMutation.isPending}>
                <Save size={16} />
                Save profile
              </Button>
            </div>
          </form>
          <div className="account-upload">
            <FileUploader
              accept="image/*"
              onFilesSelected={(files) => {
                const file = files[0];

                if (file) {
                  setProfileSuccess("");
                  avatarMutation.mutate(file);
                }
              }}
            />
            <Button
              variant="secondary"
              disabled={!user?.avatarUrl || deleteAvatarMutation.isPending}
              onClick={() => deleteAvatarMutation.mutate()}
            >
              <Trash2 size={16} />
              Remove avatar
            </Button>
            {avatarMutation.isPending ? (
              <span className="muted">
                <Camera size={15} />
                Uploading avatar
              </span>
            ) : null}
          </div>
        </section>

        <section className="content-section">
          <div className="account-section-heading">
            <KeyRound size={18} />
            <div>
              <h3>Password</h3>
              <p className="muted">Changing password signs this session out after the backend revokes refresh tokens.</p>
            </div>
          </div>
          <form className="form-stack" onSubmit={handlePasswordSubmit}>
            <Input
              label="Current password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) => updatePasswordField("currentPassword", event.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => updatePasswordField("newPassword", event.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) => updatePasswordField("confirmPassword", event.target.value)}
              error={passwordMismatch ? "Passwords do not match" : undefined}
              required
            />
            {normalizedPasswordError ? <p className="form-alert">{normalizedPasswordError.message}</p> : null}
            {passwordSuccess ? <p className="form-success">{passwordSuccess}</p> : null}
            <div className="account-actions">
              <Button
                type="submit"
                disabled={
                  passwordMutation.isPending ||
                  passwordMismatch ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
              >
                <ShieldCheck size={16} />
                Change password
              </Button>
            </div>
          </form>
        </section>
      </div>

      <section className="content-section account-sessions">
        <div className="section-header">
          <div className="account-section-heading">
            <MonitorCheck size={18} />
            <div>
              <h3>Active sessions</h3>
              <p className="muted">Review refresh-token sessions connected to this account.</p>
            </div>
          </div>
          <Button
            variant="secondary"
            disabled={revokeAllMutation.isPending || !sessionsQuery.data?.length}
            onClick={() => setRevokeAllOpen(true)}
          >
            <XCircle size={16} />
            Revoke all
          </Button>
        </div>
        {sessionsQuery.isLoading ? (
          <EmptyState title="Loading sessions" description="Checking active sign-in sessions." />
        ) : null}
        {normalizedSessionError ? <p className="form-alert">{normalizedSessionError.message}</p> : null}
        {sessionsQuery.data?.length ? (
          <div className="session-list">
            {sessionsQuery.data.map((session) => (
              <article className="session-row" key={session.id}>
                <div>
                  <strong>Session #{session.id}</strong>
                  <span>Created {session.createdAt ? formatDate(session.createdAt) : "Updating"}</span>
                  <small>Expires {formatDateTime(session.expiresAt)}</small>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={revokeSessionMutation.isPending}
                  onClick={() => setPendingSessionId(session.id)}
                >
                  <Trash2 size={16} />
                  Revoke
                </Button>
              </article>
            ))}
          </div>
        ) : !sessionsQuery.isLoading ? (
          <EmptyState title="No sessions found" description="The backend did not return active sessions for this account." />
        ) : null}
      </section>

      <ConfirmDialog
        open={Boolean(pendingSessionId)}
        title="Revoke session"
        description={`Revoke session #${pendingSessionId}?`}
        onCancel={() => setPendingSessionId(null)}
        onConfirm={() => {
          if (pendingSessionId) {
            revokeSessionMutation.mutate(pendingSessionId);
          }
        }}
      />
      <ConfirmDialog
        open={revokeAllOpen}
        title="Revoke all sessions"
        description="Revoke every refresh-token session for this account?"
        onCancel={() => setRevokeAllOpen(false)}
        onConfirm={() => revokeAllMutation.mutate()}
      />
    </section>
  );
}
