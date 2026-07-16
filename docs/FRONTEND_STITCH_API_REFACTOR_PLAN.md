# Frontend Refactor Plan From Stitch And Backend API

## 1. Nhung gi toi hieu

Muc tieu la refactor frontend hien tai de:

- Ap dung dung va du toan bo API backend dang co trong `docs/API_REFERENCE.md`.
- Giao dien bam sat thiet ke trong Stitch project `6397110572098939351`.
- Khong copy may moc topbar/sidebar tu Stitch, vi cac component nay khong dong bo. Thay vao do, tao layout shell rieng trong code hien tai va chi dung Stitch nhu reference ve visual language, workspace, density, card/table pattern.
- Neu backend co chuc nang nhung Stitch chua co screen, tu tao man hinh/phien ban UI moi theo cung phong cach.
- Neu thiet ke Stitch co loi hoac khong chuan UX/responsive/data-state, duoc phep dieu chinh de frontend thuc dung hon.
- Uu tien khu vuc lam viec cua cac screen trong stitch ban thich(ten phia duoi la ten cua cac screens dang co trong project stitch):
  - `Customer CRM Detail`
  - `Listing Detail & Workflow - AssetManager Pro`
  - `Property Detail - AssetManager Pro`
  - `Manage Property Images - AssetManager Pro`
  - `Lead Pipeline & Tasks (Restored)`
  - `Lead Detail & AI Insights - AssetManager Pro`
  - `Appointment & Viewing Calendar`
  - `Appointment Detail & Feedback - AssetManager Pro`
  - `Contract Management Detail`
  - `Transaction & Payment Detail`

## 2. Nguon da doc

- Stitch project: `6397110572098939351`, title `Real Estate Management System`.
- Design system tu Stitch: `Stellar Institutional Estate`.
- API reference: `docs/API_REFERENCE.md`.
- Frontend hien tai:
  - React 18, Vite, TypeScript.
  - React Router.
  - TanStack React Query.
  - React Hook Form + Zod.
  - Recharts.
  - Lucide icons.
  - Da co feature modules cho gan nhu tat ca domain backend.

## 3. Design direction can giu

Phong cach chung:

- Corporate / Modern cho real estate asset management.
- Nen sang, off-white, tonality layer ro rang.
- Primary dark navy/black, secondary royal blue.
- Border nhe thay vi shadow nang.
- Data-dense UI: bang, tabs, timeline, kanban, calendar, detail panels.
- Typography Inter, nhan manh table-data va label-caps.
- Card/section radius nho, khoang cach chac chan, khong dung visual trang tri qua muc.

Nguyen tac layout:

- Tu xay lai app shell trong frontend:
  - Sidebar co dinh tren desktop, collapse/icon rail tren tablet, drawer tren mobile.
  - Topbar nhe, dong bo voi auth, notification, language, AI assistant.
  - Main workspace la vung quan trong nhat, bam theo cac man hinh Stitch duoc uu tien.
- Khong phu thuoc vao topbar/sidebar generated tu Stitch.
- Moi man hinh phai co loading, empty, error, permission-denied va optimistic/data-refresh state ro rang.

## 4. API coverage phai bao phu

API reference co 146 endpoints, gom cac nhom:

| Nhom API | Chuc nang frontend can co |
|---|---|
| Authentication | Login, register, refresh token, logout, profile, avatar, password, session management |
| Dashboard | Dashboard theo role admin/manager/agent |
| Properties | CRUD property, status, images, cover image, legal documents, verify documents |
| Listings | Internal listing CRUD, submit/approve/reject/publish/unpublish, favorite |
| Public Search | Search listing public, listing detail by slug, inquiry, appointment request |
| Customers | CRM list/detail, notes, requirements, tags, timeline |
| Leads | Lead list/detail, assign, status, activities, notes, follow-up tasks |
| Follow-up Tasks | Task list/my/detail/update/delete/status |
| Appointments | Calendar/list/detail, create, confirm, cancel, reschedule, complete, feedback |
| Contracts | List/detail/create/update, submit review, approve, mark signed, cancel, documents |
| Transactions | List/detail/create, deposits, payment schedules, payments, receipts, status |
| Commissions | Rules CRUD, commissions list/my, mark paid |
| Reports | Revenue, transactions, leads, commissions reports |
| Notifications | List, unread count, mark read, read all |
| Files | Upload, get metadata, delete, access level, download |
| AI | Chat sessions/messages, customer summary/recommendations, lead score, listing description, image analysis |
| Audit Logs | Audit list/detail |
| User Management | Admin users list/detail, roles, status |
| Master Data | Property types, amenities, locations, lead sources, listing packages |

## 5. Stitch screen mapping

