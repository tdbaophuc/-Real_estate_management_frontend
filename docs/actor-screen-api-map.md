# Actor, Screen, Sidebar, and API Map

Ngay lap tai lieu: 2026-07-22.

Tai lieu nay doi chieu 3 nguon:

- `docs/API_REFERENCE.md`: danh sach endpoint backend dang cong bo.
- `src/app/router/routes.tsx`: route va role guard frontend hien tai.
- `src/shared/constants/navigation.ts` va `src/app/layouts/AuthenticatedLayout.tsx`: sidebar hien tai.

## 1. Actor trong nghiep vu

### Public Visitor

Nguoi dung chua dang nhap, vao website de tim bat dong san, xem chi tiet listing, gui inquiry hoac yeu cau lich hen.

Trang hien co:

| Sidebar / entry | Route | Man hinh | Trang thai |
| --- | --- | --- | --- |
| Public home | `/` | `LandingPage` | Da tach thanh landing page dung nghia, lay featured listings tu `GET /api/v1/search/listings`. |
| Public search | `/search` | `PublicListingSearchPage` | Co |
| Listing detail | `/listing/:slug` | `PublicListingDetailPage` | Co |
| Login | `/login` | `LoginPage` | Co |
| Register | `/register` | `RegisterPage` | Co |

Endpoint dang dung / can dung:

| Man hinh | Endpoint |
| --- | --- |
| Public search | `GET /api/v1/search/listings` |
| Public listing detail | `GET /api/v1/search/listings/{slug}` |
| Inquiry form | `POST /api/v1/search/listings/{listingId}/inquiries` |
| Appointment request form | `POST /api/v1/search/listings/{listingId}/appointment-requests` |
| Login | `POST /api/v1/auth/login` |
| Register | `POST /api/v1/auth/register` |

Nhan xet:

- Landing page da duoc gan route `/`; search listing da chuyen sang `/search`.
- Landing page can tiep tuc polish bang du lieu listing that tu API, khong dung stat/card gia.
- Public detail can giu viec hien thi anh, gia, thong tin agent, amenities, form inquiry/appointment tu API. Khong nen dung du lieu mau tu dat.

## 2. Customer

Khach hang da dang nhap, tim listing, luu yeu thich, gui yeu cau lich hen/inquiry, theo doi dashboard ca nhan.

Sidebar hien tai:

| Sidebar item | Route | Man hinh | Trang thai |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | `DashboardPage` | Co fallback Customer dashboard rieng, dung favorites/search/notifications API that; khong goi endpoint dashboard noi bo vi API reference chua co dashboard customer. |
| Browse Listings | `/search` | `PublicListingSearchPage` | Co |
| Favorites | `/favorites` | `FavoriteListingsPage` | Co |
| AI Assistant popup | topbar | `AiAssistantPanel` | Da bo khoi sidebar; topbar la diem mo chinh. Route `/ai` van ton tai de tranh gay dut link truc tiep. |
| Account | `/account` | `AccountPage` | Co |
| Notification popup | topbar popover | `NotificationPopover` | Co |

Endpoint dang dung / can dung:

| Man hinh | Endpoint |
| --- | --- |
| Browse listing | `GET /api/v1/search/listings` |
| Listing detail | `GET /api/v1/search/listings/{slug}` |
| Favorites list | `GET /api/v1/listings/favorites` |
| Add favorite | `POST /api/v1/listings/{listingId}/favorite` |
| Remove favorite | `DELETE /api/v1/listings/{listingId}/favorite` |
| Inquiry | `POST /api/v1/search/listings/{listingId}/inquiries` |
| Appointment request | `POST /api/v1/search/listings/{listingId}/appointment-requests` |
| AI chat | `POST /api/v1/ai/chat/sessions`, `GET /api/v1/ai/chat/sessions/{sessionId}`, `POST /api/v1/ai/chat/sessions/{sessionId}/messages` |
| Notifications | `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, `PATCH /api/v1/notifications/{notificationId}/read`, `PATCH /api/v1/notifications/read-all` |
| Account | `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me/profile`, `POST /api/v1/auth/me/change-password`, `POST /api/v1/auth/me/avatar`, `DELETE /api/v1/auth/me/avatar`, `GET /api/v1/auth/me/sessions`, `DELETE /api/v1/auth/me/sessions`, `DELETE /api/v1/auth/me/sessions/{sessionId}` |

Thieu / chua on:

- Customer dashboard da co frontend fallback dua tren du lieu API that: favorites, listing search moi nhat va unread notifications. Neu can metric chuyen sau thi backend nen bo sung endpoint dashboard customer rieng.
- Nen co man hinh "My inquiries / My appointment requests" neu backend co API tuong ung. API reference hien chi co create request public, chua thay endpoint list request cua customer.

## 3. Agent

Nhan vien sale/agent quan ly property duoc gan, tao listing draft, lam lead, follow-up, appointment, contract, transaction, commission cua minh.

Sidebar hien tai:

| Sidebar item | Route chinh | Man hinh phu | Trang thai |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | Agent dashboard | Co, dung `GET /dashboard/agent` |
| Properties | `/properties` | list, create, edit, detail, image/legal documents/status | Co |
| Listings | `/listings` | list, create/edit, detail, review queue link chi Manager/Admin | Co |
| Customers | `/customers` | list, create, detail, notes, requirements, tags, timeline | Co |
| Leads | `/leads` | list, detail, assign/status/activity/note/task | Co |
| Follow-up Tasks | `/follow-up-tasks` | list/my task, edit status | Co |
| Appointments | `/appointments/my`, `/appointments/:id` | my, detail, confirm/cancel/complete/reschedule/feedback | Agent sidebar tro truc tiep den `/appointments/my`; full list `/appointments` chi Admin/Manager. |
| Contracts | `/contracts`, `/contracts/new`, `/contracts/:id`, `/contracts/:id/edit` | list, create, detail, edit, submit review, documents, mark signed | Co |
| Transactions | `/transactions`, `/transactions/create`, `/transactions/:id`, `/transactions/:id/edit` | list, create, detail, status, deposits/invoices/payment schedules/payments/receipts | Co |
| Commissions | `/commissions/my` | my commissions | Co |
| AI Assistant popup | topbar | chat/assistant | Da bo khoi sidebar; topbar la diem mo chinh. |
| Account, Notification popup | topbar | account/notifications | Co |

Endpoint theo man hinh:

| Man hinh | Endpoint |
| --- | --- |
| Agent dashboard | `GET /api/v1/dashboard/agent` |
| Properties list | `GET /api/v1/properties` |
| Property create | `POST /api/v1/properties` |
| Property detail | `GET /api/v1/properties/{propertyId}` |
| Property update/delete/status | `PUT /api/v1/properties/{propertyId}`, `DELETE /api/v1/properties/{propertyId}`, `PATCH /api/v1/properties/{propertyId}/status` |
| Property images | `GET /api/v1/properties/{propertyId}/images`, `POST /api/v1/properties/{propertyId}/images`, `PUT /api/v1/properties/{propertyId}/images/reorder`, `PATCH /api/v1/properties/{propertyId}/images/{imageId}`, `DELETE /api/v1/properties/{propertyId}/images/{imageId}`, `PATCH /api/v1/properties/{propertyId}/cover-image/{imageId}` |
| Property legal documents | `GET /api/v1/properties/{propertyId}/legal-documents`, `POST /api/v1/properties/{propertyId}/legal-documents`, `GET /api/v1/properties/{propertyId}/legal-documents/{documentId}`, `PATCH /api/v1/properties/{propertyId}/legal-documents/{documentId}`, `DELETE /api/v1/properties/{propertyId}/legal-documents/{documentId}` |
| Listings internal | `GET /api/v1/listings`, `POST /api/v1/listings`, `GET /api/v1/listings/{listingId}`, `PUT /api/v1/listings/{listingId}` |
| Listing workflow Agent | `PATCH /api/v1/listings/{listingId}/submit`, `PATCH /api/v1/listings/{listingId}/publish`, `PATCH /api/v1/listings/{listingId}/unpublish` |
| Listing AI content | `POST /api/v1/ai/listing-description` |
| Customers | `GET /api/v1/customers`, `POST /api/v1/customers`, `GET /api/v1/customers/{customerId}`, `PUT /api/v1/customers/{customerId}`, `DELETE /api/v1/customers/{customerId}` |
| Customer CRM subresources | `POST /api/v1/customers/{customerId}/notes`, `PUT /api/v1/customers/{customerId}/notes/{noteId}`, `DELETE /api/v1/customers/{customerId}/notes/{noteId}`, `PATCH /api/v1/customers/{customerId}/notes/{noteId}/pin`, `POST /api/v1/customers/{customerId}/requirements`, `PUT /api/v1/customers/{customerId}/requirements/{requirementId}`, `DELETE /api/v1/customers/{customerId}/requirements/{requirementId}`, `GET /api/v1/customers/{customerId}/tags`, `POST /api/v1/customers/{customerId}/tags`, `DELETE /api/v1/customers/{customerId}/tags/{tagId}`, `GET /api/v1/customers/{customerId}/timeline` |
| Leads | `GET /api/v1/leads`, `POST /api/v1/leads`, `GET /api/v1/leads/{leadId}`, `POST /api/v1/leads/{leadId}/activities`, `PATCH /api/v1/leads/{leadId}/assign`, `POST /api/v1/leads/{leadId}/follow-up-tasks`, `POST /api/v1/leads/{leadId}/notes`, `PATCH /api/v1/leads/{leadId}/status` |
| Follow-up tasks | `GET /api/v1/follow-up-tasks`, `GET /api/v1/follow-up-tasks/my`, `GET /api/v1/follow-up-tasks/{taskId}`, `PUT /api/v1/follow-up-tasks/{taskId}`, `DELETE /api/v1/follow-up-tasks/{taskId}`, `PATCH /api/v1/follow-up-tasks/{taskId}/status` |
| Appointments | `GET /api/v1/appointments`, `POST /api/v1/appointments`, `GET /api/v1/appointments/my`, `GET /api/v1/appointments/{appointmentId}`, `PATCH /api/v1/appointments/{appointmentId}/confirm`, `PATCH /api/v1/appointments/{appointmentId}/cancel`, `PATCH /api/v1/appointments/{appointmentId}/complete`, `PATCH /api/v1/appointments/{appointmentId}/reschedule`, `POST /api/v1/appointments/{appointmentId}/feedback` |
| Contracts | `GET /api/v1/contracts`, `POST /api/v1/contracts`, `GET /api/v1/contracts/{contractId}`, `PUT /api/v1/contracts/{contractId}`, `PATCH /api/v1/contracts/{contractId}/submit-review`, `POST /api/v1/contracts/{contractId}/documents`, `PATCH /api/v1/contracts/{contractId}/mark-signed` |
| Transactions | `GET /api/v1/transactions`, `POST /api/v1/transactions`, `GET /api/v1/transactions/{transactionId}`, `PATCH /api/v1/transactions/{transactionId}/status`, `POST /api/v1/transactions/{transactionId}/deposits`, `POST /api/v1/transactions/{transactionId}/invoices`, `POST /api/v1/transactions/{transactionId}/payment-schedules`, `POST /api/v1/transactions/{transactionId}/payments`, `POST /api/v1/transactions/{transactionId}/payments/{paymentId}/receipt` |
| Commissions | `GET /api/v1/commissions/my` |

Thieu / chua on:

- Agent sidebar da tro Appointments ve `/appointments/my`; route `/appointments` chi con Admin/Manager.
- UI da an nut delete property/customer cho Agent. Backend van can enforce policy tuong ung.
- Favorites khong dung cho Agent dashboard/sidebar; favorites chi de cho Customer flow.
- AI Assistant khong con la sidebar item; chi giu popup topbar.

## 4. Manager

Quan ly team, duyet listing/contract, xem bao cao, quan ly commission cua team, theo doi lead/appointment/transaction.

Sidebar hien tai:

| Sidebar item | Route chinh | Man hinh phu | Trang thai |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | Manager dashboard | Co |
| Properties | `/properties` | list/create/edit/detail/images/legal/status | Co |
| Listings | `/listings` | list, create/edit, detail, review queue | Co, review queue la sub item cho Manager/Admin |
| Customers | `/customers` | CRM | Co |
| Leads | `/leads` | Pipeline/detail | Co |
| Follow-up Tasks | `/follow-up-tasks` | team task/my task | Co |
| Appointments | `/appointments` | list/my/detail/actions | Co |
| Contracts | `/contracts` | list/create/detail/edit/approve/cancel/documents/sign | Co |
| Transactions | `/transactions` | list/create/detail/edit/payments | Co |
| Commissions | `/commissions/my`, `/commissions/manage`, `/commissions/rules`, `/commissions/rules/new`, `/commissions/rules/:ruleId/edit` | Co |
| Reports | `/reports` | revenue/leads/transactions/commissions | Co |
| AI Assistant popup | topbar | Da bo khoi sidebar; topbar la diem mo chinh. |
| Notifications, Account | topbar | Co |

Endpoint bo sung cho Manager:

| Man hinh | Endpoint |
| --- | --- |
| Manager dashboard | `GET /api/v1/dashboard/manager` |
| Manager dashboard watchlist | `GET /api/v1/listings?status=PENDING_REVIEW`, `GET /api/v1/contracts?status=PENDING_REVIEW`, `GET /api/v1/follow-up-tasks?status=PENDING&dueTo=<now>` |
| Listing approval | `PATCH /api/v1/listings/{listingId}/approve`, `PATCH /api/v1/listings/{listingId}/reject` |
| Listing review queue | `GET /api/v1/listings?status=PENDING_REVIEW`, `PATCH /api/v1/listings/{listingId}/approve`, `PATCH /api/v1/listings/{listingId}/reject` |
| Contract approval/cancel | `PATCH /api/v1/contracts/{contractId}/approve`, `PATCH /api/v1/contracts/{contractId}/cancel` |
| Legal document verify | `PATCH /api/v1/properties/{propertyId}/legal-documents/{documentId}/verify` |
| Commission management | `GET /api/v1/commissions`, `PATCH /api/v1/commissions/{commissionId}/mark-paid` |
| Commission rules | `GET /api/v1/commission-rules`, `POST /api/v1/commission-rules`, `PUT /api/v1/commission-rules/{ruleId}` |
| Reports | `GET /api/v1/reports/revenue`, `GET /api/v1/reports/leads`, `GET /api/v1/reports/transactions`, `GET /api/v1/reports/commissions` |

Thieu / chua on:

- Listing Review Queue da la sub item trong group Listings cho Manager/Admin.
- Manager dashboard da co watchlist rieng cho pending listings, pending contracts va overdue follow-up tasks bang API list/filter hien co. Team conversion can endpoint analytics rieng neu muon tinh chinh xac.
- Commission mark-paid da co icon tick, mau xanh la nhat, va form giai thich ro `paymentReference` la ma/tai lieu/bien lai tham chieu thanh toan.
- Favorites khong dung cho Manager dashboard/sidebar va da go khoi navigation.
- AI Assistant khong con la sidebar item; chi giu popup topbar.

## 5. Admin

Quan tri he thong, users, audit, reports, master operations. Admin co the truy cap hau het man hinh noi bo.

Sidebar hien tai:

| Sidebar item | Route chinh | Man hinh phu | Trang thai |
| --- | --- | --- | --- |
| Dashboard | `/dashboard` | Admin dashboard | Co |
| Properties | `/properties` | all property screens | Co |
| Listings | `/listings` | all listing screens incl. review queue | Co |
| Customers | `/customers` | CRM | Co |
| Leads | `/leads` | pipeline/detail | Co |
| Follow-up Tasks | `/follow-up-tasks` | task ops | Co |
| Appointments | `/appointments` | appointments ops | Co |
| Contracts | `/contracts` | contract ops | Co |
| Transactions | `/transactions` | transaction ops | Co |
| Commissions | `/commissions/my`, `/commissions/manage`, `/commissions/rules` | Co |
| Reports | `/reports` | Co |
| AI Assistant popup | topbar | Da bo khoi sidebar; topbar la diem mo chinh. |
| Admin group | `/admin/users`, `/admin/audit-logs`, `/admin/audit-logs/:auditLogId` | Users va Audit Logs | Co, da gom thanh sub navigation Admin. |
| Notifications, Account | topbar | Co |

Endpoint bo sung cho Admin:

| Man hinh | Endpoint |
| --- | --- |
| Admin dashboard | `GET /api/v1/dashboard/admin` |
| User management | `GET /api/v1/admin/users`, `GET /api/v1/admin/users/{userId}`, `PUT /api/v1/admin/users/{userId}/roles`, `PATCH /api/v1/admin/users/{userId}/status` |
| Audit logs | `GET /api/v1/audit-logs`, `GET /api/v1/audit-logs/{auditLogId}` |
| Auth/account/session | `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me/profile`, `POST /api/v1/auth/me/change-password`, `POST /api/v1/auth/me/avatar`, `DELETE /api/v1/auth/me/avatar`, `GET /api/v1/auth/me/sessions`, `DELETE /api/v1/auth/me/sessions`, `DELETE /api/v1/auth/me/sessions/{sessionId}`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh-token` |
| Master data used by forms | `GET /api/v1/master-data/amenities`, `GET /api/v1/master-data/property-types`, `GET /api/v1/master-data/listing-packages`, `GET /api/v1/master-data/provinces`, `GET /api/v1/master-data/provinces/{provinceId}/districts`, `GET /api/v1/master-data/districts/{districtId}/wards`, `GET /api/v1/master-data/lead-sources` |

