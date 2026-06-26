import { apiClient } from "../../shared/api/client";

export type AiChatRole = "assistant" | "system" | "user";

export type AiChatMessage = {
  content: string;
  createdAt: string;
  id: number | string;
  role: AiChatRole;
};

export type AiChatSession = {
  createdAt: string;
  id: number | string;
  messages: AiChatMessage[];
  title: string;
};

export type ImageAnalysisSuggestion = {
  caption: string;
  coverRecommendation: string;
  quality: string;
  summary: string;
  warnings: string[];
};

type BackendRecord = Record<string, unknown>;

function isRecord(value: unknown): value is BackendRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(source: BackendRecord, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return fallback;
}

function readArray(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function readRecordArray(source: BackendRecord, keys: string[]) {
  return readArray(source, keys).filter(isRecord);
}

function normalizeRole(value: string): AiChatRole {
  const role = value.toLowerCase();

  if (role === "assistant" || role === "ai") {
    return "assistant";
  }

  if (role === "system") {
    return "system";
  }

  return "user";
}

function normalizeMessage(source: BackendRecord, index = 0): AiChatMessage {
  const id = readString(source, ["id", "messageId"], String(index));

  return {
    content: readString(source, ["content", "message", "text", "answer"], "AI response is not available yet."),
    createdAt: readString(source, ["createdAt", "timestamp", "sentAt"]),
    id,
    role: normalizeRole(readString(source, ["role", "sender", "type"], "assistant"))
  };
}

function normalizeSession(source: BackendRecord): AiChatSession {
  const content = isRecord(source.session) ? source.session : source;
  const id = readString(content, ["id", "sessionId", "conversationId"]);
  const messages = readRecordArray(content, ["messages", "chatMessages", "items", "content"]).map(normalizeMessage);
  const directMessage = isRecord(source.message) ? normalizeMessage(source.message) : null;

  return {
    createdAt: readString(content, ["createdAt", "timestamp"]),
    id,
    messages: directMessage && !messages.some((message) => message.id === directMessage.id)
      ? [...messages, directMessage]
      : messages,
    title: readString(content, ["title", "name"], "AI chat")
  };
}

function normalizeMessageResponse(source: BackendRecord): AiChatMessage {
  const content =
    (isRecord(source.message) && source.message) ||
    (isRecord(source.assistantMessage) && source.assistantMessage) ||
    (isRecord(source.response) && source.response) ||
    source;

  return normalizeMessage(content);
}

function normalizeWarnings(source: BackendRecord) {
  return readArray(source, ["warnings", "issues", "risks", "problems"])
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return isRecord(item) ? readString(item, ["label", "message", "text", "description"]) : "";
    })
    .filter(Boolean);
}

function normalizeImageAnalysis(source: BackendRecord): ImageAnalysisSuggestion {
  const content =
    (isRecord(source.analysis) && source.analysis) ||
    (isRecord(source.result) && source.result) ||
    (isRecord(source.suggestion) && source.suggestion) ||
    source;

  return {
    caption: readString(content, ["caption", "altText", "suggestedCaption", "description"]),
    coverRecommendation: readString(content, ["coverRecommendation", "coverSuggestion", "recommendedCover", "cover"]),
    quality: readString(content, ["quality", "qualityScore", "score", "rating"], "Review manually"),
    summary: readString(content, ["summary", "analysis", "content", "text"], "AI image analysis is not available yet."),
    warnings: normalizeWarnings(content)
  };
}

export function createChatSession(title: string) {
  return apiClient
    .post<BackendRecord>("/ai/chat/sessions", { title })
    .then(normalizeSession);
}

export function getChatSession(sessionId: number | string) {
  return apiClient
    .get<BackendRecord>(`/ai/chat/sessions/${encodeURIComponent(String(sessionId))}`)
    .then(normalizeSession);
}

export function sendChatMessage(sessionId: number | string, content: string) {
  return apiClient
    .post<BackendRecord>(`/ai/chat/sessions/${encodeURIComponent(String(sessionId))}/messages`, { content })
    .then(normalizeMessageResponse);
}

export function analyzePropertyImage(request: {
  imageId: number | string;
  imageUrl: string;
  propertyId: number | string;
}) {
  return apiClient
    .post<BackendRecord>("/ai/property-images/analyze", {
      imageId: request.imageId,
      imageUrl: request.imageUrl,
      propertyId: request.propertyId,
      propertyImageId: request.imageId
    })
    .then(normalizeImageAnalysis);
}
