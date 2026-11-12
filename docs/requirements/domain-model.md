# GearLoop — Mô hình miền (Domain Model)

> Thuật ngữ, các miền nghiệp vụ, bản đồ thực thể mức khái niệm, vòng đời dữ
> liệu và ma trận vai trò→quyền ở mức yêu cầu; chi tiết cột/ràng buộc DB không
> được lặp lại ở đây.

Nguồn: [../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md) ·
[../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md)
(Phụ lục B) ·
[../architecture/database-design.md](../architecture/database-design.md) §1, §5 ·
[../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md)

## 1. Bảng thuật ngữ

| Thuật ngữ | Định nghĩa |
| --- | --- |
| Owner | Chủ thiết bị; vai người dùng đăng tin, quản lý giá/cọc/khung rảnh, duyệt booking, lập biên bản trả đồ, mở khiếu nại. Schema/API: `OWNER` |
| Renter | Người thuê; vai người dùng tìm tin, đặt/hủy booking theo khung ngày, xác nhận nhận đồ, mở khiếu nại. Schema/API: `RENTER` |
| Admin | Quản trị viên; vai người dùng phân xử khiếu nại, khóa/mở tài khoản, ẩn/bỏ ẩn tin, quản lý cấu hình. Schema/API: `ADMIN` |
| System | Tác nhân tự động (không phải vai RBAC thứ 4): tự tạo HOLD khi đặt, tự RELEASE theo cửa sổ quy định, tự nhả lịch khi hủy/thu hồi |
| Item | Tin đăng thiết bị cho thuê: mô tả, tình trạng, ảnh, giá theo ngày, % cọc, khung ngày rảnh; trạng thái `OPEN`/`HIDDEN` |
| Booking | Lượt thuê chiếm một khoảng ngày trên một Item, mang snapshot giá/cọc; biến đổi theo vòng đời §4 |
| CalendarDay | Một dòng lịch cho một (Item, ngày): `FREE` trống · `BOOKED` đang bị Booking chiếm · `BLOCKED` chủ chặn; `UNIQUE(itemId, date)` |
| DepositLedger | Sổ cái cọc append-only ghi các giao dịch cọc của Booking; specs gọi thực thể này là `DepositTransaction` với các loại HOLD / RELEASE / DEDUCT (DB thêm `VOID` khi hủy còn dư) |
| ConditionReport | Biên bản tình trạng thiết bị tại mốc `PICKUP` (nhận) hoặc `RETURN` (trả): checklist OK/NOT_OK, ghi chú, ảnh có dấu thời gian; khóa chỉ-đọc sau xác nhận |
| DamageClaim | Khiếu nại hư hỏng mở từ biên bản RETURN có `NOT_OK`, do Admin xét; specs gọi thực thể này là `Dispute` |
| AuditLog | Nhật ký append-only mọi thao tác quản trị nhạy cảm (phân xử, khóa user, ẩn tin): ai, khi nào, lý do, trạng thái trước→sau; không sửa/xóa |
| PolicySetting | Cấu hình chính sách key–value toàn sàn: `claim_window_hours`, `deposit_cap_percent`, `suspension_threshold` |

Quy ước đặt tên: **Owner/Renter** là tên nghiệp vụ và schema sau đợt đổi tên
11/11/2026 (ADR-007). Cặp tên khác nhau giữa hai tầng tài liệu được ghi rõ ở
mỗi mục, không đồng bộ tùy tiện.

## 2. Các miền nghiệp vụ

