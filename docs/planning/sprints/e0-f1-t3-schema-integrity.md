# E0-F1-T3 — Lượt sửa quan hệ lịch và sổ cọc

> Trạng thái mới nhất nằm ở mục **Xử lý review seed / lock / FK** cuối tài liệu.
> Những giới hạn seed/Docker trong các lượt trước đã được thay thế bởi guard
> bảo vệ dữ liệu và transaction trong lượt xử lý review này.

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
  Owner duyệt DEPOSIT_HELD → APPROVED, không ghi cọc lần hai.
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
booking; thống nhất DEPOSIT_HELD và luồng giữ cọc trước khi Owner duyệt.

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

## Xác minh PostgreSQL 16 và phạm vi schema — 01/11/2026

- Người phụ trách xác nhận giữ nguyên **16 model** thay yêu cầu 8 model trong
  bảng kế hoạch ban đầu. Không đổi tên hay gom model chỉ để khớp số lượng cũ.
- Khuyến nghị giữ một file `prisma/schema.prisma` ở quy mô hiện tại: các quan hệ
  dễ đối chiếu chung, schema vẫn gọn và DB OWNER quản lý thay đổi. Multi-file
  chỉ đáng cân nhắc khi các pod thường xuyên xung đột khi sửa schema; việc tách
  file không bổ sung ràng buộc DB hay làm migration an toàn hơn.
- Môi trường kiểm thử: image `postgres:16-alpine`, server xác nhận qua SQL là
  **PostgreSQL 16.15**, container riêng, cổng loopback ngẫu nhiên, dữ liệu tmpfs,
  không gắn volume của dự án. Không migrate/seed DB local hiện có.
- Hai migration áp dụng thành công từ DB trống; chạy lại migrate deploy không
  còn migration chờ. Seed đạt 6 users, 3 categories, 4 items, 240 ngày lịch.
- `npm test`: **64/64 test qua** trên PostgreSQL 16.15, bao gồm các trường hợp
  tương tranh READ COMMITTED/REPEATABLE READ. Không thay đổi source/test để
  thích nghi với PostgreSQL 16.
- `prisma migrate status`: schema up to date. `prisma migrate diff` từ DB test
  tới schema trong code trả exit code 0 và báo không có chênh lệch đối với các
  cấu trúc Prisma biểu diễn được; CHECK/trigger được kiểm tra qua integrity test.
- Kiểm tra nâng cấp lịch sử trên schema test riêng: backfill returnedAt từ
  RETURN và snapshot checklist đúng; RETURNED thiếu biên bản bị chặn và rollback
  toàn bộ DDL. Schema test được dọn sau kiểm tra.
- Lần chạy seed trong Windows sandbox gặp lỗi hệ thống ở os.userInfo của tsx;
  chạy ngoài sandbox trên chính container test thành công. Không sửa dependency
  hay cấu hình dự án để né lỗi môi trường này.
- GitHub CI chưa được chạy từ remote; xác minh PostgreSQL 16 ở local không thay
  thế required checks/review DB OWNER trước merge. Giới hạn seed/Docker và
  baseline DB đã có dữ liệu vẫn áp dụng như các mục trên.

## Xử lý review seed / lock / FK

### Đánh giá review

| Ý review | Kết luận | Xử lý |
| --- | --- | --- |
| Seed xóa dở dữ liệu, sai thứ tự FK | Đúng, ảnh hưởng dữ liệu và startup | Guard trước wipe, transaction, lịch xóa trước booking |
| Promise.allSettled chưa chứng minh lock | Đúng, chỉ chứng minh kết quả cuối | Barrier + quan sát waiter bị chính holder chặn trước commit |
| SET NULL làm UPDATE ngầm lịch sử | Đúng, xung đột append-only | FK RESTRICT, dùng isActive để khóa tài khoản |

File seed thực tế là `src/db/seed.ts`, không phải `prisma/seed.ts`.
Yêu cầu review mới cho phép sửa seed, thay thế quyết định giữ nguyên seed trước đó.

### Thay đổi và acceptance criteria

