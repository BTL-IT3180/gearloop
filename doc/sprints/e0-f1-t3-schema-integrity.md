# E0-F1-T3 — Lượt sửa quan hệ lịch và sổ cọc

## Mục tiêu và phạm vi

Xử lý các điểm 2, 3, 5 của đánh giá schema theo yêu cầu người phụ trách:
giữ 16 model, không triển khai API/service booking, không tách multi-file trong
lượt sửa này. Dùng DEPOSIT_HELD thay HOLD cho cả trạng thái và loại bút toán.

## Thay đổi

- `prisma/schema.prisma`: khóa ngoại ghép CalendarDay/Booking theo item,
  đổi enum bút toán, thêm eventKey và unique theo booking/sự kiện/loại bút toán.
- `prisma/migrations/20261101000000_booking_calendar_ledger_integrity/`:
  migration đầu tiên (schema đầy đủ được Prisma sinh từ empty), bổ sung SQL
  CHECK, partial unique index và trigger cho các bất biến không biểu diễn
  được trong Prisma schema. Không thay đổi migration history đã tồn tại.
- `tests/schema-integrity.test.ts`: schema test riêng, fixture riêng,
  kiểm tra dữ liệu hợp lệ/bị từ chối và hai tác vụ ghi đồng thời.
- `tests/smoke.test.ts`: sửa mô tả để phân biệt unique dòng lịch với chống
  hai booking cập nhật cùng dòng; giữ nguyên các assertion hiện có.
- `.github/workflows/ci.yml`: chỉ chuyển bước DB sang migrate deploy theo
  xác nhận của người phụ trách, giữ PostgreSQL 16 và các bước còn lại.
- README, hướng dẫn chạy, data model, backend flows, ADR-003/004, CI và
  regression docs: đồng bộ tên bút toán, state machine và giới hạn vận hành.

## Acceptance criteria

- Lịch BOOKED có bookingId; FREE/BLOCKED không có bookingId.
- Lịch liên kết đúng thiết bị và nằm trong khoảng ngày booking; sửa booking
  không được làm sai các ngày đã liên kết.
- REQUESTED → DEPOSIT_HELD trong transaction tạo yêu cầu/giữ cọc;
  Seller duyệt DEPOSIT_HELD → APPROVED, không ghi cọc lần hai.
  Đây là hợp đồng cho service tương lai, chưa phải state machine runtime.
- Tiền ledger dương; số dư = DEPOSIT_HELD − RELEASE − DEDUCT − VOID.
- eventKey ổn định khi retry; một sự kiện có thể có DEDUCT và RELEASE.
- Chỉ một DEPOSIT_HELD mỗi booking, bằng snapshot; cọc 0 không ghi bút toán.
- VOID tất toán phần cọc còn giữ; không chi trùng phần tiền đã VOID.
- Không chi vượt số dư, kể cả hai transaction đồng thời; không sửa/xóa ledger
  hoặc đổi snapshot cọc đã ghi.

## Kiểm thử thực tế

- Prisma validate và generate: đạt, Prisma 6.19.3.
- npm run lint: đạt.
- npm run typecheck -- --incremental false: đạt.
- npm run build: đạt.
- migrate deploy, seed, npm test: đạt trên PostgreSQL 18 tạm, 37/37 test.
  Test tương tranh chạy với READ COMMITTED và REPEATABLE READ.
- Docker/PostgreSQL 16 local không sẵn sàng; PostgreSQL 16 và workflow GitHub
  chưa được xác minh trực tiếp, cần CI xác nhận.
- Lần chạy test đầu với DB local mặc định thất bại vì không có server;
  sau đó chạy thành công trên instance tạm riêng. Không migrate/reset DB sẵn có.

## Giới hạn và review

- Migration đầu tiên chỉ dành cho DB mới/trống. DB đã dùng db push cần DB OWNER
  chuẩn bị baseline/upgrade và backfill eventKey, không đánh dấu migration đã
  áp dụng khi CHECK/trigger chưa được cài. Không có nâng cấp DB cũ tự động.
- Giữ nguyên seed/Docker theo quyết định của người phụ trách: DELETE ledger
  bị chặn; Docker chạy seed khi boot nên sẽ không start app nếu đã có ledger.
