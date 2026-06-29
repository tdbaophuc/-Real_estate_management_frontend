# Customer Experience Frontend Plan

## Objective

Build the customer-facing experience into a professional enterprise real estate management portal, not just a public listing search. The customer journey should feel trustworthy, efficient, and polished while still fitting the operational product style defined in `DESIGN.md`.

The customer side should support three outcomes:

- Customers can discover suitable properties with confidence.
- Customers can manage saved listings, appointments, inquiries, and preferences from one account area.
- Agents and managers receive better-qualified customer intent through structured actions, not vague contact forms.

## Product Positioning

The customer experience should feel like a private client portal for a real estate firm:

- Professional, calm, high-trust visual style.
- Clear property facts, price, status, media, agent ownership, and next actions.
- Strong support for comparison and decision-making.
- No marketing-heavy landing-page treatment inside authenticated customer flows.
- Keep domain terms such as Listing, Property, Appointment, Agent, CRM, AI, and Pipeline when they are product concepts.

## Current Frontend Baseline

Existing customer-facing areas:

- Public listing search at `/`.
- Public listing detail at `/listing/:slug`.
- Favorites at `/favorites`.
- Customer dashboard variant in `/dashboard`.
- Login/register routes.
- Customer access to notifications and AI assistant.

Known gaps:

- Customer dashboard is still a shortcut page, not a true portal.
- Public search lacks saved filters, comparison, richer listing cards, and guided discovery.
- Listing detail has inquiry and appointment forms, but the UX does not yet feel like a premium customer consultation flow.
- Favorites are separated from recommendations, appointment intent, and customer requirements.
- Customer profile/preferences are not yet surfaced as a customer-facing journey.

## Design Direction

Use the updated `DESIGN.md` system:

- Primary: deep estate teal for navigation and primary actions.
- Secondary: slate for metadata and helper text.
- Tertiary bronze only for high-value business actions.
- Neutral light app canvas and white surfaces.
- Sentence case labels.
- Stable button widths across English and Vietnamese.
- No flags for language switching.
- No decorative blobs, glossy real estate marketing gradients, or oversized landing sections in authenticated customer flows.

Customer-facing pages can be warmer than internal admin screens, but they should still feel like part of the same enterprise platform.

## Experience Architecture

### 1. Customer dashboard

Replace the current simple shortcut dashboard with a customer portal overview.

Sections:

- Saved listings summary.
- Upcoming appointments.
- Recent inquiries and responses.
- Recommended listings based on saved listings and requirements.
- Profile completion panel.
- Notification highlights.
- AI assistant entry for property questions and comparison.

Recommended components:

- Compact metric cards: saved listings, upcoming appointments, active inquiries.
- "Next best action" strip: complete profile, review recommendations, request viewing.
- Recommended listing row with price, purpose, location, status, and agent.
- Appointment timeline with status badges.

UX rules:

- Dashboard should fit real customer work: review, compare, request, follow up.
- Avoid generic welcome copy.
- Make every section actionable.

### 2. Public listing search

Upgrade search into a serious discovery workspace.

Improvements:

- Add sticky filter summary on desktop.
- Add saved search controls for authenticated customers.
- Add "Compare" selection up to 3 listings.
- Add listing card facts: price, area, bedrooms, bathrooms, location, purpose, published status, agent availability.
- Add empty state suggestions: clear filters, widen price range, change purpose.
- Add responsive filter drawer on mobile.

Interaction details:

- Search and reset buttons must keep stable width in Vietnamese.
- Filters should not shift layout when labels change.
- Sort state should be visible and concise.
- Listing cards should not become decorative marketing cards.

### 3. Listing detail

Make the detail page a consultative property dossier.

Sections:

- Header: title, status, purpose, location, price, primary actions.
- Media gallery: large image, thumbnails, fallback state.
- Key facts: price, area, rooms, legal/furniture/status facts when available.
- Description and amenities.
- Agent/contact panel.
- Inquiry form.
- Viewing request form.
- Similar or recommended listings.
- Trust panel: listing status, last update, verification cues if API supports it.

Primary actions:

- Save listing.
- Request viewing.
- Send inquiry.
- Compare.

UX rules:

- Keep inquiry and appointment forms concise.
- Use clear success states after submission.
- Show missing agent email/phone as quiet disabled states, not broken controls.
- Do not hide important price/status facts below the fold.

### 4. Favorites

Turn Favorites into a working shortlist.

Improvements:

- Group saved listings by purpose: sale, rent, other.
- Add quick compare.
- Add notes per favorite if backend supports it later.
- Add status change warnings when a saved listing becomes sold, rented, unpublished, or expired.
- Add CTA to request viewing from each saved listing.

Empty state:

- Show actionable guidance: browse listings, adjust filters, save listings to compare later.

### 5. Customer profile and preferences

Add or extend customer account experience for buying/rental preferences.

Fields:

- Preferred purpose: sale/rent.
- Preferred locations.
- Budget range.
- Area range.
- Bedrooms/bathrooms.
- Preferred contact method.
- Viewing availability.

UX:

- Use progressive sections, not one long intimidating form.
- Show profile completion percentage.
- Feed preferences into recommendations when API support exists.

### 6. Appointments for customers

Customers should have a clear appointment center.

Views:

- Upcoming appointments.
- Past appointments.
- Requested appointments pending confirmation.
- Appointment detail with agent, property/listing, time, location, notes, and status.