- `src/db/seed.ts`: đầu main mở transaction SERIALIZABLE, kiểm tra cả Booking,
  DepositLedger và AuditLog. Có dữ liệu ở bất kỳ bảng nào thì log bỏ qua và exit 0;
  không chạy wipe, để Docker tiếp tục chạy app. Nếu ba bảng trống thì wipe + nạp
  mẫu cùng transaction; lỗi thật rollback toàn bộ và exit 1. Wipe không DELETE
  ledger/audit; CalendarDay xóa trước Booking.
- `tests/seed.test.ts`: gọi script seed thật trong schema riêng. Xác minh reseed
  mẫu không nhân đôi; audit-only, booking có lịch BOOKED nhưng ledger rỗng và
  booking có ledger đều exit 0, giữ nguyên dữ liệu trước/sau. Test tiêm lỗi lúc
  tạo PolicySetting xác minh wipe được rollback, không có xóa dở dữ liệu.
- `tests/schema-integrity.test.ts`: tx1 INSERT rồi giữ mở; tx2 lấy backend PID
  và bắt đầu INSERT. Monitor kiểm tra pg_blocking_pids(tx2) chứa PID tx1 trước
  khi mở barrier cho tx1 commit. Test dùng cả READ COMMITTED và REPEATABLE READ,
  gồm ledger khác eventKey và tier khác minDays để không chỉ dựa vào unique.
- Raw SQL kiểm tra chính xác SQLSTATE 23514/23505/40001, không chấp nhận mọi
  exception. Prisma 6.19 trả lỗi CHECK từ model API dưới UnknownRequestError;
  matcher kiểm tra SQLSTATE 23514 trong connector error, unique/serialization
  từ model API kiểm tra P2002/P2034. Calendar test luôn giải phóng barrier và
  cleanup cả khi assertion thất bại, không để lỗi dây chuyền hoặc promise treo.
- `prisma/schema.prisma` và migration mới
  `20261101020000_restrict_historical_user_deletion`: ba FK actor/creator/resolver
  dùng ON DELETE RESTRICT; không sửa hai migration đã commit. Test tạo user chỉ
  có đúng một loại liên kết lịch sử, xác nhận deactivation được phép và DELETE
  bị FK 23503 từ chối, không phải lỗi UPDATE ngầm của trigger append-only.
- Dockerfile/Makefile chỉ sửa comment mô tả hành vi seed; lệnh khởi động Docker,
  reset và CI không đổi. README, hướng dẫn chạy, data model, ADR-004, CI docs và
  regression docs được đồng bộ theo hành vi mới.

### Kết quả kiểm thử

- Prisma validate/generate: đạt, Prisma 6.19.3.
- npm run lint, npm run typecheck -- --incremental false, npm run build: đạt.
- PostgreSQL **16.15** trong container riêng: cả ba migration áp dụng thành công;
  `npm test`: **72/72 qua** (62 integrity + 5 seed + 5 smoke).
- migrate status: up to date; migrate diff: không có chênh lệch đối với cấu trúc
  Prisma biểu diễn được. CHECK/trigger được xác minh bằng các test DB.
- Lần chạy đầu phát hiện matcher P2004 không khớp lỗi CHECK của Prisma 6.19;
  đã chỉnh theo SQLSTATE thực tế và chạy lại toàn bộ test thành công.
- Không seed/reset/migrate DB đang dùng của người phụ trách. Container test
  được dừng và xóa sau xác minh. Không thêm dependency hoặc model.

### Giới hạn / review cần thiết

- Khi ba bảng nghiệp vụ trống, seed vẫn tái tạo tài khoản/danh mục/tin mẫu;
  không dùng seed để reset giao dịch. Lỗi DB thật vẫn exit 1, không bị nuốt lỗi.
- Seed guard không xử lý P3005: DB cũ từ db push vẫn cần baseline/upgrade hoặc
  reset local được cho phép. Không tự sửa lịch sử migration trên DB dùng chung.
- Chưa xác minh lại GitHub CI từ remote; DB OWNER cần review migration mới,
  pod D review seed và test. Không có quyết định nghiệp vụ mới đang chờ.
- PR follow-up đề xuất: `fix(db): preserve seeded history and prove transaction locks`.
