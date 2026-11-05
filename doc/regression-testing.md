# GearLoop — Chiến lược kiểm thử & regression

Triết lý mirror từ template: **bộ test bảo vệ tính năng đã có**, chạy lại sau
mỗi story mới để code mới không làm vỡ luồng cũ. Test dùng HTTP thật và
PostgreSQL thật — **không mock** (mock chỉ che giấu lỗi tích hợp).

## 1. Phạm vi hiện tại (S1)

`tests/api-contract.test.ts` — Task 5 (#64), không cần DB:

- Catalog B4 và guard không phát mã pending; template 005 cần nhãn trường.
- Schema login và ngày UTC: sai kiểu/thiếu trường, ngày không tồn tại, năm nhuận,
  khoảng đảo ngược, thuê cùng ngày; email trim, password/input gốc không đổi.
- Gọi withApi bằng Request/Response thật, không mock: success envelope,
  AppError/status/code, JSON/input sai bị từ chối trước thao tác tiếp theo,
  fallback 500 không trả thông tin nội bộ; ZodError nội bộ vẫn trả 500.
- Guard cho phép đúng role, từ chối thiếu phiên/sai role. Đây là kiểm thử
  handler boundary, chưa phải E2E qua HTTP server hay tính năng auth đầy đủ.

Chạy riêng: `npm test -- tests/api-contract.test.ts`. Bộ test DB hiện có vẫn
chạy regression theo hướng dẫn bên dưới; không thay DB bằng mock.

`tests/smoke.test.ts` — nền móng:

- Seed tạo đúng số lượng users/categories/items + bcrypt hash (không plaintext).
- Mỗi item có đủ tier, cọc, ảnh gốc, 60 ngày lịch.
- `@@unique([itemId, date])` chặn INSERT dòng lịch trùng, chưa chứng minh chống
  hai booking UPDATE cùng dòng lịch.
- Phạm vi đối chứng: cùng ngày khác item vẫn hợp lệ (ràng buộc đúng phạm vi).

`tests/schema-integrity.test.ts` tạo schema riêng với tên ngẫu nhiên trong
`gearloop_test` local, chạy `migrate deploy`, tự tạo fixture, sau cùng xóa đúng
schema đó. Không đọc/sửa fixture seed của smoke test và không reset DB dùng chung.
User DB test cần quyền tạo/xóa schema. Bộ test kiểm tra lịch đúng item/khoảng ngày,
kind/bookingId, tiền dương, eventKey, cọc duy nhất, VOID, append-only, snapshot
và hai lần RELEASE đồng thời (cùng khóa hoặc khác khóa). Đây là test DB,
không phải kiểm thử API hay state machine service chưa triển khai.

Follow-up bổ sung test điều phối snapshot cũ khi gắn lịch/rút khoảng ngày ở
READ COMMITTED và REPEATABLE READ; CHECK tiền/ngày; audit append-only;
tier liền kề/chồng/mở và tương tranh; tiền snapshot bất biến; returnedAt cố định;
snapshot checklist không bị sửa theo template và từ chối checklist khác category.

Review bổ sung: test ledger/tier dùng barrier giữ writer thứ nhất sau INSERT,
quan sát `pg_blocking_pids()` cho đến khi writer thứ hai bị chính writer đó chặn,
rồi mới commit. Không dùng kết quả Promise.allSettled đơn thuần để chứng minh lock.
Raw SQL assert SQLSTATE 23514/23505/40001; FK user assert 23503. Prisma 6.19 trả
lỗi CHECK từ model API trong UnknownRequestError, nên assert SQLSTATE 23514
trong lỗi connector; unique/serialization từ model API assert P2002/P2034.

`tests/seed.test.ts` chạy script seed thật trên schema riêng: seed/reseed mẫu,
audit-only, booking có ngày BOOKED nhưng chưa có ledger, ledger đã ghi, và nạp
mẫu lỗi giữa chừng. Kiểm tra exit code và dữ liệu trước/sau, không mock DB.

## 2. Kế hoạch mở rộng theo sprint

| Sprint | Thêm test |
| --- | --- |
| S2 | Luồng booking: tạo → lịch flip BOOKED → ledger DEPOSIT_HELD; hủy → VOID; chồng ngày → 409 |
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
DATABASE_URL="postgres://gearloop:gearloop@localhost:55432/gearloop_test" npm test
```
(DB test phải được migrate và seed trước; có thể dùng `make test` theo Makefile.
CI tự migrate và seed DB trống. Không dùng `db push`: nó bỏ qua CHECK/trigger.)
