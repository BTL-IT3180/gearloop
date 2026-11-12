# GearLoop — Sàn cho thuê thiết bị ngang hàng

**Dự án môn IT3180 — Nhập môn Công nghệ phần mềm.** Web app cho thuê thiết bị
(máy ảnh, dụng cụ, đồ cắm trại) giữa các sinh viên: mỗi lượt thuê là một khung
ngày rõ ràng, một khoản cọc có sổ sách và một cặp biên bản tình trạng máy.

> ⚠️ **Đây là sản phẩm học tập phục vụ demo, không phải production.** Mật khẩu
> demo chung cho mọi tài khoản, chưa có cổng thanh toán thật (tiền cọc là sổ
> ghi nội bộ). Quyết định thiết kế nằm trong [docs/architecture/adrs/](./docs/architecture/adrs/).

---

## Mục lục

- [Chạy trong 2 phút](#chạy-trong-2-phút)
- [Tài khoản demo](#tài-khoản-demo)
- [Bối cảnh: vấn đề GearLoop giải quyết](#bối-cảnh-vấn-đề-gearloop-giải-quyết)
- [Lộ trình 6 tuần (Scrum)](#lộ-trình-6-tuần-scrum)
- [Kiến trúc](#kiến-trúc)
- [Mô hình dữ liệu](#mô-hình-dữ-liệu)
- [API](#api)
- [Chạy không dùng Docker](#chạy-không-dùng-docker)
- [Kiểm thử và lint](#kiểm-thử-và-lint)
- [Xử lý sự cố](#xử-lý-sự-cố)
- [Tài liệu kỹ thuật](#tài-liệu-kỹ-thuật)

---

## Chạy trong 2 phút

**Cần có:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
đang chạy. Không cần cài Node.js hay PostgreSQL.

```bash
git clone git@github.com:BTL-IT3180/gearloop.git
cd gearloop
docker compose up --build
```

Đợi tới khi log hiện `Ready`, rồi mở `http://localhost:4300`. App tự chạy
migration và nạp dữ liệu mẫu ở lần khởi động đầu tiên.

### Cổng sử dụng

| Dịch vụ | Cổng | Ghi chú |
| --- | --- | --- |
| Ứng dụng GearLoop | `4300` | Next.js phục vụ **cả giao diện lẫn API** |
| PostgreSQL | `55432` | Cổng lạ tránh đụng PostgreSQL 5432 có sẵn trên máy |

```bash
docker compose up -d          # chạy nền
docker compose logs -f app    # xem log ứng dụng
docker compose down           # dừng, GIỮ dữ liệu
docker compose down -v        # dừng và XOÁ SẠCH dữ liệu
```

---

## Tài khoản demo

Trong tài liệu, **Owner** là chủ thiết bị và **Renter** là người thuê.
Tên role trong schema/API là `OWNER`, `RENTER` và `ADMIN`.

**Mật khẩu cho mọi tài khoản: `demo123`**

| Vai trò | Email | Làm được gì |
| --- | --- | --- |
| Quản trị (Admin) | `admin@gearloop.local` | Quản lý user, category/checklist, xét khiếu nại, xem audit log |
| Chủ thiết bị (Owner) | `mai@gearloop.local` | Đăng tin máy ảnh, quản lý giá/cọc, duyệt booking, ghi biên bản |
| Chủ thiết bị (Owner) | `lan@gearloop.local` | Đăng tin đồ cắm trại, chặn ngày bảo trì |
| Người thuê (Renter) | `an@gearloop.local` | Tìm thiết bị, đặt theo khung ngày, khiếu nại, đánh giá |
| Người thuê (Renter) | `linh@gearloop.local` | |
| Người thuê (Renter) | `huy@gearloop.local` | |

### Thử luồng demo trong 1 phút (sau Sprint 2)

1. Đăng nhập `an@gearloop.local` → chọn "Sony A7 III" → xem khung ngày trống.
2. Đặt 2 ngày → thấy cọc được **giữ** trong sổ cọc.
3. Đăng xuất, vào `mai@gearloop.local` → **Duyệt** booking → giao máy, ghi biên bản nhận.
4. Trả máy, ghi biên bản trả → 48h sau (nút "làm nhanh đồng hồ" của Admin) cọc **tự nhả**.
5. Thử chống đặt chồng: đặt trùng khung ngày vừa chốt → bị từ chối ngay.

---

## Bối cảnh: vấn đề GearLoop giải quyết

**Người thuê** không dám thuê thiết bị đắt vì hai nỗi sợ có dẫn chứng thật:
lịch bị đặt chồng (các sàn thuê lớn phải khuyến cáo chủ đồng bộ lịch tay) và
bị tính tiền hư hỏng không có căn cứ. **Chủ thiết bị** chỉ dám cho thuê khi
có cọc giữ trước, biên bản tình trạng làm chứng cứ, và lịch chặn chồng ở tầng
database. GearLoop giải quyết cả hai bằng cơ chế CRUD thuần túy — không AI.
Chi tiết nghiệp vụ: [docs/requirements/business-rules.md](./docs/requirements/business-rules.md).

## Lộ trình 6 tuần (Scrum)

| Sprint | Chủ đề | Mốc chính |
| --- | --- | --- |
| S1 (27/10–2/11) | Walking skeleton | Auth + RBAC + Item CRUD, **deploy URL ngày 3** |
| S2 (3–9/11) | Core loop | Đặt lịch end-to-end, sổ cọc, alpha nội bộ |
| S3 (10–16/11) | Sad paths + Beta | Khiếu nại, chặn ngày, huỷ; **mở beta cho lớp** |
| S4 (17–23/11) | Fix the beta | Sửa bug beta, beta vòng 2 |
| S5 (24–30/11) | Harden & docs | Seed demo, test case trắng/đen hộp |
| S6 (1–7/12) | Freeze & demo | Đóng băng tính năng, thuyết trình |

Chi tiết: [docs/planning/sprints/ROADMAP.md](./docs/planning/sprints/ROADMAP.md).

---

## Kiến trúc

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
bộ query. Hợp đồng từng tầng:
[docs/architecture/adrs/006-layered-architecture.md](./docs/architecture/adrs/006-layered-architecture.md).

### Cấu trúc thư mục

```
.
├── src/
│   ├── app/                   giao diện + api/ (route handlers — tầng HTTP)
│   ├── server/
│   │   ├── services/          (kế hoạch) nghiệp vụ, transaction
│   │   ├── repositories/      (kế hoạch) toàn bộ query Prisma
│   │   ├── middleware/        requireRole (RBAC 3 vai trò)
│   │   ├── utils/             zod schemas
│   │   ├── api/withApi.ts     gói { data } / bắt AppError → { error }
│   │   ├── errors.ts
│   │   └── db/client.ts       Prisma singleton
│   └── db/seed.ts             seed demo (idempotent)
├── prisma/schema.prisma       NGUỒN SỰ THẬT schema (16 models)
├── tests/                     vitest — cần database đang chạy
├── e2e/                       playwright — smoke test trình duyệt
├── docs/                      tài liệu kỹ thuật (mục lục: docs/README.md)
├── AGENTS.md                  luật cho AI agent + người code
├── Dockerfile · docker-compose.yml
└── .github/                   CI + issue/PR templates
```

> Trung thực về hiện trạng: `services/`, `repositories/` (đánh dấu *kế hoạch*
> ở trên), `src/middleware.ts` và session là thiết kế đích của kiến trúc phân
> tầng [ADR-006](./docs/architecture/adrs/006-layered-architecture.md) —
> **chưa tồn tại** trong repo hiện tại. Hiện trạng thật của code:
> [docs/architecture/system-overview.md](./docs/architecture/system-overview.md).

### Công nghệ

Next.js 15 · TypeScript strict · PostgreSQL 16 · Prisma · Tailwind v4 ·
bcrypt + JWT cookie · Docker Compose · GitHub Actions · Vitest.
Lý do từng lựa chọn nằm trong [docs/architecture/adrs/](./docs/architecture/adrs/).

---

## Mô hình dữ liệu

**16 bảng**: `users`, `categories`, `checklist_template_items`, `items`,
`item_photos`, `rate_tiers`, `deposit_policies`, `calendar_days`,
`bookings`, `condition_reports`, `condition_report_entries`,
`damage_claims`, `deposit_ledgers`, `reviews`, `policy_settings`,
`audit_logs`.

Một (thiết bị, ngày) có đúng một dòng CalendarDay nhờ `UNIQUE(itemId, date)`.
Chống đặt chồng còn cần UPDATE có điều kiện FREE, kiểm tra đủ số ngày và rollback
trong transaction; unique không ngăn ghi đè cùng dòng. Migration bổ sung các
ràng buộc lịch/booking và sổ cọc ở DB.
Chi tiết: [docs/architecture/database-design.md](./docs/architecture/database-design.md).

---

## API

Mọi endpoint trả JSON. Thành công → `{ "data": ... }`, thất bại →
`{ "error": "...", "code": "ERR-USR-xxx hoặc ERR-SYS-xxx" }`. Bảng đầy đủ,
luồng xử lý từng endpoint và catalog lỗi:
[docs/architecture/api-contract.md](./docs/architecture/api-contract.md).

| Method | Đường dẫn | Vai trò | Trạng thái | Mô tả |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | công khai | ✅ | Kiểm tra app + database |
| `POST` | `/api/auth/register` | công khai | 🚧 S1 | Đăng ký Renter/Owner |
| `POST` | `/api/auth/login` | công khai | 🚧 S1 | Đăng nhập, cấp cookie |
| `POST` | `/api/auth/logout` | đã đăng nhập | 🚧 S1 | Xoá cookie |
| `GET` | `/api/me` | đã đăng nhập | 🚧 S1 | Thông tin user hiện tại |
| `GET/POST/PATCH` | `/api/admin/users*` | admin | 🚧 S1 | Quản lý user |
| `GET/POST/PATCH` | `/api/items*` | Owner | 🚧 S1 | CRUD thiết bị |
| `GET` | `/api/items/available?from=&to=` | Renter | 🚧 S2 | Tìm thiết bị trống theo khung ngày |
| `POST` | `/api/bookings` | Renter | 🚧 S2 | Đặt lịch (transaction: booking + lịch + cọc) |
| `POST` | `/api/bookings/:id/approve` | Owner | 🚧 S2 | Duyệt/từ chối |
| `POST` | `/api/bookings/:id/pickup` · `/return` | Owner | 🚧 S2 | Biên bản nhận/trả |
| `POST` | `/api/claims*` | Owner/Renter | 🚧 S3 | Khiếu nại hư hỏng |
| `POST` | `/api/admin/claims/:id/resolve` | admin | 🚧 S3 | Xét xử + trừ cọc |

```bash
curl http://localhost:4300/api/health
# {"data":{"ok":true,"db":"up"}}
```

---

## Chạy không dùng Docker

**Cần có:** Node.js 20+ và một PostgreSQL đang chạy.

```bash
npm install
cp .env.example .env          # sửa DATABASE_URL nếu cần
npm run db:deploy             # DB mới/trống: cài schema và các CHECK/trigger
npm run db:seed               # nạp dữ liệu mẫu
npm run dev                   # http://localhost:3000
```

DB đã có schema/dữ liệu từ `db push` cần DB OWNER chuẩn bị baseline/upgrade —
không reset hay chạy migration đầu tiên trực tiếp: xem mục **Quy tắc đồng bộ
database** trong
[docs/guides/development-workflow.md](./docs/guides/development-workflow.md).
Seed idempotent (bỏ qua nếu đã có dữ liệu nghiệp vụ). Cài đặt chi tiết và
khắc phục sự cố: [docs/guides/setup.md](./docs/guides/setup.md).

Biến môi trường (xem `.env.example`):

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://gearloop:gearloop@localhost:55432/gearloop` | Chuỗi kết nối PostgreSQL |
| `AUTH_SECRET` | — | Secret ký session cookie (≥32 ký tự) |

---

## Kiểm thử và lint

```bash
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm test             # vitest — CẦN database đang chạy và đã seed
npm run test:e2e     # playwright Chromium — tự khởi động Next.js
npm run db:reset     # xoá sạch + migrate + seed lại
```

Các test tích hợp trong `npm test` truy vấn PostgreSQL thật — không mock.
Phạm vi và chiến lược kiểm thử:
[docs/testing/test-strategy.md](./docs/testing/test-strategy.md). E2E cần cài
browser Chromium một lần bằng `npx playwright install chromium`.

---

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
| --- | --- |
| Cổng 4300/55432 bị chiếm | Sửa vế trái trong `docker-compose.yml` rồi chạy lại |
| `PrismaClient`/type lỗi sau khi đổi schema | `npx prisma generate` (restart dev server nếu cần) |
| Test báo không nối được DB | Bật `docker compose up -d db`, kiểm tra `DATABASE_URL` |

Danh sách sự cố đầy đủ: [docs/guides/setup.md](./docs/guides/setup.md).

---

## Tài liệu kỹ thuật

Toàn bộ tài liệu nằm trong `docs/`. Điểm vào chính là
[docs/README.md](./docs/README.md) — mục lục đầy đủ và quy tắc cập nhật.

| Nhóm | Nội dung |
| --- | --- |
| [Yêu cầu sản phẩm](./docs/requirements/product-overview.md) | Phạm vi, vai trò, quy tắc nghiệp vụ, yêu cầu chức năng, mô hình nghiệp vụ |
| [Kiến trúc](./docs/architecture/system-overview.md) | Hiện trạng hệ thống, thiết kế CSDL, hợp đồng API, [ADR](./docs/architecture/adrs/README.md) |
| [Kế hoạch & user stories](./docs/planning/gearloop_project_plan.md) | Kế hoạch dự án, [backlog](./docs/planning/backlog.md), [lộ trình sprint](./docs/planning/sprints/ROADMAP.md), [13 user stories](./docs/user-stories/README.md) |
| [Hướng dẫn & kiểm thử](./docs/guides/setup.md) | Cài đặt chạy máy, [quy trình phát triển](./docs/guides/development-workflow.md), [chiến lược kiểm thử](./docs/testing/test-strategy.md), [bộ test case](./docs/testing/test-cases.md) |

- [AGENTS.md](./AGENTS.md) — quy ước code cho người + AI agent
