# Goal Commands For Stitch API Frontend Refactor

File nay chua cac lenh `/goal` de thuc hien `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md`.

Nguyen tac bat buoc cho moi goal:

- Truoc khi lam, doc `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md` va `docs/API_REFERENCE.md`.
- Neu goal co lien quan UI, doc/doi chieu Stitch project `6397110572098939351` va cac screen lien quan.
- Khong copy topbar/sidebar tu Stitch; app shell phai la source of truth trong codebase.
- Moi goal phai chay verification phu hop, toi thieu `npm run lint` hoac `npm run build` neu co sua TypeScript/UI.
- Sau khi xay dung UI va test API xong, phai so sanh workspace voi thiet ke Stitch. Neu khong chac da giong dung tinh than thiet ke, phai hoi toi xac nhan. Chi hoan thanh goal khi toi dong y hoac khi da sua theo bo sung cua toi.
- Khong chia goal qua nho. Moi goal phai tao ra mot cum chuc nang su dung duoc, co API integration, UI state va verification.

## Goal 1 - Baseline, API coverage matrix va refactor boundary

```text
/goal Hoan thanh baseline va API coverage matrix cho frontend refactor theo Stitch. Doc `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md`, `docs/API_REFERENCE.md`, Stitch project `6397110572098939351`, va cau truc hien tai trong `src`. Chay baseline `npm run lint` va `npm run build` neu co the, ghi lai loi hien co neu fail. Tao `docs/API_COVERAGE_MATRIX.md` tu 146 endpoints, voi cot method/path/domain/frontend api function/UI route/status/gap/action. So sanh tat ca file `*Api.ts` hien co voi API reference de phan loai: da dung, sai payload/response, thieu wrapper, co wrapper nhung chua co UI, co UI nhung chua goi API that. Ket thuc goal bang mot danh sach thu tu refactor theo domain va cac rui ro can chu y. Khong sua UI lon trong goal nay. Chay verification phu hop va neu co thay doi docs thi commit/push neu workflow hien tai yeu cau.
```

## Goal 2 - Shared API foundation, auth, files va master data

```text
/goal Hoan thanh nen tang API dung chung cho frontend. Dua `src/shared/api/client.ts`, shared types va query conventions ve dung contract trong `docs/API_REFERENCE.md`: `ApiResponse<T>`, `PageResponse<T>`, error normalization, auth header, refresh token, logout khi token invalid, upload/download helper va query params builder. Sau do audit va hoan thien cac API wrappers cho Authentication, Files va Master Data, bao gom login/register/logout/me/refresh/profile/avatar/password/sessions, upload/get/delete/access-level/download file, provinces/districts/wards/property-types/amenities/listing-packages/lead-sources. Cap nhat cac UI lien quan nhu login/register/account/profile/avatar/session management va cac select master data trong form quan trong neu chua noi API that. Dam bao loading/error/empty states va invalidation ro rang. Chay `npm run lint` va `npm run build`. Neu co UI thay doi, so sanh voi style Stitch `Stellar Institutional Estate`; neu khong chac do dong bo visual, hoi toi truoc khi xem la hoan thanh.
```

## Goal 3 - App shell va design system tokens theo Stitch

```text
/goal Refactor app shell va design system tokens theo Stitch nhung khong copy topbar/sidebar generated. Doc design theme trong Stitch project `6397110572098939351` va `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md`. Cap nhat CSS variables/global styles de phan anh surface off-white, navy/royal-blue actions, border-subtle, status colors, Inter typography roles, spacing va radius nho. Refactor `AuthenticatedLayout`, navigation va workspace container de co sidebar desktop, icon/collapsed behavior tren tablet neu phu hop, mobile drawer, topbar gon co notification/language/user/AI assistant. Tao hoac chuan hoa reusable UI primitives can dung cho cac man hinh sau: `PageHeader`, `SectionCard`, `MetricCard`, `DataTable`, `StatusBadge`, `Timeline`, `DetailGrid`, `ActionBar`, `Drawer/FormDialog`, `KanbanBoard` skeleton va `CalendarGrid` skeleton neu can. Dam bao khong pha route hien co va role visibility. Chay `npm run lint` va `npm run build`. Sau khi UI xong, so sanh app shell/workspace voi Stitch, neu khong chac muc do giong, hoi toi xac nhan hoac xin bo sung truoc khi hoan thanh.
```

## Goal 4 - Properties, images, legal documents va listing workflow

