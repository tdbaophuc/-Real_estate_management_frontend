import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Copy, ExternalLink, MessageSquarePlus, RotateCcw, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatCurrency } from "../../shared/lib/format";
import { useAuth } from "../../shared/auth/useAuth";
import { useText } from "../../shared/i18n/useText";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import {
  createChatSession,
  getChatSession,
  sendChatMessage,
  type AiChatMessage,
  type AiChatSession,
  type AiSuggestedListing
} from "./aiApi";

function messageLabel(message: AiChatMessage) {
  if (message.role === "assistant") {
    return "AI assistant";
  }

  if (message.role === "system") {
    return "System";
  }

  return "You";
}

function listingUrl(listing: AiSuggestedListing) {
  return listing.slug ? `/listing/${listing.slug}` : `/listings/${listing.id}`;
}

function copyText(value: string) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

type StoredChatSession = {
  id: number | string;
  lastMessageAt: string;
  title: string;
};

function getSessionStorageKey(userId: number | string | undefined) {
  return `rem.ai.chatSessions.${userId ?? "anonymous"}`;
}

function readStoredSessions(storageKey: string): StoredChatSession[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((item): item is StoredChatSession =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        typeof (item as StoredChatSession).title === "string"
      )
      : [];
  } catch {
    return [];
  }
}

