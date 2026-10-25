# ADR-006: Kiến trúc 3 tầng Route → Service → Repository (trong Next.js)

- **Trạng thái:** Chấp nhận
- **Ngày:** 2026-10-26
- **Liên quan:** ADR-006 của template (nguồn gốc), [ADR-001](./001-nextjs-typescript.md)

## Bối cảnh

Mirror nguyên vẹn kiến trúc của template vì ba lý do họ nêu vẫn đúng với
GearLoop: mục tiêu dạy học (tách "nghiệp vụ" khỏi "kỹ thuật"), nghiệp vụ có
phần thật sự phức tạp (đặt lịch = transaction 3 ghi, xét claim = 2 ledger
lines), và test được theo tầng.

## Quyết định

Ba tầng, **mỗi tầng chỉ gọi tầng ngay dưới, không nhảy cóc**:

```
src/app/api/**/route.ts  →  src/server/services/  →  src/server/repositories/  →  Prisma client
```

### Hợp đồng từng tầng (mirror template)

| Tầng | PHẢI | CẤM |
| --- | --- | --- |
| Route | 3–5 dòng: parse input → gọi đúng **một** service → trả data (qua `withApi`) | Viết query, chứa `if` nghiệp vụ |
| Service | Validate + nghiệp vụ + `prisma.$transaction` + `requireRole` + ném `AppError(status, msg)` | Đụng `req`/`res`; gọi Prisma trực tiếp |
| Repository | Toàn bộ query Prisma, trả data thuần, nhận `tx` client khi chạy trong transaction | Chứa nghiệp vụ; ném lỗi HTTP |

### Transaction

**Chỉ Service mở transaction**, truyền client (tx) xuống repository — đúng
quy tắc của template: một transaction trải qua nhiều repository, chỉ service
nhìn thấy ranh giới. Repository vì thế có hai loại hàm: độc lập (`listFree()`)
và trong transaction (`flipDays(tx, bookingId, range)`).

### Ngoại lệ được phép

Route không có nghiệp vụ gọi thẳng repository (vd `GET /api/health`,
`GET /api/categories`). Nguyên tắc giữ nguyên: *có nghiệp vụ thì có service;
đọc thuần thì gọi thẳng repository.*

## Hệ quả

- Sửa nghiệp vụ → `services/`; tối ưu query → `repositories/`; đổi HTTP → route.
- Ownership map của 8 người bám theo tầng — mâu thuẫn merge giảm rõ rệt.
- File lớn nhất kỳ vọng ~100 dòng (`bookingService.ts`) — giữ được mỏng.
