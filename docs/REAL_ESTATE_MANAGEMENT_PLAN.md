# Real Estate Management - Full Development Plan

## 1. Product Vision

Muc tieu cua du an la xay dung mot he thong quan ly bat dong san thuc te, co the dung cho san moi gioi, cong ty bat dong san, chu dau tu nho, hoac nhom agent ban/cho thue nha dat.

He thong khong chi dung lai o CRUD toa nha. Pham vi can bao gom:

- Quan ly nguoi dung, vai tro, phan quyen.
- Quan ly bat dong san, hinh anh, tien ich, phap ly.
- Quan ly tin dang ban/cho thue.
- Tim kiem, loc, sap xep, goi y bat dong san.
- Quan ly khach hang va lead.
- Quan ly lich hen xem nha.
- Quan ly hop dong, giao dich, thanh toan, hoa hong.
- Dashboard va bao cao.
- AI ho tro viet tin dang, goi y san pham, cham diem lead, chatbot tu van, phan tich anh va tom tat ho so khach hang.

## 2. Target Users

### 2.1 Admin

- Quan ly toan bo he thong.
- Quan ly user, role, permission.
- Quan ly cau hinh he thong.
- Duyet hoac khoa tai khoan.
- Theo doi audit log, bao cao tong quan.

### 2.2 Manager

- Quan ly agent trong team.
- Duyet tin dang.
- Phan cong lead.
- Theo doi doanh thu, hoa hong, hieu suat agent.
- Xem dashboard theo team.

### 2.3 Agent

- Tao va quan ly bat dong san.
- Tao tin dang.
- Cham soc lead/khach hang.
- Dat lich hen xem nha.
- Tao giao dich, cap nhat trang thai hop dong.
- Xem hoa hong ca nhan.

### 2.4 Customer

- Tim kiem bat dong san.
- Luu tin yeu thich.
- Gui yeu cau tu van.
- Dat lich xem nha.
- Chat voi AI assistant.
- Theo doi lich hen va giao dich cua minh.

### 2.5 Owner/Landlord

- Dang ky bat dong san can ban/cho thue.
- Theo doi trang thai tin dang.
- Theo doi lich hen xem nha.
- Theo doi giao dich, hop dong, thanh toan.

## 3. Recommended Architecture

Nen bat dau bang modular monolith, khong nen tach microservices qua som. Modular monolith giup code gon, de hoc, de test, nhung van co ranh gioi module ro rang.

### 3.1 Backend Stack

- Java 21
- Spring Boot 3.x
- Spring Web
- Spring Security
- Spring Data JPA
- Hibernate
- PostgreSQL
- Flyway hoac Liquibase
- Redis
- MinIO hoac AWS S3 compatible storage
- OpenAPI/Swagger
- MapStruct
- Lombok
- JUnit 5
- Mockito
- Testcontainers

### 3.2 Optional Infrastructure

- Docker Compose cho local development.
- Nginx cho reverse proxy.
- GitHub Actions cho CI.
- Prometheus/Grafana cho monitoring.
- Elasticsearch/OpenSearch neu can search nang cao.

### 3.3 Package Structure

```text
src/main/java/com/realestate/
├── RealEstateApplication.java
├── auth
├── user
├── property
├── listing
├── customer
├── lead
├── appointment
├── contract
├── transaction
├── payment
├── commission
├── ai
├── notification
├── report
├── storage
├── audit
├── common
└── config
```

Moi module nen co cau truc noi bo thong nhat:

```text
module/
├── controller
├── service
├── repository
├── entity
├── dto
│   ├── request
│   └── response
├── mapper
└── validator
```

## 4. Core Technical Standards

### 4.1 API Response Standard

