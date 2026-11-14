# GearLoop — Backlog & điều phối kế hoạch

Mục đích: Điểm vào cho việc điều phối: phân biệt hai hệ thống kế hoạch đang tồn tại, ghi lại các mốc/gate, các quyết định còn mở (Q1–Q14) và bằng chứng triển khai quan sát được trong repo.
Nguồn: `docs/planning/gearloop_project_plan.md` §2/§3/§6/§7.2, `docs/planning/sprints/{ROADMAP,sprint-1,e0-f1-t3-schema-integrity,owner-renter-rename}.md`, kết quả `git log`, cây `prisma/migrations`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/project-automation.yml`, `docs/testing/test-cases.md`.

## 1. Mục đích và cách cập nhật

- Tài liệu này là **điểm vào điều phối**, không phải nguồn phạm vi. Phạm vi sprint hiện hành nằm ở `docs/planning/sprints/sprint-1.md` (và các sprint sau do PO cập nhật); danh mục task chi tiết nằm ở `docs/planning/gearloop_project_plan.md` §3.
- Cập nhật khi: (a) một sprint đóng/mở và phạm vi sprint được chốt; (b) một quyết định Q1–Q14 được chốt (ghi ngày + quyết định, không xoá fallback); (c) một mốc/gate §6 đạt hoặc đổi ngày; (d) có commit/PR đáng kể làm thay đổi bằng chứng triển khai ở §6.
- Bảng bằng chứng (§6) chỉ ghi **điều quan sát được** (commit hash + tệp/hành vi hiện có). Tài liệu này **không** phán trạng thái task GL-xxx hay E0-Fx-Ty — trạng thái task thuộc về nguồn kế hoạch tương ứng và board.

## 2. Hai hệ thống kế hoạch đang tồn tại (phải phân biệt rõ)

Repo hiện có **hai hệ kế hoạch khác nhau** cùng dùng nhãn S1/S2/S3 nhưng mang nghĩa khác nhau. Hai hệ **khác lịch và khác team**; tài liệu này **không tự hòa giải** — ghi nhận để PO/người phụ trách chốt.

### 2.1 Hệ sprint-level hiện hành (vận hành sprint)

- Nguồn: [`ROADMAP.md`](./sprints/ROADMAP.md) (lộ trình + cơ chế board) và [`sprint-1.md`](./sprints/sprint-1.md) (phạm vi S1).
- Quy mô: **6 sprint × 1 tuần**, 27/10–7/12/2026, team 8 người chia **4 pod A–D** (A=2, B=3, C=2, D=1 người).
- Chủ đề từng sprint: S1 walking skeleton (URL live ngày 3) · S2 core loop (booking + sổ cọc) · S3 sad paths + Beta (claim, chặn ngày, huỷ) · S4 fix the beta · S5 harden & docs (seed, test case trắng/đen hộp) · S6 freeze & demo.
- Phạm vi S1 trong `sprint-1.md`: GL-101…GL-109 (auth/RBAC, admin user, schema v1, category/checklist, item CRUD, CalendarDay, CI/deploy, seed) + nhịp ngày và exit gate.
- Cơ chế điều phối theo `ROADMAP.md`:
  - **Board** GitHub Projects org (`https://github.com/orgs/BTL-IT3180/projects/5`), field Status 6 cột: `Product Backlog → Ready for Sprint → To Do → In Progress → In Review/QA → Done`; kèm Area pod (4), Priority (4), Estimate (Fibonacci 1/2/3/5/8/13), Sprint (iteration 7 ngày); 8 view (4 view chuẩn + 4 view pod).
  - **Labels** 2 trục: Loại (`type:epic`/`type:story`/`type:chore`/`bug`/`documentation`) và Pod (`area:auth-ci`/`area:domain-schema`/`area:transaction-admin`/`area:qa-docs`); nhãn trạng thái `blocked`.
  - **Milestones** repo `Sprint 1…6` (due 2/11 → 7/12, cách nhau 7 ngày) + iteration trên board; **automation** `.github/workflows/project-automation.yml` (issue→Backlog, PR→In Review/QA, merge→Done) — hiện **ngủ**, cần secret `PROJECT_PAT` (GITHUB_TOKEN không ghi được Projects v2).
  - Quyết định vận hành (26/10): **không chia issue Epic→Story→Task**; sprint-1.md là nguồn sự thật duy nhất về phạm vi; Issues tab để trống, chỉ mở issue khi có bug thật.

