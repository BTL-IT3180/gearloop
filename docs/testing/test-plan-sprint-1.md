# GearLoop — Test plan Sprint 1 (v0)

**Nhãn phiên bản:** `v0` — bản đầu, phục vụ task **E0-F4-T1** ("Rà soát spec + lập test plan v0 cho Sprint 1", `docs/planning/gearloop_project_plan.md` §3 dòng 102). Bản này là đầu vào cho E1-F5-T4 ("Chốt test plan chi tiết S1") và phải được cập nhật khi feature lên.

## 1. Mục đích, nguồn và quan hệ tài liệu

Mục đích: ánh xạ **spec canonical** (AC/BR của 4 story Sprint 1) sang các mức test, suite test hiện có và phần còn thiếu, để E1-F5 (hạ tầng test S1) và các cặp sở hữu US-001→US-004 có danh sách việc kiểm thử rõ ràng.

Nguồn thông tin (không chép nguyên văn AC/BR vào đây):

- [`../user-stories/gearloop_user_story_specs.md`](../user-stories/gearloop_user_story_specs.md) — spec canonical US-001 (`:30-126`), US-002 (`:127-232`), US-004 (`:233-316`), US-003 (`:1022-1124`), Phụ lục B4 error catalog (`:1504-1537`), Phụ lục D câu hỏi mở + mâu thuẫn (`:1614-1638`).
- [`./test-strategy.md`](./test-strategy.md) — **chiến lược kiểm thử & quy ước** (không lặp lại ở đây).
- [`./test-cases.md`](./test-cases.md) — **kiểm kê 5 suite hiện có** (103 case Vitest + 1 e2e; không lặp lại bảng kiểm kê ở đây).
- [`../architecture/api-contract.md`](../architecture/api-contract.md) §1 (envelope), §8 (bảng trạng thái endpoint), §9 (validation dùng chung), §10 (mã lỗi pending).
- [`../planning/gearloop_project_plan.md`](../planning/gearloop_project_plan.md) §1.5 (DoR/DoD), §3 (98 task), §5 (CPM/Slack), §7.2 (Q1–Q12 → task).
- [`../planning/sprints/sprint-1.md`](../planning/sprints/sprint-1.md) và [`../planning/backlog.md`](../planning/backlog.md) §2.3 (xung đột nhãn sprint).

Quan hệ với hai tài liệu testing đã có: `test-strategy.md` giữ **triết lý + quy ước + cách chạy**; `test-cases.md` giữ **kiểm kê case hiện có**; tài liệu này giữ **ánh xạ AC/BR → test dự kiến → trạng thái** cho Sprint 1.

## 2. Phạm vi

**Trong phạm vi:** US-001 → US-004 theo metadata canonical của specs (`gearloop_user_story_specs.md` bảng tổng quan `:13-15` + dòng `:23`), tức nhãn **"Sprint 1" của hệ specs**: US-001 (6 AC/5 BR), US-002 (8 AC/4 BR), US-004 (7 AC/4 BR), US-003 (8 AC/4 BR) — tổng **29 AC, 17 BR**.

**Xung đột nhãn cần ghi nhận (không tự hoà giải):** nhãn này **khác nghĩa** với `S1` của hệ sprint-level vận hành, nơi `sprint-1.md` = "Walking Skeleton" (GL-101…GL-109: auth/RBAC, admin user, schema v1, category/checklist, item CRUD, CalendarDay, CI/deploy, seed) và `ROADMAP.md` S2 = core loop (booking). Hệ task-level (`gearloop_project_plan.md`) đặt S1 = US-001→US-004 **sau** Sprint 0. Trích dẫn lại theo [`../planning/backlog.md`](../planning/backlog.md) **§2.3 mục 1** ("Cùng nhãn \"S1/S2/S3\" khác nghĩa"); PO/người phụ trách chốt, tài liệu này không hoà giải.

**Ngoài phạm vi:** US-005 trở đi (kể cả US-005 "Đặt thuê theo khung ngày" — dù `sprint-1.md` mốc 17/11 ghi "kèm US-005 đã khởi động"); toàn bộ US-W1…US-W9 (watchlist); tính năng ngoài 13 story nền.

## 3. Cách tiếp cận

### 3.1 Các mức test

