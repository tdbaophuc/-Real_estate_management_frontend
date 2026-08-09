# API Frontend Reference

> Cap nhat theo branch `breakthrough` ngay 13/06/2026.
> Pham vi: backend da hoan thien sau Day 50, gom auth, property,
> listing, CRM, lead, appointment, contract, transaction, commission,
> notification, dashboard/report, audit, file upload va AI.

Tai lieu nay la nguon tham chieu chinh de xay frontend. Neu can schema day du
tung field, mo Swagger UI tai `http://localhost:8081/swagger-ui.html`.

## 1. Thong tin chung

- Base URL local: `http://localhost:8081`
- API prefix chinh: `/api/v1`
- Swagger UI: `http://localhost:8081/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8081/v3/api-docs`
- Content type mac dinh: `application/json`
- Multipart upload: `multipart/form-data`
- Date-time: ISO-8601, vi du `2026-06-13T09:30:00Z`
- Date: `yyyy-MM-dd`, vi du `2026-06-13`
- Currency: ma 3 ky tu viet hoa, vi du `VND`, `USD`
- Phan trang: `page` bat dau tu `0`, `size` toi da `100`
- Sap xep: `sortBy`, `sortDirection=ASC|DESC`

### Chay backend local

```powershell
Copy-Item .env.example .env
docker compose up -d
Get-Content .env |
  Where-Object { $_ -match '^[^#][^=]*=' } |
  ForEach-Object {
    $name, $value = $_ -split '=', 2
    Set-Item -Path "Env:$name" -Value $value
  }
mvn spring-boot:run
```

Docker Compose cung cap PostgreSQL, Redis, MinIO va MailHog. Backend hien dang
dung PostgreSQL, upload local, email dev ghi log.

## 2. Auth, response va client rules

### 2.1 Header auth

Moi API bao ve can gui:

```http
Authorization: Bearer <accessToken>
```

Luu `accessToken`, `refreshToken`, `expiresInSeconds` sau login. Khi gap `401`,
frontend nen goi `POST /api/v1/auth/refresh-token`; neu refresh that bai thi
xoa session va ve login.

### 2.2 Response thanh cong

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {},
  "timestamp": "2026-06-13T09:30:00Z"
}
```

Frontend luon doc du lieu nghiep vu tu `response.data`.

### 2.3 Response phan trang

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0,
  "first": true,
  "last": true
}
```

### 2.4 Response loi

```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "email must be valid"
    }
  ],
  "timestamp": "2026-06-13T09:30:00Z"
}
```

Mapping UI de nghi:

- `400`: hien validation/form error.
- `401`: refresh token hoac logout.
- `403`: hien trang khong co quyen.
- `404`: hien empty/not found state.
- `409`: hien conflict toast, refresh data.
- `429`: throttle UI, hien retry message.
- `5xx`: hien error boundary/toast va nut retry.

### 2.5 Role

- `ADMIN`: toan quyen, user management, audit, reports, dashboards.
- `MANAGER`: duyet listing/contract, quan ly team, reports, commission.
- `AGENT`: property, listing, CRM, lead, appointment, contract, transaction.
- `CUSTOMER`: public search, favorite, AI chat.
- `OWNER`: hien co role trong auth/AI chat, chua co owner portal rieng.

## 3. Frontend modules nen xay

### Public

- `/`: trang search listing public.
- `/listing/:slug`: listing detail, record view bang `X-Session-Id`.
- `/login`, `/register`.

### Authenticated shell

- `/dashboard`: dieu huong theo role.
- `/properties`: list/detail/create/edit/images/legal-documents/status.
- `/listings`: create/edit/workflow. Luu y backend chua co API list/detail
  noi bo cho listing; can dung response sau create/update hoac public search
  cho listing da publish.
- `/customers`: CRM list/detail/notes/requirements/timeline.
- `/leads`: pipeline list/detail/assign/status/notes/activities/follow-up.
- `/appointments`: calendar/list/my/detail/confirm/cancel/reschedule/feedback.
- `/contracts`: list/detail/create/update/upload/submit/approve/sign/cancel.
- `/transactions`: list/detail/create/status/deposits/schedules/payments/invoices/receipts.
- `/commissions`: my commissions, manager/admin list, rules.
- `/notifications`: notification center va unread badge.
- `/reports`: revenue, leads, transactions, commissions.
- `/admin/users`: user management.
- `/admin/audit-logs`: audit search/detail.
- `/ai`: description assistant, recommendations, lead scoring, chat, image analysis.

## 4. Auth API

Base: `/api/v1/auth`

