# ADR-002: Auth.js Credentials + bcrypt session, không dùng demo header

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26 (cập nhật 2026-11-12)
- **Liên quan:** [ADR-001](./001-nextjs-typescript.md), ADR-002 của template (demo auth)

## Bối cảnh

Template dùng header giả lập `X-Demo-User-Id` và mật khẩu plaintext — hợp lý
cho case study nội bộ, không hợp lý với GearLoop vì app **deploy lên Internet
để bạn cùng lớp beta** (URL thật, không phải localhost).

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| Demo header như template | Đúng template, test dễ | Ai cũng giả được user khác — RBAC thành hình thức |
| Auth.js Credentials + bcrypt session ✅ | Tích hợp session/cookie chuẩn; một nguồn kiểm tra identity và role phía server | Auth.js v5 đang ở bản beta; cần giới hạn cấu hình và kiểm thử |
| bcrypt + JWT cookie bằng jose trực tiếp | Ít abstraction | Phải tự duy trì cookie, ký/mã hóa token, hết hạn và logout |

## Quyết định

Theo xác nhận của nhóm ngày 2026-11-12, dùng Auth.js Credentials provider cho
đăng nhập, đăng xuất và session. Mật khẩu lưu trong `User.passwordHash` vẫn
dùng bcrypt; Auth.js kiểm tra credentials bằng `bcrypt.compare` và tạo JWT
session được mã hóa trong cookie `httpOnly; SameSite=Lax; Secure` ở production.
Session tối đa 7 ngày và gắn với đúng một user cùng một role
`ADMIN | OWNER | RENTER`; Auth.js vẫn quản lý các metadata tiêu chuẩn của
token/session như thời hạn và thông tin profile.

Role không lấy từ form hoặc dữ liệu session do client gửi: Auth.js nạp lại
user đang hoạt động và role từ PostgreSQL khi đọc session. Helper server
`src/lib/auth.ts` là giao diện dùng chung để lấy user hiện tại. Trang
`/login` gọi Credentials qua Server Action; logout dùng Auth.js `signOut`.
Đăng ký không thuộc phạm vi quyết định của task này.

## Hệ quả

- `passwordHash` không bao giờ trả về client hoặc session.
- Đổi `AUTH_SECRET` làm vô hiệu session cũ.
- Sai email, mật khẩu, input hoặc tài khoản không hoạt động đều nhận cùng
  thông điệp `ERR-USR-010`; không tiết lộ tài khoản có tồn tại hay không.
- Mọi thao tác cần identity dùng `auth()`/`getCurrentUser()` phía server; không
  tin role từ client.