Tat ca API nen tra ve mot dinh dang thong nhat:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "Request processed successfully",
  "data": {},
  "timestamp": "2026-06-09T00:00:00Z"
}
```

Pagination response:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

### 4.2 Error Handling

Can co global exception handler cho:

- Validation error.
- Authentication error.
- Authorization error.
- Resource not found.
- Duplicate resource.
- Business rule violation.
- File upload error.
- AI provider error.
- External service timeout.

### 4.3 Validation

Dung Bean Validation:

- `@NotBlank`
- `@NotNull`
- `@Email`
- `@Min`
- `@Max`
- `@Size`
- custom validator cho phone, price range, date range, file type.

### 4.4 Database Migration

Dung Flyway:

```text
src/main/resources/db/migration/
├── V001__init_auth_schema.sql
├── V002__init_property_schema.sql
├── V003__init_listing_schema.sql
├── V004__init_crm_schema.sql
├── V005__init_transaction_schema.sql
└── V006__init_ai_schema.sql
```

### 4.5 Profiles

```text
application.yml
application-dev.yml
application-test.yml
application-uat.yml
application-prod.yml
```

## 5. Functional Modules

## 5.1 Authentication and Authorization

### Features

- Register.
- Login.
- Logout.
- Refresh token.
- Forgot password.
- Reset password.
- Change password.
- Email verification.
- Role-based access control.
- Permission-based access control.
- Account lock/unlock.
- Login history.

### Entities

- `User`
- `Role`
- `Permission`
- `UserRole`
- `RefreshToken`
- `OtpToken`
- `LoginHistory`

### Main APIs

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
POST /api/v1/auth/verify-email
GET  /api/v1/auth/me
```

### Security Rules

- Access token ngan han, vi du 15-30 phut.
- Refresh token dai hon, vi du 7-30 ngay.
- Password ma hoa bang BCrypt.
- Refresh token luu DB, co the revoke.
- Rate limit cho login, forgot password, AI chat.
- Admin/Manager moi duoc khoa user va gan role.

## 5.2 User and Organization Management

### Features

- Quan ly profile user.
- Quan ly agent.
- Quan ly team/agency.
- Gan agent vao manager/team.
- Active/inactive user.
- Upload avatar.

### Entities

- `UserProfile`
- `Agency`
- `Team`
- `TeamMember`

### Main APIs

```text
GET    /api/v1/users
GET    /api/v1/users/{id}
PATCH  /api/v1/users/{id}/status
PATCH  /api/v1/users/{id}/roles
GET    /api/v1/agencies
POST   /api/v1/agencies
GET    /api/v1/teams
POST   /api/v1/teams
PATCH  /api/v1/teams/{id}/members
```

## 5.3 Property Management

Property la tai san thuc te. Listing la tin dang cua tai san do.

### Features

- Tao/sua/xoa bat dong san.
- Quan ly dia chi chi tiet.
- Quan ly tien ich.
- Quan ly thong tin phap ly.
- Upload nhieu anh.
- Chon anh dai dien.
- Quan ly video/virtual tour URL.
- Quan ly trang thai tai san.
- Luu toa do ban do.
- Import property tu file Excel/CSV.

### Property Status

```text
DRAFT
AVAILABLE
RESERVED
SOLD
RENTED
INACTIVE
DELETED
```

### Entities

- `Property`
- `PropertyType`
- `PropertyImage`
- `PropertyAmenity`
- `Amenity`
- `PropertyLegalDocument`
- `Address`
- `Province`
- `District`
- `Ward`

### Main APIs

```text
POST   /api/v1/properties
GET    /api/v1/properties
GET    /api/v1/properties/{id}
PUT    /api/v1/properties/{id}
DELETE /api/v1/properties/{id}
PATCH  /api/v1/properties/{id}/status
POST   /api/v1/properties/{id}/images
DELETE /api/v1/properties/{id}/images/{imageId}
PATCH  /api/v1/properties/{id}/cover-image/{imageId}
POST   /api/v1/properties/import
```

### Search Filters

- Keyword.
- Property type.
- Sale/rent purpose.
- Province/district/ward.
- Price min/max.
- Area min/max.
- Number of bedrooms.
- Number of bathrooms.
- Direction.
- Legal status.
- Furniture status.
- Amenities.
- Created by.
- Status.

## 5.4 Listing Management

Listing la tin dang hien thi cho khach hang hoac noi bo san.

### Features

- Tao listing tu property.
- Luu title, description, SEO keyword.
- Listing ban hoac cho thue.
- Duyet tin truoc khi public.
- Tu choi tin kem ly do.
- Lich su thay doi trang thai.
- Tin noi bat, tin premium.
- Dem luot xem.
- Luu favorite.
- Share public link.

### Listing Status

```text
DRAFT
PENDING_REVIEW
APPROVED
REJECTED
PUBLISHED
UNPUBLISHED
EXPIRED
SOLD
RENTED
```

### Entities

