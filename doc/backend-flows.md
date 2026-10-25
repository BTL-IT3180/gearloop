# GearLoop — Hợp đồng API & luồng xử lý

Trạng thái endpoint (✅ đã có · 🚧 kế hoạch sprint): xem bảng trong
[README.md](../README.md#api). Tài liệu này mô tả **hợp đồng chung** và các
luồng có logic phức tạp.

---

## 1. Hợp đồng phản hồi (mirror template)

Thành công: `{ "data": <kết quả> }` — thất bại: `{ "error": "<thông điệp tiếng Việt>" }`.

Mọi route handler bọc bằng `withApi()` (`src/server/api/withApi.ts`):
handler chỉ trả data; `AppError` → JSON `{ error }` kèm đúng mã HTTP; lỗi lạ
→ log server, trả `500 { "error": "Lỗi hệ thống" }`.

## 2. Bảng mã lỗi

| HTTP | Khi nào | Ví dụ thông điệp |
| --- | --- | --- |
| `400` | Input sai thiếu/sai kiểu | `"Ngày trả phải sau ngày nhận"` |
| `401` | Chưa đăng nhập / cookie hỏng | `"Chưa đăng nhập"` |
| `403` | Đúng người, sai vai trò hoặc không sở hữu | `"Không đủ quyền"` |
| `404` | Không tồn tại hoặc đã archived | `"Không tìm thấy thiết bị"` |
| `409` | Vi phạm trạng thái / trùng dữ liệu | `"Khung ngày đã có người đặt"` |
| `500` | Lỗi chưa phân loại | `"Lỗi hệ thống"` |

## 3. Xác thực (S1)

```
POST /api/auth/register { email, password, fullName, role: BUYER|SELLER }
  → validate zod → check email unique (409 nếu trùng)
  → bcrypt.hashSync(password, 10) → INSERT users → set cookie JWT (httpOnly)
POST /api/auth/login { email, password }
  → SELECT user → bcrypt.compare → sai → 401 "Email hoặc mật khẩu không đúng"
  → đúng → set cookie (payload: { sub, role }, exp 7 ngày)
```

Cookie: `httpOnly; SameSite=Lax; Secure (production)`. Không localStorage.
Lý do không dùng header demo như template: [ADR-002](./adr/002-demo-auth.md).

## 4. Đặt lịch (S2) — luồng nhiều bước nhất

```
POST /api/bookings { itemId, startDate, endDate }
  1. requireRole(BUYER), validate: endDate >= startDate, trong tương lai
  2. Tính totalVnd từ rate_tiers (khoảng ngày áp tier nào) — snapshot
  3. Tính depositVnd = replacement_value_vnd × percent / 100 (≤ deposit_cap_percent)
  4. prisma.$transaction:
       a. SELECT các CalendarDay (itemId, from..to) FOR UPDATE ngầm qua unique
          — nếu bất kỳ dòng nào ≠ FREE → AppError 409 "Khung ngày đã có người đặt"
       b. UPDATE CalendarDay SET kind='BOOKED', bookingId=... WHERE id IN (...) AND kind='FREE'
       c. INSERT Booking (REQUESTED, snapshot tiền)
       d. INSERT DepositLedger (HOLD, depositVnd, "Giữ cọc lúc đặt")
       e. INSERT AuditLog ("booking.create")
  5. Bất kỳ bước nào ném lỗi → rollback toàn bộ (có check-then-act giữa a–b
     được chặn bởi UNIQUE(item_id, date) — xem data-model.md mục 4)
```

## 5. Nhả cọc tự động (S2)

Cron/on-read check: `booking.status = RETURNED` và `now > updatedAt +
claim_window_hours` và không có claim OPEN/UNDER_REVIEW → transaction:
`ledger RELEASE` + `AuditLog("ledger.auto_release", actorId=null)` +
`status = CLOSED`. Admin có nút "chạy kiểm tra ngay" (dev-only, env flag)
để demo không phải đợi 48h.

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
bản, không tự quyết (không AI, đúng giới hạn môn học).
