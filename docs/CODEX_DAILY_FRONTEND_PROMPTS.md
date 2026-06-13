# Daily Prompts for Frontend Development

Tai lieu nay chia prompt theo tung ngay de phat trien frontend cho Real Estate
Management dua tren:

```text
docs/API_FRONTEND_REFERENCE.md
docs/FRONTEND_DEVELOPMENT_PLAN.md
docs/REAL_ESTATE_MANAGEMENT_PLAN.md
DESIGN.md
tailwind.theme.json
```

Mac dinh moi prompt deu yeu cau:

- Doc plan, API reference va DESIGN.md truoc khi lam.
- Kiem tra branch hien tai.
- Chi sua file lien quan task frontend dang lam.
- Khong revert thay doi local khong lien quan.
- Neu co thay doi UI, phai ap dung token/guardrail trong DESIGN.md thay vi tu
  nghi palette, radius, shadow, spacing moi.
- Chay verification phu hop sau khi implement, toi thieu gom `npm run
  design:lint` va `npm run build` neu co thay doi UI.
- Sau moi ngay/task phai commit va push len branch hien tai.

Neu khong muon commit/push, hay noi ro truoc khi bat dau ngay do; mac dinh la phai commit va push.

## Branch va quy tac commit

Branch lam viec de xuat:

```text
breakthrough
```

Quy tac:

- Moi ngay nen co mot task ro rang, khong gom qua nhieu module.
- Moi task nen co mot commit rieng.
- Khong commit `.env`, secret, token, file IDE/local khong lien quan.
- Truoc commit can chay `git status --short` va `git diff --stat`.
- Sau khi verification pass, bat buoc commit va push len branch hien tai.

Commit message nen theo conventional style:

```text
feat(auth): add login and route guards
feat(property): add property image management
feat(listing): add public listing search
fix(api): handle refresh token queue
docs(frontend): add daily prompts
```

## DESIGN.md workflow bat buoc

Moi ngay co thay doi giao dien phai xem `DESIGN.md` nhu source of truth ve
visual identity. Khong chi doc qua loa; can doi chieu UI da lam voi cac token va
quy tac trong file nay.

Lenh can dung:

```text
npm run design:lint
npm run design:export
npm run build
```

`npm run design:export` can chay lai bat cu khi nao `DESIGN.md` thay doi hoac
khi task can dong bo token sang `tailwind.theme.json`.

Quy tac khi thiet ke UI:

- Dung design tokens tu `DESIGN.md` va `tailwind.theme.json` cho mau, spacing,
  radius, typography; khong tao mot he mau tuy y.
- Giao dien phai theo huong "Architectural Minimalism" va "Journalistic
  Gravitas": it trang tri, uu tien du lieu ro rang, co khoang tho, khong dung
  gradient/orb/shadow day mau sac.
- `primary #0B192C` dung cho brand/sidebar/heading quan trong.
- `secondary #4A5568` dung cho metadata, icon, caption, text phu.
- `tertiary #10B981` chi dung cho action tao gia tri that su, vi du chot coc,
  mark signed, completed/won action; khong lam mau accent tran lan.
- Button/input giu radius nho theo token `sm`; card/kanban column dung radius
  lon hon theo token `lg`.
- Khong dung border-radius 9999px cho button neu DESIGN.md khong yeu cau.
- Han che border va shadow nang; uu tien phan tach bang whitespace, nen
  `neutral-light`, va shadow rat nhe.
- Bang, dashboard, CRM, kanban phai nhin nhu san pham doanh nghiep that: data
  dense nhung de scan, khong phai landing page marketing.
- Text dung Sentence case; khong viet hoa toan bo label/table header neu khong
  phai label-caps token co chu dich.
- Sau khi lam UI, tu review de loai bo dau hieu "AI-generated UI": mau loe loet,
  card long nhau, icon thua, headline qua lon trong dashboard, spacing vo ky
  luat, shadow qua day, background gradient trang tri.

Neu `npm run design:lint` fail, phai sua `DESIGN.md` hoac cach ap dung token
truoc khi commit, khong duoc bo qua.

## Day 1 - Project Foundation