| Mã | Mức | Công cụ / cơ chế | Ghi chú |
| --- | --- | --- | --- |
| `HB` | Unit handler boundary | Vitest, gọi `withApi` bằng `Request`/`Response` thật | `tests/api-contract.test.ts`; **chưa** phải E2E qua HTTP server |
| `DB` | DB-integration | Vitest + PostgreSQL thật, schema rời (`gearloop_test`) | `tests/schema-integrity.test.ts`, `tests/seed.test.ts`, `tests/smoke.test.ts` |
| `API` | API contract | HTTP thật trên route thật (kế hoạch E1-F5-T2) | **Chưa tồn tại** cho các endpoint auth/item/search |
| `E2E` | End-to-end UI | Playwright Chromium | `e2e/smoke.spec.ts` (1 case) + kế hoạch E1-F5-T5 |

### 3.2 Nguyên tắc (theo `test-strategy.md`, không lặp)

- **HTTP thật + PostgreSQL thật — không mock**; mock chỉ che giấu lỗi tích hợp.
- **Chạy tuần tự** (`vitest run`, không parallel suite) vì dùng chung 1 database; mỗi file test **tự seed lại** trạng thái cần thiết, không phụ thuộc thứ tự file.
- **Cô lập DB test theo schema rời**: `schema-integrity`/`seed` tự tạo schema ngẫu nhiên (`e0_f1_t3_<uuid>`), chạy `migrate deploy`, tự tạo fixture, xóa đúng schema đó; guard `beforeAll` buộc `DATABASE_URL` trỏ `/gearloop_test` local.
- **Không dùng `db push`** (bỏ qua CHECK/trigger).
- Không xóa/nới lỏng test để CI xanh (AGENTS.md §10).

### 3.3 Điều kiện chạy

(`test-strategy.md` §3–§4, `test-cases.md` §3): Docker PostgreSQL local + `gearloop_test` đã migrate và seed; quyền tạo/xóa schema cho user DB test; `npx playwright install chromium` một lần cho e2e.

## 4. Ánh xạ Acceptance Criteria (US-001 → US-004)

Cột **Suite hiện có** khớp `test-cases.md` §1–§2. **Trạng thái** dùng đúng 3 nhãn: `Đã có`, `Cần viết khi feature lên`, `Lỗ hổng`. Vì chỉ `GET /api/health` tồn tại (`api-contract.md` §8), toàn bộ AC tính năng cần route lên mới test được end-to-end; hiện chỉ kiểm thử được tầng đã có.