### 2.2 Hệ task-level WBS (danh mục task)

- Nguồn: [`gearloop_project_plan.md`](./gearloop_project_plan.md) §2 (cấu trúc WBS) và §3 (bảng Agile Project Plan đầy đủ), kèm §5 (CPM/đường găng), §6 (gate), §7 (giả định + Q1–Q14).
- Quy mô: **4 Epic · 22 Feature · 98 task (≤ 2 ngày) · 217 SP**; mã WBS `E<epic>-F<feature>-T<n>`. Task bóc từ AC + BR của từng story trong specs.
- Sprint theo kế hoạch: **3 sprint + Sprint 0** — Sprint 0 = tuần 1 (nền tảng, gate G0 03/11) · S1 = tuần 2–3 (US-001→004) · S2 = tuần 4–5 (US-005→009) · S3 = tuần 6 (US-010→013 + freeze/rehearsal/demo). Lịch 28/10 → 08/12/2026.
- Team theo kế hoạch: **4 cặp cố định P1–P4** (P1 Đức+Dũng · P2 Bảo+Hoàng · P3 Hiếu+Quốc Anh · P4 Đạt+Trung Anh — chốt 13/11/2026). Danh sách cặp giữ tại đây là canonical; `gearloop_project_plan.md` §1.3 trỏ sang. E0-F4: P3 thực hiện, pod D review `docs/` + `tests/`, pod B review `src/db/`.
- Kế hoạch còn mang nhãn giả định `[ASSUMPTION]` (capacity ~40 SP/tuần, 1 SP ≈ 0,5 ngày công cặp) và lịch điều chỉnh có chủ đích cho chuỗi phụ thuộc US-005→007→010→011→012 — cần chốt tại review.

### 2.3 Bảng so sánh và các điểm xung đột (không tự hòa giải)

| Khía cạnh | Hệ sprint-level (`ROADMAP.md` + `sprint-1.md`) | Hệ task-level (`gearloop_project_plan.md` §2/§3) |
| --- | --- | --- |
| Đơn vị | Story (GL-10x) | Task WBS (E-F-T) |
| Số sprint | 6 sprint × 1 tuần | 3 sprint + Sprint 0 |
| Lịch | 27/10 – 7/12/2026 | 28/10 – 08/12/2026 |
| Nhịp team | 4 pod A–D (2/3/2/1 người) | 4 cặp cố định P1–P4 |
| Đơn vị ước lượng | Estimate Fibonacci (board) | SP theo cặp (1 SP ≈ 0,5 ngày công) |
| Vai trò hiện hành | **Hiện hành cho vận hành sprint**, là nguồn sự thật phạm vi S1 | Nguồn đúng cho **danh mục task/AC-BR** |

Xung đột ghi nhận (cần PO/người phụ trách chốt, **không** tự hòa giải):

1. **Cùng nhãn "S1/S2/S3" khác nghĩa**: ROADMAP S1 = walking skeleton còn kế hoạch S1 = US-001→004 *sau* Sprint 0; ROADMAP S2 = core loop (booking) còn kế hoạch S2 = US-005→009. Dễ nhầm khi trích dẫn "S2".
2. **Khác số sprint và độ dài** (6 × 1 tuần so với 3 + Sprint 0 gồm sprint 2 tuần).
3. **Khác ngày** bắt đầu (27/10 vs 28/10) và kết thúc (7/12 vs 8/12).
4. **Khác cách chia team** (pod A–D theo miền vs cặp P1–P4 theo feature).
5. **Mức sprint của kế hoạch WBS coi như SUPERSEDED**: theo quyết định vận hành 26/10, phạm vi sprint hiện do `sprint-1.md`/ROADMAP quyết định, nên **phần chia sprint của kế hoạch là SUPERSEDED ở mức sprint**; **phần task-level (98 task, mã E-F-T, ánh xạ AC/BR, Q1–Q14, đường găng) vẫn là nguồn đúng** và chưa bị thay thế.

## 3. Hồ sơ công việc (work record) trong `docs/planning/sprints/`

Hai tài liệu dưới đây là **hồ sơ lượt việc** (nhật ký thay đổi + kiểm thử), không phải sprint plan:

- [`e0-f1-t3-schema-integrity.md`](./sprints/e0-f1-t3-schema-integrity.md) — các lượt xử lý ràng buộc DB cho lịch/booking/sổ cọc/audit/tier/checklist (E0-F1-T3) và follow-up.
- [`owner-renter-rename.md`](./sprints/owner-renter-rename.md) — đồng bộ tên role Owner/Renter trong schema và migration đầu.