```text
/goal Hoan thanh Day 1 - Frontend Project Foundation. Doc docs/FRONTEND_DEVELOPMENT_PLAN.md, docs/API_FRONTEND_REFERENCE.md, docs/REAL_ESTATE_MANAGEMENT_PLAN.md va DESIGN.md, kiem tra branch hien tai. Sau do khoi tao hoac hoan thien React + TypeScript + Vite frontend foundation, tao cau truc thu muc app/shared/features, cau hinh router, providers, PublicLayout, AuthenticatedLayout va shared UI primitives co ban. Giu style chuyen nghiep phu hop ung dung doanh nghiep bat dong san. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push len branch hien tai.
```

## Day 2 - API Client and Auth Store

```text
/goal Hoan thanh Day 2 - API Client and Auth Store. Doc docs/API_FRONTEND_REFERENCE.md, docs/FRONTEND_DEVELOPMENT_PLAN.md va DESIGN.md. Implement API client cho backend response format: base URL /api/v1, unwrap ApiResponse.data, bearer token interceptor, refresh token khi 401, refresh queue de tranh race condition, normalized error shape { code, message, fieldErrors }, query builder bo qua null/undefined/empty string, va upload helper dung FormData. Tao auth store gom accessToken, refreshToken, expiresInSeconds va currentUser. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 3 - Login, Register, Route Guards

```text
/goal Hoan thanh Day 3 - Authentication Screens and Route Guards. Doc API reference, frontend plan va DESIGN.md. Xay /login va /register voi React Hook Form + Zod, ket noi /auth/login, /auth/register, /auth/me, /auth/logout va /auth/refresh-token. Sau login lay current user va dieu huong ve /dashboard. Tao ProtectedRoute, RoleGuard, user menu, logout flow va sidebar/topbar hien menu theo role ADMIN, MANAGER, AGENT, CUSTOMER. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 4 - Public Listing Search

```text
/goal Hoan thanh Day 4 - Public Listing Search. Doc API reference phan public search va DESIGN.md. Xay route / cho guest search listing da publish bang /api/v1/search/listings. UI can co keyword, purpose SALE/RENT, price range, area range, bedrooms/bathrooms, sort, pagination, listing cards co cover image, gia, dia chi, dien tich, phong ngu, phong tam va status badge. Co loading, empty, error va retry state. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 5 - Public Listing Detail and Favorite

```text
/goal Hoan thanh Day 5 - Public Listing Detail and Favorite. Xay /listing/:slug bang /api/v1/search/listings/{slug}, gui X-Session-Id de backend ghi view. Detail page can co gallery, thong tin chinh, mo ta, tien ich, agent/contact block va favorite button neu user da login. Tich hop favorite/unfavorite va favorites list neu role duoc phep. Dam bao mobile responsive va khong goi endpoint khong ton tai. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 6 - Role Dashboard and Notifications

```text
/goal Hoan thanh Day 6 - Dashboard and Notifications. Xay /dashboard theo role: ADMIN dung /dashboard/admin, MANAGER dung /dashboard/manager, AGENT dung /dashboard/agent, CUSTOMER hien favorite/AI/appointment shortcuts neu co du lieu. Them /notifications, unread badge bang polling /notifications/unread-count, list notification, mark read va read all. UI can co skeleton, empty state, retry va khong crash khi response thieu field. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 7 - Property List and Detail

```text
/goal Hoan thanh Day 7 - Property List and Detail. Xay /properties va /properties/:id cho AGENT, MANAGER, ADMIN. Dung /api/v1/properties de search/list/detail. Danh sach can co keyword/filter/status/purpose/pagination/sorting. Detail can hien basic info, price, address, legal status, furniture status, direction, owner, assigned agent, images va status workflow summary. Xu ly 403, 404, 5xx dung. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 8 - Property Create and Edit

```text
/goal Hoan thanh Day 8 - Property Create and Edit. Xay /properties/new va /properties/:id/edit theo PropertyUpsertRequest trong docs/API_FRONTEND_REFERENCE.md. Form dung React Hook Form + Zod, chia section basic info, price/area, address, attributes, legal, amenities va assignment. Dam bao number parsing, date yyyy-MM-dd, currency uppercase, field validation error mapping tu backend. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 9 - Property Images and Status

```text
/goal Hoan thanh Day 9 - Property Images and Status Workflow. Them image management vao property detail: upload multipart POST /properties/{propertyId}/images, list images, delete image, set cover image, altText va displayOrder. Them action PATCH /properties/{propertyId}/status voi confirm dialog. Invalidate property/images dung sau moi action. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 10 - Listing Create and Edit