Thieu / chua on:

- Admin Users va Audit Logs da duoc gom thanh group "Admin" trong sidebar. Master Data chua dua vao group vi API reference hien chi co read-only endpoints va chua co UI CRUD.
- Chua co UI quan ly master data; API reference moi co read-only master-data endpoints, nen hien tai form chi consume du lieu.
- Favorites khong dung cho Admin dashboard/sidebar va da go khoi navigation.
- AI Assistant khong con la sidebar item; chi giu popup topbar.

## 6. Owner

Chu so huu tai san. Thuc te owner can xem tai san cua minh, tinh trang listing/contract/transaction/commission lien quan den tai san, documents va notifications.

Trang hien tai:

| Route/layout | Trang thai |
| --- | --- |
| Protected layout cho phep role `OWNER` | Co |
| Sidebar item cho OWNER | Da co: dashboard, my properties, my listings, documents, contracts, transactions |
| Dashboard owner | Da co route `/owner/dashboard`, dung cac list endpoint hien co va backend scope theo token |
| Property owner portal | Da co route `/owner/properties` |
| Contract/transaction owner portal | Da co route `/owner/contracts`, `/owner/transactions` |

Endpoint lien quan trong API reference:

| Nhu cau Owner | Endpoint co the dung |
| --- | --- |
| Xem tai san lien quan | Can backend filter owner hoac `GET /api/v1/properties` voi owner scope theo token. API reference co `GET /api/v1/properties` nhung chua thay query `ownerId` public trong docs. |
| Xem chi tiet property | `GET /api/v1/properties/{propertyId}` |
| Xem legal docs | `GET /api/v1/properties/{propertyId}/legal-documents`, `GET /api/v1/properties/{propertyId}/legal-documents/{documentId}` |
| Xem contract lien quan | `GET /api/v1/contracts`, `GET /api/v1/contracts/{contractId}` neu backend scope theo owner |
| Xem transaction lien quan | `GET /api/v1/transactions`, `GET /api/v1/transactions/{transactionId}` neu backend scope theo owner |
| Notifications/account | notification va auth endpoints nhu cac actor khac |

