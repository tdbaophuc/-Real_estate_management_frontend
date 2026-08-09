# Customer Frontend UX/UI API Adoption Plan

Nguon doi chieu:

- `docs/API_FRONTEND_REFERENCE(done).md`
- `docs/CUSTOMER_EXPERIENCE_FRONTEND_PLAN.md`
- Design system moi trong `DESIGN.md`

Muc tieu cua file nay la chuyen huong adoption plan sang customer-facing frontend: xay dung trai nghiem rieng cho nguoi dung `CUSTOMER` nhu mot client portal cua he thong real estate management doanh nghiep that. Phan dashboard cho Admin/Manager/Agent da on dinh tuong doi, nen cac phase ben duoi uu tien Customer portal, Public search, Listing detail, Favorites, Appointment request, Inquiry, Notifications va AI chat.

-CHU Y: khong xay dưng giao dien cho customer dạng dashboard

## 1. Nguyen tac pham vi

### Customer duoc phep thay

- Public listing search.
- Public listing detail.
- Favorite listings.
- Customer dashboard.
- Customer notifications.
- AI chat.
- Account/profile.
- Listing inquiry va appointment request neu endpoint public/customer da co.

### Customer khong nen thay

- Property management.
- Internal listing workflow.
- Customer CRM noi bo.
- Leads/Pipeline.
- Follow-up tasks.
- Contract management.
- Transaction management.
- Commission.
- Reports.
- Admin users/audit logs.

Nhung module noi bo tren van can hoat dong cho Admin/Manager/Agent, nhung khong dua vao customer navigation.

## 2. API hien co co the dung cho Customer UX/UI

| Experience | API trong reference | Role/Auth | Frontend usage |
| --- | --- | --- | --- |
| Public listing search | `GET /api/v1/search/listings` | Public | Trang Browse listings, filter, sort, pagination, listing cards. |
| Public listing detail | `GET /api/v1/search/listings/{slug}` | Public | Property dossier, view tracking bang `X-Session-Id`. |
| Favorite listing | `POST /api/v1/listings/{listingId}/favorite` | CUSTOMER+ | Save listing action tren card/detail. |
| Remove favorite | `DELETE /api/v1/listings/{listingId}/favorite` | CUSTOMER+ | Remove saved listing. |
| Favorite list | `GET /api/v1/listings/favorites` | CUSTOMER+ | Favorites page, dashboard saved listing summary. |
| Notifications | `GET /api/v1/notifications` | Bearer | Customer notification center. |
| Unread count | `GET /api/v1/notifications/unread-count` | Bearer | Badge trong topbar/customer nav. |
| Mark notification read | `PATCH /api/v1/notifications/{id}/read` | Bearer | Notification row action. |
| Mark all notifications read | `PATCH /api/v1/notifications/read-all` | Bearer | Bulk action. |
| AI chat create | `POST /api/v1/ai/chat/sessions` | CUSTOMER/Agent+ | Customer AI advisor session. |
| AI chat message | `POST /api/v1/ai/chat/sessions/{sessionId}/messages` | CUSTOMER/Agent+ | Property question, compare prompt, search refinement. |
| AI chat detail | `GET /api/v1/ai/chat/sessions/{sessionId}` | CUSTOMER/Agent+ | Chat history. |
| Auth me | `GET /api/v1/auth/me` | Bearer | Customer identity/profile shell. |
| Auth login/register/refresh/logout | `/api/v1/auth/**` | Public/Bearer | Customer account flow. |

## 3. API reference can ho tro gian tiep cho customer experience

Nhung endpoint nay khong phai customer-facing truc tiep, nhung co the dung de nhan biet khoang trong hoac phoi hop voi Agent/Manager:

- `Customer CRM API`: hien role `AGENT|MANAGER|ADMIN`, khong phai Customer self-service. Vi vay customer preferences/requirements khong nen goi truc tiep endpoint `/customers/{customerId}/requirements` neu backend chua mo quyen cho Customer.
- `Appointment API`: reference ghi role `AGENT|MANAGER|ADMIN` cho quan ly. Customer-facing appointment request can endpoint public/customer rieng hoac backend da co wrapper trong frontend hien tai. Can xac minh Swagger neu muon lam appointment center cho Customer.
- `Lead API`: customer khong nen thay Lead/Pipeline, nhung inquiry/request co the tao Lead o backend.
- `AI customer recommendations`: `/api/v1/ai/customers/{customerId}/recommendations` role Agent+, nen Customer recommendations tren portal can endpoint customer-safe rieng hoac dung public search/favorites lam fallback.

