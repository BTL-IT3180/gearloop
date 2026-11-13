# E0-F4 — Dữ liệu mẫu & test plan nền — cập nhật 12/11/2026

> Hồ sơ lượt việc (nhật ký thay đổi + kiểm thử) cho feature **E0-F4**, không phải
> sprint plan. Ghi cả phần đã xác minh và phần chưa xác minh; các mâu thuẫn được
> nêu nguyên trạng, **không tự hoà giải**.

## Mục đích và nguồn

Mục đích: ghi lại kết quả ba task của E0-F4 theo `docs/planning/gearloop_project_plan.md`
§3 dòng 101–104 — **E0-F4-T1** (rà soát spec + test plan v0), **E0-F4-T2**
(review chéo schema + ADR quy ước DB/API), **E0-F4-T3** (seed data v1 + script reset DB)
— cùng các sai lệch và việc chuyển nhóm phát sinh.

Nguồn: `docs/planning/gearloop_project_plan.md` (§1.3, §3, §5, §5.1, §7.2);
`docs/planning/backlog.md` (§2, §2.3, §4, §5, §6); `docs/planning/sprints/sprint-1.md`;
`docs/planning/sprints/e0-f1-t3-schema-integrity.md`; `docs/testing/test-plan-sprint-1.md`
(kết quả T1, tạo trong lượt này); bảng findings T2 trong mục "Kết quả T2" dưới đây
(phát sinh từ lượt review read-only của cùng ngày);
`package.json`, `src/db/seed.ts`, `src/db/reset.ts`, `tests/smoke.test.ts`;
`git log`/`git show`/`git diff`; kết quả đo trên DB local `gearloop_test` (chỉ đọc);
và phần "Bằng chứng kiểm chứng" cuối tài liệu.

## Bối cảnh kế hoạch

- **E0-F4 "Dữ liệu mẫu & test plan nền"** (Testing, 3 task · 6 SP, khung 29/10–02/11),
  cặp phụ trách **P3 — Vũ Đức Hiếu + Nguyễn Quốc Anh** (plan §3:102; §1.3:25), là
  một phần của Epic 0 hướng tới Gate G0.
- **E0-F4-T1** không nằm trên đường găng: Slack = **39 ngày** (plan §5:258;
  §5.1:358 xếp vào nhóm "Task có Slack lớn — đệm của kế hoạch"), **không chặn demo**.
- **E0-F4-T2** và **E0-F4-T3** có **Slack = 0**: T2 depends-on `E0-F1-T3`, T3
  depends-on `E0-F1-T3` + `E0-F4-T2` (nguồn lực) (plan §5:259–260). `E0-F5-T1`
  (checklist + sign-off **Gate G0** 03/11) depends-on `E0-F4-T3` (plan §5:261) →
  T2/T3 là **input bắt buộc của Gate G0**.
- Repo có **hai hệ kế hoạch song song**, cùng dùng nhãn S1/S2/S3 với nghĩa khác nhau,
  khác lịch và khác cách chia team (backlog §2:12–14, §2.1, §2.2); xung đột nhãn được
  liệt kê ở backlog §2.3:47–53 (mục 1, dòng 49) và **không tự hoà giải**.

## Kết quả T1 — Test plan v0

File tạo mới: **`docs/testing/test-plan-sprint-1.md`** (nhãn `v0`, dòng 3; phục vụ task
E0-F4-T1 và là đầu vào cho E1-F5-T4).

- **Phạm vi:** US-001 → US-004 theo metadata canonical của specs, tổng **29 AC / 17 BR**
  (US-001 6 AC/5 BR · US-002 8 AC/4 BR · US-004 7 AC/4 BR · US-003 8 AC/4 BR) (dòng 22).
- **Xung đột nhãn "S1" không tự hoà giải:** nhãn này khác nghĩa với `S1` vận hành
  (`sprint-1.md` = "Walking Skeleton", GL-101…GL-109) và với nhãn S1 của hệ task-level;
  tài liệu trích dẫn lại backlog §2.3 mục 1 và để PO/người phụ trách chốt (dòng 24).
