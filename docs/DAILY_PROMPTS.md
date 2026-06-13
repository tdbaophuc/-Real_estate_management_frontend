# Daily Prompts for Real Estate Management Development

Tai lieu nay chia san prompt theo tung ngay de phat trien du an theo `docs/REAL_ESTATE_MANAGEMENT_PLAN.md`.

Mac dinh moi prompt deu yeu cau:

- Doc plan va workflow truoc khi lam.
- Kiem tra branch hien tai la `breakthrough`.
- Chi sua file lien quan task.
- Chay verification phu hop.
- Commit va push len branch `breakthrough` sau khi task hoan thanh.

Neu ban chua muon commit/push trong ngay nao, hay xoa cau "commit va push" khoi prompt cua ngay do.

## Day 1 - Project Foundation

```text
/goal Hoan thanh Day 1 - Project Foundation. Doc docs/REAL_ESTATE_MANAGEMENT_PLAN.md va docs/DAILY_DEVELOPMENT_WORKFLOW.md, kiem tra branch hien tai la breakthrough. Sau do refactor nen tang du an cho Real Estate Management: tao common API response, common error response, base exception, global exception handler, validation error format, va package common can thiet. Giu thay doi gon trong pham vi foundation, chay mvn test hoac mvn -DskipTests package, sau do commit va push len branch breakthrough.
```

## Day 2 - Swagger, YAML Config, Profiles

```text
/goal Hoan thanh Day 2 - Swagger and Config. Doc plan va workflow, kiem tra branch breakthrough. Chuyen cau hinh tu application.properties sang application.yml neu phu hop, tao profile dev/test/uat/prod, them OpenAPI/Swagger dependency va config, dam bao Swagger UI truy cap duoc khi app chay. Chay verification phu hop, commit va push len branch breakthrough.
```

## Day 3 - Flyway Skeleton and Database Baseline

```text
/goal Hoan thanh Day 3 - Flyway Skeleton. Doc plan va workflow, kiem tra branch breakthrough. Them Flyway vao project, tao thu muc db/migration, tao migration baseline cho auth/user schema toi thieu, dam bao app co the start voi migration. Khong tao qua nhieu bang ngoai pham vi auth baseline. Chay build/test, commit va push len branch breakthrough.
```

## Day 4 - Auth Schema and Seed Data

```text
/goal Hoan thanh Day 4 - Auth Schema and Seed Data. Doc plan va workflow, kiem tra branch breakthrough. Tao schema day du cho users, roles, permissions, user_roles, role_permissions, refresh_tokens, otp_tokens neu chua co. Them seed data cho roles ADMIN, MANAGER, AGENT, CUSTOMER, OWNER va admin account mac dinh theo cach an toan cho dev. Chay verification, commit va push len branch breakthrough.
```

## Day 5 - Auth Entities and Repositories

```text
/goal Hoan thanh Day 5 - Auth Entities and Repositories. Doc plan va workflow, kiem tra branch breakthrough. Implement entity va repository cho User, Role, Permission, RefreshToken, OtpToken. Dam bao mapping JPA dung voi Flyway schema, khong dung JDBC thu cong cho module moi. Them enum/status can thiet va test repository neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 6 - JWT Login Flow

```text
/goal Hoan thanh Day 6 - JWT Login Flow. Doc plan va workflow, kiem tra branch breakthrough. Implement Spring Security JWT login flow gom login API, password encoder, UserDetailsService, JWT service, authentication filter, security config, current user endpoint /api/v1/auth/me. Them DTO request/response va validation. Chay test/build, commit va push len branch breakthrough.
```

## Day 7 - Register, Refresh Token, Logout

```text
/goal Hoan thanh Day 7 - Register Refresh Logout. Doc plan va workflow, kiem tra branch breakthrough. Implement register API, refresh token API va logout/revoke refresh token. Dam bao duplicate email/phone duoc handle bang business exception. Them validation va test service neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 8 - User Management and Authorization Rules

