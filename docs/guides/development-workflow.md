# GearLoop — Quy trình phát triển

Quy ước issue → branch → PR → review → merge → release, CI thực tế, môi trường triển khai, đồng bộ database và quản lý secret cho người code và AI agent.

Nguồn: AGENTS.md, .github/workflows/ci.yml, .github/PULL_REQUEST_TEMPLATE.md, package.json, Makefile.

## 1. Vòng đời một issue — 10 bước

1. Đọc [AGENTS.md](../../AGENTS.md), issue được giao và các tài liệu kỹ thuật liên quan; kiểm tra code hiện tại, tài liệu và quyền sở hữu các file cần sửa.
2. Xác định acceptance criteria (AC) và phạm vi công việc; liệt kê các file dự kiến thay đổi trước khi code.
3. Tạo branch riêng từ `main` theo quy ước ở mục 2.
4. Triển khai đúng phạm vi issue — không tự thêm tính năng ngoài yêu cầu; viết hoặc cập nhật test phù hợp.
5. Chạy các lệnh kiểm tra phù hợp (mục 10) và xem lại toàn bộ diff.
6. Rebase branch theo `main`, xử lý conflict trước khi yêu cầu review.
7. Commit thay đổi, push branch và tạo PR về `main`: liên kết issue, mô tả thay đổi và ghi rõ cách kiểm thử.
8. Tự review diff; chờ CI xanh và ít nhất một thành viên khác phê duyệt.
9. Squash merge khi đã đáp ứng mọi điều kiện bảo vệ nhánh (mục 4).
10. Xóa branch sau khi merge thành công.

Không khẳng định kiểm thử thành công nếu chưa có kết quả xác minh. Issue, board và label theo dõi ở [../planning/backlog.md](../planning/backlog.md).

## 2. Branch và commit

Trunk-based-lite: `main` được bảo vệ, luôn deploy được; không sử dụng branch `develop`.

| Quy tắc | Chi tiết |
| --- | --- |
| Branch tính năng | `feat/<issue#>-slug` |
| Branch sửa lỗi | `fix/<issue#>-slug` |
| Tương ứng 1:1 | Một issue = một branch = một PR; không gộp thay đổi không liên quan vào cùng PR |
| Nhánh `main` | Không commit trực tiếp vào `main` |
| Tuổi thọ branch | Ngắn hạn, không quá 2 ngày khi phù hợp (nhóm 8 người + AI coding agent) |
| Đồng bộ nhánh | Rebase theo `main` trước khi mở PR, xử lý conflict trước khi yêu cầu review |
| Lịch sử | Không force-push hoặc viết lại lịch sử branch dùng chung khi chưa được phép |

Commit phải nằm đúng phạm vi issue; yêu cầu chưa rõ hoặc tài liệu mâu thuẫn thì hỏi người phụ trách trước khi triển khai.

## 3. Review và merge

- Chiến lược merge duy nhất là **Squash merge**.
- Không tự review hoặc tự phê duyệt PR của chính mình; review chéo theo phân công của nhóm và quy tắc trong `AGENTS.md`.
- Chỉ merge khi đáp ứng yêu cầu review, CI và branch protection hiện hành; không tự thay đổi quy trình của nhóm.
- Giữ PR nhỏ, tập trung một vấn đề, dễ review — mặc định không quá khoảng 300 dòng diff khi phù hợp.
- Mỗi PR cần: liên kết issue và mục tiêu thay đổi; liệt kê file đã chạm và lý do; mô tả cách kiểm thử, kết quả thực tế và giới hạn còn tồn tại; bằng chứng trực quan khi thay đổi giao diện; checklist hoàn thành trong mẫu PR (mục 10).

## 4. Bảo vệ branch `main`

Các điều kiện branch protection (quản trị viên cần xác minh đã bật trong GitHub Branch Protection hoặc Rulesets):

- Bắt buộc tạo PR để merge.
- Ít nhất 1 approval từ thành viên khác; không tự review hoặc tự phê duyệt PR của mình.
- CI phải xanh, với status check bắt buộc là `verify`.
- `verify` chỉ xanh khi cả hai job `unit` và `e2e` hoàn tất thành công.

## 5. CI thực tế (`.github/workflows/ci.yml`)

Workflow `CI` kích hoạt trên mọi `pull_request` và `push` vào `main`; các run cùng ref tự hủy run cũ (concurrency `cancel-in-progress`).

