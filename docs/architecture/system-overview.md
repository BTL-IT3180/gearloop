# GearLoop — Tổng quan kiến trúc hệ thống

Mô tả kiến trúc 3 tầng Route → Service → Repository → Prisma theo ADR-006, và phân biệt rõ **hiện trạng đã có trong repo** với **kế hoạch chưa triển khai**.

Nguồn: adrs/001, 002, 004, 005, 006, 007; README.md; tài liệu CI/CD trước đợt tái cấu trúc (`cicd.md` mục 3 — đã hợp nhất, xem git history); cây `src/` thực tế kiểm tra ngày 12/11/2026; [./api-contract.md](./api-contract.md); [./database-design.md](./database-design.md).

---

## 1. Bức tranh tổng thể

```
Trình duyệt (Next.js App Router)
        │  HTTP + JSON
        ▼
   Route handlers (src/app/api/**)     ← tầng HTTP, mỏng
        │
   Services  ──►  Repositories  ──►  Prisma Client
   (nghiệp vụ)    (toàn bộ query)      (kết nối)
        │                                    │
        ▼                                    ▼
   requireRole (RBAC 3 vai trò)        PostgreSQL 16
```

Nguyên tắc mirror từ template MedBook: **mỗi tầng chỉ gọi tầng ngay dưới nó**.
Route nhận request, Service giữ nghiệp vụ + transaction, Repository giữ toàn
bộ query. Quyết định và hợp đồng từng tầng chi tiết ở
[ADR-006](./adrs/006-layered-architecture.md).

## 2. Hợp đồng từng tầng

| Tầng | PHẢI | CẤM |
| --- | --- | --- |
| Route | 3–5 dòng: parse input → gọi đúng **một** service → trả data (qua `withApi`) | Viết query, chứa `if` nghiệp vụ |
| Service | Validate + nghiệp vụ + `prisma.$transaction` + `requireRole` + ném `AppError(code)` | Đụng `req`/`res`; gọi Prisma trực tiếp |
| Repository | Toàn bộ query Prisma, trả data thuần, nhận `tx` client khi chạy trong transaction | Chứa nghiệp vụ; ném lỗi HTTP |

**Quy tắc transaction:** chỉ Service mở `prisma.$transaction` và truyền client
(`tx`) xuống repository — một transaction trải qua nhiều repository, chỉ service
nhìn thấy ranh giới. Repository vì thế có hai loại hàm: độc lập
(ví dụ `listFree()`) và trong transaction (ví dụ `flipDays(tx, bookingId, range)`).

**Ngoại lệ được phép:** route không có nghiệp vụ gọi thẳng repository
(ví dụ `GET /api/health`, `GET /api/categories`). Nguyên tắc giữ nguyên:
*có nghiệp vụ thì có service; đọc thuần thì gọi thẳng repository.*

## 3. Hiện trạng so với kế hoạch

