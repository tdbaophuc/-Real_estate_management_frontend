import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bath, BedDouble, Heart, MapPin } from "lucide-react";
import { Button } from "../../shared/ui/Button";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { ImageGallery } from "../../shared/ui/ImageGallery";
import { formatCurrency } from "../../shared/lib/format";

export function PublicListingDetailPage() {
  const { slug } = useParams();

  return (
    <section className="detail-page">
      <Button asChild variant="ghost" size="sm">
        <Link to="/">
          <ArrowLeft size={16} />
          Back to search
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <StatusBadge tone="success">Published</StatusBadge>
          <h1>{slug ?? "central-2-bedroom-apartment"}</h1>
          <p className="muted">
            <MapPin size={16} />
            Nguyen Hue, District 1
          </p>
        </div>
        <Button variant="secondary">
          <Heart size={17} />
          Favorite
        </Button>
      </div>
      <ImageGallery
        images={[
          {
            id: 1,
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            alt: "Modern apartment"
          }
        ]}
      />
      <div className="detail-grid">
        <section className="content-section">
          <h2>{formatCurrency(3500000000)}</h2>
          <div className="listing-meta large">
            <span>72 m2</span>
            <span><BedDouble size={16} /> 2 bedrooms</span>
            <span><Bath size={16} /> 2 bathrooms</span>
          </div>
          <p>
            Professional listing detail foundation. Backend integration will
            replace this placeholder with /api/v1/search/listings/:slug data.
          </p>
        </section>
        <aside className="content-section">
          <p className="eyebrow">Contact</p>
          <h3>Assigned agent</h3>
          <p className="muted">Contact workflow will connect with CRM and lead APIs.</p>
          <Button>Request consultation</Button>
        </aside>
      </div>
    </section>
  );
}