## 4. Mốc & Gate (từ kế hoạch §6)

| Mốc | Ngày | Phạm vi hoàn thành |
| --- | --- | --- |
| MR — Mid-review nội bộ | 07/11 | Chốt ưu tiên + chốt sớm Q1, Q8, Q11, Q12 |
| G0 — Gate nền tảng | 03/11 | E0 hoàn tất: repo, CI, auth khung, UI primitives, dữ liệu mẫu, quy ước |
| S1 Review + demo nội bộ | 17/11 | US-001→004 đạt AC (kèm US-005 đã khởi động) |
| S2 Review + demo nội bộ | 01/12 | US-005→009 đạt AC + US-010 khởi động |
| S3 Review | 04/12 | US-010→013 đạt AC (không còn hạng mục Must dở) |
| Code freeze | 05/12 | Khóa nhánh, không thêm tính năng; chỉ sửa lỗi P0/P1 |
| Rehearsal (tổng duyệt) | 07/12 | Kịch bản demo + phân vai + video dự phòng |
| Demo cuối + nộp báo cáo | 08/12 | Nghiệm thu mốc dự án; nộp báo cáo + retrospective |

Điều kiện đạt (DoD) từng mốc xem `docs/planning/gearloop_project_plan.md` §6.

## 5. Quyết định còn mở (Q1–Q14)

Từ kế hoạch §7.2 (Q1–Q12 lấy từ Phụ lục D của specs; Q13–Q14 từ câu hỏi mở trong user stories). Cột "Hạn chốt" và "Fallback" giữ nguyên theo kế hoạch; không hạng mục nào gắn [ĐỀ XUẤT] được coi là acceptance contract cuối cho tới khi nhóm chốt.

| ID | Quyết định cần chốt | Task bị ảnh hưởng | Hạn chốt | Fallback nếu chưa chốt |
| --- | --- | --- | --- | --- |
| Q1 | Cơ sở tính % cọc (giá trị kê khai hay tổng tiền thuê) | E1-F2-T1, E2-F1-T3, E2-F5-T1, E2-F5-T3 | 04/11 | Tham số hoá; mặc định % giá trị kê khai (đề xuất) |
| Q2 | Tập trạng thái chặn trùng lịch | E1-F4-T2, E2-F1-T2 | 12/11 | REQUESTED + CONFIRMED + PICKED_UP (BR-005-01) |
| Q3 | Hết hạn 24h chờ duyệt → EXPIRED có vào state machine? | E2-F3-T3 | 18/11 | Bật sau feature-flag; chưa chốt thì không demo |
| Q4 | Cửa sổ mở khiếu nại (48h) và mốc auto-RELEASE | E2-F5-T4, E2-F5-T6, E3-F2-T2, E3-F3-T4 | 18/11 | Giữ E-R4 (48h từ lúc trả đồ); cửa sổ claim chưa chốt → ghi nhận mọi khiếu nại kèm cảnh báo |
| Q5 | Chính sách huỷ muộn của Renter (mốc 48h) | E2-F4-T2 | 24/11 | Hoàn 100% cọc; tiền thuê theo bậc thang (đề xuất) |
| Q6 | Phạt Owner huỷ 10%/30% (ngoài E-R5) | E2-F4-T3 | 25/11 | Chỉ strike + voucher (E-R5); không thu tiền |
| Q7 | Ảnh/checklist bắt buộc, số ảnh tối đa, định dạng, dấu thời gian | E1-F2-T3, E3-F1-T1, E3-F1-T2, E3-F2-T1 | 08/11 (item) · 18/11 (bàn giao) | ≥1 ảnh, ≤10 ảnh, JPG/PNG; checklist mẫu theo danh mục (đề xuất) |
| Q8 | Nội dung khách chưa đăng nhập được xem + trường tối thiểu của thông báo | E1-F4-T1, E2-F2-T1, E2-F2-T2 | 04/11 | Cho xem công khai; NTF hiển thị tối thiểu tên/giá/cọc (đề xuất) |
| Q9 | Ẩn tin Admin ẩn + xử lý khóa user còn booking | E1-F4-T4, E3-F4-T1, E3-F4-T2 | 01/12 | Chặn; phương án A (đề xuất) |
| Q10 | Lý do bắt buộc ghi vết + mã lỗi ERR-USR-023/024 + SLA hàng đợi | E3-F3-T1, E3-F3-T2, E3-F4-T3 | 27/11 | Bắt buộc lý do (≥10 ký tự) + mã đề xuất |
| Q11 | Validation bổ sung (self-booking, thời điểm snapshot, ngày bắt đầu = hôm nay) | E1-F2-T2, E1-F3-T1, E2-F1-T1, E2-F1-T4 | 06/11 | Chặn self-booking; snapshot tại REQUESTED; ngày bắt đầu = hôm nay hợp lệ (đề xuất) |
| Q12 | Thời lượng phiên đăng nhập | E1-F1-T1, E1-F1-T4 | 04/11 | Cấu hình timeout (đề xuất 8h); khóa user → huỷ hiệu lực phiên — **đã chốt 13/11/2026: phiên 8 giờ (ADR-008)**; nửa "khóa user → huỷ hiệu lực phiên" vẫn mở |
| Q13 | US-012 Should → Must? | — (ưu tiên E3-F3) | 01/11 | Đề xuất nâng Must (đường găng) |
| Q14 | Chat/thương lượng giá có làm không? | — | 01/11 | Giữ Won't cho 6 tuần |

