# ADR-003: Lịch ngày materialized + UNIQUE(item_id, date)

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** ADR-004 của template (partial unique index — analog trực tiếp)

## Bối cảnh

Câu hỏi lõi của GearLoop: "ngày X của thiết bị Y còn trống không?" Hai cách
mô hình hóa: **derived** (chỉ lưu booking, availability = anti-join query) và
**materialized** (một dòng `calendar_days` cho mỗi ngày).

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **Derived availability** | Ít bảng | Chống đặt chồng phải nằm trong app code — race-prone; sad path "đặt chồng" không demo được; ERD kém ấn tượng |
| **Materialized + UNIQUE** ✅ | Ràng buộc sống còn nằm ở **DB**, không đường code nào vượt qua; block/blocking/maintenance là CRUD data; sad path demo tức thì | 1 dòng/ngày/thiết bị (60 ngày × N item — không đáng kể ở scale lớp học) |

## Quyết định

`CalendarDay(itemId, date, kind: FREE|BOOKED|BLOCKED, bookingId?)` với
`@@unique([itemId, date])`. Seed tạo sẵn 60 ngày `FREE` mỗi item. Đặt/huỷ chỉ
**đổi `kind`** (khác template: họ INSERT/để dòng cancelled nằm lại nên cần
partial index — GearLoop giữ dòng cố định nên unique thuần đủ, xem
database-design.md mục 4).

## Hệ quả

- Đặt booking = transaction (booking + chiếm đủ lịch FREE + ledger DEPOSIT_HELD).
  Unique chỉ chặn INSERT trùng; UPDATE phải có điều kiện FREE và kiểm tra số dòng.
- Khóa ngoại ghép buộc lịch/booking cùng item. CHECK bảo vệ kind/bookingId;
  trigger kiểm tra khoảng ngày và bảo vệ khi sửa ngược từ booking.
- Follow-up: trigger gắn lịch tạo phiên bản mới của dòng Booking bằng UPDATE
  không đổi startDate. Chỉ khóa FOR SHARE không đủ khi updater dùng snapshot
  REPEATABLE READ từ trước lúc lịch được thêm. Lỗi serialization phải retry
  toàn transaction ở tầng service khi luồng booking được triển khai.
- Owner "chặn ngày bảo trì" = CRUD `kind = BLOCKED` — không logic đặc biệt.
- Giới hạn 60 ngày nhìn thấy trước — mở rộng là một job chạy hằng ngày (không blocking).
