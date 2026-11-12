# GearLoop — User Stories & Đặc tả

Thư mục chứa nguồn chuẩn (canonical) cho yêu cầu nghiệp vụ của GearLoop: user story nền và đặc tả chi tiết đến mức kiểm thử.

**Nguồn:** `gearloop_user_stories.md` · `gearloop_user_story_specs.md` · `../planning/gearloop_project_plan.md` (§1.1, §7.2) · kế hoạch di trú tài liệu 12/11/2026.

## Vai trò từng file canonical

| File | Vai trò | Nội dung chính |
|---|---|---|
| [gearloop_user_stories.md](gearloop_user_stories.md) | Mục tiêu nghiệp vụ, độ cao story | Bảng 13 story nền (vai, MoSCoW, sprint, trạng thái), báo cáo xây dựng lại từ 7 story khung xương, câu hỏi mở cần nhóm chốt (nguồn Q13–Q14) |
| [gearloop_user_story_specs.md](gearloop_user_story_specs.md) | Đặc tả chi tiết từng story | Mỗi story 9 mục: metadata, AC, business rules, validation & xử lý lỗi, phân quyền, phụ thuộc, out of scope (tổng 95 AC, 68 BR). Phụ lục A: benchmark chính sách; B: trạng thái, danh mục lỗi, sự kiện thông báo; C: truy vết Story → Rule → AC; D: câu hỏi mở Q1–Q12 và mâu thuẫn phát hiện khi hợp nhất |
| [../planning/gearloop_project_plan.md](../planning/gearloop_project_plan.md) | WBS mức task | Task được bóc từ mục 4–5 (AC + BR) của từng story trong specs — không bóc từ Out of Scope (§1.1); §7.2 ánh xạ Q1–Q14 tới task bị ảnh hưởng, hạn chốt, fallback |

## Quan hệ giữa các file

```
user_stories (cái gì, cho ai, ưu tiên)
   └─ specs (chi tiết đến mức kiểm thử: AC, BR, validation, out of scope)
        └─ project plan (ai làm khi nào: task WBS, sprint, gate, Q1–Q14)
             └─ backlog (trạng thái triển khai hiện hành, theo dõi bằng git/PR)
```

- Bảng tổng hợp yêu cầu chức năng và quy tắc nghiệp vụ được rút ra ở [../requirements/functional-requirements.md](../requirements/functional-requirements.md) và [../requirements/business-rules.md](../requirements/business-rules.md); khi mâu thuẫn, hai file canonical trong thư mục này thắng.
- Trạng thái làm việc hàng ngày xem ở [../planning/backlog.md](../planning/backlog.md), không dùng cột trạng thái trong user_stories.

### Thứ tự đọc

**Cho dev mới vào dự án:**
1. Bảng 13 story trong `gearloop_user_stories.md` — nắm mục tiêu, vai, MoSCoW, sprint.
2. Mục "Tổng quan 13 story" trong specs, rồi đọc đặc tả các story mình phụ trách (mục 4–5 là phần bóc task và kiểm thử).
3. `../planning/gearloop_project_plan.md` §1.1 (phạm vi, gate G0) và §7.2 (quyết định còn mở).
4. Khi triển khai: `../planning/backlog.md` cho trạng thái hiện hành.

**Cho AI agent:**
- Truy nguồn theo chuỗi story → spec → AC/BR → task; luôn dẫn về file canonical thay vì trích dẫn gián tiếp qua tài liệu tổng hợp.
- Không lấy trạng thái triển khai từ `gearloop_user_stories.md` — đó là ảnh chụp 27/10/2026.
- Tham số gắn `[ĐỀ XUẤT]`/`[CẦN XÁC NHẬN]` chưa phải contract chấp nhận; chờ nhóm chốt (xem Q tương ứng trong Phụ lục D và §7.2).

## Nguyên tắc thẩm quyền

- Hai file trong thư mục này là nguồn chuẩn cho yêu cầu nghiệp vụ. Mọi tài liệu khác chỉ tổng hợp, trích dẫn và phải trỏ về đây.
- Thay đổi yêu cầu phải do nhóm chốt, không sửa đơn phương: khi AC/BR đổi phải sửa cả specs (mục 4–5 và Phụ lục C truy vết) và cập nhật user_stories nếu ảnh hưởng mục tiêu/MoSCoW/sprint; đồng bộ Q tương ứng trong Phụ lục D và project plan §7.2.
- Kết quả chốt được ghi vào `../planning/backlog.md` cùng bằng chứng; Phụ lục D giữ vai trò nhật ký câu hỏi mở cho tới khi có quyết định.

## Lưu ý điều hướng trong specs

- Thứ tự story trong `gearloop_user_story_specs.md` **không theo số ID**: US-001 đứng đầu, sau đó là US-002 → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011 → 003 → 012 → 013 (sắp theo Must trước, Should sau). Dùng bảng chỉ mục dưới đây để tìm đúng phần.
- Các nhóm đề mục `## 1.`/`## 2.`/`## 3.` trong specs không nhất quán: `## 1.` là US-001, `## 2.` là US-009, còn `## 3.` là bảng câu hỏi quyết định (không phải story); file còn có một đề mục cấp 1 giữa chừng ("Cụm Quản trị viên (Admin)") bao US-010…US-013. Đây là hiện trạng của tài liệu canonical, được ghi nhận nguyên trạng — không tự sửa file canonical.

## Trạng thái: ảnh chụp 27/10/2026

Cột "Trạng thái" trong `gearloop_user_stories.md` (tất cả "Chưa làm") là ảnh chụp ngày 27/10/2026 tại thời điểm xây lại bộ story. Không phản ánh tiến độ hiện tại. Theo dõi trạng thái triển khai hiện hành ở [../planning/backlog.md](../planning/backlog.md) — bảng trạng thái ở đó chỉ ghi khi có bằng chứng git/PR.

## Chỉ mục nhanh 13 story

| ID | Tên story | Vai | MoSCoW | Sprint |
|---|---|---|---|---|
| US-001 | Đăng nhập & phân quyền | System | Must | Sprint 1 |
| US-002 | Đăng tin cho thuê | Owner | Must | Sprint 1 |
| US-003 | Quản lý tin đã đăng | Owner | Should | Sprint 1 |
| US-004 | Tìm & xem tin cho thuê | Renter | Must | Sprint 1 |
| US-005 | Đặt thuê theo khung ngày | Renter | Must | Sprint 2 |
| US-006 | Nhận thông báo yêu cầu thuê | Owner | Must | Sprint 2 |
| US-007 | Duyệt / từ chối yêu cầu thuê | Owner | Must | Sprint 2 |
| US-008 | Hủy lượt thuê chưa bắt đầu | Renter | Must | Sprint 2 |
| US-009 | Giữ & xử lý cọc trung gian | System | Must | Sprint 2–3 |
| US-010 | Xác nhận nhận đồ | Renter | Must | Sprint 3 |
| US-011 | Xác nhận trả đồ | Owner | Must | Sprint 3 |
| US-012 | Phân xử tranh chấp hư hỏng | Admin | Should | Sprint 3 |
| US-013 | Quản trị người dùng & tin đăng | Admin | Should | Sprint 3 |

Tổng: 13 story · 10 Must / 3 Should. US-009 trải Sprint 2–3 vì tạo/giữ cọc thuộc Sprint 2, còn hoàn/trừ cọc chỉ chạy được khi có luồng nhận–trả của Sprint 3. Vai chỉ gồm Owner / Renter / Admin / System — cọc do System giữ/hoàn tự động, quyết định trừ cọc thuộc Admin qua phân xử (US-012).
