# GearLoop — Tổng quan sản phẩm

> Tóm tắt tầm nhìn, phạm vi, tác nhân và ràng buộc của GearLoop ở tầng yêu cầu;
> không mô tả hiện trạng triển khai.

Nguồn: `prod.md` cũ §1–§3 (đã hợp nhất và xóa khỏi repo; xem git history) ·
[../../README.md](../../README.md) (§ Bối cảnh, § Lộ trình) ·
[../planning/gearloop_project_plan.md](../planning/gearloop_project_plan.md) §1.1, §7.1 (A7, A9) ·
[../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md) ·
[../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md)

## 1. Tầm nhìn

GearLoop là **sàn cho thuê thiết bị ngang hàng giữa sinh viên** (máy ảnh, dụng
cụ, đồ cắm trại), xây dựng trong khuôn khổ môn IT3180 — Nhập môn Công nghệ phần
mềm. Mỗi lượt thuê là một khung ngày rõ ràng, một khoản cọc có sổ sách và một
cặp biên bản tình trạng máy. Sàn cho phép chủ thiết bị tiếp cận người cần thuê
mà không phải nhắn tin tư vấn từng người, và cho người thuê tự đánh giá đủ
thông tin trước khi quyết định thuê.

## 2. Vấn đề cần giải quyết

- **Người thuê** không dám thuê thiết bị đắt vì hai nỗi sợ có dẫn chứng thật:
  (1) lịch bị đặt chồng — các sàn thuê lớn phải khuyến cáo chủ đồng bộ lịch
  tay; (2) bị tính tiền hư hỏng không có căn cứ.
- **Chủ thiết bị** chỉ dám cho thuê khi có cọc giữ trước, biên bản tình trạng
  làm chứng cứ, và lịch chặn chồng ở tầng database.

GearLoop giải quyết cả hai bằng **cơ chế CRUD thuần túy — không AI** (Nguồn:
README § Bối cảnh). Chi tiết quy tắc sống còn xem
[business-rules.md](./business-rules.md).

## 3. Phạm vi sản phẩm

Phạm vi MVP là **13 user story nền** (10 Must · 3 Should) phủ trọn vòng đời
thuê: đăng tin → tìm và xem tin → đặt thuê theo khung ngày → duyệt/từ chối →
hủy trước nhận đồ → giữ/xử lý cọc trung gian → biên bản nhận/trả → phân xử
khiếu nại → quản trị nền tảng. Danh sách story: bảng "User Story nền" trong
[../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md);
đặc tả chức năng: [functional-requirements.md](./functional-requirements.md).

Bản chất phạm vi:

- **CRUD MVP**: mọi năng lực đều là thao tác tạo/đọc/sửa/đổi trạng thái có kiểm
  soát, không có thành phần AI/ML (giới hạn cứng của môn học).
- Cọc vận hành bằng **sổ cái nội bộ** (HOLD/RELEASE/DEDUCT/VOID) — không cổng
  thanh toán thật (plan §7.1 giả định A7).
- Các quy tắc nền (chống trùng lịch, hoàn cọc 48h, biên bản kép) là **quy tắc /
  tiêu chí nằm trong story tương ứng**, không thành story riêng (Nguồn:
  user_stories, phần quy ước).

## 4. Tác nhân và vai trò

RBAC **đúng 3 vai trò người dùng** — yêu cầu cứng của giảng viên (ADR-007).

| Tác nhân | Bản chất | Vai chính trong hệ thống |
| --- | --- | --- |
| Admin | Người dùng (seed / Admin cấp) | Quản trị user, category + checklist, xét khiếu nại (phân xử), khóa user/item, audit log, policy settings |
| Owner | Người dùng (đăng ký) | CRUD tin + giá + cọc, chặn ngày, duyệt booking, biên bản nhận/trả, mở claim, xem sổ cọc |
| Renter | Người dùng (đăng ký) | Tìm theo khung ngày, đặt/hủy booking, mở claim, review, xem trạng thái cọc |
| System | **Tác nhân tự động** | Tự giữ cọc (HOLD), tự hoàn cọc sau cửa sổ quy định, tự nhả lịch khi hủy; thực thi timer/đối soát |