Gap lon:

- OWNER da co navigation/dashboard co ban. Gap con lai la backend phai dam bao scope du lieu theo owner.
- Can bo sung backend/frontend policy ro: owner duoc xem gi, co duoc upload/chinh document khong, co duoc approve listing/contract khong. Thuc te thuong owner chi xem va upload/ky document, khong quan tri CRM.

De xuat sidebar Owner:

| Sidebar item | Route de xuat | Man hinh |
| --- | --- | --- |
| Dashboard | `/owner/dashboard` | Tong quan tai san, listing dang publish, contract/transaction gan voi owner |
| My Properties | `/owner/properties` | Danh sach property owner so huu |
| Documents | `/owner/documents` | Legal/contract documents can xem/bo sung |
| Contracts | `/owner/contracts` | Hop dong lien quan tai san |
| Transactions | `/owner/transactions` | Thanh toan/giao dich lien quan |
| Notifications | popup topbar | Thong bao |
| Account | `/account` | Ho so ca nhan |

## 7. Cross-cutting screens

| Screen | Actor | Route/UI | Endpoint |
| --- | --- | --- | --- |
| Account | Authenticated all roles | `/account` | `GET /api/v1/auth/me`, `PATCH /api/v1/auth/me/profile`, avatar/session/password endpoints |
| Notification popup | Authenticated all roles | topbar popover; `/notifications` redirect ve dashboard dung theo role | `GET /api/v1/notifications`, `GET /api/v1/notifications/unread-count`, read endpoints |
| AI Assistant popup | ADMIN/MANAGER/AGENT/CUSTOMER | topbar panel | AI chat/session endpoints; customer recommendations/summary, lead scoring, listing description, property image analyze when called from related screens. Khong de trong sidebar. |
| Files | Internal workflows | Upload/download/delete/access | `POST /api/v1/files/upload`, `GET /api/v1/files/{fileId}`, `DELETE /api/v1/files/{fileId}`, `PATCH /api/v1/files/{fileId}/access-level`, `GET /api/v1/files/{fileId}/download` |

