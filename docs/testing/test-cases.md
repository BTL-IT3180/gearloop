# GearLoop — Danh mục test case hiện có

Mục đích: Kiểm kê nguyên trạng các bộ test trong repo (mục đích, `describe`, số case, phạm vi, cách chạy) và liệt kê kế hoạch mở rộng theo sprint; đây là bản kiểm kê, không phải đặc tả test mới.
Nguồn: `tests/api-contract.test.ts`, `tests/schema-integrity.test.ts`, `tests/seed.test.ts`, `tests/smoke.test.ts`, `src/features/auth/credentials.test.ts`, `e2e/smoke.spec.ts`, `e2e/auth.spec.ts`, `docs/testing/test-strategy.md`, `.github/workflows/ci.yml`, `package.json`, `Makefile`, `docs/planning/sprints/{sprint-1,e0-f1-t3-schema-integrity,owner-renter-rename}.md`.

## 1. Tổng quan

Số case được đếm bằng cách đọc trực tiếp các file test ngày 12/11/2026: mỗi `it(...)` tính 1 case, mỗi `it.each([...])` tính bằng số dòng dữ liệu (mỗi dòng sinh 1 case).

| File | Số case | Cần database | Chạy bằng | Phạm vi ngắn |
| --- | ---: | --- | --- | --- |
| `tests/api-contract.test.ts` | 31 | Không | Vitest | Error catalog, schema validation, response envelope + guard |
| `tests/schema-integrity.test.ts` | 62 | Có (`gearloop_test` local, quyền tạo/xóa schema) | Vitest | Bất biến DB: lịch, sổ cọc, booking, audit, tier, checklist |
| `tests/seed.test.ts` | 5 | Có (`gearloop_test` local, quyền tạo/xóa schema) | Vitest | Script seed thật: reseed, guard dữ liệu, rollback |
| `tests/smoke.test.ts` | 5 | Có (DB `gearloop_test` đã migrate + seed) | Vitest | Smoke schema + seed (GL-107, GL-109) |
| `src/features/auth/credentials.test.ts` | 6 | Có (DB `gearloop_test` đã seed) | Vitest | Credentials, role từ DB, input sai |
| `e2e/smoke.spec.ts`, `e2e/auth.spec.ts` | 3 | Có (DB `gearloop_test` đã migrate + seed) | Playwright Chromium | Smoke trang chủ, lỗi credentials chung, đăng nhập/đăng xuất |
| **Tổng Vitest** | **109** | — | — | 31 + 62 + 5 + 5 + 6 |

Số 103 trong `docs/planning/sprints/owner-renter-rename.md` là kết quả lịch sử trước khi thêm 6 case credentials. Tổng hiện tại là 109 case Vitest; 3 case E2E chạy riêng bằng Playwright.

## 2. Chi tiết theo file

### 2.1 `tests/api-contract.test.ts` — 31 case, không cần database

Mục đích: kiểm thử tầng handler boundary (không qua HTTP server): catalog lỗi, schema validation dùng chung, envelope response và guard. Gọi `withApi` bằng đối tượng `Request`/`Response` thật, không mock.

| `describe` | Số case | Nội dung |
| --- | ---: | --- |
| `catalog B4` | 2 | Giữ 24 mã USR + 3 mã SYS, mã pending không phát ở runtime; định dạng danh sách trường bằng nhãn, không nhận giá trị người dùng |
| `schema dùng chung` | 13 | Chuẩn hóa email/giữ nguyên password và input gốc (1); `it.each` 5 input login sai dùng thông điệp catalog (5); `it.each` 7 khoảng ngày UTC gồm năm nhuận/khoảng đảo/thuê cùng ngày (7) |
| `response API` | 13 | Envelope thành công + chuyển `params` (1); `it.each` 6 mã lỗi → HTTP status (6); `it.each` 3 body JSON/input sai bị từ chối trước thao tác ghi (3); validation ngày trả 400 không rơi vào 500 (1); lỗi chưa phân loại → SYS-001 không lộ thông tin nội bộ (1); ZodError nội bộ vẫn là lỗi hệ thống (1) |
| `guard hiện có dùng catalog` | 3 | Cho phép role phù hợp (1); `it.each` 2 trường hợp từ chối thiếu phiên/sai role (2) |

Liên hệ requirement: theo `docs/testing/test-strategy.md` §1, bộ test này gắn công việc "Task 5 (#64)" (chuẩn hoá error catalog/validation/response). Không có ánh xạ US-xxx trực tiếp trong nguồn; `describe` "catalog B4" gắn quy ước error catalog B4.

### 2.2 `tests/schema-integrity.test.ts` — 62 case, cần database

Mục đích: chứng minh các bất biến ở tầng PostgreSQL (CHECK, trigger, partial unique index, khóa ngoài, tuần tự hoá). Suite tự tạo một schema rời (`e0_f1_t3_<uuid>`) trong `gearloop_test`, chạy `migrate deploy`, tự tạo fixture, sau đó xóa đúng schema đó. Guard trong `beforeAll` buộc `DATABASE_URL` trỏ tới `/gearloop_test` trên `localhost`/`127.0.0.1`.