```text
/goal Hoan thanh Day 8 - User Management Authorization. Doc plan va workflow, kiem tra branch breakthrough. Implement API quan ly user cho Admin/Manager: list users co pagination, get user detail, update status, assign roles. Them @PreAuthorize hoac security rules phu hop. Dam bao user thuong khong truy cap API admin. Chay verification, commit va push len branch breakthrough.
```

## Day 9 - Property Database Schema

```text
/goal Hoan thanh Day 9 - Property Database Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao Flyway migration cho property module gom properties, property_types, amenities, property_amenities, property_images, property_legal_documents, addresses, provinces, districts, wards neu phu hop. Chi tao schema va seed master data co ban, chua can API day du. Chay verification, commit va push len branch breakthrough.
```

## Day 10 - Property Entities and Repositories

```text
/goal Hoan thanh Day 10 - Property Entities Repositories. Doc plan va workflow, kiem tra branch breakthrough. Implement JPA entities va repositories cho property module theo schema Day 9. Dam bao relationship, enum, audit fields, lazy loading va indexes phu hop. Chay build/test, commit va push len branch breakthrough.
```

## Day 11 - Property Create and Update APIs

```text
/goal Hoan thanh Day 11 - Property Create Update APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement create/update property API voi request DTO, response DTO, mapper, validation, service business rules va authorization cho Agent/Manager/Admin. Chay verification, commit va push len branch breakthrough.
```

## Day 12 - Property Read, Delete, Status APIs

```text
/goal Hoan thanh Day 12 - Property Read Delete Status APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement get property detail, list properties co pagination, soft delete, va update property status. Dam bao authorization va error handling dung. Chay verification, commit va push len branch breakthrough.
```

## Day 13 - Property Search Filters

```text
/goal Hoan thanh Day 13 - Property Search Filters. Doc plan va workflow, kiem tra branch breakthrough. Implement search/filter property bang request DTO ro rang hoac JPA Specification: keyword, type, purpose, location, price range, area range, bedrooms, bathrooms, status. Co pagination va sorting. Chay verification, commit va push len branch breakthrough.
```

## Day 14 - File Storage Skeleton

```text
/goal Hoan thanh Day 14 - File Storage Skeleton. Doc plan va workflow, kiem tra branch breakthrough. Them module storage gom FileResource entity/schema, file upload service abstraction, local storage implementation cho dev, validate file size/type, upload endpoint co security. Chay verification, commit va push len branch breakthrough.
```

## Day 15 - Property Images

```text
/goal Hoan thanh Day 15 - Property Images. Doc plan va workflow, kiem tra branch breakthrough. Tich hop storage voi property images: upload image cho property, list images, delete image, set cover image. Dam bao chi owner agent/manager/admin co quyen sua anh property. Chay verification, commit va push len branch breakthrough.
```

## Day 16 - Listing Database Schema

```text
/goal Hoan thanh Day 16 - Listing Database Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao Flyway migration cho listings, listing_status_histories, listing_views, listing_favorites, listing_packages neu can. Dam bao listing tach rieng property va co status workflow. Chay verification, commit va push len branch breakthrough.
```

## Day 17 - Listing Entities and Repositories

```text
/goal Hoan thanh Day 17 - Listing Entities Repositories. Doc plan va workflow, kiem tra branch breakthrough. Implement JPA entities/repositories cho listing module, mapping voi property va user. Them enum status, purpose, visibility/package neu can. Chay build/test, commit va push len branch breakthrough.
```

## Day 18 - Listing Create and Edit

```text
/goal Hoan thanh Day 18 - Listing Create Edit. Doc plan va workflow, kiem tra branch breakthrough. Implement API tao listing tu property, sua title/description/price/public info, validate property phai ton tai va user co quyen. Listing moi nen o DRAFT. Chay verification, commit va push len branch breakthrough.
```

## Day 19 - Listing Review Workflow

```text
/goal Hoan thanh Day 19 - Listing Review Workflow. Doc plan va workflow, kiem tra branch breakthrough. Implement submit, approve, reject, publish, unpublish listing. Ghi listing status history va reason khi reject. Dam bao chi Manager/Admin duoc approve/reject. Chay verification, commit va push len branch breakthrough.
```

