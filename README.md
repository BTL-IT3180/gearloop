# GearLoop — Sàn cho thuê thiết bị ngang hàng

**Dự án môn IT3180 — Nhập môn Công nghệ phần mềm.** Web app cho thuê thiết bị
(máy ảnh, dụng cụ, đồ cắm trại) giữa các sinh viên: mỗi lượt thuê là một khung
ngày rõ ràng, một khoản cọc có sổ sách và một cặp biên bản tình trạng máy.

> ⚠️ **Đây là sản phẩm học tập phục vụ demo, không phải production.** Mật khẩu
> demo chung cho mọi tài khoản, chưa có cổng thanh toán thật (tiền cọc là sổ
> ghi nội bộ). Quyết định thiết kế nằm trong [doc/adr/](./doc/adr/).

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

**Mật khẩu cho mọi tài khoản: `demo123`**

| Vai trò | Email | Làm được gì |
| --- | --- | --- |
| Quản trị (Admin) | `admin@gearloop.local` | Quản lý user, category/checklist, xét khiếu nại, xem audit log |
| Chủ thiết bị (Seller) | `mai@gearloop.local` | Đăng tin máy ảnh, quản lý giá/cọc, duyệt booking, ghi biên bản |
| Chủ thiết bị (Seller) | `lan@gearloop.local` | Đăng tin đồ cắm trại, chặn ngày bảo trì |
| Người thuê (Buyer) | `an@gearloop.local` | Tìm thiết bị, đặt theo khung ngày, khiếu nại, đánh giá |
| Người thuê (Buyer) | `linh@gearloop.local` | |
| Người thuê (Buyer) | `huy@gearloop.local` | |

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
Chi tiết nghiệp vụ: [doc/prod.md](./doc/prod.md).

## Lộ trình 6 tuần (Scrum)

| Sprint | Chủ đề | Mốc chính |
| --- | --- | --- |
| S1 (27/10–2/11) | Walking skeleton | Auth + RBAC + Item CRUD, **deploy URL ngày 3** |
| S2 (3–9/11) | Core loop | Đặt lịch end-to-end, sổ cọc, alpha nội bộ |
| S3 (10–16/11) | Sad paths + Beta | Khiếu nại, chặn ngày, huỷ; **mở beta cho lớp** |
| S4 (17–23/11) | Fix the beta | Sửa bug beta, beta vòng 2 |
| S5 (24–30/11) | Harden & docs | Seed demo, test case trắng/đen hộp |
| S6 (1–7/12) | Freeze & demo | Đóng băng tính năng, thuyết trình |

Chi tiết: [doc/sprints/ROADMAP.md](./doc/sprints/ROADMAP.md).

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
bộ query. Hợp đồng từng tầng: [doc/adr/006-layered-architecture.md](./doc/adr/006-layered-architecture.md).

### Cấu trúc thư mục

```
.
├── src/
│   ├── app/                   giao diện + api/ (route handlers — tầng HTTP)
│   ├── server/
│   │   ├── services/          nghiệp vụ, transaction
│   │   ├── repositories/      toàn bộ query Prisma
│   │   ├── middleware/        requireRole (RBAC), session
│   │   ├── utils/             zod schemas
│   │   ├── api/withApi.ts     gói { data } / bắt AppError → { error }
│   │   ├── errors.ts
│   │   └── db/client.ts       Prisma singleton
│   └── db/seed.ts             seed demo (idempotent)
├── prisma/schema.prisma       NGUỒN SỰ THẬT schema (16 models)
├── tests/                     vitest — cần database đang chạy
├── doc/                       tài liệu kỹ thuật + adr/
├── AGENTS.md                  luật cho AI agent + người code
├── Dockerfile · docker-compose.yml
└── .github/                   CI + issue/PR templates
```

### Công nghệ

Next.js 15 · TypeScript strict · PostgreSQL 16 · Prisma · Tailwind v4 ·
bcrypt + JWT cookie · Docker Compose · GitHub Actions · Vitest.
Lý do từng lựa chọn nằm trong [doc/adr/](./doc/adr/).

---