```text
/goal Hoan thanh cum Properties, Property Detail, Manage Property Images va Listing Workflow theo API va Stitch. Audit va bo sung `propertyApi`, `listingApi`, `publicListingApi`, `fileApi`, va master-data usage de bao phu properties CRUD/status/images/cover-image/reorder/update/delete/legal-documents/verify, listings CRUD/detail/submit/approve/reject/publish/unpublish/favorite, public search/detail/inquiry/appointment-request. Refactor `/properties`, `/properties/new`, `/properties/:id`, va form edit de dung API that, master data select va UI states day du. Lam workspace `/properties/:id` bam sat `Property Detail - AssetManager Pro` va `Manage Property Images - AssetManager Pro`: overview, image manager, cover image, upload/reorder/metadata/delete, legal documents, verify workflow va AI image analysis neu endpoint da san sang. Them route/detail UI `/listings/:id` neu dang thieu, bam sat `Listing Detail & Workflow - AssetManager Pro`, gom workflow status actions, review queue integration, publish lifecycle va AI listing description generator. Chay `npm run lint` va `npm run build`; test thu cac API action chinh bang UI hoac API wrapper neu backend san sang. Sau khi xay dung UI va test API xong, so sanh cac workspace voi screen Stitch tuong ung; neu khong chac giong, hoi toi xac nhan, neu toi chua dong y thi sua theo bo sung truoc khi ket thuc.
```

## Goal 5 - Customers, Leads, Trello pipeline, tasks va AI insights

```text
/goal Hoan thanh cum CRM, Leads, Follow-up Tasks va AI insights theo API va Stitch. Audit va bo sung `customerApi`, `leadApi`, `followUpTaskApi`, `aiApi` de bao phu customers CRUD/notes/pin/requirements/tags/timeline, leads list/create/detail/activities/assign/follow-up-tasks/notes/status, follow-up-tasks list/my/detail/update/delete/status, AI customer summary/recommendations va lead score. Refactor `/customers`, `/customers/:id`, `/leads`, `/leads/:id`, `/follow-up-tasks` de goi API that, co filter/pagination/loading/error/empty states va mutation invalidation. Lam `Customer CRM Detail` thanh workspace CRM dung: profile summary, requirements, tags, pinned notes, timeline, AI recommendations. Lam `Lead Pipeline & Tasks (Restored)` tren `/leads` voi board dang Trello, columns theo status, task/lead cards, detail drawer, va drag/drop doi status neu cai `@dnd-kit` la hop ly; neu khong cai thu vien thi phai co action doi status ro rang. Lam `Lead Detail & AI Insights - AssetManager Pro` voi score, reason, suggested follow-up, activities, notes, tasks va assign/status actions. Chay `npm run lint` va `npm run build`; test cac API mutation chinh. Sau khi UI va API pass, so sanh voi Stitch screens `Customer CRM Detail`, `Lead Pipeline & Tasks (Restored)`, `Lead Detail & AI Insights - AssetManager Pro`; neu khong chac giong, hoi toi va chi ket thuc sau khi toi dong y hoac da sua theo feedback.
```

## Goal 6 - Appointment calendar, appointment detail va feedback lifecycle

```text
/goal Hoan thanh cum Appointments theo API va Stitch. Audit va bo sung `appointmentApi` de bao phu list/create/my/detail/confirm/cancel/reschedule/complete/feedback voi query filters status/agent/customer/property/from/to/page/size/sort. Refactor `/appointments`, `/appointments/my`, `/appointments/:id` de co list mode, calendar mode va detail workflow. Xay `Appointment & Viewing Calendar` voi grid ngay/tuan, appointment blocks nam dung vi tri theo `startAt/endAt`, filter theo status/agent/customer/property, action nhanh confirm/cancel/reschedule/complete va create appointment. Xay `Appointment Detail & Feedback - AssetManager Pro` voi participants, status lifecycle, cancellation/reschedule data, complete action, feedback form/list va timeline. Cai `date-fns` hoac thu vien lich nhe neu giup tinh time slots chinh xac; khong them UI kit nang. Chay `npm run lint` va `npm run build`; test cac API action chinh. Sau khi UI va API xong, so sanh voi Stitch screens `Appointment & Viewing Calendar` va `Appointment Detail & Feedback - AssetManager Pro`; neu khong chac giong thiet ke, hoi toi xac nhan truoc khi hoan thanh.
```

## Goal 7 - Contracts, transactions, payments, receipts va commissions