**System không phải vai trò RBAC thứ 4.** Cọc do System tự HOLD/auto-RELEASE,
Admin là bên quyết định trừ cọc qua phân xử; hồ sơ cố ý **không có vai
"trung gian" thứ tư** (Nguồn: user_stories § vai; specs Phụ lục D, mâu thuẫn
số 5). Ma trận quyền chi tiết:
[domain-model.md](./domain-model.md#6-ma-trận-vai-trò-và-quyền-tóm-tắt).

## 5. Ràng buộc hệ thống

| Ràng buộc | Nội dung | Nguồn |
| --- | --- | --- |
| Thời hạn | Demo cuối + nộp báo cáo **08/12/2026**; lộ trình 6 tuần 28/10 → 08/12/2026 (S1–S3 + Sprint 0, freeze 05/12) | [../planning/gearloop_project_plan.md](../planning/gearloop_project_plan.md) §1.1, §1.2 |
| Quy mô dữ liệu | Schema **16 models** (nguồn sự thật: `prisma/schema.prisma`): User, Category, ChecklistTemplateItem, Item, ItemPhoto, RateTier, DepositPolicy, CalendarDay, Booking, ConditionReport, ConditionReportEntry, DamageClaim, DepositLedger, Review, PolicySetting, AuditLog | README § Mô hình dữ liệu; [../architecture/database-design.md](../architecture/database-design.md) §1 |
| Tài chính | Cọc = **sổ ghi nội bộ**; không cổng thanh toán thật (Stripe/MoMo); có thể thay bằng mock PSP sau nếu giảng viên yêu cầu | `prod.md` cũ §3 (đã hợp nhất); plan §7.1 A7 |
| Không AI/ML | Không gợi ý giá, không chấm ảnh hư hỏng, không phát hiện gian lận — **giới hạn cứng của môn học** | `prod.md` cũ §3 (đã hợp nhất) |
| RBAC | Đúng 3 vai trò, mỗi vai có CRUD thực sự; thêm vai phải sửa enum — chủ ý không làm | [../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md) |
| Code base | Một repo — một code base duy nhất; gate G0 "thống nhất code base" (03/11) sign-off trước khi chia việc theo story | plan §1.1 |

## 6. Phi phạm vi (cố ý — tránh scope creep)

Theo `prod.md` cũ §3 (đã hợp nhất) và plan §7.1 A9:

- Không AI/ML (gợi ý giá, chấm ảnh hư hỏng, phát hiện gian lận).
- Không cổng thanh toán thật; cọc là sổ nội bộ.
- **Không chat/thương lượng giá in-app** — Won't cho 6 tuần (plan A9); mọi trao
  đổi khiếu nại đi qua form có cấu trúc.
- Không giao hàng/vận chuyển — nhận trả trực tiếp.
- Không nhiều chi nhánh/kho — mỗi item một chủ, một vị trí.
- US-W1…US-W9 (watchlist) ngoài phạm vi kế hoạch (plan §1.1).
- Review 2 chiều sau phiên: Should trong spec, chốt khi bàn phạm vi
  (user_stories, phần "Cố ý KHÔNG thành story").

## 7. Trạng thái tài liệu — yêu cầu, chưa phải hiện trạng

Tài liệu này mô tả **yêu cầu và kế hoạch** của sản phẩm, không phải hiện trạng
triển khai. Tiến độ theo từng story và các quyết định còn mở (Q1–Q14) được theo
dõi tại [../planning/backlog.md](../planning/backlog.md); tài liệu yêu cầu không
phán đoán trạng thái "đã làm / chưa làm".
