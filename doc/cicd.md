# GearLoop — Branching, CI/CD & môi trường

Tài liệu này quy định quy trình quản lý branch, Pull Request (PR), CI/CD và môi trường triển khai của GearLoop.

## 1. Branching (trunk-based-lite)

```text
main (protected, luôn deploy được)
 └── PR từ feat/<issue#>-slug hoặc fix/<issue#>-slug
```

- Không sử dụng branch `develop`.
- Với nhóm 8 người và AI coding agent, ưu tiên branch ngắn hạn, thời gian tồn tại không quá 2 ngày khi phù hợp.
- Không commit trực tiếp vào `main`.
- Branch tính năng dùng tên `feat/<issue#>-slug`.
- Branch sửa lỗi dùng tên `fix/<issue#>-slug`.
- Mỗi issue tương ứng một branch và một PR; không gộp các thay đổi không liên quan vào cùng PR.
- Sử dụng **Squash merge** làm chiến lược merge duy nhất.
- Rebase branch theo `main` trước khi mở PR và xử lý conflict trước khi yêu cầu review.
- Sau khi merge thành công, xóa branch đã hoàn thành.
- Không force-push hoặc viết lại lịch sử của branch dùng chung khi chưa được phép.

### 1.1. Bảo vệ branch `main`

Branch `main` phải được bảo vệ với các điều kiện:

- Bắt buộc tạo PR để merge.
- Có ít nhất 1 approval từ thành viên khác; không tự review hoặc tự phê duyệt PR của mình.
- CI phải xanh, với status check bắt buộc là `verify` nếu workflow hiện tại cung cấp đúng context này.
- Chỉ merge khi đã đáp ứng các điều kiện bảo vệ nhánh được cấu hình trong GitHub.

Tài liệu này mô tả chính sách mong muốn. Quản trị viên cần xác minh các điều kiện trên đã được bật trong GitHub Branch Protection hoặc Rulesets.

### 1.2. Quy trình thực hiện PR

1. Đọc `AGENTS.md`, issue được giao và các tài liệu kỹ thuật liên quan.
2. Xác định acceptance criteria (AC), phạm vi công việc và các file dự kiến thay đổi.
3. Tạo branch theo quy ước ở mục 1.
4. Triển khai đúng phạm vi issue; viết hoặc cập nhật test phù hợp.
5. Chạy các lệnh kiểm tra phù hợp và xem lại toàn bộ diff.
6. Rebase branch theo `main` trước khi mở PR; xử lý conflict cẩn thận.
7. Tạo PR về `main`, liên kết issue, mô tả thay đổi và ghi rõ cách kiểm thử.
8. Chờ CI xanh và ít nhất một thành viên khác phê duyệt.
9. Squash merge khi đã đáp ứng mọi điều kiện bảo vệ nhánh.
10. Xóa branch sau khi merge thành công.

Không khẳng định kiểm thử thành công nếu chưa có kết quả xác minh.

## 2. CI — Continuous Integration

Workflow CI được quản lý tại `.github/workflows/ci.yml`.

Các bước dự kiến trong pipeline:

| Bước | Lệnh hoặc thao tác | Chặn merge |
|---|---|---|
| Cài dependency | `npm ci` | Có |
| Sinh Prisma Client | `npx prisma generate` | Có |
| Lint | `npm run lint` | Có |
| Đồng bộ schema và seed | `prisma migrate deploy` và `npm run db:seed` trên PostgreSQL service | Có |
| Build | `npm run build` | Có |
| Typecheck | `npm run typecheck` | Có |
| Test | `npm test` bằng Vitest với database thật, không mock database | Có |

Các lệnh và điều kiện trên phải khớp với workflow thực tế. Nếu CI hiện tại có thứ tự hoặc cách cấu hình khác, hãy kiểm tra `.github/workflows/ci.yml` trước khi thay đổi pipeline.

### 2.1. Quy tắc đồng bộ database

- E0-F1-T3 cung cấp migration đầu tiên cho DB mới/trống. CI dùng:

```bash
npx prisma migrate deploy
```

- Không bỏ bước đồng bộ database khỏi CI.
- Migration chứa CHECK, partial unique index và trigger mà `db push` không tạo.
- Migration `20261111000000_rename_owner_renter_roles` đổi role sang
  `ADMIN`/`OWNER`/`RENTER` và cột Booking sang `renterId` bằng lệnh RENAME,
  giữ nguyên dữ liệu và FK/index. DB đã chạy ba migration trước chỉ cần
  `migrate deploy`, không reset hoặc seed lại để chuyển role.
  Khi triển khai cần đồng bộ Prisma Client và mọi consumer của role/field mới;
  phiên JWT chứa role cũ cần đăng nhập lại, không coi role cũ là role mới.
- Với DB đã tạo bằng `db push`, không chạy migration đầu tiên trực tiếp và không
  reset DB dùng chung. DB OWNER cần kiểm kê dữ liệu, thiết kế baseline/upgrade
  riêng: đổi enum HOLD thành DEPOSIT_HELD, backfill eventKey theo sự kiện thực tế,
  rà soát lịch/cọc sai trước khi thêm ràng buộc. Không tự đánh dấu migration đã
  áp dụng khi các CHECK/trigger chưa được cài.
- Sau review E0-F1-T3, seed kiểm tra Booking/DepositLedger/AuditLog trước khi
  wipe. Có dữ liệu ở bất kỳ bảng nào thì bỏ qua và exit 0, để Docker tiếp tục
  chạy app. Không xóa hoặc vô hiệu trigger của ledger/audit.
