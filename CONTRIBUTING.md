# Hướng dẫn đóng góp cho GearLoop

Tài liệu này quy định quy trình làm việc chung của các thành viên GearLoop, từ nhận issue đến gửi Pull Request (PR).

Trước khi code, hãy đọc `AGENTS.md`, issue được giao và các tài liệu kỹ thuật liên quan.

## 1. Quy trình thực hiện một issue

1. Đọc issue, xác định acceptance criteria (AC) và phạm vi công việc.
2. Kiểm tra code hiện tại, tài liệu và quyền sở hữu các file cần sửa.
3. Tạo branch riêng từ `main` theo quy ước trong `doc/cicd.md`.
4. Liệt kê các file dự kiến thay đổi trước khi code.
5. Triển khai đúng phạm vi issue; không tự thêm tính năng ngoài yêu cầu.
6. Viết hoặc cập nhật test phù hợp.
7. Chạy các lệnh kiểm tra cần thiết và xem lại toàn bộ diff.
8. Commit thay đổi, push branch và tạo PR về `main`.
9. Tự review diff, mô tả cách kiểm thử và yêu cầu thành viên khác review.
10. Chỉ merge khi đáp ứng các điều kiện bảo vệ nhánh và quy trình của nhóm.

## 2. Branch và commit

- Một issue tương ứng một branch và một PR.
- Không commit trực tiếp vào `main`.
- Tuân thủ tên branch, quy ước commit và chiến lược merge được quy định trong `doc/cicd.md`.
- Không đưa các thay đổi không liên quan vào cùng một PR.
- Không force-push hoặc viết lại lịch sử của branch dùng chung khi chưa được phép.

## 3. Quy tắc code

- Tuân thủ `AGENTS.md`, kiến trúc hiện có và các ADR đã được phê duyệt.
- Không tự ý thêm dependency, thay đổi schema hoặc sửa API contract ngoài phạm vi được duyệt.
- Không bỏ qua validation, phân quyền, xử lý lỗi hoặc ràng buộc dữ liệu để làm cho tính năng chạy được.
- Không commit secret, token, mật khẩu hoặc file môi trường chứa thông tin nhạy cảm.
- Nếu yêu cầu chưa rõ hoặc tài liệu mâu thuẫn, hãy hỏi người phụ trách trước khi triển khai.

## 4. Kiểm thử trước khi tạo PR

Kiểm tra `package.json` và `doc/cicd.md` để xác nhận các lệnh phù hợp. Những lệnh chính của dự án gồm:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`

Ghi rõ lệnh nào đã chạy, kết quả thực tế và những kiểm tra chưa thể thực hiện. Không được khẳng định test thành công nếu chưa xác minh.

## 5. Yêu cầu đối với Pull Request

Mỗi PR cần:

- Liên kết issue và nêu mục tiêu thay đổi.
- Liệt kê các file đã thay đổi và lý do.
- Mô tả cách kiểm thử, kết quả và các giới hạn còn tồn tại.
- Có bằng chứng trực quan khi thay đổi giao diện cần được minh họa.
- Hoàn thành checklist trong `.github/pull_request_template.md`.
- Được review bởi thành viên khác theo quy định của nhóm.

Giữ PR nhỏ, tập trung vào một vấn đề và dễ review. Mục tiêu mặc định là không quá khoảng 300 dòng diff khi phù hợp.

## 6. Sử dụng AI coding agent

AI được sử dụng để hỗ trợ đọc code, lập kế hoạch, triển khai và viết test, nhưng thành viên phụ trách vẫn chịu trách nhiệm về thay đổi được gửi lên PR.

- Tuân thủ `AGENTS.md` và các yêu cầu đã được phê duyệt.
- Kiểm tra code do AI tạo ra; không mặc định rằng code đúng chỉ vì đã được sinh ra.
- Không chấp nhận code giả, dữ liệu hardcode để che giấu chức năng chưa hoàn thiện hoặc kết quả kiểm thử không có thật.
- Nêu rõ việc sử dụng AI theo yêu cầu trong mẫu PR của nhóm.
- Không gửi secret hoặc dữ liệu nhạy cảm vào công cụ AI.

## 7. Review và merge

- Không tự review PR của chính mình.
- Review chéo theo phân công của nhóm và các quy tắc trong `AGENTS.md`.
- Chỉ merge khi đáp ứng yêu cầu review, CI và branch protection hiện hành.
- Ưu tiên chiến lược merge đã được quy định trong `doc/cicd.md`; không tự thay đổi quy trình của nhóm.
