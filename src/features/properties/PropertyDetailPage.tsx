import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Edit,
  Home,
  ImagePlus,
  MapPin,
  Ruler,
  Star,
  Trash2,
  UserRound
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FileUploader } from "../../shared/ui/FileUploader";
import { ImageGallery } from "../../shared/ui/ImageGallery";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import {
  deletePropertyImage,
  getProperty,
  getPropertyImages,
  setPropertyCoverImage,
  type PropertyImage,
  type PropertyRecord,
  updatePropertyStatus,
  uploadPropertyImage
} from "./propertyApi";

const propertyStatusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Sold", value: "SOLD" },
  { label: "Rented", value: "RENTED" },
  { label: "Inactive", value: "INACTIVE" }
];

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

function ImageManagementPanel({
  images,
  isBusy,
  onDelete,
  onSetCover,
  onUpload
}: {
  images: PropertyImage[];
  isBusy: boolean;
  onDelete: (imageId: number | string) => void;
  onSetCover: (imageId: number | string) => void;
  onUpload: (request: { altText: string; displayOrder: number; file: File }) => void;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      return;
    }

    onUpload({
      altText,
      displayOrder: Number(displayOrder || 0),
      file: selectedFile
    });
    setSelectedFile(null);
    setAltText("");
    setDisplayOrder("0");
  }

  return (
    <section className="content-section property-image-manager">
      <div className="section-header">
        <div>
          <p className="eyebrow">Images</p>
          <h2>Image management</h2>
        </div>
      </div>
      <form className="property-image-upload" onSubmit={handleSubmit}>
        <FileUploader
          accept="image/*"
          onFilesSelected={(files) => setSelectedFile(files[0] ?? null)}
        />
        <Input
          label="Alt text"
          value={altText}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="Mat tien"
        />
        <Input
          label="Display order"
          type="number"
          min={0}
          value={displayOrder}
          onChange={(event) => setDisplayOrder(event.target.value)}
        />
        <Button type="submit" disabled={!selectedFile || isBusy}>
          <ImagePlus size={16} />
          Upload image
        </Button>
      </form>
      {selectedFile ? <p className="muted">Selected: {selectedFile.name}</p> : null}
      <div className="property-image-list">
        {images.length ? (
          images.map((image) => (
            <article className="property-image-row" key={image.id}>
              <img src={image.url} alt={image.alt ?? "Property"} />
              <div>
                <strong>{image.alt || "No alt text"}</strong>
                <span>Order {image.displayOrder}</span>
                {image.isCover ? <StatusBadge tone="success">Cover</StatusBadge> : null}
              </div>
              <div className="property-image-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onSetCover(image.id)}
                  disabled={image.isCover || isBusy}
                >
                  <Star size={16} />
                  Set cover
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(image.id)}
                  disabled={isBusy}
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No images" description="Upload property images before publishing workflows." />
        )}
      </div>
    </section>
  );
}

export function PropertyDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [nextStatus, setNextStatus] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
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
    () => (imagesQuery.data ? imagesQuery.data : property?.images ?? []),
    [imagesQuery.data, property?.images]
  );
  const invalidatePropertyData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["property", id] }),
      queryClient.invalidateQueries({ queryKey: ["property", id, "images"] }),
      queryClient.invalidateQueries({ queryKey: ["properties"] })
    ]);
  const uploadMutation = useMutation({
    mutationFn: (request: { altText: string; displayOrder: number; file: File }) =>
      uploadPropertyImage(id ?? "", request),
    onSuccess: invalidatePropertyData
  });
  const deleteMutation = useMutation({
    mutationFn: (imageId: number | string) => deletePropertyImage(id ?? "", imageId),
    onSuccess: invalidatePropertyData
  });
  const coverMutation = useMutation({
    mutationFn: (imageId: number | string) => setPropertyCoverImage(id ?? "", imageId),
    onSuccess: invalidatePropertyData
  });
  const statusMutation = useMutation({
    mutationFn: (status: string) => updatePropertyStatus(id ?? "", status),
    onSuccess: () => {
      setPendingStatus("");
      setNextStatus("");
      return invalidatePropertyData();
    }
  });
  const actionError =
    uploadMutation.error ??
    deleteMutation.error ??
    coverMutation.error ??
    statusMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const imageActionBusy =
    uploadMutation.isPending || deleteMutation.isPending || coverMutation.isPending;
  const selectedStatus = nextStatus || property?.status || "";

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
          <ImageManagementPanel
            images={images}
            isBusy={imageActionBusy}
            onUpload={(request) => uploadMutation.mutate(request)}
            onDelete={(imageId) => deleteMutation.mutate(imageId)}
            onSetCover={(imageId) => coverMutation.mutate(imageId)}
          />
          {normalizedActionError ? (
            <div className="form-error" role="alert">
              {normalizedActionError.message}
            </div>
          ) : null}
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
                <div className="status-action-form">
                  <Select
                    label="New status"
                    options={propertyStatusOptions}
                    value={selectedStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                  />
                  <Button
                    variant="secondary"
                    disabled={!selectedStatus || selectedStatus === property.status || statusMutation.isPending}
                    onClick={() => setPendingStatus(selectedStatus)}
                  >
                    Change status
                  </Button>
                </div>
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
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change property status"
        description={`Change status from ${labelStatus(property?.status ?? "")} to ${labelStatus(pendingStatus)}?`}
        onCancel={() => setPendingStatus("")}
        onConfirm={() => statusMutation.mutate(pendingStatus)}
      />
    </section>
  );
}
