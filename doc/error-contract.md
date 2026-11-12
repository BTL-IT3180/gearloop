# E0-F1-T5 (#64) — Catalog, validation và response

## Cách dùng

`src/lib/error-catalog.ts` chứa 24 mã ERR-USR và 3 mã ERR-SYS từ Phụ lục B4
của `gearloop_user_story_specs.md`. Thông điệp nằm trong repo; app không phụ
thuộc file Downloads. HTTP status là mapping tích hợp của Task 5.

- Thành công: `{ data: T }`; thất bại: `{ error: string, code: ActiveErrorCode }`.
  Field error giữ kiểu string, code được bổ sung ở #64. Kiểu TypeScript dùng
  chung là `ApiResponse<T>` trong `src/lib/api-response.ts`.
- Service ném `new AppError("ERR-USR-010")`; không truyền `(status, message)`
  hoặc thông điệp tự viết. Route dùng withApi. Helper unauthorized/forbidden
  phục vụ guard hiện có, không thay điều kiện kiểm tra quyền.
- Helper chuỗi cũ chưa có caller (badRequest/notFound/conflict) được thay bằng
  AppError(code); domain tương lai phải dùng đúng mã theo ngữ cảnh.
- ERR-USR-005 cần nhãn trường do lập trình viên định nghĩa:
  `new AppError("ERR-USR-005", ["Tiêu đề", "Ảnh"])`.
  Không đưa giá trị người dùng hoặc raw Zod issue vào thông điệp.
- Lỗi chưa phân loại trả ERR-SYS-001/500; server chỉ log marker, không log
  exception/input thô có thể chứa secret. Không tự chuyển mọi lỗi Prisma thành
  conflict; service xác định ngữ cảnh và retry toàn transaction khi phù hợp.
- Health giữ `{ data: { ok: true, db: "up" | "down" } }`; db down vẫn là
  trạng thái chẩn đoán hiện có.

## Schema dùng chung

Schema thuần trong `src/lib/validation/` dùng lại ở form và API Route, không
import DB/session/Next server. Đây là phạm vi dùng chung của issue #64;
helper server vẫn ở `src/server/utils/`. Không chuyển sang Server Actions.

- `loginSchema`: email hợp lệ, trim email; password không rỗng và giữ nguyên
  ký tự. Không tự đặt chính sách độ dài mật khẩu đăng ký; không nhận role từ form login.
- `dateRangeSchema`: chuỗi YYYY-MM-DD hợp lệ theo UTC, endDate >= startDate.
  Cùng ngày hợp lệ theo data model. Câu chữ B4 của ERR-USR-003 vẫn giữ “sau”.
  Chưa thêm kiểm tra hôm nay/múi giờ hoặc chính sách cọc.
- Form dùng safeParse cùng schema, giữ input khi lỗi. Schema trả thông điệp
  catalog, không dùng thông điệp tiếng Anh mặc định của Zod.
- Server dùng `parseInput(schema, input, code)` hoặc
  `parseJsonInput(req, schema, code)` trước thao tác ghi. Code thuộc
  ValidationErrorCode và phải phù hợp ngữ cảnh; validation/JSON syntax trả 400.
- Ví dụ: input login sai cấu trúc dùng ERR-USR-010/400; xác thực thất bại sau
  parse dùng `new AppError("ERR-USR-010")` → 401. Ngày sai dùng ERR-USR-003/400.
- ZodError ngoài helper validation vẫn là lỗi hệ thống 500: không nhầm lỗi
  dữ liệu nội bộ/output với input của người dùng.

Ví dụ route login tương lai gọi
`parseJsonInput(req, loginSchema, "ERR-USR-010")`, rồi chuyển kết quả sang
service auth. Task 5 chỉ cung cấp hợp đồng; chưa triển khai endpoint auth.

## Các mã chưa được áp dụng

ActiveErrorCode loại mã pending khỏi API TypeScript; runtime cũng chặn phát
mã pending. Có mã trong catalog không đồng nghĩa quy tắc đã được triển khai.

| Mã | Điểm cần review trước khi dùng |
| --- | --- |
| ERR-USR-006/014 | Dải cọc 20–50%, giá > 0 chưa khớp mọi ràng buộc hiện tại |
| ERR-USR-012 | Đối chiếu cửa sổ claim B4 với quy tắc hiện tại |
| ERR-USR-015 | Schema không có EXPIRED |
| ERR-USR-021 | Chính sách hủy muộn chưa chốt; có thể là cảnh báo |
| ERR-USR-022 | Quy tắc self-booking chưa chốt |
| ERR-USR-023 | Ràng buộc lý do xử lý chưa chốt |
| ERR-USR-024 | Quy trình khóa user còn booking chưa chốt |

Repo giữ ADMIN/OWNER/RENTER, khóa user bằng isActive. Mô tả B4 dùng
CONFIRMED/REQUESTED phải đối chiếu APPROVED/DEPOSIT_HELD khi triển khai domain
service. Task 5 không bổ sung chuyển trạng thái hay thay schema.

