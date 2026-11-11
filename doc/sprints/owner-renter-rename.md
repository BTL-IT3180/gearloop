# Đồng bộ Owner / Renter — 11/11/2026

## Mục tiêu và quyết định

Theo yêu cầu người phụ trách, đổi cả tên role kỹ thuật và tên gọi trong tài liệu:
`ADMIN`, `OWNER` (chủ thiết bị), `RENTER` (người thuê). Giữ 16 model và quyền
hiện có; không thêm role hoặc đổi chính sách phân quyền.

## File thay đổi

- `prisma/schema.prisma`: enum Role, default RENTER, Booking.renterId/relation
  renter và index tương ứng.
- `prisma/migrations/20261111000000_rename_owner_renter_roles/migration.sql`:
  RENAME enum label, cột, FK và index tại chỗ; không sửa ba migration lịch sử.
- `src/db/seed.ts`, `src/app/page.tsx`: seed dùng role mới, nhãn hiển thị
  Owner/Renter. Seed guard và dữ liệu mẫu còn lại giữ nguyên.
- Các test hiện có: dùng role/field mới trong kiểm tra quyền, seed và schema.
  Không giữ bộ test nâng cấp riêng theo yêu cầu người phụ trách.
- README, hướng dẫn chạy, tài liệu trong `doc/`, `AGENTS.md` và ba issue template:
  thống nhất tên gọi, enum và renterId; cập nhật hướng dẫn triển khai/regression.

## Kiểm thử thực tế

- Prisma validate/generate: đạt, Prisma Client 6.19.3.
- `npm run lint`: đạt.
- `npm run typecheck -- --incremental false`: đạt.
- `npm run build`: đạt.
- Trước khi bỏ test nâng cấp riêng: `npm test` đạt 104/104 test, 5 file,
  PostgreSQL 16.15 trong container tạm riêng. Sau khi bỏ test đó, bộ test còn
  103 test trong 4 file; chưa chạy lại sau thao tác xóa file test.
- Deploy cả bốn migration trên DB mới: đạt; migrate diff DB → schema không lệch.
- Kiểm chứng upgrade đã chạy trước khi bỏ test riêng: triển khai ba migration
  cũ, tạo user theo role cũ và booking
  theo cột cũ cùng ngày BOOKED, ledger/audit, rồi deploy migration mới.
  Role và quan hệ đổi đúng, ID/timestamp và lịch sử giữ nguyên, default là RENTER,
  role cũ bị từ chối và FK renterId vẫn hoạt động.
- Cả ba sơ đồ Mermaid parse thành công; ERD đủ 16 entity và field khớp Prisma;
  bảng Markdown/code fence và `git diff --check` đạt.

## Acceptance criteria và giới hạn

- Đạt: schema/code/seed/docs dùng thống nhất Owner/Renter; migration mới hỗ trợ
  cả DB mới và DB đã chạy ba migration trước, không cần reset hoặc seed lại.
- Tên cũ chỉ còn trong migration lịch sử và lệnh đổi tên của migration mới.
- Bộ regression hiện có kiểm tra schema cuối cùng, không thay thế kiểm chứng
  đường nâng cấp dữ liệu cũ. Kiểm chứng upgrade đã đạt trong lượt trước,
  nhưng không được giữ thành test tự động thường xuyên.
- Chưa áp dụng migration vào DB dev, DB dùng chung hoặc cloud.
- Chưa xác minh CI remote; cần DB OWNER review trước merge.
- Consumer khác phải đổi sang role mới và renterId. Phiên JWT đã chứa role cũ
  cần đăng nhập lại khi triển khai. Không hỗ trợ song song tên role cũ.

## Triển khai sau review

Với DB đã có đủ ba migration trước, chạy `npm run db:deploy` và
`npx prisma generate`, rồi build/restart ứng dụng cùng phiên bản code mới.
Không dùng db push hoặc reset để chuyển tên. DB cũ chưa có migration history
vẫn cần quy trình baseline/upgrade do DB OWNER chuẩn bị theo `doc/cicd.md`.