| Method | Path | Auth | Ghi chu |
| --- | --- | --- | --- |
| POST | `/register` | Public | Tao user moi |
| POST | `/login` | Public | Dang nhap |
| POST | `/refresh-token` | Public | Lay access token moi |
| POST | `/logout` | Public | Thu hoi refresh token |
| GET | `/me` | Bearer | Lay user hien tai |
| PATCH | `/me/profile` | Bearer | Cap nhat `fullName`, `phone` |
| POST | `/me/change-password` | Bearer | Doi mat khau va revoke refresh tokens |
| POST | `/me/avatar` | Bearer | Upload avatar multipart qua FileResource/local/R2 |
| DELETE | `/me/avatar` | Bearer | Xoa avatar hien tai |
| GET | `/me/sessions` | Bearer | List active refresh-token sessions |
| DELETE | `/me/sessions/{sessionId}` | Bearer | Revoke mot session cua user hien tai |
| DELETE | `/me/sessions` | Bearer | Revoke tat ca session cua user hien tai |

Request chinh:

```json
{
  "email": "agent@example.com",
  "password": "Strong@123"
}
```

Register can `email`, `password`, `fullName`, tuy vao schema Swagger co them
phone/role neu backend cho phep. Password can co chu hoa, chu thuong, so va ky
tu dac biet.

Profile update chi cho sua:

```json
{
  "fullName": "Tran Ngoc Lan",
  "phone": "+84901234567"
}
```

Backend bo qua/khong cho self-update `email`, `roles`, `status`. `phone` phai
unique neu khac gia tri hien tai.

Change password:

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

Sau khi doi mat khau, backend revoke active refresh tokens cua user. Frontend
nen dua user ve login hoac thuc hien login lai.

Avatar upload:

```http
POST /api/v1/auth/me/avatar
Content-Type: multipart/form-data

file=<binary image>
```

Avatar dung chung validation upload anh va luu qua provider hien tai
(`LOCAL` hoac `R2`). Response `/me` va cac self-service response co `avatarUrl`
khi avatar public URL ton tai.

Session item:

```json
{
  "id": 123,
  "createdAt": "2026-06-27T10:00:00Z",
  "expiresAt": "2026-07-27T10:00:00Z"
}
```

Session API chi tac dong session cua chinh user hien tai. Revoke session lam
refresh token tuong ung khong con dung duoc; access token hien tai van het han
theo TTL JWT.

## 5. Admin user management

Base: `/api/v1/admin/users`, role `ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | Danh sach user, co filter va phan trang |
| GET | `/{userId}` | Chi tiet user |
| PATCH | `/{userId}/status` | Doi `UserStatus` |
| PUT | `/{userId}/roles` | Gan danh sach `RoleCode` |

Dung cho man hinh quan ly tai khoan, khoa/mo user, promote agent/manager.

## 6. Property API

Base: `/api/v1/properties`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | Search property |
| GET | `/{propertyId}` | Chi tiet property |
| POST | `` | Tao property |
| PUT | `/{propertyId}` | Cap nhat property |
| DELETE | `/{propertyId}` | Soft delete |
| PATCH | `/{propertyId}/status` | Doi trang thai |
| GET | `/{propertyId}/images` | Danh sach anh |
| POST | `/{propertyId}/images` | Upload anh property |
| DELETE | `/{propertyId}/images/{imageId}` | Xoa anh |
| PATCH | `/{propertyId}/cover-image/{imageId}` | Dat cover |
| PATCH | `/{propertyId}/images/{imageId}` | Sua metadata anh |
| PUT | `/{propertyId}/images/reorder` | Sap xep nhieu anh |
| GET | `/{propertyId}/legal-documents` | Danh sach tai lieu phap ly |
| POST | `/{propertyId}/legal-documents` | Upload tai lieu phap ly |
| GET | `/{propertyId}/legal-documents/{documentId}` | Chi tiet tai lieu |
| PATCH | `/{propertyId}/legal-documents/{documentId}` | Sua metadata tai lieu |
| PATCH | `/{propertyId}/legal-documents/{documentId}/verify` | Verify/reject tai lieu |
| DELETE | `/{propertyId}/legal-documents/{documentId}` | Xoa tai lieu |

`PropertyUpsertRequest` can toi thieu:

```json
{
  "code": "PROP-001",
  "name": "Can ho 2PN Quan 1",
  "description": "Mo ta bat dong san",
  "propertyTypeId": 1,
  "purpose": "SALE",
  "price": 3500000000,
  "currency": "VND",
  "landArea": 72.5,
  "floorArea": 68.2,
  "bedrooms": 2,
  "bathrooms": 2,
  "floors": 1,
  "direction": "EAST",
  "legalStatus": "PINK_BOOK",
  "furnitureStatus": "FULLY_FURNISHED",
  "availableFrom": "2026-06-13",
  "ownerId": 5,
  "assignedAgentId": 7,
  "address": {
    "provinceId": 1,
    "districtId": 1,
    "wardId": 1,
    "street": "Nguyen Hue",
    "addressLine": "12 Nguyen Hue",
    "latitude": 10.7769,
    "longitude": 106.7009
  },
  "amenities": [
    {
      "amenityId": 1,
      "note": "Ho boi"
    }
  ]
}
```

Upload image:

```http
POST /api/v1/properties/{propertyId}/images
Content-Type: multipart/form-data

