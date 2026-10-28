# GearLoop — Quy ước bắt buộc cho AI Agent và lập trình viên

Tài liệu này là bộ quy tắc bắt buộc đối với mọi AI coding agent (Cursor, Copilot, ChatGPT, v.v.) và mọi thành viên viết code trong dự án GearLoop.

Mục tiêu: bảo đảm code đúng yêu cầu, thống nhất kiến trúc, an toàn về phân quyền và dữ liệu, dễ kiểm thử, dễ review và hạn chế xung đột khi 8 thành viên cùng sử dụng AI để phát triển.

## 1. Bối cảnh và công nghệ

GearLoop là ứng dụng web cho thuê thiết bị giữa người dùng, phục vụ đồ án môn IT3180. Đây là ứng dụng CRUD thông thường, **không được tự ý bổ sung tính năng AI vào sản phẩm**.

Stack hiện tại:

- Next.js 15 — App Router.
- TypeScript strict.
- Tailwind CSS v4.
- Prisma và PostgreSQL 16; Neon trên cloud, Docker ở local.
- Xác thực bằng bcrypt, JWT và cookie `httpOnly` với `jose`; không tự chuyển sang Auth.js.
- Zod để kiểm tra dữ liệu đầu vào; schema validation đặt theo cấu trúc hiện có trong `src/server/utils/`.
- Vitest để kiểm thử.

Không tự ý đổi framework, package manager, dependency cốt lõi hoặc cách tổ chức dự án nếu chưa được phê duyệt theo quy trình của nhóm.

## 2. Đọc context trước khi thực hiện task

Trước khi viết hoặc sửa code, AI agent PHẢI:

1. Đọc `AGENTS.md` và phần liên quan trong `README.md`.
2. Đọc issue được giao, acceptance criteria (AC), yêu cầu nghiệp vụ (BR) và phạm vi công việc.
3. Đọc `doc/data-model.md`, `doc/cicd.md` và các tài liệu trong `doc/adr/` liên quan trực tiếp đến task.
4. Kiểm tra code, schema, API contract và test hiện có trước khi quyết định cách triển khai.
5. Xác định những file cần sửa, lý do sửa và ảnh hưởng dự kiến trước khi code.

### Thứ tự xử lý khi thông tin mâu thuẫn

Không được tự chọn một phương án chỉ vì phương án đó phổ biến hoặc dễ sinh code hơn.

- Yêu cầu và acceptance criteria đã được nhóm phê duyệt xác định phạm vi của task.
- ADR đã được phê duyệt xác định các quyết định kiến trúc.
- `prisma/schema.prisma`, code hiện có và `doc/data-model.md` phải được đối chiếu khi xử lý dữ liệu, tên field, enum và quan hệ.
- `doc/cicd.md` xác định quy trình Git, CI và PR của dự án.
- `AGENTS.md` quy định cách thực hiện công việc và các giới hạn bắt buộc.

Nếu các nguồn mâu thuẫn hoặc chưa đủ thông tin, hãy nêu rõ điểm mâu thuẫn, nguồn liên quan và câu hỏi cần người phụ trách quyết định. Không tự bịa quy tắc nghiệp vụ, không âm thầm thay đổi kiến trúc và không triển khai dựa trên giả định chưa được xác nhận.

## 3. Kiến trúc backend — bắt buộc tuân thủ

Luồng xử lý chuẩn:

`Route Handler → Service → Repository → Prisma Client`

| Tầng | Trách nhiệm bắt buộc | Không được làm |
|---|---|---|
| `src/app/api/**/route.ts` | Nhận request, kiểm tra đầu vào cần thiết, gọi service phù hợp và trả response qua `withApi()` | Chứa truy vấn Prisma hoặc nghiệp vụ phức tạp |
| `src/server/services/` | Xử lý nghiệp vụ, phân quyền, transaction và lỗi nghiệp vụ bằng `AppError` | Truy cập trực tiếp `req`/`res` hoặc tự viết truy vấn Prisma |
| `src/server/repositories/` | Thực hiện truy vấn Prisma và trả dữ liệu cho tầng service | Chứa nghiệp vụ hoặc tự quyết định mã HTTP |
| `src/server/middleware/` | Cung cấp các cơ chế session và kiểm tra quyền theo code hiện có | Bỏ qua kiểm tra quyền để làm cho demo chạy được |
| `src/server/db/client.ts` | Quản lý Prisma Client dùng chung | Tạo các kết nối Prisma tùy tiện ở từng module |