| AC-ID | Kết quả mong đợi (ngắn) | Test case dự kiến | Mức test | Suite hiện có (nếu có) | Trạng thái | Phụ thuộc Qx |
| --- | --- | --- | --- | --- | --- | --- |
| AC-001-01 | Đăng nhập tài khoản mẫu, phiên mang đúng 1 vai, đúng phạm vi dữ liệu | TC-001-01-1 (login happy path), TC-001-01-2 (phiên mang role) | `API`+`E2E` | `tests/api-contract.test.ts` (guard `requireRole` cho phép role phù hợp — một phần); `tests/smoke.test.ts` (6 user/3 vai — một phần) | Cần viết khi feature lên | — |
| AC-001-02 | Đăng xuất chấm dứt hiệu lực phiên ngay | TC-001-02-1 (logout → cookie cũ bị từ chối) | `API`+`E2E` | — | Cần viết khi feature lên | — |
| AC-001-03 | Sai định danh hoặc sai mật khẩu → `ERR-USR-010`, không lộ tài khoản tồn tại | TC-001-03-1 (2 nhánh cùng phản hồi chung) | `HB`+`API` | `tests/api-contract.test.ts` (`schema dùng chung`: 5 input login sai dùng thông điệp catalog; `response API`: ERR-USR-010 → 401 — một phần) | Cần viết khi feature lên | — |
| AC-001-04 | Tài khoản bị khóa → từ chối, `ERR-USR-011` | TC-001-04-1 (fixture `isActive=false` → 403) | `HB`+`API` | `tests/api-contract.test.ts` (`response API`: ERR-USR-011 → 403 — một phần) | Cần viết khi feature lên | — (fixture khóa; E-R9/US-013) |
| AC-001-05 | Phiên hết hạn → thu hồi, `ERR-SYS-003` | TC-001-05-1 (token hết hạn → 401) | `HB`+`API` | `tests/api-contract.test.ts` (`guard hiện có dùng catalog`: thiếu phiên → ERR-SYS-003/401 — một phần) | Cần viết khi feature lên | Q12 đã chốt: 8 giờ (ADR-008) |
| AC-001-06 | Thao tác trái vai bị chặn, dữ liệu không đổi, `ERR-USR-008` | TC-001-06-1 (RENTER gọi hành động OWNER/ADMIN) | `HB`+`API` | `tests/api-contract.test.ts` (`guard hiện có dùng catalog`: sai role → ERR-USR-008/403 — một phần) | Cần viết khi feature lên | — |
| AC-002-01 | Tạo tin thành công, chuyển sang trạng thái mở (OPEN), công khai cho Renter | TC-002-01-1 (tạo tin đủ trường + ≥1 khung rảnh) | `API`+`E2E` | `tests/smoke.test.ts` (item có tier + cọc + ảnh — một phần); `tests/schema-integrity.test.ts` (`RateTier ranges` — một phần) | Cần viết khi feature lên | **Q1, Q7, Q11** |
| AC-002-02 | Thiếu trường bắt buộc/không có ảnh → `ERR-USR-005`, giữ dữ liệu đã nhập | TC-002-02-1 (thiếu từng trường) | `HB`+`API` | `tests/api-contract.test.ts` (`catalog B4`: định dạng danh sách trường bằng nhãn — một phần) | Cần viết khi feature lên | Q7 |
| AC-002-03 | Giá thuê/ngày ≤ 0 → `ERR-USR-006` | TC-002-03-1 (giá 0/âm) | `HB`+`DB` | `tests/schema-integrity.test.ts` (`RateTier ranges`: giá âm bị CHECK 23514 — một phần) | **Lỗ hổng** | **Q1** (mã 006 pending) |
| AC-002-04 | Tỷ lệ cọc ngoài dải → `ERR-USR-014` | TC-002-04-1 (cọc < 20% / > 50%) | `HB`+`API` | — (seed có `deposit_cap_percent=50`; chưa thấy case dải 20–50% trong `test-cases.md`) | **Lỗ hổng** | **Q1, Q7** (mã 014 pending) |
| AC-002-05 | Khung rảnh quá khứ → `ERR-USR-002`; ngày kết thúc < bắt đầu → `ERR-USR-003` | TC-002-05-1 (đảo ngược), TC-002-05-2 (bắt đầu trong quá khứ) | `HB`+`API` | `tests/api-contract.test.ts` (`schema dùng chung`: 7 khoảng ngày UTC gồm khoảng đảo ngược — một phần) | Cần viết khi feature lên | **Q11** (ERR-USR-002 chưa có trong schema) |
| AC-002-06 | Nhiều khung rảnh hợp lệ được lưu đầy đủ | TC-002-06-1 (2 khung rời) | `DB`+`API` | `tests/schema-integrity.test.ts` (`CalendarDay booking relationship` — một phần) | Cần viết khi feature lên | Q11 |
| AC-002-07 | Hai khung rảnh tự chồng lấn bị chặn khi tạo tin | TC-002-07-1 (2 khung overlap) | `HB`+`API` | — | **Lỗ hổng** | **Q11** (quy tắc `[CẦN XÁC NHẬN]`) |
| AC-002-08 | Không phải OWNER tạo tin → `ERR-USR-008` | TC-002-08-1 (RENTER/chưa xác thực) | `HB`+`API` | `tests/api-contract.test.ts` (`guard hiện có dùng catalog` — một phần) | Cần viết khi feature lên | — |
| AC-003-01 | Danh sách tin của chính mình (cả đang mở và đang ẩn), không thấy tin chủ khác | TC-003-01-1 (2 Owner, kiểm tra phạm vi) | `API`+`E2E` | — | Cần viết khi feature lên | — |
| AC-003-02 | Cập nhật mô tả / thêm khung rảnh tương lai, hiệu lực ngay | TC-003-02-1 (sửa mô tả + thêm khung) | `API`+`E2E` | — | Cần viết khi feature lên | **Q11** |
| AC-003-03 | Sửa giá không ảnh hưởng booking đã tạo (bất biến snapshot) | TC-003-03-1 (giá mới chỉ áp booking mới; HOLD cũ nguyên) | `DB`+`API` | `tests/schema-integrity.test.ts` (`Booking values and history`: bảo vệ snapshot tiền — một phần) | Cần viết khi feature lên | **Q11** |
| AC-003-04 | Tạm ẩn tin khi không có booking đang hoạt động → tin chuyển sang HIDDEN | TC-003-04-1 (ẩn tin không booking) | `API`+`E2E` | — | Cần viết khi feature lên | — |
| AC-003-05 | Chặn tạm ẩn khi còn booking đã xác nhận/đang thuê → `ERR-USR-020` | TC-003-05-1 (ẩn tin có booking CONFIRMED/PICKED_UP) | `API` | — | Cần viết khi feature lên | — |
| AC-003-06 | Mở lại tin đã tạm ẩn (do Owner tự ẩn) → tin mở lại | TC-003-06-1 (bỏ ẩn tin Owner tự ẩn) | `API`+`E2E` | — | Cần viết khi feature lên | — |
| AC-003-07 | Thao tác trên tin của chủ khác → `ERR-USR-008` | TC-003-07-1 (Owner A sửa/ẩn tin Owner B) | `API` | — | Cần viết khi feature lên | — |
| AC-003-08 | Tin bị Admin ẩn: Owner không mở lại được, giữ nguyên trạng thái | TC-003-08-1 (fixture tin bị Admin ẩn) | `API` | — | Cần viết khi feature lên | **Q9** (US-013, Sprint 3) |
| AC-004-01 | Tìm theo từ khóa trả tin đang mở, đủ trường tối thiểu (ảnh, tiêu đề, danh mục, giá/ngày, % cọc) | TC-004-01-1 (tìm từ khóa khớp) | `API`+`E2E` | — | Cần viết khi feature lên | **Q8** |
| AC-004-02 | Lọc theo khoảng ngày loại Item có booking chiếm lịch; đổi khoảng thì Item xuất hiện lại | TC-004-02-1 (lọc ngày loại/tái xuất hiện) | `API` | `tests/schema-integrity.test.ts` (`CalendarDay booking relationship` — một phần) | Cần viết khi feature lên | **Q2** |
| AC-004-03 | Lọc theo danh mục + sắp xếp giá tăng dần | TC-004-03-1 (danh mục + sort giá) | `API` | — | Cần viết khi feature lên | — |
| AC-004-04 | Chi tiết tin: mô tả, ảnh, tình trạng, giá/ngày, tỷ lệ cọc, điểm bàn giao, khung rảnh còn trống | TC-004-04-1 (chi tiết tin đầy đủ) | `API`+`E2E` | — | **Lỗ hổng** | **Q1** (PickupPoint chưa có model) |
| AC-004-05 | Tin bị ẩn/chủ bị khóa không hiện trong tìm kiếm; truy cập trực tiếp → `ERR-USR-004` | TC-004-05-1 (ẩn khỏi list + chặn truy cập trực tiếp) | `API` | `tests/api-contract.test.ts` (`response API`: ERR-USR-004 → 404 — một phần) | Cần viết khi feature lên | **Q9** |
| AC-004-06 | Khoảng ngày lọc không hợp lệ → `ERR-USR-002`/`ERR-USR-003`, giữ danh sách hiện tại | TC-004-06-1 (đảo ngược + bắt đầu trong quá khứ) | `HB`+`API` | `tests/api-contract.test.ts` (`schema dùng chung`, 7 khoảng ngày UTC — một phần) | Cần viết khi feature lên | **Q11** |
| AC-004-07 | Không có kết quả → danh sách trống + hướng dẫn, không lỗi | TC-004-07-1 (bộ lọc không khớp) | `API`+`E2E` | — | Cần viết khi feature lên | — |

