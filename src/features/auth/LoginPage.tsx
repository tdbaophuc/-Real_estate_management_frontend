import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { useAuth } from "../../shared/auth/useAuth";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { useText } from "../../shared/i18n/useText";
import type { RoleCode } from "../../shared/types/auth";

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().trim().email(t("validation.validEmailAddress")),
    password: z.string().min(1, t("validation.passwordRequired"))
  });
}

type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;

const roleOptions = [
  { label: "Admin demo", value: "ADMIN" },
  { label: "Manager demo", value: "MANAGER" },
  { label: "Agent demo", value: "AGENT" },
  { label: "Customer demo", value: "CUSTOMER" }
];

export function LoginPage() {
  const { t } = useTranslation();
  const tx = useText();
  const { isAuthenticated, login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginSchema = createLoginSchema(t);
  const [role, setRole] = useState<RoleCode>("ADMIN");
  const [formError, setFormError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(loginSchema)
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      Object.entries(normalizedError.fieldErrors).forEach(([field, message]) => {
        if (field === "email" || field === "password") {
          setError(field, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div className="auth-heading">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
          <div>
            <p className="eyebrow">{tx("Secure access")}</p>
            <h1>{tx("Sign in to your workspace")}</h1>
          </div>
        </div>
        <form className="form-stack" onSubmit={onSubmit}>
          <Input
            label={tx("Email")}
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={tx("Password")}
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          {formError ? <p className="form-alert">{formError}</p> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? tx("Signing in...") : tx("Login")}
          </Button>
        </form>
        <div className="auth-demo">
          <Select
            label={tx("Demo role")}
            name="role"
            options={roleOptions.map((option) => ({ ...option, label: tx(option.label) }))}
            value={role}
            onChange={(event) => setRole(event.target.value as RoleCode)}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              loginAsDemo([role]);
              navigate(from, { replace: true });
            }}
          >
            {tx("Use demo session")}
          </Button>
        </div>
      </div>
    </section>
  );
}