- Nếu cả ba bảng trống, wipe và nạp mẫu chạy trong transaction SERIALIZABLE;
  lỗi thật rollback toàn bộ và exit 1. CalendarDay được xóa trước Booking.
  Lệnh Docker không đổi. Seed vẫn tái tạo tài khoản/danh mục/tin mẫu khi chưa
  có dữ liệu nghiệp vụ; không dùng seed để reset giao dịch.
- Migration backfill thời điểm trả chỉ từ biên bản RETURN; RETURNED thiếu chứng
  cứ bị chặn, cần DB OWNER xử lý. Migration bổ sung FK user dùng RESTRICT:
  không hard-delete user có lịch sử, dùng isActive để khóa/mở tài khoản.
- Không tự ý sửa schema, tạo migration hoặc thay đổi quy trình database ngoài phạm vi issue được giao và quyền hạn được phân công.

## 3. Môi trường

| Môi trường | Nền tảng | Dữ liệu |
|---|---|---|
| Local | Docker Compose | PostgreSQL 16 container; seed theo cấu hình dự án |
| Preview | Vercel Preview cho mỗi PR | Neon DB branch/copy để reviewer kiểm thử trước khi approve, nếu đã được cấu hình |
| Production | Vercel và Neon PostgreSQL | Triển khai từ `main` sau merge; dữ liệu demo được quản lý theo quy trình của dự án |

### 3.1. Local development

- Khởi động môi trường bằng Docker Compose theo hướng dẫn trong README.
- PostgreSQL sử dụng phiên bản 16 theo cấu hình hiện tại.
- Seed tự chạy nếu được cấu hình trong Docker Compose; kiểm tra cấu hình thực tế trước khi giả định dữ liệu đã được tạo.
- Không commit file `.env` hoặc thông tin kết nối database chứa secret.

### 3.2. Preview và production

- Mỗi PR nên có Vercel Preview URL để reviewer kiểm tra thay đổi trước khi approve.
- Preview database nên sử dụng Neon DB branch/copy riêng nếu hạ tầng đã được cấu hình; không tùy tiện sử dụng hoặc sửa dữ liệu production.
- Production được triển khai từ `main` theo cấu hình CI/CD đã được phê duyệt.
- Lệnh `npm run demo:reset` chỉ được sử dụng theo đúng mục đích và hướng dẫn của dự án. Không chạy trên production nếu chưa xác nhận rõ tác động và được người có trách nhiệm cho phép.

### 3.3. Neon và lựa chọn database

- Ưu tiên pooled connection string của Neon cho kết nối runtime phù hợp với môi trường serverless.
- Không sử dụng Render free PostgreSQL làm database chính theo quyết định hiện tại của nhóm do giới hạn vòng đời dịch vụ đã được nêu trong tài liệu gốc.
- Trước khi thay đổi nhà cung cấp database, connection string hoặc cách quản lý môi trường, cần có sự thống nhất của người phụ trách backend/database.

### 3.4. Rollback

- Rollback ứng dụng có thể thực hiện bằng cách redeploy bản build trước đó theo quy trình Vercel của nhóm.
- Rollback database phải được đánh giá riêng, dựa trên migration đã triển khai và mức độ tương thích ngược.
- `prisma migrate resolve` dùng để điều chỉnh trạng thái migration trong các tình huống cụ thể; **không phải lệnh rollback schema tổng quát**.
- Không tự ý chạy lệnh sửa trạng thái migration trên production. Tham khảo hướng dẫn Prisma và xin phê duyệt của DB owner trước khi thao tác.

## 4. Secrets và bảo mật

- Không commit `.env`, token, mật khẩu, private key hoặc thông tin xác thực.
- Chỉ commit `.env.example` với các biến môi trường mẫu, không chứa secret thật.
- Lưu credentials của Vercel, Neon và các dịch vụ bên ngoài trong hệ thống quản lý environment variables/secrets phù hợp.
- AI coding agent không được yêu cầu xử lý hoặc đưa secret vào prompt, PR, log hay tài liệu.
- Nếu secret bị lộ, cần báo người phụ trách và thực hiện thu hồi hoặc xoay vòng credentials theo quy trình bảo mật.
- Nhóm thực hiện rà soát bảo mật định kỳ trong retrospective.

## 5. Nhịp phát hành

- Mỗi sprint kéo dài 1 tuần.
- Sau khi sprint review đạt yêu cầu, nhóm tạo release tag theo quy ước `v0.<sprint>.0` trên `main`.
- Bugfix có thể được triển khai giữa sprint sau khi PR đáp ứng đầy đủ các điều kiện review và CI.
- Changelog được ghi trong GitHub Releases để hỗ trợ theo dõi thay đổi và Scrum review.
- Việc phát hành phải tuân thủ trạng thái thực tế của CI/CD và quy trình triển khai đã được cấu hình.

## 6. Trách nhiệm của thành viên và AI coding agent

- Tuân thủ `AGENTS.md`, `CONTRIBUTING.md`, issue và các quyết định kỹ thuật đã được phê duyệt.
- Thành viên phụ trách chịu trách nhiệm về toàn bộ thay đổi được gửi lên PR, kể cả code do AI tạo ra.
- Không tự thêm dependency, thay đổi API contract, schema hoặc cấu hình CI/CD ngoài phạm vi được duyệt.
- Không bỏ qua test, validation, phân quyền hoặc kiểm tra bảo mật để làm CI xanh.
- PR phải nêu rõ các thay đổi chính, file đã chạm, cách kiểm thử và kết quả thực tế.
- Không merge nếu CI thất bại hoặc chưa đáp ứng yêu cầu review bắt buộc.

