import { Building2, LogIn, Search } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "../../shared/ui/Button";

export function PublicLayout() {
  return (
    <div className="page-shell">
      <header className="public-header">
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Building2 size={20} />
          </span>
          <span>RealEstate Pro</span>
        </Link>
        <nav className="public-nav" aria-label="Public navigation">
          <NavLink to="/">
            <Search size={16} />
            Search
          </NavLink>
          <Button asChild variant="secondary" size="sm">
            <Link to="/login">
              <LogIn size={16} />
              Login
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