```text
/goal Hoan thanh Day 10 - Listing Create and Edit. Xay module listings theo API reference. Luu y backend chua co GET /api/v1/listings va GET /api/v1/listings/{id} noi bo, nen khong goi endpoint khong ton tai. Tao /listings/new de create listing tu property theo ListingCreateRequest, co SEO fields, purpose, visibility, askingPrice, currency va listingPackageId. Sau create/update, giu response trong query cache hoac local workflow state de user tiep tuc action. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 11 - Listing Workflow and AI Description

```text
/goal Hoan thanh Day 11 - Listing Workflow and AI Description. Them cac action listing: submit, approve, reject, publish, unpublish theo role AGENT, MANAGER, ADMIN va status hien tai. Reject can co reason. Tich hop POST /api/v1/ai/listing-description de sinh/cai thien description va SEO content; AI output chi la goi y, user phai duoc sua truoc khi submit. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 12 - Customer CRM

```text
/goal Hoan thanh Day 12 - Customer CRM. Xay /customers, /customers/new va /customers/:id bang /api/v1/customers. Co search/list/pagination, create/update form, detail profile, notes, requirements va timeline. Dam bao rule can co it nhat mot trong email, phone, userId. Tich hop GET /api/v1/ai/customers/{customerId}/summary va POST /api/v1/ai/customers/{customerId}/recommendations voi fallback UI khi AI noop/error. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 13 - Lead Pipeline

```text
/goal Hoan thanh Day 13 - Lead Pipeline. Xay /leads va /leads/:id bang /api/v1/leads. Co list/table, pipeline board theo LeadPipelineStatus, detail lead, assign agent, update status, add note, add activity va create follow-up task. Tich hop POST /api/v1/ai/leads/{leadId}/score. Dam bao invalidation board/list/detail dung sau action. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 14 - Appointment Calendar

```text
/goal Hoan thanh Day 14 - Appointment Calendar. Xay /appointments, /appointments/my va /appointments/:id bang /api/v1/appointments. Co calendar view, list view, create appointment, confirm, cancel, reschedule, complete va viewing feedback. Dam bao date-time ISO-8601, timezone hien thi hop ly, status badge, confirm dialog va conflict warning tren UI neu lich moi trung lich da load. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 15 - Contract Management

```text
/goal Hoan thanh Day 15 - Contract Management. Xay /contracts va /contracts/:id bang /api/v1/contracts. Co list/search/detail/create/update, upload document multipart, submit-review, approve, mark-signed va cancel. Detail can co status timeline, documents, parties/metadata neu response co, action button theo role va status. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 16 - Transaction and Payment Records

```text
/goal Hoan thanh Day 16 - Transaction and Payment Records. Xay /transactions va /transactions/:id bang /api/v1/transactions. Co list/search/detail, update status, add deposit, payment schedules, payments, invoices va receipts. Payment la record nghiep vu offline/external, khong phai online payment gateway. Dung idempotencyKey cho request tao deposit/payment neu co retry. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 17 - Commission and Rules

```text
/goal Hoan thanh Day 17 - Commission and Commission Rules. Xay /commissions va /commission-rules. AGENT xem /commissions/my. MANAGER va ADMIN xem /commissions, mark paid bang PATCH /commissions/{commissionId}/mark-paid, va quan ly /commission-rules create/search/update. UI can co status, amount, transaction link, agent info, confirm mark-paid va role-based actions. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 18 - Reports

```text
/goal Hoan thanh Day 18 - Reports. Xay /reports cho MANAGER va ADMIN bang /api/v1/reports/revenue, /reports/leads, /reports/transactions va /reports/commissions. Co date range filter, summary cards, charts bang Recharts va data table. Khi date range doi thi refetch/invalidate dung. Chart can co empty state va khong vo layout tren mobile. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 19 - Admin Users and Audit Logs

```text
/goal Hoan thanh Day 19 - Admin Users and Audit Logs. Xay /admin/users va /admin/audit-logs chi cho ADMIN. User management dung /api/v1/admin/users: list, detail, patch status, put roles. Audit logs dung /api/v1/audit-logs: search va detail drawer. Co filters, pagination, confirm dialog cho action quan trong va khong lam mat role ngoai y muon khi assign roles. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 20 - AI Chat and Image Analysis