| Job | Môi trường | Các bước | Chặn merge |
| --- | --- | --- | --- |
| `unit` | ubuntu-latest, Node 20 (cache npm), service container PostgreSQL 16 với db `gearloop_test` cổng 5432; env `NODE_ENV=test`, `DATABASE_URL`, `AUTH_SECRET` giá trị CI | checkout → `npm ci` → `npx prisma generate` → `npm run lint` → `npx prisma migrate deploy` + `npm run db:seed` → `npm run build` → `npm run typecheck` → `npm test` | Có |
| `e2e` | ubuntu-latest, Node 20 (cache npm) | checkout → `npm ci` → `npx playwright install chromium` → `npm run test:e2e` | Có |
| `verify` | ubuntu-latest, `if: always()`, `needs: [unit, e2e]` | Chỉ thành công khi cả hai job trên kết thúc với kết quả `success` | Có — làm status check bắt buộc trên PR |

- Job `unit` đồng bộ database (migrate + seed) trước khi build/typecheck/test — không bỏ bước đồng bộ database khỏi CI.
- Job `e2e` không gắn service database; smoke E2E do Playwright tự khởi động Next.js và không cần database.

## 6. Môi trường

| Môi trường | Nền tảng | Dữ liệu |
| --- | --- | --- |
| Local | Docker Compose | PostgreSQL 16 container (cổng host `55432`), seed theo cấu hình dự án — kiểm tra cấu hình thực tế trước khi giả định dữ liệu đã được tạo |
| Preview | Vercel Preview cho mỗi PR | Neon DB branch/copy riêng để reviewer kiểm thử trước khi approve, nếu hạ tầng đã được cấu hình |
| Production | Vercel và Neon PostgreSQL | Triển khai từ `main` sau merge; dữ liệu demo quản lý theo quy trình của dự án |

- Ưu tiên pooled connection string của Neon cho kết nối runtime phù hợp môi trường serverless.
- Không sử dụng Render free PostgreSQL làm database chính theo quyết định hiện tại của nhóm (giới hạn vòng đời dịch vụ); trước khi đổi nhà cung cấp database, connection string hoặc cách quản lý môi trường, cần thống nhất với người phụ trách backend/database.
- Preview không tùy tiện sử dụng hoặc sửa dữ liệu production.
- Không commit file `.env` hoặc thông tin kết nối database chứa secret.
- Rollback ứng dụng: redeploy bản build trước theo quy trình Vercel. Rollback database phải đánh giá riêng theo migration đã triển khai và tính tương thích ngược; `prisma migrate resolve` chỉ điều chỉnh trạng thái migration trong tình huống cụ thể, không phải lệnh rollback schema tổng quát — không tự chạy lệnh sửa trạng thái migration trên production, cần phê duyệt của DB owner.

## 7. Quy tắc đồng bộ database

- CI và Docker dùng `npx prisma migrate deploy`. Migration chứa CHECK, partial unique index và trigger mà `db push` không tạo — không dùng `db push` để đồng bộ schema. Chi tiết ràng buộc: [../architecture/database-design.md](../architecture/database-design.md); quyết định migration: [../architecture/adrs/005-prisma-migrations.md](../architecture/adrs/005-prisma-migrations.md).
- DB mới/trống dùng lịch sử migration hiện tại: migration đầu tiên tạo trực tiếp role `ADMIN`/`OWNER`/`RENTER`, default `RENTER`, cột `Booking.renterId` cùng FK/index; giữ ba migration, không có migration rename riêng. DB từng áp dụng bản cũ sẽ lệch checksum và `migrate deploy` không tự đổi tên các đối tượng đã có — DB OWNER chọn tạo lại DB local khi được phép mất dữ liệu, hoặc chuẩn bị chuyển đổi/baseline riêng nếu phải giữ dữ liệu. Không tự sửa bảng `_prisma_migrations` để che lệch lịch sử và không reset DB dùng chung. Consumer và Prisma Client dùng role/field mới; phiên JWT chứa role cũ cần đăng nhập lại.
- DB đã tạo bằng `db push`: không chạy migration đầu tiên trực tiếp và không reset DB dùng chung. DB OWNER kiểm kê dữ liệu và thiết kế baseline/upgrade riêng: đổi enum `HOLD` thành `DEPOSIT_HELD`, backfill `eventKey` theo sự kiện thực tế, rà soát lịch/cọc sai trước khi thêm ràng buộc. Không tự đánh dấu migration đã áp dụng khi các CHECK/trigger chưa được cài.
- Seed guard: trước khi wipe, seed kiểm tra `Booking`/`DepositLedger`/`AuditLog`; còn dữ liệu ở bất kỳ bảng nào thì bỏ qua và exit 0 để Docker tiếp tục chạy app; không xóa hoặc vô hiệu trigger append-only của ledger/audit. Nếu cả ba bảng trống, wipe và nạp mẫu chạy trong transaction SERIALIZABLE; lỗi thật rollback toàn bộ và exit 1; `CalendarDay` được xoá trước `Booking`. Seed vẫn tái tạo tài khoản/danh mục/tin mẫu khi chưa có dữ liệu nghiệp vụ; không dùng seed để reset dữ liệu giao dịch.
- Backfill thời điểm trả chỉ từ biên bản RETURN; booking `RETURNED` thiếu chứng cứ bị chặn, cần DB OWNER xử lý. Migration bổ sung FK user dùng RESTRICT: không hard-delete user có lịch sử, dùng `isActive` để khóa/mở tài khoản.
- Không tự ý sửa schema, tạo migration hoặc thay đổi quy trình database ngoài phạm vi issue được giao và quyền hạn được phân công.
- Reset database local (khi được phép mất dữ liệu): `npm run db:reset` — xoá sạch dữ liệu, chạy lại toàn bộ migration và nạp dữ liệu mẫu (`prisma migrate reset --force --skip-seed` trong guard + seed chạy tường minh một lần). Script kiểm tra `DATABASE_URL` và từ chối chạy nếu không trỏ tới database local.