file=<binary>
altText=Mat tien
displayOrder=0
```

Update image metadata:

```json
{
  "altText": "Mat tien",
  "displayOrder": 1
}
```

Reorder images:

```json
{
  "items": [
    { "imageId": 10, "displayOrder": 0 },
    { "imageId": 11, "displayOrder": 1 }
  ]
}
```

Upload legal document:

```http
POST /api/v1/properties/{propertyId}/legal-documents
Content-Type: multipart/form-data

file=<binary>
documentType=PINK_BOOK
documentNumber=CS123456
issuedBy=Department of Natural Resources
issuedDate=2024-01-15
expiryDate=
notes=Original owner copy scanned
```

Update legal document metadata:

```json
{
  "documentType": "LAND_USE_CERTIFICATE",
  "documentNumber": "CS123456-UPDATED",
  "issuedBy": "Department of Land",
  "issuedDate": "2024-02-01",
  "expiryDate": "2034-02-01",
  "notes": "Updated notes"
}
```

Verify legal document:

```json
{
  "verificationStatus": "VERIFIED",
  "notes": "Matched owner and address"
}
```

## 7. Master Data API

Base: `/api/v1/master-data`, public or bearer. Cac endpoint nay read-only va
chi tra item `active=true`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `/provinces` | Tinh/thanh |
| GET | `/provinces/{provinceId}/districts` | Quan/huyen theo province |
| GET | `/districts/{districtId}/wards` | Phuong/xa theo district |
| GET | `/property-types` | Loai bat dong san |
| GET | `/amenities` | Tien ich, co filter `category` |
| GET | `/listing-packages` | Goi tin dang active |
| GET | `/lead-sources` | Nguon lead active |

Location response item:

```json
{
  "id": 1,
  "code": "HCM",
  "name": "Ho Chi Minh City",
  "administrativeType": "Municipality",
  "active": true
}
```

Amenity filter:

```http
GET /api/v1/master-data/amenities?category=LEISURE
```

`category`: `ACCESS`, `SECURITY`, `LEISURE`, `FEATURE`.

Listing package item includes `price`, `currency`, `durationDays`, `featured`,
`priorityLevel`. Lead source item includes `code`, `name`, `description`.

## 8. Listing API

### 8.1 Internal listing workflow

Base: `/api/v1/listings`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Role | Ghi chu |
| --- | --- | --- | --- |
| GET | `` | Agent+ | Search listing noi bo, gom draft/pending/moderation |
| GET | `/{listingId}` | Agent+ | Detail listing noi bo |
| POST | `` | Agent+ | Tao listing draft |
| PUT | `/{listingId}` | Agent+ | Sua listing |
| PATCH | `/{listingId}/submit` | Agent+ | Gui duyet |
| PATCH | `/{listingId}/approve` | Manager/Admin | Duyet |
| PATCH | `/{listingId}/reject` | Manager/Admin | Tu choi, can reason |
| PATCH | `/{listingId}/publish` | Agent+ | Publish neu hop le |
| PATCH | `/{listingId}/unpublish` | Agent+ | Go publish |

`ListingCreateRequest`:

```json
{
  "propertyId": 1,
  "code": "LST-001",
  "title": "Ban can ho 2PN trung tam",
  "slug": "ban-can-ho-2pn-trung-tam",
  "description": "Noi dung tin dang",
  "purpose": "SALE",
  "visibility": "PUBLIC",
  "askingPrice": 3500000000,
  "currency": "VND",
  "listingPackageId": 1,
  "seoTitle": "Ban can ho 2PN Quan 1",
  "seoDescription": "Tin dang can ho dep",
  "seoKeywords": "can ho, quan 1"
}
```

Internal listing search:

```http
GET /api/v1/listings?status=PENDING_REVIEW&purpose=SALE&createdBy=10&propertyId=5&keyword=apartment&page=0&size=20&sortBy=createdAt&sortDirection=DESC
Authorization: Bearer <token>
```

Filter ho tro: `status`, `purpose`, `createdBy`, `propertyId`, `keyword`,
`page`, `size`, `sortBy`, `sortDirection`. `sortBy` hop le: `id`, `code`,
`title`, `status`, `purpose`, `askingPrice`, `createdAt`, `updatedAt`,
`submittedAt`, `reviewedAt`, `publishedAt`, `viewCount`.

Visibility: `MANAGER`/`ADMIN` xem tat ca listing chua xoa. `AGENT` chi xem
listing minh tao hoac listing cua property duoc assign cho agent do.

Response list la `ApiResponse<PageResponse<InternalListingDetailResponse>>`.
Detail response gom listing fields, `property` summary, `creator`, `reviewer`,
`listingPackage`, `statusHistory`, `viewCount`, `favoriteCount`, `createdAt`,
`updatedAt`.

`GET /api/v1/listings/{listingId}` tra cung shape
`InternalListingDetailResponse`.

### 8.2 Public listing search

Base: `/api/v1/search/listings`, public.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | Search listing da publish |
| GET | `/{slug}` | Chi tiet public va ghi view |
| POST | `/{listingId}/inquiries` | Public/Bearer, tao customer + lead tu form lien he |
| POST | `/{listingId}/appointment-requests` | Public/Bearer, tao customer + lead + appointment PENDING |

Header tuy chon cho detail:

```http
X-Session-Id: browser-session-id
```

Dung de ghi view cho khach chua dang nhap.

Listing inquiry request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "+84901234567",
  "message": "Toi muon xem nha vao cuoi tuan",
  "preferredContactMethod": "PHONE"
}
```