- DB OWNER review migration; phối hợp pod A cho CI, pod D cho test/docs.
- Các vấn đề snapshot checklist, mốc trả đồ, thông báo và multi-file còn ngoài
  phạm vi. Chưa tuyên bố hoàn thành toàn bộ E0-F1-T3.

## Nội dung PR đề xuất

**Tiêu đề:** fix: enforce booking calendar and deposit ledger integrity (E0-F1-T3)

CalendarDay trước đây có thể trỏ sai thiết bị/ngày hoặc sai kind; ledger có thể
ghi trùng và chi vượt cọc. Thêm ràng buộc DB, eventKey và serialize bút toán theo
booking; thống nhất DEPOSIT_HELD và luồng giữ cọc trước khi Seller duyệt.

Validation: Prisma validate/generate, lint, typecheck, build; 37 test qua trên
PostgreSQL 18 tạm. CI PostgreSQL 16 và nâng cấp DB có dữ liệu cần review riêng.

## Follow-up — sửa lỗi sau review

Phạm vi người phụ trách yêu cầu: lỗi snapshot cũ của lịch, ngày/tiền booking,
audit append-only, tier giá chồng nhau, lịch sử checklist và mốc trả đồ.

- Giữ nguyên migration đầu tiên; thêm một migration follow-up
  `20261101010000_harden_booking_history`, có BEGIN/COMMIT để thất bại thì
  rollback toàn bộ. Không tự sửa migration đã áp dụng hoặc reset dữ liệu.
- Trigger gắn lịch UPDATE không đổi startDate của booking để tạo row version,
  khiến updater REPEATABLE READ dùng snapshot cũ bị serialization failure.
  Bộ test điều phối snapshot → INSERT lịch commit → UPDATE khoảng ngày.
- CHECK endDate >= startDate, tiền booking không âm; giữ khoảng ngày đóng
  theo schema hiện có. totalVnd và depositVnd bất biến từ khi tạo booking.
- AuditLog chặn UPDATE/DELETE. Seed/Docker giữ nguyên theo quyết định trước;
  seed cũng bị chặn khi có audit, có thể xóa một phần dữ liệu trước khi lỗi.
- RateTier kiểm tra min/max/giá và serialize writer qua Item để chặn khoảng
  giao nhau, gồm cả trần mở và transaction đồng thời. Không thêm extension.
- ConditionReportEntry có labelSnapshot/requiredSnapshot. Trigger lấy giá trị
  thật từ template đúng category và bảo vệ identity/snapshot khỏi chỉnh sửa.
- Booking.returnedAt do DB ghi một lần khi chuyển RETURNED và giữ nguyên khi
  có cập nhật sau đó; hợp đồng nhả cọc chuyển sang returnedAt, không dùng updatedAt.

Validation follow-up:

- Prisma validate/generate, lint, typecheck và build: đạt.
- Migrate deploy và npm test: 64/64 test qua trên PostgreSQL 18 tạm, gồm DB mới
  chạy cả hai migration và DB test đã có migration đầu được nâng cấp.
- Kiểm tra nâng cấp dữ liệu lịch sử riêng: backfill snapshot và returnedAt từ
  biên bản RETURN đúng; RETURNED thiếu biên bản bị từ chối và rollback DDL.
- Chưa xác minh PostgreSQL 16/GitHub CI; không migrate DB sẵn có của người dùng.

Giới hạn còn lại:

- Nhãn checklist lịch sử trước migration không phục hồi được nếu mẫu đã bị sửa;
  backfill dùng mẫu đang có và cần DB OWNER review. RETURNED thiếu biên bản
  không được tự gán thời điểm từ updatedAt.
- API/service booking, phân quyền theo tài nguyên, kiểm tra đủ lịch/biên bản và
  state machine runtime vẫn chưa triển khai. Lượt này sửa ràng buộc DB, không
  khẳng định hoàn thành tính năng booking hay toàn bộ E0-F1-T3.
- PR follow-up đề xuất: `fix(db): harden booking concurrency and historical data`.
  DB OWNER review migration, pod D review test/docs. Seed/Docker không thay đổi.