Route có nhiệm vụ thuần kỹ thuật, không chứa nghiệp vụ, có thể gọi repository trực tiếp nếu phù hợp với quy ước hiện có, chẳng hạn endpoint health check.

Không tự ý chuyển từ kiến trúc API Routes sang Server Actions, không tạo thêm tầng kiến trúc mới và không di chuyển hàng loạt file chỉ để áp dụng một template khác.

### Cấu trúc thư mục hiện tại

- `src/app/`: giao diện và API routes.
- `src/server/services/`: nghiệp vụ và transaction.
- `src/server/repositories/`: truy vấn dữ liệu.
- `src/server/middleware/`: session và phân quyền.
- `src/server/utils/`: Zod schemas và helper.
- `src/server/errors.ts`: `AppError` và các tiện ích xử lý lỗi.
- `src/server/db/client.ts`: Prisma Client.
- `src/db/seed.ts`: dữ liệu mẫu.
- `prisma/schema.prisma`: schema Prisma hiện tại.
- `tests/`: kiểm thử.
- `doc/`: tài liệu và ADR.
- `.github/`: CI/CD, template và quy ước cộng tác.

Chỉ thay đổi cấu trúc trên khi có quyết định được phê duyệt.

## 4. API contract, validation và xử lý lỗi

- Response thành công có dạng `{ "data": ... }`.
- Response thất bại có dạng `{ "error": "..." }`.
- Dùng `withApi()` và cơ chế xử lý lỗi hiện có để giữ response nhất quán.
- Kiểm tra dữ liệu đầu vào ở server bằng Zod theo schema phù hợp.
- Không tin tưởng dữ liệu gửi từ trình duyệt, kể cả khi giao diện đã validate.
- Không trả thông tin nhạy cảm, secret, stack trace nội bộ hoặc dữ liệu của người dùng khác.
- Không tự ý đổi tên field, cấu trúc response, mã lỗi hoặc hợp đồng API nếu task không yêu cầu.
- Khi bổ sung hoặc thay đổi API contract, cập nhật test và tài liệu liên quan.

## 5. Phân quyền và bảo vệ dữ liệu

Phân quyền phải được thực hiện ở server. Ẩn nút trên giao diện không phải là biện pháp bảo mật.

- Mỗi thao tác được bảo vệ phải kiểm tra role và quyền truy cập vào tài nguyên tương ứng.
- Kiểm tra quyền sở hữu bản ghi khi nghiệp vụ yêu cầu; không chỉ kiểm tra role.
- Dùng cơ chế session và `requireRole` hiện có, không tự tạo một hệ thống phân quyền song song.
- Không bỏ qua RBAC vì mục đích demo hoặc để test chạy qua.
- Mọi truy vấn liên quan đến dữ liệu riêng tư phải giới hạn theo danh tính và phạm vi truy cập phù hợp.
- Không tự thêm role, mở rộng quyền hoặc thay đổi chính sách truy cập khi chưa được phê duyệt.

Tên role phải lấy từ schema, code và đặc tả đã được xác nhận. Nếu `SELLER`/`BUYER` và `OWNER`/`RENTER` xuất hiện không thống nhất, phải báo lại để nhóm xác nhận; không tự đổi tên hoặc trộn lẫn các role.

## 6. Quy tắc nghiệp vụ và tính toàn vẹn dữ liệu

Các quy tắc sau phải được bảo toàn theo đặc tả đã được phê duyệt:

- Không cho phép đặt thuê chồng lịch của cùng một thiết bị.
- Tạo booking, cập nhật lịch và ghi nhận khoản cọc phải tuân thủ transaction và quy tắc dữ liệu tương ứng.
- `DepositLedger` là sổ ghi nhận append-only; không tùy tiện cập nhật hoặc xóa bản ghi tài chính.
- `AuditLog` là append-only; không tùy tiện cập nhật hoặc xóa nhật ký.
- Tiền được lưu bằng kiểu số nguyên VND theo schema; không tự chuyển sang số thực.
- Ngày tháng phải tuân theo kiểu dữ liệu, múi giờ và quy ước đã được dự án xác nhận.
- Các chuyển trạng thái booking phải tuân thủ state machine và điều kiện nghiệp vụ được phê duyệt.

