import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Copy, MessageSquarePlus, RefreshCcw, Search, Send } from "lucide-react";
import { normalizeUnknownError } from "../../shared/api/errors";
import { Button } from "../../shared/ui/Button";
import { EmptyState } from "../../shared/ui/EmptyState";
import { Input } from "../../shared/ui/Input";
import { useText } from "../../shared/i18n/useText";
import { createChatSession, getChatSession, sendChatMessage, type AiChatMessage } from "./aiApi";

function messageLabel(message: AiChatMessage) {
  if (message.role === "assistant") {
    return "AI suggestion";
  }

  if (message.role === "system") {
    return "System";
  }

  return "You";
}

function copyText(value: string) {
  if (navigator.clipboard) {
    void navigator.clipboard.writeText(value);
  }
}

export function AiPage() {
  const tx = useText();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("Real estate assistant");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<number | string | null>(null);
  const [message, setMessage] = useState("");
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const sessionQuery = useQuery({
    enabled: activeSessionId !== null,
    queryFn: () => getChatSession(activeSessionId as number | string),
    queryKey: ["ai-chat-session", activeSessionId],
    retry: 1
  });
  const createMutation = useMutation({
    mutationFn: () => createChatSession(title.trim() || "Real estate assistant"),
    onSuccess: (session) => {
      setActiveSessionId(session.id);
      setSessionIdInput(String(session.id));
      queryClient.setQueryData(["ai-chat-session", session.id], session);
    }
  });
  const sendMutation = useMutation({
    mutationFn: () => sendChatMessage(activeSessionId as number | string, message.trim()),
    onSuccess: () => {
      setMessage("");
      void queryClient.invalidateQueries({ queryKey: ["ai-chat-session", activeSessionId] });
    }
  });
  const normalizedError = sessionQuery.error ? normalizeUnknownError(sessionQuery.error) : null;
  const mutationError = createMutation.error ?? sendMutation.error;
  const normalizedMutationError = mutationError ? normalizeUnknownError(mutationError) : null;
  const messages = useMemo(() => sessionQuery.data?.messages ?? [], [sessionQuery.data?.messages]);

  useEffect(() => {
    if (sessionQuery.data?.id) {
      setSessionIdInput(String(sessionQuery.data.id));
    }
  }, [sessionQuery.data?.id]);

  useEffect(() => {
    setMessageDrafts((current) => {
      const next = { ...current };
      messages.forEach((item) => {
        if (item.role === "assistant" && next[String(item.id)] === undefined) {
          next[String(item.id)] = item.content;
        }
      });
      return next;
    });
  }, [messages]);

  function submitCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  function submitLoad(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sessionIdInput.trim()) {
      setActiveSessionId(sessionIdInput.trim());
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeSessionId !== null && message.trim()) {
      sendMutation.mutate();
    }
  }

  return (
    <section className="ai-page">
      <div className="section-header">
        <div>
          <p className="eyebrow">{tx("AI assistant")}</p>
          <h2>{tx("Chat suggestions")}</h2>
          <p className="muted">
            <Bot size={16} />
            {tx("AI output is a draft suggestion. Review, copy, edit, and confirm with qualified staff for legal or financial decisions.")}
          </p>
        </div>
      </div>
      <div className="ai-chat-layout">
        <aside className="content-section ai-session-panel">
          <form className="form-stack" onSubmit={submitCreate}>
            <Input label={tx("New session title")} value={title} onChange={(event) => setTitle(event.target.value)} />
            <Button type="submit" disabled={createMutation.isPending}>
              <MessageSquarePlus size={16} />
              {tx("Create session")}
            </Button>
          </form>
          <form className="form-stack" onSubmit={submitLoad}>
            <Input label={tx("Load session id")} value={sessionIdInput} onChange={(event) => setSessionIdInput(event.target.value)} />
            <Button type="submit" variant="secondary" disabled={!sessionIdInput.trim()}>
              <Search size={16} />
              {tx("Load session")}
            </Button>
          </form>
          {sessionQuery.data ? (
            <div className="ai-session-meta">
              <span>{tx("Active session")}</span>
              <strong>{sessionQuery.data.title}</strong>
              <small>{sessionQuery.data.id}</small>
              <Button size="sm" variant="secondary" onClick={() => sessionQuery.refetch()} disabled={sessionQuery.isFetching}>
                <RefreshCcw size={16} />
                {tx("Refresh")}
              </Button>
            </div>
          ) : null}
          {normalizedMutationError ? <p className="form-alert">{normalizedMutationError.message}</p> : null}
        </aside>
        <section className="content-section ai-chat-panel">
          {normalizedError ? (
            <EmptyState
              title={tx("Chat session could not be loaded")}
              description={normalizedError.message}
              action={<Button onClick={() => sessionQuery.refetch()}>{tx("Retry")}</Button>}
            />
          ) : null}
          {!activeSessionId ? (
            <EmptyState title={tx("No chat session selected")} description={tx("Create a new chat session or load an existing session id.")} />
          ) : null}
          {sessionQuery.isLoading ? (
            <div className="detail-skeleton">
              <div />
              <div />
            </div>
          ) : null}
          {activeSessionId && sessionQuery.data ? (
            <>
              <div className="ai-message-list">
                {messages.length ? (
                  messages.map((item) => (
                    <article className={`ai-message ai-message-${item.role}`} key={item.id}>
                      <header>
                        <strong>{tx(messageLabel(item))}</strong>
                        {item.role === "assistant" ? (
                          <div className="ai-message-actions">
                            <Button size="sm" variant="secondary" onClick={() => copyText(messageDrafts[String(item.id)] ?? item.content)}>
                              <Copy size={16} />
                              {tx("Copy draft")}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setMessage(messageDrafts[String(item.id)] ?? item.content)}>
                              {tx("Apply to message")}
                            </Button>
                          </div>
                        ) : null}
                      </header>
                      {item.role === "assistant" ? (
                        <label className="field">
                          <span>{tx("Editable AI draft")}</span>
                          <textarea
                            className="input textarea"
                            value={messageDrafts[String(item.id)] ?? item.content}
                            onChange={(event) =>
                              setMessageDrafts((current) => ({
                                ...current,
                                [String(item.id)]: event.target.value
                              }))
                            }
                          />
                        </label>
                      ) : (
                        <p>{item.content}</p>
                      )}
                    </article>
                  ))
                ) : (
                  <EmptyState title={tx("No messages yet")} description={tx("Send a question to get editable AI suggestions.")} />
                )}
              </div>
              <form className="ai-message-form" onSubmit={submitMessage}>
                <label className="field" htmlFor="ai-message">
                  <span>{tx("Message")}</span>
                  <textarea
                    id="ai-message"
                    className="input textarea"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder={tx("Ask for listing copy, property comparison, or next-step suggestions.")}
                  />
                </label>
                <Button type="submit" disabled={!message.trim() || sendMutation.isPending}>
                  <Send size={16} />
                  {tx("Send")}
                </Button>
              </form>
            </>
          ) : null}
        </section>
      </div>
    </section>
  );
}