| Stitch screen | Frontend route/module |
|---|---|
| Login / Registration | `/login`, `/register` |
| Admin/Agent Dashboard | `/dashboard` |
| Property Management | `/properties` |
| Create New Property Asset | `/properties/new`, `/properties/:id/edit` |
| Property Detail - AssetManager Pro | `/properties/:id` |
| Manage Property Images - AssetManager Pro | Property detail image workspace or dedicated `/properties/:id/images` if needed |
| Internal Listing Management | `/listings` |
| Create New Listing - AssetManager Pro | `/listings/new`, `/listings/:id/edit` |
| Listing Detail & Workflow - AssetManager Pro | New `/listings/:id` detail workflow route should be added |
| Listing Review Queue - Manager View | Listing list/review tab |
| Public Listing Search | `/` |
| Customer CRM Detail | `/customers/:id` |
| Lead Pipeline & Tasks (Restored) | `/leads` with Kanban pipeline mode plus task lane integration |
| Lead Detail & AI Insights - AssetManager Pro | `/leads/:id` |
| Appointment & Viewing Calendar | `/appointments` calendar mode |
| Appointment Detail & Feedback - AssetManager Pro | `/appointments/:id` |
| Contract List / Detail / Create | `/contracts`, `/contracts/:id`, contract create route if missing |
| Transaction List / Detail / Create | `/transactions`, `/transactions/:id`, transaction create route if missing |
| Commission Management / Rules / My Commissions | `/commissions` with tabs/rule management |
| Reports & Revenue Analytics | `/reports` |
| Notification Center | `/notifications` |
| Admin User Management / User Detail | `/admin/users`, add `/admin/users/:id` if useful |
| System Audit Logs / Audit Log Detail | `/admin/audit-logs`, add detail drawer/route |
| Customer AI Chat Assistant | `/ai` and persistent AI panel |

## 6. Kien truc refactor de thanh cong

### 6.1 API layer

- Audit tung file `*Api.ts` voi `docs/API_REFERENCE.md`.
- Moi endpoint trong API reference phai co:
  - TypeScript request/response type.
  - Function API rieng.
  - React Query key convention.
  - Mutation invalidation strategy.
  - Error normalization dung `ApiResponse`/standard error.
- Tach shared API patterns:
  - `ApiResponse<T>`.
  - `PageResponse<T>`.
  - query params builders.
  - upload/download helpers.
  - auth refresh/retry behavior.

### 6.2 Design system trong code

- Dong bo CSS variables voi Stitch design theme:
  - surface/background/container/border.
  - status colors.
  - typography roles.
  - spacing/radius.
- Tao reusable primitives cho data-heavy app:
  - `PageHeader`
  - `MetricCard`
  - `SectionCard`
  - `DataTable`
  - `StatusBadge`
  - `Timeline`
  - `DetailGrid`
  - `ActionBar`
  - `EntitySummaryPanel`
  - `KanbanBoard`
  - `CalendarGrid`
  - `Drawer/FormDialog`
- Giu app shell rieng, khong copy shell tu Stitch.

### 6.3 Route va feature structure

- Bo sung cac route con dang thieu neu API/design can:
  - `/listings/:id` cho listing detail workflow.
  - `/contracts/new` va `/contracts/:id/edit` neu create/edit dang chi nam trong component khong route.
  - `/transactions/new` neu backend co create transaction.
  - `/admin/users/:id` hoac detail drawer.
  - `/admin/audit-logs/:id` hoac detail drawer.
- Neu khong can route moi, dung tabs/drawers de giam dieu huong thua.

## 7. Thu vien co the cai them

Chi cai khi co loi ich ro rang:

- `@dnd-kit/core`, `@dnd-kit/sortable`: cho lead pipeline dang Trello va reorder property images.
- `date-fns`: calendar, date range, appointment positioning.
- `react-day-picker` hoac calendar tu build custom neu can input lich.
- `cmdk`: command palette/search nhanh neu can.
- `sonner`: toast feedback gon, dong bo mutation result.
- `clsx`/`class-variance-authority` neu muon chuan hoa variants UI; hien tai da co `cn`, nen khong bat buoc.

Khong nen them UI kit nang neu no pha design system hoac tang chi phi refactor.

## 8. Plan thuc hien

### Phase 0: Baseline va kiem ke

- Chay `npm run lint` va `npm run build` de lay baseline.
- Tao checklist 146 endpoints tu `docs/API_REFERENCE.md`.
- So sanh tung endpoint voi API modules hien tai.
- Danh dau endpoint:
  - da co va dung.
  - da co nhung sai payload/response.
  - chua co.
  - co API nhung chua co UI.

Ket qua can co: `docs/API_COVERAGE_MATRIX.md`.

### Phase 1: API correctness

- Sua/to chuc lai shared API client.
- Chuan hoa auth token, refresh token, logout, current user, session handling.
- Bo sung endpoint con thieu theo tung domain.
- Chuan hoa query key va invalidation.
- Them Zod schema cho form input quan trong, khong validate response qua muc neu lam cham tien do.

Thu tu domain:

1. Auth + files + master data.
2. Properties + listings + public search.
3. Customers + leads + follow-up tasks.
4. Appointments.
5. Contracts + transactions + commissions.
6. Reports + dashboard + notifications.
7. AI + audit logs + admin users.

### Phase 2: App shell va design tokens

