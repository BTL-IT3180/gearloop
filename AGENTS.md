# GearLoop — Agent Conventions (AGENTS.md)

Tài liệu này là **luật bắt buộc** cho mọi AI coding agent (Cursor, Copilot,
ChatGPT) và mọi người viết code. Template tham chiếu tổ chức repo:
[NgDucLoc/MedBook-Case-Study-Base](https://github.com/NgDucLoc/MedBook-Case-Study-Base).

## Stack (không đổi nếu không có ADR mới)

- Next.js 15 (App Router) + TypeScript strict + Tailwind v4
- Prisma + PostgreSQL 16 (Neon trên cloud, Docker local)
- Auth: bcrypt + JWT httpOnly cookie (jose). Không dùng Auth.js.
- Validation: zod — schema đặt trong `src/server/utils/`, luôn validate lại ở server.

## Kiến trúc 3 tầng (mirror ADR-006 của template — TUÂN THỦ NGHIÊM NGẶT)

```
src/app/api/**/route.ts  →  src/server/services/*.ts  →  src/server/repositories/*.ts  →  src/server/db/client.ts
(HỒI HTTP, mỏng)            (NGHIỆP VỤ + transaction)     (TOÀN BỘ query Prisma)             (kết nối)
```

| Tầng | PHẢI | CẤM |
| --- | --- | --- |
| `app/api/**/route.ts` | Mỏng 3–5 dòng: parse input → gọi **đúng một** service → trả data. Dùng `withApi()` | Viết query, chứa `if` nghiệp vụ |
| `services/` | Quy tắc nghiệp vụ, transaction (`prisma.$transaction`), ném `AppError` kèm mã HTTP | Đụng `req`/`res`, viết query Prisma trực tiếp |
| `repositories/` | Toàn bộ query Prisma, trả data thuần | Chứa nghiệp vụ, ném lỗi HTTP |
| `middleware/requireRole.ts` | Đầu mỗi service: `requireRole(user.role, "SELLER")` | Bỏ qua RBAC "vì demo" |

- Contract API: thành công `{ "data": ... }`, thất bại `{ "error": "..." }` — mirror template.
- Route không có nghiệp vụ → được phép gọi thẳng repository (vd `GET /api/health`).

## Thư mục

```
src/app/            route groups (auth)/(admin)/(seller)/(buyer) + api/
src/server/services/    nghiệp vụ
src/server/repositories/ query Prisma
src/server/middleware/   requireRole, session
src/server/utils/        zod schemas, helpers
src/server/errors.ts     AppError + helpers
src/db/seed.ts           seed demo
prisma/schema.prisma     NGUỒN SỰ THẬT schema — chỉ DB OWNER merge
tests/                   vitest, chạy tuần tự, cần DATABASE_URL
doc/                     docs + adr/ — đổi schema phải đổi doc/data-model.md
```

## Entities (16 — KHÔNG tự bịa thêm, xem doc/data-model.md)

`User, Category, ChecklistTemplateItem, Item, ItemPhoto, RateTier, DepositPolicy,
CalendarDay, Booking, ConditionReport, ConditionReportEntry, DamageClaim,
DepositLedger, Review, PolicySetting, AuditLog`

- Booking: `REQUESTED → APPROVED → DEPOSIT_HELD → PICKED_UP → RETURN_PENDING → RETURNED → CLOSED`, nhánh `DISPUTED → RESOLVED`.
- `CalendarDay` có `@@unique([itemId, date])` — đặt chồng bị **DB** từ chối. Đặt booking = transaction: tạo Booking + flip CalendarDay rows + ghi `DepositLedger(HOLD)`.
- Sổ cọc `DepositLedger` append-only: KHÔNG bao giờ UPDATE số dư.
- `AuditLog` append-only: không UPDATE/DELETE.
- Tiền = `Int` VND, tên field `*Vnd`. Ngày = `DateTime @db.Date` (UTC).

## Quy tắc làm việc với AI agent

1. **1 issue = 1 branch = 1 PR.** Implement ĐÚNG acceptance criteria, không thêm gì.
2. Liệt kê file sẽ chạm **trước khi code**; chỉ ở trong folder của pod mình.
3. Không thêm dependency/env/schema nếu issue không ghi rõ.
4. Cấm `TODO`/stub/placeholder/mock-echo. Cấm `any`.
5. Chỉnh `prisma/schema.prisma` hoặc tạo migration → **chỉ DB OWNER** merge PR đó.
6. Xong việc phải chạy: `npm run lint && npm run build` xanh + liệt kê file đã chạm trong PR body.

## Pods & sở hữu (8 người)

| Pod | Người | Sở hữu folder |
| --- | --- | --- |
| A | 2 | auth/RBAC/users + CI/CD: `src/app/(auth)`, `src/server/middleware/`, `.github/` |
| B | 3 | domain + schema (1 DB OWNER): `prisma/`, `src/server/repositories/`, domain services |
| C | 2 | transaction + admin: booking/claim/ledger services, `src/app/(admin)` |
| D | 1 | QA + seed + docs: `tests/`, `src/db/`, `doc/` |

Review chéo A↔B↔C, không tự review PR của mình. PR ≤ ~300 dòng diff.