## 4. Khoang trong API can xac minh truoc khi implement sau

Reference `done` co ghi Public listings/favorites da co; mot so customer workflow can xac minh trong Swagger/current frontend:

1. Listing inquiry endpoint.
   - Can endpoint customer/public de gui inquiry tu listing detail.
   - Neu da co trong code hien tai, document lai path chinh xac.
   - Neu chua co, tam thoi giu local success state va route customer ve notifications.

2. Listing appointment request endpoint.
   - Can endpoint customer/public de request viewing tu listing detail.
   - Khong nen dung appointment management endpoint noi bo neu backend role khong cho Customer.

3. Customer appointment list.
   - Can `GET /appointments/my` co cho CUSTOMER hay khong.
   - Neu khong, appointment center chi hien request success/history tu notifications cho den khi backend bo sung endpoint.

4. Customer preferences.
   - Chua co endpoint Customer self-service trong reference.
   - Can backend endpoint rieng, vi CRM `/customers/{id}/requirements` dang role noi bo.

5. Saved searches.
   - Chua co endpoint.
   - Phase dau co the luu localStorage/client state; phase sau can backend.

6. Compare listings.
   - Co the implement client-side tu public search/detail data.
   - Khong can API moi neu compare chi gom cac field hien co.

## 5. Customer navigation model

Customer authenticated shell nen co navigation rieng:

- Dashboard
- Browse listings
- Favorites
- Appointments
- Notifications
- AI assistant
- Account

Khong hien cac route noi bo:

- Properties
- Listings workflow
- Customers CRM
- Leads
- Follow-up tasks
- Contracts
- Transactions
- Commissions
- Reports
- Admin

Implementation notes:

- Co the loc `navigationItems` theo role nhu hien tai, nhung nen them label/route customer-specific cho Browse listings.
- Public search `/` van public, nhung customer nav co the link ve `/` voi context authenticated.
- Customer dashboard khong nen dung Admin/Manager/Agent dashboard API vi backend chi co `/dashboard/admin`, `/dashboard/manager`, `/dashboard/agent`.

## 6. Customer dashboard API adoption

### Data sources phase 1

- `GET /api/v1/listings/favorites`
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `GET /api/v1/ai/chat/sessions/{sessionId}` neu co active session local state
- Public listing search fallback cho recommendations

### UI sections

- Saved listings summary.
- Recently saved listings.
- Notification highlights.
- AI assistant entry.
- Recommended listings fallback: public search newest/published listings.
- Profile/account completion shell.

### Khong dung trong phase 1

- Internal dashboard API.
- Customer CRM requirements API neu backend chua mo role Customer.
- Lead/contract/transaction internal APIs.

### Acceptance

- Customer login vao `/dashboard` thay portal rieng, khong thay admin-style operational widgets.
- Empty states co CTA ro: browse listings, save listing, ask AI, update account.
- i18n English/Vietnamese pass.

## 7. Public listing search adoption

### API

`GET /api/v1/search/listings`

Query convention theo reference:

- `page`
- `size`
- `sortBy`
- `sortDirection`
- filter hien co trong frontend: keyword, purpose, priceMin/Max, areaMin/Max, bedrooms, bathrooms, sort.

### UX improvements

- Listing cards rich hon: image, status, purpose, price, area, beds/baths, address, save, compare.
- Compare selection toi da 3 listings, client-side.
- Sticky filter summary desktop.
- Mobile filter drawer.
- Sort indicator gon.
- Empty state goi y clear/widen filters.

### API gap

- Saved search chua co backend. Phase 1 dung client-only saved filters neu can, phase sau bo sung endpoint.

## 8. Public listing detail adoption

### API

`GET /api/v1/search/listings/{slug}`

Optional:

```http
X-Session-Id: browser-session-id
```

### UX improvements

- Property dossier layout.
- Media gallery lon + thumbnails.
- Sticky action panel desktop.
- Key facts early: price, area, beds, baths, purpose, status, address.
- Trust/status panel: published status, agent contact availability, last update neu response co.
- Save listing.
- Compare action.
- Inquiry and viewing request forms.

### API gap

- Confirm exact inquiry endpoint.
- Confirm exact appointment request endpoint.
- Neu missing, keep UI shell disabled/coming soon or local success only if product accepts.

