# E0-F3 — UI primitives và AppShell

Bản ghi triển khai ngày 17/11/2026 trên branch `feat/E0-F3-UI-primitives-AppShell-v2`, tạo từ `main` và kế thừa giao diện E0-F3.
Phạm vi theo [kế hoạch task-level](../gearloop_project_plan.md): E0-F3-T1, T2 và T3.

## Thiết kế

Áp dụng skill `frontend-design` và `webapp-testing` theo yêu cầu cập nhật giao diện.
Tham khảo [full-amazon-clone](https://github.com/no2ehi/full-amazon-clone) ở cấu trúc header hai hàng, thanh tìm kiếm nổi bật và khu vực danh mục.

- Màu: navy `#142333`, thanh điều hướng `#23384c`, cam `#e99832`, sage `#e3ece7`, xanh lá `#28634f`, nền `#f2f4f5`.
- Chữ: Be Vietnam Pro lưu cục bộ; ưu tiên tiếng Việt và tiêu đề dễ đọc trên mobile.
- Bố cục: header tìm kiếm → hero chia đôi nội dung/ảnh → danh mục → hướng dẫn thuê → footer.
- Định hướng: ảnh thiết bị làm điểm nhấn; nội dung bám việc thuê đồ, lịch và tiền cọc. Không đưa số liệu, giá, đánh giá hoặc tồn kho giả.

## Kết quả theo task

| Task | Thay đổi | Bằng chứng |
| --- | --- | --- |
| T1 | Theme navy/cam; AppShell dùng chung; menu desktop/mobile theo vai trò lấy từ Auth.js; đăng xuất thật | `src/app/layout.tsx`, `src/components/layout/`, `src/components/ui/theme.ts`, E2E session/menu |
| T2 | Đồng bộ Button, Input, Select, Table, Card, Toast và EmptyState; trạng thái disabled/loading/error, nhãn và mô tả truy cập | `src/components/ui/`, `tests/ui-primitives.test.ts` |
| T3 | Trang chủ responsive; tìm/lọc danh mục giới thiệu; no-results có đường phục hồi; trang 404, error boundary và loading skeleton | `src/app/(app)/page.tsx`, `src/components/home/`, `src/app/{not-found,error,loading}.tsx` |

Trang login được đồng bộ giao diện với shell và giữ nguyên action xác thực của main.
Root layout lấy user bằng `getCurrentUser()`; bỏ layout lồng và cơ chế role preview/giải mã cookie thủ công.
Form đăng nhập có hiện/ẩn mật khẩu và giữ nội dung sau khi bị từ chối.

## Giới hạn cần hiểu khi review

- Tìm kiếm chỉ lọc ba danh mục giới thiệu, chưa truy vấn Item hay kiểm tra lịch trống.
- Các tuyến quản lý chưa được triển khai hiển thị `Sắp có` và không điều hướng tới URL lỗi. Menu theo role chỉ là hiển thị; các tính năng nghiệp vụ tương lai vẫn phải phân quyền ở server.
- Schema, migration, API contract và dependency dự án không thay đổi.
- Error boundary và loading được kiểm tra ở mức build/component; không bổ sung tuyến gây lỗi giả để demo lỗi 500.
- Ảnh minh họa và giấy phép font: [nguồn asset](../../../public/images/README.md).

## Kiểm thử

Kiểm tra với PostgreSQL 16 tạm, riêng biệt, database `gearloop_test`, migrate và seed trước khi chạy; không sử dụng database ứng dụng của người dùng.

- `npm run build`: đạt.
- `npm run lint`: đạt.
- `npm run typecheck`: đạt.
- `npm test`: 128/128 case đạt trên 9 file.
- Playwright Chromium trên bản production build: 12/12 case đạt (gồm session API, cookie 8 giờ và đăng xuất desktop/mobile).
- Kiểm tra trực quan trang chủ, login, 404, menu mobile bằng Chromium; không lỗi JavaScript trong các trang kiểm tra; không tràn ngang ở 390/768/1024/1440 px.

Danh mục kiểm thử đầy đủ: [test-cases.md](../../testing/test-cases.md).

## Nội dung PR đề xuất

**Title:** `feat(ui): redesign E0-F3 storefront and integrate authenticated AppShell`

Thay giao diện nền tảng E0-F3 bằng storefront tiếng Việt responsive, đồng bộ UI primitives, login, trạng thái rỗng/loading/lỗi. AppShell dùng session Auth.js từ server và đăng xuất thật; tìm kiếm lọc danh mục giới thiệu, các module nghiệp vụ chưa có được ghi rõ trạng thái.

Review tập trung vào root layout/session, menu mobile, truy cập form, và ranh giới giữa danh mục minh họa với dữ liệu cho thuê thực tế.
