# GearLoop — Tài liệu dự án

> Điểm vào chính thức cho toàn bộ tài liệu GearLoop. Repository root chỉ giữ hai
> entry point đặc biệt: [README.md](../README.md) (giới thiệu + chạy nhanh) và
> [AGENTS.md](../AGENTS.md) (quy tắc bắt buộc cho người và AI coding agent).

Trạng thái tổ chức: cập nhật 12/11/2026 sau đợt tổng kiểm toán repository
(tài liệu được tập trung về `docs/`, các file trùng lặp được hợp nhất).

## 1. Cấu trúc tài liệu

| Nhóm | Vị trí | Nội dung | Đối tượng chính |
| --- | --- | --- | --- |
| Yêu cầu | [`requirements/`](./requirements/) | Tổng quan sản phẩm, mô hình miền, yêu cầu chức năng, quy tắc nghiệp vụ | Cả nhóm |
| User story | [`user-stories/`](./user-stories/) | 3 tài liệu canonical: story nền, đặc tả AC/BR đầy đủ, mục lục hướng dẫn | PO, dev, QA |
| Kế hoạch | [`planning/`](./planning/) | Backlog & công cụ theo dõi, kế hoạch Agile task-level, sprint hiện hành | Scrum team |
| Kiến trúc | [`architecture/`](./architecture/) | Tổng quan hệ thống, thiết kế database, hợp đồng API, ADR | Dev, DB OWNER |
| Kiểm thử | [`testing/`](./testing/) | Chiến lược kiểm thử & regression, kiểm kê test case hiện có, test plan theo sprint (ánh xạ AC/BR → test) | QA, dev |
| Hướng dẫn | [`guides/`](./guides/) | Cài đặt & chạy, quy trình phát triển (branch/PR/CI/CI-CD, môi trường) | Dev, reviewer |

Cây thư mục:

```text
docs/
├── README.md                 ← bạn đang ở đây
├── requirements/
│   ├── product-overview.md
│   ├── domain-model.md
│   ├── functional-requirements.md
│   └── business-rules.md
├── user-stories/
│   ├── README.md
│   ├── gearloop_user_stories.md        (canonical)
│   └── gearloop_user_story_specs.md    (canonical)
├── planning/
│   ├── backlog.md
│   ├── gearloop_project_plan.md        (canonical, task-level)
│   └── sprints/                        (ROADMAP + sprint-1 + các bản ghi công việc)
├── architecture/
│   ├── system-overview.md
│   ├── database-design.md
│   ├── api-contract.md
│   └── adrs/                           (ADR-001…008 + mục lục)
├── testing/
│   ├── test-strategy.md
│   ├── test-cases.md
│   └── test-plan-sprint-1.md
└── guides/
    ├── setup.md
    └── development-workflow.md
```

## 2. Thứ tự đọc

### Developer mới

1. [README.md](../README.md) — sản phẩm là gì, chạy trong 2 phút.
2. [guides/setup.md](./guides/setup.md) — dựng môi trường (Codespaces/Docker/Node).
3. [requirements/product-overview.md](./requirements/product-overview.md) — phạm vi, vai trò, ràng buộc.
4. [requirements/domain-model.md](./requirements/domain-model.md) — thuật ngữ và vòng đời nghiệp vụ.
5. [architecture/system-overview.md](./architecture/system-overview.md) — kiến trúc 3 tầng, hiện trạng vs kế hoạch.
6. [architecture/database-design.md](./architecture/database-design.md) — 16 bảng, ràng buộc chống đặt chồng.
7. [guides/development-workflow.md](./guides/development-workflow.md) — branch, PR, CI, môi trường.

### AI coding agent (bắt buộc theo AGENTS.md)

1. [AGENTS.md](../AGENTS.md) — quy tắc bắt buộc và giới hạn.
2. [requirements/business-rules.md](./requirements/business-rules.md) và [requirements/functional-requirements.md](./requirements/functional-requirements.md).
3. [user-stories/README.md](./user-stories/README.md) → mở đúng story trong specs trước khi code.
4. [architecture/database-design.md](./architecture/database-design.md) + [architecture/api-contract.md](./architecture/api-contract.md) khi chạm dữ liệu/API.
5. [planning/backlog.md](./planning/backlog.md) — trạng thái và quyết định còn mở.