function formatSessionTime(value: string) {
  if (!value) {
    return "No messages yet";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

function SuggestedListingCard({ listing }: { listing: AiSuggestedListing }) {
  const tx = useText();

  return (
    <Link className="ai-assistant-listing" to={listingUrl(listing)}>
      <div
        className="ai-assistant-listing-media"
        style={listing.coverImageUrl ? { backgroundImage: `url(${listing.coverImageUrl})` } : undefined}
      >
        {!listing.coverImageUrl ? <ExternalLink size={16} /> : null}
      </div>
      <span>
        <strong>{listing.title}</strong>
        <small>{listing.address}</small>
        <b>{listing.price ? formatCurrency(listing.price, listing.currency) : tx("Price updating")}</b>
      </span>
    </Link>
  );
}

export function AiAssistantPanel({ onClose }: { onClose: () => void }) {
  const tx = useText();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<number | string | null>(null);
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  const [message, setMessage] = useState("");
  const storageKey = useMemo(() => getSessionStorageKey(user?.id), [user?.id]);
  const [storedSessions, setStoredSessions] = useState<StoredChatSession[]>(() => readStoredSessions(storageKey));
  const sessionQuery = useQuery({
    enabled: activeSessionId !== null,
    queryFn: () => getChatSession(activeSessionId as number | string),
    queryKey: ["ai-chat-session", activeSessionId],
    retry: 1
  });
  const messages = useMemo(() => sessionQuery.data?.messages ?? [], [sessionQuery.data?.messages]);
  const assistantMeta = [...messages].reverse().find((item) => item.role === "assistant");
  const normalizedError = sessionQuery.error ? normalizeUnknownError(sessionQuery.error) : null;
  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      let session: AiChatSession | undefined = sessionQuery.data;

      if (!session) {
        session = await createChatSession("Real estate assistant");
        setActiveSessionId(session.id);
        queryClient.setQueryData(["ai-chat-session", session.id], session);
      }

      return sendChatMessage(session.id, content);
    },
    onSuccess: (session) => {
      setMessage("");
      setActiveSessionId(session.id);
      persistSession(session);
      queryClient.setQueryData(["ai-chat-session", session.id], session);
    }
  });
  const sendError = sendMutation.error ? normalizeUnknownError(sendMutation.error) : null;

  useEffect(() => {
    setStoredSessions(readStoredSessions(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (sessionQuery.data) {
      persistSession(sessionQuery.data);
    }
  }, [sessionQuery.data]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 132)}px`;
  }, [message]);

  function persistSession(session: AiChatSession) {
    const nextSession: StoredChatSession = {
      id: session.id,
      lastMessageAt: session.lastMessageAt || session.createdAt,
      title: session.title || "AI chat"
    };

    setStoredSessions((current) => {
      const nextSessions = [
        nextSession,
        ...current.filter((item) => String(item.id) !== String(session.id))
      ].slice(0, 12);

      window.localStorage.setItem(storageKey, JSON.stringify(nextSessions));
      return nextSessions;
    });
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim()) {
      sendMutation.mutate(message.trim());
    }
  }

  function startNewSession() {
    setActiveSessionId(null);
    setMessage("");
    setIsSessionListOpen(false);
  }

  function selectSession(sessionId: number | string) {
    setActiveSessionId(sessionId);
    setMessage("");
    setIsSessionListOpen(false);
  }

  function handleMessageKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  }

  return (
    <aside className="ai-assistant-panel" aria-label={tx("AI assistant")}>
      <header className="ai-assistant-header">
        <div>
          <p className="eyebrow">{tx("AI assistant")}</p>
          <h2>{tx("Property chat")}</h2>
        </div>
        <div className="ai-assistant-header-actions">
          <Button
            type="button"
            variant={isSessionListOpen ? "primary" : "ghost"}
            size="icon"
            aria-label={tx("Previous AI chat sessions")}
            aria-expanded={isSessionListOpen}
            onClick={() => setIsSessionListOpen((current) => !current)}
          >
            <RotateCcw size={17} />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label={tx("New AI chat")} onClick={startNewSession}>
            <MessageSquarePlus size={17} />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label={tx("Close AI assistant")} onClick={onClose}>
            <X size={17} />
          </Button>
        </div>
      </header>

      {isSessionListOpen ? (
        <section className="ai-assistant-sessions" aria-label={tx("Previous AI chat sessions")}>
          {storedSessions.length ? (
            storedSessions.map((session) => (
              <button
                className={String(activeSessionId) === String(session.id) ? "is-active" : ""}
                key={session.id}
                type="button"
                onClick={() => selectSession(session.id)}
              >
                <strong>{session.title}</strong>
                <small>{formatSessionTime(session.lastMessageAt)}</small>
              </button>
            ))
          ) : (
            <p className="muted">{tx("No previous chat sessions on this device.")}</p>
          )}
        </section>
      ) : null}

      <p className="ai-assistant-disclaimer">
        <Bot size={16} />
        {tx("AI output is a draft suggestion. Review important legal or financial decisions with qualified staff.")}
      </p>

      {assistantMeta?.aiStatus || assistantMeta?.provider ? (
        <div className="ai-assistant-status">
          <span>{assistantMeta.aiStatus === "SKIPPED" ? tx("Fallback suggestion") : tx("AI response")}</span>
          <small>{[assistantMeta.provider, assistantMeta.model].filter(Boolean).join(" / ") || tx("Provider updating")}</small>
        </div>
      ) : null}

      <div className="ai-assistant-thread">
        {normalizedError ? (
          <EmptyState
            title={tx("Chat session could not be loaded")}
            description={normalizedError.message}
            action={<Button onClick={() => sessionQuery.refetch()}>{tx("Retry")}</Button>}
          />
        ) : null}
        {!messages.length && !normalizedError ? (
          <EmptyState
            title={tx("Ask about listings, customers, or next steps")}
            description={tx("Send a question and the assistant will answer with system data when available.")}
          />
        ) : null}
        {messages.map((item) => (
          <article className={`ai-assistant-message ai-assistant-message-${item.role}`} key={item.id}>
            <header>
              <strong>{tx(messageLabel(item))}</strong>
              {item.role === "assistant" ? (
                <Button type="button" size="sm" variant="ghost" onClick={() => copyText(item.content)}>
                  <Copy size={14} />
                  {tx("Copy")}
                </Button>
              ) : null}
            </header>
            <p>{item.content}</p>
            {item.errorMessage ? <small>{item.errorMessage}</small> : null}
          </article>
        ))}
        {sendMutation.isPending ? (
          <article className="ai-assistant-message ai-assistant-message-assistant">
            <strong>{tx("Thinking")}</strong>
            <p>{tx("Preparing an AI response from the real estate system.")}</p>
          </article>
        ) : null}
      </div>

      {sessionQuery.data?.suggestedListings.length ? (
        <section className="ai-assistant-suggestions">
          <strong>{tx("Suggested listings")}</strong>
          {sessionQuery.data.suggestedListings.map((listing) => (
            <SuggestedListingCard listing={listing} key={listing.id} />
          ))}
        </section>
      ) : null}

      {sendError ? <p className="form-alert">{sendError.message}</p> : null}

      <form className="ai-assistant-form" onSubmit={submitMessage}>
        <label className="field" htmlFor="ai-assistant-message">
          <span>{tx("Message")}</span>
          <textarea
            ref={textareaRef}
            id="ai-assistant-message"
            className="input textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleMessageKeyDown}
            placeholder={tx("Ask for a shortlist, comparison, customer summary, or follow-up suggestion.")}
          />
        </label>
        <Button type="submit" disabled={!message.trim() || sendMutation.isPending}>
          <Send size={16} />
          {tx("Send")}
        </Button>
      </form>
    </aside>
  );
}
