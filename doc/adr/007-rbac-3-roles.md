# ADR-007: RBAC đúng 3 vai trò — Admin / Seller / Buyer

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** [ADR-002](./002-auth.md)

## Bối cảnh

Yêu cầu cứng của giảng viên: RBAC với **đúng 3 vai trò**, và mỗi vai trò phải
có CRUD thực sự (không được có vai trò "xem cho có"). Mô hình kinh doanh
GearLoop tự nhiên có 3 phía.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| 4+ vai trò (thêm Mediator/Support) | Tách bạch hơn | Vi phạm ràng buộc môn học; Admin đủ để xét khiếu nại |
| Permission granular (role→permission table) | Linh hoạt | Over-engineering cho 3 vai trò × ~20 endpoint |
| **Enum Role trên User + guard theo vai trò** ✅ | Đơn giản, test dễ, đúng ràng buộc | Thêm vai trò sau này phải sửa enum — chấp nhận (phi phạm vi) |

## Quyết định

- `users.role: ADMIN | SELLER | BUYER` (enum, mặc định `BUYER`).
- Guard 2 lớp: `src/middleware.ts` chặn route group sai vai trò (redirect/403
  UI) + `requireRole()` đầu mỗi service (403 API) — **UI guard không bao giờ
  là lớp bảo vệ duy nhất**.
- Ma trận quyền (ngắn): Seller chỉ đụng item/booking của **mình**; Buyer chỉ
  booking của **mình**; Admin toàn quyền đọc + quyền xét xử (claim, khoá).
- Admin **không đụng tay vào dữ liệu giao dịch** ngoài đường xét xử chính
  thức — mọi thao tác ghi `audit_logs`.

## Hệ quả

- Mỗi vai trò có CRUD riêng, đủ nặng để demo: Admin = config + arbitration,
  Seller = supply, Buyer = demand — khớp chấm điểm môn học.
- Thêm vai trò (vd "kiểm duyệt") → thêm enum + guard, không phá cấu trúc —
  nhưng hiện tại **chủ ý không làm**.