Appointment request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "+84901234567",
  "preferredStartAt": "2026-07-02T09:00:00Z",
  "preferredEndAt": "2026-07-02T10:00:00Z",
  "message": "Toi muon xem nha buoi sang"
}
```

Behavior:

- Endpoint chap nhan anonymous hoac Bearer token. Neu Bearer la `CUSTOMER`,
  customer CRM se link voi user hien tai khi co the.
- Backend merge customer theo email truoc, sau do phone; neu chua co thi tao
  customer source `WEBSITE`.
- Lead tao voi source `LISTING_INQUIRY`, listing hien tai, va assign cho
  `property.assignedAgent`; fallback sang creator cua listing neu creator la
  agent active.
- Appointment request tao appointment status `PENDING` va notify assigned
  agent.
- Cac endpoint public submission nay bi rate-limit rieng; neu qua gioi han tra
  `429 RATE_LIMIT_EXCEEDED` va header `Retry-After`.

### 8.3 Favorite

Base: `/api/v1/listings`, role `CUSTOMER|AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `/{listingId}/favorite` | Them favorite |
| DELETE | `/{listingId}/favorite` | Bo favorite |
| GET | `/favorites` | Danh sach favorite cua user |

## 9. Customer CRM API

Base: `/api/v1/customers`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `` | Tao customer |
| GET | `` | Search customer |
| GET | `/{customerId}` | Detail gom notes/requirements lien quan |
| PUT | `/{customerId}` | Cap nhat |
| DELETE | `/{customerId}` | Soft delete |
| POST | `/{customerId}/notes` | Them note |
| PUT | `/{customerId}/notes/{noteId}` | Sua note |
| DELETE | `/{customerId}/notes/{noteId}` | Xoa note |
| PATCH | `/{customerId}/notes/{noteId}/pin` | Pin/unpin note |
| POST | `/{customerId}/requirements` | Them nhu cau |
| PUT | `/{customerId}/requirements/{requirementId}` | Sua nhu cau |
| DELETE | `/{customerId}/requirements/{requirementId}` | Deactivate nhu cau |
| GET | `/{customerId}/tags` | List tag |
| POST | `/{customerId}/tags` | Them tag |
| DELETE | `/{customerId}/tags/{tagId}` | Xoa tag |
| GET | `/{customerId}/timeline` | Timeline CRM |

`CustomerUpsertRequest`:

```json
{
  "code": "CUS-001",
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "phone": "0900000000",
  "status": "ACTIVE",
  "source": "WEBSITE",
  "priority": "HIGH",
  "preferredContactMethod": "PHONE",
  "notes": "Khach can mua trong thang nay",
  "userId": null,
  "assignedAgentId": 7
}
```

Can co it nhat mot trong `email`, `phone`, `userId`.

`CustomerNoteRequest`:

```json
{
  "content": "Khach muon goi lai cuoi tuan",
  "pinned": true
}
```

Pin/unpin note:

```json
{
  "pinned": false
}
```

`CustomerRequirementRequest` dung cho create/update:

```json
{
  "purpose": "SALE",
  "propertyTypeId": 1,
  "provinceId": 1,
  "districtId": 10,
  "wardId": 100,
  "minBudget": 2000000000,
  "maxBudget": 5000000000,
  "currency": "VND",
  "minArea": 70,
  "maxArea": 120,
  "minBedrooms": 2,
  "minBathrooms": 2,
  "description": "Gan trung tam"
}
```

