import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bot, ExternalLink, Send, X } from "lucide-react";
import { Link } from "react-router-dom";
import { normalizeUnknownError } from "../../shared/api/errors";
import { formatCurrency } from "../../shared/lib/format";
import { Button } from "../../shared/ui/Button";
import { getPublicListingImageUrl, type PublicListing } from "./publicListingApi";
import {
  createPublicAiChatSession,
  sendPublicAiChatMessage,
  type PublicAiChatMessage,
  type PublicAiChatSession
} from "./publicAiApi";

const guestSessionStorageKey = "rem.public.ai.guestSessionId";
const chatSessionStorageKey = "rem.public.ai.chatSessionId";
const initialMessage: PublicAiChatMessage = {
  aiStatus: null,
  content: "Tell me what kind of property you need. I can search public listings and suggest matching options.",
  createdAt: "",
  errorMessage: null,
  id: "welcome",
  model: null,
  provider: null,
  role: "assistant"
};

function listingUrl(listing: PublicListing) {
  return `/listing/${listing.slug}`;
}

function PublicSuggestedListingCard({ listing }: { listing: PublicListing }) {
  const imageUrl = getPublicListingImageUrl(listing);

  return (
    <Link className="ai-assistant-listing" to={listingUrl(listing)}>
      <div
        className="ai-assistant-listing-media"
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {!imageUrl ? <ExternalLink size={16} /> : null}
      </div>
      <span>
        <strong>{listing.title}</strong>
        <small>{listing.address}</small>
        <b>{listing.price ? formatCurrency(listing.price, listing.currency) : "Price updating"}</b>
      </span>
    </Link>
  );
}

export function PublicAiAssistantPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [chatSession, setChatSession] = useState<PublicAiChatSession | null>(null);
  const [messages, setMessages] = useState<PublicAiChatMessage[]>([initialMessage]);
  const [suggestedListings, setSuggestedListings] = useState<PublicListing[]>([]);
  const [rateLimitMessage, setRateLimitMessage] = useState("");
  const chatMutation = useMutation({
    retry: false,
    mutationFn: async (content: string) => {
      const storedGuestSessionId =
        chatSession?.guestSessionId ??
        window.localStorage.getItem(guestSessionStorageKey) ??
        window.sessionStorage.getItem(guestSessionStorageKey);
      const storedChatSessionId =
        chatSession?.id ??
        window.localStorage.getItem(chatSessionStorageKey) ??
        window.sessionStorage.getItem(chatSessionStorageKey);

      if (storedChatSessionId && storedGuestSessionId) {
        return sendPublicAiChatMessage(storedChatSessionId, content, storedGuestSessionId);
      }

      const createdSession = await createPublicAiChatSession(storedGuestSessionId);
      const nextGuestSessionId = createdSession.guestSessionId ?? createdSession.session.guestSessionId;

      if (!nextGuestSessionId) {
        throw new Error("Missing guest session id from public AI response.");
      }

      window.localStorage.setItem(guestSessionStorageKey, nextGuestSessionId);
      window.sessionStorage.setItem(guestSessionStorageKey, nextGuestSessionId);
      window.localStorage.setItem(chatSessionStorageKey, String(createdSession.session.id));
      window.sessionStorage.setItem(chatSessionStorageKey, String(createdSession.session.id));
      setChatSession(createdSession.session);

      return sendPublicAiChatMessage(createdSession.session.id, content, nextGuestSessionId);
    },
    onSuccess: (result) => {
      const nextGuestSessionId = result.guestSessionId ?? result.session.guestSessionId;

      if (nextGuestSessionId) {
        window.localStorage.setItem(guestSessionStorageKey, nextGuestSessionId);
        window.sessionStorage.setItem(guestSessionStorageKey, nextGuestSessionId);
      }

      window.localStorage.setItem(chatSessionStorageKey, String(result.session.id));
      window.sessionStorage.setItem(chatSessionStorageKey, String(result.session.id));
      setMessage("");
      setRateLimitMessage("");
      setChatSession(result.session);
      setMessages(result.session.messages.length ? result.session.messages : [initialMessage]);
      setSuggestedListings(result.session.suggestedListings);
    },
    onError: (error) => {
      const normalizedError = normalizeUnknownError(error);

      if (normalizedError.status === 429) {
        setRateLimitMessage("Too many guest AI requests. Please wait a moment before trying again.");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          aiStatus: null,
          content: normalizedError.message,
          createdAt: "",
          errorMessage: null,
          id: current.length + 1,
          model: null,
          provider: null,
          role: "assistant"
        }
      ]);
    }
  });

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || chatMutation.isPending || rateLimitMessage) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        aiStatus: null,
        content: trimmedMessage,
        createdAt: "",
        errorMessage: null,
        id: `local-${Date.now()}`,
        model: null,
        provider: null,
        role: "user"
      }
    ]);
    chatMutation.mutate(trimmedMessage);
  }

  return (
    <aside className="ai-assistant-panel public-ai-assistant-panel" aria-label="AI assistant">
      <header className="ai-assistant-header">
        <div>
          <p className="eyebrow">AI assistant</p>
          <h2>Property chat</h2>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label="Close AI assistant" onClick={onClose}>
          <X size={17} />
        </Button>
      </header>
      <p className="ai-assistant-disclaimer">
        <Bot size={16} />
        Guest assistant uses public listing context only. Login for private CRM and transaction AI.
      </p>
      {rateLimitMessage ? <p className="form-alert">{rateLimitMessage}</p> : null}
      <div className="ai-assistant-thread">
        {messages.map((item) => (
          <article className={`ai-assistant-message ai-assistant-message-${item.role}`} key={item.id}>
            <header>
              <strong>{item.role === "assistant" ? "AI assistant" : "You"}</strong>
            </header>
            <p>{item.content}</p>
          </article>
        ))}
        {chatMutation.isPending ? (
          <article className="ai-assistant-message ai-assistant-message-assistant">
            <strong>Thinking</strong>
            <p>Preparing a public AI response.</p>
          </article>
        ) : null}
      </div>
      {suggestedListings.length ? (
        <section className="ai-assistant-suggestions">
          <strong>Suggested listings</strong>
          {suggestedListings.map((listing) => (
            <PublicSuggestedListingCard listing={listing} key={listing.id} />
          ))}
        </section>
      ) : null}
      <form className="ai-assistant-form" onSubmit={submitMessage}>
        <label className="field" htmlFor="public-ai-assistant-message">
          <span>Message</span>
          <textarea
            id="public-ai-assistant-message"
            className="input textarea"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask for listings by location, purpose, budget, or property type."
          />
        </label>
        <Button type="submit" disabled={!message.trim() || chatMutation.isPending || Boolean(rateLimitMessage)}>
          <Send size={16} />
          Send
        </Button>
      </form>
    </aside>
  );
}