- `Listing`
- `ListingStatusHistory`
- `ListingView`
- `ListingFavorite`
- `ListingPackage`

### Main APIs

```text
POST   /api/v1/listings
GET    /api/v1/listings
GET    /api/v1/listings/{id}
PUT    /api/v1/listings/{id}
PATCH  /api/v1/listings/{id}/submit
PATCH  /api/v1/listings/{id}/approve
PATCH  /api/v1/listings/{id}/reject
PATCH  /api/v1/listings/{id}/publish
PATCH  /api/v1/listings/{id}/unpublish
POST   /api/v1/listings/{id}/favorite
DELETE /api/v1/listings/{id}/favorite
GET    /api/v1/listings/public/search
```

## 5.5 Search and Discovery

### Basic Search

Dung JPA Specification hoac Criteria API de loc dong.

### Advanced Search

Neu du lieu lon:

- Elasticsearch/OpenSearch.
- Full-text search.
- Geo search theo toa do.
- Suggestion/autocomplete.
- Search analytics.

### Features

- Search listing cong khai.
- Search noi bo cho agent/manager.
- Sort theo price, created date, view count, relevance.
- Save search.
- Alert khi co listing moi phu hop.

### APIs

```text
GET  /api/v1/search/listings
GET  /api/v1/search/properties
POST /api/v1/saved-searches
GET  /api/v1/saved-searches
DELETE /api/v1/saved-searches/{id}
```

## 5.6 Customer Management

### Features

- Tao ho so khach hang.
- Quan ly thong tin lien he.
- Quan ly nhu cau mua/thue.
- Luu ngan sach.
- Luu khu vuc quan tam.
- Luu lich su tuong tac.
- Tag customer.
- Merge duplicate customers.

### Entities

- `Customer`
- `CustomerRequirement`
- `CustomerTag`
- `CustomerNote`
- `CustomerFavoriteListing`

### APIs

```text
POST   /api/v1/customers
GET    /api/v1/customers
GET    /api/v1/customers/{id}
PUT    /api/v1/customers/{id}
DELETE /api/v1/customers/{id}
POST   /api/v1/customers/{id}/notes
POST   /api/v1/customers/{id}/requirements
GET    /api/v1/customers/{id}/timeline
```

## 5.7 Lead and CRM Pipeline

Lead la co hoi ban hang/cho thue.

### Features

- Tao lead tu form lien he, listing, import, hoac nhap tay.
- Gan lead cho agent.
- Cap nhat pipeline status.
- Ghi chu cham soc.
- Lich su goi dien/email/chat.
- Cham diem lead bang AI.
- Nhac viec follow-up.

### Lead Status

```text
NEW
ASSIGNED
CONTACTED
INTERESTED
VIEWING_SCHEDULED
NEGOTIATING
CLOSED_WON
CLOSED_LOST
INVALID
```

### Entities

- `Lead`
- `LeadSource`
- `LeadAssignment`
- `LeadNote`
- `LeadActivity`
- `FollowUpTask`

### APIs

```text
POST  /api/v1/leads
GET   /api/v1/leads
GET   /api/v1/leads/{id}
PATCH /api/v1/leads/{id}/assign
PATCH /api/v1/leads/{id}/status
POST  /api/v1/leads/{id}/notes
POST  /api/v1/leads/{id}/activities
POST  /api/v1/leads/{id}/follow-up-tasks
```

## 5.8 Appointment Management

### Features

- Dat lich xem nha.
- Kiem tra trung lich agent.
- Kiem tra property co san sang hay khong.
- Customer xac nhan/huy lich.
- Agent cap nhat ket qua xem nha.
- Nhac lich qua email/notification.

### Appointment Status

```text
PENDING
CONFIRMED
CANCELLED
COMPLETED
NO_SHOW
RESCHEDULED
```

### Entities

- `Appointment`
- `AppointmentParticipant`
- `ViewingFeedback`

### APIs

```text
POST  /api/v1/appointments
GET   /api/v1/appointments
GET   /api/v1/appointments/my
GET   /api/v1/appointments/{id}
PATCH /api/v1/appointments/{id}/confirm
PATCH /api/v1/appointments/{id}/cancel
PATCH /api/v1/appointments/{id}/reschedule
POST  /api/v1/appointments/{id}/feedback
```

## 5.9 Contract Management

### Features