Không tự bịa entity, field, enum, trạng thái, quy tắc cọc hoặc chính sách xử lý khiếu nại. Khi có thay đổi nghiệp vụ, cập nhật test và tài liệu liên quan.

## 7. Prisma, schema và migration

- Đọc schema và repository hiện tại trước khi sửa dữ liệu.
- Không tự ý đổi cấu trúc schema hoặc migration history.
- Không chỉnh sửa thủ công các file được sinh tự động.
- Không thêm field, model, enum, index hoặc quan hệ nếu task chưa yêu cầu và chưa được phê duyệt.
- Thay đổi schema phải được DB OWNER xem xét và merge theo quy trình của nhóm.
- Khi schema thay đổi, phải xem xét migration, ảnh hưởng đến dữ liệu, code sử dụng schema và `doc/data-model.md`.
- Không tự chạy lệnh reset hoặc xóa dữ liệu trên database dùng chung.
- Không tự ý thay đổi quy trình migration hoặc seed.

Nếu task không yêu cầu thay đổi schema, mặc định không sửa schema.

## 8. Quy tắc viết code

- Tuân thủ TypeScript strict và phong cách code hiện có.
- Không sử dụng `any`; ưu tiên kiểu dữ liệu cụ thể và an toàn.
- Không tạo `TODO`, stub, placeholder, mock-echo hoặc code giả vờ hoạt động.
- Không hardcode dữ liệu giả để che giấu việc chưa triển khai nghiệp vụ.
- Không sao chép logic đã có nếu có thể tái sử dụng một cách rõ ràng.
- Không thêm abstraction, helper, framework hoặc dependency chỉ để giải quyết một trường hợp đơn giản.
- Không sửa các file không liên quan, không format lại toàn bộ repository và không ghi đè thay đổi của thành viên khác.
- Không đưa secret, token, mật khẩu hoặc nội dung `.env` vào code, log, commit hay báo cáo.
- Nếu chưa thể triển khai đúng yêu cầu, phải báo rõ phần còn thiếu thay vì tạo một bản triển khai giả.

## 9. Quy trình làm việc với AI agent

Mỗi issue phải được xử lý theo quy trình sau:

### Trước khi code

1. Tóm tắt yêu cầu và acceptance criteria.
2. Liệt kê file dự kiến sửa hoặc tạo, kèm lý do.
3. Nêu các giả định, rủi ro và dependency liên quan.
4. Kiểm tra phạm vi sở hữu của pod.
5. Dừng lại để hỏi người phụ trách nếu có xung đột kiến trúc, nghiệp vụ hoặc quyền truy cập.

### Trong khi code

- Chỉ triển khai đúng phạm vi issue.
- Ưu tiên thay đổi nhỏ, dễ kiểm tra và dễ review.
- Không tự mở rộng sang tính năng khác.
- Không chỉnh sửa file do pod khác sở hữu nếu chưa phối hợp.
- Nếu phát hiện cần thay đổi ngoài phạm vi ban đầu, giải thích lý do và xin xác nhận trước.

### Sau khi code

1. Kiểm tra diff để phát hiện file ngoài phạm vi, secret hoặc thay đổi không chủ đích.
2. Chạy các kiểm tra phù hợp với dự án và task.
3. Đối chiếu kết quả với acceptance criteria.
4. Cập nhật tài liệu và test khi cần.
5. Báo cáo file đã thay đổi, kết quả kiểm thử và các vấn đề còn tồn tại.
6. Chuẩn bị nội dung PR để người review có thể hiểu và xác minh thay đổi.

## 10. Kiểm thử và xác minh

Các lệnh kiểm tra chính:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Trước khi chạy, kiểm tra `package.json`, yêu cầu môi trường và hướng dẫn trong `doc/cicd.md`. Test phụ thuộc database phải có database và dữ liệu seed theo yêu cầu.