## Day 20 - Public Listing Search and Favorite

```text
/goal Hoan thanh Day 20 - Public Listing Search Favorite. Doc plan va workflow, kiem tra branch breakthrough. Implement public listing search chi tra listing PUBLISHED, co filter/pagination/sorting. Them favorite/unfavorite listing cho Customer va get my favorites. Them listing view count neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 21 - Customer Schema

```text
/goal Hoan thanh Day 21 - Customer Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao Flyway migration cho customers, customer_requirements, customer_tags, customer_notes, customer_favorite_listings neu can. Dam bao lien ket customer voi user neu customer co account. Chay verification, commit va push len branch breakthrough.
```

## Day 22 - Customer Management APIs

```text
/goal Hoan thanh Day 22 - Customer Management APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement CRUD customer, get customer detail, customer notes, customer requirements, va customer timeline co ban. Dam bao Agent/Manager/Admin authorization. Chay verification, commit va push len branch breakthrough.
```

## Day 23 - Lead Schema and Pipeline

```text
/goal Hoan thanh Day 23 - Lead Schema Pipeline. Doc plan va workflow, kiem tra branch breakthrough. Tao schema va entity cho leads, lead_sources, lead_assignments, lead_notes, lead_activities, follow_up_tasks. Dinh nghia enum pipeline status theo plan. Chay verification, commit va push len branch breakthrough.
```

## Day 24 - Lead APIs

```text
/goal Hoan thanh Day 24 - Lead APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement create/list/detail lead, assign lead cho agent, update lead status, add note, add activity, create follow-up task. Dam bao business rule va authorization. Chay verification, commit va push len branch breakthrough.
```

## Day 25 - Appointment Schema

```text
/goal Hoan thanh Day 25 - Appointment Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao schema/entity cho appointments, appointment_participants, viewing_feedbacks. Lien ket appointment voi customer, agent, property/listing. Chay verification, commit va push len branch breakthrough.
```

## Day 26 - Appointment APIs

```text
/goal Hoan thanh Day 26 - Appointment APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement create appointment, list my appointments, confirm, cancel, reschedule, complete, add viewing feedback. Co conflict check trung lich agent/property. Chay verification, commit va push len branch breakthrough.
```

## Day 27 - Notification Skeleton

```text
/goal Hoan thanh Day 27 - Notification Skeleton. Doc plan va workflow, kiem tra branch breakthrough. Them notification schema/module gom Notification, NotificationTemplate, EmailLog. Implement in-app notification APIs: list, unread count, mark read, mark all read. Chay verification, commit va push len branch breakthrough.
```

## Day 28 - Email and Reminder Jobs

```text
/goal Hoan thanh Day 28 - Email Reminder Jobs. Doc plan va workflow, kiem tra branch breakthrough. Them email service abstraction, dev implementation/logging, email templates co ban, va scheduled reminder cho appointment/follow-up task. Dam bao config theo profile. Chay verification, commit va push len branch breakthrough.
```

## Day 29 - Contract Schema

```text
/goal Hoan thanh Day 29 - Contract Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao schema/entity cho contracts, contract_parties, contract_documents, contract_templates, contract_signatures. Lien ket contract voi transaction/property/customer/owner neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 30 - Contract APIs

```text
/goal Hoan thanh Day 30 - Contract APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement create/list/detail/update contract, upload contract document, submit review, approve, mark signed, cancel. Dam bao status workflow va authorization. Chay verification, commit va push len branch breakthrough.
```

## Day 31 - Transaction and Payment Schema

```text
/goal Hoan thanh Day 31 - Transaction Payment Schema. Doc plan va workflow, kiem tra branch breakthrough. Tao schema/entity cho transactions, deposits, payments, payment_schedules, invoices, receipts, commissions, commission_rules. Chay verification, commit va push len branch breakthrough.
```

## Day 32 - Transaction APIs