## 9. Favorites adoption

### API

- `GET /api/v1/listings/favorites`
- `POST /api/v1/listings/{listingId}/favorite`
- `DELETE /api/v1/listings/{listingId}/favorite`

### UX improvements

- Favorites as shortlist, not just list.
- Group by purpose/status if data available.
- Quick compare.
- Request viewing CTA per listing.
- Warn when saved listing status is sold/rented/unpublished/expired if response exposes status.

### Acceptance

- Customer can save/remove from search and detail.
- Favorites page supports empty, loading, error states.
- Cards remain stable in Vietnamese.

## 10. Appointment customer experience

### Current API interpretation

Reference appointment management is role `AGENT|MANAGER|ADMIN`. Customer appointment UX should not assume write access to internal appointment endpoints unless Swagger confirms.

### Phase 1

- Listing detail request viewing form uses customer/public appointment request endpoint if available.
- On success, show professional confirmation state:
  - request received
  - agent will confirm
  - notification center will show updates

### Phase 2

If customer-safe appointment list exists:

- Build `/appointments` for Customer.
- Upcoming/past/requested tabs.
- Appointment detail with linked listing/property, agent, time, status, location.
- Reschedule/cancel request if endpoint allows.

### Backend gap to request if missing

- `GET /api/v1/customer/appointments` or customer-authorized `/appointments/my`
- `PATCH /customer/appointments/{id}/cancel-request`
- `PATCH /customer/appointments/{id}/reschedule-request`

## 11. Inquiry customer experience

### Phase 1

- Listing detail inquiry form.
- Success state with next step.
- Error validation mapped field-by-field.

### Phase 2

If inquiry history endpoint exists or is added:

- Customer inquiry center.
- Inquiry detail.
- Agent response.
- Linked listing.
- Status timeline.

### Backend gap to request if missing

- `GET /api/v1/customer/inquiries`
- `GET /api/v1/customer/inquiries/{id}`
- Inquiry status enum.

## 12. Customer preferences and recommendations

### Current state

Reference has internal CRM requirements and Agent+ AI recommendations, but no explicit Customer self-service preference endpoint.

### Phase 1 fallback

- Local UI preference draft in account/dashboard.
- Use preference draft to prefill public search filters.
- Use public search results as "Recommended listings".

### Phase 2 backend need

Add customer-safe endpoints:

- `GET /api/v1/customer/preferences`
- `PUT /api/v1/customer/preferences`
- `GET /api/v1/customer/recommendations`

### UX

- Progressive preference form.
- Budget range, purpose, location, area, bedrooms/bathrooms, contact method, viewing availability.
- Completion indicator.
- Recommendations explain matching reason when data exists.

## 13. AI assistant for Customer

### API

- `POST /api/v1/ai/chat/sessions`
- `POST /api/v1/ai/chat/sessions/{sessionId}/messages`
- `GET /api/v1/ai/chat/sessions/{sessionId}`

### UX improvements

- Customer templates:
  - Compare these listings.
  - Ask what to inspect during viewing.
  - Draft questions for Agent.
  - Explain price/area tradeoff.
  - Refine my search.
- AI response shown as draft guidance.
- Never present as legal/financial advice.
- Copy/apply actions.

### Data integration

- Pass selected listing summaries into prompt on compare.
- Pass preference draft into prompt for recommendation guidance.

## 14. Account/profile adoption

### Current reference

`done` reference only lists `GET /auth/me`; update plan cu mentioned newer self-service endpoints. If those endpoints exist in current backend, use them:

- `PATCH /auth/me/profile`
- `POST /auth/me/change-password`
- `POST /auth/me/avatar`
- `DELETE /auth/me/avatar`
- `GET /auth/me/sessions`
- `DELETE /auth/me/sessions/{id}`
- `DELETE /auth/me/sessions`

### Customer UX

- Profile basics: full name, phone, avatar.
- Security: change password.
- Sessions: revoke sessions.
- Preferences entry point.

### Acceptance

- Account page feels like customer portal settings, not admin profile editor.

## 15. Implementation phases

### Phase 1 - Customer portal foundation

1. Split customer dashboard from operational dashboards.
2. Improve Favorites as shortlist.
3. Improve Public listing cards.
4. Add customer navigation polish.
5. Ensure i18n coverage.

APIs:

- Favorites.
- Notifications.
- Public search.
- AI chat shell.