| `describe` | Số case | Nội dung |
| --- | ---: | --- |
| `CalendarDay booking relationship` | 12 | `it.each` 2 mức isolation: rút ngắn booking sau INSERT lịch đồng thời bị từ chối (2); FREE/BLOCKED không booking và BOOKED trong đúng booking được nhận (1); `it.each` 5 dữ liệu lịch sai (5); `it.each` 3 thay đổi cha (item/start/end) làm sai ngày đã liên kết (3); phải xóa `bookingId` khi trả ngày đang bận về FREE (1) |
| `DepositLedger invariants` | 22 | Ghi DEPOSIT_HELD trước duyệt + tất toán chia phần (1); `it.each` 3 cọc ban đầu không hợp lệ (3); `it.each` 3 loại bút toán khi chưa giữ cọc (3); cọc ban đầu thứ hai khác eventKey bị từ chối (1); `it.each` 9 thao tác sau khi giữ cọc (âm/0/khóa trắng/void một phần/vượt số dư/trùng/sửa/xóa/đổi snapshot) (9); VOID tất toán và chặn RELEASE sau đó (1); `it.each` 4 tổ hợp (cùng/khác event × READ COMMITTED/REPEATABLE READ) serialize hai RELEASE đồng thời (4) |
| `Booking values and history` | 10 | `it.each` 3 dữ liệu booking sai (3); booking 1 ngày tiền 0 hợp lệ (1); `it.each` 2 bảo vệ snapshot tiền trước khi ghi ledger (2); `returnedAt` ghi một lần và giữ nguyên (1); `it.each` 2 đổi `returnedAt` đã ghi bị từ chối (2); `returnedAt` cấp thủ công trước khi trả bị từ chối (1) |
| `AuditLog append-only` | 2 | `it.each` update/delete bút toán audit bị từ chối (2) |
| `Historical user references` | 3 | `it.each` audit/ledger/claim: user chỉ được tham chiếu lịch sử vẫn deactivate được nhưng DELETE bị FK từ chối (3) |
| `RateTier ranges` | 9 | `it.each` 3 giá trị tier sai (3); tier liền kề + tier mở hợp lệ (1); `it.each` 2 khoảng chồng lấn (2); cập nhật tier vào khoảng tier khác bị từ chối (1); `it.each` 2 mức isolation serialize hai tier chồng nhau đồng thời (2) |
| `Checklist history snapshots` | 4 | Ghi giá trị template thật và giữ nguyên sau khi sửa template (1); `it.each` 2 ghi đè snapshot bị từ chối (2); checklist khác category bị từ chối (1) |

Liên hệ requirement: suite phục vụ công việc E0-F1-T3 (`docs/planning/sprints/e0-f1-t3-schema-integrity.md`) — bất biến quan hệ lịch và sổ cọc. [Suy luận] các nhóm bất biến phục vụ các story theo ánh xạ feature→US ở kế hoạch §2: lịch/booking (E2-F1 = US-005), huỷ/duyệt booking (E2-F3 = US-007, E2-F4 = US-008), sổ cọc (E2-F5 = US-009), mốc trả đồ (E3-F2 = US-011), tranh chấp/FK lịch sử (E3-F3 = US-012). Trạng thái chặn trùng lịch gắn BR-005-01 (Q2).

### 2.3 `tests/seed.test.ts` — 5 case, cần database

Mục đích: chạy script seed thật (`src/db/seed.ts`) trên schema rời, kiểm tra exit code và dữ liệu trước/sau, không mock DB. Guard trong `beforeAll` buộc `DATABASE_URL` trỏ tới `/gearloop_test` local.

| `describe`/`it` | Số case | Nội dung |
| --- | ---: | --- |
| reseed demo không nhân đôi | 1 | Seed lại dữ liệu demo mà không tạo bản trùng |
| rollback khi nạp mẫu lỗi | 1 | Nạp mẫu lỗi giữa chừng thì wipe được rollback, không xóa dở dữ liệu |
| `it.each` 3 kịch bản | 3 | audit-only; booking có ngày BOOKED nhưng chưa có ledger; booking đã có ledger — đều exit 0 và không đổi dữ liệu |

Liên hệ requirement: hành vi guard/rollback gắn E0-F1-T3 (mục "Xử lý review seed / lock / FK"); seed demo gắn GL-109 (theo `docs/planning/sprints/sprint-1.md`).

### 2.4 `tests/smoke.test.ts` — 5 case, cần database đã migrate + seed

Mục đích: smoke test nền móng schema + seed trên PostgreSQL thật (không mock), chạy trong CI sau `migrate deploy` + `db:seed`.

| `describe` | Số case | Nội dung |
| --- | ---: | --- |
| `seed v1 (GL-109)` | 3 | Đúng 6 user theo 3 vai trò (1 ADMIN/2 OWNER/3 RENTER) và `passwordHash` là bcrypt; 3 category, 4 item mỗi item có tier + cọc + ảnh gốc; mỗi item đúng 60 ngày lịch FREE |
| `ràng buộc cốt lõi (GL-107)` | 2 | `@@unique([itemId, date])` chặn INSERT dòng lịch trùng; cùng ngày khác item vẫn hợp lệ |

