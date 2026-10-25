# ADR-001: Next.js + TypeScript thay Express + vanilla JS của template

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** [ADR-006](./006-layered-architecture.md), template tham chiếu [NgDucLoc/MedBook-Case-Study-Base](https://github.com/NgDucLoc/MedBook-Case-Study-Base)

## Bối cảnh

Template của giảng viên dùng Node.js + Express + vanilla JS, 1 server phục cả
API lẫn UI. Nhóm 8 người có 6 tuần, dùng mạnh AI coding agent, và cần deploy
sớm để bạn cùng lớp beta theo PR.

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| **Mirror 100%: Express + vanilla JS** ✅ template | Giống template tuyệt đối | UI viết tay, không type; preview deploy phải tự dựng; AI agent sinh code vanilla kém ổn định hơn |
| **Next.js + TypeScript** ✅ | 1 codebase cả UI + API (giống tinh thần template); per-PR preview URL trên Vercel; TS bắt lỗi trước khi review; AI agent sinh Next.js rất chuẩn | Deviation có kiểm soát khỏi template stack; team phải học App Router |
| **Next.js + React mà không TS** | Đỡ học | Mất lưới an toàn cho 8 người cùng sửa |

## Quyết định

**Next.js 15 + TypeScript strict.** Giữ nguyên **tổ chức** của template:
kiến trúc 3 tầng (ADR-006), `doc/` + ADR, seed/migrate trong `src/db/`,
CI với postgres service, hợp đồng `{ data } / { error }`, docs tiếng Việt.
Stack là thay đổi **có chủ đích**, được ghi nhận công khai — nếu giảng viên
yêu cầu đúng stack template, chuyển về Express giữ nguyên tầng services/
repositories (chi phí thấp vì logic đã tách tầng).

## Hệ quả

**Tích cực:** preview URL mỗi PR = beta bằng chính PR của mình; type an toàn
giữa 8 pod; API + UI chung một deploy.

**Tiêu cực:** phải tự duy trì mapping (bảng dưới); lệch vài chi tiết template
(ESLint 9 flat thay `.eslintrc.json`; `prisma/` thay migrate SQL thuần — xem ADR-005).

**Bảng ánh xạ với template:**

| Template (MedBook) | GearLoop (Next.js) |
| --- | --- |
| `server.js` | Next runtime + `src/app/api/**/route.ts` |
| `src/routes/*.js` | `src/app/api/**/route.ts` (vẫn mỏng 3–5 dòng) |
| `src/services/*.js` | `src/server/services/*.ts` |
| `src/repositories/*.js` | `src/server/repositories/*.ts` |
| `src/middleware/` | `src/server/middleware/` + `src/middleware.ts` (redirect) |
| `src/db/pool.js` | `src/server/db/client.ts` (Prisma singleton) |
| `src/db/seed.js`, `migrate.js` | `src/db/seed.ts` + `prisma migrate` |
| `public/` | `public/` (giống nhau) |
| `tests/` | `tests/` (vitest thay node --test) |
| `doc/` + ADR | `doc/` + ADR (giống format) |
