import { ArrowUpDown, BedDouble, Bath, MapPin, Search } from "lucide-react";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";

const sampleListings = [
  {
    id: 1,
    title: "Central 2-bedroom apartment",
    address: "Nguyen Hue, District 1",
    price: 3500000000,
    area: 72,
    bedrooms: 2,
    bathrooms: 2,
    status: "Published"
  },
  {
    id: 2,
    title: "Townhouse for rent near business hub",
    address: "Thao Dien, Thu Duc",
    price: 28000000,
    area: 110,
    bedrooms: 3,
    bathrooms: 3,
    status: "Published"
  }
];

export function PublicListingSearchPage() {
  return (
    <section className="public-search">
      <div className="search-hero">
        <p className="eyebrow">Real estate discovery</p>
        <h1>Find properties your team can manage from lead to closing.</h1>
        <p>
          Search published listings, compare core details, and move qualified
          demand into the CRM workflow.
        </p>
      </div>
      <div className="filter-bar">
        <Input name="keyword" placeholder="Search by keyword or location" aria-label="Keyword" />
        <Select
          name="purpose"
          aria-label="Purpose"
          options={[
            { label: "Any purpose", value: "" },
            { label: "For sale", value: "SALE" },
            { label: "For rent", value: "RENT" }
          ]}
        />
        <Button>
          <Search size={16} />
          Search
        </Button>
      </div>
      <div className="section-header">
        <div>
          <p className="eyebrow">Published listings</p>
          <h2>Market-ready inventory</h2>
        </div>
        <Button variant="secondary" size="sm">
          <ArrowUpDown size={16} />
          Sort
        </Button>
      </div>
      <div className="listing-grid">
        {sampleListings.map((listing) => (
          <article className="listing-card" key={listing.id}>
            <div className="listing-image" />
            <div className="listing-body">
              <StatusBadge tone="success">{listing.status}</StatusBadge>
              <h3>{listing.title}</h3>
              <p className="muted">
                <MapPin size={15} />
                {listing.address}
              </p>
              <strong>{formatCurrency(listing.price)}</strong>
              <div className="listing-meta">
                <span>{listing.area} m2</span>
                <span><BedDouble size={15} /> {listing.bedrooms}</span>
                <span><Bath size={15} /> {listing.bathrooms}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