```text
/goal Hoan thanh Day 32 - Transaction APIs. Doc plan va workflow, kiem tra branch breakthrough. Implement create/list/detail transaction, update status, add deposit, add payment, payment schedule, va basic invoice/receipt metadata. Chay verification, commit va push len branch breakthrough.
```

## Day 33 - Commission Calculation

```text
/goal Hoan thanh Day 33 - Commission Calculation. Doc plan va workflow, kiem tra branch breakthrough. Implement commission rules, calculate commission khi transaction completed, list my commissions, manager/admin list commissions, mark commission paid. Them unit tests cho calculation. Chay verification, commit va push len branch breakthrough.
```

## Day 34 - AI Provider Abstraction

```text
/goal Hoan thanh Day 34 - AI Provider Abstraction. Doc plan va workflow, kiem tra branch breakthrough. Them ai module skeleton gom AI provider interface, request/response DTO, AI request log schema/entity, config API key theo env, timeout/error handling, va service abstraction. Chua can goi provider that neu chua co key. Chay verification, commit va push len branch breakthrough.
```

## Day 35 - AI Listing Description

```text
/goal Hoan thanh Day 35 - AI Listing Description. Doc plan va workflow, kiem tra branch breakthrough. Implement AI listing description generator: input tu property/listing data, prompt builder, response title/short description/full description/SEO keywords, log request/response, fallback khi AI loi. Chay verification, commit va push len branch breakthrough.
```

## Day 36 - AI Property Recommendation

```text
/goal Hoan thanh Day 36 - AI Property Recommendation. Doc plan va workflow, kiem tra branch breakthrough. Implement recommendation cho customer: rule-based filter truoc, AI ranking/explanation sau neu provider san sang. API tra listing, match score, reason, suggested action. Chay verification, commit va push len branch breakthrough.
```

## Day 37 - AI Lead Scoring

```text
/goal Hoan thanh Day 37 - AI Lead Scoring. Doc plan va workflow, kiem tra branch breakthrough. Implement AI lead scoring: lay du lieu lead/customer/activity/appointment, tinh score 0-100, priority, reason, suggested follow-up. Co fallback rule-based neu AI provider unavailable. Them test cho fallback logic. Chay verification, commit va push len branch breakthrough.
```

## Day 38 - AI Chatbot Session Skeleton

```text
/goal Hoan thanh Day 38 - AI Chatbot Session Skeleton. Doc plan va workflow, kiem tra branch breakthrough. Tao schema/entity cho ai_conversations va ai_messages, implement create chat session, send message, get session messages. Them guardrails co ban va log AI request. Chay verification, commit va push len branch breakthrough.
```

## Day 39 - AI Customer Summary and Image Analysis Skeleton

```text
/goal Hoan thanh Day 39 - AI Customer Summary Image Analysis. Doc plan va workflow, kiem tra branch breakthrough. Implement AI customer summary endpoint va skeleton image analysis endpoint cho property images. Neu chua goi vision provider that, tao provider abstraction va fallback response ro rang. Chay verification, commit va push len branch breakthrough.
```

## Day 40 - Dashboard Admin and Manager

```text
/goal Hoan thanh Day 40 - Dashboard Admin Manager. Doc plan va workflow, kiem tra branch breakthrough. Implement dashboard APIs cho Admin va Manager: total users, properties, listings, pending listings, leads by status, transactions, revenue summary, top agents neu co data. Chay verification, commit va push len branch breakthrough.
```

## Day 41 - Dashboard Agent and Reports

```text
/goal Hoan thanh Day 41 - Dashboard Agent Reports. Doc plan va workflow, kiem tra branch breakthrough. Implement dashboard Agent gom my leads, today appointments, follow-up tasks, active transactions, my commissions. Them reports co ban cho revenue, leads, transactions, commissions voi date range. Chay verification, commit va push len branch breakthrough.
```

## Day 42 - Audit Log

```text
/goal Hoan thanh Day 42 - Audit Log. Doc plan va workflow, kiem tra branch breakthrough. Them audit log schema/module va ghi audit cho action quan trong: user role/status change, listing approve/reject, transaction status, contract status, commission paid. Them API tra cuu audit cho Admin. Chay verification, commit va push len branch breakthrough.
```

