# Sprint 1 — "Walking Skeleton" (27/10 – 2/11)

**Goal:** URL live từ ngày 3; seller đăng được tin, buyer nhìn thấy; CI chặn merge.
**Exit gate:** `GET /api/health` = `{ok, db:up}` trên production URL; demo luồng
"admin tạo seller → seller tạo item → item hiện trong danh sách".

Sizing: S ≈ 2–3h · M ≈ 1 ngày · L ≈ 2 ngày (đã gồm review).

## Stories

### GL-101 · Email/password auth (A · M)
- [ ] Register → login → logout hoạt động
- [ ] `password_hash` là bcrypt (kiểm tra trong DB, không plaintext)
- [ ] Session = JWT trong cookie httpOnly; sai thông tin → 401, không lộ stack
- [ ] Vẽ control-flow graph login cho Lab 11 (kèm PR)

### GL-102 · RBAC guard (A · M)
- [ ] Middleware: chưa đăng nhập → `/login`
- [ ] Route group sai vai trò → 403; role nằm trong session
- [ ] `requireRole()` dùng được ở tầng service (API 403)

### GL-103 · Admin quản lý user (A · M)
- [ ] Admin list/search users; tạo tài khoản Seller/Buyer
- [ ] Deactivate → chặn đăng nhập
- [ ] Mọi thao tác ghi `audit_logs`

### GL-104 · Prisma schema v1 — 16 models (B · L · DB OWNER)
- [ ] Full schema commit; ERD (`doc/data-model.md`) khớp 1:1
- [ ] Migration đầu tiên tạo bằng `migrate dev` với tên rõ ràng
- [ ] CI chuyển từ `db push` sang `migrate deploy`

### GL-105 · Admin CRUD category + checklist (B · M)
- [ ] CRUD categories; thêm/bớt checklist item theo category
- [ ] Checklist hiện đúng trong form đăng tin của seller

### GL-106 · Seller CRUD Item (B · L)
- [ ] Tạo/sửa/archive item (ảnh URL, tiers, % cọc, giá trị thay thế)
- [ ] Item archived ẩn khỏi tìm kiếm; chỉ owner + admin sửa được

### GL-107 · CalendarDay nền tảng (B · M)
- [ ] Tạo item → seed 60 ngày FREE
- [ ] `@@unique([itemId, date])` hoạt động — test chèn trùng bị DB từ chối
- [ ] Test smoke `tests/smoke.test.ts` xanh trong CI

### GL-108 · CI + deploy pipeline (D · M)
- [ ] PR → lint + build + typecheck + test chặn merge
- [ ] `main` → deploy Vercel; preview URL hiện trong PR
- [ ] DATABASE_URL từ Neon; `/api/health` = `db:up` trên production

### GL-109 · Seed script (D · S)
- [ ] `npm run db:seed` idempotent: 6 users, 3 categories, 4 items, 240 ngày
- [ ] Chạy được khi boot Docker và chạy lại không lỗi

## Nhịp ngày

- **Ngày 1:** GL-108 (CI + skeleton deploy) song song GL-104 (schema) + GL-101.
- **Ngày 2–3:** deploy URL xanh; GL-102/103/106 chạy.
- **Ngày 4–5:** GL-105/107/109; sprint review thứ Sáu trên production URL.