- **Bốn mức test** `HB` (handler boundary) · `DB` (PostgreSQL thật) · `API` (HTTP thật —
  **chưa tồn tại** cho auth/item/search) · `E2E` (Playwright) (dòng 30–37); nguyên tắc
  "HTTP/DB thật — không mock", chạy tuần tự, cô lập theo schema rời, **không dùng `db push`**.
- **Bảng ánh xạ:** 29 AC (dòng 55–85) và 17 BR (dòng 91–109) → test case dự kiến, mức test,
  suite hiện có, trạng thái dùng đúng 3 nhãn `Đã có`/`Cần viết khi feature lên`/`Lỗ hổng`,
  và phụ thuộc Qx. Vì chỉ `GET /api/health` tồn tại, AC tính năng chỉ test được ở tầng đã có.
- **9 lỗ hổng/việc cần bổ sung** (dòng 111–121): chưa có route để test tính năng; mã
  `ERR-USR-006`/`ERR-USR-014` còn pending; validation dùng chung thiếu kiểm tra
  "ngày bắt đầu ≥ hôm nay"; quy tắc cấm khung rảnh tự chồng lấn là `[CẦN XÁC NHẬN]`;
  `PickupPoint` chưa có model; chênh lệch thuật ngữ trạng thái; fixture tài khoản khóa;
  thiếu e2e luồng S1; thiếu quality gate/coverage.
- **Dữ liệu test** kèm lưu ý guard seed không dùng để reset giao dịch (dòng 127–135), trong đó
  dòng 135 ghi discrepancy "8 tin mẫu" vs seed 4 item (xem mục Sai lệch) — **đã chốt 13/11/2026: giữ 4 tin**.
- **Câu hỏi chặn viết test** (dòng 176–184): Q1, Q11, Q2, Q8, Q9, Q7 và `PickupPoint`
  (Q12 — phần thời lượng phiên — **đã chốt 13/11/2026: 8 giờ, ADR-008**; quyền truy cập của phiên khi tài khoản bị khóa vẫn mở).

Cập nhật tài liệu kèm theo (đã có trong `git diff`): `docs/README.md` (bảng mục "Kiểm thử"
+ cây thư mục) và **1 dòng trỏ** trong `docs/testing/test-strategy.md:67` (§2).

## Kết quả T2 — Review chéo schema + ADR quy ước DB/API

Review READ-ONLY, input cho Gate G0; nguồn: lượt review read-only ngày 12/11/2026 của
chính hồ sơ này (bảng findings ngay dưới đây là bản đầy đủ). Sáu finding,
**không có mức "Chặn"**:

