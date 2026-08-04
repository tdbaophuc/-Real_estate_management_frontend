import { API_BASE_URL } from "../../shared/api/config";
import { normalizeApiError } from "../../shared/api/errors";
import type { PublicListing, PublicListingImage } from "./publicListingApi";

export type PublicAiChatRole = "assistant" | "system" | "user";

export type PublicAiChatMessage = {
  aiStatus: string | null;
  content: string;
  createdAt: string;
  errorMessage: string | null;
  id: number | string;
  model: string | null;
  provider: string | null;
  role: PublicAiChatRole;
};

export type PublicAiChatSession = {
  createdAt: string;
  guestSessionId: string | null;
  id: number | string;
  lastMessageAt: string | null;
  messages: PublicAiChatMessage[];
  status: string;
  suggestedListings: PublicListing[];
  title: string;
};

export type PublicAiSessionResult = {
  guestSessionId: string | null;
  session: PublicAiChatSession;
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

function readBoolean(source: BackendRecord, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return false;
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

function createUrl(path: string) {
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function normalizeRole(value: string): PublicAiChatRole {
  const role = value.toLowerCase();

  if (role === "assistant" || role === "ai") {
    return "assistant";
  }

  if (role === "system") {
    return "system";
  }

  return "user";
}

function normalizeMessage(source: BackendRecord, index = 0): PublicAiChatMessage {
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

function normalizeListingImages(source: BackendRecord): PublicListingImage[] {
  return readRecordArray(source, ["images"])
    .map((image, index): PublicListingImage | null => {
      const imageUrl = readString(image, ["imageUrl"]);

      if (!imageUrl) {
        return null;
      }

      return {
        altText: readString(image, ["altText", "alt", "caption", "description"]),
        coverImage: readBoolean(image, ["coverImage"]),
        displayOrder: readNumber(image, ["displayOrder"]),
        id: readNumber(image, ["id"]) ?? readString(image, ["id"], String(index)),
        imageUrl
      };
    })
    .filter((image): image is PublicListingImage => Boolean(image));
}

function normalizeSuggestedListing(source: BackendRecord, index = 0): PublicListing {
  const listing = isRecord(source.listing) ? source.listing : source;
  const id = readNumber(listing, ["id", "listingId"]) ?? readString(listing, ["id", "listingId"], String(index));
  const images = normalizeListingImages(listing);
  return {
    address: readString(listing, ["fullAddress", "address", "streetAddress"], "Address updating"),
    area: readNumber(listing, ["floorArea", "landArea", "area"]),
    bathrooms: readNumber(listing, ["bathrooms"]),
    bedrooms: readNumber(listing, ["bedrooms"]),
    coverImageUrl: readString(listing, ["coverImageUrl"]) || null,
    currency: readString(listing, ["currency"], "VND"),
    id,
    images,
    price: readNumber(listing, ["askingPrice", "price"]),
    propertyTypeName: readString(listing, ["propertyTypeName"], "Property"),
    purpose: readString(listing, ["purpose"]) === "RENT" ? "RENT" : readString(listing, ["purpose"]) === "SALE" ? "SALE" : null,
    slug: readString(listing, ["slug"], String(id)),
    status: readString(listing, ["status", "listingStatus"], "PUBLISHED"),
    title: readString(listing, ["title", "propertyName", "name"], "Recommended listing")
  };
}

function normalizeSession(source: BackendRecord): PublicAiChatSession {
  return {
    createdAt: readString(source, ["createdAt", "timestamp"]),
    guestSessionId: readString(source, ["guestSessionId"]) || null,
    id: readNumber(source, ["id", "sessionId"]) ?? readString(source, ["id", "sessionId"]),
    lastMessageAt: readString(source, ["lastMessageAt", "updatedAt"]) || null,
    messages: readRecordArray(source, ["messages"]).map(normalizeMessage),
    status: readString(source, ["status"], "OPEN"),
    suggestedListings: readRecordArray(source, ["suggestedListings"]).map(normalizeSuggestedListing),
    title: readString(source, ["title"], "Landing page chat")
  };
}

async function publicAiRequest(path: string, body: Record<string, unknown> | undefined, guestSessionId?: string | null) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json"
  });

  if (guestSessionId) {
    headers.set("X-Guest-Session-Id", guestSessionId);
  }

  const response = await fetch(createUrl(path), {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method: "POST"
  });
  const parsedBody = await parseResponse(response);

  if (!response.ok) {
    throw normalizeApiError(response.status, parsedBody, response.statusText);
  }

  const envelope = isRecord(parsedBody) && isRecord(parsedBody.data) ? parsedBody : null;
  const data = envelope ? envelope.data : parsedBody;

  if (!isRecord(data)) {
    throw normalizeApiError(response.status, parsedBody, "Unexpected AI response");
  }

  return {
    guestSessionId: response.headers.get("X-Guest-Session-Id") || readString(data, ["guestSessionId"]) || null,
    session: normalizeSession(data)
  };
}

export function createPublicAiChatSession(guestSessionId?: string | null) {
  return publicAiRequest("/public/ai/chat/sessions", { title: "Landing page chat" }, guestSessionId);
}

export function sendPublicAiChatMessage(sessionId: number | string, content: string, guestSessionId: string) {
  return publicAiRequest(
    `/public/ai/chat/sessions/${encodeURIComponent(String(sessionId))}/messages`,
    { content },
    guestSessionId
  );
}
