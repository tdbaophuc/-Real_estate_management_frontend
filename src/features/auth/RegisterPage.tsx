import { Link } from "react-router-dom";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";

export function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-panel">
        <div>
          <p className="eyebrow">Create account</p>
          <h1>Register your real estate workspace account</h1>
        </div>
        <form className="form-stack">
          <Input label="Full name" name="fullName" placeholder="Nguyen Van A" />
          <Input label="Email" name="email" type="email" placeholder="agent@example.com" />
          <Input label="Password" name="password" type="password" placeholder="Strong@123" />
          <Button type="button">Create account</Button>
          <Button asChild variant="ghost">
            <Link to="/login">Already have an account</Link>
          </Button>
        </form>
      </div>
    </section>
  );
}