| ID | Khu vực | Mức độ | Bằng chứng | Đề xuất | Owner |
|---|---|---|---|---|---|
| F-01 | Auth — ADR-002 (JWT 7 ngày) ↔ Q12 còn mở (fallback 8h) | Quan trọng | `adrs/002-auth.md:3-4,23-26` (Chấp nhận 26/10, hạn 7 ngày) ↔ `backlog.md:94` (Q12 mở, hạn 04/11, fallback 8h) + `backlog.md:66`, `gearloop_project_plan.md:491` (§7.2, hàng Q12) | Nhóm chốt Q12; nếu khác 7 ngày → **ADR mới, không sửa ADR-002** — **đã chốt 13/11/2026: 8 giờ → `adrs/008-session-thoi-luong.md` (ADR-008), ADR-002 không sửa; `api-contract.md` §3 đã cập nhật `exp 8 giờ`.** Còn lại: nửa Q12 về tài khoản bị khóa trong phiên đang mở | A / P4 + nhóm |
| F-02 | api-contract §7 ↔ database-design §6.2 — nơi chặn vượt `amountAwardedVnd` | Quan trọng | `api-contract.md:140-141` ("chặn vượt ở tầng DB") ↔ `database-design.md:429` ("chưa có CHECK/trigger… validate ở service") + `api-contract.md:117`; DB `gearloop_test` không có CHECK trên field award | Chốt service-validate-400 hay DB-CHECK; ảnh hưởng mã lỗi E2-F5-T3/T4 — **đã chốt 13/11/2026: service validate là chính (400 + mã USR theo catalog); DB giữ CHECK một-dòng làm lưới an toàn (pod C xác nhận mã lỗi + bổ sung CHECK cùng migration ở E2-F5-T3); pod D đã sửa `api-contract.md` §7 + `database-design.md` §6.2 cho hết mâu thuẫn** | C + docs |
| F-03 | Makefile ↔ ADR-005 quy tắc 3 — nhánh `db push` | Quan trọng | `Makefile:18-22,34-38,68-72` còn nhánh `npx prisma db push` ↔ `adrs/005-prisma-migrations.md:29-30`, `development-workflow.md:84`, `test-strategy.md:89`, `test-cases.md:90`; CI đã đúng tại `.github/workflows/ci.yml:62` | Xóa nhánh `db push` (dead-branch nhưng dựng DB thiếu CHECK/trigger nếu kích hoạt) | A / P1 |
| F-04 | ADR 002–004 ↔ schema — danh pháp snake_case | Nhỏ | `adrs/004:22,29`, `adrs/003:1`, `adrs/002:30`, `api-contract.md:63,80` (snake_case) ↔ schema dùng camelCase, không `@map`/`@@map` (`database-design.md:11-13`) | Placeholder của template; đồng bộ danh pháp khi sửa docs | D / nhóm |
| F-05 | ADR-002 ↔ api-contract — điều kiện flag `Secure` | Nhỏ | `adrs/002-auth.md:24` (luôn `Secure`) ↔ `api-contract.md:69` (`Secure` chỉ production) | Chốt một wording khi chốt cụm auth/Q12; khác ADR-002 → ADR mới | A / P4 |
| F-06 | schema/migration — 2 index thừa | Nhỏ | `schema.prisma:185-186` (`@@unique`+`@@index` cùng `(itemId,date)`), `:283-284` (`@@unique(bookingId,eventKey,type)`+`@@index(bookingId)`); migration dựng cả hai (`migrations/20261101000000…/migration.sql:247-250,274,277`); xác nhận qua `pg_indexes` trên `gearloop_test` | Bỏ 2 `@@index` thường ở lần chạm schema kế tiếp (mỗi thay đổi = 1 migration) | B (DB OWNER) |

**Đã kiểm tra, không phát hiện sai lệch** (mức tóm tắt; chi tiết ở findings mục B):
**16 model / 16 bảng**, **8 enum** khớp giá trị từng vùng; CHECK `BOOKED <=> bookingId`;
FK ghép `(bookingId,itemId)`; **6 trigger** (khoảng ngày, liên kết booking, ledger append-only,
audit append-only, tier no-overlap, checklist snapshot); partial unique `DEPOSIT_HELD` +
sổ cọc append-only; RESTRICT FK user (migration 3); `returnedAt` do DB ghi một lần; index/unique
schema ↔ migration 1:1 (trừ F-06) — đều khớp `database-design.md`/`schema.prisma`/migrations.
**24 mã `ERR-USR` + 3 `ERR-SYS`**, **8 mã pending** (006/012/014/015/021/022/023/024) khớp
`api-contract.md:19,195-203`; **envelope** `{data}`/`{error,code}` khớp `withApi.ts` và
`api-contract.md §1`; tiền `Int` VND, ngày UTC; không lộ `passwordHash`/stack trace.

F-01, F-02, F-03 **đã được orchestrator spot-verify** (đọc lại các dòng bằng chứng hai phía).
Toàn bộ T2 chạy READ-ONLY: không sửa file, không chạy lint/build/test/formatter.

## Kết quả T3 — Seed v1 + guard reset local-only

