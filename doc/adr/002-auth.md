# ADR-002: bcrypt + JWT httpOnly cookie, không dùng demo header

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** [ADR-001](./001-nextjs-typescript.md), ADR-002 của template (demo auth)

## Bối cảnh

Template dùng header giả lập `X-Demo-User-Id` và mật khẩu plaintext — hợp lý
cho case study nội bộ, không hợp lý với GearLoop vì app **deploy lên Internet
để bạn cùng lớp beta** (URL thật, không phải localhost).

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| Demo header như template | Đúng template, test dễ | Ai cũng giả được user khác — RBAC thành hình thức |
| **bcrypt + JWT httpOnly cookie** ✅ | RBAC thật sự có nghĩa; login là luồng white-box test của môn học (Labs 11–12) | Phải cẩn thận secret/cookie flags |
| Auth.js / NextAuth | Nhanh | Magic nhiều, khó vẽ control-flow graph để nộp bài |

## Quyết định

`bcrypt.hashSync(password, 10)` lúc đăng ký; login so `bcrypt.compare`; session
là JWT (thư viện `jose`) đặt trong cookie `httpOnly; SameSite=Lax; Secure`.
Payload `{ sub, role }`, hạn 7 ngày. Tài khoản **demo vẫn dùng mật khẩu chung
`demo123`** để tiện thuyết trình — nhưng cơ chế là thật.

## Hệ quả

- `password_hash` không bao giờ trả về client (lọc ở repository).
- Đổi `AUTH_SECRET` = mọi session cũ vô hiệu (logout toàn cục — chấp nhận được).
- Test login vẽ được flow graph cho Lab 11 (mỗi nhánh sai → 401, đúng → cookie).
