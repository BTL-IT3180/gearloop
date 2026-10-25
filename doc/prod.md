# GearLoop — Phạm vi sản phẩm & quy tắc nghiệp vụ

## 1. Sản phẩm là gì

Sàn **cho thuê thiết bị ngang hàng** giữa sinh viên: máy ảnh, dụng cụ, đồ cắm
trại. Ba vai trò — đúng 3, không thêm (yêu cầu môn học, ADR-007):

| Vai trò | Nguồn gốc tài khoản | Làm được gì (tóm tắt) |
| --- | --- | --- |
| **Admin** | Seed / Admin cấp | Quản user, category + checklist, duyệt khiếu nại, khoá user/item, audit log, policy settings |
| **Seller** | Đăng ký | CRUD item + giá + cọc, chặn ngày, duyệt booking, biên bản nhận/trả, mở claim, xem sổ cọc |
| **Buyer** | Đăng ký | Tìm theo khung ngày, đặt/huỷ booking, mở claim, review, xem trạng thái cọc |

## 2. Quy tắc nghiệp vụ sống còn (deterministic — không AI)

1. **Không đặt chồng**: một (item, ngày) chỉ một dòng lịch — chặn ở DB.
2. **Cọc giữ trước**: đặt booking → `HOLD`; trả đủ sau cửa sổ claim → `RELEASE`.
3. **Cửa sổ claim 48h** (`policy_settings.claim_window_hours`): hết giờ không
   claim → hệ thống **tự** nhả cọc. Có NOT_OK ở biên bản trả → Buyer/Seller mở claim.
4. **Award ≤ deposit**: Admin quyết số tiền, hệ thống chặn vượt cọc.
5. **Snapshot tiền**: sửa giá không ảnh hưởng booking đã tạo.
6. **Sổ cọc append-only**; **audit log append-only**.
7. **Huỷ trước PICKED_UP**: lịch trả `FREE`, ledger `VOID`. Sau PICKED_UP: chỉ
   đường claim.
8. **Suspension**: `suspension_threshold` vi phạm trong 30 ngày → Admin khoá
   (S3+; cơ chế `is_active` có từ S1).

## 3. Phi phạm vi (cố ý — tránh scope creep)

- ❌ AI/ML: không gợi ý giá, không chấm ảnh hư hỏng, không phát hiện gian lận —
  **giới hạn cứng của môn học**.
- ❌ Cổng thanh toán thật (Stripe/MoMo) — cọc là sổ nội bộ, có thể thay bằng
  mock PSP sau nếu giảng viên yêu cầu.
- ❌ Chat in-app — mọi trao đổi khiếu nại đi qua form có cấu trúc.
- ❌ Giao hàng/vận chuyển — nhận trả trực tiếp.
- ❌ Nhiều chi nhánh/kho — mỗi item một chủ, một vị trí.
