import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import type { RoleCode } from "../../shared/types/auth";

const roleOptions = [
  { label: "Admin demo", value: "ADMIN" },
  { label: "Manager demo", value: "MANAGER" },
  { label: "Agent demo", value: "AGENT" },
  { label: "Customer demo", value: "CUSTOMER" }
];

export function LoginPage() {
  const { isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<RoleCode>("ADMIN");
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <div>
            <p className="eyebrow">Secure access</p>
            <h1>Sign in to your workspace</h1>
          </div>
        </div>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            loginAsDemo([role]);
            navigate(from, { replace: true });
          }}
        >
          <Input label="Email" name="email" defaultValue="admin@example.com" />
          <Input label="Password" name="password" type="password" defaultValue="Strong@123" />
          <Select
            label="Demo role"
            name="role"
            options={roleOptions}
            value={role}
            onChange={(event) => setRole(event.target.value as RoleCode)}
          />
          <Button type="submit">Login</Button>
        </form>
      </div>
    </section>
  );
}