## 5. Ánh xạ Business Rules (17)

Nhãn `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` / `[CẦN XÁC NHẬN]` **giữ nguyên** như trong canonical specs.

| BR-ID | Diễn giải 1 dòng | Cách kiểm chứng | Phụ thuộc Qx |
| --- | --- | --- | --- |
| BR-001-01 | Mỗi phiên gắn đúng 1 user và 1 vai; mọi thao tác nhạy cảm kiểm tra phiên + phạm vi vai trước khi xử lý. | Guard `requireRole` phủ mọi route (HB) + phân quyền theo vai qua API/E2E; cả nhánh cho phép và từ chối. | — |
| BR-001-02 | Đăng xuất vô hiệu hóa phiên tức thì; request mang phiên cũ bị coi không hợp lệ. | Sau logout, gọi lại bằng cookie cũ → 401/`ERR-SYS-003` (API/E2E). | — |
| BR-001-03 | Đăng nhập thất bại vì định danh/mật khẩu đều trả 1 phản hồi chung `ERR-USR-010`, không tiết lộ tài khoản tồn tại. | So sánh phản hồi 2 nhánh (email không tồn tại vs sai mật khẩu) phải giống nhau (HB/API). | — |
| BR-001-04 | Tài khoản bị khóa (LOCKED) không tạo được phiên mới đến khi Admin mở khóa. | Fixture `isActive=false` → đăng nhập bị từ chối `ERR-USR-011` (HB/API). | — (E-R9, US-013) |
| BR-001-05 | Phiên có thời hạn hiệu lực tối đa **8 giờ** (ADR-008). | JWT hết hạn → bị từ chối `ERR-SYS-003`; TTL = 8 giờ nên test viết được deterministic. | Q12 đã chốt: 8 giờ |
| BR-002-01 | Tin đăng hợp lệ bắt buộc: tiêu đề, mô tả, tình trạng, ≥1 ảnh thực tế, giá/ngày nguyên dương, giá trị kê khai nguyên dương. | Validation form + schema (HB) và DB (DB): thiếu trường → `ERR-USR-005`; giá trị ≤ 0 bị DB từ chối. | Q7 |
| BR-002-02 | **`[ĐỀ XUẤT — CẦN NHÓM CHỐT]`** Mức cọc nằm trong dải 20%–50% giá trị kê khai. | Test dải cọc (`ERR-USR-014`) chưa thể viết: mã pending + cơ sở tính chưa thống nhất (Q1). | **Q1, Q7** |
| BR-002-03 | Tin phải có ≥1 khung rảnh tương lai; bắt đầu ≥ hôm nay; kết thúc > bắt đầu. **`[CẦN XÁC NHẬN]`** phần cấm khung rảnh tự chồng lấn là suy luận. | Validation khung rảnh (`ERR-USR-002`/`003`) ở HB; cấm tự chồng lấn chờ nhóm xác nhận. | **Q11** |
| BR-002-04 | Chỉ OWNER đang không bị khóa được tạo tin đăng. | Guard sai vai → `ERR-USR-008` (HB/API) + e2e RENTER không tạo được tin. | — |
| BR-003-01 | Chủ thiết bị chỉ xem/cập nhật/ẩn tin do chính mình tạo. | Kiểm phạm vi sở hữu: Owner A không thấy/sửa/ẩn tin Owner B (AC-003-01/07, API). | — |
| BR-003-02 | Thay đổi giá/cọc/mô tả chỉ áp cho booking tạo sau; không hồi tố booking đã khởi tạo. | Snapshot `totalVnd`/`depositVnd` bất biến (DB — đã có một phần) + API: sửa giá không đổi booking cũ. | **Q11** |
| BR-003-03 | **`[CẦN XÁC NHẬN]`** Khi sửa/xóa khung rảnh, Owner không được xóa/thu hẹp khoảng đã có booking CONFIRMED/REQUESTED đang chờ xử lý. | Chờ nhóm xác nhận cách xử lý khung rảnh khi còn booking chưa kết thúc trước khi viết test. | **Q11** (+ Q2) |
| BR-003-04 | Owner chỉ được chuyển tin từ OPEN sang HIDDEN khi không có booking CONFIRMED/PICKED_UP. | Chặn ẩn tin còn booking → `ERR-USR-020` (API); đối chiếu trạng thái schema (APPROVED/DEPOSIT_HELD) theo `api-contract.md` §10. | — |
| BR-004-01 | Chỉ Item sẵn sàng (OPEN), không archived, không bị Admin ẩn, thuộc Owner hoạt động mới xuất hiện công khai. | Danh sách/tìm kiếm chỉ trả tin hợp lệ; tin archived/ẩn/owner khóa bị loại (API). | Q8, Q9 |
| BR-004-02 | Khi lọc theo khoảng ngày, loại Item có booking REQUESTED/CONFIRMED/PICKED_UP giao khoảng. | Lọc ngày loại/tái xuất hiện Item (AC-004-02); nhóm trạng thái chiếm lịch hợp nhất tại Phụ lục D. | **Q2** |
| BR-004-03 | Chi tiết tin niêm yết giá/ngày, tỷ lệ cọc trên giá trị kê khai, danh sách PickupPoint; không hiển thị địa chỉ nhà riêng. | Test chi tiết tin hiển thị đủ trường công khai; PickupPoint chưa có model → xem §6. | **Q1** |
| BR-004-04 | Item bị Admin ẩn hoặc Owner bị khóa: mọi yêu cầu đọc chi tiết bị từ chối ngay. | Truy cập trực tiếp tin vi phạm → `ERR-USR-004` (AC-004-05); fixture Admin-ẩn. | **Q9** |

