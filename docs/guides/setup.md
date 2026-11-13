# GearLoop — Hướng dẫn thiết lập môi trường

Ba cách khởi chạy GearLoop (Codespaces, Docker, Node trực tiếp), tài khoản demo, biến môi trường và cách chạy kiểm thử local.

Nguồn: README.md, Makefile, .env.example, docker-compose.yml, Dockerfile, .github/workflows/ci.yml.

## 1. Chọn cách chạy

| Cách | Dành cho | Cần cài trên máy |
| --- | --- | --- |
| GitHub Codespaces (khuyên dùng) | Chạy thử/demo, không muốn cài gì | Chỉ tài khoản GitHub |
| Docker local | Chạy sản phẩm như bản đóng gói | Docker Desktop |
| Node trực tiếp | Đang sửa code | Node.js 20+, npm; PostgreSQL lấy từ Docker |

Việc cần làm theo sprint và quy trình nhóm: [../planning/backlog.md](../planning/backlog.md).

## 2. Cách 1 — GitHub Codespaces (khuyên dùng)

Không cần cài Docker/Node/PostgreSQL trên máy — mọi thứ chạy trên trình duyệt.

1. Đăng nhập [github.com](https://github.com) và mở repo `https://github.com/BTL-IT3180/gearloop`.
2. Bấm nút xanh **Code** → tab **Codespaces** → **Create codespace on main**; đợi trình duyệt mở cửa sổ VS Code trên web.
3. Trong terminal của Codespace chạy `docker compose up --build`, đợi log hiện `Ready`.
4. Codespace tự phát hiện cổng `4300` → bấm **Open in Browser**. Bỏ lỡ thì vào tab **PORTS** → dòng `4300` → biểu tượng địa cầu.

Chia sẻ link cho người khác xem: tab **PORTS** → chuột phải dòng `4300` → **Port Visibility** → **Public**. Đóng Codespace khi xong để tiết kiệm giờ miễn phí: [github.com/codespaces](https://github.com/codespaces) → **Stop codespace**.

## 3. Cách 2 — Chạy bằng Docker

Cần Docker Desktop đang chạy:

```bash
git clone git@github.com:BTL-IT3180/gearloop.git
cd gearloop
docker compose up --build
```

Đợi log hiện `Ready` rồi mở `http://localhost:4300`. Container tự chạy migration và nạp dữ liệu mẫu ở lần khởi động đầu tiên (seed giữ dữ liệu nghiệp vụ — xem mục 8).

### Cổng sử dụng

| Dịch vụ | Cổng | Ghi chú |
| --- | --- | --- |
| Ứng dụng GearLoop | `4300` | Next.js phục vụ cả giao diện lẫn API; container lắng nghe `3000`, ánh xạ ra `4300` |
| PostgreSQL | `55432` | Cổng lạ tránh đụng PostgreSQL `5432` có sẵn trên máy |

Lệnh Docker hàng ngày:

```bash
docker compose up -d          # chạy nền
docker compose logs -f app    # xem log ứng dụng
docker compose down           # dừng, GIỮ dữ liệu
docker compose down -v        # dừng và XOÁ SẠCH dữ liệu
```

## 4. Cách 3 — Chạy Node trực tiếp (khi đang sửa code)

Cần Node.js 20+ và một PostgreSQL đang chạy (có thể chỉ bật DB của Docker):

```bash
docker compose up -d db       # chỉ bật database
npm install
cp .env.example .env          # giữ nguyên DATABASE_URL mặc định
npm run db:deploy             # cài schema, gồm các CHECK/trigger
npm run db:seed               # nạp dữ liệu mẫu
npm run dev                   # http://localhost:3000
```

Makefile hỗ trợ các phím tắt tương ứng (chạy trong Git Bash/Make): `make db` — bật PostgreSQL và chờ container healthy; `make setup` — lần đầu: migrate + seed (bỏ qua seed nếu đã có booking/ledger/audit); `make dev` — migrate rồi chạy `npm run dev`, không seed lại, không xoá dữ liệu; `make down` — dừng container, giữ dữ liệu trong volume; `make reset` — `docker compose down -v` rồi `make setup` (xoá volume chứa dữ liệu PostgreSQL).

## 5. Biến môi trường

Sao chép `.env.example` thành `.env` (cách 3; Makefile tự sao chép nếu thiếu). Không commit `.env` — repo chỉ nhận `.env.example` với giá trị mẫu.

| Biến | Giá trị mặc định trong `.env.example` | Ý nghĩa |
| --- | --- | --- |
| `DATABASE_URL` | `postgres://gearloop:gearloop@localhost:55432/gearloop` | Chuỗi kết nối PostgreSQL |
| `AUTH_SECRET` | `change-me-to-a-random-32-char-min-string` (placeholder — hãy thay) | Secret ký session cookie, tối thiểu 32 ký tự ngẫu nhiên |
| `NODE_ENV` | `development` | Môi trường chạy của Node |

`docker-compose.yml` tự đặt `DATABASE_URL` (trỏ tới service `db`) và `AUTH_SECRET` riêng cho container, không đọc `.env`.

## 6. Tài khoản demo

**Mật khẩu cho mọi tài khoản: `demo123`.** Trong tài liệu, Owner là chủ thiết bị và Renter là người thuê; tên role trong schema/API là `OWNER`, `RENTER` và `ADMIN`.

| Vai trò | Email | Làm được gì |
| --- | --- | --- |
| Quản trị (Admin) | `admin@gearloop.local` | Quản lý user, category/checklist, xét khiếu nại, xem audit log |
| Chủ thiết bị (Owner) | `mai@gearloop.local` | Đăng tin máy ảnh, quản lý giá/cọc, duyệt booking, ghi biên bản |
| Chủ thiết bị (Owner) | `lan@gearloop.local` | Đăng tin đồ cắm trại, chặn ngày bảo trì |
| Người thuê (Renter) | `an@gearloop.local` | Tìm thiết bị, đặt theo khung ngày, khiếu nại, đánh giá |
| Người thuê (Renter) | `linh@gearloop.local` | Tài khoản Renter phụ |
| Người thuê (Renter) | `huy@gearloop.local` | Tài khoản Renter phụ |

Kiểm tra app và database đã lên: `curl http://localhost:4300/api/health` trả `{"data":{"ok":true,"db":"up"}}` (với Node trực tiếp, cổng là `3000`).

## 7. Chạy kiểm thử

### 7.1. File `.env.test` — bắt buộc cho `make test`

`make test` dùng database riêng `gearloop_test` và đọc biến môi trường từ file `.env.test` ở thư mục gốc. File này **bị gitignore và repo không kèm template** — mỗi người tự tạo trước lần chạy test đầu tiên. Thiếu file, `make test` dừng ngay với lỗi "Chưa có file .env.test"; `DATABASE_URL` không trỏ tới database tên `gearloop_test` cũng bị từ chối.

Nội dung mẫu đề xuất (đặt cùng cấp với Makefile):

```bash
DATABASE_URL=postgres://gearloop:gearloop@localhost:55432/gearloop_test
AUTH_SECRET=test-secret-do-not-use-in-prod-0123456789abcdef
```

Makefile chỉ bắt buộc kiểm tra `DATABASE_URL` trỏ tới `gearloop_test`; `AUTH_SECRET` đưa vào để đủ biến môi trường cho ứng dụng như `.env`. Với giá trị trên, `make test` tự tạo database `gearloop_test` nếu chưa có (qua `psql` trong container), chạy `migrate deploy`, seed rồi `npm test`. Cảnh báo của Makefile: dữ liệu trong database kiểm thử có thể bị xóa khi seed.

### 7.2. Lệnh nhanh

```bash
make test                     # đầy đủ: kiểm tra .env.test + tạo/kiểm tra gearloop_test + migrate + seed + npm test

# hoặc thủ công, sau khi DB test đã được migrate + seed:
docker compose up -d db
DATABASE_URL="postgres://gearloop:gearloop@localhost:55432/gearloop_test" npm test

npm run lint                  # ESLint — không cần DB
npm run typecheck             # tsc --noEmit — không cần DB

npx playwright install chromium   # cài browser một lần
DATABASE_URL="******localhost:55432/gearloop_test" npm run test:e2e
```

`make test` chuẩn bị database rồi chạy Vitest. Khi chạy E2E thủ công, DB test
cũng phải được migrate + seed trước vì các case auth đăng nhập bằng tài khoản
seed; Playwright tự khởi động Next.js. Cả hai suite truy vấn PostgreSQL thật —
không mock; Vitest chạy tuần tự vì dùng chung database. Phạm vi từng bộ test:
[../testing/test-strategy.md](../testing/test-strategy.md).

## 8. Ghi chú seed và migration

- Thứ tự bắt buộc: `npm run db:deploy` (`prisma migrate deploy`) **trước** `npm run db:seed`. Migration cài CHECK, partial unique index và trigger mà `db push` không tạo — không dùng `db push` để đồng bộ schema.
- Docker tự lo: lệnh khởi động container chạy `migrate deploy` rồi seed trước khi mở cổng app.
- Seed giữ dữ liệu nghiệp vụ: trước khi wipe, seed kiểm tra `Booking`, `DepositLedger`, `AuditLog`; còn dữ liệu ở bất kỳ bảng nào thì bỏ qua và exit 0 để app tiếp tục chạy. Khi cả ba bảng trống, dữ liệu mẫu được tạo lại trong một transaction SERIALIZABLE; lỗi giữa chừng rollback toàn bộ và `CalendarDay` được xoá trước `Booking`. Không vô hiệu trigger append-only của ledger/audit để seed.
- Không reset DB dùng chung. `npm run db:reset` (xoá sạch dữ liệu + migrate + seed lại) và `make reset` (xoá Docker volume) chỉ dùng cho database local có thể mất dữ liệu, là thao tác riêng có chủ đích.
- DB đã tạo bằng `db push` không chạy migration đầu tiên trực tiếp; DB OWNER cần chuẩn bị baseline/upgrade riêng. Chi tiết ràng buộc và lịch sử migration: [../architecture/database-design.md](../architecture/database-design.md) và [../architecture/adrs/005-prisma-migrations.md](../architecture/adrs/005-prisma-migrations.md).

## 9. Xử lý sự cố

| Triệu chứng | Cách xử lý |
| --- | --- |
| Cổng `4300`/`55432` bị chiếm | Sửa vế trái trong `docker-compose.yml` rồi chạy lại |
| `PrismaClient` báo chưa generate | `npx prisma generate` |
| Test báo không nối được DB | Bật `docker compose up -d db`, kiểm tra `DATABASE_URL` (và file `.env.test` khi dùng `make test`) |
| Đổi schema nhưng code lỗi type | `npx prisma generate` rồi restart dev server |

Ghi chú: nếu source đặt trong thư mục đồng bộ cloud (OneDrive/iCloud/Dropbox), filesystem chậm có thể làm `next dev` khởi động lâu — nên đặt project ở ổ thường.
