# GearLoop — Lộ trình Scrum 6 tuần

Team 8 người · 4 pod · 6 sprint × 1 tuần · deploy từ Sprint 1.

| Sprint | Ngày | Chủ đề | Mốc chính |
| --- | --- | --- | --- |
| S1 | 27/10–2/11 | Walking skeleton | Auth + RBAC + Item CRUD; **URL live ngày 3** |
| S2 | 3–9/11 | Core loop | Booking end-to-end + sổ cọc; alpha nội bộ |
| S3 | 10–16/11 | Sad paths + Beta | Claim/claim xét xử, chặn ngày, huỷ; **mở beta lớp** |
| S4 | 17–23/11 | Fix the beta | ~70% sửa bug beta, ~30% CRUD depth; beta vòng 2 |
| S5 | 24–30/11 | Harden & docs | Seed demo, test case trắng/đen hộp (Labs 11–12) |
| S6 | 1–7/12 | Freeze & demo | Đóng băng thứ 3; chỉ P0; rehearsal; thuyết trình |

## Pods

| Pod | Người | Sở hữu |
| --- | --- | --- |
| A | 2 | auth/RBAC/user + CI/CD |
| B | 3 | domain + schema (1 DB OWNER) |
| C | 2 | booking/claim/ledger + admin dashboards |
| D | 1 | QA + seed + docs + beta triage |

Review chéo A↔B↔C↔D, không tự review. PR ≤ ~300 dòng.

## Ceremonies (~4 giờ/tuần)

- **Mon 30′** planning · **Daily 10–15′** standup · **Wed 15′** grooming ·
  **Fri 45′** review + retro + kiểm tra deploy URL.

## Definition of Done

CI xanh → 1 approval (không phải tác giả) → squash merge → thấy trên URL
production → tác giả smoke test + screenshot trong PR.

## Sprint exit gate

Sprint chỉ xong khi URL production chạy được goal của sprint end-to-end.
Chi tiết từng story: [sprint-1.md](./sprint-1.md) (các sprint sau do PO cập nhật sau planning).