- Refactor `AuthenticatedLayout` de dong bo style voi Stitch nhung van la source of truth cua frontend.
- Chuan hoa sidebar/topbar responsive.
- Tao workspace container max width, dense table surface, card sections.
- Update global CSS variables theo `Stellar Institutional Estate`.
- Dam bao mobile/tablet khong vo layout.

### Phase 3: Man hinh uu tien cap 1

Tap trung vao cac screen ban thich nhat va co gia tri workflow cao:

1. `Lead Pipeline & Tasks (Restored)`
   - Kanban columns theo status.
   - Task cards gan lead/follow-up task.
   - Drag/drop doi status neu API ho tro bang `PATCH /api/v1/leads/{leadId}/status` va `PATCH /api/v1/follow-up-tasks/{taskId}/status`.
   - Detail drawer nhanh cho lead/task.

2. `Appointment & Viewing Calendar`
   - Calendar grid theo tuan/ngay.
   - Appointment block nam dung time slot theo `startAt/endAt`.
   - Filter by status/agent/customer/property.
   - Actions confirm/cancel/reschedule/complete.

3. `Customer CRM Detail`
   - Summary header, profile, requirements, tags.
   - Notes pin/unpin.
   - Timeline.
   - AI customer summary va recommendations.

4. `Property Detail` + `Manage Property Images`
   - Detail workspace gom overview, listing links, images, legal documents.
   - Image upload/reorder/cover/update/delete.
   - AI image analysis.
   - Legal document verify workflow.

5. `Listing Detail & Workflow`
   - Add missing detail route if needed.
   - Workflow submit/approve/reject/publish/unpublish.
   - AI listing description generator.

### Phase 4: Man hinh uu tien cap 2

1. `Lead Detail & AI Insights`
   - Lead score, reason, follow-up suggestion.
   - Activities, notes, task creation.
   - Assign/status actions.

2. `Appointment Detail & Feedback`
   - Participants, feedback, status lifecycle.
   - Complete appointment and collect feedback.

3. `Contract Management Detail`
   - Lifecycle submit review/approve/mark signed/cancel.
   - Documents upload/list.
   - Link transaction creation.

4. `Transaction & Payment Detail`
   - Payment schedules.
   - Deposits.
   - Payments and receipts.
   - Invoice creation.
   - Financial status summary.

### Phase 5: Con lai de du API

- Commissions:
  - commission rules CRUD.
  - commissions/my.
  - mark paid.
- Reports:
  - revenue, transactions, leads, commissions.
  - charts + tables, not chart-only.
- Notifications:
  - unread count, mark read, read all.
- Admin:
  - users detail/roles/status.
  - audit logs list/detail.
- Public/customer:
  - public listing search/detail.
  - inquiry and appointment request.
  - favorites.

### Phase 6: Validation va polish

- `npm run lint`.
- `npm run build`.
- Manual smoke test cac luong chinh:
  - login/register/profile.
  - property -> listing -> lead/customer -> appointment -> contract -> transaction -> payment.
  - notification/read state.
  - reports/dashboard.
  - AI workflows.
- Kiem tra role access theo ADMIN/MANAGER/AGENT/CUSTOMER/OWNER.
- Kiem tra empty/loading/error states.
- Kiem tra responsive desktop/tablet/mobile.

## 9. Tieu chi hoan thanh

- Moi endpoint trong `docs/API_REFERENCE.md` co frontend API function hoac co ly do ro rang vi sao khong goi truc tiep.
- Moi domain API co it nhat mot UI entry point.
- Cac workflow chinh khong con placeholder.
- Cac man hinh uu tien bam sat workspace Stitch, nhung app shell dong bo theo codebase.
- Build va TypeScript pass.
- Khong co mutation quan trong nao ma UI khong invalidate/refetch data lien quan.
- File upload/download va auth refresh khong lam vo UX.

## 10. Rui ro va cach xu ly

- Stitch generated UI co the chi la static mockup, khong map 1-1 voi API. Xu ly bang cach uu tien API truth va giu style/structure tu Stitch.
- 146 endpoints la scope lon, neu lam mot lan de gay regression. Xu ly bang matrix coverage va refactor theo domain.
- Drag/drop va calendar co logic phuc tap. Chi them thu vien nhe khi can; khong tu viet DnD phuc tap neu `@dnd-kit` giai quyet tot hon.
- Mot so endpoint admin trong API reference ghi `Auth: Public`, can xac minh backend security thuc te khi test. Frontend van nen guard bang role `ADMIN`.
- Neu response thuc te khac API reference, API client can normalize o mot cho thay vi sua tung component.

## 11. Buoc tiep theo de bat dau implement

1. Tao `docs/API_COVERAGE_MATRIX.md` tu 146 endpoints.
2. Chay baseline `npm run lint` va `npm run build`.
3. Sua API layer theo matrix.
4. Refactor app shell/design tokens.
5. Lam truoc `Lead Pipeline & Tasks` va `Appointment Calendar`, vi day la hai workspace co yeu cau tuong tac cao nhat va anh huong lon den cach dung component chung.