Cây thư mục vẽ trong [README.md](../../README.md#kiến-trúc) là **cấu trúc đích**
(theo ADR-001 bảng ánh xạ template), không phải hiện trạng. Hai phần dưới đây
tách bạch dựa trên cây `src/` thực tế.

### 3.1 Đã có trong repo (kiểm tra 12/11/2026)

| File thực tế | Vai trò |
| --- | --- |
| `src/app/api/health/route.ts` | Endpoint API duy nhất hiện có: kiểm app + database |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | Khung giao diện Next.js App Router |
| `src/server/api/withApi.ts` | Gói thành công `{ data }`, bắt `AppError` → `{ error, code }` |
| `src/server/errors.ts` | Lớp `AppError`: mã lỗi + HTTP status lấy từ catalog |
| `src/server/middleware/requireRole.ts` | Guard RBAC gọi tay ở đầu service/route |
| `src/server/db/client.ts` | Prisma client singleton |
| `src/server/utils/validation.ts` | `parseInput` / `parseJsonInput` (zod → `AppError` 400) |
| `src/lib/api-response.ts` | Kiểu dùng chung `ApiResponse<T>` |
| `src/lib/error-catalog.ts` | 24 mã ERR-USR + 3 mã ERR-SYS, chặn mã pending khi runtime |
| `src/lib/validation/auth.ts`, `src/lib/validation/date-range.ts` | Schema zod dùng chung (login, khoảng ngày) |
| `src/db/seed.ts` | Seed demo idempotent (bỏ qua khi đã có dữ liệu nghiệp vụ) |

Nền kèm theo: `prisma/schema.prisma` (nguồn sự thật 16 model) + 3 migration;
`tests/` (vitest), `e2e/` (playwright); `.github/workflows/ci.yml`.

### 3.2 Kế hoạch — chưa tồn tại trong repo

| Thành phần kế hoạch | Vị trí dự kiến | Trạng thái |
| --- | --- | --- |
| Tầng services | `src/server/services/` | Chưa có thư mục/file nào — nghiệp vụ booking/claim chưa triển khai |
| Tầng repositories | `src/server/repositories/` | Chưa có thư mục/file nào — chưa có query Prisma nào ngoài seed |
| Guard UI (lớp 1 của RBAC) | `src/middleware.ts` | Chưa có (xem ADR-007 và mục 5) |
| Đọc phiên đăng nhập từ cookie JWT | `src/server/middleware/` (module session) | Chưa có; mã lỗi phiên `ERR-SYS-003` đã định nghĩa sẵn trong `src/server/errors.ts` |
| Các endpoint còn lại | `src/app/api/auth/**`, `items`, `bookings`, `claims`, … | Chỉ `/api/health` tồn tại; trạng thái từng endpoint xem [api-contract.md](./api-contract.md) |

Việc thiếu services/repositories là đúng thứ tự triển khai: khung hạ tầng
(envelope, AppError, guard, validation, Prisma client) đã dựng xong trước,
domain sẽ điền vào hai tầng này theo sprint (xem
[planning/sprints/ROADMAP.md](../planning/sprints/ROADMAP.md)).

## 4. Vòng đời một request

1. Route handler được bọc bằng `withApi()` (`src/server/api/withApi.ts`); input
   được parse bằng `parseInput`/`parseJsonInput` trước mọi thao tác ghi.
2. Handler **chỉ trả data** — `withApi` gói thành `{ data }`.
3. Guard `requireRole(role, ...allowed)` ném `AppError` khi thiếu phiên
   (`ERR-SYS-003`) hoặc sai vai trò (`ERR-USR-008`).
4. `AppError` → JSON `{ error, code }` kèm đúng mã HTTP từ catalog.
5. Lỗi chưa phân loại: server chỉ log marker `[api] unhandled error` (không
   chứa exception/input thô có thể chứa secret) và trả HTTP 500 với
   `ERR-SYS-001` cùng thông điệp chuẩn.

Ngoại lệ health: `GET /api/health` trả `{ data: { ok: true, db: "up" | "down" } }`;
`db: "down"` vẫn là trạng thái chẩn đoán hợp lệ. Chi tiết hợp đồng và luồng
nghiệp vụ: [api-contract.md](./api-contract.md).

## 5. RBAC 3 vai trò

- Vai trò: `ADMIN | OWNER | RENTER` (enum `Role`, mặc định `RENTER`) — đúng
  ràng buộc 3 vai trò của môn học, xem [ADR-007](./adrs/007-rbac-3-roles.md).
- **Hiện có:** `requireRole(role, ...allowed)` trong
  `src/server/middleware/requireRole.ts` — Next.js không có middleware chain
  kiểu Express nên hàm được gọi tay ở đầu mỗi service/route; ném
  `unauthorized()`/`forbidden()` đã kết nối catalog lỗi.
- **Kế hoạch — guard 2 lớp (ADR-007):** `src/middleware.ts` chặn route group
  sai vai trò ở tầng UI (redirect/403) + `requireRole()` đầu mỗi service ở tầng
  API (403). Nguyên tắc: **UI guard không bao giờ là lớp bảo vệ duy nhất**.
- Ma trận quyền (ngắn): Owner chỉ đụng item/booking của mình; Renter chỉ booking
  của mình; Admin toàn quyền đọc + quyền xét xử (claim, khóa), mọi thao tác ghi
  của Admin vào `audit_logs`. Cơ chế đăng nhập: bcrypt + JWT httpOnly cookie,
  không dùng demo header — xem [ADR-002](./adrs/002-auth.md).

## 6. Tầng dữ liệu

- **Prisma singleton** tại `src/server/db/client.ts`: dùng lại một instance qua
  `globalThis` khi dev để tránh mở nhiều connection pool khi hot-reload.
- **PostgreSQL 16**, 16 model trong `prisma/schema.prisma` (nguồn sự thật).
- **3 migration** (`booking_calendar_ledger_integrity`,
  `harden_booking_history`, `restrict_historical_user_deletion`) bổ sung CHECK,
  partial unique index và trigger mà `db push` không tạo: chống đặt chồng ở tầng
  DB, sổ cọc append-only, `returnedAt` do trigger ghi một lần, chặn xóa user có
  lịch sử. Chi tiết ràng buộc: [database-design.md](./database-design.md),
  sổ cọc: [ADR-004](./adrs/004-deposit-ledger.md).
- Quy tắc duy trì schema: mỗi story chạm schema tạo đúng một migration; schema
  đổi thì [database-design.md](./database-design.md) đổi cùng PR; CI/Docker chỉ
  chạy `prisma migrate deploy` — xem [ADR-005](./adrs/005-prisma-migrations.md).

## 7. Môi trường triển khai

Theo mục 3 của tài liệu CI/CD trước đợt tái cấu trúc (`cicd.md` — nay đã hợp nhất vào
[../guides/development-workflow.md](../guides/development-workflow.md)):

| Môi trường | Nền tảng | Dữ liệu |
| --- | --- | --- |
| Local | Docker Compose (app cổng 4300, PostgreSQL cổng 55432) | PostgreSQL 16 container; migration + seed tự chạy lần đầu |
| Preview | Vercel Preview cho mỗi PR | Neon DB branch/copy để reviewer kiểm thử, nếu đã cấu hình |
| Production | Vercel + Neon PostgreSQL | Triển khai từ `main` sau merge |

- Neon: ưu tiên **pooled connection string** cho runtime serverless; không dùng
  Render free PostgreSQL làm database chính.
- CI (`.github/workflows/ci.yml`) gồm 3 job: `unit` (PostgreSQL 16 service →
  lint, `migrate deploy` + seed, build, typecheck, `npm test`), `e2e`
  (Playwright Chromium) và `verify` tổng hợp hai job trước — `verify` là status
  check bắt buộc trên PR.

## 8. Stack và lý do chọn

| Lựa chọn | Vai trò | Quyết định chi tiết |
| --- | --- | --- |
| Next.js 15 + TypeScript strict | 1 codebase UI + API, per-PR preview | [ADR-001](./adrs/001-nextjs-typescript.md) |
| Kiến trúc 3 tầng Route/Service/Repository | Tách nghiệp vụ khỏi kỹ thuật, test theo tầng | [ADR-006](./adrs/006-layered-architecture.md) |
| PostgreSQL 16 | Khung ngày, ràng buộc lịch/cọc ở DB | [database-design.md](./database-design.md) |
| Prisma + migrate | Schema là một nguồn sự thật duy nhất | [ADR-005](./adrs/005-prisma-migrations.md) |
| bcryptjs + JWT (thư viện `jose`) trong cookie httpOnly | Session thật cho RBAC | [ADR-002](./adrs/002-auth.md) |
| Tailwind v4 | Giao diện | [ADR-001](./adrs/001-nextjs-typescript.md) |
| Vitest + Playwright | Test tích hợp PostgreSQL thật + smoke trình duyệt | [../testing/test-strategy.md](../testing/test-strategy.md) |
| Docker Compose, GitHub Actions | Đóng gói và CI | [../guides/development-workflow.md](../guides/development-workflow.md) |