Các quyết định này cũng được trỏ tới từ registry ở `docs/requirements/business-rules.md` (mục tham số chính sách + con trỏ quyết định mở).

## 6. Bằng chứng triển khai trong repo

Chỉ liệt kê bằng chứng **quan sát được** (git log rút gọn, tệp và cấu hình hiện có). Không suy ra trạng thái task GL-xxx hay E0-Fx-Ty từ các dòng dưới đây.

| Hạng mục | Commit (git log) | Ghi chú (quan sát được) |
| --- | --- | --- |
| Schema + migrations | `ec69e7a` (scaffold Next.js + TS app, CI, Docker) · `0eda0ca` (16-model Prisma schema + seed + smoke tests, GL-104/107/109) · `470696f` (#185 enforce booking and deposit integrity, E0-F1-T3) · `6350a14` (#196 owner/renter naming) | `prisma/migrations/` hiện có 3 migration: `20261101000000_booking_calendar_ledger_integrity`, `20261101010000_harden_booking_history`, `20261101020000_restrict_historical_user_deletion` |
| Script seed | `0eda0ca` · `04f3aa3` (#184 reproducible local development setup) | `package.json` có `db:seed` → `tsx src/db/seed.ts`; tệp `src/db/seed.ts` tồn tại |
| CI | `ec69e7a` · `07e90bc` (#186 permissions/concurrency/timeout cho workflow verify) | `.github/workflows/ci.yml`: 3 job `unit` (PostgreSQL 16, migrate deploy + seed + test), `e2e` (Playwright Chromium), `verify` (gate khi cả hai pass) |
| Error catalog / validation / envelope | `ae599d0` (#193 standardize error catalog, validation and API responses, #64) | `src/lib/error-catalog.ts`, `src/lib/validation/`, `src/server/errors.ts`, `src/server/api/withApi.ts`, `src/server/middleware/requireRole.ts` |
| Bộ test | `5262325` (#194 khung Vitest + Playwright + smoke test) · `ae599d0` (api-contract) · `470696f` (schema-integrity) · `0eda0ca` (smoke ban đầu) | 5 tệp test hiện có; số case theo file: 31 / 62 / 5 / 5 (Vitest) + 1 (Playwright) — chi tiết ở `docs/testing/test-cases.md` |
| Docs ADR | `7aebf29` (mirror template MedBook — VN docs, ADR 001–007, sprint plan, AGENTS.md) | `docs/architecture/adrs/001..007` + `README.md` hiện có; ADR được đồng bộ thêm trong `470696f` theo `e0-f1-t3-schema-integrity.md` |
| Rename Owner/Renter | `6350a14` (#196) | Hồ sơ lượt việc: `docs/planning/sprints/owner-renter-rename.md` |
| Hạ tầng board sprint-level | `aaf5af8` (operating manual + epic template + dependabot + label taxonomy) · `a2c5ef2` (board automation workflow + estimate field + working agreement) · `5a90e72` (permissions issue/PR write) · `a5c76a3` (sprint-1.md là nguồn sự thật, board để trống) | `.github/workflows/project-automation.yml` tồn tại; theo `ROADMAP.md` automation đang ngủ, cần secret `PROJECT_PAT` |
