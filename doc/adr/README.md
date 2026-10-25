# Architecture Decision Records

Mỗi quyết định thiết kế quan trọng có một ADR: bối cảnh → các phương án cân
nhắc → quyết định → hệ quả. Format mirror từ template MedBook.

| ADR | Quyết định | Trạng thái |
| --- | --- | --- |
| [001](./001-nextjs-typescript.md) | Next.js + TypeScript thay Express + vanilla JS của template | Chấp nhận |
| [002](./002-auth.md) | bcrypt + JWT httpOnly cookie (không dùng demo header) | Chấp nhận |
| [003](./003-calendar-materialized.md) | Lịch ngày materialized + `UNIQUE(item_id, date)` | Chấp nhận |
| [004](./004-deposit-ledger.md) | Sổ cọc append-only, tiền Int VND | Chấp nhận |
| [005](./005-prisma-migrations.md) | Prisma ORM + chiến lược migration | Chấp nhận |
| [006](./006-layered-architecture.md) | Kiến trúc 3 tầng Route → Service → Repository (trong Next) | Chấp nhận |
| [007](./007-rbac-3-roles.md) | RBAC đúng 3 vai trò: Admin / Seller / Buyer | Chấp nhận |