| Miền | Nội dung | Story |
| --- | --- | --- |
| Xác thực & phân quyền | Đăng nhập/đăng xuất bằng tài khoản mẫu, phiên mang đúng một vai, guard 2 lớp theo ADR-007 | US-001 |
| Tin đăng | Đăng tin đầy đủ (mô tả, tình trạng, ảnh, giá, cọc, khung rảnh) và quản lý tin đã đăng | US-002, US-003 |
| Tìm kiếm | Tìm theo từ khóa/danh mục/khoảng ngày còn trống, xem chi tiết tin kèm lịch trống | US-004 |
| Đặt thuê | Chọn khung ngày, snapshot giá/cọc, chọn điểm bàn giao, chặn trùng lịch | US-005 |
| Lịch | CalendarDay một dòng/ngày, chiếm/nhả lịch trong transaction cùng booking | US-005, US-003 (khung rảnh) |
| Cọc | Sổ cái append-only: HOLD khi đặt, RELEASE khi từ chối/hủy/hết cửa sổ, DEDUCT theo phán quyết | US-009, US-008 |
| Bàn giao | Biên bản nhận (PICKUP) và trả (RETURN) làm cổng chuyển trạng thái, bằng chứng ảnh + checklist kép | US-010, US-011 |
| Khiếu nại | Mở claim từ biên bản RETURN có NOT_OK, Admin đối chiếu hai biên bản và phân xử | US-012 |
| Quản trị | Khóa/mở tài khoản, ẩn/bỏ ẩn tin, mọi thao tác ghi audit log; policy settings | US-013, US-012 |
| Thông báo | Sự kiện in-app NTF-001…NTF-013 gắn với từng chuyển trạng thái (specs Phụ lục B3) | xuyên suốt |

## 3. Bản đồ thực thể mức khái niệm

16 models chia 4 nhóm (Nguồn:
[../architecture/database-design.md](../architecture/database-design.md) §1):

| Nhóm | Thực thể | Bản chất |
| --- | --- | --- |
| Con người | `User` | Ai đăng nhập, vai trò nào |
| Danh mục (ít đổi) | `Category`, `ChecklistTemplateItem`, `PolicySetting` | Cấu hình vận hành, Admin khai |
| Tài sản | `Item`, `ItemPhoto`, `RateTier`, `DepositPolicy`, `CalendarDay` | Thiết bị, giá theo ngày, % cọc, lịch ngày |
| Giao dịch (đổi liên tục) | `Booking`, `ConditionReport`, `ConditionReportEntry`, `DamageClaim`, `DepositLedger`, `Review`, `AuditLog` | Lượt thuê và vòng đời của nó |

Tóm tắt một câu: một **Owner** đăng một **Item** thuộc một **Category** kèm
bảng giá (**RateTier**) và % cọc (**DepositPolicy**); lịch cho thuê là các dòng
**CalendarDay**; **Renter** đặt một **Booking** chiếm các dòng lịch đó và cọc
ghi vào **DepositLedger**; hai **ConditionReport** (nhận/trả) là chứng cứ;
hư hỏng sinh ra **DamageClaim** do Admin xét; mọi thao tác quản trị ghi
**AuditLog**.

