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
data-model.md mục 4).

## Hệ quả

- Đặt booking = transaction (booking + flip lịch + ledger HOLD); race bị unique chặn.
- Seller "chặn ngày bảo trì" = CRUD `kind = BLOCKED` — không logic đặc biệt.
- Giới hạn 60 ngày nhìn thấy trước — mở rộng là một job chạy hằng ngày (không blocking).