## Mô hình dữ liệu

**16 bảng**: `users`, `categories`, `checklist_template_items`, `items`,
`item_photos`, `rate_tiers`, `deposit_policies`, `calendar_days`,
`bookings`, `condition_reports`, `condition_report_entries`,
`damage_claims`, `deposit_ledgers`, `reviews`, `policy_settings`,
`audit_logs`.

Quy tắc nghiệp vụ then chốt — **một (thiết bị, ngày) chỉ có đúng một dòng
CalendarDay, không thể đặt chồng** — được bảo vệ bằng `UNIQUE(itemId, date)`
ở tầng database: bất kỳ đường code nào quên kiểm tra cũng không vượt qua được.
Chi tiết: [doc/data-model.md](./doc/data-model.md).

---

## API

Mọi endpoint trả JSON. Thành công → `{ "data": ... }`, thất bại → `{ "error": "..." }`.

| Method | Đường dẫn | Vai trò | Trạng thái | Mô tả |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | công khai | ✅ | Kiểm tra app + database |
| `POST` | `/api/auth/register` | công khai | 🚧 S1 | Đăng ký buyer/seller |
| `POST` | `/api/auth/login` | công khai | 🚧 S1 | Đăng nhập, cấp cookie |
| `POST` | `/api/auth/logout` | đã đăng nhập | 🚧 S1 | Xoá cookie |
| `GET` | `/api/me` | đã đăng nhập | 🚧 S1 | Thông tin user hiện tại |
| `GET/POST/PATCH` | `/api/admin/users*` | admin | 🚧 S1 | Quản lý user |
| `GET/POST/PATCH` | `/api/items*` | seller | 🚧 S1 | CRUD thiết bị |
| `GET` | `/api/items/available?from=&to=` | buyer | 🚧 S2 | Tìm thiết bị trống theo khung ngày |
| `POST` | `/api/bookings` | buyer | 🚧 S2 | Đặt lịch (transaction: booking + lịch + cọc) |
| `POST` | `/api/bookings/:id/approve` | seller | 🚧 S2 | Duyệt/từ chối |
| `POST` | `/api/bookings/:id/pickup` · `/return` | seller | 🚧 S2 | Biên bản nhận/trả |
| `POST` | `/api/claims*` | seller/buyer | 🚧 S3 | Khiếu nại hư hỏng |
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
npx prisma db push            # đồng bộ schema
npm run db:seed               # nạp dữ liệu mẫu
npm run dev                   # http://localhost:3000
```

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
npm run db:reset     # xoá sạch + migrate + seed lại
```

Test truy vấn PostgreSQL thật — không mock. Chi tiết phạm vi:
[doc/regression-testing.md](./doc/regression-testing.md).

---

## Xử lý sự cố

| Triệu chứng | Cách xử lý |
| --- | --- |
| Cổng 4300/55432 bị chiếm | Sửa vế trái trong `docker-compose.yml` rồi chạy lại |
| `PrismaClient` báo chưa generate | `npx prisma generate` |
| Test báo không nối được DB | Bật `docker compose up -d db`, kiểm tra `DATABASE_URL` |
| Đổi schema nhưng code lỗi type | `npx prisma generate` rồi restart dev server |

---

## Tài liệu kỹ thuật

- [doc/data-model.md](./doc/data-model.md) — ERD, từ điển dữ liệu, máy trạng thái booking
- [doc/backend-flows.md](./doc/backend-flows.md) — hợp đồng API, luồng xử lý, bảng lỗi
- [doc/prod.md](./doc/prod.md) — phạm vi sản phẩm, quy tắc nghiệp vụ, phi phạm vi
- [doc/cicd.md](./doc/cicd.md) — branching, CI/CD, môi trường deploy
- [doc/regression-testing.md](./doc/regression-testing.md) — chiến lược kiểm thử
- [doc/adr/](./doc/adr/) — lý do đằng sau các quyết định thiết kế
- [doc/sprints/](./doc/sprints/) — lộ trình Scrum 6 tuần
- [AGENTS.md](./AGENTS.md) — quy ước code cho người + AI agent
