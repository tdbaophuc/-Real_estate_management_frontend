import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { authApi } from "../../shared/auth/authApi";
import { useAuth } from "../../shared/auth/useAuth";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

function createRegisterSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().trim().email(t("validation.validEmailAddress")),
    fullName: z.string().trim().min(2, t("validation.fullNameMin")),
    password: z
      .string()
      .min(8, t("validation.passwordMin"))
      .regex(passwordRule, t("validation.passwordComplexity")),
    phone: z.string().trim().optional()
  });
}

type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function RegisterPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const registerSchema = createRegisterSchema(t);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      phone: ""
    },
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccessMessage(null);

    try {
      await authApi.register({
        email: values.email,
        fullName: values.fullName,
        password: values.password,
        phone: values.phone || undefined
      });
      await login({
        email: values.email,
        password: values.password
      });
      setSuccessMessage("Account created. Redirecting to your dashboard...");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const normalizedError = normalizeUnknownError(error);

      Object.entries(normalizedError.fieldErrors).forEach(([field, message]) => {
        if (
          field === "email" ||
          field === "fullName" ||
          field === "password" ||
          field === "phone"
        ) {
          setError(field, { message });
        }
      });

      setFormError(normalizedError.message);
    }
  });

  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div>
          <p className="eyebrow">Create account</p>
          <h1>Register your real estate workspace account</h1>
        </div>
        <form className="form-stack" onSubmit={onSubmit}>
          <Input
            label={t("common.fullName")}
            autoComplete="name"
            placeholder="Nguyen Van A"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label={t("common.email")}
            type="email"
            autoComplete="email"
            placeholder="agent@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label={t("common.phone")}
            type="tel"
            autoComplete="tel"
            placeholder="0900000000"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Strong@123"
            error={errors.password?.message}
            {...register("password")}
          />
          {formError ? <p className="form-alert">{formError}</p> : null}
          {successMessage ? <p className="form-success">{successMessage}</p> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("actions.creatingAccount") : t("actions.createAccount")}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/login">Already have an account</Link>
          </Button>
        </form>
      </div>
    </section>
  );
}