- Tao hop dong mua/ban/thue.
- Upload file hop dong.
- Sinh hop dong tu template.
- Luu chu ky/trang thai ky.
- Theo doi ngay hieu luc, ngay het han.
- Lien ket hop dong voi transaction.

### Contract Status

```text
DRAFT
PENDING_REVIEW
PENDING_SIGNATURE
SIGNED
ACTIVE
EXPIRED
CANCELLED
TERMINATED
```

### Entities

- `Contract`
- `ContractParty`
- `ContractDocument`
- `ContractTemplate`
- `ContractSignature`

### APIs

```text
POST  /api/v1/contracts
GET   /api/v1/contracts
GET   /api/v1/contracts/{id}
PUT   /api/v1/contracts/{id}
POST  /api/v1/contracts/{id}/documents
PATCH /api/v1/contracts/{id}/submit-review
PATCH /api/v1/contracts/{id}/approve
PATCH /api/v1/contracts/{id}/mark-signed
PATCH /api/v1/contracts/{id}/cancel
```

## 5.10 Transaction, Payment and Commission

### Features

- Quan ly giao dich mua/ban/thue.
- Theo doi tien coc.
- Theo doi lich thanh toan.
- Xac nhan thanh toan.
- Tinh hoa hong agent.
- Chia hoa hong theo team.
- Xuat invoice/receipt.

### Transaction Status

```text
PENDING
DEPOSITED
CONTRACT_SIGNED
PAYMENT_IN_PROGRESS
COMPLETED
CANCELLED
REFUNDED
```

### Entities

- `Transaction`
- `Deposit`
- `Payment`
- `PaymentSchedule`
- `Invoice`
- `Receipt`
- `Commission`
- `CommissionRule`

### APIs

```text
POST  /api/v1/transactions
GET   /api/v1/transactions
GET   /api/v1/transactions/{id}
PATCH /api/v1/transactions/{id}/status
POST  /api/v1/transactions/{id}/payments
POST  /api/v1/transactions/{id}/deposits
GET   /api/v1/commissions
GET   /api/v1/commissions/my
PATCH /api/v1/commissions/{id}/mark-paid
```

## 5.11 Notification Module

### Features

- In-app notification.
- Email notification.
- Notification templates.
- Mark as read.
- Reminder for appointments.
- Reminder for follow-up tasks.
- Alert khi co listing moi phu hop saved search.

### Entities

- `Notification`
- `NotificationTemplate`
- `EmailLog`

### APIs

```text
GET   /api/v1/notifications
PATCH /api/v1/notifications/{id}/read
PATCH /api/v1/notifications/read-all
GET   /api/v1/notifications/unread-count
```

## 5.12 File Storage Module

### Features

- Upload image.
- Upload legal document.
- Upload contract.
- Validate file size/type.
- Generate public/private URL.
- Delete file.
- Store metadata.

### Entities

- `FileResource`

### APIs

```text
POST   /api/v1/files/upload
GET    /api/v1/files/{id}
DELETE /api/v1/files/{id}
```

## 5.13 Audit Log

### Features

- Ghi log hanh dong quan trong.
- Luu actor, action, resource type, resource id, old value, new value.
- Ho tro tra cuu cho admin.

### Entities

- `AuditLog`

### APIs

```text
GET /api/v1/audit-logs
GET /api/v1/audit-logs/{id}
```

## 5.14 Dashboard and Reports

### Admin Dashboard

- Tong user.
- Tong property.
- Tong listing.
- Listing cho duyet.
- Doanh thu.
- Lead moi.
- Giao dich moi.

### Manager Dashboard

- Hieu suat agent.
- Lead theo pipeline.
- Ty le chot.
- Doanh thu team.
- Hoa hong team.

### Agent Dashboard

- Lead duoc giao.
- Lich hen hom nay.
- Follow-up tasks.
- Giao dich dang xu ly.
- Hoa hong ca nhan.

### APIs

```text
GET /api/v1/dashboard/admin
GET /api/v1/dashboard/manager
GET /api/v1/dashboard/agent
GET /api/v1/reports/revenue
GET /api/v1/reports/leads
GET /api/v1/reports/transactions
GET /api/v1/reports/commissions
```

## 6. AI Features

AI nen duoc thiet ke thanh module rieng, co log request/response, co cache, co rate limit, va co fallback khi provider loi.

## 6.1 AI Listing Description Generator