Actions:

- Request reschedule.
- Cancel request with reason.
- Add feedback after viewing.

Design:

- Timeline layout for upcoming appointments.
- Status badges for pending, confirmed, rescheduled, completed, cancelled.

### 7. Customer inquiries

Create a customer-facing inquiry center when backend endpoints are available.

Views:

- Inquiry list.
- Inquiry detail.
- Linked listing/property.
- Status and agent response.

Fallback:

- Until dedicated endpoints exist, show successful inquiry submission states on listing detail and route customers to notifications.

### 8. AI assistant for customers

Make AI useful for customer decisions without overpromising.

Use cases:

- Compare selected listings.
- Explain tradeoffs between two properties.
- Draft questions for agent.
- Summarize viewing notes.
- Suggest search refinements.

UX rules:

- Always label AI output as draft guidance.
- Do not frame AI as legal or financial advice.
- Provide copy/apply actions.
- Keep history tied to customer session.

## Navigation Model

Authenticated customer navigation should include:

- Dashboard.
- Browse listings.
- Favorites.
- Appointments.
- Notifications.
- AI assistant.
- Account.

Avoid exposing internal CRM modules to customers:

- Properties management.
- Leads.
- Follow-up tasks.
- Contracts management.
- Transactions management.
- Commissions.
- Reports.
- Admin.

## Implementation Phases

### Phase 1. Customer portal foundation

Scope:

- Redesign customer dashboard.
- Add stronger customer navigation labels.
- Improve Favorites empty/list states.
- Improve public listing card hierarchy.
- Ensure all customer pages support i18n.

Acceptance:

- Customer role lands on a useful dashboard.
- Customer can browse, save, and open listings without operational clutter.
- Build and design lint pass.

### Phase 2. Discovery and comparison

Scope:

- Add compare selection in public listing search.
- Add compare tray.
- Add compare page or modal.
- Add saved search UI shell.
- Improve mobile filter drawer.

Acceptance:

- Customer can compare up to 3 listings.
- Compare UI is responsive and stable in English/Vietnamese.
- Empty and limit states are handled.

### Phase 3. Listing detail upgrade

Scope:

- Redesign listing detail as a property dossier.
- Add stronger media gallery layout.
- Improve inquiry and appointment forms.
- Add sticky action panel on desktop.
- Add success/error states for inquiry and appointment request.

Acceptance:

- Key property facts are visible early.
- Inquiry and viewing request flows feel professional.
- Missing data states are clean.

### Phase 4. Preferences and recommendations

Scope:

- Add customer preference form.
- Add recommendations panel.
- Integrate recommendation API if available.
- Provide preference-based empty states.

Acceptance:

- Customer can express needs clearly.
- Recommendations have transparent reason labels when possible.

### Phase 5. Appointment and inquiry center

Scope:

- Build appointment center for customers.
- Add inquiry center when API support exists.
- Add customer timeline across inquiries, appointments, and saved listings.

Acceptance:

- Customer can track active relationship with the business.
- Agents receive clearer customer intent.

## UI Component Worklist

Reusable components to add or improve:

- `ListingCard` with customer actions.
- `ListingCompareTray`.
- `ListingCompareTable`.
- `CustomerDashboardSummary`.
- `AppointmentTimeline`.
- `CustomerPreferenceForm`.
- `CustomerIntentPanel`.
- `StickyActionPanel`.
- `MobileFilterDrawer`.
- `SavedSearchBar`.
- `RecommendationList`.

## Data And API Dependencies

Already likely available:

- Public listing search/detail.
- Favorites.
- Appointment request.
- Listing inquiry.
- Notifications.
- AI chat.
- Customer profile/account.

Likely needed or to confirm:

- Saved searches.
- Compare metadata endpoint, or use existing listing detail records.
- Customer preferences.
- Customer inquiry list/history.
- Customer appointment list/detail scoped by customer.
- Recommendation reasons.

## Accessibility And Responsiveness

Requirements:

- All filters and forms must have accessible labels.
- Buttons must not rely on icon-only meaning unless aria-label is present.
- Color must not be the only status indicator.
- Mobile filters must be reachable and dismissible.
- Text must not overflow in Vietnamese.
- Primary actions must remain reachable on listing detail mobile.

## i18n Requirements

- All customer-facing text must support English and Vietnamese.
- Preserve domain terms when they are product concepts: Listing, Property, Lead, CRM, Pipeline, Kanban, Contract, Transaction, AI.
- Use Sentence case in both languages.
- Avoid long Vietnamese labels in buttons when a shorter professional verb works.
- Do not use national flags for language switching.

## Quality Gates

Before merging each phase:

- `npm run design:lint`
- `npm run build`
- Verify customer role navigation manually.
- Verify desktop and mobile layouts.
- Verify English/Vietnamese switch on every touched screen.
- Check empty, loading, error, and success states.

## Suggested First Sprint

1. Redesign `CustomerDashboard`.
2. Improve `FavoriteListingsPage`.
3. Extract reusable `CustomerListingCard`.
4. Improve `PublicListingSearchPage` card layout and filter stability.
5. Add customer-specific navigation polish.
6. Run i18n pass on all touched customer screens.

Target outcome:

The customer role should feel like a real client portal after the first sprint, even before advanced compare and saved search features are added.
