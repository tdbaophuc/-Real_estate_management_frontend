import { Building2, LogIn, Search } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";
import { useText } from "../../shared/i18n/useText";
import { Button } from "../../shared/ui/Button";

export function PublicLayout() {
  const tx = useText();

  return (
    <div className="page-shell">
      <header className="public-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span>RealEstate Pro</span>
        </Link>
        <nav className="public-nav" aria-label={tx("Public navigation")}>
          <NavLink to="/">
            <Search size={16} />
            {tx("Search")}
          </NavLink>
          <LanguageSwitcher />
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">
              <LogIn size={16} />
              {tx("Login")}
            </Link>
          </Button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