## 8. Current implementation coverage

Danh gia theo muc do UI da co so voi API va nghiep vu thuc te:

| Module | Muc do | Nhan xet |
| --- | --- | --- |
| Auth/account/session | Kha day du | Login/register/account co. Can audit UI session/avatar neu chua polish. |
| Public listings | Kha | Landing/search/detail/inquiry/appointment co. Favorite chi thuoc Customer flow. |
| Customer portal | Trung binh-kha | Favorites/search/dashboard fallback co, dung API that; history inquiry/appointment chua ro do thieu API list. |
| Properties | Kha day du | List/create/edit/detail/images/legal/status co. Gan day da polish nhieu. |
| Listings internal | Kha day du | List table, form 70/30, detail workflow, review queue co. Vua bo sung search property trong create. Can test UI thuc te. |
| Customers CRM | Kha day du | List/create/detail/notes/requirements/tags/timeline co. |
| Leads/tasks | Kha day du | Lead pipeline/detail/actions/task co. |
| Appointments | Kha day du | List/my/detail/actions/feedback co. Agent sidebar vao `/appointments/my`; route full list `/appointments` chi Admin/Manager. |
| Contracts | Kha day du | List/form/detail/workflow/doc upload co. Gan day da sua upload document/payment/reference. |
| Transactions | Trung binh-kha | List/create/detail/payments/deposits/invoices/schedules/status co. Can test workflow lien ket payment/receipt. |
| Commissions | Kha day du | My/manage/rules co. Mark-paid UX da co icon xanh va label payment reference ro hon. |
| Reports | Kha | 4 report endpoints co UI. |
| Admin users/audit logs | Kha | Users/roles/status va audit logs co. |
| Owner | Trung binh | Da co sidebar va owner portal co ban. Con phu thuoc backend owner-scope endpoints. |
| Master data management | Chua co | API reference chi co read endpoints; UI dang consume trong form, chua co admin CRUD. |