## 6. Lỗ hổng & việc cần bổ sung (thứ tự ưu tiên)

1. **Chưa có route để test tính năng.** `api-contract.md` §8: chỉ `GET /api/health` (✅) tồn tại; `/api/auth/*`, `/api/me`, `/api/items*`, `/api/items/available` là 🚧 S1/S2 (kế hoạch). Vì vậy mọi AC tính năng của US-001→US-004 hiện chỉ test được **ở tầng đã có** (handler boundary, DB invariants, seed); test end-to-end chờ route lên.
2. **Mã lỗi pending.** `ERR-USR-006` và `ERR-USR-014` nằm trong danh sách pending (`api-contract.md` §10) — runtime chặn phát mã pending (`ActiveErrorCode`), nên AC-002-03/AC-002-04 **chưa thể** assert mã này cho tới khi kích hoạt sau khi nhóm chốt Q1/Q7.
3. **Thiếu kiểm tra "ngày bắt đầu ≥ hôm nay" trong validation dùng chung.** `dateRangeSchema` (`api-contract.md` §9) ghi rõ "Chưa thêm kiểm tra hôm nay/múi giờ" — `ERR-USR-002` chưa có đường phát; ảnh hưởng AC-002-05, AC-004-06.
4. **Quy tắc cấm khung rảnh tự chồng lấn (AC-002-07/BR-002-03)** là suy luận `[CẦN XÁC NHẬN]`, chưa có nguồn chốt → chưa viết test cho tới khi Q11 chốt.
5. **PickupPoint chưa có model.** AC-004-04/BR-004-03 yêu cầu danh sách điểm bàn giao (E-R8); `prisma/schema.prisma` (16 model: User, Category, ChecklistTemplateItem, Item, ItemPhoto, RateTier, DepositPolicy, CalendarDay, Booking, ConditionReport, ConditionReportEntry, DamageClaim, DepositLedger, Review, PolicySetting, AuditLog) **chưa có** model điểm giao nhận → không thể test phần này; cần nhóm quyết định (xem §11).
6. **Chênh lệch thuật ngữ trạng thái** (ghi nhận, không tự hoà giải): specs dùng `OPEN`/`HIDDEN` cho Item nhưng schema dùng `ItemStatus { ACTIVE, ARCHIVED, SUSPENDED }`; specs dùng `CONFIRMED` cho booking nhưng schema dùng `BookingStatus { REQUESTED, DEPOSIT_HELD, APPROVED, PICKED_UP, RETURN_PENDING, RETURNED, CLOSED, DISPUTED, RESOLVED }`; specs dùng `AvailabilitySlot` nhưng schema là `CalendarDay`. `api-contract.md` §10 yêu cầu đối chiếu khi triển khai domain service, **không** đổi schema từ phía hợp đồng.
7. **Fixture tài khoản bị khóa (AC-001-04/BR-001-04)** phải tạo trực tiếp ở DB (`isActive=false`) vì cơ chế Admin khóa user thuộc US-013 (Sprint 3).
8. **Chưa có e2e luồng S1** (kế hoạch E1-F5-T5: đăng nhập → đăng tin → tìm kiếm); hiện chỉ 1 e2e smoke trang chủ. `api-contract.test.ts` là handler boundary, **chưa** E2E qua HTTP server (`test-strategy.md` §1).
9. **Chưa có quality gate/coverage** (kế hoạch E1-F5-T1) — cần trước khi chốt test plan chi tiết (E1-F5-T4).