Customer tag request:

```json
{
  "name": "Hot buyer",
  "color": "#D92D20"
}
```

Visibility: `MANAGER`/`ADMIN` xem va sua customer khong bi xoa. `AGENT` chi
thao tac customer minh tao hoac duoc assign.

## 10. Lead API

Base: `/api/v1/leads`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `` | Tao lead |
| GET | `` | Search lead |
| GET | `/{leadId}` | Detail lead |
| PATCH | `/{leadId}/assign` | Gan agent |
| PATCH | `/{leadId}/status` | Doi pipeline status |
| POST | `/{leadId}/notes` | Them note |
| POST | `/{leadId}/activities` | Them activity |
| POST | `/{leadId}/follow-up-tasks` | Tao task follow-up |

`LeadCreateRequest`:

```json
{
  "code": "LEAD-001",
  "sourceCode": "WEBSITE",
  "fullName": "Tran Thi B",
  "email": "b@example.com",
  "phone": "0911111111",
  "priority": "HIGH",
  "message": "Quan tam listing LST-001",
  "customerId": null,
  "listingId": 1,
  "assignedAgentId": 7
}
```

Can co it nhat mot trong `email`, `phone`, `customerId`.

### 10.1 Follow-up task API

Base: `/api/v1/follow-up-tasks`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | Search task |
| GET | `/my` | Search task assign cho user hien tai |
| GET | `/{taskId}` | Detail task |
| PUT | `/{taskId}` | Sua title/description/priority/due/assignee |
| PATCH | `/{taskId}/status` | Doi status |
| DELETE | `/{taskId}` | Cancel task, set `status=CANCELLED` |

Search filter ho tro: `status`, `priority`, `leadId`, `assignedAgentId`,
`dueFrom`, `dueTo`, `keyword`, `page`, `size`, `sortBy`, `sortDirection`.
`sortBy` hop le: `id`, `title`, `status`, `priority`, `dueAt`, `createdAt`,
`updatedAt`.

`FollowUpTaskUpdateRequest`:

```json
{
  "title": "Gui danh sach listing phu hop",
  "description": "Chon 3 can ho phu hop ngan sach",
  "priority": "HIGH",
  "dueAt": "2026-07-01T10:00:00Z",
  "assignedAgentId": 7
}
```

Status request:

```json
{
  "status": "COMPLETED",
  "completedAt": "2026-06-26T10:00:00Z"
}
```

Visibility: `MANAGER`/`ADMIN` xem tat ca task cua lead chua xoa. `AGENT` xem
task duoc assign, task minh tao, hoac task thuoc lead minh tao/duoc assign.

## 11. Appointment API

Base: `/api/v1/appointments`, role `AGENT|MANAGER|ADMIN` cho quan ly.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `` | Tao lich hen/viewing |
| GET | `` | Search lich hen |
| GET | `/my` | Lich hen cua user hien tai |
| GET | `/{appointmentId}` | Chi tiet |
| PATCH | `/{appointmentId}/confirm` | Xac nhan |
| PATCH | `/{appointmentId}/cancel` | Huy, can reason |
| PATCH | `/{appointmentId}/reschedule` | Doi lich |
| PATCH | `/{appointmentId}/complete` | Hoan thanh |
| POST | `/{appointmentId}/feedback` | Gui viewing feedback |

Nen xay UI calendar, conflict warning, status badge va form feedback sau khi
hoan thanh viewing.

## 12. Contract API

Base: `/api/v1/contracts`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Role | Ghi chu |
| --- | --- | --- | --- |
| POST | `` | Agent+ | Tao contract |
| GET | `` | Agent+ | Search contract |
| GET | `/{contractId}` | Agent+ | Chi tiet |
| PUT | `/{contractId}` | Agent+ | Cap nhat draft |
| POST | `/{contractId}/documents` | Agent+ | Upload tai lieu |
| PATCH | `/{contractId}/submit-review` | Agent+ | Gui duyet |
| PATCH | `/{contractId}/approve` | Manager/Admin | Duyet |
| PATCH | `/{contractId}/mark-signed` | Agent+ | Danh dau da ky |
| PATCH | `/{contractId}/cancel` | Agent+ | Huy |

Upload document:

```http
POST /api/v1/contracts/{contractId}/documents
Content-Type: multipart/form-data

file=<binary>
documentType=SIGNED
displayName=Hop dong da ky
description=Ban scan
primaryDocument=true
```

## 13. Transaction va payment API

