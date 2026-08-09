import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  Copy,
  DollarSign,
  Download,
  Edit,
  FileText,
  FilePlus2,
  Home,
  ImagePlus,
  MapPin,
  Ruler,
  Sparkles,
  Star,
  Tag,
  Trash2,
  UserRound
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { downloadFile, updateFileAccessLevel, type FileAccessLevel } from "../../shared/api/fileApi";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { FileUploader } from "../../shared/ui/FileUploader";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { searchAdminUsers } from "../admin/adminUserApi";
import { analyzePropertyImage, type ImageAnalysisSuggestion } from "../ai/aiApi";
import { searchContracts, type ContractRecord } from "../contracts/contractApi";
import { searchListings, type ListingRecord } from "../listings/listingApi";
import {
  deletePropertyImage,
  deleteProperty,
  deletePropertyLegalDocument,
  getProperty,
  getPropertyImages,
  getPropertyLegalDocuments,
  reorderPropertyImages,
  setPropertyCoverImage,
  type LegalDocumentUpdateRequest,
  type LegalDocumentVerificationRequest,
  type PropertyLegalDocument,
  type PropertyImage,
  type PropertyRecord,
  updatePropertyStatus,
  updatePropertyImageMetadata,
  updatePropertyLegalDocument,
  uploadPropertyImage,
  uploadPropertyLegalDocument,
  verifyPropertyLegalDocument
} from "./propertyApi";