## 8. Secrets và bảo mật

- Không commit `.env`, token, mật khẩu, private key hoặc thông tin xác thực; chỉ commit `.env.example` với các biến mẫu, không chứa secret thật.
- Lưu credentials của Vercel, Neon và các dịch vụ bên ngoài trong hệ thống quản lý environment variables/secrets của dịch vụ tương ứng.
- AI coding agent không được yêu cầu xử lý hoặc đưa secret vào prompt, PR, log hay tài liệu.
- Secret bị lộ: báo người phụ trách và thu hồi hoặc xoay vòng credentials theo quy trình bảo mật; nhóm rà soát bảo mật định kỳ trong retrospective.

## 9. Nhịp phát hành

- Mỗi sprint kéo dài 1 tuần.
- Sau khi sprint review đạt yêu cầu, nhóm tạo release tag `v0.<sprint>.0` trên `main`.
- Changelog ghi trong GitHub Releases để hỗ trợ theo dõi thay đổi và Scrum review.
- Bugfix có thể triển khai giữa sprint sau khi PR đáp ứng đầy đủ các điều kiện review và CI.
- Việc phát hành tuân thủ trạng thái thực tế của CI/CD và quy trình triển khai đã được cấu hình.

## 10. Lệnh kiểm tra trước khi tạo PR

| Lệnh | Việc gì | Yêu cầu |
| --- | --- | --- |
| `npm run lint` | ESLint | Không cần DB |
| `npm run typecheck` | `tsc --noEmit` | Không cần DB |
| `npm test` | Vitest — test tích hợp dùng PostgreSQL thật, không mock | DB test đang chạy, đã migrate + seed (chuẩn bị: [setup.md](setup.md), phạm vi: [../testing/test-strategy.md](../testing/test-strategy.md)) |
| `npm run build` | `next build` | Không cần DB |
| `npm run db:reset` | Xoá sạch + migrate + seed lại | Chỉ database local, mất dữ liệu — script từ chối `DATABASE_URL` không phải local |

Ghi rõ lệnh nào đã chạy, kết quả thực tế và những kiểm tra chưa thể thực hiện; không đánh dấu xanh checklist khi chưa chạy. Mẫu PR `.github/PULL_REQUEST_TEMPLATE.md` mục 3 liệt kê đúng bốn lệnh chính (`lint`, `typecheck`, `npm test`, `build`) — mỗi PR cần hoàn thành checklist trong [mẫu PR của repo](../../.github/PULL_REQUEST_TEMPLATE.md).

## 11. Sử dụng AI coding agent

- AI hỗ trợ đọc code, lập kế hoạch, triển khai và viết test; thành viên phụ trách chịu trách nhiệm về toàn bộ thay đổi gửi lên PR, kể cả code do AI tạo ra.
- Tuân thủ `AGENTS.md` và các yêu cầu đã được phê duyệt; kiểm tra code do AI tạo ra, không mặc định rằng code đúng chỉ vì đã được sinh ra.
- Không chấp nhận code giả, dữ liệu hardcode để che giấu chức năng chưa hoàn thiện hoặc kết quả kiểm thử không có thật.
- Nêu rõ việc sử dụng AI theo yêu cầu trong mẫu PR; không gửi secret hoặc dữ liệu nhạy cảm vào công cụ AI.
- Không tự thêm dependency, thay đổi API contract, schema hoặc cấu hình CI/CD ngoài phạm vi được duyệt; không bỏ qua test, validation, phân quyền hoặc kiểm tra bảo mật để làm CI xanh.
- Không merge nếu CI thất bại hoặc chưa đáp ứng yêu cầu review bắt buộc.