Base: `/api/v1/transactions`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `` | Tao transaction |
| GET | `` | Search transaction |
| GET | `/{transactionId}` | Chi tiet |
| PATCH | `/{transactionId}/status` | Doi status |
| POST | `/{transactionId}/deposits` | Ghi nhan deposit |
| POST | `/{transactionId}/payment-schedules` | Tao lich thanh toan |
| POST | `/{transactionId}/payments` | Ghi nhan payment offline/external |
| POST | `/{transactionId}/invoices` | Tao invoice metadata |
| POST | `/{transactionId}/payments/{paymentId}/receipt` | Tao receipt metadata |

Frontend nen coi payment la record nghiep vu, khong phai payment gateway online.
Dung `idempotencyKey` neu request tao payment/deposit co nguy co retry.

## 14. Commission API

### Commission

Base: `/api/v1/commissions`.

| Method | Path | Role | Ghi chu |
| --- | --- | --- | --- |
| GET | `/my` | Agent+ | Commission cua user hien tai |
| GET | `` | Manager/Admin | Search tat ca commission |
| PATCH | `/{commissionId}/mark-paid` | Manager/Admin | Danh dau da chi tra |

### Commission rules

Base: `/api/v1/commission-rules`, role `MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `` | Tao rule |
| GET | `` | Search/list rules |
| PUT | `/{ruleId}` | Cap nhat rule |

## 15. Notification API

Base: `/api/v1/notifications`, bearer auth.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | List notification cua user |
| GET | `/unread-count` | So unread |
| PATCH | `/{notificationId}/read` | Mark one read |
| PATCH | `/read-all` | Mark all read |

Dung polling nhe cho unread badge neu chua co WebSocket.

## 16. Dashboard va report API

### Dashboard

Base: `/api/v1/dashboard`

| Method | Path | Role |
| --- | --- | --- |
| GET | `/admin` | ADMIN |
| GET | `/manager` | MANAGER/ADMIN |
| GET | `/agent` | AGENT/MANAGER/ADMIN |

### Reports

Base: `/api/v1/reports`, role `MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `/revenue` | Bao cao doanh thu |
| GET | `/leads` | Bao cao lead |
| GET | `/transactions` | Bao cao giao dich |
| GET | `/commissions` | Bao cao commission |

Nen them date range filter trong UI, vi report response duoc thiet ke cho
dashboard va bieu do.

## 17. Audit log API

Base: `/api/v1/audit-logs`, role `ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| GET | `` | Search audit logs |
| GET | `/{auditLogId}` | Detail audit log |

Dung cho man hinh admin, loc theo action/resource/actor/time.

## 18. File upload API

Base: `/api/v1/files`, role `AGENT|MANAGER|ADMIN`.

| Method | Path | Ghi chu |
| --- | --- | --- |
| POST | `/upload` | Upload file chung |
| GET | `/{fileId}` | Metadata file neu uploader/manager/admin |
| GET | `/{fileId}/download` | Download stream hoac redirect direct/signed URL |
| DELETE | `/{fileId}` | Xoa file chua link voi resource khac |
| PATCH | `/{fileId}/access-level` | Manager/admin doi `PUBLIC`/`PRIVATE` |

```http
POST /api/v1/files/upload
Content-Type: multipart/form-data