### Problem

Agent ton thoi gian viet mo ta tin dang. Mo ta kem lam giam ty le chuyen doi.

### Input

- Property type.
- Sale/rent purpose.
- Address summary.
- Price.
- Area.
- Bedrooms/bathrooms.
- Amenities.
- Legal status.
- Furniture status.
- Selling points.

### Output

- Title.
- Short description.
- Full description.
- SEO keywords.
- Social media caption.

### API

```text
POST /api/v1/ai/listing-description
```

## 6.2 AI Property Recommendation

### Problem

Khach co nhu cau rieng, agent can tim nhanh bat dong san phu hop.

### Logic

Ket hop rule-based filtering va AI ranking:

- Rule-based: budget, location, type, area.
- AI ranking: do phu hop theo nhu cau tu nhien cua khach.

### API

```text
POST /api/v1/ai/customers/{customerId}/recommendations
```

### Output

- Listing list.
- Match score.
- Explanation.
- Suggested next action.

## 6.3 AI Lead Scoring

### Problem

Agent can biet lead nao nen uu tien cham soc.

### Input

- Lead source.
- Customer budget.
- Number of interactions.
- Recent activity.
- Appointment status.
- Favorite listings.
- Time since last contact.

### Output

- Score 0-100.
- Priority: low/medium/high.
- Reason.
- Suggested follow-up action.

### API

```text
POST /api/v1/ai/leads/{leadId}/score
```

## 6.4 AI Chatbot

### Problem

Khach hang can hoi dap va tim nha nhanh.

### Capabilities

- Hoi nhu cau mua/thue.
- De xuat listing.
- Giai thich thong tin listing.
- Tra loi cau hoi ve khu vuc, gia, tien ich.
- Tao lead neu khach quan tam.
- Dat lich xem nha neu khach dong y.

### API

```text
POST /api/v1/ai/chat/sessions
POST /api/v1/ai/chat/sessions/{sessionId}/messages
GET  /api/v1/ai/chat/sessions/{sessionId}
```

### Important Guardrails

- Khong dua tu van phap ly/tai chinh nhu ket luan chuyen gia.
- Neu cau hoi phap ly phuc tap, de xuat lien he nhan vien/chuyen gia.
- Khong cong khai thong tin rieng tu cua owner/customer.

## 6.5 AI Image Analysis

### Problem

Anh bat dong san xau, trung lap, mo, toi, hoac khong phu hop lam giam chat luong tin dang.

### Features

- Phat hien anh mo/toi.
- Phat hien anh trung lap.
- Goi y anh cover.
- Sinh caption anh.
- Phat hien anh khong lien quan.

### API

```text
POST /api/v1/ai/property-images/analyze
```

## 6.6 AI Customer Summary

### Problem

Agent can doc nhanh ho so khach truoc khi goi dien.

### Output

- Summary nhu cau.
- Lich su tuong tac ngan gon.
- Bat dong san da quan tam.
- Muc do tiem nang.
- Viec nen lam tiep theo.

### API

```text
GET /api/v1/ai/customers/{customerId}/summary
```

## 6.7 AI Price Insight

### Problem

Agent/owner can biet gia dang de xuat co hop ly khong.

### Input

- Property attributes.
- Location.
- Listing history.
- Comparable listings.

### Output

- Suggested price range.
- Confidence.
- Similar listings.
- Explanation.

### API

```text
POST /api/v1/ai/properties/{propertyId}/price-insight
```

## 6.8 AI Module Entities

- `AiRequestLog`
- `AiConversation`
- `AiMessage`
- `AiRecommendation`
- `AiLeadScore`
- `AiGeneratedListingContent`
- `AiImageAnalysis`

## 7. Database Design Overview

### 7.1 Auth and User

```text
users
roles
permissions
user_roles
role_permissions
refresh_tokens
otp_tokens
login_histories
user_profiles
agencies
teams
team_members
```

### 7.2 Property and Listing

```text
properties
property_types
property_images
property_amenities
amenities
property_legal_documents
addresses
provinces
districts
wards
listings
listing_status_histories
listing_views
listing_favorites
listing_packages
saved_searches
```

### 7.3 CRM

```text
customers
customer_requirements
customer_tags
customer_notes
leads
lead_sources
lead_assignments
lead_notes
lead_activities
follow_up_tasks
```

### 7.4 Appointment and Transaction

