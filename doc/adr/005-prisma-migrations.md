# ADR-005: Prisma ORM + chiến lược migration

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** ADR-001 của template (no-orm — đối trọng có chủ đích)

## Bối cảnh

Template dùng SQL thuần qua `pg` (ADR-001 của họ). GearLoop có 16 bảng, 8 người
viết song song, và schema là deliverable được chấm (ERD + migration).

## Các phương án đã cân nhắc

| Phương án | Ưu | Nhược |
| --- | --- | --- |
| Raw SQL + pool như template | SQL rõ, đúng template | 8 người tự viết JOIN/model mapping → lệch kiểu dữ liệu; migration tự viết tay dễ hỏng |
| **Prisma + migrate** ✅ | Schema là 1 nguồn sự thật duy nhất (chính là ERD); type-safe client; migration version-controlled | "SQL nằm sau ORM" — giảm nhẹ bằng cách **gom toàn bộ query vào repositories/** |
| Drizzle | Nhẹ hơn | Ít tư liệu tiếng Việt, team chưa biết |

## Quyết định

Prisma. **Quy tắc bù đắp:** tầng `repositories/` là nơi DUY NHẤT gọi Prisma —
muốn biết app chạy những query nào, đọc đúng các file đó (đúng tinh thần
"SQL tập trung một chỗ" của template). Migration:

1. Mỗi story chạm schema → tạo **đúng một** migration có tên rõ
   (`npx prisma migrate dev --name add_damage_claim`).
2. **Chỉ DB OWNER** merge PR chứa migration.
3. CI/dev lần đầu: `prisma db push` — **chuyển sang `migrate deploy`** ngay khi
   migration đầu tiên có mặt (ghi trong `doc/cicd.md`).
4. `prisma/schema.prisma` đổi → `doc/data-model.md` phải đổi cùng PR.

## Hệ quả

- Type-safe giữa 8 pod; refactor schema an toàn hơn.
- Code sinh ra từ Prisma là dependency duy nhất — không ORM khác.
- Nhược điểm thừa nhận: query tối ưu tinh (window function, partial index)
  phải đi qua `$queryRaw` trong repository — vẫn gom một chỗ.
