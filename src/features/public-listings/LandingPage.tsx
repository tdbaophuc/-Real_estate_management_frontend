import { Link } from "react-router-dom";
import { Building2, Search, ArrowRight, ShieldCheck, TrendingUp, Key } from "lucide-react";
import { Button } from "../../shared/ui/Button";

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="eyebrow">Redefining Real Estate</span>
            <h1 className="hero-title">Find Your Next <br />Exceptional Property</h1>
            <p className="hero-subtitle">
              Experience the pinnacle of real estate management. We curate the finest properties
              with transparent data, modern aesthetics, and seamless transaction processes.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-action btn-lg">
                <Search size={18} />
                Explore Properties
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Agent Portal
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80" 
              alt="Luxury modern house exterior" 
              className="hero-image"
            />
            <div className="hero-image-overlay"></div>
          </div>
        </div>
      </section>

      {/* Trust / Stats Section */}
      <section className="stats-section">
        <div className="stat-item">
          <strong className="stat-number">$2.4B+</strong>
          <span className="stat-label">Volume Processed</span>
        </div>
        <div className="stat-item">
          <strong className="stat-number">1,200+</strong>
          <span className="stat-label">Premium Listings</span>
        </div>
        <div className="stat-item">
          <strong className="stat-number">98%</strong>
          <span className="stat-label">Client Satisfaction</span>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="values-header">
          <h2>Why HeritageEstate?</h2>
          <p>We combine architectural minimalism with journalistic data gravitas.</p>
        </div>
        <div className="values-grid">
          <div className="value-item">
            <div className="value-icon"><ShieldCheck size={28} /></div>
            <h3>Verified Listings</h3>
            <p>Every property undergoes rigorous verification to ensure quality and legal compliance.</p>
          </div>
          <div className="value-item">
            <div className="value-icon"><TrendingUp size={28} /></div>
            <h3>Market Intelligence</h3>
            <p>AI-driven insights to help you make informed investment decisions.</p>
          </div>
          <div className="value-item">
            <div className="value-icon"><Key size={28} /></div>
            <h3>Secure Transactions</h3>
            <p>End-to-end digital contract management ensuring secure and fast closings.</p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-content">
          <div className="brand">
            <span className="brand-mark">
              <Building2 size={20} />
            </span>
            <span>HeritageEstate</span>
          </div>
          <p className="footer-copy">© 2026 HeritageEstate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
