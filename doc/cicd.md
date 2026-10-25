# GearLoop — Branching, CI/CD & môi trường

## 1. Branching (trunk-based-lite)

```
main (protected, luôn deploy được) ◄── PR từ feat/<issue#>-slug · fix/<issue#>-slug
```

- Không có branch `develop` — 8 người + AI agent, branch ngắn hạn ≤ 2 ngày.
- **Squash merge duy nhất**, xoá branch sau merge, rebase trước khi mở PR.
- Bảo vệ `main`: bắt buộc PR + 1 approval (không tự review) + CI xanh
  (context: `verify`).

## 2. CI (`.github/workflows/ci.yml`)

| Bước | Lệnh | Chặn merge? |
| --- | --- | --- |
| Install | `npm ci` | ✅ |
| Prisma generate | `npx prisma generate` | ✅ |
| Lint | `npm run lint` (ESLint 9 flat) | ✅ |
| Sync schema + seed | `prisma db push` + `npm run db:seed` trên postgres service | ✅ |
| Build | `npm run build` (Next) | ✅ |
| Typecheck | `npm run typecheck` | ✅ |
| Test | `npm test` (vitest, DB thật — không mock) | ✅ |

> **Ghi chú:** `db push` dùng cho giai đoạn chưa có migration đầu tiên. Sau khi
> story GL-104 (DB owner) merge migration đầu, đổi bước sync sang
> `npx prisma migrate deploy` — không được bỏ.

## 3. Môi trường

| Môi trường | Nguồn | Dữ liệu |
| --- | --- | --- |
| Local | `docker compose up` | Postgres 16 container, seed tự chạy |
| **Preview** (mỗi PR) | Vercel preview URL | Neon DB branch/copy — reviewer test trước khi approve |
| **Production** | Vercel + Neon Postgres | `main` sau merge; seed demo `npm run demo:reset`-tương đương |

- Neon: dùng **pooled connection string** (serverless-safe), free tier không hết hạn.
- Không dùng Render free Postgres làm DB chính — **hết hạn sau 30 ngày**.
- Rollback: Vercel redeploy build trước; DB rollback = `prisma migrate resolve`
  theo hướng dẫn Prisma (hiếm khi cần).

## 4. Secrets

- `.env` không bao giờ commit (`.gitignore`); chỉ `.env.example`.
- Vercel/Neon credentials để trong Vercel Environment Variables, không trong repo.
- AI agent không được dán secret vào prompt/PR — audit hằng tuần ở retro.

## 5. Nhịp phát hành

Mỗi sprint (1 tuần) = một release `v0.<sprint>.0` tag lên `main` sau khi
sprint review pass. Bugfix giữa sprint deploy ngay khi merge (continuous).
Changelog ghi trong GitHub Releases — hỗ trợ điểm Scrum review.
