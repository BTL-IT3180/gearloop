# GearLoop — User Story NỀN (độ cao mục tiêu nghiệp vụ)

**Ngày:** 27/10/2026 · **Xây lại từ đầu** theo khung xương 7 story do nhóm cung cấp + rà vòng đời trên `gearloop_day02_spec.md` (US1–US5), `gearloop_architecture_blueprint.md` (§3 domain, §6 RBAC), BusinessRules (E-R1…E-R9).
**Quy ước:** mỗi story **một** mục tiêu nghiệp vụ, ngôn ngữ business, không chi tiết kỹ thuật; vai chỉ gồm **Owner / Renter / Admin / System** (không có vai "Trung gian" — cọc thuộc System, quyết định trừ cọc thuộc Admin). Checklist nhận–trả, hoàn tự động 48h, chống trùng lịch là **quy tắc/tiêu chí** nằm bên trong story tương ứng — không thành story riêng. Tham số chính sách đánh dấu ở phần câu hỏi mở.

## Bảng User Story nền

| Mã     | Tên story                      | Mô tả ngắn                                                                                                                                                | Vai trò | Tôi muốn                                                                                                 | Để đạt được                                                                               | Mức ưu tiên (MoSCoW) | Trạng thái | Sprint dự kiến |
| ------ | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------- | ---------- | -------------- |
| US-001 | Đăng nhập & phân quyền         | Đăng nhập/đăng xuất bằng bộ tài khoản mẫu phục vụ demo; mỗi phiên làm việc mang đúng một vai                                                              | System  | xác thực người dùng và cấp quyền đúng vai (Owner, Renter, Admin) cho từng phiên                          | mỗi vai chỉ nhìn thấy và thao tác đúng phần việc của mình, dữ liệu không lộ sang vai khác | Must                 | Chưa làm   | Sprint 1       |
| US-002 | Đăng tin cho thuê              | Công khai tin gồm mô tả thiết bị, tình trạng, ảnh, giá thuê, mức cọc, các khung ngày giờ rảnh                                                             | Owner   | đăng tin cho thuê đầy đủ mô tả, tình trạng, ảnh, giá thuê, mức cọc và khung ngày giờ rảnh                | tiếp cận người cần thuê mà không phải nhắn tin tư vấn từng người                          | Must                 | Chưa làm   | Sprint 1       |
| US-003 | Quản lý tin đã đăng            | Cập nhật nội dung/giá/khung rảnh hoặc tạm ẩn tin khi thiết bị không còn cho thuê                                                                          | Owner   | cập nhật hoặc tạm ẩn tin cho thuê của mình                                                               | thông tin trên sàn luôn đúng thực tế và tôi kiểm soát được lịch rảnh của thiết bị         | Should               | Chưa làm   | Sprint 1       |
| US-004 | Tìm & xem tin cho thuê         | Tìm theo từ khóa/bộ lọc, xem chi tiết tin kèm các khung ngày giờ còn trống                                                                                | Renter  | tìm kiếm và xem chi tiết tin cùng các khung ngày giờ còn trống                                           | tự đánh giá đủ thông tin trước khi quyết định thuê                                        | Must                 | Chưa làm   | Sprint 1       |
| US-005 | Đặt thuê theo khung ngày       | Chọn khung ngày giờ còn trống và đặt thuê; hệ thống chặn trùng lịch theo quy tắc nền                                                                      | Renter  | đặt thuê một khung ngày giờ cụ thể với đúng giá và mức cọc đã niêm yết                                   | có chỗ chắc chắn đúng thời điểm tôi cần, không phải thương lượng từng lượt                | Must                 | Chưa làm   | Sprint 2       |
| US-006 | Nhận thông báo yêu cầu thuê    | Được báo trong app ngay khi có yêu cầu thuê mới trên tin của mình                                                                                         | Owner   | nhận thông báo ngay khi có người đặt thuê thiết bị của tôi                                               | phản hồi kịp thời, không bỏ lỡ lượt thuê                                                  | Must                 | Chưa làm   | Sprint 2       |
| US-007 | Duyệt / từ chối yêu cầu thuê   | Xem yêu cầu rồi chấp nhận hoặc từ chối; kết quả được thông báo cho Renter                                                                                 | Owner   | duyệt hoặc từ chối từng yêu cầu thuê                                                                     | chủ động chọn người thuê và giữ quyền kiểm soát lịch thiết bị                             | Must                 | Chưa làm   | Sprint 2       |
| US-008 | Hủy lượt thuê chưa bắt đầu     | Lượt thuê chưa nhận đồ có thể bị hủy bởi người thuê hoặc chủ đồ theo quy định; cọc xử lý theo chính sách hủy                                              | Renter  | hủy lượt thuê của tôi trước khi nhận đồ                                                                  | giải phóng kế hoạch và lịch của hai bên, nhận lại cọc theo quy định                       | Must                 | Chưa làm   | Sprint 2       |
| US-009 | Giữ & xử lý cọc trung gian     | Tạo ghi nhận cọc khi đặt, giữ trong phiên, tự hoàn khi phiên kết thúc tốt (sau thời hạn quy định nếu không có khiếu nại) hoặc trừ theo quyết định phân xử | System  | quản lý trọn vòng đời cọc của từng lượt thuê: tạo khi đặt, giữ trong phiên, hoàn hoặc trừ đúng thời điểm | mỗi giao dịch có bảo đảm tài chính, hai bên tin tưởng sàn mà không cần bên thứ ba         | Must                 | Chưa làm   | Sprint 2–3     |
| US-010 | Xác nhận nhận đồ               | Renter xác nhận tình trạng sản phẩm đúng cam kết, nhận thiết bị; thời điểm này mở đầu trách nhiệm bảo quản                                                | Renter  | xác nhận tình trạng sản phẩm và nhận được thiết bị khi bắt đầu phiên thuê                                | trách nhiệm bảo quản và thời hạn thuê được ghi nhận chính xác từ đúng thời điểm           | Must                 | Chưa làm   | Sprint 3       |
| US-011 | Xác nhận trả đồ                | Renter trả thiết bị đúng hẹn; Owner xác nhận đã nhận lại và tình trạng còn nguyên vẹn — xác nhận này đóng phiên                                           | Owner   | xác nhận đã nhận lại thiết bị sau khi phiên thuê kết thúc                                                | phiên được đóng đúng thực tế và cọc được kích hoạt xử lý                                  | Must                 | Chưa làm   | Sprint 3       |
| US-012 | Phân xử tranh chấp hư hỏng     | Xem khiếu nại và bằng chứng hai bên, quyết định hoàn/trừ (một phần) cọc                                                                                   | Admin   | xem khiếu nại kèm bằng chứng của hai bên và đưa ra quyết định phân xử                                    | tranh chấp được giải quyết công bằng, quyết định là căn cứ xử lý cọc                      | Should               | Chưa làm   | Sprint 3       |
| US-013 | Quản trị người dùng & tin đăng | Tạm khóa tài khoản vi phạm; ẩn/gỡ tin không phù hợp                                                                                                       | Admin   | tạm khóa tài khoản vi phạm và ẩn tin đăng không phù hợp                                                  | giữ sàn an toàn, lành mạnh cho mọi người dùng                                             | Should               | Chưa làm   | Sprint 3       |