const propertyStatusOptions = [
  { label: "Draft", value: "DRAFT" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Sold", value: "SOLD" },
  { label: "Rented", value: "RENTED" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Deleted", value: "DELETED" }
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
  const steps = ["DRAFT", "AVAILABLE", "RESERVED", "SOLD", "RENTED", "INACTIVE", "DELETED"];
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

function PropertyTitleStatus({ property }: { property: PropertyRecord }) {
  return (
    <div className="property-title-row">
      <h1>{property.name}</h1>
      <span className={`property-inline-status property-inline-status-${statusTone(property.status)}`}>
        <Check size={14} />
        {labelStatus(property.status)}
      </span>
    </div>
  );
}

function ImageManagementPanel({
  images,
  isBusy,
  onDelete,
  onReorder,
  onSetCover,
  onUpdateMetadata,
  onUpload,
  propertyId
}: {
  images: PropertyImage[];
  isBusy: boolean;
  onDelete: (imageId: number | string) => void;
  onReorder: (items: Array<{ displayOrder: number; imageId: number | string }>) => void;
  onSetCover: (imageId: number | string) => void;
  onUpdateMetadata: (imageId: number | string, request: { altText?: string; displayOrder?: number }) => void;
  onUpload: (request: { altText: string; displayOrder: number; file: File }) => void;
  propertyId: number | string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [analysisByImage, setAnalysisByImage] = useState<Record<string, ImageAnalysisSuggestion>>({});
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const [metadataDrafts, setMetadataDrafts] = useState<Record<string, { altText: string; displayOrder: string }>>({});
  const analysisMutation = useMutation({
    mutationFn: (image: PropertyImage) =>
      analyzePropertyImage({ imageId: image.id }),
    onSuccess: (analysis, image) => {
      const key = String(image.id);
      setAnalysisByImage((current) => ({ ...current, [key]: analysis }));
      setCaptionDrafts((current) => ({ ...current, [key]: analysis.caption || analysis.summary }));
    }
  });
  const analysisError = analysisMutation.error ? normalizeUnknownError(analysisMutation.error) : null;
  const storageUsedBytes = images.reduce((total, image) => total + (image.fileSize ?? 0), 0);
  const storageUsedMb = storageUsedBytes / 1024 / 1024;

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

  function copyText(value: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(value);
    }
  }

  function getMetadataDraft(image: PropertyImage) {
    return metadataDrafts[String(image.id)] ?? {
      altText: image.alt ?? "",
      displayOrder: String(image.displayOrder)
    };
  }

  function updateMetadataDraft(imageId: number | string, field: "altText" | "displayOrder", value: string) {
    setMetadataDrafts((current) => ({
      ...current,
      [String(imageId)]: {
        altText: current[String(imageId)]?.altText ?? images.find((image) => String(image.id) === String(imageId))?.alt ?? "",
        displayOrder: current[String(imageId)]?.displayOrder ?? String(images.find((image) => String(image.id) === String(imageId))?.displayOrder ?? 0),
        [field]: value
      }
    }));
  }

  return (
    <section className="content-section property-image-manager">
      <div className="section-header">
        <div>
          <p className="eyebrow">Images</p>
          <h2>Image management</h2>
        </div>
      </div>
      <div className="property-image-management-grid">
        <aside className="property-image-upload-card">
          <form className="property-image-upload" onSubmit={handleSubmit}>
            <div className="property-upload-zone">
              <FileUploader
                accept="image/*"
                onFilesSelected={(files) => setSelectedFile(files[0] ?? null)}
              />
              <strong>Drag & drop image files here</strong>
              <span>or choose a local image to upload.</span>
            </div>
            <Input
              label="Alt text"
              value={altText}
              onChange={(event) => setAltText(event.target.value)}
              placeholder="Describe the uploaded image"
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
          <div className="property-storage-usage">
            <div>
              <span>Storage Usage</span>
              <strong>{storageUsedBytes ? `${storageUsedMb.toFixed(2)} MB used` : "No image size returned"}</strong>
            </div>
            <progress value={storageUsedBytes ? 1 : 0} max={1} />
            <small>Storage limit is not returned by the property images API.</small>
          </div>
        </aside>
        <div className="property-image-list">
          {images.length ? (
            images.map((image) => (
              <article className="property-image-row" key={image.id}>
                <img src={image.url} alt={image.alt ?? "Property"} />
                <div>
                  <strong>{image.fileName || image.alt || "Property image"}</strong>
                  <span>Order {image.displayOrder}</span>
                  {image.isCover ? <StatusBadge tone="success">Cover</StatusBadge> : null}
                </div>
                <Input
                  label="Alt text"
                  value={getMetadataDraft(image).altText}
                  onChange={(event) => updateMetadataDraft(image.id, "altText", event.target.value)}
                />
                <Input
                  label="Order"
                  type="number"
                  value={getMetadataDraft(image).displayOrder}
                  onChange={(event) => updateMetadataDraft(image.id, "displayOrder", event.target.value)}
                />
                <div className="property-image-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const draft = getMetadataDraft(image);
                      onUpdateMetadata(image.id, {
                        altText: draft.altText,
                        displayOrder: Number(draft.displayOrder || 0)
                      });
                    }}
                    disabled={isBusy}
                  >
                    Save metadata
                  </Button>
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
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => analysisMutation.mutate(image)}
                    disabled={analysisMutation.isPending}
                  >
                    <Sparkles size={16} />
                    Analyze
                  </Button>
                </div>
              {analysisByImage[String(image.id)] ? (
                <div className="property-image-ai-suggestion">
                  <div>
                    <span>AI suggestion</span>
                    <strong>{analysisByImage[String(image.id)].quality}</strong>
                  </div>
                  <p>{analysisByImage[String(image.id)].summary}</p>
                  {analysisByImage[String(image.id)].coverRecommendation ? (
                    <p>{analysisByImage[String(image.id)].coverRecommendation}</p>
                  ) : null}
                  {analysisByImage[String(image.id)].warnings.length ? (
                    <ul>
                      {analysisByImage[String(image.id)].warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  ) : null}
                  <label className="field">
                    <span>Editable caption draft</span>
                    <textarea
                      className="input textarea"
                      value={captionDrafts[String(image.id)] ?? ""}
                      onChange={(event) =>
                        setCaptionDrafts((current) => ({
                          ...current,
                          [String(image.id)]: event.target.value
                        }))
                      }
                    />
                  </label>
                  <div className="property-image-actions">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyText(captionDrafts[String(image.id)] ?? "")}
                    >
                      <Copy size={16} />
                      Copy caption
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setAltText(captionDrafts[String(image.id)] ?? "")}
                    >
                      Use as upload alt text
                    </Button>
                  </div>
                </div>
                ) : null}
              </article>
            ))
          ) : (
            <EmptyState title="No images" description="Upload property images before publishing workflows." />
          )}
        </div>
      </div>
      {images.length > 1 ? (
        <div className="property-image-actions">
          <Button
            variant="secondary"
            onClick={() =>
              onReorder(
                images.map((image) => ({
                  displayOrder: Number(getMetadataDraft(image).displayOrder || image.displayOrder),
                  imageId: image.id
                }))
              )
            }
            disabled={isBusy}
          >
            Save image order
          </Button>
        </div>
      ) : null}
      {analysisError ? <p className="form-alert">{analysisError.message}</p> : null}
      <p className="muted">
        AI image analysis is a draft suggestion for copy/edit review only. It does not publish, change legal status, or make financial conclusions.
      </p>
    </section>
  );
}