```text
/goal Hoan thanh cum Contracts, Transactions, Payments va Commissions theo API va Stitch. Audit va bo sung `contractApi`, `transactionApi`, `commissionApi` de bao phu contracts list/create/detail/update/submit-review/approve/mark-signed/cancel/documents, transactions list/create/detail/deposits/payment-schedules/payments/receipts/status, commission-rules list/create/update, commissions list/my/mark-paid. Refactor `/contracts`, `/contracts/:id`, `/transactions`, `/transactions/:id`, `/commissions` va them route create/edit/detail neu can. Lam `Contract Management Detail` voi lifecycle actions, document upload/list, review/approve/sign/cancel flow va link sang transaction. Lam `Transaction & Payment Detail` voi financial summary, deposits, payment schedules, payments, receipt creation, invoice creation va status transitions. Hoan thien commission management/rules/my commissions theo API. Chay `npm run lint` va `npm run build`; test mutation chinh. Sau khi xay UI va test API xong, so sanh voi Stitch screens `Contract Management Detail` va `Transaction & Payment Detail`; neu khong chac visual/workflow da dung, hoi toi va sua theo feedback truoc khi ket thuc.
```

## Goal 8 - Dashboard, reports, notifications, admin users, audit logs va AI assistant

```text
/goal Hoan thanh cac module con lai de dat API coverage day du va UI nhat quan voi Stitch. Audit va bo sung `dashboardApi`, `reportApi`, `notificationApi`, `adminUserApi`, `auditLogApi`, `aiApi` de bao phu dashboards admin/manager/agent, reports revenue/transactions/leads/commissions, notifications list/unread/read/read-all, admin users list/detail/roles/status, audit logs list/detail, AI chat sessions/messages va cac AI utility con lai. Refactor `/dashboard`, `/reports`, `/notifications`, `/admin/users`, `/admin/audit-logs`, `/ai` de co data table, metric cards, charts, detail drawers/routes, loading/error/empty states va role guard dung. Neu Stitch khong co screen cho mot chuc nang, tu tao UI theo cung style `Stellar Institutional Estate` va ghi ro mapping trong docs. Chay `npm run lint` va `npm run build`; test API chinh. Sau khi UI va API xong, so sanh dashboard/reports/notification/admin/AI voi cac Stitch screens co lien quan; neu khong chac giong, hoi toi xac nhan truoc khi hoan thanh.
```

## Goal 9 - End-to-end API coverage, visual comparison va final hardening

```text
/goal Hoan thanh final hardening cho toan bo refactor Stitch + API. Doc `docs/API_COVERAGE_MATRIX.md`, `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md`, va Stitch project `6397110572098939351`. Kiem tra lai 146 endpoints trong `docs/API_REFERENCE.md`: moi endpoint phai co frontend API wrapper hoac ly do ro rang neu khong goi truc tiep; moi domain phai co UI entry point; moi mutation quan trong phai invalidate/refetch data lien quan. Chay `npm run lint` va `npm run build`, sua loi TypeScript/build/lint do refactor gay ra. Smoke test cac luong chinh: login/register/profile/session, property -> listing -> lead/customer -> appointment -> contract -> transaction -> payment, notification/read state, reports/dashboard, AI workflows, admin users/audit logs. Sau do so sanh lan cuoi cac workspace uu tien voi Stitch screens: `Customer CRM Detail`, `Listing Detail & Workflow - AssetManager Pro`, `Property Detail - AssetManager Pro`, `Manage Property Images - AssetManager Pro`, `Lead Pipeline & Tasks (Restored)`, `Lead Detail & AI Insights - AssetManager Pro`, `Appointment & Viewing Calendar`, `Appointment Detail & Feedback - AssetManager Pro`, `Contract Management Detail`, `Transaction & Payment Detail`. Neu co bat ky man hinh nao khong chac da giong tinh than thiet ke, phai hoi toi voi danh sach cu the va cho toi quyet dinh: dong y hoan thanh hay yeu cau sua. Chi mark goal complete khi toi dong y hoac tat ca feedback da duoc sua va verification pass.
```

## Optional Full Goal - Chay mot lan neu muon lam end-to-end

```text
/goal Hoan thanh toan bo refactor frontend theo Stitch project `6397110572098939351` va `docs/API_REFERENCE.md`. Doc `docs/FRONTEND_STITCH_API_REFACTOR_PLAN.md` va thuc hien theo cac cum viec lon: tao API coverage matrix, chuan hoa shared API/auth/files/master-data, refactor app shell/design tokens, hoan thien properties/listings/public search, customers/leads/tasks/AI, appointments calendar/detail, contracts/transactions/commissions, dashboard/reports/notifications/admin/audit/AI assistant. Moi endpoint trong 146 endpoints phai co API wrapper hoac ly do khong goi truc tiep; moi domain phai co UI entry point; build va lint phai pass truoc khi ket thuc. Sau khi xay giao dien va test API xong, bat buoc so sanh cac man hinh uu tien voi Stitch. Neu khong chac giong thiet ke, hoi toi xac nhan; neu toi dong y thi hoan thanh, neu toi khong dong y thi sua theo bo sung cua toi roi verify lai.
```