## 9. Sidebar hien tai theo actor

### Admin sidebar hien tai

1. Dashboard -> `/dashboard`
2. Properties -> `/properties`
3. Listings group
   - All Listings -> `/listings`
   - Listing Review Queue -> `/listings/review-queue`
4. Customers -> `/customers`
5. Leads -> `/leads`
6. Follow-up Tasks -> `/follow-up-tasks`
7. Appointments -> `/appointments`
8. Contracts -> `/contracts`
9. Transactions -> `/transactions`
10. Commissions group
   - My Commissions -> `/commissions/my`
   - Commission Management -> `/commissions/manage`
   - Commission Rules -> `/commissions/rules`
11. Reports -> `/reports`
12. Admin group
   - Users -> `/admin/users`
   - Audit Logs -> `/admin/audit-logs`
13. Account/Notifications in topbar

AI Assistant chi nam o topbar popup, khong la sidebar item.

### Manager sidebar hien tai

1. Dashboard -> `/dashboard`
2. Properties -> `/properties`
3. Listings group
   - All Listings -> `/listings`
   - Listing Review Queue -> `/listings/review-queue`
5. Customers -> `/customers`
6. Leads -> `/leads`
7. Follow-up Tasks -> `/follow-up-tasks`
8. Appointments -> `/appointments`
9. Contracts -> `/contracts`
10. Transactions -> `/transactions`
11. Commissions
    - My Commissions -> `/commissions/my`
    - Team Commissions -> `/commissions/manage`
    - Rules -> `/commissions/rules`
