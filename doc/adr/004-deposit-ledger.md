# ADR-004: Sổ cọc append-only, tiền là Int VND

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** [ADR-003](./003-calendar-materialized.md)

## Bối cảnh

Tiền cọc là "dòng tiền" của GearLoop: DEPOSIT_HELD lúc đặt, RELEASE lúc trả đủ, DEDUCT
khi có bồi thường, VOID lúc từ chối. Cần sổ sách kiểm chứng được cho demo và
cho test.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| Cột `deposit_balance` trên Booking, UPDATE trực tiếp | Truy vấn nhanh | Không ai giải thích được số tiền đã đi qua đâu; bug = mất lịch sử |
| **DepositLedger append-only** ✅ | Mỗi biến động một dòng (`type, amount, reason, actor`); audit log tự nhiên; demo sổ cọc rất trực quan | Phải SUM để biết hiện trạng — chấp nhận được |

## Quyết định

- `deposit_ledgers(booking_id, type, amount_vnd, reason, created_by_id)` —
  **chỉ INSERT, không bao giờ UPDATE/DELETE**.
- Mỗi `amountVnd` là số nguyên **dương**. Số dư hiện hành =
  `SUM(DEPOSIT_HELD) - SUM(RELEASE) - SUM(DEDUCT) - SUM(VOID)` của booking.
  `VOID` hủy phần cọc còn giữ: số tiền phải bằng số dư còn lại, không ghi thêm
  `RELEASE` cho chính phần tiền đã VOID. Không ghi bút toán số tiền 0.
  Snapshot tiền cọc tại thời điểm
  đặt nằm ở `bookings.deposit_vnd` (chủ sửa giá không làm lệch sổ cũ).
- Mọi số tiền: **Int VND** (đồng, không số lẻ) — tránh floating point; field
  đặt tên `*Vnd`.
- `eventKey` là khóa sự kiện ổn định do server tạo, giữ nguyên khi retry.
  Unique `(bookingId, eventKey, type)` chặn ghi lại cùng loại bút toán của cùng
  sự kiện; một lần phân xử vẫn ghi được cả DEDUCT và RELEASE chung eventKey.
  Partial unique index bảo đảm chỉ một DEPOSIT_HELD mỗi booking, bằng đúng
  `depositVnd`. Booking cọc 0 không ghi bút toán.
- Trigger serialize các INSERT ledger bằng UPDATE khóa dòng Booking rồi đọc
  lại tổng tiền. Tổng RELEASE + DEDUCT + VOID không được vượt DEPOSIT_HELD,
  kể cả khi hai tác vụ dùng eventKey khác nhau. UPDATE này không đổi updatedAt.
- Trigger từ chối UPDATE/DELETE ledger và đổi `depositVnd` đã có bút toán.
  Seed hiện tại dùng DELETE, nên sẽ bị từ chối nếu DB đã có ledger; chỉ seed DB
  local/test trống. Không tắt trigger để seed lại DB dùng chung.

## Hệ quả

- Admin xét claim chỉ được INSERT `DEDUCT` ≤ deposit — hệ thống chặn vượt.
- Timer nhả cọc ghi dòng với `created_by_id = NULL` (hệ thống) + `audit_logs`.
- Không có cổng thanh toán thật (phi phạm vi) — sổ cọc là mô phỏng có chủ ý.