Liên hệ requirement: GL-107 (CalendarDay nền tảng) và GL-109 (seed script) theo `docs/planning/sprints/sprint-1.md`; suite cũng nhắc ADR-002 (bcrypt) trong phần seed.

### 2.5 `src/features/auth/credentials.test.ts` — 6 case, cần database đã seed

Mục đích: kiểm tra đăng nhập credentials bằng PostgreSQL đã seed: mật khẩu/role hợp lệ, mật khẩu sai, user không tồn tại, input sai và role client giả mạo.

### 2.6 `e2e/` — 3 case, cần database đã migrate + seed

Playwright tự khởi động server Next.js và chạy trên Chromium:

- `e2e/smoke.spec.ts` (1): mở trang chủ và xác nhận heading "Thuê thiết bị, đừng mua hẳn." hiển thị.
- `e2e/auth.spec.ts` (2): thông tin đăng nhập sai dùng lỗi chung; đăng nhập đúng role từ DB rồi đăng xuất.

## 3. Cách chạy từng suite

| Suite | Lệnh | Ghi chú |
| --- | --- | --- |
| Toàn bộ unit/DB | `npm test` (`vitest run`) | Cần `DATABASE_URL` trỏ local `gearloop_test`; DB phải được migrate + seed trước; `make test` tự chuẩn bị |
| `api-contract.test.ts` | `npm test -- tests/api-contract.test.ts` | Không cần DB |
| `schema-integrity.test.ts`, `seed.test.ts` | `npm test -- tests/<tên-file>.test.ts` | Cần quyền tạo/xóa schema; suite tự tạo và dọn schema rời |
| `smoke.test.ts` | `npm test -- tests/smoke.test.ts` | Cần DB đã `migrate deploy` + `db:seed` |
| E2E | `npm run test:e2e` | Cần DB local đã migrate + seed và `npx playwright install chromium` một lần |
| Qua Makefile | `make test` | Target phụ thuộc `db` và yêu cầu file `.env.test` (`Makefile` dòng ~53) |

Theo `docs/testing/test-strategy.md` §4, lệnh nhanh cục bộ: `docker compose up -d db` rồi `DATABASE_URL="postgres://gearloop:gearloop@localhost:55432/gearloop_test" npm test`. Không dùng `db push` (bỏ qua CHECK/trigger).

Trong CI (`.github/workflows/ci.yml`), cả job `unit` và `e2e` dùng PostgreSQL 16 riêng, migrate + seed trước khi chạy; `e2e` cài Chromium và chạy `npm run test:e2e`. Job `verify` chỉ xanh khi cả `unit` và `e2e` pass.

## 4. Kế hoạch mở rộng theo sprint

Theo `docs/testing/test-strategy.md` §2:

| Sprint | Test sẽ thêm |
| --- | --- |
| S2 | Luồng booking: tạo → lịch flip BOOKED → ledger DEPOSIT_HELD; huỷ → VOID; chồng ngày → 409 |
| S3 | Claim: chỉ mở khi NOT_OK; award > deposit → 400; resolve → ledger DEDUCT |
| S4 | Regression pool: mọi bug beta P0/P1 được kèm 1 test tái hiện |
| S5 | Test case trắng/đen hộp cho môn học (white-box: `createBooking`, `resolveClaim`) |

## 5. Ghi chú trung thực

- Trong lượt audit tài liệu này (12/11/2026), **chưa chạy bất kỳ suite nào**; các bộ test cần DB (`schema-integrity`, `seed`, `smoke`) **chưa được chạy trong lượt audit này**, nên tài liệu này không khẳng định pass/fail cho chúng.
- Kết quả chạy lịch sử (không chạy lại trong lượt này) được ghi trong các hồ sơ công việc: `docs/planning/sprints/e0-f1-t3-schema-integrity.md` (72/72 = 62 integrity + 5 seed + 5 smoke, PostgreSQL 16.15) và `docs/planning/sprints/owner-renter-rename.md` (103/103 test, bốn file). Đây là số liệu do lượt việc trước ghi lại, không phải kết quả xác minh mới.
- Bộ test này có giới hạn phạm vi đã ghi trong `docs/testing/test-strategy.md`: `api-contract` là kiểm thử handler boundary (chưa E2E qua HTTP server/auth đầy đủ); `schema-integrity` là test DB, chưa kiểm thử API hay state machine service (chưa triển khai); `smoke` chưa chứng minh chống hai booking UPDATE cùng dòng lịch.
- Header của `tests/smoke.test.ts` đã được cập nhật trong lượt migration tài liệu này, nay trỏ tới [test-strategy.md](./test-strategy.md); không còn tham chiếu tới đường dẫn cũ.
- Không có case nào bị bỏ sót khi đếm: tổng theo file khớp số case trong bảng §1 và khớp số tổng 103 ghi ở hồ sơ `owner-renter-rename.md`.
