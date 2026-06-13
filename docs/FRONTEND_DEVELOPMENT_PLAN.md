# Frontend Development Plan

> Cap nhat ngay 13/06/2026. Tai lieu nay dua tren `API_FRONTEND_REFERENCE.md`
> va backend hien co cua he thong Real Estate Management.

## 1. Dinh huong san pham

Frontend nen duoc phat trien nhu mot ung dung doanh nghiep thuc te, gom hai
phan chinh:

- Public portal cho khach hang tim kiem va xem bat dong san.
- Internal operating system cho Admin, Manager, Agent va Customer da dang nhap.

Muc tieu khong chi la CRUD UI, ma la mot workflow day du:

```text
Property -> Listing -> Lead -> Appointment -> Contract -> Transaction -> Commission/Report
```

## 2. Stack de xuat

- React + TypeScript + Vite.
- React Router cho routing.
- TanStack Query cho server state/cache.
- Zustand hoac Context nho cho auth/session UI state.
- React Hook Form + Zod cho form va validation.
- Axios hoac fetch wrapper co interceptor refresh token.
- Tailwind CSS + shadcn/ui, hoac mot component system rieng theo style doanh nghiep.
- Recharts cho dashboard/report.
- FullCalendar hoac calendar component tot cho appointment.
- lucide-react cho icon.

## 3. Kien truc thu muc

```text
src/
  app/
    router/
    providers/
    layouts/
  shared/
    api/
    auth/
    components/
    constants/
    hooks/
    lib/
    types/
    ui/
  features/
    auth/
    public-listings/
    dashboard/
    properties/
    listings/
    customers/
    leads/
    appointments/
    contracts/
    transactions/
    commissions/
    notifications/
    reports/
    admin-users/
    audit-logs/
    ai/
```

## 4. Phase 0 - Foundation

Muc tieu: dung nen tang frontend chuan, de mo rong va bao tri.

Cong viec:

1. Khoi tao project React TypeScript.
2. Cau hinh routing theo role.
3. Xay `apiClient`:
   - Base URL local: `http://localhost:8081/api/v1`.
   - Tu unwrap `ApiResponse.data`.
   - Gan `Authorization: Bearer <token>`.
   - Refresh token khi gap `401`.
   - Chuan hoa loi thanh `{ code, message, fieldErrors }`.
4. Xay auth store:
   - `accessToken`.
   - `refreshToken`.
   - `expiresInSeconds`.
   - Current user tu `/auth/me`.
5. Tao layout chinh:
   - Public layout.
   - Authenticated app shell.
   - Sidebar theo role.
   - Topbar co notification badge va user menu.
6. Tao design system co ban:
   - Button, Input, Select, DatePicker.
   - Table, Pagination, Dialog, Drawer.
   - StatusBadge, EmptyState, ConfirmDialog.
   - FileUploader, ImageGallery.
7. Tao enum label map cho toan bo enum trong tai lieu API.

Deliverable:

- Login duoc.
- App shell chay duoc.
- Route guard dung role.
- API client xu ly token va loi on dinh.

## 5. Phase 1 - Public Website

Muc tieu: khach hang co the tim kiem va xem bat dong san nhu mot website that.

Routes:

```text
/
/listing/:slug
/login
/register
```

Tinh nang:

1. Trang search listing public:
   - Keyword.
   - Purpose: `SALE` hoac `RENT`.
   - Price range.
   - Area range.
   - Bedrooms/bathrooms.
   - Location filters neu co du lieu tinh.
   - Sort.
   - Pagination.
2. Listing card:
   - Cover image.
   - Gia format VND/USD.
   - Dien tich, phong ngu, phong tam.
   - Dia chi tom tat.
   - Badge sale/rent/status.
3. Listing detail:
   - Gallery.
   - Thong tin chinh.
   - Tien ich.
   - Mo ta.
   - Agent/contact block.
   - Favorite button neu da login.
   - Gui yeu cau tu van hoac tao lead neu backend ho tro qua lead API.
4. Gui `X-Session-Id` khi xem detail de backend ghi view.

Deliverable:

- Guest search duoc listing.
- Guest xem duoc detail.
- Customer dang nhap co the favorite listing.

## 6. Phase 2 - Auth va Role-Based Dashboard

