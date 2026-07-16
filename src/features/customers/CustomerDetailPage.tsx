import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bot, FileText, Pin, Plus, Sparkles, Trash2 } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { formatCurrency } from "../../shared/lib/format";
import { CustomerForm, toCustomerRequest, type CustomerFormValues } from "./CustomerForm";
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
  updateCustomer,
  type CustomerPurpose,
  type CustomerRecommendationRequest
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

function priorityTone(priority: string) {
  if (priority === "HIGH") {
    return "danger";
  }

  if (priority === "MEDIUM") {
    return "warning";
  }

  return "neutral";
}

function toNumber(value: string) {
  return value.trim() ? Number(value) : undefined;
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [tagName, setTagName] = useState("");
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
  const invalidateCustomerData = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["customer", id] }),
      queryClient.invalidateQueries({ queryKey: ["customer", id, "timeline"] }),
      queryClient.invalidateQueries({ queryKey: ["customer", id, "tags"] }),
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    ]);
  const summaryQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => getCustomerAiSummary(id ?? ""),
    queryKey: ["customer", id, "ai-summary"],
    retry: 1
  });
  const updateMutation = useMutation({
    mutationFn: (values: CustomerFormValues) => updateCustomer(id ?? "", toCustomerRequest(values)),
    onSuccess: (customer) => {
      queryClient.setQueryData(["customer", id], customer);
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });
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
    updateMutation.error ??
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
    <section>
      <Button asChild variant="ghost" size="sm">
        <Link to="/customers">
          <ArrowLeft size={16} />
          Back to customers
        </Link>
      </Button>
      <div className="detail-header">
        <div>
          <div className="detail-badges">
            <StatusBadge tone={statusTone(customer.status)}>{customer.status}</StatusBadge>
            <StatusBadge tone={priorityTone(customer.priority)}>{customer.priority}</StatusBadge>
          </div>
          <h1>{customer.fullName}</h1>
          <p className="muted">{customer.code} / {customer.source} / {customer.preferredContactMethod}</p>
        </div>
        <Button variant="danger" size="sm" onClick={() => setIsDeleteCustomerOpen(true)} disabled={deleteCustomerMutation.isPending}>
          <Trash2 size={16} />
          Delete customer
        </Button>
      </div>
      {normalizedActionError ? <p className="form-alert">{normalizedActionError.message}</p> : null}
      <div className="customer-crm-grid">
        <section className="content-section customer-profile-card">
          <p className="eyebrow">Profile</p>
          <div><span>Email</span><strong>{customer.email || "Not provided"}</strong></div>
          <div><span>Phone</span><strong>{customer.phone || "Not provided"}</strong></div>
          <div><span>User id</span><strong>{customer.userId ?? "Not linked"}</strong></div>
          <div><span>Assigned agent</span><strong>{customer.assignedAgentId ?? "Unassigned"}</strong></div>
          {customer.notes ? <p className="muted">{customer.notes}</p> : null}
        </section>
        <section className="content-section customer-profile-card">
          <p className="eyebrow">Tags</p>
          <form className="customer-inline-form" onSubmit={submitTag}>
            <Input label="Tag name" value={tagName} onChange={(event) => setTagName(event.target.value)} />
            <Button type="submit" disabled={!tagName.trim() || addTagMutation.isPending}>
              <Plus size={16} />
              Add tag
            </Button>
          </form>
          <div className="detail-badges">
            {(tagsQuery.data ?? customer.tags).length ? (tagsQuery.data ?? customer.tags).map((tag) => (
              <span className="status-badge status-info" key={tag.id}>
                {tag.name}
                <button className="tag-remove-button" type="button" onClick={() => deleteTagMutation.mutate(tag.id)} aria-label={`Remove ${tag.name}`}>
                  ×
                </button>
              </span>
            )) : <p className="muted">No tags yet.</p>}
          </div>
        </section>
        <section className="content-section ai-customer-card">
          <div className="section-header">
            <div>
              <p className="eyebrow">AI summary</p>
              <h2>Customer brief</h2>
            </div>
            <Bot size={20} />
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
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Update</p>
            <h2>Edit customer</h2>
          </div>
        </div>
        <CustomerForm
          customer={customer}
          submitLabel="Save customer"
          onSubmit={(values) => updateMutation.mutateAsync(values).then(() => undefined)}
        />
      </section>
      <div className="customer-crm-grid">
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Notes</p>
              <h2>Customer notes</h2>
            </div>
          </div>
          <form className="customer-inline-form" onSubmit={submitNote}>
            <textarea className="input textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add note" />
            <Button type="submit" disabled={!note.trim() || noteMutation.isPending}>
              <Plus size={16} />
              Add note
            </Button>
          </form>
          <div className="customer-list-stack">
            {customer.noteItems.length ? customer.noteItems.map((item) => (
              <article key={item.id}>
                <div className="section-header compact">
                  <StatusBadge tone={item.pinned ? "info" : "neutral"}>{item.pinned ? "Pinned" : "Note"}</StatusBadge>
                  <div className="task-action-row">
                    <Button size="sm" variant="secondary" onClick={() => pinNoteMutation.mutate({ noteId: item.id, pinned: !item.pinned })}>
                      <Pin size={16} />
                      {item.pinned ? "Unpin" : "Pin"}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deleteNoteMutation.mutate(item.id)}>
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
                <strong>{item.content}</strong>
                {item.createdAt ? <small>{item.createdAt}</small> : null}
              </article>
            )) : <p className="muted">No notes recorded.</p>}
          </div>
        </section>
        <section className="content-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">Requirements</p>
              <h2>Buying or rental needs</h2>
            </div>
          </div>
          <form className="customer-inline-form" onSubmit={submitRequirement}>
            <Input label="Summary" value={requirementSummary} onChange={(event) => setRequirementSummary(event.target.value)} />
            <Select label="Purpose" options={purposeOptions} value={requirementPurpose} onChange={(event) => setRequirementPurpose(event.target.value as CustomerPurpose | "")} />
            <Input label="Location" value={requirementLocation} onChange={(event) => setRequirementLocation(event.target.value)} />
            <Input label="Max price" value={requirementMaxPrice} onChange={(event) => setRequirementMaxPrice(event.target.value)} />
            <Button type="submit" disabled={requirementMutation.isPending}>
              <Plus size={16} />
              Add requirement
            </Button>
          </form>
          <div className="customer-list-stack">
            {customer.requirements.length ? customer.requirements.map((requirement) => (
              <article key={requirement.id}>
                <strong>{requirement.summary}</strong>
                <small>{requirement.purpose ?? "Any purpose"} / {requirement.location || "Any location"}</small>
                <small>
                  {requirement.maxPrice ? `Up to ${formatCurrency(requirement.maxPrice, requirement.currency)}` : "Budget updating"}
                </small>
                <Button size="sm" variant="danger" onClick={() => deleteRequirementMutation.mutate(requirement.id)}>
                  <Trash2 size={16} />
                  Delete requirement
                </Button>
              </article>
            )) : <p className="muted">No requirements recorded.</p>}
          </div>
        </section>
      </div>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">AI recommendations</p>
            <h2>Suggested listings</h2>
          </div>
          <Sparkles size={20} />
        </div>
        <form className="customer-recommendation-form" onSubmit={submitRecommendations}>
          <Input label="Limit" value={recommendationLimit} onChange={(event) => setRecommendationLimit(event.target.value)} />
          <Select label="Purpose" options={purposeOptions} value={recommendationPurpose} onChange={(event) => setRecommendationPurpose(event.target.value as CustomerPurpose | "")} />
          <Input label="Max price" value={recommendationMaxPrice} onChange={(event) => setRecommendationMaxPrice(event.target.value)} />
          <Button type="submit" disabled={recommendationsMutation.isPending}>
            Generate recommendations
          </Button>
        </form>
        {recommendationError ? (
          <EmptyState title="Recommendations unavailable" description={recommendationError.message || "AI provider returned no recommendations."} />
        ) : null}
        {recommendationsMutation.data ? (
          <div className="customer-list-stack">
            {recommendationsMutation.data.length ? recommendationsMutation.data.map((listing) => (
              <article key={listing.id}>
                <strong>{listing.title}</strong>
                <small>{listing.score ? `Match ${listing.score}` : "Match score updating"}</small>
                <small>{listing.price ? formatCurrency(listing.price, "VND") : "Price updating"}</small>
                {listing.reason ? <small>{listing.reason}</small> : null}
                {listing.suggestedAction ? <small>{listing.suggestedAction}</small> : null}
                {listing.url ? <Link to={listing.url}>Open public listing</Link> : null}
              </article>
            )) : <EmptyState title="No recommendations" description="AI returned an empty recommendation set." />}
          </div>
        ) : null}
      </section>
      <section className="content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Timeline</p>
            <h2>CRM activity</h2>
          </div>
          <FileText size={20} />
        </div>
        {timelineQuery.isLoading ? <p className="muted">Loading timeline.</p> : null}
        {timelineQuery.error ? (
          <EmptyState title="Timeline unavailable" description={normalizeUnknownError(timelineQuery.error).message} />
        ) : null}
        <div className="timeline-list">
          {timelineQuery.data?.length ? timelineQuery.data.map((item) => (
            <article key={item.id}>
              <span>{item.type}</span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
              {item.timestamp ? <small>{item.timestamp}</small> : null}
            </article>
          )) : <p className="muted">No timeline activity yet.</p>}
        </div>
      </section>
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