const legalDocumentTypeOptions = [
  { label: "Pink book", value: "PINK_BOOK" },
  { label: "Red book", value: "RED_BOOK" },
  { label: "Ownership certificate", value: "OWNERSHIP_CERTIFICATE" },
  { label: "Land use certificate", value: "LAND_USE_CERTIFICATE" },
  { label: "Sale contract", value: "SALE_CONTRACT" },
  { label: "Construction permit", value: "CONSTRUCTION_PERMIT" },
  { label: "Other", value: "OTHER" }
];

const verificationStatusOptions = [
  { label: "Unverified", value: "UNVERIFIED" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" }
];

function legalStatusTone(status: string) {
  if (status === "VERIFIED") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  return "warning";
}

function hasAnyRole(roles: string[], allowedRoles: string[]) {
  return roles.some((role) => allowedRoles.includes(role));
}

const propertyTabs = ["Overview", "Images", "Legal Documents", "Amenities", "History"] as const;
type PropertyTab = (typeof propertyTabs)[number];

function PropertyHeroGallery({ images, propertyName }: { images: PropertyImage[]; propertyName: string }) {
  const cover = images.find((image) => image.isCover) ?? images[0];
  const thumbnails = images.filter((image) => image.id !== cover?.id).slice(0, 4);

  if (!cover) {
    return <EmptyState title="No images" description="Images added to this property will appear here." />;
  }

  return (
    <section className="property-hero-gallery">
      <figure className="property-hero-image">
        <img src={cover.url} alt={cover.alt ?? propertyName} />
        <span className="property-view-all-images">View All ({images.length})</span>
      </figure>
      <div className="property-thumbnail-grid">
        {thumbnails.map((image) => (
          <figure key={image.id}>
            <img src={image.url} alt={image.alt ?? propertyName} />
          </figure>
        ))}
      </div>
    </section>
  );
}

function FactItem({
  icon,
  label,
  value
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <span className="property-fact-label">
        {icon}
        {label}
      </span>
      <strong>{value}</strong>
    </div>
  );
}

function groupAmenities(amenities: PropertyRecord["amenities"]) {
  return amenities.reduce<Record<string, PropertyRecord["amenities"]>>((groups, amenity) => {
    const category = amenity.category ? enumLabel(amenity.category) : "Other";
    groups[category] = [...(groups[category] ?? []), amenity];
    return groups;
  }, {});
}

function AmenityIcon({ category }: { category?: string }) {
  if (/SECURITY/i.test(category ?? "")) {
    return <CheckCircle2 size={15} />;
  }

  if (/ACCESS|BUILDING|COMMUNITY/i.test(category ?? "")) {
    return <Building2 size={15} />;
  }

  return <Home size={15} />;
}

function PropertySidebar({
  linkedContracts,
  linkedListings,
  property
}: {
  linkedContracts: ContractRecord[];
  linkedListings: ListingRecord[];
  property: PropertyRecord;
}) {
  return (
    <aside className="property-overview-side">
      <section className="content-section property-map-card">
        <div className="property-side-card-header">
          <h2>Location</h2>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              property.address.latitude && property.address.longitude
                ? `${property.address.latitude},${property.address.longitude}`
                : property.address.fullAddress
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            View Map
          </a>
        </div>
        <div className="property-map-body">
          <MapPin size={22} />
          <strong>{property.address.streetAddress || property.address.fullAddress}</strong>
          {property.address.streetAddress ? <span>{property.address.fullAddress}</span> : null}
          <span>{property.address.latitude && property.address.longitude ? `${property.address.latitude}, ${property.address.longitude}` : "Coordinates updating"}</span>
        </div>
      </section>
      <section className="content-section property-linked-entities">
        <div className="property-side-card-header">
          <h2>Linked Entities</h2>
          <Link to={`/listings/new?propertyId=${encodeURIComponent(String(property.id))}`}>New Listing</Link>
        </div>
        <div className="property-linked-list">
          {linkedListings.map((listing) => (
            <Link key={`listing-${listing.id}`} to={`/listings/${listing.id}`}>
              <FilePlus2 size={17} />
              <span>
                <strong>{listing.title}</strong>
                <small>{listing.code} / {labelStatus(listing.status)}</small>
              </span>
              <ChevronRight size={16} />
            </Link>
          ))}
          {linkedContracts.map((contract) => (
            <Link key={`contract-${contract.id}`} to={`/contracts/${contract.id}`}>
              <FileText size={17} />
              <span>
                <strong>{contract.title}</strong>
                <small>{contract.code} / {labelStatus(contract.status)}</small>
              </span>
              <ChevronRight size={16} />
            </Link>
          ))}
          {!linkedListings.length && !linkedContracts.length ? (
            <p className="muted">No linked listings or contracts returned by the API.</p>
          ) : null}
        </div>
      </section>
      <section className="content-section property-side-panel property-people-panel">
        <h2>People</h2>
        <PersonBlock icon="owner" label="Owner" person={property.owner} />
        <PersonBlock icon="agent" label="Assigned agent" person={property.assignedAgent} />
      </section>
      <section className="content-section property-side-panel">
        <h2>Amenities</h2>
        {property.amenities.length ? (
          <div className="property-amenity-groups">
            {Object.entries(groupAmenities(property.amenities)).map(([category, amenities]) => (
              <div key={category}>
                <strong>{category}</strong>
                <div className="property-amenity-list">
                  {amenities.slice(0, 6).map((amenity) => (
                    <span key={amenity.id}>
                      <AmenityIcon category={amenity.category} />
                      {amenity.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No amenities returned by the property API.</p>
        )}
      </section>
    </aside>
  );
}

function LegalDocumentsPanel({
  documents,
  isLoading,
  onChanged,
  propertyId,
  roles
}: {
  documents: PropertyLegalDocument[];
  isLoading: boolean;
  onChanged: () => Promise<unknown>;
  propertyId: number | string;
  roles: string[];
}) {
  const canVerify = hasAnyRole(roles, ["ADMIN", "MANAGER"]);
  const canManageAccess = canVerify;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("PINK_BOOK");
  const [documentNumber, setDocumentNumber] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [isIssuedByFocused, setIsIssuedByFocused] = useState(false);
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editDraft, setEditDraft] = useState<LegalDocumentUpdateRequest>({
    documentType: "PINK_BOOK"
  });
  const [verificationDrafts, setVerificationDrafts] = useState<Record<string, string>>({});
  const issuedByQuery = useQuery({
    enabled: issuedBy.trim().length > 0,
    queryFn: () => searchAdminUsers({ keyword: issuedBy.trim(), page: 0, size: 8 }),
    queryKey: ["property-legal-issued-by-users", issuedBy.trim()],
    retry: 1
  });
  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Choose a legal document to upload.");
      }

      return uploadPropertyLegalDocument(propertyId, {
        documentNumber,
        documentType,
        expiryDate: expiryDate || undefined,
        file: selectedFile,
        issuedBy: issuedBy || undefined,
        issuedDate: issuedDate || undefined,
        notes: notes || undefined
      });
    },
    onSuccess: () => {
      setSelectedFile(null);
      setDocumentNumber("");
      setIssuedBy("");
      setIssuedDate("");
      setExpiryDate("");
      setNotes("");
      return onChanged();
    }
  });
  const updateMutation = useMutation({
    mutationFn: ({ documentId, request }: { documentId: number | string; request: LegalDocumentUpdateRequest }) =>
      updatePropertyLegalDocument(propertyId, documentId, request),
    onSuccess: () => {
      setEditingId(null);
      return onChanged();
    }
  });
  const verifyMutation = useMutation({
    mutationFn: ({ documentId, request }: { documentId: number | string; request: LegalDocumentVerificationRequest }) =>
      verifyPropertyLegalDocument(propertyId, documentId, request),
    onSuccess: onChanged
  });
  const deleteMutation = useMutation({
    mutationFn: (documentId: number | string) => deletePropertyLegalDocument(propertyId, documentId),
    onSuccess: onChanged
  });
  const downloadMutation = useMutation({
    mutationFn: (document: PropertyLegalDocument) => {
      if (document.fileId) {
        return downloadFile(document.fileId, document.fileName);
      }

      if (document.publicUrl) {
        window.open(document.publicUrl, "_blank", "noopener,noreferrer");
        return Promise.resolve();
      }

      throw new Error("No downloadable file is linked to this document.");
    }
  });
  const accessMutation = useMutation({
    mutationFn: ({ accessLevel, fileId }: { accessLevel: FileAccessLevel; fileId: number | string }) =>
      updateFileAccessLevel(fileId, accessLevel),
    onSuccess: onChanged
  });
  const actionError =
    uploadMutation.error ??
    updateMutation.error ??
    verifyMutation.error ??
    deleteMutation.error ??
    downloadMutation.error ??
    accessMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  function startEdit(document: PropertyLegalDocument) {
    setEditingId(document.id);
    setEditDraft({
      documentNumber: document.documentNumber || undefined,
      documentType: document.documentType,
      expiryDate: document.expiryDate || undefined,
      issuedBy: document.issuedBy || undefined,
      issuedDate: document.issuedDate || undefined,
      notes: document.notes || undefined
    });
  }

  function updateVerificationNotes(documentId: number | string, value: string) {
    setVerificationDrafts((current) => ({
      ...current,
      [String(documentId)]: value
    }));
  }

  return (
    <section className="content-section property-legal-documents">
      <div className="section-header">
        <div>
          <p className="eyebrow">Legal</p>
          <h2>Legal documents</h2>
        </div>
        <FileText size={20} />
      </div>
      <form
        className="legal-document-upload"
        onSubmit={(event) => {
          event.preventDefault();
          uploadMutation.mutate();
        }}
      >
        <div className="legal-document-dropzone">
          <FileUploader onFilesSelected={(files) => setSelectedFile(files[0] ?? null)} />
          <strong>Drag & drop legal document here</strong>
          <span>Upload ownership, certificate, permit, or sale contract files.</span>
          {selectedFile ? <small>Selected: {selectedFile.name}</small> : null}
        </div>
        <div className="legal-document-upload-fields">
          <Select
            label="Document type"
            options={legalDocumentTypeOptions}
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value)}
          />
          <Input label="Document number" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
          <div className="legal-issued-by-picker">
            <label className="field">
              <span>Issued by</span>
              <span className="legal-issued-by-input">
                <UserRound size={15} />
                <input
                  className="input"
                  value={issuedBy}
                  placeholder="Search issuing user"
                  onBlur={() => window.setTimeout(() => setIsIssuedByFocused(false), 140)}
                  onChange={(event) => setIssuedBy(event.target.value)}
                  onFocus={() => setIsIssuedByFocused(true)}
                />
              </span>
            </label>
            {isIssuedByFocused && issuedBy.trim() ? (
              <div className="legal-issued-by-suggestions">
                {issuedByQuery.isLoading ? <span>Searching users...</span> : null}
                {issuedByQuery.data?.content.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setIssuedBy(user.email ? `${user.fullName} / ${user.email}` : user.fullName);
                      setIsIssuedByFocused(false);
                    }}
                  >
                    <strong>{user.fullName}</strong>
                    <small>{user.email || `User #${user.id}`}</small>
                  </button>
                ))}
                {!issuedByQuery.isLoading && !issuedByQuery.data?.content.length ? <span>No matching users.</span> : null}
              </div>
            ) : null}
          </div>
          <Input label="Issued date" type="date" value={issuedDate} onChange={(event) => setIssuedDate(event.target.value)} />
          <Input label="Expiry date" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
          <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
          <Button type="submit" disabled={!selectedFile || uploadMutation.isPending}>
            <FilePlus2 size={16} />
            Upload document
          </Button>
        </div>
      </form>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      {isLoading ? <EmptyState title="Loading legal documents" description="Checking property document records." /> : null}
      {!isLoading ? (
        <div className="legal-document-list">
          {documents.length ? (
            documents.map((document) => (
              <article className="legal-document-row" key={document.id}>
                <div>
                  <div className="detail-badges">
                    <StatusBadge tone={legalStatusTone(document.verificationStatus)}>
                      {enumLabel(document.verificationStatus)}
                    </StatusBadge>
                    <StatusBadge tone="info">{enumLabel(document.documentType)}</StatusBadge>
                  </div>
                  <h3>{document.fileName}</h3>
                  <p className="muted">
                    {[document.documentNumber, document.issuedBy, document.issuedDate].filter(Boolean).join(" / ") || "Metadata updating"}
                  </p>
                  {document.notes ? <p>{document.notes}</p> : null}
                </div>
                {editingId === document.id ? (
                  <form
                    className="legal-document-edit"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateMutation.mutate({ documentId: document.id, request: editDraft });
                    }}
                  >
                    <Select
                      label="Document type"
                      options={legalDocumentTypeOptions}
                      value={editDraft.documentType}
                      onChange={(event) => setEditDraft((current) => ({ ...current, documentType: event.target.value }))}
                    />
                    <Input
                      label="Document number"
                      value={editDraft.documentNumber ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, documentNumber: event.target.value }))}
                    />
                    <Input
                      label="Issued by"
                      value={editDraft.issuedBy ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, issuedBy: event.target.value }))}
                    />
                    <Input
                      label="Issued date"
                      type="date"
                      value={editDraft.issuedDate ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, issuedDate: event.target.value }))}
                    />
                    <Input
                      label="Expiry date"
                      type="date"
                      value={editDraft.expiryDate ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, expiryDate: event.target.value }))}
                    />
                    <Input
                      label="Notes"
                      value={editDraft.notes ?? ""}
                      onChange={(event) => setEditDraft((current) => ({ ...current, notes: event.target.value }))}
                    />
                    <div className="legal-document-actions">
                      <Button type="submit" size="sm" disabled={updateMutation.isPending}>Save</Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </form>
                ) : null}
                <div className="legal-document-actions">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={downloadMutation.isPending}
                    onClick={() => downloadMutation.mutate(document)}
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(document)}>
                    <Edit size={16} />
                    Edit
                  </Button>
                  {canVerify ? (
                    <>
                      <Select
                        label="Verification"
                        options={verificationStatusOptions}
                        defaultValue={document.verificationStatus}
                        onChange={(event) =>
                          verifyMutation.mutate({
                            documentId: document.id,
                            request: {
                              notes: verificationDrafts[String(document.id)] || undefined,
                              verificationStatus: event.target.value
                            }
                          })
                        }
                      />
                      <Input
                        label="Review notes"
                        value={verificationDrafts[String(document.id)] ?? ""}
                        onChange={(event) => updateVerificationNotes(document.id, event.target.value)}
                      />
                    </>
                  ) : null}
                  {canManageAccess && document.fileId ? (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={accessMutation.isPending}
                        onClick={() => accessMutation.mutate({ accessLevel: "PUBLIC", fileId: document.fileId as number | string })}
                      >
                        Public
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={accessMutation.isPending}
                        onClick={() => accessMutation.mutate({ accessLevel: "PRIVATE", fileId: document.fileId as number | string })}
                      >
                        Private
                      </Button>
                    </>
                  ) : null}
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(document.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <EmptyState title="No legal documents" description="Upload ownership, certificate, or contract records for this property." />
          )}
        </div>
      ) : null}
    </section>
  );
}

