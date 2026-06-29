# Frontend Goal Commands For New API Adoption

File nay gom cac cong viec nho thanh cac goal lon hon de chay mot lan theo tung cum chuc nang.

## Goal 1 - Nen tang va account self-service

```text
/goal Hoan thanh cum nen tang va account self-service cho frontend. Tao `masterDataApi` cho provinces, districts, wards, property-types, amenities, listing-packages va lead-sources; tao `fileApi` cho upload, metadata, download, delete va access-level; mo rong `authApi` va auth types cho `PATCH /auth/me/profile`, `POST /auth/me/change-password`, `POST /auth/me/avatar`, `DELETE /auth/me/avatar`, `GET /auth/me/sessions`, `DELETE /auth/me/sessions/{id}` va `DELETE /auth/me/sessions`; sau do tao UI account/profile de cap nhat fullName, phone, avatar, doi mat khau va quan ly sessions. Chay `npm run build` va verification phu hop, sau do commit va push.
```

## Goal 2 - Listing internal workflow va master data cho form

```text
/goal Hoan thanh cum listing internal workflow va master data cho form. Cap nhat `listingApi` de goi `GET /api/v1/listings` va `GET /api/v1/listings/{listingId}`; sua `ListingsPage` va `ListingFormPage` de bo sessionStorage workaround, dung React Query + filter/pagination/detail/edit flow tu backend moi; dong thoi thay cac input ID thu cong trong `PropertyFormPage` va `ListingFormPage` bang select/async select lay tu master data, bao gom property type, location chain, amenity va listing package. Chay `npm run build` va verification phu hop, sau do commit va push.
```

## Goal 3 - Property detail, legal documents va file integration

```text
/goal Hoan thanh cum property detail, legal documents va file integration. Cap nhat `propertyApi` de support legal documents list/upload/detail/update/verify/delete; them section hoac tab legal documents trong `PropertyDetailPage` voi upload form, danh sach tai lieu, download va action verify/reject/delete theo role; tich hop `fileApi` vao cac noi can upload/download file that su, bao gom legal documents, contract documents va avatar, va dam bao private download/access-level xu ly dung backend. Chay `npm run build` va verification phu hop, sau do commit va push.
```

## Goal 4 - Leads, follow-up tasks va CRM flow

```text
/goal Hoan thanh cum leads, follow-up tasks va CRM flow. Tao `followUpTaskApi` doc lap cho search all/search my/detail/update/update status/cancel; sua UI lead/detail/dashboard de quan ly follow-up tasks, gan task vao lead va doi sang task view rieng neu can; dong thoi kiem tra cac form CRM/lead/customer co source field thi noi sang `master-data/lead-sources` de khong nhap source code thu cong nua. Chay `npm run build` va verification phu hop, sau do commit va push.
```

## Goal 5 - Finishing gaps va route polish

```text
/goal Hoan thanh cum finishing gaps va route polish. Doi route `/commissions` sang `CommissionsPage`, kiem tra va bo sung commission rules UI neu can; hoan thien `updatePropertyImageMetadata` va `reorderPropertyImages` neu backend da co; them public inquiry/appointment request vao public listing detail neu chua co; va don cac workaround cu khong con dung trong frontend. Chay `npm run build` va verification phu hop, sau do commit va push.
```

## Final Goal

```text
/goal Hoan thanh tong the viec ap dung API backend moi vao frontend. Doc `docs/API_FRONTEND_NEW_API_ADOPTION_PLAN.md`, chay qua cac cum goal uu tien, cap nhat API wrappers, routes va UI tuong ung, sau do verify build va don cac workaround cu khong con can thiet. Khi xong, commit va push len branch hien tai.
```
