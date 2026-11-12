# GearLoop — Yêu cầu chức năng

> Bảng yêu cầu chức năng theo nhóm, mỗi dòng một mã yêu cầu (dùng lại mã User
> Story nền) kèm vai trò, mức ưu tiên, sprint dự kiến và nguồn; không chép nguyên
> văn Acceptance Criteria.

Nguồn chính:
[../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md)
(Bảng User Story nền — gán vai, MoSCoW, sprint) ·
[../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md)
(đặc tả AC/BR từng story) ·
[../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md) ·
`prod.md` cũ §1 (đã hợp nhất; xem git history).

## 1. Cách đọc bảng

- **Mã**: `US-xxx` dùng lại nguyên mã của 13 story nền; `FR-XS-nn` là yêu cầu
  xuyên suốt do nhiều story cùng đặt ra (mỗi dòng có nguồn riêng, không phải
  phát minh mới).
- **AC**: cột "Số AC" ghi số tiêu chí chấp nhận đã đặc tả trong specs (tổng
  95 AC); toàn văn AC nằm ở specs §4 của từng story — tài liệu này không nhân
  bản. Tổng 68 BR cục bộ xem [business-rules.md](./business-rules.md).
- **Sprint dự kiến** giữ nguyên nhãn sprint nguồn của story. Trạng thái triển
  khai được theo dõi tại [../planning/backlog.md](../planning/backlog.md) —
  tài liệu này không phán trạng thái "đã làm / chưa làm".

## 2. Bảng yêu cầu chức năng theo nhóm

### 2.1 Xác thực và phân quyền

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-001 | Đăng nhập/đăng xuất bằng bộ tài khoản mẫu; mỗi phiên làm việc mang đúng một vai trong 3 vai và bị kiểm tra quyền trước mọi thao tác nhạy cảm | System | Must | 1 | 6 | stories · Bảng US nền (US-001); specs · US-001 §4–§5 |

### 2.2 Tin đăng (Owner)

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-002 | Tạo và công khai tin cho thuê đầy đủ mô tả, tình trạng, ảnh, giá thuê/ngày, mức cọc và các khung ngày rảnh hợp lệ | Owner | Must | 1 | 8 | stories · Bảng US nền (US-002); specs · US-002 §4–§5 |
| US-003 | Cập nhật nội dung/giá/khung rảnh hoặc tạm ẩn/bỏ ẩn tin của chính mình; sửa giá không hồi tố lên booking đã tạo | Owner | Should | 1 | 8 | stories · Bảng US nền (US-003); specs · US-003 §4–§5 |

### 2.3 Tìm kiếm và xem tin (Renter)

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-004 | Tìm theo từ khóa/danh mục/khoảng ngày còn trống; xem chi tiết tin kèm giá, tỷ lệ cọc, điểm bàn giao và lịch khung ngày còn trống | Renter | Must | 1 | 7 | stories · Bảng US nền (US-004); specs · US-004 §4–§5 |

### 2.4 Đặt thuê, thông báo và duyệt yêu cầu

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-005 | Đặt thuê một khung ngày cụ thể với giá và cọc theo snapshot niêm yết; hệ thống chặn trùng lịch và tự tạo HOLD cọc | Renter | Must | 2 | 10 | stories · Bảng US nền (US-005); specs · US-005 §4–§5 |
| US-006 | Owner nhận thông báo in-app ngay khi có yêu cầu thuê mới (NTF-001) và điều hướng tới chi tiết yêu cầu | Owner | Must | 2 | 3 | stories · Bảng US nền (US-006); specs · US-006 §4–§5 |
| US-007 | Owner xem yêu cầu rồi chấp nhận (CONFIRMED) hoặc từ chối (CANCELLED, RELEASE cọc); kết quả được thông báo cho Renter | Owner | Must | 2 | 7 | stories · Bảng US nền (US-007); specs · US-007 §4–§5 |

