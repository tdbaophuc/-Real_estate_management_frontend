import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Edit,
  Home,
  MapPin,
  Ruler,
  UserRound
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { ImageGallery } from "../../shared/ui/ImageGallery";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { getProperty, getPropertyImages, type PropertyRecord } from "./propertyApi";

function statusTone(status: string) {
  if (status === "AVAILABLE" || status === "ACTIVE") {
    return "success";
  }

  if (status === "RESERVED" || status === "DRAFT") {
    return "warning";
  }

  if (status === "SOLD" || status === "RENTED") {
    return "info";
  }

  if (status === "INACTIVE" || status === "DELETED") {
    return "danger";
  }

  return "neutral";
}

function labelStatus(status: string) {
  return statusLabels[status as keyof typeof statusLabels] ?? status;
}

function enumLabel(value: string) {
  if (!value || value === "UNKNOWN") {
    return "Updating";
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatArea(value: number | null) {
  return value ? `${value.toLocaleString("vi-VN")} m2` : "Updating";
}

function workflowSummary(status: string) {
  const steps = ["DRAFT", "AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE"];
  const activeIndex = steps.includes(status) ? steps.indexOf(status) : 0;

  return steps.map((step, index) => ({
    active: step === status,
    complete: index <= activeIndex && status !== "INACTIVE",
    label: labelStatus(step)
  }));
}

function ErrorState({
  message,
  status,
  onRetry
}: {
  message: string;
  onRetry: () => void;
  status: number;
}) {
  const title =
    status === 403
      ? "You do not have access to this property"
      : status === 404
        ? "Property not found"
        : "Property could not be loaded";

  return (
    <div className="content-section">
      <EmptyState title={title} description={message} action={<Button onClick={onRetry}>Retry</Button>} />
    </div>
  );
}

function PersonBlock({
  icon,
  label,
  person
}: {
  icon: "owner" | "agent";
  label: string;
  person: PropertyRecord["owner"];
}) {
  const Icon = icon === "owner" ? UserRound : Building2;

  return (
    <div className="property-person">
      <Icon size={18} />
      <div>
        <span>{label}</span>
        <strong>{person?.fullName ?? "Updating"}</strong>
        {person?.phone ? <small>{person.phone}</small> : null}
        {person?.email ? <small>{person.email}</small> : null}
      </div>
    </div>
  );
}

export function PropertyDetailPage() {
  const { id } = useParams();
  const propertyQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getProperty(id ?? ""),
    queryKey: ["property", id],
    retry: 1
  });
  const imagesQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getPropertyImages(id ?? ""),
    queryKey: ["property", id, "images"],
    retry: 1
  });
  const normalizedError = propertyQuery.error
    ? normalizeUnknownError(propertyQuery.error)
    : null;
  const property = propertyQuery.data;
  const images = useMemo(
    () => (imagesQuery.data?.length ? imagesQuery.data : property?.images ?? []),
    [imagesQuery.data, property?.images]
  );

  if (!id) {
    return (
      <section>
        <EmptyState title="Property not found" description="The property URL is missing an id." />
      </section>
    );
  }

  return (
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/properties">
          <ArrowLeft size={16} />
          Back to properties
        </Link>
      </Button>
      {propertyQuery.isLoading ? (
        <div className="detail-skeleton">
          <div />
          <div />
          <div />
        </div>
      ) : null}
      {normalizedError ? (
        <ErrorState
          status={normalizedError.status}
          message={normalizedError.message}
          onRetry={() => propertyQuery.refetch()}
        />
      ) : null}
      {property ? (
        <>
          <div className="detail-header">
            <div>
              <div className="detail-badges">
                <StatusBadge tone={statusTone(property.status)}>
                  {labelStatus(property.status)}
                </StatusBadge>
                {property.purpose ? (
                  <StatusBadge tone="info">
                    {property.purpose === "SALE" ? "For sale" : "For rent"}
                  </StatusBadge>
                ) : null}
              </div>
              <h1>{property.name}</h1>
              <p className="muted">
                <MapPin size={16} />
                {property.address.fullAddress}
              </p>
            </div>
            <div className="property-price-block">
              <span>Price</span>
              <strong>
                {property.price ? formatCurrency(property.price, property.currency) : "Updating"}
              </strong>
              <Button asChild variant="secondary" size="sm">
                <Link to={`/properties/${property.id}/edit`}>
                  <Edit size={16} />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
          <ImageGallery images={images} />
          <div className="detail-grid">
            <section className="content-section detail-main-section">
              <div className="property-fact-grid">
                <div>
                  <Ruler size={18} />
                  <span>Floor area</span>
                  <strong>{formatArea(property.floorArea)}</strong>
                </div>
                <div>
                  <Home size={18} />
                  <span>Land area</span>
                  <strong>{formatArea(property.landArea)}</strong>
                </div>
                <div>
                  <BedDouble size={18} />
                  <span>Bedrooms</span>
                  <strong>{property.bedrooms ?? "Updating"}</strong>
                </div>
                <div>
                  <Bath size={18} />
                  <span>Bathrooms</span>
                  <strong>{property.bathrooms ?? "Updating"}</strong>
                </div>
              </div>
              <div className="property-detail-grid">
                <div>
                  <span>Code</span>
                  <strong>{property.code}</strong>
                </div>
                <div>
                  <span>Legal status</span>
                  <strong>{enumLabel(property.legalStatus)}</strong>
                </div>
                <div>
                  <span>Furniture status</span>
                  <strong>{enumLabel(property.furnitureStatus)}</strong>
                </div>
                <div>
                  <span>Direction</span>
                  <strong>{enumLabel(property.direction)}</strong>
                </div>
                <div>
                  <span>Latitude</span>
                  <strong>{property.address.latitude ?? "Updating"}</strong>
                </div>
                <div>
                  <span>Longitude</span>
                  <strong>{property.address.longitude ?? "Updating"}</strong>
                </div>
              </div>
            </section>
            <aside className="content-section property-side-panel">
              <p className="eyebrow">People</p>
              <PersonBlock icon="owner" label="Owner" person={property.owner} />
              <PersonBlock icon="agent" label="Assigned agent" person={property.assignedAgent} />
              <div className="workflow-summary">
                <p className="eyebrow">Status workflow</p>
                {workflowSummary(property.status).map((step) => (
                  <div className={step.active ? "workflow-step active" : "workflow-step"} key={step.label}>
                    <CheckCircle2 size={16} />
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </section>
  );
}