## Day 43 - Docker Compose Local Development

```text
/goal Hoan thanh Day 43 - Docker Compose Local Development. Doc plan va workflow, kiem tra branch breakthrough. Tao docker-compose cho app dependencies: database, redis, minio, mailhog neu phu hop. Cap nhat application-dev config va README huong dan chay local. Chay verification phu hop, commit va push len branch breakthrough.
```

## Day 44 - Integration Tests Foundation

```text
/goal Hoan thanh Day 44 - Integration Tests Foundation. Doc plan va workflow, kiem tra branch breakthrough. Them Testcontainers setup cho database, tao integration test foundation cho auth va property/listing flow quan trong. Dam bao test co the chay bang mvn test. Commit va push len branch breakthrough.
```

## Day 45 - Security Hardening

```text
/goal Hoan thanh Day 45 - Security Hardening. Doc plan va workflow, kiem tra branch breakthrough. Review security: CORS, CSRF config cho REST, password policy, token expiration, refresh token revoke, method authorization, sensitive logging, file upload validation, AI API rate limit. Sua cac diem thieu va them test neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 46 - Performance and Index Review

```text
/goal Hoan thanh Day 46 - Performance Index Review. Doc plan va workflow, kiem tra branch breakthrough. Review cac query search/list/report, them database indexes can thiet qua Flyway migration, toi uu pagination/sorting, them cache cho master data neu phu hop. Chay verification, commit va push len branch breakthrough.
```

## Day 47 - API Documentation Cleanup

```text
/goal Hoan thanh Day 47 - API Documentation Cleanup. Doc plan va workflow, kiem tra branch breakthrough. Review Swagger/OpenAPI annotations, API naming, response format, error codes, examples. Cap nhat docs neu can de nguoi khac co the test API. Chay verification, commit va push len branch breakthrough.
```

## Day 48 - README Rewrite

```text
/goal Hoan thanh Day 48 - README Rewrite. Doc plan va workflow, kiem tra branch breakthrough. Viet lai README theo Real Estate Management moi: overview, features, tech stack, setup local, profiles, database migration, API docs, development workflow, AI features. Luu y dung ASCII hoac dam bao encoding UTF-8 khong loi. Commit va push len branch breakthrough.
```

## Day 49 - End-to-End Demo Flow

```text
/goal Hoan thanh Day 49 - End-to-End Demo Flow. Doc plan va workflow, kiem tra branch breakthrough. Tao seed data va kiem tra flow demo: admin login, tao agent, tao property, upload image, tao listing, approve/publish, customer search/favorite, tao lead, dat appointment, tao transaction. Sua loi neu co, chay verification, commit va push len branch breakthrough.
```

## Day 50 - Final Stabilization

```text
/goal Hoan thanh Day 50 - Final Stabilization. Doc plan va workflow, kiem tra branch breakthrough. Chay full test/build, review git status, review docs, sua loi build/test, don cac warning nghiem trong, dam bao branch breakthrough san sang demo. Commit va push len branch breakthrough neu co thay doi.
```

## Bonus Prompt - Continue From Last Failed Task

Dung khi hom truoc dang lam do dang hoac build fail.

```text
/goal Tiep tuc task dang do dang gan nhat. Doc docs/REAL_ESTATE_MANAGEMENT_PLAN.md, docs/DAILY_DEVELOPMENT_WORKFLOW.md va docs/DAILY_PROMPTS.md. Kiem tra git status va branch breakthrough, xac dinh thay doi dang co, chay verification de tim loi, sau do sua den khi task hoan thanh. Khi xong, commit va push len branch breakthrough.
```

## Bonus Prompt - Review Before Starting Next Day

Dung khi muon kiem tra chat luong truoc khi lam tiep.

```text
Review repo hien tai theo vai tro code reviewer. Tap trung vao bug, security risk, architecture drift so voi docs/REAL_ESTATE_MANAGEMENT_PLAN.md, missing tests, va file local bi commit nham. Chi dua findings, chua sua code.
```