Muc tieu: moi role vao dashboard dung chuc nang.

Routes:

```text
/dashboard
/notifications
```

Dashboard theo role:

- `ADMIN`: tong user, property, listing, doanh thu, lead, audit/report shortcut.
- `MANAGER`: listing cho duyet, lead pipeline, revenue, agent performance.
- `AGENT`: lead duoc giao, lich hen hom nay, property/listing cua minh,
  commission ca nhan.
- `CUSTOMER`: favorite listings, AI chat, lich hen neu backend cho phep.

Tinh nang nen tang:

1. Login, register, logout.
2. Refresh token queue de tranh nhieu request refresh cung luc.
3. Protected route theo role.
4. Notification unread badge bang polling.
5. Global error boundary va toast.

Deliverable:

- Dang nhap on dinh.
- Phan quyen UI ro rang.
- Dashboard hien thi dung theo role.

## 7. Phase 3 - Property Management

Routes:

```text
/properties
/properties/new
/properties/:id
/properties/:id/edit
```

Tinh nang:

1. Danh sach property:
   - Search, filter, status, purpose.
   - Table view va co the them card view.
   - Pagination.
2. Form tao/sua property:
   - Basic info.
   - Price/area.
   - Address.
   - Legal/furniture/direction.
   - Amenities.
   - Owner/assigned agent.
3. Detail property:
   - Tong quan.
   - Images.
   - Listing lien quan neu co.
   - Status workflow.
4. Upload anh:
   - Multi upload.
   - Set cover.
   - Delete image.
   - Alt text/display order.
5. Status action:
   - `DRAFT -> AVAILABLE`.
   - `RESERVED`, `SOLD`, `RENTED`, `INACTIVE` tuy quyen va business rule.

Deliverable:

- Agent tao property.
- Upload anh va set cover.
- Doi trang thai property.

## 8. Phase 4 - Listing Workflow

Routes:

```text
/listings
/listings/new
/listings/:id/edit
/listings/review
```

Luu y quan trong:

- Backend hien chua co `GET /api/v1/listings`.
- Backend hien chua co `GET /api/v1/listings/{id}` noi bo.
- Listing da publish co the lay qua public search/detail.
- Moderation UI day du cho draft/pending can backend bo sung API list/detail noi bo.

Huong xu ly frontend hien tai:

1. Tao listing draft tu property.
2. Sau create/update, giu response trong state/cache de tiep tuc workflow.
3. Listing da publish lay qua `/api/v1/search/listings`.
4. Neu can man hinh duyet tin day du, de xuat bo sung backend API.

Tinh nang:

- Create/update listing.
- AI generate description.
- Submit review.
- Manager/Admin approve hoac reject.
- Publish/unpublish.
- SEO fields.
- Visibility/package.

Deliverable:

- Workflow tao, duyet va publish listing hoat dong trong gioi han API hien co.

## 9. Phase 5 - CRM: Customers va Leads

Routes:

```text
/customers
/customers/new
/customers/:id
/leads
/leads/:id
```

Customer:

- List/search.
- Create/update.
- Detail profile.
- Notes.
- Requirements.
- Timeline.
- AI customer summary.
- AI recommendations.

Lead:

- Pipeline board theo status.
- Lead list/table.
- Detail lead.
- Assign agent.
- Update status.
- Add note/activity.
- Follow-up task.
- AI lead scoring.

Deliverable:

- Agent co CRM thuc te de quan ly khach hang va co hoi ban hang.

## 10. Phase 6 - Appointment Calendar

Routes:

```text
/appointments
/appointments/my
/appointments/:id
```

Tinh nang:

- Calendar view.
- List view.
- Create appointment.
- Confirm/cancel/reschedule.
- Complete appointment.
- Feedback sau viewing.
- Status badge.
- Conflict warning o UI neu chon lich trung trong du lieu hien co.

Deliverable:

- Agent va manager quan ly lich xem nha theo workflow that.

## 11. Phase 7 - Contract, Transaction, Payment

Routes:

```text
/contracts
/contracts/:id
/transactions
/transactions/:id
```

Contract:

- Create/update draft.
- Upload document.
- Submit review.
- Approve.
- Mark signed.
- Cancel.

Transaction:

- Create tu contract.
- Update status.
- Add deposit.
- Payment schedules.
- Payments.
- Invoice metadata.
- Receipt metadata.

UX can lam ky:

- Timeline trang thai.
- Action buttons theo status va role.
- Confirm dialog cho action quan trong.
- Idempotency key cho deposit/payment neu frontend co retry.

Deliverable:

- Theo doi duoc luong tu hop dong den giao dich hoan tat.

## 12. Phase 8 - Commission, Reports, Audit, Admin

Routes:

```text
/commissions
/commission-rules
/reports
/admin/users
/admin/audit-logs
```

Tinh nang:

- Agent xem `/commissions/my`.
- Manager/Admin xem toan bo commission.
- Mark paid.
- Commission rules.
- Reports:
  - Revenue.
  - Leads.
  - Transactions.
  - Commissions.
- Date range filter.
- Charts va table.
- Admin user management:
  - List users.
  - Change status.
  - Assign roles.
- Audit log:
  - Search/filter.
  - Detail drawer.

Deliverable:

- Co day du phan quan tri, bao cao va audit cho doanh nghiep.

## 13. Phase 9 - AI Assistant Layer

Routes:

```text
/ai
```

AI nen duoc tich hop theo ngu canh, khong chi lam mot trang chat rieng.

Tich hop:

1. Listing form:
   - Generate/improve description.
   - SEO title/description/keywords.
   - User duoc sua truoc khi submit.
2. Customer detail:
   - AI summary.
   - Recommendation listings.
3. Lead detail:
   - AI score.
   - Suggested next action.
4. Property images:
   - Analyze image quality.
   - Caption/cover suggestion neu backend tra ve.
5. AI chat:
   - Create session.
   - Send message.
   - Session detail/messages.

Deliverable:

- AI tro thanh cong cu ho tro workflow that, khong phai demo roi rac.

## 14. Phase 10 - Production Polish

Truoc khi coi la hoan thien:

1. Loading skeleton cho list/detail.
2. Empty states co action ro rang.
3. Error states co retry.
4. Form validation day du.
5. Role-based hidden/disabled actions.
6. Responsive desktop/tablet/mobile.
7. Accessibility co ban:
   - Label.
   - Keyboard navigation.
   - Focus state.
8. Format chuan:
   - Currency.
   - Date/time.
   - Status label tieng Viet.
9. Test:
   - API client.
   - Auth refresh flow.
   - Route guard.
   - Critical forms.
10. E2E demo flow:
   - Login admin.
   - Agent tao property.
   - Upload image.
   - Tao listing.
   - Manager approve.
   - Publish.
   - Guest search.
   - Customer favorite.
   - Lead, appointment, contract, transaction.

## 15. Thu tu MVP nen lam

Neu can ra ban demo chuyen nghiep nhanh, nen lam theo thu tu:

1. Foundation + Auth + App Shell.
2. Public listing search/detail.
3. Property CRUD + image upload.
4. Listing create/approve/publish.
5. Customer + Lead CRM.
6. Appointment calendar.
7. Contract + Transaction co ban.
8. Dashboard + Reports.
9. AI listing description + recommendation + lead scoring.
10. Admin users + audit logs.

## 16. Cac diem can luu y voi backend hien tai

- Chua co master-data API cho province/district/ward/property type/amenity/
  listing package/lead source. Frontend nen tam dung config seed/static hoac
  de xuat bo sung endpoint.
- Chua co listing list/detail noi bo cho draft/pending. Neu muon man hinh
  moderation day du, backend can them API.
- Chua co profile update/change password/forgot password/email verification
  rieng, nen UI chua nen lam sau phan nay.
- Notification chua co WebSocket, dung polling.
- AI co fallback/noop, UI can hien thi ket qua nhu goi y co the chinh sua,
  khong coi la du lieu tuyet doi.

## 17. Definition of Done cho moi module frontend

Moi module chi xem la xong khi:

- Co route va role guard dung.
- Co list/detail/form/action workflow can thiet.
- Co loading, empty, error va success state.
- Co validation form.
- Co API hooks rieng va invalidation cache dung.
- Co status badge va label tieng Viet.
- Co responsive layout.
- Co xu ly loi `400`, `401`, `403`, `404`, `409`, `429`, `5xx`.
- Co test phu hop voi muc do rui ro cua module.

