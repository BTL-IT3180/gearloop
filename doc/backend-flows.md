# GearLoop — Hợp đồng API & luồng xử lý

Trạng thái endpoint (✅ đã có · 🚧 kế hoạch sprint): xem bảng trong
[README.md](../README.md#api). Tài liệu này mô tả **hợp đồng chung** và các
luồng có logic phức tạp.

Tên gọi **Owner** / **Renter** tương ứng role kỹ thuật `OWNER` / `RENTER`.
Payload API và lời gọi `requireRole()` bên dưới dùng đúng giá trị enum hiện tại.

---

## 1. Hợp đồng phản hồi (mirror template)

Thành công: `{ "data": <kết quả> }` — thất bại:
`{ "error": "<thông điệp tiếng Việt>", "code": "ERR-USR-xxx hoặc ERR-SYS-xxx" }`.
Field `error` tiếp tục là chuỗi; `code` được bổ sung ở E0-F1-T5 (#64).
Kiểu dùng chung: `ApiResponse<T>` trong `src/lib/api-response.ts`.

Mọi route handler bọc bằng `withApi()` (`src/server/api/withApi.ts`):
handler chỉ trả data; `AppError` → JSON `{ error, code }` kèm đúng mã HTTP.
Lỗi lạ → log marker server không chứa exception/input thô, trả HTTP 500 với
ERR-SYS-001 và thông điệp chuẩn. Không tự ánh xạ mọi lỗi Prisma thành conflict;
service phải xác định ngữ cảnh và retry toàn transaction khi phù hợp.

## 2. Bảng mã lỗi

| HTTP | Khi nào | Ví dụ mã lỗi |
| --- | --- | --- |
| `400` | Input sai thiếu/sai kiểu, khoảng ngày không hợp lệ | ERR-USR-003; ERR-USR-010 khi input login sai cấu trúc |
| `401` | Phiên thiếu/hỏng/hết hạn; thông tin đăng nhập sai | ERR-SYS-003; ERR-USR-010 sau kiểm tra thông tin xác thực |
| `403` | Sai vai trò/không sở hữu; tài khoản bị khóa | ERR-USR-008; ERR-USR-011 |
| `404` | Thiết bị không khả dụng | ERR-USR-004 |
| `409` | Vi phạm trạng thái / trùng dữ liệu / tương tranh | ERR-USR-001; ERR-SYS-002 |
| `500` | Lỗi chưa phân loại | ERR-SYS-001 |

Chi tiết catalog B4, schema dùng chung và các quyết định chờ review:
[error-contract.md](./error-contract.md).

## 3. Xác thực (S1)

```
POST /api/auth/register { email, password, fullName, role: RENTER|OWNER }
  → validate zod → check email unique (409 nếu trùng)
  → bcrypt.hashSync(password, 10) → INSERT users → set cookie JWT (httpOnly)
POST /api/auth/login { email, password }
  → SELECT user → bcrypt.compare → sai → 401 ERR-USR-010 "Thông tin đăng nhập không đúng."
  → đúng → set cookie (payload: { sub, role }, exp 7 ngày)
```

Cookie: `httpOnly; SameSite=Lax; Secure (production)`. Không localStorage.
Lý do không dùng header demo như template: [ADR-002](./adr/002-auth.md).

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

Ledger dùng số tiền dương và eventKey ổn định. Cùng sự kiện phân xử dùng chung
eventKey cho DEDUCT và RELEASE; retry không sinh khóa mới. DB từ chối bút toán
trùng, chi vượt số dư và UPDATE/DELETE ledger. Chi tiết: ADR-004.

Số tiền quyết định **luôn** thuộc Admin — hệ thống chỉ gợi ý từ diff hai biên
bản, không tự quyết (không AI, đúng giới hạn môn học).