### 2.5 Hủy lượt thuê và xử lý cọc

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-008 | Hủy lượt thuê chưa nhận đồ (REQUESTED/CONFIRMED) bởi Renter hoặc Owner theo quy định; lịch được nhả và cọc xử lý theo chính sách hủy | Renter | Must | 2 | 7 | stories · Bảng US nền (US-008); specs · US-008 §4–§5 |
| US-009 | Quản lý trọn vòng đời cọc trên sổ cái append-only: HOLD khi đặt, RELEASE khi kết thúc tốt/bị hủy hợp lệ, DEDUCT + RELEASE phần dư theo phán quyết phân xử | System | Must | 2–3 | 11 | stories · Bảng US nền (US-009); specs · US-009 §4–§5 |

### 2.6 Bàn giao nhận — trả

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-010 | Renter hoàn thành biên bản nhận đồ (ConditionReport PICKUP: checklist OK/NOT_OK, ghi chú, ảnh có dấu thời gian) để xác nhận nhận thiết bị; phiên bắt đầu tính trách nhiệm bảo quản | Renter | Must | 3 | 6 | stories · Bảng US nền (US-010); specs · US-010 §4–§5 |
| US-011 | Owner hoàn thành biên bản trả đồ (ConditionReport RETURN) và xác nhận đã nhận lại thiết bị; phiên được đóng, cửa sổ 48h xử lý cọc bắt đầu | Owner | Must | 3 | 6 | stories · Bảng US nền (US-011); specs · US-011 §4–§5 |

### 2.7 Khiếu nại và phân xử

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-012 | Admin xem khiếu nại kèm bằng chứng hai biên bản cạnh nhau và quyết định hoàn/trừ (một phần) cọc với tỷ lệ 0–100%; mọi phán quyết lưu vết kiểm toán | Admin | Should | 3 | 8 | stories · Bảng US nền (US-012); specs · US-012 §4–§5 |

### 2.8 Quản trị nền tảng

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Số AC | Nguồn |
| --- | --- | --- | :-: | :-: | :-: | --- |
| US-013 | Admin tạm khóa/mở khóa tài khoản vi phạm và ẩn/bỏ ẩn tin không phù hợp, không xóa dữ liệu vật lý; mọi thao tác ghi audit log | Admin | Should | 3 | 8 | stories · Bảng US nền (US-013); specs · US-013 §4–§5 |

## 3. Yêu cầu xuyên suốt

| Mã | Yêu cầu | Vai trò | MoSCoW | Sprint | Nguồn |
| --- | --- | --- | :-: | :-: | --- |
| FR-XS-01 | Thông báo in-app theo bộ sự kiện chuẩn NTF-001…NTF-013 gắn với từng chuyển trạng thái booking/cọc/quản trị; mỗi sự kiện có đúng một nhóm người nhận định nghĩa | System | Must | 2–3 | specs · Phụ lục B3; specs · BR-006-01, BR-012-08, BR-013-05 |
| FR-XS-02 | Nhật ký kiểm toán append-only cho mọi thao tác quản trị nhạy cảm (phân xử, khóa user, ẩn tin): định danh, thời điểm, lý do, trạng thái trước→sau; không sửa/xóa | System | Must | 3 | specs · E-R7, BR-012-04, BR-013-03; `prod.md` cũ §2.6 (đã hợp nhất) |
| FR-XS-03 | Guard phân quyền 2 lớp: chặn sai vai ở tầng route (UI/403) và `requireRole()` đầu mỗi service; UI guard không bao giờ là lớp bảo vệ duy nhất | System | Must | 1 | [../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md); specs · BR-001-01, AC-001-06 |

## 4. Phụ thuộc chính giữa các nhóm

Chuỗi phụ thuộc được specs ghi nhận tóm gọn: US-001 làm nền cho mọi story;
US-002 làm tiền đề cho US-003/004/005; US-005 phát sinh NTF-001 cho US-006 và
cọc HOLD cho US-009; US-007 xác lập CONFIRMED cho US-008/010; US-010/US-011
cấp biên bản PICKUP/RETURN cho US-012 và mở cửa sổ tự hoàn cọc của US-009.
Chi tiết từng quan hệ phụ thuộc: mục §8 của từng story trong
[../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md).