B4 chưa có mã input tổng quát, email trùng hoặc mọi loại tài nguyên 404.
Domain mới cần nhóm bổ sung/chốt catalog; không dùng sai mã 005 để lấp chỗ trống.

## Hợp đồng thông báo NTF — ghi nhận để review

Nguồn B3 có danh sách sự kiện nhưng chưa đủ payload/template để triển khai.
Task 5 ghi contract; không thêm bảng, phát thông báo hay tích hợp email.

| Mã | Sự kiện B3 | Người nhận theo B3 |
| --- | --- | --- |
| NTF-001 | Tạo yêu cầu thuê | Chủ thiết bị |
| NTF-002 | Duyệt yêu cầu | Người thuê |
| NTF-003 | Từ chối yêu cầu | Người thuê |
| NTF-004 | Hết hạn chờ duyệt 24h — đề xuất | Hai phía |
| NTF-005 | Người thuê hủy | Chủ thiết bị |
| NTF-006 | Chủ thiết bị hủy | Người thuê |
| NTF-007 | Xác nhận nhận đồ | Chủ thiết bị |
| NTF-008 | Xác nhận trả đồ | Người thuê |
| NTF-009 | Tự nhả cọc | Hai phía |
| NTF-010 | Mở khiếu nại | Phía đối diện và admin |
| NTF-011 | Phân xử xong | Hai phía |
| NTF-012 | Admin khóa user | User bị khóa |
| NTF-013 | Admin ẩn item | Chủ thiết bị |

Review cần chốt payload tối thiểu, quyền xem, template, khóa chống phát trùng,
đã đọc/chưa đọc, thời gian lưu; ánh xạ tác nhân và trạng thái B3 sang ADR hiện tại.
NTF-004 chưa được phát khi chưa có quyết định về EXPIRED. NTF-001 chỉ phát
ở luồng tạo booking, không phát lại khi đọc danh sách thông báo. Việc bảo đảm
commit booking rồi mới phát thuộc task notification tương lai.

## Bàn giao và nội dung PR

Tiêu đề đề xuất: `feat: standardize error catalog, validation and API responses (#64)`.

API trước đây chỉ có thông điệp lỗi tùy ý. Thay đổi bổ sung catalog B4 và code
trong error envelope, schema login/ngày dùng chung, helper validation server;
giữ success envelope và điều kiện phân quyền hiện có. Mã chưa chốt bị chặn
runtime. Closes #64 khi review xác nhận phạm vi và các kiểm tra bắt buộc đạt.

File thay đổi: `src/lib/` (catalog, response types, schema), `src/server/errors.ts`
và `src/server/api/withApi.ts` (tích hợp contract), `src/server/utils/validation.ts`
(parse input), `src/server/middleware/requireRole.ts` (import tương đối để test
guard trực tiếp), `tests/api-contract.test.ts`; README, backend-flows,
regression-testing và tài liệu này. Không thay schema, dependency hoặc CI.

Xác minh local ngày 02/11/2026:

- `npm.cmd run lint`: đạt.
- `npm.cmd run typecheck -- --incremental false`: đạt.
- `npm.cmd test -- tests/api-contract.test.ts`: 31/31 đạt.
- `npm.cmd run build`: đạt.
- `git diff --check`: đạt.
- Chưa chạy toàn bộ `npm test`: Docker daemon chưa hoạt động, chưa có PostgreSQL
  16 test cô lập. Kết quả 72 test của Task 3 không phải kết quả chạy lại của PR này.

Đã bàn giao catalog, schema dùng chung, envelope và ghi chú NTF. Review cần
phối hợp pod A cho contract auth, pod D cho test/docs; chốt các mã pending,
payload NTF và bổ sung mã cho domain chưa được B4 bao phủ. Commit triển khai:
`b9e2b02`. Chưa xác minh CI remote hoặc tạo PR.

### Regression trước PR — 03/11/2026

- PostgreSQL **16.15**, container `postgres:16-alpine` tạm cô lập, cổng loopback
  ngẫu nhiên và dữ liệu tmpfs; không dùng volume hoặc database dev/chung.
- Prisma validate và generate (6.19.3): đạt.
- Cả 3 migration deploy thành công từ DB trống; migrate status up to date.
- Seed thành công: 6 users, 3 categories, 4 items, 240 ngày lịch.
- `npm.cmd run lint`, `npm.cmd run typecheck -- --incremental false`,
  `npm.cmd run build`: đạt.
- Toàn bộ `npm.cmd test`: **103/103 đạt**, 4 file:
  schema-integrity 62, seed 5, smoke 5, api-contract 31.
- Seed lần đầu trong sandbox lỗi `uv_os_get_passwd`; seed và toàn bộ test
  chạy ngoài sandbox trên cùng DB tạm đều thành công. Không sửa code để né lỗi.
- Prisma cảnh báo cấu hình package.json#prisma sẽ bị bỏ ở Prisma 7; dự án vẫn
  dùng Prisma 6, không thay dependency/config trong Task 5.
- Kết quả local không thay thế CI remote và review chéo.
