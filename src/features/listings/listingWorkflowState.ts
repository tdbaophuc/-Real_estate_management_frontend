import type { ListingRecord } from "./listingApi";

const STORAGE_KEY = "real-estate:last-listing-workflows";

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function readStoredListings(): ListingRecord[] {
  if (!canUseSessionStorage()) {
    return [];
  }

  const rawValue = window.sessionStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsed) ? (parsed as ListingRecord[]) : [];
  } catch {
    return [];
  }
}

export function getStoredListing(listingId: number | string) {
  return readStoredListings().find((listing) => String(listing.id) === String(listingId)) ?? null;
}

export function getStoredListings() {
  return readStoredListings();
}

export function saveListingWorkflowState(listing: ListingRecord) {
  if (!canUseSessionStorage()) {
    return;
  }

  const listings = readStoredListings().filter((item) => String(item.id) !== String(listing.id));
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([listing, ...listings].slice(0, 10)));
}