## 7. Dữ liệu test cần có

Seed demo (`src/db/seed.ts`, GL-109) — nền dữ liệu cho mọi mức test:

- **6 tài khoản / 3 vai**: 1 ADMIN (`admin@gearloop.local`), 2 OWNER (`mai@gearloop.local`, `lan@gearloop.local`), 3 RENTER (`an@`/`linh@`/`huy@gearloop.local`); mật khẩu demo `demo123`, `passwordHash` là **bcrypt** (ADR-002, không plaintext).
- **3 category** (có checklist template) + **4 item**, mỗi item có `RateTier` + `DepositPolicy` + ảnh gốc; **60 ngày `CalendarDay` FREE/item** (tổng 240 dòng lịch); **3 PolicySetting**: `claim_window_hours=48`, `deposit_cap_percent=50`, `suspension_threshold=3`.

Lưu ý bắt buộc:

- **Guard của seed**: `main()` đếm booking/ledger/audit; nếu bất kỳ > 0 thì **bỏ qua và exit 0**, không xóa dữ liệu nghiệp vụ. Vì vậy **seed KHÔNG dùng để reset dữ liệu giao dịch** — mỗi file test phải tự dựng trạng thái cần thiết (`test-strategy.md` §3).
- `smoke.test.ts` cần DB `gearloop_test` **đã migrate + seed**; `schema-integrity`/`seed.test.ts` tự tạo schema rời nên cần quyền tạo/xóa schema.
- Dữ liệu bổ sung cần cho test tính năng: fixture booking ở các trạng thái chiếm lịch (REQUESTED/DEPOSIT_HELD/APPROVED/PICKED_UP) để test lọc ngày và chặn ẩn tin; fixture item bị Admin ẩn (AC-003-08/AC-004-05); fixture tài khoản khóa (AC-001-04).
- Discrepancy đã chốt **13/11/2026**: plan §3 dòng 105 (E0-F4-T3) từng ghi "8 tin mẫu", seed hiện có **4 item** (`tests/smoke.test.ts` khẳng định 4) — nhóm chốt **giữ 4 tin**, plan §3 đã sửa thành "4 tin mẫu".