## 3. Thẩm quyền nguồn thông tin (canonical hierarchy)

1. **Yêu cầu & user story** — thẩm quyền cao nhất thuộc 3 tài liệu canonical:
   [planning/gearloop_project_plan.md](./planning/gearloop_project_plan.md) (task-level),
   [user-stories/gearloop_user_stories.md](./user-stories/gearloop_user_stories.md),
   [user-stories/gearloop_user_story_specs.md](./user-stories/gearloop_user_story_specs.md).
   Không tự ý sửa nội dung canonical; thay đổi yêu cầu phải được nhóm chốt.
2. **Cấu trúc dữ liệu** — `prisma/schema.prisma` + `prisma/migrations/` là nguồn gốc;
   [architecture/database-design.md](./architecture/database-design.md) là bản diễn giải phải cập nhật cùng PR.
3. **Hành vi thực tế** — code và test trong repo; [testing/test-cases.md](./testing/test-cases.md) kiểm kê phạm vi.
4. **Quyết định kỹ thuật** — [architecture/adrs/](./architecture/adrs/); quyết định thay thế ADR cũ phải tạo ADR mới.
5. **Tiến độ & kế hoạch** — [planning/](./planning/); sprint-level hiện hành theo `sprints/`.
6. **Quy trình làm việc** — [guides/development-workflow.md](./guides/development-workflow.md); quy tắc bắt buộc ở [AGENTS.md](../AGENTS.md).

Khi các nguồn mâu thuẫn: ghi nhận discrepancy (không tự hòa giải), ưu tiên canonical
cho yêu cầu và `prisma/schema.prisma` cho dữ liệu; câu hỏi chưa chốt nằm ở
[planning/backlog.md](./planning/backlog.md).

## 4. Quy tắc cập nhật tài liệu

- `prisma/schema.prisma` thay đổi → cập nhật [architecture/database-design.md](./architecture/database-design.md) **cùng PR** (ADR-005).
- API contract/validation thay đổi → cập nhật [architecture/api-contract.md](./architecture/api-contract.md) + test liên quan.
- Thêm/sửa story, AC, BR → cập nhật canonical specs trước, sau đó các bản tổng hợp trong `requirements/`.
- Sprint/milestone/board thay đổi → cập nhật `planning/`.
- Quyết định kiến trúc mới → thêm ADR mới trong `architecture/adrs/`, không sửa lịch sử ADR cũ.
- Không tạo tài liệu trùng trách nhiệm; ưu tiên liên kết chéo thay vì sao chép.

## 5. Đồng bộ yêu cầu ↔ implementation

- `requirements/` mô tả điều **phải đạt** (requirements/planned); không phản ánh tiến độ.
- Tiến độ triển khai chỉ theo dõi ở `planning/` — dựa trên bằng chứng (commit/PR), không suy đoán.
- Implementation khác requirement → ghi discrepancy với cả hai phía; **không sửa requirement cho khớp code**.
- Nhãn gốc `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, `[CẦN XÁC NHẬN]`, `[GIẢ ĐỊNH]` phải được giữ nguyên khi tổng hợp.
- Thông tin tổng hợp có suy luận phải ghi `[Suy luận]`; chưa kiểm chứng ghi `[Cần xác minh]`.

## 6. Xử lý tài liệu lỗi thời (quy ước từ 12/11/2026)

- Git history là kho lưu trữ; **không tạo `archive/`** trong repository.
- Tài liệu bị thay thế: hợp nhất nội dung còn giá trị vào nguồn hiện hành → cập nhật mọi tham chiếu → xóa file cũ trong cùng PR.
- Không giữ file "deprecated" chỉ vì lịch sử; không tạo tài liệu rỗng hoặc trỏ vòng.
- Mọi đợt di chuyển/xóa tài liệu diện rộng phải nêu rõ trong PR: lý do, bằng chứng không còn tham chiếu, kết quả kiểm tra link.
