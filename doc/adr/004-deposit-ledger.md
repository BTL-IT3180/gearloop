# ADR-004: Sổ cọc append-only, tiền là Int VND

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** [ADR-003](./003-calendar-materialized.md)

## Bối cảnh

Tiền cọc là "dòng tiền" của GearLoop: HOLD lúc đặt, RELEASE lúc trả đủ, DEDUCT
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
- Số dư hiện hành = SUM(ledger) của booking. Snapshot tiền cọc tại thời điểm
  đặt nằm ở `bookings.deposit_vnd` (chủ sửa giá không làm lệch sổ cũ).
- Mọi số tiền: **Int VND** (đồng, không số lẻ) — tránh floating point; field
  đặt tên `*Vnd`.

## Hệ quả

- Admin xét claim chỉ được INSERT `DEDUCT` ≤ deposit — hệ thống chặn vượt.
- Timer nhả cọc ghi dòng với `created_by_id = NULL` (hệ thống) + `audit_logs`.
- Không có cổng thanh toán thật (phi phạm vi) — sổ cọc là mô phỏng có chủ ý.