### Phase 2 - Discovery and compare

1. Add compare selection/tray.
2. Add compare modal/page client-side.
3. Improve mobile filters.
4. Add saved search UI shell with local fallback.

APIs:

- Public search/detail.
- Favorites.

### Phase 3 - Listing detail dossier

1. Redesign listing detail.
2. Add sticky action panel.
3. Improve inquiry/request viewing forms.
4. Add trust/status and missing data states.

APIs:

- Public detail.
- Favorite toggle.
- Inquiry endpoint if confirmed.
- Appointment request endpoint if confirmed.

### Phase 4 - Customer appointment/inquiry center

1. Build appointment center if customer API exists.
2. Build inquiry center if customer API exists.
3. Otherwise keep dashboard notification-based timeline.

APIs:

- Customer-safe appointment APIs.
- Customer inquiry APIs.
- Notifications fallback.

### Phase 5 - Preferences and recommendations

1. Add preference form.
2. Use preferences to prefill search.
3. Add recommendations panel.
4. Integrate backend recommendations when customer-safe endpoint exists.

APIs:

- Customer preferences/recommendations if added.
- Public search fallback.
- AI chat for advisory prompts.

## 16. Component worklist

Build or refactor:

- `CustomerDashboardPage` or role-specific customer dashboard section.
- `CustomerListingCard`
- `FavoriteListingCard`
- `ListingCompareTray`
- `ListingCompareModal`
- `MobileFilterDrawer`
- `StickyListingActionPanel`
- `CustomerAppointmentTimeline`
- `CustomerInquirySummary`
- `CustomerPreferenceForm`
- `CustomerRecommendationList`
- `CustomerAiPromptTemplates`

Shared requirements:

- Fully responsive.
- i18n-ready.
- Stable button widths.
- Uses `DESIGN.md` tokens.
- Uses Sentence case.

## 17. Route plan

Customer-visible routes:

- `/dashboard`
- `/`
- `/listing/:slug`
- `/favorites`
- `/appointments` only if customer appointment API confirmed
- `/notifications`
- `/ai`
- `/account`

Optional future routes:

- `/compare`
- `/saved-searches`
- `/inquiries`
- `/preferences`

## 18. React Query/cache plan

Suggested query keys:

- `["public-listings", params]`
- `["public-listing-detail", slug]`
- `["favorite-listings", params]`
- `["favorite-listings", "dashboard"]`
- `["notifications", page]`
- `["notifications", "unread-count"]`
- `["ai-chat-session", sessionId]`
- `["customer-preferences"]` future
- `["customer-recommendations", filters]` future
- `["customer-appointments", params]` future
- `["customer-inquiries", params]` future

Invalidation:

- Favorite toggle invalidates favorite list and current public listing detail.
- Inquiry/request viewing success invalidates notifications if backend creates notification.
- Preference update invalidates recommendations and public listing query if filters are derived.

## 19. Acceptance criteria

Per phase:

- `npm run build` pass.
- `npm run design:lint` pass.
- Customer role does not see internal modules.
- English/Vietnamese switch works on every touched customer screen.
- Empty/loading/error/success states are handled.
- Mobile layout has no horizontal overflow.
- Buttons remain visually stable with Vietnamese labels.
- No raw enum labels shown to customer unless it is intentional technical data.

## 20. First sprint recommendation

Lam truoc cac viec co API chac chan trong `done` reference:

1. Customer dashboard redesign using favorites, notifications, public search fallback, AI entry.
2. Favorites shortlist redesign.
3. Public listing card upgrade.
4. Listing detail action panel and better property dossier layout.
5. Compare tray client-side.
6. Customer navigation cleanup.

Khong block sprint dau boi cac API chua ro nhu saved search, preferences, inquiry history hay customer appointment list. Nhung can de UI theo dung extension points de gan API sau.

## 21. Notes for implementation

- Customer-facing UX phai khac voi internal CRM UX: it hon bang bieu quan tri, nhieu hon ve decision support.
- Khong dung endpoint noi bo chi vi UI can du lieu; neu role backend khong cho Customer thi dung fallback hoac yeu cau endpoint customer-safe.
- Neu can doc Swagger de xac minh inquiry/appointment request path, cap nhat file nay truoc khi code phase 3.
- Khi hoan thanh moi phase, commit theo conventional style, vi du:

```text
feat(customer): improve customer portal listing experience
```