```text
/goal Hoan thanh Day 20 - AI Chat and Image Analysis. Xay /ai gom create chat session, send message, get session/messages bang /api/v1/ai/chat/sessions. Tich hop POST /api/v1/ai/property-images/analyze o property image UI. Tat ca AI output can hien nhu goi y cho user copy/apply/edit, khong auto-submit vao workflow chinh va khong dua ket luan phap ly/tai chinh nhu chuyen gia. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 21 - End-to-End Demo Flow

```text
/goal Hoan thanh Day 21 - End-to-End Frontend Demo Flow. Doc muc demo flow trong docs/API_FRONTEND_REFERENCE.md va DESIGN.md va chay qua toan bo flow frontend: login admin, agent tao property, upload image, set cover, doi AVAILABLE, tao listing, submit, manager approve, publish, guest search, customer favorite, agent tao customer/lead, appointment, contract, transaction, commission/report/dashboard. Sua cac diem dut gay tren frontend. Neu backend thieu API thi ghi ro limitation va khong goi endpoint khong ton tai. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 22 - Production Polish

```text
/goal Hoan thanh Day 22 - Production Polish. Review toan bo frontend theo tieu chuan ung dung doanh nghiep: layout gon, data dense nhung de scan, responsive desktop/tablet/mobile, text khong overflow, status label tieng Viet, loading/empty/error states, accessibility co ban, keyboard/focus state, consistent spacing va color system. Sua cac diem UX/code quality uu tien cao. Chay `npm run design:lint`, `npm run build`, lint/test neu co script, sau do phai commit va push.
```

## Day 23 - Test Coverage and Refactor

```text
/goal Hoan thanh Day 23 - Frontend Test Coverage and Refactor. Review codebase de tim duplication lon, API contract mismatch, auth/session bug, type any khong can thiet, component qua phuc tap va missing tests cho critical flows. Them test cho api client, auth refresh flow, route guards va critical forms neu project co test setup. Giu refactor trong pham vi can thiet. Chay `npm run design:lint`, `npm run build` va verification phu hop, sau do phai commit va push.
```

## Day 24 - Final Stabilization

```text
/goal Hoan thanh Day 24 - Final Frontend Stabilization. Doc DESIGN.md, docs/API_FRONTEND_REFERENCE.md va docs/FRONTEND_DEVELOPMENT_PLAN.md. Chay full verification frontend gom npm run design:lint, npm run build va lint/test neu co script. Review git status, review docs, sua loi build/lint/test, don warning nghiem trong, kiem tra route guard va API hooks khong goi endpoint thieu. Dam bao frontend san sang demo voi backend local http://localhost:8081. Neu co thay doi thi phai commit va push.
```

## Bonus Prompt - Continue From Last Failed Task

Dung khi hom truoc dang lam do dang hoac build fail.

```text
/goal Tiep tuc task frontend dang do dang gan nhat. Doc docs/API_FRONTEND_REFERENCE.md, docs/FRONTEND_DEVELOPMENT_PLAN.md, DESIGN.md va docs/CODEX_DAILY_FRONTEND_PROMPTS.md. Kiem tra git status va branch hien tai, xac dinh thay doi dang co, chay verification de tim loi, sau do sua den khi task hoan thanh. Khi xong, phai commit va push.
```

## Bonus Prompt - Review Before Starting Next Day

Dung khi muon kiem tra chat luong truoc khi lam tiep.

```text
Review repo frontend hien tai theo vai tro code reviewer. Tap trung vao bug, auth/session risk, API contract mismatch voi docs/API_FRONTEND_REFERENCE.md, architecture drift so voi docs/FRONTEND_DEVELOPMENT_PLAN.md, missing loading/error state, missing tests va file local bi commit nham. Chi dua findings, chua sua code.
```

## Bonus Prompt - Fix Build or Runtime Error

Dung khi build, lint, test hoac dev server dang loi.

```text
/goal Sua loi frontend hien tai. Doc log/stack trace, DESIGN.md neu loi lien quan UI/design, xac dinh root cause, sua toi thieu can thiet, khong refactor ngoai pham vi loi. Sau do chay lai lenh verification phu hop den khi pass, bao gom npm run design:lint neu co thay doi UI. Neu loi do backend thieu API hoac backend chua chay, ghi ro limitation. Khi xong phai commit va push.
```

## Bonus Prompt - Commit Checklist

Dung truoc khi yeu cau commit.

```text
Kiem tra git status, git diff --stat va tom tat nhung file da thay doi. Xac nhan khong co secret, file local/IDE khong lien quan, endpoint khong ton tai, thay doi ngoai task, hoac UI lech DESIGN.md. Neu on, de xuat commit message conventional ngan gon, sau do commit va push len branch hien tai.
```