file=<binary>
accessLevel=PRIVATE
```

Upload response includes storage metadata:

- `storageProvider`: `LOCAL` or `R2`.
- `storageKey`: internal backend object key, not for direct frontend use.
- `checksumSha256`: SHA-256 checksum calculated while storing the object.
- `accessLevel`: `PUBLIC` or `PRIVATE`.
- `publicUrl`: present only when a public file has a direct public URL.

Download behavior:

- `PUBLIC` file with safe `publicUrl`: backend returns `302 Location`.
- `PRIVATE` file: backend enforces authorization, then either streams bytes or
  returns `302 Location` to a short-lived signed URL when the active provider
  supports it.
- Treat `403` as no permission and `404` as missing/deleted file.

Access-level request:

```json
{
  "accessLevel": "PUBLIC"
}
```

Delete is allowed only for unlinked files. Files linked to signed contracts,
verified legal documents, property images, or other existing file links are
blocked by backend business rules.

Backend storage config:

- Local remains the default for development and tests with `STORAGE_PROVIDER=local`.
- Cloudflare R2 uses the S3-compatible API with `STORAGE_PROVIDER=r2`,
  `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`,
  `STORAGE_SECRET_KEY`, optional `STORAGE_PUBLIC_BASE_URL`, and
  `STORAGE_SIGNED_URL_TTL`.
- Credentials must come from environment/config, never from frontend code.

## 19. AI API

Tat ca nam duoi `/api/v1/ai`. Backend co provider abstraction va fallback/noop
de app van chay duoc khi chua cau hinh provider that.

| Method | Path | Role | Ghi chu |
| --- | --- | --- | --- |
| POST | `/listing-description` | Agent+ | Sinh/cai thien mo ta listing |
| POST | `/customers/{customerId}/recommendations` | Agent+ | Goi y listing cho customer |
| POST | `/leads/{leadId}/score` | Agent+ | Cham diem lead |
| GET | `/customers/{customerId}/summary` | Agent+ | Tom tat customer |
| POST | `/property-images/analyze` | Agent+ | Phan tich anh property |
| POST | `/chat/sessions` | Customer/Agent+ | Tao chat session |
| POST | `/chat/sessions/{sessionId}/messages` | Customer/Agent+ | Gui message |
| GET | `/chat/sessions/{sessionId}` | Customer/Agent+ | Lay session/messages |

### Listing description

```json
{
  "listingId": 1,
  "tone": "PROFESSIONAL",
  "language": "vi",
  "includeSeo": true,
  "extraInstructions": "Nhan manh vi tri va tien ich"
}
```

### Recommendation

```json
{
  "limit": 10,
  "purpose": "SALE",
  "maxPrice": 5000000000,
  "currency": "VND"
}
```

### Lead scoring

```json
{
  "forceRefresh": false
}
```

### Chat

```json
{
  "title": "Tu van mua nha"
}
```

```json
{
  "content": "Toi can can ho 2 phong ngu tai Quan 1"
}
```

## 20. Enum frontend can map

- `RoleCode`: `ADMIN`, `MANAGER`, `AGENT`, `CUSTOMER`, `OWNER`
- `UserStatus`: `PENDING_VERIFICATION`, `ACTIVE`, `INACTIVE`, `LOCKED`
- `PropertyStatus`: `DRAFT`, `AVAILABLE`, `RESERVED`, `SOLD`, `RENTED`, `INACTIVE`, `DELETED`
- `PropertyPurpose`: `SALE`, `RENT`
- `PropertyDirection`: `NORTH`, `NORTHEAST`, `EAST`, `SOUTHEAST`, `SOUTH`, `SOUTHWEST`, `WEST`, `NORTHWEST`
- `PropertyLegalStatus`: `PINK_BOOK`, `RED_BOOK`, `SALE_CONTRACT`, `WAITING_FOR_CERTIFICATE`, `OTHER`, `UNKNOWN`
- `FurnitureStatus`: `UNFURNISHED`, `PARTIALLY_FURNISHED`, `FULLY_FURNISHED`
- `LegalDocumentType`: `PINK_BOOK`, `RED_BOOK`, `OWNERSHIP_CERTIFICATE`, `LAND_USE_CERTIFICATE`, `CONSTRUCTION_PERMIT`, `SALE_CONTRACT`, `OTHER`
- `DocumentVerificationStatus`: `UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`
- `AmenityCategory`: `ACCESS`, `SECURITY`, `LEISURE`, `FEATURE`
- `ListingPurpose`: `SALE`, `RENT`
- `ListingStatus`: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `PUBLISHED`, `UNPUBLISHED`, `EXPIRED`, `SOLD`, `RENTED`
- `ListingVisibility`: `PUBLIC`, `INTERNAL`, `PRIVATE`
- `CustomerStatus`: `ACTIVE`, `INACTIVE`, `ARCHIVED`
- `CustomerSource`: `MANUAL`, `WEBSITE`, `REFERRAL`, `IMPORT`, `OTHER`
- `CustomerPriority`: `LOW`, `MEDIUM`, `HIGH`
- `LeadPriority`: `LOW`, `MEDIUM`, `HIGH`
- `LeadPipelineStatus`: `NEW`, `ASSIGNED`, `CONTACTED`, `INTERESTED`, `VIEWING_SCHEDULED`, `NEGOTIATING`, `CLOSED_WON`, `CLOSED_LOST`, `INVALID`
- `LeadActivityType`: `CALL`, `EMAIL`, `CHAT`, `MEETING`, `STATUS_CHANGE`, `ASSIGNMENT`, `OTHER`
- `FollowUpTaskStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `AppointmentStatus`: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`, `RESCHEDULED`
- `AppointmentParticipantRole`: `CUSTOMER`, `AGENT`, `OWNER`, `OTHER`
- `ParticipantResponseStatus`: `INVITED`, `ACCEPTED`, `DECLINED`, `TENTATIVE`
- `ViewingInterestLevel`: `HIGH`, `MEDIUM`, `LOW`, `NOT_INTERESTED`
- `ContractType`: `SALE`, `LEASE`
- `ContractStatus`: `DRAFT`, `PENDING_REVIEW`, `PENDING_SIGNATURE`, `SIGNED`, `ACTIVE`, `EXPIRED`, `CANCELLED`, `TERMINATED`
- `ContractDocumentType`: `DRAFT`, `FINAL`, `SIGNED`, `ATTACHMENT`
- `ContractPartyRole`: `BUYER`, `SELLER`, `TENANT`, `LANDLORD`, `AGENT`, `WITNESS`, `OTHER`
- `ContractSignatureStatus`: `PENDING`, `SIGNED`, `DECLINED`, `VOIDED`
- `ContractSignatureMethod`: `ELECTRONIC`, `UPLOADED`, `WET_INK`
- `TransactionStatus`: `PENDING`, `DEPOSITED`, `CONTRACT_SIGNED`, `PAYMENT_IN_PROGRESS`, `COMPLETED`, `CANCELLED`, `REFUNDED`
- `DepositStatus`: `PENDING`, `RECEIVED`, `VERIFIED`, `REFUNDED`, `CANCELLED`
- `PaymentScheduleStatus`: `PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`
- `PaymentStatus`: `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`, `CANCELLED`
- `PaymentMethod`: `CASH`, `BANK_TRANSFER`, `CREDIT_CARD`, `DEBIT_CARD`, `E_WALLET`, `OTHER`
- `InvoiceStatus`: `DRAFT`, `ISSUED`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `VOID`
- `CommissionStatus`: `PENDING`, `APPROVED`, `PAID`, `CANCELLED`
- `CommissionCalculationType`: `PERCENTAGE`, `FIXED`
- `NotificationChannel`: `IN_APP`, `EMAIL`
- `FileAccessLevel`: `PUBLIC`, `PRIVATE`
- `AiConversationStatus`: `OPEN`, `CLOSED`
- `AiMessageRole`: `USER`, `ASSISTANT`, `SYSTEM`
- `AiRequestStatus`: `SUCCESS`, `FAILED`, `SKIPPED`, `TIMEOUT`

## 21. Frontend implementation checklist

### API client

- Tao `apiClient` dung base URL va unwrap `ApiResponse.data`.
- Interceptor them bearer token.
- Queue refresh token de tranh nhieu request refresh cung luc.
- Chuan hoa error shape thanh `{ code, message, fieldErrors }`.
- Ham build query bo qua `null`, `undefined`, chuoi rong.
- Upload helper dung `FormData`, khong set tay boundary.

### State/cache

- Cache public listing search theo query.
- Cache `/auth/me`, unread notification count, enum labels.
- Invalidate property sau upload/xoa/set cover image.
- Invalidate customer/lead detail sau note/activity/task.
- Invalidate dashboard/report khi date range doi.

### UX theo workflow backend

- Property: tao draft, upload image, set cover, doi status `AVAILABLE`.
- Listing: tao draft, submit, manager approve/reject, publish.
- CRM: tao customer, them requirement, lien ket lead/listing.
- Lead: assign, update pipeline, tao appointment/follow-up.
- Appointment: confirm, reschedule, complete, feedback.
- Contract: create, upload document, submit review, approve, mark signed.
- Transaction: create tu contract, deposit, schedule, payment, invoice, receipt,
  update status `COMPLETED`.
- Commission: agent xem `/my`, manager/admin danh dau paid.
- Notification: badge unread, mark read/read all.
- AI: dung nhu assistant phu, luu response vao form nhung cho user sua truoc
  khi submit chinh.

## 22. Khoang trong backend frontend can biet

- Da xoa legacy `/api/buildings/**`; frontend khong tich hop API nay.
- Chua co API listing list/detail noi bo cho draft/pending. Moderation UI day du can backend bo sung.
- Chua co owner portal rieng, du role `OWNER` da ton tai.
- Chua co profile update/change password/forgot password/email verification UI flow du endpoint rieng.
- Chua co file download/delete chung cho `/api/v1/files`; chi co upload chung va upload theo property/contract.
- Chua co WebSocket notification; dung polling.
- AI co fallback/noop nen response co the la du lieu du phong khi chua cau hinh provider that.

## 23. Demo flow end-to-end nen dung de test frontend

1. Login admin.
2. Register agent, admin gan role/status neu can.
3. Agent tao property, upload image, set cover, doi status `AVAILABLE`.
4. Agent tao listing, submit review.
5. Manager/Admin approve listing.
6. Agent publish listing.
7. Guest search `/api/v1/search/listings`, xem detail theo slug.
8. Customer login, favorite listing.
9. Agent tao customer/lead tu nhu cau.
10. Agent tao appointment, confirm, complete, them feedback.
11. Agent tao contract, upload document, submit review.
12. Manager/Admin approve contract.
13. Agent mark signed, tao transaction.
14. Ghi deposit, schedule, payment, invoice, receipt.
15. Cap nhat transaction `COMPLETED`, xem commission/report/dashboard.
