import { apiClient } from "../../shared/api/client";

export type AiChatRole = "assistant" | "system" | "user";

export type AiChatMessage = {
  aiStatus: string | null;
  content: string;
  createdAt: string;
  errorMessage: string | null;
  id: number | string;
  model: string | null;
  provider: string | null;
  role: AiChatRole;
};

export type AiSuggestedListing = {
  address: string;
  bathrooms: number | null;
  bedrooms: number | null;
  coverImageUrl: string | null;
  currency: string;
  id: number | string;
  price: number | null;
  slug: string;
  title: string;
};

export type AiChatSession = {
  createdAt: string;
  id: number | string;
  lastMessageAt: string;
  messages: AiChatMessage[];
  status: string;
  suggestedListings: AiSuggestedListing[];
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

function readNumber(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
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
    aiStatus: readString(source, ["aiStatus"]) || null,
    content: readString(source, ["content", "message", "text", "answer"], "AI response is not available yet."),
    createdAt: readString(source, ["createdAt", "timestamp", "sentAt"]),
    errorMessage: readString(source, ["errorMessage"]) || null,
    id,
    model: readString(source, ["model"]) || null,
    provider: readString(source, ["provider"]) || null,
    role: normalizeRole(readString(source, ["role", "sender", "type"], "assistant"))
  };
}

function normalizeSuggestedListing(source: BackendRecord, index = 0): AiSuggestedListing {
  const listing = isRecord(source.listing) ? source.listing : source;
  const id = readNumber(listing, ["id", "listingId"]) ?? readString(listing, ["id", "listingId"], String(index));

  return {
    address: readString(listing, ["fullAddress", "address", "streetAddress"], "Address updating"),
    bathrooms: readNumber(listing, ["bathrooms"]),
    bedrooms: readNumber(listing, ["bedrooms"]),
    coverImageUrl: readString(listing, ["coverImageUrl", "imageUrl", "thumbnailUrl"]) || null,
    currency: readString(listing, ["currency"], "VND"),
    id,
    price: readNumber(listing, ["askingPrice", "price"]),
    slug: readString(listing, ["slug"], String(id)),
    title: readString(listing, ["title", "propertyName", "name"], "Recommended listing")
  };
}

function normalizeSession(source: BackendRecord): AiChatSession {
  const content = isRecord(source.session) ? source.session : source;
  const id = readString(content, ["id", "sessionId", "conversationId"]);
  const messages = readRecordArray(content, ["messages", "chatMessages", "items", "content"]).map(normalizeMessage);
  const directMessage = isRecord(source.message) ? normalizeMessage(source.message) : null;
  const suggestedListings = readRecordArray(content, ["suggestedListings", "recommendations", "listings"])
    .map(normalizeSuggestedListing);

  return {
    createdAt: readString(content, ["createdAt", "timestamp"]),
    id,
    lastMessageAt: readString(content, ["lastMessageAt", "updatedAt", "createdAt"]),
    messages: directMessage && !messages.some((message) => message.id === directMessage.id)
      ? [...messages, directMessage]
      : messages,
    status: readString(content, ["status"], "OPEN"),
    suggestedListings,
    title: readString(content, ["title", "name"], "AI chat")
  };
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
  const firstImage = readRecordArray(source, ["images"])[0];
  const content =
    firstImage ||
    (isRecord(source.analysis) && source.analysis) ||
    (isRecord(source.result) && source.result) ||
    (isRecord(source.suggestion) && source.suggestion) ||
    source;

  return {
    caption: readString(content, ["caption", "altText", "suggestedCaption", "description"]),
    coverRecommendation: readString(content, ["recommendation", "coverRecommendation", "coverSuggestion", "recommendedCover", "cover"]),
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
    .then(normalizeSession);
}

export function analyzePropertyImage(request: {
  imageId: number | string;
}) {
  return apiClient
    .post<BackendRecord>("/ai/property-images/analyze", {
      imageIds: [request.imageId]
    })
    .then(normalizeImageAnalysis);
}
