import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "../../shared/auth/authApi";
import { useAuth } from "../../shared/auth/useAuth";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

const registerSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(passwordRule, "Use uppercase, lowercase, number, and special character"),
  phone: z.string().trim().optional()
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
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
            label="Full name"
            autoComplete="name"
            placeholder="Nguyen Van A"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="agent@example.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
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
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
          <Button asChild variant="ghost">
            <Link to="/login">Already have an account</Link>
          </Button>
        </form>
      </div>
    </section>
  );
}