12. Reports -> `/reports`
AI Assistant chi nam o topbar popup, khong la sidebar item.

### Agent sidebar hien tai

1. Dashboard -> `/dashboard`
2. My Properties / Assigned Properties -> `/properties`
3. Listings -> `/listings`
4. Customers -> `/customers`
5. Leads -> `/leads`
6. My Follow-up Tasks -> `/follow-up-tasks`
7. My Appointments -> `/appointments/my`
8. Contracts -> `/contracts`
9. Transactions -> `/transactions`
10. My Commissions -> `/commissions/my`
AI Assistant chi nam o topbar popup, khong la sidebar item.

### Customer sidebar hien tai / gap backend

1. Dashboard -> `/dashboard` hoac `/customer/dashboard` neu tach route
2. Browse Listings -> `/search`
3. Favorites -> `/favorites`
4. My Inquiries -> can API list inquiries
5. My Appointments -> can API customer appointment list
6. Account/Notifications topbar

AI Assistant chi nam o topbar popup, khong la sidebar item.

### Owner sidebar hien tai

1. Dashboard -> `/owner/dashboard`
2. My Properties -> `/owner/properties`
3. Listings -> `/owner/listings` hoac filter theo property owner
4. Contracts -> `/owner/contracts`
5. Transactions -> `/owner/transactions`
6. Documents -> `/owner/documents`
7. Account/Notifications topbar

## 10. Viec can lam tiep theo uu tien

1. Sua landing page:
   - Da gan route `/` cho landing page dung nghia.
   - Da chuyen search sang `/search`.
   - Landing da lay listing data tu `GET /api/v1/search/listings`, khong dung stat/card gia. Can ban test UI thuc te trong browser.

2. Lam Owner portal:
   - Da them sidebar role OWNER.
   - Da them owner dashboard va cac screen owner-scope co ban.
   - Con can backend xac nhan filter/scope owner cho properties/contracts/transactions.

3. Sua Customer dashboard:
   - Da co UI rieng dua tren favorites/recommendations/notifications tu API hien co.
   - Con can backend endpoint rieng neu muon hien thi metric chuyen sau nhu inquiry history, appointment request history.

4. Tach sidebar thanh group/sub item:
   - Admin group da gom Users va Audit Logs.
   - Commission group da co My/Manage/Rules theo role.
   - Listing Review Queue da la sub item cua Listings cho Admin/Manager.
   - Sidebar da giu lai dang item truc tiep theo phan hoi UI; khong gom Operations/Finance group.
   - Bo AI Assistant khoi sidebar cho moi actor, vi da co popup topbar.
   - Bo Favorites khoi sidebar Admin/Manager/Agent; giu Favorites cho Customer.

5. Siet role route theo nghiep vu:
   - Agent da mac dinh vao `/appointments/my`; route full `/appointments` chi Admin/Manager.
   - Agent khong thay nut delete property/customer trong UI.
   - Favorites chi hien cho Customer, khong dung cho Admin/Manager/Agent dashboard/sidebar.

6. Master data management:
   - Hien chi co API read-only trong docs. Neu can Admin quan ly master data thi can backend CRUD endpoint truoc.

7. API gap nen lam ro voi backend:
   - Customer inquiry history/list.
   - Customer appointment requests/list.
   - Owner-scoped list endpoints.
   - Dashboard endpoint cho CUSTOMER va OWNER.
