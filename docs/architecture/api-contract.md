# GearLoop — Hợp đồng API, luồng xử lý và mã lỗi

Hợp đồng phản hồi, quy tắc `withApi`/`AppError`, bảng mã lỗi, bảng trạng thái endpoint, các luồng nghiệp vụ phức tạp (xác thực, đặt lịch, nhả cọc, khiếu nại), quy tắc sổ cọc, validation dùng chung, mã lỗi chưa áp dụng và hợp đồng thông báo.

Nguồn: hợp nhất từ hai tài liệu trước đợt tái cấu trúc — `backend-flows.md` và `error-contract.md` (đã xóa khỏi repo sau hợp nhất; xem git history); bảng trạng thái endpoint từ README.md mục API; đối chiếu `src/lib/`, `src/server/` thực tế ngày 12/11/2026.

---

Tên gọi **Owner** / **Renter** tương ứng role kỹ thuật `OWNER` / `RENTER`.
Payload API và lời gọi `requireRole()` dưới đây dùng đúng giá trị enum hiện tại.

## 1. Hợp đồng phản hồi (mirror template)

Thành công: `{ "data": <kết quả> }` — thất bại:
`{ "error": "<thông điệp tiếng Việt>", "code": "ERR-USR-xxx hoặc ERR-SYS-xxx" }`.
Field `error` là chuỗi; `code` được bổ sung theo Task 5 (#64). Kiểu dùng chung:
`ApiResponse<T>` trong `src/lib/api-response.ts`.

`src/lib/error-catalog.ts` chứa 24 mã ERR-USR và 3 mã ERR-SYS từ Phụ lục B4 của
[gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md);
trong đó 8 mã đang pending (xem mục 10). Thông điệp nằm trong repo; HTTP status
là mapping tích hợp sẵn của catalog.

### 1.1. Quy tắc withApi và AppError

- Mọi route handler bọc bằng `withApi()` (`src/server/api/withApi.ts`): handler
  chỉ trả data; `AppError` → JSON `{ error, code }` kèm đúng mã HTTP.
- Service ném `new AppError("ERR-USR-010")` — **không** truyền
  `(status, message)` hoặc thông điệp tự viết; thông điệp và HTTP status lấy từ
  cùng catalog, không nhận chuỗi lỗi tùy ý.
- Helper `unauthorized()` / `forbidden()` (`src/server/errors.ts`) phục vụ guard
  `requireRole` hiện có, không thay đổi điều kiện kiểm tra quyền. Helper chuỗi
  cũ không còn caller (`badRequest`/`notFound`/`conflict`) được thay bằng
  `AppError(code)`; domain tương lai phải dùng đúng mã theo ngữ cảnh.
- `ERR-USR-005` cần nhãn trường do lập trình viên định nghĩa:
  `new AppError("ERR-USR-005", ["Tiêu đề", "Ảnh"])`. Không đưa giá trị người
  dùng hoặc raw Zod issue vào thông điệp.
- Lỗi chưa phân loại → log marker server không chứa exception/input thô (có thể
  chứa secret), trả HTTP 500 với `ERR-SYS-001` và thông điệp chuẩn. Không tự
  ánh xạ mọi lỗi Prisma thành conflict; service phải xác định ngữ cảnh và retry
  toàn transaction khi phù hợp. `ZodError` ngoài helper validation cũng là lỗi
  hệ thống 500 — không nhầm lỗi dữ liệu nội bộ/output với input của người dùng.
- Ngoại lệ health: `GET /api/health` giữ
  `{ data: { ok: true, db: "up" | "down" } }`; `db: "down"` vẫn là trạng thái
  chẩn đoán hiện có.

## 2. Bảng mã lỗi → HTTP

| HTTP | Khi nào | Ví dụ mã lỗi |
| --- | --- | --- |
| `400` | Input sai thiếu/sai kiểu, khoảng ngày không hợp lệ | ERR-USR-003; ERR-USR-010 khi input login sai cấu trúc |
| `401` | Phiên thiếu/hỏng/hết hạn; thông tin đăng nhập sai | ERR-SYS-003; ERR-USR-010 sau kiểm tra thông tin xác thực |
| `403` | Sai vai trò/không sở hữu; tài khoản bị khóa | ERR-USR-008; ERR-USR-011 |
| `404` | Thiết bị không khả dụng | ERR-USR-004 |
| `409` | Vi phạm trạng thái / trùng dữ liệu / tương tranh | ERR-USR-001; ERR-SYS-002 |
| `500` | Lỗi chưa phân loại | ERR-SYS-001 |

## 3. Xác thực (S1)

```
POST /api/auth/register { email, password, fullName, role: RENTER|OWNER }
  → validate zod → check email unique (409 nếu trùng)
  → bcrypt.hashSync(password, 10) → INSERT users → set cookie JWT (httpOnly)
POST /api/auth/login { email, password }
  → SELECT user → bcrypt.compare → sai → 401 ERR-USR-010 "Thông tin đăng nhập không đúng."
  → đúng → set cookie (payload: { sub, role }, exp 8 giờ) (ADR-008, Q12 chốt 13/11/2026)
```

Cookie: `httpOnly; SameSite=Lax; Secure (production)`. Không localStorage.
Lý do không dùng header demo như template: [ADR-002](./adrs/002-auth.md).
Route login tương lai gọi `parseJsonInput(req, loginSchema, "ERR-USR-010")`
(xem mục 9), rồi chuyển kết quả sang service auth.

## 4. Đặt lịch (S2) — luồng nhiều bước nhất

```
POST /api/bookings { itemId, startDate, endDate }
  1. requireRole(RENTER), validate: endDate >= startDate, trong tương lai
  2. Tính totalVnd từ rate_tiers (khoảng ngày áp tier nào) — snapshot
  3. Tính depositVnd = replacement_value_vnd × percent / 100 (≤ deposit_cap_percent)
  4. prisma.$transaction:
       a. INSERT Booking (REQUESTED, snapshot tiền)
       b. UPDATE CalendarDay SET kind='BOOKED', bookingId=...
          WHERE itemId=... AND date BETWEEN from AND to AND kind='FREE'
          — số dòng cập nhật phải bằng đủ số ngày thuê; thiếu → AppError 409
            "Khung ngày đã có người đặt", rollback cả booking và các ngày đã chiếm
       c. Khóa ngoại ghép bảo đảm lịch và booking cùng item; CHECK/trigger
          kiểm tra kind/bookingId và ngày lịch trong khoảng thuê
       d. INSERT DepositLedger (DEPOSIT_HELD, depositVnd, "Giữ cọc lúc đặt")
          — bỏ qua bút toán nếu depositVnd = 0
       e. UPDATE Booking SET status='DEPOSIT_HELD' (đã hoàn tất bước giữ cọc)
       f. INSERT AuditLog ("booking.create")
  5. Bất kỳ bước nào ném lỗi → rollback toàn bộ. Unique chỉ chặn dòng lịch
     trùng, không tự tạo SELECT FOR UPDATE và không chặn UPDATE ghi đè.
  6. Owner duyệt: DEPOSIT_HELD → APPROVED; không ghi thêm DEPOSIT_HELD.
```

Ràng buộc DB tương ứng: [database-design.md](./database-design.md).

## 5. Nhả cọc tự động (S2)

Cron/on-read check: `booking.status = RETURNED` và `now > returnedAt +
claim_window_hours` và không có claim OPEN/UNDER_REVIEW → transaction:
`ledger RELEASE` + `AuditLog("ledger.auto_release", actorId=null)` +
`status = CLOSED`. Admin có nút "chạy kiểm tra ngay" (dev-only, env flag)
để demo không phải đợi 48h.

`returnedAt` do DB ghi một lần khi status chuyển sang RETURNED, không cho client
gán hoặc sửa lại. Các cập nhật booking/ledger sau đó không dịch mốc này. Mốc thời
gian được ghi UTC. Service tương lai phải đọc returnedAt, không dùng updatedAt.

## 6. Xét khiếu nại (S3)

```
POST /api/admin/claims/:id/resolve { amountAwardedVnd }
  1. requireRole(ADMIN)
  2. claim phải UNDER_REVIEW; award phải ≤ booking.depositVnd (400 nếu vượt)
  3. transaction: claim → RESOLVED (resolvedById, resolvedAt)
     + ledger: DEDUCT (award, nếu > 0) và RELEASE (deposit − award, nếu còn lại)
     + booking → RESOLVED
     + AuditLog với diff số tiền
```

Số tiền quyết định **luôn** thuộc Admin — hệ thống chỉ gợi ý từ diff hai biên
bản, không tự quyết (không AI, đúng giới hạn môn học). Quy tắc sổ cọc chi tiết
xem mục 7 và [ADR-004](./adrs/004-deposit-ledger.md).

## 7. Quy tắc sổ cọc (DepositLedger)

- Ledger dùng số tiền **dương** (Int VND) và `eventKey` ổn định do server tạo,
  giữ nguyên khi retry — retry không sinh khóa mới.
- Cùng sự kiện phân xử dùng chung `eventKey` cho DEDUCT và RELEASE; unique
  `(bookingId, eventKey, type)` chặn ghi lại cùng loại bút toán của cùng sự kiện.
- DB từ chối: bút toán trùng, chi vượt số dư (tổng RELEASE + DEDUCT + VOID
  không vượt DEPOSIT_HELD, kể cả khi hai tác vụ dùng eventKey khác nhau) và mọi
  UPDATE/DELETE ledger (append-only).
- `VOID` hủy phần cọc còn giữ khi từ chối: số tiền phải bằng số dư còn lại,
  không ghi thêm `RELEASE` cho chính phần tiền đã VOID; không ghi bút toán
  số tiền 0.
- Award trong phân xử phải ≤ `booking.depositVnd` (400 nếu vượt). Kết luận
  nhóm ngày 13/11/2026: **service validate là chính** — vượt cọc → HTTP `400`
  với mã USR theo catalog (`src/lib/error-catalog.ts`). Catalog hiện chưa có
  mã riêng cho "award vượt cọc" (ERR-USR-019 hiện diễn đạt giới hạn tỷ lệ
  0–100%) — pod C chốt mã cụ thể trước khi làm E2-F5-T3.
- DB giữ CHECK một dòng làm lưới an toàn cho phần diễn đạt được trên một dòng
  của chính bảng `DamageClaim` (DB hiện **chưa có** CHECK này; sẽ bổ sung cùng
  migration khi pod C xác nhận).
- Ràng buộc liên bảng `amountAwardedVnd <= Booking.depositVnd` không diễn đạt
  được bằng CHECK một dòng → bị chặn gián tiếp bởi trigger sổ cọc (tổng
  `RELEASE + DEDUCT + VOID` không vượt `DEPOSIT_HELD`) và bởi service.

## 8. Bảng trạng thái endpoint

Bảng tổng hợp từ README.md mục API và các luồng ở trên; tài liệu này là nơi
sở hữu bảng. Hiện trạng kiểm tra 12/11/2026: chỉ `GET /api/health` đã có trong
`src/app/api/`; các dòng 🚧 là kế hoạch sprint, chưa tồn tại trong repo.

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

## 9. Validation dùng chung

- Schema thuần trong `src/lib/validation/` dùng lại ở form và API Route, không
  import DB/session/Next server; helper server vẫn ở `src/server/utils/`
  (`parseInput`, `parseJsonInput`). Không chuyển sang Server Actions.
- `loginSchema` (`src/lib/validation/auth.ts`): email hợp lệ, trim email;
  password không rỗng và giữ nguyên ký tự. Không tự đặt chính sách độ dài mật
  khẩu đăng ký; không nhận role từ form login.
- `dateRangeSchema` (`src/lib/validation/date-range.ts`): chuỗi YYYY-MM-DD hợp
  lệ theo UTC, `endDate >= startDate`. Cùng ngày hợp lệ theo data model. Câu
  chữ B4 của ERR-USR-003 vẫn giữ "sau". Chưa thêm kiểm tra hôm nay/múi giờ hoặc
  chính sách cọc.
- Form dùng `safeParse` cùng schema, giữ input khi lỗi. Schema trả thông điệp
  catalog, không dùng thông điệp tiếng Anh mặc định của Zod.
- Server dùng `parseInput(schema, input, code)` hoặc
  `parseJsonInput(req, schema, code)` **trước mọi thao tác ghi**. Code thuộc
  `ValidationErrorCode` và phải phù hợp ngữ cảnh; validation/JSON syntax trả 400.
- Ví dụ: input login sai cấu trúc dùng ERR-USR-010/400; xác thực thất bại sau
  parse dùng `new AppError("ERR-USR-010")` → 401. Ngày sai dùng ERR-USR-003/400.

## 10. Các mã lỗi chưa được áp dụng (pending)

`ActiveErrorCode` loại mã pending khỏi API TypeScript; runtime cũng chặn phát
mã pending. Có mã trong catalog không đồng nghĩa quy tắc đã được triển khai.

| Mã | Điểm cần review trước khi dùng |
| --- | --- |
| ERR-USR-006/014 | Dải cọc 20–50%, giá > 0 chưa khớp mọi ràng buộc hiện tại |
| ERR-USR-012 | Đối chiếu cửa sổ claim B4 với quy tắc hiện tại |
| ERR-USR-015 | Schema không có EXPIRED |
| ERR-USR-021 | Chính sách hủy muộn chưa chốt; có thể là cảnh báo |
| ERR-USR-022 | Quy tắc self-booking chưa chốt |
| ERR-USR-023 | Ràng buộc lý do xử lý chưa chốt |
| ERR-USR-024 | Quy trình khóa user còn booking chưa chốt |

- Repo giữ ADMIN/OWNER/RENTER, khóa user bằng `isActive`. Mô tả B4 dùng
  CONFIRMED/REQUESTED phải đối chiếu APPROVED/DEPOSIT_HELD khi triển khai
  domain service; không bổ sung chuyển trạng thái hay thay schema từ phía
  hợp đồng này.
- B4 chưa có mã input tổng quát, email trùng hoặc mọi loại tài nguyên 404.
  Domain mới cần nhóm bổ sung/chốt catalog; không dùng sai mã 005 để lấp chỗ trống.

## 11. Hợp đồng thông báo (NTF) — ghi nhận để review

Nguồn B3 có danh sách sự kiện nhưng chưa đủ payload/template để triển khai.
Hợp đồng dưới đây ghi nhận để review; chưa thêm bảng, chưa phát thông báo,
chưa tích hợp email.

| Mã | Sự kiện B3 | Người nhận theo B3 |
| --- | --- | --- |
| NTF-001 | Tạo yêu cầu thuê | Chủ thiết bị |
| NTF-002 | Duyệt yêu cầu | Người thuê |
| NTF-003 | Từ chối yêu cầu | Người thuê |
| NTF-004 | Hết hạn chờ duyệt 24h — đề xuất | Hai phía |
| NTF-005 | Người thuê hủy | Chủ thiết bị |
| NTF-006 | Chủ thiết bị hủy | Người thuê |
| NTF-007 | Xác nhận nhận đồ | Chủ thiết bị |
| NTF-008 | Xác nhận trả đồ | Người thuê |
| NTF-009 | Tự nhả cọc | Hai phía |
| NTF-010 | Mở khiếu nại | Phía đối diện và admin |
| NTF-011 | Phân xử xong | Hai phía |
| NTF-012 | Admin khóa user | User bị khóa |
| NTF-013 | Admin ẩn item | Chủ thiết bị |

Điểm mở cần review chốt:

- Payload tối thiểu, quyền xem, template, khóa chống phát trùng, đã đọc/chưa
  đọc, thời gian lưu.
- Ánh xạ tác nhân và trạng thái B3 sang ADR hiện tại.
- NTF-004 chưa được phát khi chưa có quyết định về EXPIRED.
- NTF-001 chỉ phát ở luồng tạo booking, không phát lại khi đọc danh sách thông báo.
- Việc bảo đảm commit booking rồi mới phát thuộc task notification tương lai.

---

Nguồn gốc: hợp nhất từ `backend-flows.md` và `error-contract.md` (hai file gốc
đã được xóa khỏi repo sau hợp nhất; không giữ lại các mục bàn giao PR/regression
lịch sử — xem git history).