export function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [nextStatus, setNextStatus] = useState("");
  const [pendingStatus, setPendingStatus] = useState("");
  const [isDeletePropertyOpen, setIsDeletePropertyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PropertyTab>("Overview");
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
  const legalDocumentsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getPropertyLegalDocuments(id ?? ""),
    queryKey: ["property", id, "legal-documents"],
    retry: 1
  });
  const linkedListingsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => searchListings({ page: 0, propertyId: id ?? "", size: 3 }),
    queryKey: ["property", id, "linked-listings"],
    retry: 1
  });
  const linkedContractsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => searchContracts({ page: 0, propertyId: id ?? "", size: 3 }),
    queryKey: ["property", id, "linked-contracts"],
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
      queryClient.invalidateQueries({ queryKey: ["property", id, "legal-documents"] }),
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
  const metadataMutation = useMutation({
    mutationFn: ({
      imageId,
      request
    }: {
      imageId: number | string;
      request: { altText?: string; displayOrder?: number };
    }) => updatePropertyImageMetadata(id ?? "", imageId, request),
    onSuccess: invalidatePropertyData
  });
  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ displayOrder: number; imageId: number | string }>) =>
      reorderPropertyImages(id ?? "", { items }),
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
  const deletePropertyMutation = useMutation({
    mutationFn: () => deleteProperty(id ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/properties", { replace: true });
    }
  });
  const actionError =
    uploadMutation.error ??
    deleteMutation.error ??
    coverMutation.error ??
    metadataMutation.error ??
    reorderMutation.error ??
    statusMutation.error ??
    deletePropertyMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;
  const imageActionBusy =
    uploadMutation.isPending ||
    deleteMutation.isPending ||
    coverMutation.isPending ||
    metadataMutation.isPending ||
    reorderMutation.isPending;
  const selectedStatus = nextStatus || property?.status || "";
  const linkedListings = linkedListingsQuery.data?.content ?? [];
  const linkedContracts = linkedContractsQuery.data?.content ?? [];
  const canDeleteProperty = Boolean(user?.roles.some((role) => role === "ADMIN" || role === "MANAGER"));

  if (!id) {
    return (
      <section>
        <EmptyState title="Property not found" description="The property URL is missing an id." />
      </section>
    );
  }

  return (
    <section className="property-detail-page">
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
          <nav className="property-breadcrumb" aria-label="Breadcrumb">
            <Link to="/properties">Properties</Link>
            <ChevronRight size={15} />
            <strong>{property.code}</strong>
          </nav>
          <div className="detail-header">
            <div>
              <PropertyTitleStatus property={property} />
              <p className="property-detail-subtitle">
                {property.code} &bull; {property.address.fullAddress}
                {property.purpose ? ` &bull; ${property.purpose === "SALE" ? "For sale" : "For rent"}` : ""}
              </p>
            </div>
            <div className="property-header-actions">
              <Button asChild variant="secondary" size="sm">
                <Link to={`/properties/${property.id}/edit`}>
                  <Edit size={16} />
                  Edit
                </Link>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setActiveTab("History")}>
                <CheckCircle2 size={16} />
                Change Status
              </Button>
              {canDeleteProperty ? (
                <Button
                  className="property-delete-icon"
                  variant="ghost"
                  size="sm"
                  aria-label="Delete property"
                  onClick={() => setIsDeletePropertyOpen(true)}
                  disabled={deletePropertyMutation.isPending}
                >
                  <Trash2 size={16} />
                </Button>
              ) : null}
            </div>
          </div>
          <PropertyHeroGallery images={images} propertyName={property.name} />
          <nav className="property-tabs" aria-label="Property sections">
            {propertyTabs.map((tab) => (
              <button
                className={activeTab === tab ? "is-active" : ""}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
          {normalizedActionError ? (
            <div className="form-error" role="alert">
              {normalizedActionError.message}
            </div>
          ) : null}
          {activeTab === "Overview" ? (
            <div className="property-overview-layout">
              <main className="property-overview-main">
                <section className="content-section detail-main-section property-key-facts-card">
                  <div className="section-header compact">
                    <h3>Key Facts</h3>
                  </div>
                  <div className="property-fact-grid">
                    <FactItem icon={<DollarSign size={16} />} label="Price" value={property.price ? formatCurrency(property.price, property.currency) : "Updating"} />
                    <FactItem icon={<Building2 size={16} />} label="Property type" value={property.propertyTypeName || "Updating"} />
                    <FactItem icon={<Ruler size={18} />} label="Floor area" value={formatArea(property.floorArea)} />
                    <FactItem icon={<Home size={18} />} label="Land area" value={formatArea(property.landArea)} />
                    <FactItem icon={<BedDouble size={18} />} label="Bedrooms" value={property.bedrooms ?? "Updating"} />
                    <FactItem icon={<Bath size={18} />} label="Bathrooms" value={property.bathrooms ?? "Updating"} />
                    <FactItem icon={<Tag size={16} />} label="Code" value={property.code} />
                    <FactItem icon={<FileText size={16} />} label="Legal status" value={enumLabel(property.legalStatus)} />
                    <FactItem icon={<Home size={16} />} label="Furniture status" value={enumLabel(property.furnitureStatus)} />
                    <FactItem icon={<Compass size={16} />} label="Direction" value={enumLabel(property.direction)} />
                    <FactItem icon={<CalendarDays size={16} />} label="Available from" value={property.availableFrom || "Updating"} />
                  </div>
                  <div className="property-description-block">
                    <h3>Description</h3>
                    <p>{property.description || "No description returned by the property API."}</p>
                  </div>
                </section>
              </main>
            </div>
          ) : null}
          {activeTab === "Images" ? (
            <ImageManagementPanel
              images={images}
              isBusy={imageActionBusy}
              onUpload={(request) => uploadMutation.mutate(request)}
              onDelete={(imageId) => deleteMutation.mutate(imageId)}
              onReorder={(items) => reorderMutation.mutate(items)}
              onSetCover={(imageId) => coverMutation.mutate(imageId)}
              onUpdateMetadata={(imageId, request) => metadataMutation.mutate({ imageId, request })}
              propertyId={property.id}
            />
          ) : null}
          {activeTab === "Legal Documents" ? (
            <LegalDocumentsPanel
              documents={legalDocumentsQuery.data ?? []}
              isLoading={legalDocumentsQuery.isLoading}
              onChanged={invalidatePropertyData}
              propertyId={property.id}
              roles={user?.roles ?? []}
            />
          ) : null}
          {activeTab === "Amenities" ? (
            <section className="content-section property-amenities-tab">
              <div className="section-header compact">
                <h3>Amenities</h3>
              </div>
              {property.amenities.length ? (
                <div className="property-amenity-grid">
                  {property.amenities.map((amenity) => (
                    <article key={amenity.id}>
                      <strong>{amenity.name}</strong>
                      <span>{amenity.category || "Uncategorized"}</span>
                      {amenity.details ? <p>{amenity.details}</p> : null}
                    </article>
                  ))}
                </div>
              ) : (
                <EmptyState title="No amenities" description="Amenity data was not returned by the property API." />
              )}
            </section>
          ) : null}
          {activeTab === "History" ? (
            <section className="content-section property-history-tab">
              <div className="section-header compact">
                <h3>History</h3>
              </div>
              <div className="property-detail-grid">
                <FactItem label="Created by" value={property.createdByName || property.createdById || "Not returned"} />
                <FactItem label="Created at" value={property.createdAt || "Not returned"} />
                <FactItem label="Updated at" value={property.updatedAt || "Not returned"} />
                <FactItem label="Status" value={labelStatus(property.status)} />
              </div>
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
            </section>
          ) : null}
          <PropertySidebar
            linkedContracts={linkedContracts}
            linkedListings={linkedListings}
            property={property}
          />
        </>
      ) : null}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change property status"
        description={`Change status from ${labelStatus(property?.status ?? "")} to ${labelStatus(pendingStatus)}?`}
        onCancel={() => setPendingStatus("")}
        onConfirm={() => statusMutation.mutate(pendingStatus)}
      />
      <ConfirmDialog
        open={isDeletePropertyOpen}
        title="Delete property"
        description={`Delete property ${property?.code ?? id}? This cannot be undone.`}
        onCancel={() => setIsDeletePropertyOpen(false)}
        onConfirm={() => deletePropertyMutation.mutate()}
      />
    </section>
  );
}
