# GearLoop — Chiến lược kiểm thử & regression

Triết lý mirror từ template: **bộ test bảo vệ tính năng đã có**, chạy lại sau
mỗi story mới để code mới không làm vỡ luồng cũ. Test dùng HTTP thật và
PostgreSQL thật — **không mock** (mock chỉ che giấu lỗi tích hợp).

## 1. Phạm vi hiện tại (S1)

`tests/smoke.test.ts` — nền móng:

- Seed tạo đúng số lượng users/categories/items + bcrypt hash (không plaintext).
- Mỗi item có đủ tier, cọc, ảnh gốc, 60 ngày lịch.
- **Ràng buộc sống còn**: `@@unique([itemId, date])` chặn đặt chồng ở tầng DB.
- Phạm vi đối chứng: cùng ngày khác item vẫn hợp lệ (ràng buộc đúng phạm vi).

## 2. Kế hoạch mở rộng theo sprint

| Sprint | Thêm test |
| --- | --- |
| S2 | Luồng booking: tạo → lịch flip BOOKED → ledger HOLD; hủy → VOID; chồng ngày → 409 |
| S3 | Claim: chỉ mở khi NOT_OK; award > deposit → 400; resolve → ledger DEDUCT |
| S4 | Regression pool: mọi bug beta P0/P1 được kèm 1 test tái hiện |
| S5 | Test case trắng/đen hộp cho môn học (white-box: createBooking, resolveClaim) |

## 3. Quy ước

- **Chạy tuần tự** (`vitest run`, không parallel suite) vì dùng chung 1 database.
- Mỗi file test **tự seed lại trạng thái cần thiết** — không phụ thuộc thứ tự file.
- Database test riêng (`gearloop_test`) — không đụng DB dev.
- Test phải deterministic: không sleep ngẫu nhiên, không phụ thuộc thứ tự fetch.
- Bug không có test tái hiện = bug chưa sửa xong (áp dụng từ S3).

## 4. Cách chạy nhanh

```bash
docker compose up -d db
DATABASE_URL="postgres://gearloop:gearloop@localhost:55432/gearloop" npm test
```
(CI tự làm các bước này với `gearloop_test`.)