**Tổng: 13 story (≤15) · 10 Must / 3 Should · Sprint 1: 4 · Sprint 2: 4 (+cọc) · Sprint 3: 4 (+hoàn/trừ cọc).**

## Báo cáo xây dựng lại (thêm / sửa / gộp)

**Chuẩn hóa 7 story khung xương → 6 story mới:**

- US-001 cũ → **US-002**: giữ trọn nội dung tin (mô tả, giá, cọc, khung rảnh, tình trạng + ảnh); giá/cọc là _thuộc tính của tin_, không tách story riêng.
- US-002 cũ → **US-004**: gộp "chi tiết + ngày còn trống" thành một mục tiêu duy nhất: tự đánh giá trước khi thuê.
- US-003 cũ → **US-006**: thông báo gắn với "yêu cầu thuê" — đầu vào trực tiếp của duyệt/từ chối.
- US-004 cũ **bị hấp thụ vào 2 story**: "Owner đặt giá + cọc" → US-002; "Renter chấp nhận khi đặt" → US-005. Lý do: một story hai vai vi phạm "một story một mục tiêu/một vai"; chat/thương lượng giữ nguyên tinh thần "để giai đoạn sau" (xem câu hỏi mở 5).
- US-005 cũ → **US-005**: nâng "chọn ngày giờ" thành "đặt thuê" — mục tiêu có kết quả đo được (có chỗ chắc chắn).
- US-006 cũ → **US-001**: login/logout + phân quyền là một mục tiêu của System; "tài khoản demo bằng seed" hạ xuống mô tả (chi tiết demo, không nằm trong câu story).
- US-007 cũ → **US-009**: mở thành trọn vòng đời cọc (tạo – giữ – hoàn/trừ đúng lúc), hấp thụ luôn bước "hoàn/trừ cọc" của vòng đời.

**Bổ sung 7 story cùng độ cao để phủ trọn vòng đời:** quản lý tin (US-003), duyệt/từ chối (US-007), hủy chưa bắt đầu (US-008), xác nhận nhận đồ (US-010), xác nhận trả đồ (US-011), phân xử tranh chấp (US-012), quản trị nền tảng (US-013).

**Cố ý KHÔNG thành story:** checklist nhận–trả (chi tiết của US-010/US-011) · hoàn tự động 48h (tham số quy tắc của US-009) · chống trùng lịch (quy tắc của US-005) · review 2 chiều sau phiên (Should trong spec — chốt khi bàn phạm vi). Tất cả thuộc BusinessRules / Acceptance Criteria.

**Vai:** đúng 4 vai Owner/Renter/Admin/System; cọc do **System** tự động giữ/hoàn, **Admin** quyết trừ qua phân xử (US-012) — không có vai "Trung gian" thứ tư.

**Ghi chú Sprint:** US-009 ghi **Sprint 2–3** vì tạo/giữ cọc thuộc Sprint 2 (giao dịch), còn hoàn/trừ chỉ chạy được khi có luồng nhận–trả của Sprint 3. US-008 (hủy) là nền cho feature mở rộng WDR (Booking → CANCELLED phát sinh offer — xem `wb4_gearloop/`).

## Câu hỏi mở cần nhóm chốt

1. **US-012 (phân xử) Should hay Must?** Muốn demo đủ chiều sâu RBAC + trừ cọc ngay trong Sprint 3 thì nâng Must.
2. **Chính sách hủy:** phạt cọc khi Renter hủy muộn và khi Owner hủy có đối xứng không (đối chiếu E-R5 hiện có)?
3. **Tham số 48h** tự hoàn sau xác nhận trả đồ — chốt con số (khung xương ghi 48h, US4 của spec cũng dùng 48h)?
4. **US-003 (quản lý tin):** Should hay gộp vào Must Sprint 1 để demo sửa giá/tạm ẩn mượt?
5. **Chat/thương lượng giá:** xác nhận Won't cho 6 tuần — chỉ mở lại nếu có sprint 4?