**(a) Seed v1 đã tồn tại từ trước, không tạo mới trong lượt này.** Seed có từ commit
`0eda0ca` ("feat(db): 16-model Prisma schema + seed + smoke tests (GL-104/107/109)", sửa
`prisma/schema.prisma`, `src/db/seed.ts`, `tests/smoke.test.ts`) — ghi ở `backlog.md:106-107`.

- Trạng thái **đo được trên DB local `gearloop_test`** (chỉ đọc): **6 user** (1 `ADMIN` /
  2 `OWNER` / 3 `RENTER`), **3 Category**, **13** `ChecklistTemplateItem`, **4 Item**
  (Sony A7 III, DJI Osmo Pocket 3, Lều cắm trại 4 người, Bếp du lịch), **8 RateTier**,
  **4 DepositPolicy**, **5 ItemPhoto**, **240 CalendarDay** (mọi dòng `FREE`), **3 PolicySetting**.
  Số user/category/item/ngày khớp `tests/smoke.test.ts:22-41`, `sprint-1.md:50-52` (GL-109) và
  `e0-f1-t3-schema-integrity.md:134`.
- **Guard của seed** (`src/db/seed.ts:3-5,262-272`): `main()` đếm `Booking`/`DepositLedger`/`AuditLog`
  trong transaction `Serializable`; còn dữ liệu ở **bất kỳ** bảng nào → log bỏ qua và **exit 0**,
  không wipe. Cả ba trống → wipe (thứ tự con → cha, `CalendarDay` trước `Booking`, dòng 24-40) rồi
  nạp mẫu trong cùng transaction; lỗi thật → **exit 1**. Seed **không** dùng để reset giao dịch.
- `npm run db:reset` **đã tồn tại** trong `package.json` từ trước lượt này (giá trị cũ:
  `prisma migrate reset --force && npm run db:seed`); lượt 13/11 script spawn thêm
  `--skip-seed` để seed không chạy hai lần.

**(b) Guard local-only mới (phần thay đổi của lượt này).** File mới **`src/db/reset.ts`**:

- Đọc `DATABASE_URL` từ biến môi trường hoặc file `.env` ở repo root (dòng 10-35, 43).
- Từ chối **exit 1, chưa đụng DB** (dòng 37-41) khi: thiếu `DATABASE_URL`; `NODE_ENV=production`
  (dòng 47-49); URL không parse được (dòng 51-59); protocol không phải `postgres:`/`postgresql:`
  (dòng 60-62); host không thuộc `localhost`/`127.0.0.1`/`::1` (dòng 63-68).
- Khi hợp lệ: in **database đích** (dòng 70), truyền nguyên `DATABASE_URL` cho Prisma (dòng 72),
  spawn `prisma migrate reset --force --skip-seed` (dòng 76-78) rồi `src/db/seed.ts` (dòng 83-86); **lan truyền
  mã thoát** — Prisma lỗi thì dừng, **không** chạy seed (dòng 79-81, 87).

Kèm theo: `package.json` đổi `db:reset` thành `tsx src/db/reset.ts` (giá trị cũ nêu trên) và
**3 dòng docs**: `README.md:248`, `docs/guides/development-workflow.md:90` (§7) + `:115` (bảng §10),
`docs/guides/setup.md:136`.

## Sai lệch cần nhóm chốt