- Bổ sung hoặc cập nhật test cho hành vi mới và các trường hợp lỗi liên quan.
- Với thay đổi phân quyền, kiểm tra cả trường hợp được phép và bị từ chối.
- Với thay đổi nghiệp vụ, kiểm tra các điều kiện biên và tính toàn vẹn dữ liệu.
- Không xóa hoặc nới lỏng test chỉ để CI xanh.
- Không tuyên bố test, lint hoặc build thành công nếu chưa chạy và xác nhận kết quả.
- Nếu không thể chạy một lệnh, phải ghi rõ lý do và phần chưa được xác minh.

## 11. Git, branch và Pull Request

- Mỗi issue tương ứng một branch và một PR.
- Không commit trực tiếp vào `main`.
- Tuân thủ quy ước tên branch, commit, review và merge trong `doc/cicd.md`.
- Mỗi PR chỉ nên giải quyết một vấn đề và có phạm vi nhỏ, mục tiêu khoảng không quá 300 dòng diff nếu phù hợp.
- Chủ động tự review diff trước khi yêu cầu review.
- Không tự review PR của chính mình; phải có review chéo theo quy ước nhóm.
- PR phải nêu mục tiêu, file đã chạm, cách kiểm thử và kết quả kiểm thử.
- Không tự merge, force-push, viết lại lịch sử branch dùng chung hoặc bỏ qua required checks nếu chưa được cho phép.

## 12. Pods và quyền sở hữu

Phân công hiện tại:

| Pod | Phạm vi sở hữu |
|---|---|
| A | Auth/RBAC/users, CI/CD; `src/app/(auth)`, `src/server/middleware/`, `.github/` |
| B | Domain, schema và repository; `prisma/`, `src/server/repositories/`, domain services |
| C | Transaction và admin; booking/claim/ledger services, `src/app/(admin)` |
| D | QA, seed và tài liệu; `tests/`, `src/db/`, `doc/` |

Quy tắc:

- Kiểm tra chủ sở hữu trước khi sửa file.
- Không tự ý sửa file thuộc pod khác chỉ vì thay đổi đó tiện hơn.
- Nếu cần sửa file dùng chung, hãy trao đổi với người phụ trách và thống nhất phạm vi.
- DB OWNER là người chịu trách nhiệm xem xét và merge thay đổi schema theo quy trình đã thống nhất.
- CODEOWNERS và các thiết lập review phải phản ánh phân công đã được nhóm xác nhận; không tự suy đoán tên tài khoản GitHub.

## 13. Những việc AI không được tự quyết định

Phải xin xác nhận trước khi:

- Thay đổi kiến trúc hoặc di chuyển hàng loạt file.
- Thay đổi schema, migration hoặc quy trình database.
- Thêm dependency hoặc thay đổi package manager.
- Thay đổi API contract, role, quyền truy cập hoặc quy tắc nghiệp vụ.
- Sửa CI/CD, branch protection hoặc quy tắc review.
- Thực hiện thao tác có thể xóa dữ liệu hoặc ảnh hưởng công việc của thành viên khác.

Tuyệt đối không bịa yêu cầu, bỏ qua bảo mật, làm giả kết quả kiểm thử, đưa secret vào repository hoặc che giấu lỗi bằng dữ liệu giả.

## 14. Mẫu báo cáo hoàn thành task

Mọi task do AI hỗ trợ phải có báo cáo gồm:

1. **Mục tiêu:** yêu cầu nào đã được xử lý.
2. **File thay đổi:** đường dẫn và lý do thay đổi.
3. **Kiểm thử:** các lệnh đã chạy và kết quả thực tế.
4. **Acceptance criteria:** tiêu chí nào đã đạt, tiêu chí nào chưa.
5. **Rủi ro hoặc giới hạn:** vấn đề còn tồn tại và phần chưa xác minh.
6. **Câu hỏi cần quyết định:** các điểm còn phụ thuộc người phụ trách.

Chỉ báo cáo hoàn thành khi có đủ bằng chứng tương ứng. Nếu còn tiêu chí chưa đạt hoặc chưa xác minh, phải nêu rõ thay vì khẳng định task đã hoàn tất.
