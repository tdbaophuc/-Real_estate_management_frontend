import { useState } from "react";
import { Building2, LogIn, Search, Sparkles } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { PublicAiAssistantPanel } from "../../features/public-listings/PublicAiAssistantPanel";
import { LanguageSwitcher } from "../../shared/i18n/LanguageSwitcher";
import { useText } from "../../shared/i18n/useText";
import { Button } from "../../shared/ui/Button";

export function PublicLayout() {
  const tx = useText();
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

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
          <NavLink to="/search">
            <Search size={16} />
            {tx("Search")}
          </NavLink>
          <Button
            type="button"
            variant={isAiAssistantOpen ? "primary" : "secondary"}
            size="sm"
            onClick={() => setIsAiAssistantOpen((current) => !current)}
          >
            <Sparkles size={16} />
            AI assistant
          </Button>
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
      {isAiAssistantOpen ? <PublicAiAssistantPanel onClose={() => setIsAiAssistantOpen(false)} /> : null}
    </div>
  );
}
