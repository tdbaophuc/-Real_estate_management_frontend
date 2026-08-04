import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  Building2,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Pin,
  Plus,
  Sparkles,
  Trash2
} from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import {
  addCustomerNote,
  addCustomerRequirement,
  addCustomerTag,
  deleteCustomer,
  deleteCustomerNote,
  deleteCustomerRequirement,
  deleteCustomerTag,
  getCustomer,
  getCustomerAiSummary,
  getCustomerRecommendations,
  getCustomerTags,
  getCustomerTimeline,
  pinCustomerNote,
  type CustomerPurpose,
  type CustomerRecord,
  type CustomerRecommendationRequest,
  type CustomerRequirement,
  type CustomerTimelineItem
} from "./customerApi";

const purposeOptions = [
  { label: "Any purpose", value: "" },
  { label: "Sale", value: "SALE" },
  { label: "Rent", value: "RENT" }
];

function statusTone(status: string) {
  if (status === "ACTIVE") {
    return "success";
  }

  if (status === "ARCHIVED") {
    return "danger";
  }

  return "neutral";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "C";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";

  return `${first}${last}`.toUpperCase();
}

function primaryRequirement(customer: CustomerRecord) {
  return customer.requirements[0];
}

function locationParts(requirement?: CustomerRequirement) {
  return (requirement?.location || "")
    .split(/[,;/]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatBudget(requirement?: CustomerRequirement) {
  if (!requirement) {
    return "Not specified";
  }

  if (requirement.minPrice && requirement.maxPrice) {
    return `${formatCurrency(requirement.minPrice, requirement.currency)} - ${formatCurrency(requirement.maxPrice, requirement.currency)}`;
  }

  if (requirement.maxPrice) {
    return `Up to ${formatCurrency(requirement.maxPrice, requirement.currency)}`;
  }

  if (requirement.minPrice) {
    return `From ${formatCurrency(requirement.minPrice, requirement.currency)}`;
  }

  return "Not specified";
}

function timelineIcon(item: CustomerTimelineItem) {
  const type = item.type.toLowerCase();

  if (type.includes("email")) {
    return <Mail size={15} />;
  }

  if (type.includes("call") || type.includes("phone")) {
    return <Phone size={15} />;
  }

  if (type.includes("note")) {
    return <MessageSquare size={15} />;
  }

  return <FileText size={15} />;
}

function recommendationMatch(score: number | null) {
  if (score === null) {
    return "Match";
  }

  const normalized = score <= 1 ? Math.round(score * 100) : Math.round(score);
  return `${normalized}% Match`;
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [tagName, setTagName] = useState("");
  const [isSegmentEditorOpen, setIsSegmentEditorOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [requirementSummary, setRequirementSummary] = useState("");
  const [requirementPurpose, setRequirementPurpose] = useState<CustomerPurpose | "">("");
  const [requirementLocation, setRequirementLocation] = useState("");
  const [requirementMaxPrice, setRequirementMaxPrice] = useState("");
  const [recommendationLimit, setRecommendationLimit] = useState("5");
  const [recommendationPurpose, setRecommendationPurpose] = useState<CustomerPurpose | "">("");
  const [recommendationMaxPrice, setRecommendationMaxPrice] = useState("");

  const customerQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getCustomer(id ?? ""),
    queryKey: ["customer", id],
    retry: 1
  });
  const timelineQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getCustomerTimeline(id ?? ""),
    queryKey: ["customer", id, "timeline"],
    retry: 1
  });
  const tagsQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getCustomerTags(id ?? ""),
    queryKey: ["customer", id, "tags"],
    retry: 1
  });
  const summaryQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getCustomerAiSummary(id ?? ""),
    queryKey: ["customer", id, "ai-summary"],
    retry: 1
  });
  const canDeleteCustomer = Boolean(user?.roles.some((role) => role === "ADMIN" || role === "MANAGER"));

  const invalidateCustomerData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["customer", id] }),
      queryClient.invalidateQueries({ queryKey: ["customer", id, "timeline"] }),
      queryClient.invalidateQueries({ queryKey: ["customer", id, "tags"] }),
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    ]);

  const deleteCustomerMutation = useMutation({
    mutationFn: () => deleteCustomer(id ?? ""),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      navigate("/customers", { replace: true });
    }
  });
  const noteMutation = useMutation({
    mutationFn: () => addCustomerNote(id ?? "", note.trim()),
    onSuccess: () => {
      setNote("");
      return invalidateCustomerData();
    }
  });
  const pinNoteMutation = useMutation({
    mutationFn: ({ noteId, pinned }: { noteId: number | string; pinned: boolean }) =>
      pinCustomerNote(id ?? "", noteId, pinned),
    onSuccess: invalidateCustomerData
  });
  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number | string) => deleteCustomerNote(id ?? "", noteId),
    onSuccess: invalidateCustomerData
  });
  const requirementMutation = useMutation({
    mutationFn: () =>
      addCustomerRequirement(id ?? "", {
        currency: "VND",
        location: requirementLocation || undefined,
        maxPrice: toNumber(requirementMaxPrice) ?? null,
        purpose: requirementPurpose || null,
        summary: requirementSummary || undefined
      }),
    onSuccess: () => {
      setRequirementSummary("");
      setRequirementPurpose("");
      setRequirementLocation("");
      setRequirementMaxPrice("");
      return invalidateCustomerData();
    }
  });
  const deleteRequirementMutation = useMutation({
    mutationFn: (requirementId: number | string) => deleteCustomerRequirement(id ?? "", requirementId),
    onSuccess: invalidateCustomerData
  });
  const addTagMutation = useMutation({
    mutationFn: () => addCustomerTag(id ?? "", tagName.trim()),
    onSuccess: () => {
      setTagName("");
      setIsSegmentEditorOpen(false);
      return invalidateCustomerData();
    }
  });
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: number | string) => deleteCustomerTag(id ?? "", tagId),
    onSuccess: invalidateCustomerData
  });
  const recommendationsMutation = useMutation({
    mutationFn: () => {
      const customer = customerQuery.data;
      const requirementText = customer?.requirements
        .map((requirement) => requirement.summary)
        .filter(Boolean)
        .join(". ");
      const naturalLanguageNeed = [
        requirementText,
        recommendationPurpose ? `Purpose: ${recommendationPurpose}` : "",
        recommendationMaxPrice ? `Budget up to ${recommendationMaxPrice} VND` : ""
      ].filter(Boolean).join(". ");
      const request: CustomerRecommendationRequest = {
        candidateLimit: 30,
        language: "vi",
        maxResults: Number(recommendationLimit || 5),
        naturalLanguageNeed
      };

      return getCustomerRecommendations(id ?? "", request);
    }
  });

  const customer = customerQuery.data;
  const normalizedError = customerQuery.error ? normalizeUnknownError(customerQuery.error) : null;
  const summaryError = summaryQuery.error ? normalizeUnknownError(summaryQuery.error) : null;
  const recommendationError = recommendationsMutation.error
    ? normalizeUnknownError(recommendationsMutation.error)
    : null;
  const actionError =
    deleteCustomerMutation.error ??
    noteMutation.error ??
    pinNoteMutation.error ??
    deleteNoteMutation.error ??
    requirementMutation.error ??
    deleteRequirementMutation.error ??
    addTagMutation.error ??
    deleteTagMutation.error;
  const normalizedActionError = actionError ? normalizeUnknownError(actionError) : null;

  if (!id) {
    return (
      <section className="content-section">
        <EmptyState title="Customer not found" description="The customer URL is missing an id." />
      </section>
    );
  }

  if (customerQuery.isLoading) {
    return (
      <section className="detail-skeleton">
        <div />
        <div />
        <div />
      </section>
    );
  }

  if (normalizedError) {
    return (
      <section className="content-section">
        <EmptyState
          title="Customer could not be loaded"
          description={normalizedError.message}
          action={<Button onClick={() => customerQuery.refetch()}>Retry</Button>}
        />
      </section>
    );
  }

  if (!customer) {
    return null;
  }

  const selectedRequirement = primaryRequirement(customer);
  const selectedLocations = locationParts(selectedRequirement);
  const activeTags = tagsQuery.data ?? customer.tags;
  const pinnedNotes = customer.noteItems.filter((item) => item.pinned);
  const timelineItems = timelineQuery.data ?? [];

  function submitNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (note.trim()) {
      noteMutation.mutate();
    }
  }

  function submitRequirement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (requirementSummary.trim() || requirementLocation.trim() || requirementPurpose || requirementMaxPrice.trim()) {
      requirementMutation.mutate();
    }
  }

  function submitRecommendations(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    recommendationsMutation.mutate();
  }

  function submitTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (tagName.trim()) {
      addTagMutation.mutate();
    }
  }

  return (
    <section className="customer-detail-page">
      <div className="customer-detail-nav">
        <Button asChild variant="ghost" size="sm">
          <Link to="/customers">
            <ArrowLeft size={16} />
            Back to customers
          </Link>
        </Button>
        {canDeleteCustomer ? (
          <Button variant="danger" size="sm" onClick={() => setIsDeleteCustomerOpen(true)} disabled={deleteCustomerMutation.isPending}>
            <Trash2 size={16} />
            Delete customer
          </Button>
        ) : null}
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}

      <header className="customer-detail-profile content-section">
        <div className="customer-detail-avatar">{customerInitials(customer.fullName)}</div>
        <div className="customer-detail-profile-copy">
          <div className="customer-detail-name-line">
            <h1>{customer.fullName}</h1>
            <StatusBadge tone={statusTone(customer.status)}>{customer.status}</StatusBadge>
          </div>
          <p className="customer-detail-subtitle">
            {customer.priority} priority / {customer.source} / {customer.preferredContactMethod}
          </p>
          <p className="customer-detail-location">
            <MapPin size={15} />
            {selectedLocations[0] || selectedRequirement?.location || "Location updating"}
          </p>
        </div>
        <div className="customer-detail-contact">
          <span>
            <Mail size={16} />
            {customer.email || "Email not provided"}
          </span>
          <span>
            <Phone size={16} />
            {customer.phone || "Phone not provided"}
          </span>
        </div>
      </header>

      <div className="customer-detail-grid">
        <aside className="customer-detail-left-column">
          <section className="customer-detail-card content-section">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">Requirements</p>
                <h2>Investment needs</h2>
              </div>
              <Building2 size={19} />
            </div>
            <dl className="customer-detail-facts">
              <div>
                <dt>Target budget</dt>
                <dd>{formatBudget(selectedRequirement)}</dd>
              </div>
              <div>
                <dt>Asset class</dt>
                <dd>{selectedRequirement?.propertyTypeName || selectedRequirement?.purpose || "Not specified"}</dd>
              </div>
              <div>
                <dt>Target yield</dt>
                <dd>Not specified</dd>
              </div>
            </dl>
            <div className="customer-detail-location-badges">
              <span>Preferred locations</span>
              <div>
                {selectedLocations.length ? selectedLocations.map((location) => (
                  <span className="customer-detail-soft-badge" key={location}>{location}</span>
                )) : <span className="customer-detail-soft-badge">Not specified</span>}
              </div>
            </div>
            <details className="customer-detail-action-panel">
              <summary>Add requirement</summary>
              <form className="customer-inline-form" onSubmit={submitRequirement}>
                <Input label="Summary" value={requirementSummary} onChange={(event) => setRequirementSummary(event.target.value)} />
                <Select label="Purpose" options={purposeOptions} value={requirementPurpose} onChange={(event) => setRequirementPurpose(event.target.value as CustomerPurpose | "")} />
                <Input label="Location" value={requirementLocation} onChange={(event) => setRequirementLocation(event.target.value)} />
                <Input label="Max price" value={requirementMaxPrice} onChange={(event) => setRequirementMaxPrice(event.target.value)} />
                <Button type="submit" disabled={requirementMutation.isPending}>
                  <Plus size={16} />
                  Save requirement
                </Button>
              </form>
            </details>
            {customer.requirements.length > 1 ? (
              <div className="customer-detail-secondary-list">
                {customer.requirements.slice(1).map((requirement) => (
                  <article key={requirement.id}>
                    <strong>{requirement.summary}</strong>
                    <small>{requirement.purpose ?? "Any purpose"} / {requirement.location || "Any location"}</small>
                    <Button size="sm" variant="ghost" onClick={() => deleteRequirementMutation.mutate(requirement.id)}>
                      <Trash2 size={15} />
                      Remove
                    </Button>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <section className="customer-detail-card content-section">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">Segments</p>
                <h2>Customer profile</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSegmentEditorOpen((isOpen) => !isOpen)}
              >
                <Pencil size={15} />
                Edit
              </Button>
            </div>
            <div className="customer-detail-segments">
              {activeTags.length ? activeTags.map((tag) => (
                <span className="customer-detail-segment-badge" key={tag.id}>
                  {tag.name}
                  {isSegmentEditorOpen ? <button type="button" onClick={() => deleteTagMutation.mutate(tag.id)} aria-label={`Remove ${tag.name}`}>
                    x
                  </button> : null}
                </span>
              )) : <p className="muted">No segments returned by the API.</p>}
            </div>
            {isSegmentEditorOpen ? (
              <form className="customer-detail-tag-form" onSubmit={submitTag}>
                <Input label="Segment name" value={tagName} onChange={(event) => setTagName(event.target.value)} />
                <Button type="submit" size="sm" disabled={!tagName.trim() || addTagMutation.isPending}>
                  <Plus size={16} />
                  Add
                </Button>
              </form>
            ) : null}
          </section>

          <section className="customer-detail-card customer-detail-ai content-section">
            <div className="section-header compact">
              <div>
                <p className="eyebrow">AI summary</p>
                <h2>Customer brief</h2>
              </div>
              <Bot size={19} />
            </div>
            {summaryQuery.isLoading ? <p className="muted">Generating customer summary.</p> : null}
            {summaryError ? (
              <EmptyState
                title="AI summary unavailable"
                description={summaryError.message || "AI provider returned no customer summary."}
                action={<Button onClick={() => summaryQuery.refetch()}>Retry</Button>}
              />
            ) : null}
            {summaryQuery.data ? (
              <div className="ai-summary-block">
                <p>{summaryQuery.data.summary}</p>
                {summaryQuery.data.nextAction ? <strong>Next: {summaryQuery.data.nextAction}</strong> : null}
                {summaryQuery.data.tags.length ? <small>{summaryQuery.data.tags.join(" / ")}</small> : null}
                {summaryQuery.data.risks.length ? <small>Risks: {summaryQuery.data.risks.join(" / ")}</small> : null}
              </div>
            ) : null}
          </section>
        </aside>

        <main className="customer-detail-timeline content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Activity Timeline</p>
              <h2>CRM activity</h2>
            </div>
            <details className="customer-detail-log-control">
              <summary>
                <Plus size={16} />
                Log Activity
              </summary>
              <form className="customer-inline-form" onSubmit={submitNote}>
                <textarea className="input textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add note" />
                <Button type="submit" disabled={!note.trim() || noteMutation.isPending}>
                  Save activity
                </Button>
              </form>
            </details>
          </div>

          {timelineQuery.isLoading ? <p className="muted">Loading timeline.</p> : null}
          {timelineQuery.error ? (
            <EmptyState title="Timeline unavailable" description={normalizeUnknownError(timelineQuery.error).message} />
          ) : null}
          <div className="customer-detail-timeline-list">
            {timelineItems.length ? timelineItems.map((item) => (
              <article key={item.id}>
                <div className="customer-detail-timeline-node">{timelineIcon(item)}</div>
                <div className="customer-detail-timeline-box">
                  <header>
                    <strong>{item.title}</strong>
                    <time>{item.timestamp || "Time updating"}</time>
                  </header>
                  <span>{item.type}</span>
                  <p>{item.description}</p>
                </div>
              </article>
            )) : customer.noteItems.length ? customer.noteItems.map((item) => (
              <article key={item.id}>
                <div className="customer-detail-timeline-node"><MessageSquare size={15} /></div>
                <div className="customer-detail-timeline-box">
                  <header>
                    <strong>{item.pinned ? "Pinned note" : "Customer note"}</strong>
                    <time>{item.createdAt || "Time updating"}</time>
                  </header>
                  <span>NOTE</span>
                  <p>{item.content}</p>
                  <div className="customer-detail-note-actions">
                    <Button size="sm" variant="secondary" onClick={() => pinNoteMutation.mutate({ noteId: item.id, pinned: !item.pinned })}>
                      <Pin size={15} />
                      {item.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteNoteMutation.mutate(item.id)}>
                      <Trash2 size={15} />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            )) : <p className="muted">No timeline activity yet.</p>}
          </div>
          {pinnedNotes.length ? (
            <aside className="customer-detail-pinned">
              <p className="eyebrow">Pinned notes</p>
              {pinnedNotes.map((item) => (
                <article key={item.id}>
                  <strong>{item.content}</strong>
                  <small>{item.createdAt || "Time updating"}</small>
                </article>
              ))}
            </aside>
          ) : null}
        </main>

        <aside className="customer-detail-matches content-section">
          <div className="section-header compact">
            <div>
              <p className="eyebrow">Smart Matches</p>
              <h2>Suggested listings</h2>
            </div>
            <Sparkles size={19} />
          </div>
          <details className="customer-detail-action-panel">
            <summary>Tune recommendations</summary>
            <form className="customer-recommendation-form customer-detail-recommendation-form" onSubmit={submitRecommendations}>
              <Input label="Limit" value={recommendationLimit} onChange={(event) => setRecommendationLimit(event.target.value)} />
              <Select label="Purpose" options={purposeOptions} value={recommendationPurpose} onChange={(event) => setRecommendationPurpose(event.target.value as CustomerPurpose | "")} />
              <Input label="Max price" value={recommendationMaxPrice} onChange={(event) => setRecommendationMaxPrice(event.target.value)} />
              <Button type="submit" disabled={recommendationsMutation.isPending}>
                Generate
              </Button>
            </form>
          </details>
          {recommendationError ? (
            <EmptyState title="Recommendations unavailable" description={recommendationError.message || "AI provider returned no recommendations."} />
          ) : null}
          <div className="customer-detail-match-list">
            {recommendationsMutation.data?.length ? recommendationsMutation.data.map((listing, index) => (
              <article className="customer-detail-match-card" key={listing.id}>
                <div className={`customer-detail-match-media customer-detail-match-media-${index % 3}`}>
                  <span>{recommendationMatch(listing.score)}</span>
                </div>
                <div className="customer-detail-match-body">
                  <h3>{listing.title}</h3>
                  {listing.reason ? <p>{listing.reason}</p> : null}
                  <footer>
                    <strong>{listing.price ? formatCurrency(listing.price, "VND") : "Price updating"}</strong>
                    {listing.suggestedAction ? <span>{listing.suggestedAction}</span> : null}
                  </footer>
                  {listing.url ? <Link to={listing.url}>Open public listing</Link> : null}
                </div>
              </article>
            )) : (
              <EmptyState
                title="No smart matches yet"
                description="Generate recommendations to load API-backed listing matches for this customer."
              />
            )}
          </div>
        </aside>
      </div>

      {customer.notes ? (
        <section className="customer-detail-notes content-section">
          <p className="eyebrow">Internal notes</p>
          <p>{customer.notes}</p>
        </section>
      ) : null}

      <ConfirmDialog
        open={isDeleteCustomerOpen}
        title="Delete customer"
        description={`Delete customer ${customer.code}? This cannot be undone.`}
        onCancel={() => setIsDeleteCustomerOpen(false)}
        onConfirm={() => deleteCustomerMutation.mutate()}
      />
    </section>
  );
}