## 8. Môi trường & lệnh chạy

| Lệnh | Phạm vi | Ghi chú |
| --- | --- | --- |
| `npm test` | Vitest toàn bộ 4 file (103 case) | `vitest run`; cần `DATABASE_URL` trỏ `gearloop_test` local (DB đã migrate + seed) |
| `npm run test:e2e` | Playwright (1 case hiện có) | Cần `npx playwright install chromium` một lần |
| `make test` | DB test riêng | Phụ thuộc target `db`; **yêu cầu file `.env.test`**; kiểm tra `DATABASE_URL` trỏ `gearloop_test`, tự tạo DB nếu thiếu, `migrate deploy` + `db:seed` + `npm test` |
| Chạy nhanh local | `docker compose up -d db` rồi `DATABASE_URL="postgres://gearloop:gearloop@localhost:55432/gearloop_test" npm test` | Port 55432 theo `test-strategy.md` §4 |

**Môi trường test**: DB test riêng `gearloop_test` local — **không đụng DB dev**. Không dùng `db push` (bỏ qua CHECK/trigger); dùng `migrate deploy`.

**CI** (`.github/workflows/ci.yml`): job `unit` (PostgreSQL 16 service, `npm ci` → `prisma generate` → `lint` → `migrate deploy` + `db:seed` → `build` → `typecheck` → `npm test`) + job `e2e` (`npm ci` → `playwright install chromium` → `npm run test:e2e`) + gate `verify` (chỉ xanh khi cả `unit` và `e2e` pass).

## 9. Tiêu chí vào/ra và đối chiếu DoD

**Entry (tiêu chí vào)** — task test/kiểm thử của Sprint 1 bắt đầu khi:

- Spec canonical US-001→US-004 đã rà soát; AC + rule nguồn có sẵn (DoR plan §1.5); không còn câu hỏi **chặn** chưa xử lý theo plan §7.2;
- `test-strategy.md` + `test-cases.md` hiện hành; hạ tầng test (E1-F5-T1/T2) sẵn sàng cho phần cần HTTP/RBAC.

**Exit (tiêu chí ra)** — đối chiếu **DoD** plan §1.5: AC liên quan **pass** (unit/e2e); **review ≥1** (cặp khác); **CI xanh**; không phá contract chung (error catalog / response envelope); **QA chéo ghi nhận** lỗi đã xử lý. Với test plan v0: bảng ánh xạ đủ 29 AC/17 BR, lỗ hổng liệt kê có cặp sở hữu, được duyệt nội bộ.

Liên hệ task/mốc:

- **E1-F5** (`gearloop_project_plan.md` §2/§3): T1 (CI coverage + quality gate), T2 (contract test API + fixtures), T4 (chốt test plan chi tiết S1), T5 (e2e luồng S1); QA chéo T6–T9 do cặp khác thực hiện.
- **E0-F4-T1** (task này) có **Slack = 39 ngày** (§5.1 "Task có Slack lớn"), **không** nằm trên chuỗi găng và không chặn demo; mốc liên quan: Gate **G0** (03/11, E0-F5-T1) và **S1 review 17/11**.

## 10. Rủi ro & giới hạn

- **Chênh lệch PostgreSQL local (18.6) vs CI (16).** Commit `f1742e4` ghi nhận `vitest 100/103` với **3 case lệch SQLSTATE do PostgreSQL 18** (đã ghi nhận, chưa chạy lại — `test-cases.md` §5); `docs/planning/sprints/e0-f1-t3-schema-integrity.md` cũng ghi "PostgreSQL 18 tạm. CI PostgreSQL 16 … cần review riêng". Ảnh hưởng các case assert SQLSTATE (40001/23505/23514) trong `tests/schema-integrity.test.ts` → kết quả local chưa bảo đảm khớp CI 16; cần CI xác nhận.
- **Test DB cần quyền tạo/xóa schema** (`schema-integrity`, `seed.test.ts`) — môi trường thiếu quyền sẽ fail trước khi vào test.
- **AC/BR phụ thuộc Q chưa chốt** (Q1, Q2, Q7, Q8, Q9, Q11; Q12 chỉ còn nửa "khóa tài khoản → huỷ hiệu lực phiên") không được coi là acceptance contract cuối (Phụ lục D); giá trị chưa chốt lấy **fallback theo plan §7.2** và ghi rõ **"chưa được chốt"**.
- **Seed không reset dữ liệu giao dịch** → DB test lâu ngày sẽ nhiễm booking/ledger, khiến kỳ vọng seed (4 item, 240 ngày) sai; mọi test phải tự dựng trạng thái (`test-strategy.md` §3).
- **Tầng service/repository/middleware chưa đầy đủ** (`AGENTS.md` §3 ghi chú hiện trạng 12/11/2026) — test state machine booking chưa thể viết ở mức service.

## 11. Câu hỏi/đề xuất cần nhóm chốt

Chỉ liệt kê các điểm **thực sự chặn** việc viết test Sprint 1:

1. **Q1 (cơ sở tính % cọc — giá trị kê khai hay tổng tiền thuê)** — chặn AC-002-01/04, AC-004-04 và BR-002-02/BR-004-03; mã `ERR-USR-014` còn pending. Fallback plan §7.2 (mặc định % giá trị kê khai) **chưa được chốt**.
2. **Q11 (validation bổ sung: khung rảnh chồng nhau, ngày bắt đầu = hôm nay/múi giờ, thời điểm snapshot giá/cọc)** — chặn AC-002-05/06/07, AC-003-02/03, AC-004-06 và BR-002-03/BR-003-02/03. Fallback plan §7.2 **chưa được chốt**.
3. ~~**Q12 (thời lượng phiên đăng nhập)**~~ — **đã chốt 13/11/2026: 8 giờ (ADR-008)**; test AC-001-05/BR-001-05 giờ viết được deterministic. Còn mở trong Q12: xử lý phiên đang mở khi tài khoản bị khóa (pod A).
4. **Q2 (nhóm trạng thái chiếm lịch)** — chặn AC-004-02/BR-004-02; fallback plan §7.2 = REQUESTED + CONFIRMED + PICKED_UP (chưa chốt).
5. **Q8 (khách chưa đăng nhập xem tin công khai + trường tối thiểu)** — chặn AC-004-01/BR-004-01.
6. **Q9 (Owner có bỏ ẩn được tin Admin đã ẩn + khóa user còn booking)** — chặn AC-003-08, AC-004-05/BR-004-04; fallback phương án A (chặn) chưa chốt.
7. **Q7 (ảnh/checklist bắt buộc, số ảnh tối đa, định dạng)** — chặn AC-002-01/02/BR-002-01.
8. **PickupPoint** (E-R8): AC-004-04/BR-004-03 yêu cầu danh sách điểm bàn giao nhưng schema chưa có model — đề nghị nhóm quyết định cách lưu điểm giao nhận trước khi lập test (không nằm trong Q1–Q12).