| # | Nội dung | Bằng chứng hai phía | Xử lý trong lượt này |
|---|---|---|---|
| a | **"8 tin mẫu" vs 4 item** | `gearloop_project_plan.md:105` (bản 12/11) ghi "3 vai + **8 tin mẫu** + khung rảnh" ↔ `sprint-1.md:51` (GL-109: 4 items), `tests/smoke.test.ts:22,27` (4 item), `e0-f1-t3-schema-integrity.md:134` (4 items), DB `gearloop_test` = **4 item** | **Giữ nguyên 4**, không tự đổi seed vì sẽ phá AC GL-109 + smoke test; nhóm quyết (mục Việc còn thiếu) — **đã chốt 13/11/2026: giữ 4 tin; `gearloop_project_plan.md` §3:105 đã sửa thành "4 tin mẫu"** |
| b | **Nhãn S1/S2/S3 khác nghĩa giữa hai hệ kế hoạch** | `backlog.md:49` (mục 1 §2.3): ROADMAP S1 = walking skeleton / kế hoạch S1 = US-001→004 sau Sprint 0; ROADMAP S2 = core loop / kế hoạch S2 = US-005→009 ↔ `test-plan-sprint-1.md:24` ghi nhận, không hoà giải | Ghi nhận, để PO chốt |
| c | **Phân công E0-F4 khác giữa ba nguồn** | Plan §3:102-105 gán E0-F4 cho cặp **P3 (Hiếu + Quốc Anh)** và §1.3:25 khớp ↔ `AGENTS.md:207-212` gán `tests/`, `src/db/`, `docs/` cho **pod D**, schema/DB cho **pod B (DB OWNER)** (`AGENTS.md:219`) ↔ `backlog.md:33` liệt kê P2/P3/P4 **khác** plan §1.3 (P2/P3/P4 đổi chỗ) | Cần phối hợp pod D + pod B (DB OWNER) trước khi merge; PO chốt danh sách P — **đã chốt 13/11/2026: P3 (Hiếu + Quốc Anh) thực hiện; pod D review `docs/` + `tests/`; pod B review `src/db/`; `backlog.md` §2.2 đã sửa khớp plan §1.3 và là danh sách cặp canonical** |
| d | **Q12 còn mở nhưng ADR-002 đã cố định 7 ngày** | `adrs/002-auth.md:3-4,23-26` (Chấp nhận 26/10, hạn 7 ngày) ↔ `backlog.md:94` (Q12 mở, hạn 04/11 đã qua, fallback 8h) (F-01) | Nêu nguyên trạng; xem Câu hỏi cần chốt — **đã chốt 13/11/2026: 8 giờ (ADR-008); ADR-002 giữ nguyên lịch sử; nửa "khóa tài khoản → huỷ hiệu lực phiên" của Q12 vẫn mở (pod A)** |

## Bằng chứng kiểm chứng (mục 6 — ghi nguyên văn kết quả đã chạy)

- **`npm test` baseline trước thay đổi và sau thay đổi: đều 100/103 pass, 3 fail** ở
  `tests/schema-integrity.test.ts` nhóm `Historical user references` (SQLSTATE **23001** thay vì
  **23503**) — do PostgreSQL local **18.6** vs CI **16**, đúng loại lệch đã ghi ở commit `f1742e4`
  (message: "vitest 100/103 (3 case lệch SQLSTATE do PostgreSQL 18, đã ghi nhận)") và
  `docs/testing/test-cases.md` §5 (`:107-108`).
- **`npm run lint`: pass. `npm run typecheck`: pass. `npm run build`: pass.**
- **Guard đã được xác minh 6 đường từ chối** (host không local, thiếu `DATABASE_URL`, protocol sai,
  `NODE_ENV=production`, URL rác, nhánh đọc `.env`) — tất cả **exit 1** và **không chạm DB**.
- **Đường cho phép chỉ xác minh một phần:** guard resolve đúng URL local (log đích), truyền nguyên
  URL cho Prisma (Prisma báo đúng datasource `gearloop_test` + `schema=e0f4_guard_probe`), lan truyền
  mã thoát khi Prisma lỗi, **không chạy seed sau khi Prisma lỗi**, schema probe đã dọn và schema
  `public` của `gearloop_test` không đổi.
- **Bổ sung (đã chạy xong):** `DATABASE_URL` đọc từ `.env` với host local **được guard chấp nhận**,
  in đúng đích `127.0.0.1:5432/<db>` và Prisma nhận đúng datasource đó rồi báo "Schema engine error"
  khi DB không tồn tại (**exit 1 lan truyền đúng**); host IPv6 **`[::1]` được chấp nhận**.
