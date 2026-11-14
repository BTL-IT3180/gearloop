# ADR-008: Thời lượng phiên đăng nhập 8 giờ (Q12)

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-11-13
- **Liên quan:** [ADR-002](./002-auth.md); Q12 trong Phụ lục D của
  [gearloop_user_story_specs.md](../../user-stories/gearloop_user_story_specs.md)

## Bối cảnh

Q12 (Phụ lục D của specs) hỏi thời hạn sống của phiên đăng nhập; hạn chốt gốc
04/11 đã trễ. [ADR-002](./002-auth.md) đã ghi hạn 7 ngày khi Q12 còn mở, trong
khi AC-001-05 / BR-001-05 cần một TTL cụ thể để viết test deterministic —
E1-F1-T1 và E1-F1-T4 đang chờ Q12.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| Giữ 7 ngày theo ADR-002 | Không phải đổi gì | Q12 tiếp tục trễ; E1-F1-T1/T4 thiếu TTL để test |
| **8 giờ — fallback đã đề xuất trong backlog Q12** ✅ | TTL biết trước → test AC-001-05/BR-001-05 deterministic | Hết hạn sớm hơn 7 ngày |

## Quyết định

Thời lượng phiên đăng nhập là **8 giờ** — chốt Q12 (Phụ lục D của
[gearloop_user_story_specs.md](../../user-stories/gearloop_user_story_specs.md))
ngày 13/11/2026.

Cơ chế giữ nguyên theo [ADR-002](./002-auth.md): JWT ký bằng `jose`, cookie
`httpOnly; SameSite=Lax`, payload `{ sub, role }`; role vẫn là
`ADMIN|OWNER|RENTER` theo [ADR-007](./007-rbac-3-roles.md).

ADR-002 nay chỉ còn đúng với mọi phần khác; riêng con số thời lượng (7 ngày)
bị ADR-008 thay thế. Theo quy ước `docs/README.md` §4, **không sửa ADR-002**.

## Hệ quả

- Phiên hết hạn → từ chối mọi thao tác cần xác thực với `ERR-SYS-003`, khớp
  AC-001-05 / BR-001-05 trong specs.
- E1-F1-T1/T4 (pod A/P4) triển khai theo 8 giờ; test phải deterministic vì
  TTL đã biết trước.
- [api-contract](../api-contract.md) §3 đã cập nhật `exp` 8 giờ.
- Đổi `AUTH_SECRET` vẫn vô hiệu mọi phiên (giữ nguyên hệ quả của ADR-002).

## Chưa được quyết trong ADR này

- Điều kiện gắn flag `Secure` của cookie (ADR-002 ghi luôn bật, api-contract
  ghi chỉ production) — pod A chốt.
- TTL là hằng số hay cấu hình theo môi trường là chi tiết triển khai của
  E1-F1-T1 (không đặt tên biến môi trường trong ADR này).
- Nửa còn lại của Q12: cách xử lý khi tài khoản bị khóa trong phiên đang mở
  (phiên cũ có giữ quyền hay không) — pod A chốt cùng E1-F1-T4.
