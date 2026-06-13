# Daily Development Workflow

Tai lieu nay mo ta cach bat dau va tiep tuc phat trien du an Real Estate Management moi ngay dua tren plan trong `docs/REAL_ESTATE_MANAGEMENT_PLAN.md`.

## 1. Nguyen tac lam viec voi Codex

### 1.1 Branch lam viec

Branch local hien tai:

```text
breakthrough
```

Remote hien tai:

```text
tdbaophuc -> https://github.com/tdbaophuc/Real_estate_management.git
```

Quy tac:

- Chi commit va push code cua task dang lam len branch `breakthrough`.
- Khong push sang `main`, `master`, hoac branch khac neu ban khong yeu cau ro.
- Neu co file dang thay doi san tu truoc va khong lien quan task, khong tu dong revert.
- Moi task nen co commit rieng, message ro rang.
- Chi push sau khi task da hoan thanh va da chay verification phu hop.

### 1.2 Ve viec tu dong commit va push

Codex co the commit va push giup ban khi ban yeu cau trong mot phien lam viec cu the.

De tranh day code loi hoac gom nham thay doi ngoai task, quy tac nen dung la:

- Ban giao task.
- Codex implement.
- Codex chay test/build/verification.
- Codex bao tom tat thay doi.
- Neu task on, Codex commit va push len branch `breakthrough`.

Mau lenh nen noi voi Codex:

```text
Lam Phase 0 task: them common API response va global exception handler. Sau khi xong hay test, commit va push len branch hien tai.
```

Hoac:

```text
Hoan thanh task nay xong thi commit va push. Chi push len branch breakthrough.
```

Neu can push len GitHub, co the Codex se can quyen network/credential tu moi truong local.

## 2. Cach bat dau moi ngay

Moi ngay nen bat dau bang mot phien lam viec ngan gon:

```text
/goal Hom nay hoan thanh [ten task cu the] trong roadmap Real Estate Management. Sau khi xong can test, commit va push len branch breakthrough.
```

Vi du:

```text
/goal Hom nay hoan thanh Phase 0: chuyen application.properties sang application.yml, them Swagger/OpenAPI va common response format. Sau khi xong chay build, commit va push len branch breakthrough.
```

Nen chon task vua du trong mot ngay, khong nen giao ca phase lon mot luc.

## 3. Quy trinh lam viec hằng ngay

## Step 1 - Dong bo trang thai repo

Truoc khi code, yeu cau Codex kiem tra:

```text
Kiem tra branch hien tai, git status, remote, va doc lai plan trong docs/REAL_ESTATE_MANAGEMENT_PLAN.md.
```

Codex nen thuc hien:

```text
git branch --show-current
git status --short
git remote -v
```

Neu co thay doi ngoai task:

- Neu la file do ban dang sua, giu nguyen.
- Neu anh huong task, Codex phai noi ro truoc khi sua.
- Neu khong lien quan, bo qua.

## Step 2 - Chon task nho tu roadmap

Nen lay task theo thu tu trong roadmap:

1. Phase 0 - Project Reset and Foundation.
2. Phase 1 - Auth and User Management.
3. Phase 2 - Property Management.
4. Phase 3 - Listing and Public Search.
5. Phase 4 - Customer and Lead CRM.
6. Phase 5 - Appointment Management.
7. Phase 6 - Contract, Transaction, Payment, Commission.
8. Phase 7 - AI Basic Features.
9. Phase 8 - AI Advanced Features.
10. Phase 9 - Dashboard, Reports, Notification.
11. Phase 10 - Production Hardening.

Khong nen lam nhieu module cung luc neu database schema va security chua on dinh.

## Step 3 - Yeu cau Codex lap checklist

Mau prompt:

```text
Doc docs/REAL_ESTATE_MANAGEMENT_PLAN.md va lap checklist ngan cho task: [ten task]. Sau do implement luon, neu gap van de thi tu xu ly trong pham vi hop ly.
```

Checklist tot nen gom:

- Files se sua/them.
- Entity/DTO/API can tao.
- Migration can tao.
- Test/build can chay.
- Commit message du kien.

## Step 4 - Implement

Trong qua trinh implement, Codex nen:

- Doc code hien co truoc khi sua.
- Uu tien pattern da co trong repo neu con phu hop.
- Khong refactor lan sang module khac neu khong can.
- Them migration neu thay doi database.
- Them validation cho request DTO.
- Them exception handling neu co business rule moi.
- Them test cho logic quan trong.

## Step 5 - Verification

Tuy task, yeu cau Codex chay:

```text
mvn test
```

Hoac it nhat:

```text
mvn -DskipTests package
```

Neu task lien quan API/security/database, nen uu tien test that su thay vi chi compile.

Neu command loi do dependency/network/sandbox, Codex se yeu cau quyen chay lenh can thiet.

## Step 6 - Review thay doi truoc commit

Truoc khi commit, yeu cau:

```text
Cho toi tom tat file da thay doi, test da chay, va git diff summary truoc khi commit.
```

Codex nen kiem tra:

```text
git status --short
git diff --stat
```

Neu co file khong lien quan task, khong add file do.

## Step 7 - Commit

Commit message nen theo conventional style:

```text
feat(auth): add jwt login flow
feat(property): add property CRUD
chore(config): add docker compose
test(listing): add approval flow tests
docs(plan): add development workflow
```

Quy tac:

- Mot commit cho mot task ro rang.
- Khong commit file IDE/local neu khong can.
- Khong commit secret, password, token, `.env` that.

## Step 8 - Push

Chi push branch hien tai:

```text
git push tdbaophuc breakthrough
```

Neu branch chua co upstream:

```text
git push -u tdbaophuc breakthrough
```

Khong dung:

```text
git push origin main
git push origin master
git push --all
git push --force
```

Chi force push khi ban yeu cau ro va hieu rui ro.

## 4. Cach dung `/goal` hieu qua

`/goal` phu hop khi ban muon Codex theo duoi mot muc tieu lon hon mot prompt don.

Nen dung `/goal` khi:

- Lam tron mot task co nhieu buoc.
- Can Codex tiep tuc cho den khi build/test xong.
- Can commit/push sau khi xong.

Mau tot:

```text
/goal Hoan thanh Phase 0 task: refactor project foundation gom common response, global exception, Swagger, Flyway skeleton. Sau khi implement xong chay mvn test hoac mvn -DskipTests package, commit va push len branch breakthrough.
```

Mau chua tot:

```text
/goal Lam het app real estate
```

Ly do chua tot: qua lon, de gay thay doi lan rong, kho review.

## 5. Prompt mau cho tung loai cong viec

### 5.1 Implement feature

```text
Lam task [ten task] theo docs/REAL_ESTATE_MANAGEMENT_PLAN.md. Hay doc code hien tai truoc, implement day du, them validation/error handling/test neu phu hop. Sau khi xong chay verification, commit va push len branch breakthrough.
```

### 5.2 Chi muon review, chua code

```text
Review code hien tai cho module [ten module], chi dua findings va de xuat, chua sua code.
```

### 5.3 Sua loi build/test

```text
Chay test/build, phan tich loi, sua loi toi khi build pass. Sau khi xong commit va push len branch breakthrough.
```

### 5.4 Them database migration

```text
Them Flyway migration cho [ten module]. Dam bao entity mapping dung voi schema, chay build/test, commit va push len branch breakthrough.
```

### 5.5 Them API moi

```text
Them API [mo ta API] cho module [ten module]. Can co request DTO, response DTO, validation, service, repository, security rule, Swagger docs, va test phu hop.
```

### 5.6 Them AI feature

```text
Them AI feature [ten feature] theo plan. Can co provider abstraction, request/response DTO, prompt builder, logging AI request, error handling, va rate-limit neu phu hop.
```

## 6. Daily Task Size Recommendation

Nen chia task theo kich thuoc nay:

### Small task - 30 den 90 phut

- Them common response wrapper.
- Them mot DTO va validation.
- Them mot migration nho.
- Them mot endpoint CRUD don.
- Sua loi build/test.

### Medium task - nua ngay den mot ngay

- Hoan thanh auth login JWT.
- Hoan thanh property CRUD.
- Hoan thanh listing approval flow.
- Hoan thanh upload image.
- Hoan thanh AI listing description.

### Large task - nhieu ngay

- Full auth module.
- Full property/listing module.
- Full CRM lead pipeline.
- Full transaction/commission module.
- AI chatbot.

Large task nen tach thanh nhieu `/goal` nho.

## 7. Recommended First 10 Working Days

### Day 1

- Tao project foundation.
- Doi artifact/package neu quyet dinh rebuild.
- Them common response/error.
- Them Swagger.

### Day 2

- Them Flyway.
- Tao auth schema.
- Seed roles/permissions/admin.

### Day 3

- Implement register/login/JWT.
- Implement refresh token.

### Day 4

- Implement user management.
- Them role/permission guards.

### Day 5

- Tao property schema.
- Implement property entity/repository/service.

### Day 6

- Implement property CRUD API.
- Them property search co pagination.

### Day 7

- Implement file storage/upload image.
- Gan image vao property.

### Day 8

- Tao listing schema.
- Implement create listing from property.

### Day 9

- Implement listing approval/publish/reject.
- Implement public listing search.

### Day 10

- Implement AI listing description generator skeleton.
- Log AI request/response.

## 8. Commit and Push Checklist

Truoc moi commit:

- `git branch --show-current` la `breakthrough`.
- `git status --short` khong co file la ngoai task bi add nham.
- Code compile hoac test pass.
- Khong co secret trong diff.
- Migration dat ten dung thu tu.
- API moi co validation va error handling.
- Commit message ro nghia.

Sau moi push:

- Kiem tra GitHub branch `breakthrough`.
- Neu co CI, xem CI pass/fail.
- Neu fail, tao task sua CI ngay.

## 9. Quy tac khi co file local bi thay doi san

Trong repo hien tai co the co file IDE/local thay doi, vi du `.idea/...`.

Quy tac lam viec:

- Neu file khong lien quan task, khong add vao commit.
- Neu can sua config IDE, hoi ban truoc.
- Neu file la generated output, can can nhac co nen gitignore khong.
- Khong revert file do neu ban khong yeu cau.

## 10. Recommended "Start Today" Prompt

Ban co the bat dau ngay bang prompt nay:

```text
/goal Hoan thanh Phase 0 foundation cho Real Estate Management: doc docs/REAL_ESTATE_MANAGEMENT_PLAN.md va docs/DAILY_DEVELOPMENT_WORKFLOW.md, kiem tra branch breakthrough, sau do them common API response, global exception handler, Swagger/OpenAPI va Flyway skeleton. Sau khi xong chay verification, commit va push len branch breakthrough.
```

