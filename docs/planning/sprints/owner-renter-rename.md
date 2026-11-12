# Đồng bộ Owner / Renter — cập nhật 12/11/2026

## Mục tiêu và quyết định

Thống nhất role `ADMIN`, `OWNER`, `RENTER` và Booking.renterId/relation renter.
Giữ 16 model và quyền hiện có. Theo yêu cầu ngày 12/11, sửa tên trực tiếp trong
migration đầu tiên, bỏ migration rename riêng.

## File thay đổi trong lượt chỉnh lịch sử

- `prisma/migrations/20261101000000_booking_calendar_ledger_integrity/migration.sql`:
  tạo enum/default mới, cột renterId cùng FK/index ngay từ đầu.
- Bỏ migration rename; hai migration bổ sung bảo vệ lịch sử dữ liệu giữ nguyên.
- `docs/architecture/database-design.md`, `docs/guides/development-workflow.md`, ADR-007: cập nhật cách tạo DB mới và tác động
  tới DB đã áp dụng migration cũ. Schema, seed và code đã dùng tên mới từ lượt trước.

## Kiểm thử

- Prisma validate: đạt.
- PostgreSQL 16.15 tạm: deploy đủ ba migration trên DB trống, seed thành công.
- `npm test`: 103/103 test, bốn file, đạt với lịch sử migration đã chỉnh.
- Prisma migrate diff từ DB vừa tạo tới schema hiện tại: không có khác biệt.
- `git diff --check`: đạt.
- Không chạy lại lint/typecheck/build/E2E trong lượt này vì chỉ sửa SQL migration
  và tài liệu. Kết quả cũ của phương án có migration rename không được dùng để
  khẳng định đường nâng cấp DB cũ vẫn hoạt động với lịch sử mới.

## Acceptance criteria và giới hạn

- Migration history còn ba migration, tạo trực tiếp tên Owner/Renter.
- Theo yêu cầu tiếp theo của người phụ trách, đã kiểm tra không có dữ liệu nghiệp
  vụ và tạo lại riêng DB local `gearloop` tại localhost:55432. Deploy đủ ba migration,
  generate và seed đạt; migrate status đồng bộ và diff không có khác biệt.
  DB mới có 1 ADMIN, 2 OWNER, 3 RENTER, 4 item, 240 ngày lịch; booking/ledger/audit
  đều rỗng. Booking chỉ có renterId. DB cloud, DB test và volume không bị xóa.
- Lịch sử mới không tự nâng cấp DB ở máy khác đã chạy migration cũ; các DB đó cần
  người phụ trách quyết định tạo lại hoặc chuyển đổi riêng theo `docs/guides/development-workflow.md`.
- Chưa xác minh CI remote; thay đổi history cần DB OWNER review trước merge.
- Cách chạy cho DB mới/trống: `npm run db:deploy`, `npx prisma generate`.
  DB đã áp dụng lịch sử cũ phải xử lý trước theo `docs/guides/development-workflow.md`, không chỉ deploy lại.