- **Chưa chạy được reset thật:** Prisma từ chối `migrate reset` khi phát hiện agent AI
  (`CLAUDECODE=1` trong phiên agent) và yêu cầu biến `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION`
  chứa nội dung đồng ý tường minh của người dùng; **orchestrator không tự vượt guardrail này**.
  Người phát triển chạy trực tiếp trong terminal (không có biến đó) nên hành vi giữ nguyên như trước.
- **Lệnh để người kiểm chứng chạy:**
  `DATABASE_URL="postgres://gearloop:gearloop@127.0.0.1:5432/gearloop_test" npm run db:reset`

## Việc còn thiếu / chuyển nhóm

| Việc | Owner |
|---|---|
| ~~Chốt **Q12** (thời lượng phiên đăng nhập; F-01)~~ — **đã chốt 13/11/2026: 8 giờ (ADR-008)**; việc còn lại: triển khai 8h ở E1-F1-T1/T4 và chốt quyền truy cập của phiên khi tài khoản bị khóa | pod A / P4 + nhóm |
| ~~Chốt **nơi chặn vượt `amountAwardedVnd`** (F-02)~~ — **đã chốt 13/11/2026: service validate là chính + DB CHECK một-dòng làm lưới an toàn**; việc còn lại: pod C chốt mã lỗi cụ thể và bổ sung CHECK cùng migration ở E2-F5-T3 | pod C + docs |
| **Xóa nhánh `db push`** ở Makefile (F-03) | pod A / P1 |
| **Cân nhắc bỏ 2 index thừa** ở lần chạm schema kế tiếp (F-06) | pod B (DB OWNER) |
| Bổ sung **fixture + route** cho test Sprint 1 (contract test API, e2e luồng S1) | E1-F5 |
| ~~Nhóm **quyết số tin mẫu 8 vs 4**~~ — **đã chốt 13/11/2026: giữ 4 tin**; plan §3:105 đã sửa theo | nhóm / PO |

## Đã chốt ngày 13/11/2026 (giữ để truy vết)

Bốn câu hỏi nêu trong bản 12/11 nay đã có quyết định của nhóm:

1. **Q12 — thời lượng phiên: 8 giờ.** Ghi tại `adrs/008-session-thoi-luong.md` (ADR-008 mới,
   ADR-002 không sửa lịch sử); `api-contract.md` §3 và `test-plan-sprint-1.md` đã cập nhật.
   *Còn mở:* quyền truy cập của phiên đang mở khi tài khoản bị khóa (nửa còn lại của Q12) — pod A.
2. **F-02 — nơi chặn vượt `amountAwardedVnd`: service validate là chính** (400 + mã USR theo
   catalog), **DB CHECK một-dòng là lưới an toàn**; `api-contract.md` §7 và `database-design.md`
   §6.2 đã sửa cho khớp nhau. *Còn lại:* pod C chốt mã lỗi cụ thể (catalog chưa có mã riêng cho
   award vượt cọc) và bổ sung CHECK cùng migration ở E2-F5-T3; ràng buộc ≤ cọc vẫn dựa vào trigger
   sổ cọc + service.
3. **Số tin mẫu: giữ 4** (khớp GL-109/smoke test); plan §3:105 đã sửa thành "4 tin mẫu".
4. **Phân công E0-F4:** P3 (Hiếu + Quốc Anh) thực hiện; pod D review `docs/` + `tests/`;
   pod B review `src/db/`. `backlog.md` §2.2 đã sửa khớp plan §1.3 và là danh sách cặp canonical;
   plan §1.3 trỏ sang.

Ngoài bốn mục trên, các câu hỏi còn mở **không** thuộc phạm vi đã chốt: mã lỗi cụ thể cho award
(pod C), flag `Secure` của cookie (F-05, pod A), `PickupPoint` (model chưa có — nhóm/PO), và
`tests/` chuyển giao cho E1-F5 khi feature lên.