Sơ đồ quan hệ đầy đủ (ERD) và từ điển cột: xem
[../architecture/database-design.md](../architecture/database-design.md#2-sơ-đồ-quan-hệ-erd)
— tài liệu này không nhân bản.

## 4. Vòng đời Booking

Hai tầng tài liệu mô tả cùng một vòng đời bằng **hai bộ tên trạng thái khác
nhau**; khác biệt này là mâu thuẫn ghi nhận giữa các nguồn, chờ nhóm đồng bộ
(theo dõi tại [../planning/backlog.md](../planning/backlog.md)):

| Nguồn | Tập trạng thái đã ghi |
| --- | --- |
| Specs Phụ lục B1 (tầng story, đã ratify) | `REQUESTED → CONFIRMED → PICKED_UP → RETURNED → CLOSED` \| `CANCELLED` \| `RESOLVED`; `EXPIRED` **không có** trong state machine nguồn |
| [../architecture/database-design.md](../architecture/database-design.md) §5.1 (tầng DB, mô tả luồng dự kiến) | `REQUESTED → DEPOSIT_HELD → APPROVED → PICKED_UP → RETURN_PENDING → RETURNED → CLOSED` \| `DISPUTED → RESOLVED` |

Diễn giải tóm tắt luồng nghiệp vụ (theo specs Phụ lục B1):

1. Renter đặt → `REQUESTED`; tạo HOLD cọc, khung ngày bị chiếm (E-R1, E-R2).
2. Owner duyệt → `CONFIRMED` (specs) / `APPROVED` (DB); từ chối hoặc hủy trước
   nhận đồ → `CANCELLED` kèm RELEASE cọc.
3. Renter nhận đồ kèm biên bản PICKUP → `PICKED_UP` (cổng bắt buộc E-R3).
4. Owner xác nhận trả kèm biên bản RETURN → `RETURNED`; bắt đầu cửa sổ 48h
   (`claim_window_hours`).
5. Hết 48h không khiếu nại → System tự RELEASE → `CLOSED`; có khiếu nại →
   `DISPUTED` → Admin phân xử → `RESOLVED` với DEDUCT + RELEASE phần dư, hoặc
   RELEASE toàn bộ.

`CLOSED` và `RESOLVED` là trạng thái kết thúc — thuê lại phải tạo booking mới.
Bảng chuyển trạng thái đầy đủ kèm điều kiện/vai thao tác:
[../architecture/database-design.md](../architecture/database-design.md#5-vòng-đời-dữ-liệu-state-machine)
§5.2.

## 5. Vòng đời DamageClaim

| Nguồn | Vòng đời |
| --- | --- |
| Specs (US-012, BR-012-01) | `Dispute`: `OPEN → UNDER_REVIEW → RESOLVED_DEDUCT \| RESOLVED_RELEASE`; điều kiện phân xử: Booking ở `RETURNED`, đủ 2 biên bản, HOLD chưa giải tỏa |
| [../architecture/database-design.md](../architecture/database-design.md) §5.3 | `DamageClaim`: `OPEN → UNDER_REVIEW → RESOLVED` (chốt award ≤ deposit) |

Điểm mở: hồ sơ chưa định nghĩa **mốc cuối hợp lệ để mở claim** (cửa sổ mở
khiếu nại) — E-R4 chỉ đặt điều kiện tự RELEASE sau 48h; xem Q4 tại
[business-rules.md](./business-rules.md) (mục quyết định mở Q1–Q14) và
[../planning/backlog.md](../planning/backlog.md).

## 6. Ma trận vai trò và quyền (tóm tắt)

Nguồn: mục §7 (Permissions) của từng story trong specs + ADR-007. Quyền luôn
bị chặn bởi trạng thái tài khoản (`LOCKED`) và trạng thái tin (`HIDDEN` theo
E-R9). Quy tắc chi tiết: [./business-rules.md](./business-rules.md).

| Hành động | Owner | Renter | Admin | System |
| --- | :-: | :-: | :-: | :-: |
| Đăng nhập, phiên một vai | tự mình | tự mình | tự mình | xác thực + cấp quyền |
| Tìm & đọc tin công khai | Có | Có | Có | — |
| CRUD tin của mình (giá, cọc, khung rảnh, tạm ẩn) | Có (chỉ tin của mình) | — | — | — |
| Ẩn/bỏ ẩn tin bất kỳ | — | — | Có | — |
| Đặt thuê (không phải tin của mình) | — | Có | — | — |
| Duyệt / từ chối yêu cầu trên tin của mình | Có | — | — | — |
| Hủy booking chưa nhận đồ | Có (booking CONFIRMED trên tin của mình, theo E-R5) | Có (booking của mình) | có thể can thiệp vì an toàn sàn | nhả lịch |
| Lập biên bản PICKUP (nhận đồ) | đọc | Có (booking của mình) | đọc | — |
| Lập biên bản RETURN (trả đồ) | Có (tin của mình) | đọc | đọc | — |
| Đọc sổ cọc của lượt thuê của mình | Có | Có | — | — |
| Tự tạo giao dịch cọc (HOLD / RELEASE theo timer) | — | — | — | Có |
| DEDUCT / RELEASE theo phân xử | — | — | Có | — |
| Xem khiếu nại toàn sàn, phân xử | — | — | Có | — |
| Khóa / mở khóa tài khoản | — | — | Có | chặn đăng nhập tài khoản `LOCKED` |
| Đọc toàn bộ audit log | — | — | Có | ghi vết tự động |

Nguyên tắc ADR-007: Owner chỉ đụng item/booking của **mình**; Renter chỉ
booking của **mình**; Admin toàn quyền đọc + quyền xét xử, **không đụng tay
vào dữ liệu giao dịch** ngoài đường xét xử chính thức — mọi thao tác ghi
`audit_logs`. Guard 2 lớp: middleware UI + `requireRole()` ở service; UI guard
không bao giờ là lớp bảo vệ duy nhất.