```text
appointments
appointment_participants
viewing_feedbacks
contracts
contract_parties
contract_documents
contract_templates
contract_signatures
transactions
deposits
payments
payment_schedules
invoices
receipts
commissions
commission_rules
```

### 7.5 System

```text
notifications
notification_templates
email_logs
file_resources
audit_logs
ai_request_logs
ai_conversations
ai_messages
ai_recommendations
ai_lead_scores
ai_generated_listing_contents
ai_image_analyses
```

## 8. Non-Functional Requirements

### 8.1 Security

- Spring Security + JWT.
- BCrypt password hashing.
- Refresh token rotation.
- Role/permission authorization.
- Method-level security voi `@PreAuthorize`.
- Input validation.
- File upload validation.
- Rate limit login, forgot password, AI APIs.
- Audit log cho action quan trong.
- Khong log password/token/raw secret.
- CORS config theo environment.

### 8.2 Performance

- Pagination bat buoc voi list API.
- Index database cho search fields.
- Cache static master data: province, district, ward, property type, amenities.
- Redis cache cho listing hot/search pho bien.
- Async processing cho email, AI image analysis, report export.

### 8.3 Reliability

- Global exception handling.
- Transaction boundary ro rang.
- Retry cho external service neu phu hop.
- Timeout cho AI provider va storage service.
- Idempotency key cho payment/transaction action quan trong.

### 8.4 Observability

- Request logging.
- Audit logging.
- Health check endpoint.
- Metrics endpoint voi Spring Actuator.
- Error tracking.
- AI request cost/token tracking.

## 9. Testing Strategy

### 9.1 Unit Tests

Can test:

- Service business rules.
- Mapper.
- Validator.
- AI prompt builder.
- Commission calculation.
- Lead scoring fallback logic.

### 9.2 Integration Tests

Dung Testcontainers cho database:

- Auth flow.
- Property CRUD.
- Listing approval flow.
- Lead assignment.
- Appointment booking.
- Transaction status flow.

### 9.3 API Tests

- Test security role permission.
- Test validation errors.
- Test pagination/search.
- Test upload file.

### 9.4 Minimum Coverage Target

- Core business module: 70%+.
- Auth/security: high priority.
- Payment/transaction/commission: high priority.

## 10. Deployment Plan

### 10.1 Local Development

Docker Compose services:

- app
- postgres
- redis
- minio
- mailhog

### 10.2 Environments

- dev: local developer.
- test: automated testing.
- uat: demo/staging.
- prod: production.

### 10.3 CI/CD

Pipeline:

```text
checkout
compile
unit test
integration test
package
build docker image
scan image
deploy to uat/prod
```

## 11. Development Roadmap

## Phase 0 - Project Reset and Foundation

Goal: bien project hien tai thanh skeleton chuan cho Real Estate Management.

Tasks:

- Rename package tu `com.javaweb` sang `com.realestate`.
- Doi artifact name thanh `real-estate-management`.
- Chuyen config sang YAML.
- Them common response wrapper.
- Them global exception handler moi.
- Them validation dependency.
- Them Swagger/OpenAPI.
- Them Flyway.
- Them MapStruct.
- Them Docker Compose.
- Chuan hoa folder/module.
- Viet README moi theo product moi.

Deliverables:

- App chay duoc.
- Swagger truy cap duoc.
- Database migration dau tien chay duoc.

## Phase 1 - Auth and User Management

Tasks:

- User, Role, Permission schema.
- Register/login/logout.
- JWT access token.
- Refresh token.
- Forgot/reset password.
- Current user API.
- Admin user management.
- Role/permission guard.

Deliverables:

- Dang nhap duoc.
- API co bao ve theo role.
- Co seed admin account.

## Phase 2 - Property Management

Tasks:

- Property schema.
- Address schema.
- Property type, amenities, legal document.
- CRUD property.
- Upload image.
- Set cover image.
- Property status workflow.
- Property search internal.

Deliverables:

- Agent tao va quan ly bat dong san.
- Manager/Admin xem toan bo property.

## Phase 3 - Listing and Public Search

Tasks:

- Listing schema.
- Tao listing tu property.
- Submit for review.
- Approve/reject listing.
- Publish/unpublish.
- Public search API.
- Favorite listing.
- View count.
- Saved search.

Deliverables:

- Khach hang tim kiem tin dang.
- Manager duyet tin.
- Customer luu tin yeu thich.

## Phase 4 - Customer and Lead CRM

Tasks:

- Customer profile.
- Customer requirement.
- Lead source.
- Lead pipeline.
- Assign lead.
- Lead notes/activity.
- Follow-up tasks.
- Customer timeline.

Deliverables:

- Agent quan ly khach va lead nhu CRM thuc te.

## Phase 5 - Appointment Management

Tasks:

- Create appointment.
- Conflict check.
- Confirm/cancel/reschedule.
- Appointment reminder.
- Viewing feedback.
- Agent/customer calendar API.

Deliverables:

- Dat lich xem nha hoan chinh.
- Co feedback sau buoi xem.

## Phase 6 - Contract, Transaction, Payment, Commission

Tasks:

- Contract schema.
- Upload contract document.
- Contract status workflow.
- Transaction schema.
- Deposit/payment tracking.
- Commission rule.
- Commission calculation.
- Invoice/receipt metadata.

Deliverables:

- Theo doi duoc giao dich tu lead den chot.
- Tinh duoc hoa hong agent.

## Phase 7 - AI Basic Features

Tasks:

- AI provider abstraction.
- AI request log.
- Listing description generator.
- Customer-property recommendation.
- Lead scoring.
- Prompt template management.
- Rate limit AI API.

Deliverables:

- Agent sinh noi dung tin dang bang AI.
- Agent nhan goi y property theo customer.
- Lead co score va suggested action.

## Phase 8 - AI Advanced Features

Tasks:

- AI chatbot session.
- AI customer summary.
- AI image analysis.
- AI price insight.
- Cache AI responses neu phu hop.
- Cost/token tracking.

Deliverables:

- Customer co chatbot tu van.
- Agent co tom tat customer.
- He thong phan tich chat luong anh.

## Phase 9 - Dashboard, Reports, Notification

Tasks:

- Notification module.
- Email templates.
- Dashboard admin.
- Dashboard manager.
- Dashboard agent.
- Revenue report.
- Lead report.
- Commission report.
- Export CSV/Excel.

Deliverables:

- He thong co goc nhin quan tri va bao cao thuc te.

## Phase 10 - Production Hardening

Tasks:

- Test coverage core modules.
- Integration tests with Testcontainers.
- Docker production image.
- CI/CD.
- Actuator health/metrics.
- Logging standard.
- Security review.
- Performance index review.
- API documentation clean-up.

Deliverables:

- San sang demo nhu mot backend production-grade.

## 12. MVP Scope

Neu can ban demo manh truoc, nen lam MVP theo thu tu:

1. Auth JWT + role Admin/Manager/Agent/Customer.
2. Property CRUD + upload image.
3. Listing approval + public search.
4. Customer + Lead CRM.
5. Appointment booking.
6. AI listing description.
7. AI property recommendation.
8. Dashboard co ban.

MVP nay da du thuc te, co business flow ro rang va co diem nhan AI.

## 13. Suggested First Implementation Order

Thu tu code nen lam ngay:

1. Tao branch moi: `feature/real-estate-rebuild`.
2. Refactor package va artifact name.
3. Them Flyway va tao schema auth.
4. Them Spring Security JWT.
5. Tao common response/error.
6. Tao module property.
7. Tao module listing.
8. Tao module customer/lead.
9. Tao module AI basic.

## 14. Definition of Done

Moi feature chi xem la xong khi:

- Co migration database.
- Co entity/repository/service/controller.
- Co DTO request/response.
- Co validation.
- Co authorization rule.
- Co Swagger documentation.
- Co unit test hoac integration test phu hop.
- Co error handling.
- Co audit log neu la action quan trong.
- Co pagination neu la list API.

## 15. Notes for Current Repository

Project hien tai co the duoc dung lam diem bat dau, nhung nen refactor manh:

- Dang co `Building`, `District`, `RentArea` theo bai hoc cu.
- Nen thay `Building` bang domain rong hon la `Property`.
- Nen bo dan JDBC repository thu cong, chuyen sang Spring Data JPA.
- Nen thay `Map<String, String>` search request bang request DTO ro rang.
- Nen doi package `com.javaweb` thanh `com.realestate`.
- Nen them migration de khong phu thuoc vao database tao tay.
- Nen viet lai README theo product moi.
