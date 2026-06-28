import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Copy,
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
import { ImageGallery } from "../../shared/ui/ImageGallery";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { statusLabels } from "../../shared/constants/enumLabels";
import { formatCurrency } from "../../shared/lib/format";
import { analyzePropertyImage, type ImageAnalysisSuggestion } from "../ai/aiApi";
import {
  deletePropertyImage,
  deletePropertyLegalDocument,
  getProperty,
  getPropertyImages,
  getPropertyLegalDocuments,
  setPropertyCoverImage,
  type LegalDocumentUpdateRequest,
  type LegalDocumentVerificationRequest,
  type PropertyLegalDocument,
  type PropertyImage,
  type PropertyRecord,
  updatePropertyStatus,
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
  onUpload,
  propertyId
}: {
  images: PropertyImage[];
  isBusy: boolean;
  onDelete: (imageId: number | string) => void;
  onSetCover: (imageId: number | string) => void;
  onUpload: (request: { altText: string; displayOrder: number; file: File }) => void;
  propertyId: number | string;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [analysisByImage, setAnalysisByImage] = useState<Record<string, ImageAnalysisSuggestion>>({});
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});
  const analysisMutation = useMutation({
    mutationFn: (image: PropertyImage) =>
      analyzePropertyImage({ imageId: image.id, imageUrl: image.url, propertyId }),
    onSuccess: (analysis, image) => {
      const key = String(image.id);
      setAnalysisByImage((current) => ({ ...current, [key]: analysis }));
      setCaptionDrafts((current) => ({ ...current, [key]: analysis.caption || analysis.summary }));
    }
  });
  const analysisError = analysisMutation.error ? normalizeUnknownError(analysisMutation.error) : null;

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
      {analysisError ? <p className="form-alert">{analysisError.message}</p> : null}
      <p className="muted">
        AI image analysis is a draft suggestion for copy/edit review only. It does not publish, change legal status, or make financial conclusions.
      </p>
    </section>
  );
}

const legalDocumentTypeOptions = [
  { label: "Pink book", value: "PINK_BOOK" },
  { label: "Land use certificate", value: "LAND_USE_CERTIFICATE" },
  { label: "Sale contract", value: "SALE_CONTRACT" },
  { label: "Construction permit", value: "CONSTRUCTION_PERMIT" },
  { label: "Other", value: "OTHER" }
];

const verificationStatusOptions = [
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Pending", value: "PENDING" }
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
  const [issuedDate, setIssuedDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editDraft, setEditDraft] = useState<LegalDocumentUpdateRequest>({
    documentType: "PINK_BOOK"
  });
  const [verificationDrafts, setVerificationDrafts] = useState<Record<string, string>>({});
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
        <FileUploader onFilesSelected={(files) => setSelectedFile(files[0] ?? null)} />
        <Select
          label="Document type"
          options={legalDocumentTypeOptions}
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
        />
        <Input label="Document number" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} />
        <Input label="Issued by" value={issuedBy} onChange={(event) => setIssuedBy(event.target.value)} />
        <Input label="Issued date" type="date" value={issuedDate} onChange={(event) => setIssuedDate(event.target.value)} />
        <Input label="Expiry date" type="date" value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} />
        <Input label="Notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <Button type="submit" disabled={!selectedFile || uploadMutation.isPending}>
          <FilePlus2 size={16} />
          Upload document
        </Button>
      </form>
      {selectedFile ? <p className="muted">Selected: {selectedFile.name}</p> : null}
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
  const queryClient = useQueryClient();
  const { user } = useAuth();
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
  const legalDocumentsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getPropertyLegalDocuments(id ?? ""),
    queryKey: ["property", id, "legal-documents"],
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
              <Button asChild size="sm">
                <Link to={`/listings/new?propertyId=${encodeURIComponent(String(property.id))}`}>
                  <FilePlus2 size={16} />
                  Create listing
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
            propertyId={property.id}
          />
          <LegalDocumentsPanel
            documents={legalDocumentsQuery.data ?? []}
            isLoading={legalDocumentsQuery.isLoading}
            onChanged={invalidatePropertyData}
            propertyId={property.id}
            roles={user?.roles ?? []}
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
