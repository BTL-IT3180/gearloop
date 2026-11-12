# GearLoop — User Story Spec (US-001…US-013)

**Mục đích:** đặc tả nghiệp vụ đủ để nhóm khác xây dựng và kiểm thử 13 User Story nền. **Nguồn chính:** `gearloop_user_stories.md` (câu User Story, vai, MoSCoW, sprint, trạng thái). **Tham chiếu:** `gearloop_day02_spec.md` §6.1–6.3; `gearloop_architecture_blueprint.md` §3, §6–7; `wb4_gearloop/BusinessRules.md` E-R1…E-R9; benchmark chính thức tại Phụ lục A.

**Phạm vi:** chỉ US-001…US-013; KHÔNG bao gồm US-W1…US-W9. AC viết mới cho tầng nền; không sao chép AC từ `wb4_gearloop/AcceptanceCriteria.md`. Mọi tham số chưa phê chuẩn được đánh dấu `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` hoặc `[CẦN XÁC NHẬN]`.

**Cách đọc:** `E-Rn` là rule nền; `BR-<StoryID>-nn` là rule cục bộ; `AC-<StoryID>-nn` là tiêu chí kiểm thử. Error catalog/notification/status standards ở Phụ lục B. Trạng thái nguồn và quyết định mở ở Phụ lục D.

## Tổng quan 13 story

| ID | Tên | Vai | MoSCoW | Sprint | Trạng thái | Số AC | Số BR |
|---|---|---|---|---|---|---:|---:|
| US-001 | Đăng nhập & phân quyền | System | Must | Sprint 1 | Chưa làm | 6 | 5 |
| US-002 | Đăng tin cho thuê | Owner | Must | Sprint 1 | Chưa làm | 8 | 4 |
| US-004 | Tìm & xem tin cho thuê | Renter | Must | Sprint 1 | Chưa làm | 7 | 4 |
| US-005 | Đặt thuê theo khung ngày | Renter | Must | Sprint 2 | Chưa làm | 10 | 6 |
| US-006 | Nhận thông báo yêu cầu thuê | Owner | Must | Sprint 2 | Chưa làm | 3 | 3 |
| US-007 | Duyệt / từ chối yêu cầu thuê | Owner | Must | Sprint 2 | Chưa làm | 7 | 5 |
| US-008 | Hủy lượt thuê chưa bắt đầu | Renter | Must | Sprint 2 | Chưa làm | 7 | 4 |
| US-009 | Giữ & xử lý cọc trung gian | System | Must | Sprint 2–3 | Chưa làm | 11 | 10 |
| US-010 | Xác nhận nhận đồ | Renter | Must | Sprint 3 | Chưa làm | 6 | 4 |
| US-011 | Xác nhận trả đồ | Owner | Must | Sprint 3 | Chưa làm | 6 | 5 |
| US-003 | Quản lý tin đã đăng | Owner | Should | Sprint 1 | Chưa làm | 8 | 4 |
| US-012 | Phân xử tranh chấp hư hỏng | Admin | Should | Sprint 3 | Chưa làm | 8 | 8 |
| US-013 | Quản trị người dùng & tin đăng | Admin | Should | Sprint 3 | Chưa làm | 8 | 6 |

**Tổng: 95 AC, 68 BR.** Must trước, Should sau. Cọc (US-009) thuộc System; quyết định phân xử/DEDUCT thuộc Admin; không có vai trung gian.

## Đặc tả User Story
## 1. US-001: Đăng nhập & phân quyền

### 0. Metadata block
- **Story ID:** US-001
- **Tên:** Đăng nhập & phân quyền
- **Vai trò:** System
- **MoSCoW:** Must
- **Sprint:** Sprint 1
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R9, BR-001-01, BR-001-02, BR-001-03, BR-001-04, BR-001-05

### 1. Title
US-001 — Đăng nhập & phân quyền

### 2. Đang xây dựng khả năng gì?
Cung cấp cơ chế xác thực danh tính người dùng bằng bộ tài khoản mẫu (seed data) và cấp quyền truy cập theo phiên làm việc đúng theo vai trò (Chủ thiết bị, Người thuê, Quản trị viên), đảm bảo phân tách rõ ràng trách nhiệm và phạm vi dữ liệu giữa các vai trò trên sàn.

### 3. User Story
"Là System, tôi muốn xác thực người dùng và cấp quyền đúng vai (Owner, Renter, Admin) cho từng phiên, để mỗi vai chỉ nhìn thấy và thao tác đúng phần việc của mình, dữ liệu không lộ sang vai khác"

### 4. Acceptance Criteria (AC)

- **AC-001-01 (Happy Path — Đăng nhập thành công với tài khoản mẫu và gán vai trò theo phiên):**
  - **Given:** Tài khoản người dùng mẫu tồn tại trong hệ thống với thông tin định danh và mật khẩu hợp lệ thuộc một trong ba vai trò hợp lệ (Chủ thiết bị - OWNER, Người thuê - RENTER, hoặc Quản trị viên - ADMIN), và tài khoản ở trạng thái hoạt động bình thường (không bị khóa);
  - **When:** Người dùng chọn hành động đăng nhập và gửi thông tin định danh cùng mật khẩu;
  - **Then:** Hệ thống xác thực thành công, khởi tạo một phiên làm việc mới mang đúng vai trò của tài khoản đó, cho phép truy cập đúng phạm vi chức năng và dữ liệu tương ứng (OWNER quản lý tin và yêu cầu thuê của mình; RENTER tìm kiếm thiết bị, tạo yêu cầu thuê và quản lý lượt thuê của mình; ADMIN truy cập phân xử tranh chấp và quản trị người dùng/tin đăng);
  - **Rule:** BR-001-01.

- **AC-001-02 (Happy Path — Đăng xuất và chấm dứt phiên làm việc):**
  - **Given:** Người dùng đang có một phiên làm việc hợp lệ trong hệ thống;
  - **When:** Người dùng chọn hành động đăng xuất;
  - **Then:** Hệ thống chấm dứt hiệu lực của phiên làm việc hiện tại, thu hồi toàn bộ quyền hạn tạm thời của phiên đó, và đưa người dùng về trạng thái chưa xác thực;
  - **Rule:** BR-001-02.

- **AC-001-03 (Exception — Từ chối đăng nhập khi sai thông tin xác thực):**
  - **Given:** Tài khoản người dùng tồn tại hoặc không tồn tại trong hệ thống;
  - **When:** Người dùng chọn hành động đăng nhập với tên định danh không tồn tại hoặc mật khẩu không chính xác;
  - **Then:** Hệ thống từ chối xác thực, không khởi tạo phiên làm việc, không tiết lộ tài khoản có tồn tại hay không, và phản hồi thông báo lỗi theo mã ERR-USR-010;
  - **Rule:** BR-001-03.

- **AC-001-04 (Exception — Từ chối đăng nhập với tài khoản đang bị khóa):**
  - **Given:** Tài khoản người dùng có thông tin định danh và mật khẩu chính xác nhưng đang ở trạng thái bị khóa (do Quản trị viên thực hiện thao tác tạm khóa tài khoản theo quy tắc E-R9 và US-013);
  - **When:** Người dùng chọn hành động đăng nhập;
  - **Then:** Hệ thống từ chối xác thực, ngăn chặn khởi tạo phiên làm việc, và phản hồi thông báo lỗi theo mã ERR-USR-011;
  - **Rule:** BR-001-04, E-R9.

- **AC-001-05 (Timeout — Thu hồi quyền khi phiên làm việc hết hạn):**
  - **Given:** Người dùng đã đăng nhập thành công và sở hữu một phiên làm việc hợp lệ;
  - **When:** Phiên làm việc vượt quá khoảng thời gian hiệu lực quy định mà không phát sinh hoạt động hợp lệ từ người dùng;
  - **Then:** Hệ thống tự động thu hồi phiên làm việc, từ chối mọi thao tác tiếp theo yêu cầu xác thực, và yêu cầu người dùng thực hiện đăng nhập lại kèm thông báo lỗi theo mã ERR-SYS-003;
  - **Rule:** BR-001-05.

- **AC-001-06 (Exception / Conflict — Ngăn chặn thao tác trái vai trò được cấp):**
  - **Given:** Người dùng đang đăng nhập với phiên làm việc mang một vai trò cụ thể (ví dụ: RENTER);
  - **When:** Người dùng chọn thực hiện một hành động nghiệp vụ thuộc quyền hạn của vai trò khác (ví dụ: duyệt yêu cầu thuê của OWNER hoặc phân xử tranh chấp của ADMIN);
  - **Then:** Hệ thống kiểm tra vai trò tại phiên làm việc, từ chối thực hiện hành động, giữ nguyên hiện trạng dữ liệu nghiệp vụ không đổi, và phản hồi thông báo lỗi theo mã ERR-USR-008;
  - **Rule:** BR-001-01.

### 5. Business Rules
- **BR-001-01 (Phân quyền đơn vai trò theo phiên):** Mỗi phiên làm việc hợp lệ chỉ gắn với đúng một người dùng và mang đúng một vai trò duy nhất trong số 3 vai trò được hỗ trợ (OWNER, RENTER, ADMIN). Mọi thao tác truy vấn dữ liệu nhạy cảm hoặc thay đổi trạng thái nghiệp vụ phải được hệ thống kiểm tra tính hợp lệ của phiên và phạm vi quyền hạn của vai trò tương ứng trước khi xử lý. Nguồn: Blueprint §6 RBAC, Shared Contract §2. [ĐÃ CHỐT]
- **BR-001-02 (Vô hiệu hóa phiên tức thì khi đăng xuất):** Thao tác đăng xuất phải chấm dứt hiệu lực của phiên làm việc ngay lập tức. Mọi yêu cầu tiếp theo mang định danh phiên cũ đều bị coi là không hợp lệ. Nguồn: Blueprint §1 Decision summary. [ĐÃ CHỐT]
- **BR-001-03 (Bảo mật thông điệp lỗi xác thực):** Đăng nhập thất bại do sai định danh hoặc sai mật khẩu đều trả về một phản hồi chung (ERR-USR-010), tuyệt đối không chỉ rõ tài khoản có tồn tại hay không nhằm ngăn chặn nguy cơ dò quét tài khoản. Nguồn: Shared Contract §7a. [ĐÃ CHỐT]
- **BR-001-04 (Chặn đăng nhập tài khoản bị khóa):** Tài khoản ở trạng thái bị khóa (LOCKED) không được phép tạo phiên làm việc mới dưới bất kỳ hình thức nào cho đến khi được Quản trị viên mở khóa. Nguồn: E-R9, Blueprint §6 CRUD matrix. [ĐÃ CHỐT]
- **BR-001-05 (Giới hạn thời gian sống của phiên):** Phiên làm việc có thời hạn hiệu lực tối đa nhằm giảm thiểu rủi ro bị chiếm quyền điều khiển khi người dùng rời thiết bị mà không đăng xuất. Nguồn: Shared Contract §7b (ERR-SYS-003). [ĐÃ CHỐT]

### 6. Validation & Error Handling
- Kiểm tra tính bắt buộc: Thông tin định danh và mật khẩu không được để trống khi đăng nhập.
- Sai định danh hoặc sai mật khẩu → Từ chối với mã lỗi `ERR-USR-010`.
- Tài khoản đang bị khóa bởi Quản trị viên → Từ chối với mã lỗi `ERR-USR-011`.
- Thao tác khi phiên làm việc đã hết hạn hoặc không hợp lệ → Từ chối với mã lỗi `ERR-SYS-003`.
- Phiên làm việc cố gắng thực hiện hành động ngoài phạm vi vai trò → Từ chối với mã lỗi `ERR-USR-008`.

### 7. Permissions & Preconditions
- **Vai trò được thực hiện:** SYSTEM (hệ thống chịu trách nhiệm kiểm tra xác thực và cấp quyền cho phiên).
- **Điều kiện tiên quyết:**
  - Bộ tài khoản mẫu (seed data) đại diện cho 3 vai trò OWNER, RENTER, ADMIN đã được nạp sẵn vào cơ sở dữ liệu hệ thống.
  - Tài khoản không ở trạng thái bị khóa để đăng nhập thành công.

### 8. Dependencies & References
- **Phụ thuộc:** US-013 (Quản trị người dùng & tin đăng — Quản trị viên khóa/mở tài khoản ảnh hưởng trực tiếp đến khả năng đăng nhập).
- **Tham chiếu:**
  - `gearloop_user_stories.md`: US-001.
  - `gearloop_architecture_blueprint.md`: §3 (Domain model), §6 (RBAC design).
  - `wb4_gearloop/BusinessRules.md`: E-R9 (Khóa tài khoản).
  - `local://shared_contract.md`: §2 (Vai trò), §7a (ERR-USR-008, ERR-USR-010, ERR-USR-011), §7b (ERR-SYS-003).

### 9. Out of Scope
- Quy trình tự đăng ký tài khoản công khai và kích hoạt tài khoản qua email/tin nhắn SMS (phiên bản hiện tại chỉ sử dụng bộ tài khoản seed để demo).
- Xác thực hai yếu tố (2FA / OTP) hoặc đăng nhập thông qua các nhà cung cấp định danh bên thứ ba (Google, Facebook, Apple ID).
- Cơ chế quản lý quyền hạn động (dynamic RBAC), phân quyền theo nhóm người dùng hoặc một người dùng sở hữu đồng thời nhiều vai trò trong cùng một phiên.
- Tính năng tự khôi phục hoặc đặt lại mật khẩu qua email.

---


---

## US-002: Đăng tin cho thuê

### 0. Metadata block
- **Story ID:** US-002
- **Tên:** Đăng tin cho thuê
- **Vai trò:** Owner
- **Mức ưu tiên (MoSCoW):** Must
- **Sprint dự kiến:** Sprint 1
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R1, E-R6, E-R8, BR-002-01, BR-002-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, BR-002-03, BR-002-04

### 1. Title
Đăng tin cho thuê thiết bị mới

### 2. Đang xây dựng khả năng gì?
Cho phép Chủ thiết bị (Owner) tạo và công khai một tin đăng thiết bị mới kèm đầy đủ thông tin mô tả, tình trạng, hình ảnh thực tế, đơn giá thuê theo ngày, tỷ lệ cọc và các khung ngày giờ sẵn sàng cho thuê.

### 3. User Story
Là Owner, tôi muốn đăng tin cho thuê đầy đủ mô tả, tình trạng, ảnh, giá thuê, mức cọc và khung ngày giờ rảnh, để tiếp cận người cần thuê mà không phải nhắn tin tư vấn từng người.

### 4. Acceptance Criteria (AC)

- **AC-002-01 (Happy path - Tạo tin thành công với trạng thái OPEN):**  
  *Gắn rule:* BR-002-01, BR-002-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, BR-002-03.  
  - **Given:** Người dùng đã đăng nhập với vai trò OWNER và tài khoản ở trạng thái hoạt động (không bị khóa).  
  - **When:** Chủ thiết bị chọn hành động đăng tin cho thuê mới với đầy đủ thông tin hợp lệ: tiêu đề, mô tả chi tiết, tình trạng thiết bị, ít nhất 01 ảnh thực tế, giá thuê/ngày > 0 đồng, giá trị kê khai > 0 đồng, mức cọc từ 20% đến 50% `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, và ít nhất 01 khung ngày rảnh (AvailabilitySlot) có ngày bắt đầu từ ngày hiện tại trở đi và ngày kết thúc sau ngày bắt đầu.  
  - **Then:** Trạng thái tin đăng đi từ chưa tồn tại sang OPEN; tin đăng được công khai để người thuê tìm kiếm và xem; trả về thông báo tạo tin thành công.

- **AC-002-02 (Exception - Thiếu trường thông tin bắt buộc):**  
  *Gắn rule:* BR-002-01.  
  - **Given:** Người dùng đang đăng nhập với vai trò OWNER và chuẩn bị gửi dữ liệu đăng tin.  
  - **When:** Chủ thiết bị chọn hành động đăng tin nhưng để trống một hoặc nhiều trường: tiêu đề, mô tả, tình trạng, hoặc không tải lên ảnh nào (< 1 ảnh).  
  - **Then:** Hệ thống từ chối tạo tin, giữ nguyên dữ liệu đã nhập, và hiển thị mã lỗi `ERR-USR-005`.

- **AC-002-03 (Exception - Giá thuê không hợp lệ):**  
  *Gắn rule:* BR-002-01.  
  - **Given:** Chủ thiết bị thực hiện thao tác tạo tin đăng.  
  - **When:** Chủ thiết bị nhập giá thuê theo ngày ≤ 0 đồng.  
  - **Then:** Hệ thống chặn lưu dữ liệu và báo mã lỗi `ERR-USR-006`.

- **AC-002-04 (Exception - Tỷ lệ cọc ngoài phạm vi đề xuất):**  
  *Gắn rule:* BR-002-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`.  
  - **Given:** Chủ thiết bị thiết lập tham số tài chính cho tin đăng.  
  - **When:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Chủ thiết bị chọn tỷ lệ cọc < 20% hoặc > 50% so với giá trị kê khai của thiết bị.  
  - **Then:** Hệ thống từ chối biểu mẫu và hiển thị mã lỗi `ERR-USR-014`.

- **AC-002-05 (Exception - Khung ngày rảnh nằm trong quá khứ hoặc khoảng ngày đảo ngược):**  
  *Gắn rule:* BR-002-03.  
  - **Given:** Chủ thiết bị cấu hình các khung ngày rảnh cho thiết bị.  
  - **When:** Khung ngày được nhập có ngày bắt đầu trước ngày hiện tại của hệ thống, hoặc ngày kết thúc trước ngày bắt đầu.  
  - **Then:** Hệ thống từ chối ghi nhận khung rảnh và báo lỗi `ERR-USR-002` (nếu ngày bắt đầu trong quá khứ) hoặc `ERR-USR-003` (nếu ngày kết thúc trước ngày bắt đầu).

- **AC-002-06 (Alternative - Thêm nhiều khung ngày rảnh không trùng lắp):**  
  *Gắn rule:* BR-002-03.  
  - **Given:** Chủ thiết bị đang tạo tin đăng mới.  
  - **When:** Chủ thiết bị bổ sung nhiều khung ngày rảnh hợp lệ (ví dụ: khung 01 từ 01/11 đến 05/11 và khung 02 từ 10/11 đến 15/11).  
  - **Then:** Hệ thống lưu đầy đủ các khung ngày rảnh gắn liền với thiết bị để phục vụ kiểm tra trùng lịch đặt ở các câu chuyện sau.

- **AC-002-07 (Conflict/Validation - Hai khung ngày rảnh không được tự chồng lấn):**  
  *Gắn rule:* BR-002-03.  
  - **Given:** Chủ thiết bị nhập nhiều khung rảnh khi tạo tin.  
  - **When:** Xuất hiện 2 khung rảnh có khoảng ngày giao nhau (overlap).  
  - **Then:** Hệ thống không tạo tin cho đến khi Owner điều chỉnh để các khung rảnh không tự chồng lấn; những khung rảnh hợp lệ được giữ nguyên.

- **AC-002-08 (Security/Permission - Người dùng không phải vai trò OWNER tạo tin):**  
  *Gắn rule:* BR-002-04.  
  - **Given:** Phiên đăng nhập thuộc vai trò RENTER hoặc người dùng chưa xác thực.  
  - **When:** Người dùng cố gắng gọi hành động tạo tin đăng.  
  - **Then:** Hệ thống từ chối truy cập và báo mã lỗi `ERR-USR-008`.

### 5. Business Rules
- **BR-002-01 (Dữ liệu bắt buộc của tin đăng - Đã chốt theo Spec 6.1/6.2):** Một tin đăng hợp lệ bắt buộc gồm: tiêu đề, mô tả thiết bị, tình trạng hiện tại, ít nhất 01 ảnh thực tế rõ nét, giá thuê/ngày nguyên dương (đồng), giá trị kê khai thiết bị nguyên dương. Nguồn: `gearloop_day02_spec.md §6.1`, `E-R6`.
- **BR-002-02 (Phạm vi tỷ lệ cọc - `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`):** Mức cọc do Owner tự thiết lập nhưng phải nằm trong dải từ 20% đến 50% giá trị kê khai của thiết bị. Nguồn tham chiếu: `gearloop_day02_spec.md §6.2`; đối chiếu `tmp/bench/bench_deposit.md` — Shopify chỉ chứng minh mô hình phần trăm phổ biến trong thương mại điện tử, không xác nhận một tỷ lệ cố định cho P2P; benchmark không xác nhận 30% là chuẩn ngành.
- **Ghi chú hợp nhất (Phụ lục D, Q1 — cơ sở tính % cọc):** BR-002-02 lấy dải 20%–50% theo **giá trị kê khai** (spec 6.2), trong khi ví dụ tính cọc của spec US2 (600.000 đ/ngày × 2 ngày × 30% = 360.000 đ) dùng **tổng tiền thuê** của lượt đặt. Hai cơ sở chưa thống nhất — mâu thuẫn nội bộ của hồ sơ, không tự quyết; xem Phụ lục D.
- **BR-002-03 (Quy chuẩn khung ngày rảnh - Đã chốt):** Tin đăng phải có tối thiểu 01 khung ngày rảnh trong tương lai. Ngày bắt đầu của khung rảnh phải ≥ ngày hiện tại. Ngày kết thúc phải sau ngày bắt đầu. Không chấp nhận khung ngày quá khứ. `[CẦN XÁC NHẬN]` Việc cấm các khung rảnh tự chồng lấn trong cùng một tin là suy luận, chưa có trong hồ sơ. Nguồn: `gearloop_day02_spec.md §6.1, §6.2`, `E-R1`.
- **BR-002-04 (Quyền hạn khởi tạo - Đã chốt):** Chỉ tài khoản mang vai trò OWNER và đang không bị khóa mới có quyền tạo tin đăng. Nguồn: `gearloop_architecture_blueprint.md §6`.

### 6. Validation & Error Handling
- Bỏ trống trường bắt buộc hoặc thiếu ảnh: Chặn và trả về mã lỗi `ERR-USR-005`.
- Giá thuê theo ngày ≤ 0 đồng: Chặn và trả về mã lỗi `ERR-USR-006`.
- Tỷ lệ cọc vi phạm dải 20%–50%: Chặn và trả về mã lỗi `ERR-USR-014`.
- Ngày bắt đầu khung rảnh < ngày hiện tại: Chặn và trả về mã lỗi `ERR-USR-002`.
- Ngày kết thúc < ngày bắt đầu: Chặn và trả về mã lỗi `ERR-USR-003`.
- Sai vai trò thực hiện: Chặn và trả về mã lỗi `ERR-USR-008`.
- Lỗi xử lý dữ liệu hệ thống: Trả về `ERR-SYS-001`.

### 7. Permissions & Preconditions
- **Vai trò thực hiện:** OWNER.
- **Điều kiện tiên quyết:** Tài khoản Owner đã xác thực hợp lệ, trạng thái tài khoản đang hoạt động (không bị Admin khóa theo E-R9).

### 8. Dependencies & References
- **Phụ thuộc story nền:** US-001 (Đăng nhập & phân quyền).
- **Làm tiền đề cho story:** US-003 (Quản lý tin), US-004 (Renter tìm & xem tin), US-005 (Renter đặt thuê).
- **Tài liệu tham chiếu:** `gearloop_day02_spec.md` (§6.1, §6.2), `gearloop_architecture_blueprint.md` (§3, §6), `wb4_gearloop/BusinessRules.md` (E-R1, E-R6, E-R8), yêu cầu đặc tả US-002.

### 9. Out of Scope
- Kiểm duyệt tin tự động bằng AI / nhận diện hình ảnh AI.
- Đặt cọc bằng tiền mặt hoặc qua cổng thanh toán trung gian ngân hàng trực tiếp trong phiên bản MVP (cọc quản lý ở dạng bản ghi sổ cái nội bộ).
- Thiết lập định vị GPS chính xác của thiết bị tại nhà riêng (tuân thủ E-R8: giao nhận tại điểm PickupPoint, không lưu địa chỉ nhà riêng).
- Hỗ trợ chọn khung giờ lẻ từng phút (chỉ hỗ trợ đặt theo khung ngày trọn vẹn).

---


---

## US-004: Tìm & xem tin cho thuê

### 0. Khối thông tin định danh (Metadata)
- **Mã User Story:** US-004
- **Tên User Story:** Tìm & xem tin cho thuê
- **Vai trò chính:** Người thuê (Renter)
- **Mức độ ưu tiên (MoSCoW):** Must have
- **Sprint dự kiến:** Sprint 1
- **Trạng thái:** Chưa làm
- **Quy tắc nghiệp vụ tham chiếu:** E-R1 (chống trùng lịch hiển thị khung trống), E-R9 (ẩn tin vi phạm), BR-004-01, BR-004-02, BR-004-03, BR-004-04

### 1. Tiêu đề (Title)
US-004: Tìm kiếm, lọc danh mục/khung ngày và xem chi tiết tin đăng cho thuê thiết bị.

### 2. Đang xây dựng khả năng gì?
Cung cấp khả năng tìm kiếm tin đăng theo từ khóa, lọc theo danh mục thiết bị và khoảng ngày còn trống, đồng thời hiển thị chi tiết thông số, ảnh, giá thuê, tỷ lệ cọc và các khung ngày khả dụng của thiết bị đang mở cho thuê.

### 3. User Story (Nguyên văn)
> Là Renter, tôi muốn tìm kiếm và xem chi tiết tin cùng các khung ngày giờ còn trống, để tự đánh giá đủ thông tin trước khi quyết định thuê.

### 4. Tiêu chí chấp nhận (Acceptance Criteria - AC)
- **AC-004-01 (Happy Path - Tìm kiếm từ khóa và xem kết quả):**
  - **Given:** Hệ thống có các tin đăng ở trạng thái hoạt động (OPEN), không bị ẩn, thuộc về Owner không bị khóa;
  - **When:** Renter nhập từ khóa tìm kiếm (ví dụ tên thiết bị hoặc mô tả) và thực hiện tìm kiếm;
  - **Then:** Hệ thống trả về danh sách các tin đăng phù hợp có chứa từ khóa; mỗi kết quả hiển thị tối thiểu: ảnh đại diện, tiêu đề thiết bị, danh mục, đơn giá thuê theo ngày, tỷ lệ đặt cọc niêm yết (theo BR-004-01).
- **AC-004-02 (Happy Path - Lọc theo khoảng ngày còn trống):**
  - **Given:** Thiết bị A có lịch đã bị chiếm ở trạng thái REQUESTED, CONFIRMED hoặc PICKED_UP từ ngày 15/11 đến 16/11;
  - **When:** Renter chọn bộ lọc ngày thuê từ 15/11 đến 17/11;
  - **Then:** Thiết bị A không xuất hiện trong kết quả lọc; khi Renter đổi bộ lọc sang ngày 18/11 đến 19/11 thì Thiết bị A xuất hiện trong danh sách kết quả kèm thông tin giá thuê theo ngày (theo E-R1, BR-004-02).
- **AC-004-03 (Happy Path - Lọc kết hợp danh mục và sắp xếp):**
  - **Given:** Renter đang ở trang danh sách tin cho thuê;
  - **When:** Renter chọn lọc theo danh mục thiết bị (ví dụ: "Máy ảnh", "Ống kính") và chọn sắp xếp theo giá thuê tăng dần;
  - **Then:** Hệ thống hiển thị danh sách các tin đăng thuộc đúng danh mục đã chọn và sắp xếp đơn giá từ thấp đến cao (theo BR-004-01).
- **AC-004-04 (Happy Path - Xem chi tiết tin đăng):**
  - **Given:** Tin đăng thiết bị B đang ở trạng thái OPEN;
  - **When:** Renter chọn xem chi tiết tin đăng B;
  - **Then:** Hệ thống hiển thị đầy đủ thông tin: tên thiết bị, danh mục, mô tả chi tiết, bộ ảnh thực tế, tình trạng thiết bị do Owner kê khai, đơn giá thuê theo ngày, tỷ lệ cọc (ví dụ 30% `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`), danh sách các điểm nhận trả hợp lệ (PickupPoint theo E-R8), và lịch các khung ngày còn trống (AvailabilitySlot) chưa có booking chiếm chỗ (theo E-R1, E-R8, BR-004-03).
- **AC-004-05 (Exception - Tin đăng bị ẩn hoặc chủ đồ bị khóa không được hiển thị):**
  - **Given:** Tin đăng C bị Admin ẩn (theo E-R9) hoặc Owner của tin đăng C đang bị khóa tài khoản;
  - **When:** Renter tìm kiếm từ khóa khớp với tin C hoặc cố tình truy cập trực tiếp qua đường dẫn của tin C;
  - **Then:** Tin đăng C không xuất hiện trong danh sách tìm kiếm/bộ lọc; nếu truy cập trực tiếp, hệ thống từ chối hiển thị và thông báo lỗi theo mã ERR-USR-004 (theo E-R9, BR-004-04).
- **AC-004-06 (Exception - Khoảng ngày lọc không hợp lệ):**
  - **Given:** Renter sử dụng bộ lọc tìm kiếm theo ngày;
  - **When:** Renter nhập ngày bắt đầu nhỏ hơn ngày hiện tại hoặc ngày kết thúc trước ngày bắt đầu;
  - **Then:** Hệ thống chặn tìm kiếm, giữ nguyên danh sách hiện tại và thông báo lỗi tương ứng theo mã ERR-USR-002 hoặc ERR-USR-003.
- **AC-004-07 (Alternative - Không tìm thấy kết quả phù hợp):**
  - **Given:** Không có tin đăng nào thỏa mãn đồng thời từ khóa và khoảng ngày lọc của Renter;
  - **When:** Hệ thống hoàn tất việc tìm kiếm;
  - **Then:** Hệ thống hiển thị danh sách trống, hướng dẫn thử điều chỉnh từ khóa hoặc khoảng ngày; không phát sinh lỗi (BR-004-01, BR-004-02).

### 5. Quy tắc nghiệp vụ (Business Rules)
- **BR-004-01 (Hiển thị tin công khai):** Chỉ các Item ở trạng thái sẵn sàng (OPEN), không bị đánh dấu xóa/lưu trữ (archived), không bị Admin ẩn và thuộc Owner đang hoạt động bình thường mới được xuất hiện trên kết quả tìm kiếm và danh mục công khai (Nguồn: Day02 spec §6.2, E-R9).
- **BR-004-02 (Loại trừ lịch bận theo nguyên tắc chống trùng):** Khi Renter lọc theo khoảng thời gian $[T_{start}, T_{end}]$, hệ thống phải loại bỏ toàn bộ Item có bất kỳ Booking nào ở trạng thái **REQUESTED, CONFIRMED hoặc PICKED_UP** giao thoa với khoảng thời gian này (Nguồn: E-R1, Day02 spec §6.3 US1). Nhóm trạng thái chiếm lịch nhất quán với BR-005-01 — hợp nhất tại Ghi chú hợp nhất 2 (Phụ lục D).
- **BR-004-03 (Minh bạch dữ liệu tài chính & điểm giao nhận):** Chi tiết tin đăng bắt buộc phải niêm yết rõ: đơn giá thuê theo ngày, tỷ lệ cọc trên giá trị kê khai, và danh sách điểm bàn giao PickupPoint đã đăng ký; không hiển thị địa chỉ nhà riêng của Owner (Nguồn: E-R6, E-R8, Day02 spec §6.1).
- **BR-004-04 (Chặn truy cập tin vi phạm):** Khi Item bị Admin ẩn hoặc tài khoản Owner bị khóa, mọi yêu cầu đọc chi tiết tin phải bị từ chối ngay lập tức để bảo vệ người thuê (Nguồn: E-R9, blueprint §6).

### 6. Xác thực dữ liệu & Xử lý lỗi (Validation & Error Handling)
- **Từ khóa tìm kiếm:** Chuỗi ký tự độ dài 0–100 ký tự; khoảng trắng đầu cuối tự động loại bỏ.
- **Khoảng ngày lọc:** Ngày bắt đầu phải $\ge$ ngày hiện tại; ngày kết thúc phải $\ge$ ngày bắt đầu.
- **Mã lỗi liên quan:**
  - `ERR-USR-002`: "Ngày bắt đầu phải từ hôm nay trở đi."
  - `ERR-USR-003`: "Ngày kết thúc phải sau ngày bắt đầu."
  - `ERR-USR-004`: "Tin đăng hiện không khả dụng."
  - `ERR-SYS-001`: Lỗi xử lý nội bộ khi truy vấn dữ liệu.

### 7. Phân quyền & Điều kiện tiên quyết (Permissions & Preconditions)
- **Phân quyền (RBAC):** RENTER, OWNER, ADMIN đều có quyền tìm kiếm và đọc tin đăng công khai. `[CẦN NHÓM CHỐT]` Khách vãng lai chưa đăng nhập có được phép xem danh sách tin công khai không — hồ sơ chưa quy định (Phụ lục D, Q8).
- **Điều kiện tiên quyết:** Item tồn tại trong hệ thống và chưa bị xóa; không bị Admin ẩn (E-R9).

### 8. Phụ thuộc & Tài liệu tham chiếu (Dependencies & References)
- **Phụ thuộc story:** Phụ thuộc US-002 (Owner đăng tin để có dữ liệu Item hiển thị); phụ thuộc US-013 (Admin ẩn tin vi phạm).
- **Tài liệu tham chiếu:** `gearloop_user_stories.md` (US-004), `gearloop_day02_spec.md` (§6.1, §6.2, US1), `gearloop_architecture_blueprint.md` (§3, §6), `wb4_gearloop/BusinessRules.md` (E-R1, E-R8, E-R9).

### 9. Ngoài phạm vi (Out of Scope)
- Đặt thuê hoặc giữ chỗ trực tiếp từ màn hình tìm kiếm (thuộc US-005).
- Chat, nhắn tin trực tiếp hoặc trả giá/thương lượng với Owner (nằm ngoài phạm vi 6 tuần theo Day02 Problem Statement §6.6).
- Gợi ý thông minh, tìm kiếm bằng AI/Vector search (cam kết Zero-AI blueprint §1).
- Lưu lịch sử vị trí hoặc ghi nhận hành vi tìm kiếm phục vụ quảng cáo (tuân thủ ràng buộc E-R6).

---


---

## US-005: Đặt thuê theo khung ngày

### 0. Khối thông tin định danh (Metadata)
- **Mã User Story:** US-005
- **Tên User Story:** Đặt thuê theo khung ngày
- **Vai trò chính:** Người thuê (Renter)
- **Mức độ ưu tiên (MoSCoW):** Must have
- **Sprint dự kiến:** Sprint 2
- **Trạng thái:** Chưa làm
- **Quy tắc nghiệp vụ tham chiếu:** E-R1 (chống trùng lịch), E-R2 (sổ cái cọc append-only, tự tạo HOLD), E-R7 (không tự sửa lịch sau duyệt), E-R8 (chọn PickupPoint), E-R9 (không đặt tin ẩn/bị khóa), BR-005-01, BR-005-02, BR-005-03, BR-005-04 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, BR-005-05

### 1. Tiêu đề (Title)
US-005: Đặt thuê thiết bị theo khoảng ngày, khóa lịch tạm thời, snapshot đơn giá/tiền cọc và tạo giao dịch tạm giữ cọc (HOLD).

### 2. Đang xây dựng khả năng gì?
Cho phép Renter gửi yêu cầu thuê thiết bị cho một khoảng ngày cụ thể, chốt giá thuê và mức cọc theo snapshot niêm yết tại thời điểm đặt, chọn điểm bàn giao PickupPoint, tự động tạo bút toán HOLD cọc trong sổ cái trung gian và ngăn chặn tuyệt đối tình trạng đặt trùng lịch.

### 3. User Story (Nguyên văn)
> Là Renter, tôi muốn đặt thuê một khung ngày giờ cụ thể với đúng giá và mức cọc đã niêm yết, để có chỗ chắc chắn đúng thời điểm tôi cần, không phải thương lượng từng lượt.

### 4. Tiêu chí chấp nhận (Acceptance Criteria - AC)
- **AC-005-01 (Happy Path - Đặt thuê thành công tạo Booking và bút toán HOLD):**
  - **Given:** Item X đang ở trạng thái OPEN, giá niêm yết 600.000 đ/ngày, mức cọc 30% `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` (trên tổng giá thuê hoặc giá trị kê khai theo chính sách tin đăng), chưa có booking nào trong khoảng 18/11 đến 19/11 (2 ngày); Renter R đã đăng nhập;
  - **When:** Renter R chọn khoảng ngày từ 18/11 đến 19/11, chọn một điểm PickupPoint hợp lệ và chọn hành động đặt thuê;
  - **Then:** Hệ thống tạo một Booking mới ở trạng thái REQUESTED; ghi nhận tổng tiền thuê snapshot là 1.200.000 đ; tự động tạo một dòng DepositTransaction loại HOLD với số tiền cọc tương ứng (ví dụ: 360.000 đ) gắn với Booking; khoảng ngày 18/11–19/11 của Item X bị khóa đối với các yêu cầu khác; phát sự kiện thông báo NTF-001 tới Owner (theo E-R1, E-R2, E-R8, BR-005-01, BR-005-02, BR-005-03).
- **AC-005-02 (Exception - Chặn đặt trùng lịch do đã có booking khác):**
  - **Given:** Item X đã có một Booking ở trạng thái REQUESTED hoặc CONFIRMED trong khoảng ngày 15/11 đến 18/11;
  - **When:** Renter R chọn khoảng ngày từ 17/11 đến 20/11 trên Item X và chọn hành động đặt thuê;
  - **Then:** Hệ thống từ chối tạo lượt thuê, không ghi nhận dòng HOLD nào vào sổ cái cọc, giữ nguyên trạng thái dữ liệu cũ và trả về thông báo lỗi theo mã ERR-USR-001 (theo E-R1, BR-005-01).
- **AC-005-03 (Exception - Ngày bắt đầu trong quá khứ):**
  - **Given:** Ngày hiện tại theo hệ thống là 20/11;
  - **When:** Renter chọn ngày bắt đầu thuê là 19/11 và thực hiện đặt;
  - **Then:** Hệ thống không tạo Booking hoặc HOLD, giữ nguyên dữ liệu và trả `ERR-USR-002` (BR-005-06 `[CẦN XÁC NHẬN]`).
- **AC-005-04 (Exception - Ngày kết thúc trước hoặc bằng ngày bắt đầu):**
  - **Given:** Renter đang ở màn hình tạo lượt đặt thuê;
  - **When:** Renter chọn ngày kết thúc thuê trước ngày bắt đầu thuê;
  - **Then:** Hệ thống chặn yêu cầu ngay tại bước kiểm tra hợp lệ, không tạo booking và trả về thông báo lỗi theo mã ERR-USR-003.
- **AC-005-05 (Exception - Đặt thuê thiết bị đang bị ẩn hoặc Owner bị khóa):**
  - **Given:** Thiết bị Y vừa bị Admin ẩn theo quy định E-R9 hoặc tài khoản Owner bị khóa;
  - **When:** Renter R gửi yêu cầu đặt thuê thiết bị Y;
  - **Then:** Hệ thống chặn giao dịch, không tạo Booking, không tạo HOLD cọc và thông báo lỗi theo mã ERR-USR-004 (theo E-R9).
- **AC-005-06 (Exception - Renter tự đặt thiết bị của chính mình):**
  - **Given:** Người dùng U là chủ sở hữu của thiết bị Z;
  - **When:** Người dùng U dùng vai trò Renter để đặt thuê thiết bị Z của chính mình;
  - **Then:** Hệ thống từ chối xử lý, không tạo booking và trả về thông báo lỗi theo mã ERR-USR-022 (không thể đặt thuê thiết bị của chính mình).
- **AC-005-07 (Conflict/Race - Hai Renter cùng đặt một khung ngày đồng thời):**
  - **Given:** Thiết bị M đang trống ngày 25/11–26/11; hai Renter cùng gửi yêu cầu đặt thuê cho khoảng ngày đó gần như đồng thời;
  - **When:** Hai yêu cầu được xử lý;
  - **Then:** Chỉ một Booking REQUESTED + HOLD được tạo; yêu cầu còn lại không tạo Booking/HOLD, nhận `ERR-SYS-002`; lịch chỉ bị chiếm một lần (E-R1, E-R2, BR-005-01, BR-005-03).
- **AC-005-08 (Happy Path - Chốt giá snapshot không bị ảnh hưởng khi tin gốc đổi giá):**
  - **Given:** Booking B đã được tạo ở trạng thái REQUESTED với đơn giá snapshot 500.000 đ/ngày;
  - **When:** Owner cập nhật giá niêm yết lên 700.000 đ/ngày;
  - **Then:** Booking B và khoản HOLD giữ nguyên giá trị snapshot ban đầu, không bị cập nhật theo giá mới (BR-005-02).
- **AC-005-09 (Proposal/Timeout - Hết hạn chờ duyệt 24h tự động chuyển EXPIRED và giải phóng cọc) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:**
  - **Given:** Booking B được tạo ở trạng thái REQUESTED kèm dòng cọc HOLD;
  - **When:** Sau 24 giờ kể từ thời điểm tạo mà Owner không thực hiện duyệt hoặc từ chối (mô phỏng đồng hồ hệ thống theo BR-005-04 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`);
  - **Then:** [ĐỀ XUẤT — CẦN NHÓM CHỐT] Nếu nhóm phê duyệt cơ chế hết hạn 24h và trạng thái `EXPIRED`, Booking chuyển từ REQUESTED sang EXPIRED; hệ thống tạo RELEASE 100% HOLD, khung ngày được giải phóng và phát NTF-004 cho Renter và Owner. Nếu chưa phê duyệt, không áp dụng AC này như hành vi nền đã chốt; trạng thái hiện có của hồ sơ chỉ gồm REQUESTED/CONFIRMED/PICKED_UP/RETURNED/CLOSED/CANCELLED.
- **AC-005-10 (Exception - Không chọn điểm bàn giao PickupPoint hợp lệ):**
  - **Given:** Item yêu cầu bàn giao tại các PickupPoint đã được Owner khai báo;
  - **When:** Renter gửi yêu cầu đặt thuê nhưng bỏ trống điểm PickupPoint hoặc chọn điểm không thuộc danh sách chấp nhận của tin;
  - **Then:** Hệ thống từ chối tạo booking, yêu cầu Renter chọn điểm nhận trả hợp lệ, không ghi nhận Booking hoặc HOLD (theo E-R8, BR-005-05).

### 5. Quy tắc nghiệp vụ (Business Rules)
- **BR-005-01 (Chống trùng lịch tuyệt đối - Overlap Prevention):** Một Item không được phép tồn tại 2 Booking có khoảng thời gian thuê giao nhau khi trạng thái booking thuộc nhóm chiếm lịch (REQUESTED, CONFIRMED, PICKED_UP). Quy tắc này phải được bảo vệ bằng giao dịch tuần tự độc lập (Nguồn: E-R1, Day02 spec §6.2, blueprint §3).
- **BR-005-02 (Snapshot đơn giá và tỷ lệ cọc):** Khi Booking được tạo, hệ thống phải sao chép nguyên trạng đơn giá thuê, tỷ lệ cọc niêm yết và điểm PickupPoint vào bản ghi Booking. Các thay đổi sau này trên Item không làm thay đổi nghĩa vụ tài chính của Booking đã tạo (Nguồn: E-R2, blueprint §3).
- **BR-005-03 (Tạo cọc trung gian tự động HOLD):** Tạo Booking thành công ở trạng thái REQUESTED bắt buộc phải sinh ra một bản ghi DepositTransaction loại HOLD tương ứng trong sổ cái cọc append-only; tiền cọc được giữ trung gian bởi hệ thống (Nguồn: E-R2, Day02 spec §6.2).
- **BR-005-04 (Thời hạn chờ duyệt 24h - Pending Expiry) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:** Yêu cầu thuê ở trạng thái REQUESTED chỉ có hiệu lực tối đa 24 giờ. Nếu Owner không duyệt, hệ thống tự động hủy trạng thái chờ (EXPIRED), giải phóng lịch và hoàn trả cọc (RELEASE). *(Căn cứ benchmark: Airbnb Help Center Article 28/313 và Getaround EU TOS EN §Booking — thời hạn phản hồi là 24h. Lưu ý: GearLoop Day02 spec gốc chưa có trạng thái EXPIRED, đây là đề xuất bổ sung để tránh treo cọc và lịch vô hạn).*
- **BR-005-05 (Ràng buộc điểm bàn giao PickupPoint):** Mọi Booking phải gắn với đúng một điểm bàn giao PickupPoint hợp lệ do Quản trị viên quản lý và Owner đã chấp nhận; không cho phép nhập địa chỉ cá nhân (Nguồn: E-R8).
- **BR-005-06 (Ngày thuê bắt đầu không ở quá khứ):** Hồ sơ thể hiện validation ngày bắt đầu không trước hôm nay trong AC, nhưng chưa có business rule nguồn; đề xuất chặn ngày trước hôm nay bằng `ERR-USR-002`. Nhóm cần xác nhận mốc ngày địa phương và liệu ngày hiện tại có hợp lệ. [CẦN XÁC NHẬN]

### 6. Xác thực dữ liệu & Xử lý lỗi (Validation & Error Handling)
- **Kiểm tra tính hợp lệ dữ liệu:**
  - `start_date`: Bắt buộc, định dạng ngày hợp lệ, $\ge$ ngày hiện tại.
  - `end_date`: Bắt buộc, định dạng ngày hợp lệ, $\ge$ `start_date`.
  - `pickup_point_id`: Bắt buộc, phải thuộc danh sách PickupPoint hợp lệ của Item.
  - `item_id`: Bắt buộc, Item phải ở trạng thái OPEN.
- **Danh mục lỗi chuẩn:**
  - `ERR-USR-001`: "Khung ngày bạn chọn đã có người đặt. Vui lòng chọn khung ngày khác."
  - `ERR-USR-002`: "Ngày bắt đầu phải từ hôm nay trở đi."
  - `ERR-USR-003`: "Ngày kết thúc phải sau ngày bắt đầu."
  - `ERR-USR-004`: "Tin đăng hiện không khả dụng."
  - `ERR-USR-008`: "Bạn không có quyền thực hiện thao tác này."
  - `ERR-USR-022`: "Bạn không thể đặt thuê thiết bị của chính mình."
  - `ERR-SYS-001`: "Hệ thống gặp sự cố. Vui lòng thử lại sau. Mã lỗi: ERR-SYS-001."
  - `ERR-SYS-002`: "Thao tác không thể hoàn thành do xung đột dữ liệu. Vui lòng thử lại. Mã lỗi: ERR-SYS-002."

### 7. Phân quyền & Điều kiện tiên quyết (Permissions & Preconditions)
- **Phân quyền (RBAC):** Chỉ người dùng có vai trò `RENTER` đã đăng nhập và tài khoản ở trạng thái hoạt động bình thường (không bị khóa theo E-R9).
- **Điều kiện tiên quyết:**
  - Renter không phải là chủ sở hữu của Item đang đặt thuê.
  - Item đang ở trạng thái OPEN, không bị ẩn bởi Admin.
  - Khoảng ngày lựa chọn không trùng với bất kỳ Booking nào đang có trạng thái REQUESTED hoặc CONFIRMED trên Item đó.

### 8. Phụ thuộc & Tài liệu tham chiếu (Dependencies & References)
- **Phụ thuộc story:** Phụ thuộc US-001 (xác thực và phân quyền vai Renter), US-002 (tin đăng tồn tại), US-009 (quản lý sổ cái cọc HOLD), US-006 (gửi thông báo NTF-001 cho Owner).
- **Tài liệu tham chiếu:** `gearloop_user_stories.md` (US-005), `gearloop_day02_spec.md` (US2, §6.1, §6.2), `gearloop_architecture_blueprint.md` (§3, §6, §7), `wb4_gearloop/BusinessRules.md` (E-R1, E-R2, E-R7, E-R8, E-R9), `tmp/bench/bench_cancel.md` (benchmark 24h Airbnb/Getaround).

### 9. Ngoài phạm vi (Out of Scope)
- Thanh toán tiền mặt trực tiếp ngoài sàn hoặc tích hợp cổng thanh toán trực tiếp của bên thứ ba trong phạm vi cốt lõi (sử dụng mô hình sổ cái nội bộ mô phỏng HOLD/RELEASE theo blueprint §3).
- Renter tự sửa đổi khoảng ngày thuê sau khi đã gửi yêu cầu (vi phạm E-R7).
- Đặt nhiều thiết bị thành một gói combo/kit trong một lần đặt (đã loại bỏ khỏi MVP theo thỏa thuận hồ sơ Workshop 1 C4).

---


---

## US-006: Nhận thông báo yêu cầu thuê

### 0. Metadata block
- **Story ID:** US-006
- **Tên:** Nhận thông báo yêu cầu thuê
- **Vai trò:** Owner
- **Mức ưu tiên (MoSCoW):** Must
- **Sprint dự kiến:** Sprint 2
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** BR-006-01, BR-006-02, BR-006-03 `[CẦN XÁC NHẬN]`

### 1. Title
Nhận thông báo in-app khi phát sinh yêu cầu thuê mới

### 2. Đang xây dựng khả năng gì?
Cung cấp khả năng tiếp nhận thông báo tức thời trong ứng dụng (in-app notification) cho Chủ thiết bị ngay khi có Người thuê gửi yêu cầu đặt một khung ngày cụ thể trên thiết bị của mình.

### 3. User Story
Là Owner, tôi muốn nhận thông báo ngay khi có người đặt thuê thiết bị của tôi, để phản hồi kịp thời, không bỏ lỡ lượt thuê.

### 4. Acceptance Criteria (AC)

- **AC-006-01 (Happy path - Phát sinh bản ghi thông báo khi có booking mới):**  
  *Gắn rule:* BR-006-01.  
  - **Given:** Người thuê tạo thành công một lượt đặt thuê mới (Booking chuyển sang trạng thái REQUESTED) cho thiết bị của Chủ thiết bị.  
  - **When:** Hệ thống hoàn tất giao dịch tạo lượt đặt.  
  - **Then:** Hệ thống tự động tạo một bản ghi thông báo in-app mã sự kiện `NTF-001` gửi đích danh tới Chủ thiết bị; nội dung tối thiểu xác định thiết bị, khoảng ngày đặt thuê và trạng thái REQUESTED. `[CẦN XÁC NHẬN]` Mức chi tiết còn hiển thị (tên Renter, tổng tiền thuê, cọc) cần nhóm chốt.

- **AC-006-02 (Happy path - Chủ thiết bị xem danh sách thông báo và điều hướng):**  
  *Gắn rule:* BR-006-01, BR-006-02.  
  - **Given:** Chủ thiết bị đăng nhập vào hệ thống và có thông báo `NTF-001`.  
  - **When:** Chủ thiết bị chọn xem danh mục thông báo và chọn vào thông báo yêu cầu thuê tương ứng.  
  - **Then:** Hệ thống hiển thị chi tiết yêu cầu thuê của Booking ở trạng thái REQUESTED để Owner tiến hành xem xét duyệt hoặc từ chối. `[CẦN XÁC NHẬN]` Nhóm cần chốt có theo dõi trạng thái đã đọc/chưa đọc hay không.

- **AC-006-03 (Exception - Trạng thái yêu cầu thay đổi trước khi Owner xem thông báo):**  
  *Gắn rule:* BR-006-03 `[CẦN XÁC NHẬN]`.  
  - **Given:** Chủ thiết bị nhận thông báo `NTF-001`, nhưng trước khi Owner phản hồi, lượt đặt đó đã bị Renter hủy và chuyển sang CANCELLED.  
  - **When:** Chủ thiết bị chọn vào thông báo đó để xem chi tiết.  
  - **Then:** Hệ thống hiển thị chi tiết Booking với trạng thái thực tế hiện tại là CANCELLED, không mở hành động duyệt/từ chối cho yêu cầu không còn hiệu lực.

### 5. Business Rules
- **BR-006-01 (Kích hoạt sự kiện thông báo - Đã chốt theo shared contract):** Sự kiện `NTF-001` được phát sinh tự động ngay khi Booking được ghi nhận ở trạng thái REQUESTED từ US-005. Người nhận duy nhất là Chủ thiết bị sở hữu Item tương ứng. Nguồn: `local://shared_contract.md §8`.
- **BR-006-02 (Phạm vi truyền tải thông báo - Đã chốt):** Trong phạm vi hệ thống, thông báo là dạng thông báo nội bộ ứng dụng (in-app notification log); danh sách thông báo của Owner chỉ chứa các sự kiện gửi tới chính tài khoản đó.
- **BR-006-03 (Hiệu lực liên kết thông báo - `[CẦN XÁC NHẬN]`):** `[CẦN XÁC NHẬN]` Thông báo đóng vai trò dẫn đường tới Booking; nếu Booking đã chuyển trạng thái do Renter hủy trước, màn hình chi tiết phải phản ánh trung thực trạng thái hiện thời của Booking. Nhóm cần xác nhận có theo dõi trạng thái đọc/chưa đọc và thời điểm hết hiệu lực của thông báo hay không.

### 6. Validation & Error Handling
- Người dùng chưa đăng nhập: Yêu cầu đăng nhập trước khi xem danh sách thông báo (`ERR-SYS-003` nếu phiên làm việc hết hạn).
- Lỗi không thể tạo hoặc tải bản ghi thông báo: Trả về `ERR-SYS-001`.

### 7. Permissions & Preconditions
- **Vai trò thực hiện:** OWNER.
- **Điều kiện tiên quyết:** Có ít nhất một Booking liên quan đến thiết bị của Owner chuyển sang trạng thái REQUESTED.

### 8. Dependencies & References
- **Phụ thuộc story nền:** US-005 (Renter đặt thuê theo khung ngày — phát sinh sự kiện NTF-001).
- **Làm tiền đề cho story:** US-007 (Owner duyệt / từ chối yêu cầu thuê).
- **Tài liệu tham chiếu:** `local://shared_contract.md §8` (Sự kiện thông báo).

### 9. Out of Scope
- Gửi tin nhắn SMS, gọi điện thoại tự động hoặc gửi email ngoài ứng dụng (chỉ tập trung in-app notification).
- Tính năng trò chuyện / chat trực tiếp giữa Owner và Renter về yêu cầu thuê (Won't trong phạm vi MVP).

---


---

## US-007: Duyệt / từ chối yêu cầu thuê

### 0. Metadata block
- **Story ID:** US-007
- **Tên:** Duyệt / từ chối yêu cầu thuê
- **Vai trò:** Owner
- **Mức ưu tiên (MoSCoW):** Must
- **Sprint dự kiến:** Sprint 2
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R1, E-R2, E-R5, E-R7, BR-007-01, BR-007-02, BR-007-03 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, BR-007-04, BR-007-05 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`

### 1. Title
Phê duyệt hoặc từ chối yêu cầu thuê thiết bị

### 2. Đang xây dựng khả năng gì?
Cho phép Chủ thiết bị đưa ra quyết định chấp thuận (CONFIRMED) hoặc từ chối (CANCELLED) đối với từng yêu cầu thuê đang chờ duyệt, qua đó kiểm soát lịch thuê và kích hoạt các phản ứng hệ thống tương ứng về cọc và thông báo.

### 3. User Story
Là Owner, tôi muốn duyệt hoặc từ chối từng yêu cầu thuê, để chủ động chọn người thuê và giữ quyền kiểm soát lịch thiết bị.

### 4. Acceptance Criteria (AC)

- **AC-007-01 (Happy path - Chủ thiết bị chấp nhận yêu cầu thuê):**  
  *Gắn rule:* BR-007-01, BR-007-04.  
  - **Given:** Lượt thuê đang ở trạng thái REQUESTED trên thiết bị thuộc quyền sở hữu của Owner; khoản cọc tương ứng đang ở trạng thái HOLD.  
  - **When:** Chủ thiết bị chọn hành động chấp nhận yêu cầu thuê.  
  - **Then:** Trạng thái Booking chuyển từ REQUESTED sang CONFIRMED; hệ thống giữ nguyên khoản cọc HOLD trên sổ cái; phát sinh sự kiện thông báo `NTF-002` gửi tới Người thuê; lịch của thiết bị trong khoảng ngày này chính thức bị khóa đối với các yêu cầu khác.

- **AC-007-02 (Happy path - Chủ thiết bị từ chối yêu cầu thuê):**  
  *Gắn rule:* BR-007-02, BR-007-04.  
  - **Given:** Lượt thuê đang ở trạng thái REQUESTED trên thiết bị của Owner; khoản cọc đang ở trạng thái HOLD.  
  - **When:** Chủ thiết bị chọn hành động từ chối yêu cầu thuê (kèm lý do từ chối nếu có).  
  - **Then:** Trạng thái Booking chuyển từ REQUESTED sang CANCELLED; khoản tiền cọc đang HOLD được hệ thống giải phóng (ghi nhận bản ghi RELEASE toàn bộ số tiền cọc cho Renter theo quy tắc sổ cái append-only); phát sinh sự kiện thông báo `NTF-003` gửi tới Người thuê; Owner không bị tính là vi phạm chính sách hủy (không bị phạt). `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Khoảng ngày trên khung rảnh được tự giải phóng sau khi từ chối là đề xuất, chưa được hồ sơ gốc chốt.

- **AC-007-03 (Exception - Thao tác khi booking không ở trạng thái REQUESTED):**  
  *Gắn rule:* BR-007-01, BR-007-02.  
  - **Given:** Lượt thuê đang ở trạng thái CONFIRMED, PICKED_UP, CANCELLED, hoặc CLOSED.  
  - **When:** Chủ thiết bị cố gắng gửi yêu cầu duyệt hoặc từ chối lượt thuê này.  
  - **Then:** Hệ thống từ chối thực thi và trả về mã lỗi `ERR-USR-009`.

- **AC-007-04 (Timeout/Proposal - Thao tác khi booking đã hết hạn 24h chờ duyệt):**  
  *Gắn rule:* BR-007-03 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`.  
  - **Given:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Yêu cầu thuê đã quá thời hạn 24 giờ kể từ thời điểm tạo và đã được hệ thống xác định hết hạn.  
  - **When:** Chủ thiết bị chọn hành động duyệt yêu cầu này.  
  - **Then:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Hệ thống ngăn chặn việc duyệt, giữ nguyên kết quả hết hạn của yêu cầu, và phản hồi mã lỗi `ERR-USR-015` theo cơ chế hết hạn được nhóm chốt.

- **AC-007-05 (Security/Permission - Thao tác bởi người không phải chủ thiết bị):**  
  *Gắn rule:* BR-007-04.  
  - **Given:** Người dùng đang đăng nhập với vai trò RENTER hoặc là một OWNER khác không sở hữu thiết bị được thuê.  
  - **When:** Người dùng này cố gắng gửi yêu cầu duyệt hoặc từ chối Booking.  
  - **Then:** Hệ thống chặn thao tác và trả về mã lỗi `ERR-USR-008`.

- **AC-007-06 (Conflict/Race condition - Renter hủy ngay trước khi Owner duyệt):**
  *Gắn rule:* BR-007-01, BR-007-02.  
  - **Given:** Lượt thuê đang ở trạng thái REQUESTED.  
  - **When:** Người thuê thực hiện hủy yêu cầu thành công (chuyển sang CANCELLED) ngay trước hoặc đồng thời khi Owner chọn hành động duyệt.  
  - **Then:** Giao dịch duyệt của Owner bị chặn do trạng thái đã thay đổi; hệ thống thông báo trạng thái cập nhật thất bại do xung đột dữ liệu `ERR-SYS-002` và hiển thị trạng thái CANCELLED thực tế của Booking.

- **AC-007-07 (Distinction/Policy - Làm rõ Owner hủy sau khi đã duyệt CONFIRMED):**  
  *Gắn rule:* E-R5, BR-007-05 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`.  
  - **Given:** Lượt thuê đã được duyệt và đang ở trạng thái CONFIRMED.  
  - **When:** Chủ thiết bị muốn hủy lượt thuê này trước giờ nhận đồ.  
  - **Then:** Thao tác này KHÔNG thuộc phạm vi từ chối của US-007, mà được chuyển sang thực thi theo quy định hủy tại US-008 / E-R5: khoản cọc được hoàn lại, hệ thống áp dụng voucher có điều kiện và ghi nhận strike cho Owner; `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` phạt thêm 30% tiền thuê nếu hủy trong vòng 24 giờ trước giờ nhận hoặc 10% tiền thuê nếu hủy từ 24 giờ trở lên trước giờ nhận. Khoản phạt này không áp dụng vào cọc; `[CẦN XÁC NHẬN]` người nhận voucher cần nhóm chốt.

### 5. Business Rules
- **BR-007-01 (Cửa vào phê duyệt Booking - Đã chốt theo Spec 6.1/6.2):** Chủ thiết bị chỉ được duyệt yêu cầu khi Booking đang ở chính xác trạng thái REQUESTED. Khi duyệt: Booking → CONFIRMED; lịch thuê chính thức xác lập, không cho phép yêu cầu khác chồng lấn ngày (E-R1). Nguồn: `gearloop_day02_spec.md §6.1, §6.2`.
- **BR-007-02 (Cửa vào từ chối Booking - Đã chốt theo Spec 6.1/6.2):** Chủ thiết bị được quyền từ chối yêu cầu khi Booking đang ở trạng thái REQUESTED. Khi từ chối: Booking → CANCELLED; khoản cọc HOLD phải được ghi nhận chuyển sang RELEASE hoàn trả 100% cho người thuê; `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` khoảng ngày đăng ký được tự giải phóng trở lại. Nguồn: `gearloop_day02_spec.md §6.2, §6.3`.
- **BR-007-03 (Thời hạn chờ duyệt và trạng thái EXPIRED - `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`):** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Thời hạn tối đa để Chủ thiết bị phản hồi yêu cầu thuê là 24 giờ kể từ thời điểm tạo yêu cầu. Nguồn benchmark: `tmp/bench/bench_cancel.md` — Airbnb (https://www.airbnb.com/help/article/28) và Getaround (https://getaround-assets.getaround.com/legal/2026-05-31/20260531_EU_TOS_EN.pdf). Nếu quá 24h, yêu cầu được coi là hết hạn (trạng thái đề xuất: EXPIRED); cọc tự động RELEASE và Owner không thể duyệt tiếp. *Lưu ý:* Trạng thái EXPIRED, mốc 24h và việc tự mở lại lịch là đề xuất chính sách, chưa có trong tập trạng thái cứng của Spec Day 02 gốc; benchmark cũng không thống nhất về việc lịch tự mở hay Owner phải mở thủ công.
- **BR-007-04 (Quyền kiểm soát duyệt - Đã chốt):** Chỉ có Chủ thiết bị sở hữu món đồ trong đơn mới có quyền duyệt hoặc từ chối yêu cầu thuê tương ứng. Nguồn: `gearloop_architecture_blueprint.md §6`.
- **BR-007-05 (Phân định ranh giới từ chối và Owner hủy sau duyệt - Đã chốt & Đề xuất):** Hành vi từ chối tại US-007 diễn ra khi Booking là REQUESTED, không làm phát sinh phạt hay strike cho Owner. Ngược lại, nếu Owner hủy sau khi đã CONFIRMED, giao dịch tuân theo quy tắc E-R5 (thuộc US-008): hoàn cọc + voucher có điều kiện + strike cho chủ; `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` phạt tiền Owner 10% nếu hủy ≥24h hoặc 30% nếu hủy <24h trước giờ nhận (tính trên tiền thuê, không phải cọc). Nguồn benchmark: `tmp/bench/bench_cancel.md` (Turo, Getaround, Fat Llama/Hygglo; phần Fat Llama là chính sách lịch sử, không phải chuẩn hiện hành). `[CẦN XÁC NHẬN]` Người nhận voucher và định nghĩa điều kiện sử dụng voucher chưa được hồ sơ chốt.

### 6. Validation & Error Handling
- Thao tác duyệt/từ chối trên booking không phải REQUESTED: Chặn và trả về mã lỗi `ERR-USR-009`.
- `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Duyệt booking đã hết hạn 24h: Chặn và trả về mã lỗi `ERR-USR-015` sau khi nhóm chốt cơ chế hết hạn.
- Sai vai trò hoặc không phải chủ sở hữu thiết bị: Chặn và trả về mã lỗi `ERR-USR-008`.
- Xung đột cập nhật dữ liệu đồng thời (race condition): Trả về `ERR-SYS-002`.
- Lỗi xử lý giao dịch nội bộ: Trả về `ERR-SYS-001`.

### 7. Permissions & Preconditions
- **Vai trò thực hiện:** OWNER.
- **Mối quan hệ:** Phải là chủ thiết bị của món đồ gắn với Booking.
- **Trạng thái Booking:** Bắt buộc là REQUESTED.

### 8. Dependencies & References
- **Phụ thuộc story nền:** US-005 (Renter đặt thuê → Booking REQUESTED + cọc HOLD), US-006 (Nhận thông báo NTF-001).
- **Tác động đến story:** US-008 (Hủy lượt thuê), US-009 (Xử lý giải phóng cọc RELEASE), US-010 (Xác nhận nhận đồ khi đã CONFIRMED).
- **Tài liệu tham chiếu:** `gearloop_day02_spec.md` (§6.1, §6.2), `local://shared_contract.md §3, §7a, §8`.

### 9. Out of Scope
- Tự động duyệt đơn đặt thuê không cần người duyệt (Instant Booking / Book instantly) trong phiên bản này.
- Thương lượng lại giá hoặc thay đổi khung ngày trực tiếp trên yêu cầu thuê (theo E-R7: không tự sửa lịch sau khi đặt/duyệt).

---


---

## US-008: Hủy lượt thuê chưa bắt đầu

### 0. Khối thông tin định danh (Metadata)
- **Mã User Story:** US-008
- **Tên User Story:** Hủy lượt thuê chưa bắt đầu
- **Vai trò chính:** Người thuê (Renter)
- **Mức độ ưu tiên (MoSCoW):** Must have
- **Sprint dự kiến:** Sprint 2
- **Trạng thái:** Chưa làm
- **Quy tắc nghiệp vụ tham chiếu:** E-R2 (sổ cái cọc append-only, RELEASE cọc), E-R5 (Owner hủy: hoàn 100% cọc + voucher + strike), E-R7 (không xóa lịch sử giao dịch), BR-008-01, BR-008-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, BR-008-03, BR-008-04 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`

### 1. Tiêu đề (Title)
US-008: Hủy lượt thuê trước thời điểm nhận đồ (trước PICKED_UP), cập nhật trạng thái CANCELLED, hoàn cọc trung gian và áp dụng chính sách xử lý tiền thuê theo mốc thời gian.

### 2. Đang xây dựng khả năng gì?
Cho phép Renter (hoặc Owner theo quy định) hủy một lượt thuê chưa bắt đầu (ở trạng thái REQUESTED hoặc CONFIRMED), tự động giải phóng lịch trống cho thiết bị, hoàn trả tiền cọc đang HOLD trong sổ cái cọc, áp dụng mức hoàn tiền thuê theo mốc thời gian quy định và gửi thông báo xác nhận cho các bên liên quan.

### 3. User Story (Nguyên văn)
> Là Renter, tôi muốn hủy lượt thuê của tôi trước khi nhận đồ, để giải phóng kế hoạch và lịch của hai bên, nhận lại cọc theo quy định.

### 4. Tiêu chí chấp nhận (Acceptance Criteria - AC)
- **AC-008-01 (Happy Path - Renter hủy khi yêu cầu chưa được duyệt REQUESTED):**
  - **Given:** Booking B của Renter R đang ở trạng thái REQUESTED, kèm một dòng cọc HOLD trị giá 300.000 đ;
  - **When:** Renter R chọn hành động hủy lượt thuê trước khi Owner duyệt;
  - **Then:** Booking B chuyển trạng thái thành CANCELLED; hệ thống tự động ghi một dòng DepositTransaction loại RELEASE hoàn trả toàn bộ 300.000 đ cọc; tiền thuê chưa bị trừ; khung ngày của Item được giải phóng; phát sự kiện thông báo NTF-005 cho Owner (theo E-R2, BR-008-01).
- **AC-008-02 (Happy Path / Proposal - Renter hủy trước giờ nhận > 48h) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:**
  - **Given:** Booking B đã CONFIRMED, thời điểm nhận đồ dự kiến còn hơn 48 giờ; cọc đang giữ là HOLD 400.000 đ;
  - **When:** Renter R chọn hành động hủy lượt thuê;
  - **Then:** Trạng thái Booking B chuyển sang CANCELLED; hệ thống ghi nhận hoàn trả 100% tiền thuê cho Renter; tự động ghi một dòng DepositTransaction loại RELEASE 400.000 đ hoàn trả 100% tiền cọc; giải phóng khung ngày bận; phát thông báo NTF-005 cho Owner (theo benchmark Getaround, BR-008-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`).
- **AC-008-03 (Alternative / Proposal - Renter hủy muộn trong vòng $\le$ 48h trước giờ nhận) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:**
  - **Given:** Booking B đã CONFIRMED, thời điểm nhận đồ dự kiến còn $\le$ 48 giờ (nhưng chưa đến giờ nhận đồ); tổng tiền thuê là 1.000.000 đ, cọc đang giữ là HOLD 300.000 đ;
  - **When:** Renter R chọn hành động hủy lượt thuê;
  - **Then:** Hệ thống hiển thị cảnh báo chính sách phạt hủy muộn theo mã ERR-USR-021; khi Renter xác nhận hủy, Booking B chuyển sang CANCELLED; Renter được hoàn 50% tiền thuê (500.000 đ), 50% tiền thuê còn lại giữ làm phí bồi hoàn cho Owner; tiền cọc HOLD 300.000 đ được hoàn trả đầy đủ bằng một dòng DepositTransaction loại RELEASE 300.000 đ (tiền cọc tách biệt với tiền phạt thuê); giải phóng khung ngày; phát thông báo NTF-005 cho Owner (theo benchmark Getaround chính thức, BR-008-02 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`).
- **AC-008-04 (Exception - Chặn hủy khi lượt thuê đã bắt đầu PICKED_UP trở đi):**
  - **Given:** Booking B đã hoàn thành bước nhận đồ và đang ở trạng thái PICKED_UP (hoặc RETURNED, CLOSED, RESOLVED);
  - **When:** Renter R chọn thao tác hủy lượt thuê;
  - **Then:** Hệ thống từ chối thực hiện, không thay đổi trạng thái booking, không ghi nhận dòng tiền mới trong sổ cọc và thông báo lỗi theo mã ERR-USR-007 (theo Day02 spec §6.2, E-R3, BR-008-03).
- **AC-008-05 (Exception - Người dùng khác cố tình hủy booking không phải của mình):**
  - **Given:** Booking B thuộc về Renter R1;
  - **When:** Renter R2 gửi yêu cầu hủy Booking B;
  - **Then:** Hệ thống từ chối; Booking và cọc không đổi, trả `ERR-USR-008` (BR-008-01, BR-008-03).
- **AC-008-06 (Happy Path / Sourced - Owner hủy lượt thuê đã xác nhận CONFIRMED):**
  - **Given:** Booking B đã ở trạng thái CONFIRMED trước giờ nhận đồ;
  - **When:** Owner chọn hành động hủy lượt đặt theo E-R5;
  - **Then:** Booking chuyển sang CANCELLED; Renter nhận lại 100% tiền thuê và RELEASE 100% cọc, nhận voucher có điều kiện; Owner có một strike; NTF-006 gửi tới Renter (E-R5, BR-008-04).
- **AC-008-07 (Proposal - Phạt bổ sung đối với Owner hủy sát giờ) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:**
  - **Given:** Booking B đã CONFIRMED; Owner hủy trước giờ nhận dưới 24 giờ;
  - **When:** Hủy được xử lý;
  - **Then:** Nếu nhóm duyệt đề xuất, ngoài hoàn tiền thuê và RELEASE cọc theo E-R5, ghi nhận phí 30% tiền thuê (hoặc 10% nếu hủy từ 24 giờ trở lên); chưa áp dụng khi chưa được phê duyệt (E-R5, BR-008-04).

### 5. Quy tắc nghiệp vụ (Business Rules)
- **BR-008-01 (Giới hạn trạng thái được phép hủy):** Lượt thuê chỉ được phép hủy khi đang ở trạng thái REQUESTED hoặc CONFIRMED (tức là trước khi diễn ra bước bàn giao thiết bị PICKED_UP). Sau khi đã PICKED_UP, giao dịch không thể hủy mà chỉ có thể đóng phiên qua trả đồ hoặc khiếu nại (Nguồn: Day02 spec §6.2, E-R3, E-R7).
- **BR-008-02 (Chính sách hoàn tiền khi Renter hủy) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`:**
  - Hủy khi booking đang REQUESTED: Hoàn 100% tiền thuê (nếu có thu trước) + RELEASE 100% tiền cọc HOLD.
  - Hủy khi booking CONFIRMED trước giờ nhận > 48 giờ: Hoàn 100% tiền thuê + RELEASE 100% tiền cọc HOLD.
  - Hủy khi booking CONFIRMED trước giờ nhận $\le$ 48 giờ: Hoàn 50% tiền thuê, giữ lại 50% tiền thuê làm phí hủy; tiền cọc HOLD vẫn được RELEASE 100% (không cấn trừ cọc vào tiền phạt thuê để giữ tính minh bạch của sổ cọc append-only).
  - Hủy sau giờ nhận: Không áp dụng hoàn tiền thuê (0%); nếu không đến nhận đồ, xử lý theo luồng vắng mặt/no-show.
  *(Căn cứ benchmark: Getaround Help Center "Cancellation policy" — hoàn 100% nếu >48h, hoàn 50% nếu <48h, 0% sau giờ bắt đầu. Lưu ý: Tỷ lệ phần trăm này áp dụng trên tiền thuê, không phải tỷ lệ trừ trên cọc).*
- **BR-008-03 (Bảo toàn lịch sử giao dịch - Append-only):** Khi hủy lượt thuê, bản ghi Booking không được xóa vật lý khỏi cơ sở dữ liệu mà chỉ chuyển trạng thái sang CANCELLED để phục vụ đối soát, thống kê và quản trị (Nguồn: E-R7, blueprint §3).
- **BR-008-04 (Quyền hủy của Owner và chế tài bồi thường):** Chủ đồ có quyền hủy lượt thuê đã CONFIRMED trước giờ nhận đồ. Khi Owner hủy: Renter bắt buộc nhận lại 100% tiền thuê và 100% tiền cọc RELEASE; đồng thời Renter nhận voucher giảm giá có điều kiện nghiêm ngặt và Owner bị ghi nhận strike (Nguồn: E-R5, Workshop 1 C2/C4). Tỷ lệ phạt bổ sung đối với Owner (<24h: 30%, $\ge$24h: 10% tiền thuê) là `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` dựa trên benchmark Fat Llama/Turo.

### 6. Xác thực dữ liệu & Xử lý lỗi (Validation & Error Handling)
- **Kiểm tra trạng thái nghiệp vụ:**
  - Trạng thái Booking phải là `REQUESTED` hoặc `CONFIRMED`.
  - Người thực hiện phải là `RENTER` sở hữu Booking đó (hoặc `OWNER` sở hữu Item của Booking theo luồng E-R5).
- **Danh mục lỗi chuẩn:**
  - `ERR-USR-007`: "Lượt thuê đã bắt đầu, không thể hủy. Vui lòng liên hệ hỗ trợ."
  - `ERR-USR-008`: "Bạn không có quyền thực hiện thao tác này."
  - `ERR-USR-021`: "Bạn hủy trong vòng 48 giờ trước giờ nhận. Chỉ 50% tiền thuê được hoàn." (Cảnh báo xác nhận trước khi hủy).
  - `ERR-SYS-001`: "Hệ thống gặp sự cố. Vui lòng thử lại sau. Mã lỗi: ERR-SYS-001."

### 7. Phân quyền & Điều kiện tiên quyết (Permissions & Preconditions)
- **Phân quyền (RBAC):** RENTER có quyền hủy Booking của chính mình; OWNER có quyền hủy Booking CONFIRMED trên Item của mình theo E-R5; ADMIN có quyền can thiệp hủy vì lý do an toàn sàn.
- **Điều kiện tiên quyết:** Booking đang ở trạng thái REQUESTED hoặc CONFIRMED; chưa phát sinh biên bản ConditionReport loại PICKUP hoàn thành.

### 8. Phụ thuộc & Tài liệu tham chiếu (Dependencies & References)
- **Phụ thuộc story:** Phụ thuộc US-005 (đã tạo Booking và HOLD cọc), US-007 (duyệt booking CONFIRMED), US-009 (thực hiện bút toán RELEASE cọc trong sổ cái).
- **Tài liệu tham chiếu:** `gearloop_user_stories.md` (US-008), `gearloop_day02_spec.md` (§6.1, §6.2), `gearloop_architecture_blueprint.md` (§3, §6), `wb4_gearloop/BusinessRules.md` (E-R2, E-R5, E-R7), `tmp/bench/bench_cancel.md` (benchmark Getaround, Airbnb, Fat Llama/Hygglo, Turo).

### 9. Ngoài phạm vi (Out of Scope)
- Hủy lượt thuê sau khi hai bên đã ký biên bản bàn giao nhận đồ (trạng thái PICKED_UP trở đi).
- Đổi lịch thuê sang khung ngày khác mà không hủy (vi phạm E-R7; người dùng phải hủy và tạo lượt đặt mới).
- Quy đổi voucher đền bù thành tiền mặt rút ra tài khoản ngân hàng (Workshop 1 C4 cấm quy đổi tiền mặt để chống gian lận farm voucher).
- Tính năng tự động phát offer cho người đang chờ trong danh sách (thuộc gói mở rộng WDR - WB4, không nằm trong 13 story nền).

---


---

## 2. US-009: Giữ & xử lý cọc trung gian

### 0. Metadata block
- **Story ID:** US-009
- **Tên:** Giữ & xử lý cọc trung gian
- **Vai trò:** System
- **MoSCoW:** Must
- **Sprint:** Sprint 2–3
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R2, E-R4, E-R5, BR-009-01, BR-009-02, BR-009-03, BR-009-04 [ĐỀ XUẤT], BR-009-05 [ĐỀ XUẤT], BR-009-06 [ĐỀ XUẤT], BR-009-07, BR-009-08, BR-009-09, BR-009-10 [CẦN XÁC NHẬN]

### 1. Title
US-009 — Giữ & xử lý cọc trung gian

### 2. Đang xây dựng khả năng gì?
Quản lý tự động và toàn vẹn trọn vẹn vòng đời của khoản tiền cọc (DepositTransaction) trong mỗi lượt thuê thông qua sổ cái chỉ ghi thêm (append-only ledger): tự động giữ cọc (HOLD) khi tạo lượt thuê, tự động hoàn trả toàn bộ (RELEASE) khi kết thúc bình thường hoặc bị hủy hợp lệ, và thực hiện khấu trừ (DEDUCT) kèm hoàn phần còn lại theo phán quyết phân xử của Quản trị viên, đảm bảo cam kết tài chính an toàn giữa hai bên giao dịch.

### 3. User Story
"Là System, tôi muốn quản lý trọn vòng đời cọc của từng lượt thuê: tạo khi đặt, giữ trong phiên, hoàn hoặc trừ đúng thời điểm, để mỗi giao dịch có bảo đảm tài chính, hai bên tin tưởng sàn mà không cần bên thứ ba"

### 4. Acceptance Criteria (AC)

- **AC-009-01 (Happy Path — Tạo bản ghi giữ cọc HOLD khi phát sinh yêu cầu thuê mới):**
  - **Given:** Một tin đăng thiết bị có tỷ lệ cọc đang niêm yết (nằm trong dải quy định của tin đăng, ví dụ: 30% `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` theo ví dụ tại spec 6.2/US2, hoặc dải 20%–50% `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`);
  - **When:** Người thuê chọn hành động đặt thuê thành công theo US-005 cho một khung ngày không trùng lịch (E-R1) và lượt thuê được khởi tạo ở trạng thái REQUESTED;
  - **Then:** Hệ thống tự động tạo một bản ghi cọc mới loại HOLD trong sổ cái cọc (DepositTransaction) với số tiền tính bằng: (giá thuê mỗi ngày × số ngày thuê × tỷ lệ cọc niêm yết tại thời điểm đặt); bản ghi cọc gắn chặt với mã lượt thuê, lưu dấu thời gian tạo, và không cho phép chỉnh sửa. **[CẦN XÁC NHẬN — Phụ lục D, Q1]** Cơ sở tính % cọc trong công thức này là **tổng tiền thuê** (theo ví dụ spec US2: 600.000 đ/ngày × 2 ngày × 30% = 360.000 đ), trong khi dải 20%–50% ở spec 6.2 nêu theo **giá trị kê khai** — hai cơ sở chưa thống nhất, chưa tự quyết.
  - **Rule:** E-R2, BR-009-01.

- **AC-009-02 (Happy Path — Tự động hoàn cọc RELEASE 100% sau 48 giờ kể từ khi trả đồ không có khiếu nại):**
  - **Given:** Một lượt thuê đang ở trạng thái RETURNED (đã hoàn thành biên bản bàn giao trả đồ theo E-R3, E-R6), có bản ghi cọc ban đầu loại HOLD, và trong vòng 48 giờ kể từ thời điểm trả đồ không phát sinh khiếu nại (Dispute) nào được mở (hồ sơ **không** định nghĩa cửa sổ mở khiếu nại — mốc 48h của E-R4 chỉ quy định điều kiện tự hoàn cọc; xem Phụ lục D, Q4);
  - **When:** Cơ chế đối soát khi truy vấn (reconciliation-on-read theo Blueprint §7) hoặc đồng hồ hệ thống ghi nhận thời điểm hiện tại đã vượt mốc 48 giờ kể từ lúc trả đồ (RETURNED);
  - **Then:** Hệ thống tự động tạo một bản ghi cọc mới loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu, chuyển trạng thái lượt thuê từ RETURNED sang CLOSED, và phát sinh thông báo sự kiện hoàn cọc NTF-009 gửi đến Người thuê và Chủ thiết bị;
  - **Rule:** E-R4, BR-009-02, BR-009-10.

- **AC-009-03 (Alternative — Hoàn cọc toàn bộ RELEASE khi Chủ thiết bị từ chối yêu cầu thuê):**
  - **Given:** Một lượt thuê đang ở trạng thái REQUESTED và đã có bản ghi cọc loại HOLD;
  - **When:** Chủ thiết bị chọn hành động từ chối yêu cầu thuê theo US-007 (lượt thuê chuyển trạng thái sang CANCELLED);
  - **Then:** Hệ thống tự động tạo một bản ghi cọc mới loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu để giải phóng cọc cho Người thuê, đảm bảo không giữ tiền khi giao dịch không thành;
  - **Rule:** E-R2, BR-009-03.

- **AC-009-04 (Timeout / Proposal — Tự động hoàn cọc RELEASE khi yêu cầu thuê hết hạn 24 giờ chờ duyệt):**
  - **Given:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT: Dựa trên benchmark Airbnb 24h và Getaround 24h]` Một lượt thuê đang ở trạng thái REQUESTED đã có bản ghi cọc loại HOLD, nhưng Chủ thiết bị không thực hiện duyệt hoặc từ chối trong vòng 24 giờ kể từ thời điểm gửi yêu cầu;
  - **When:** Cơ chế đối soát khi truy vấn (reconciliation-on-read) hoặc đồng hồ hệ thống phát hiện thời gian chờ duyệt đã vượt quá 24 giờ;
  - **Then:** Hệ thống tự động chuyển trạng thái lượt thuê thành EXPIRED (hoặc CANCELLED theo mô hình trạng thái cơ sở) `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, tự động tạo bản ghi cọc loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu, tự động giải phóng khung lịch của thiết bị `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, và phát sinh thông báo sự kiện hết hạn NTF-004 gửi đến cả Người thuê và Chủ thiết bị;
  - **Rule:** BR-009-04 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` (Nguồn benchmark: Airbnb Help Center Article 28; Getaround EU Terms 2026).

- **AC-009-05 (Alternative / Proposal — Hoàn cọc toàn bộ RELEASE khi Người thuê hủy trước giờ nhận trên 48 giờ):**
  - **Given:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT: Dựa trên benchmark Getaround]` Một lượt thuê ở trạng thái CONFIRMED (đã có HOLD), và thời điểm Người thuê thực hiện hủy cách giờ nhận thiết bị lớn hơn 48 giờ (> 48h);
  - **When:** Người thuê chọn hành động hủy lượt thuê theo US-008 (lượt thuê chuyển sang CANCELLED);
  - **Then:** Hệ thống tự động tạo bản ghi cọc loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu; đồng thời chính sách tài chính ghi nhận hoàn 100% tiền thuê cho Người thuê (lưu ý: tỷ lệ 100% hoàn này áp dụng trên tiền thuê, tiền cọc được giải phóng toàn bộ);
  - **Rule:** E-R2, BR-009-05 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` (Nguồn benchmark: Getaround Help Center Article 77ae2d7092b0).

- **AC-009-06 (Alternative / Proposal — Hoàn cọc toàn bộ RELEASE và phạt tiền thuê khi Người thuê hủy muộn trong vòng 48 giờ trước giờ nhận):**
  - **Given:** `[ĐỀ XUẤT — CẦN NHÓM CHỐT: Dựa trên benchmark Getaround]` Một lượt thuê ở trạng thái CONFIRMED (đã có HOLD), và thời điểm Người thuê thực hiện hủy nằm trong vòng 48 giờ trước giờ nhận thiết bị (≤ 48h và trước thời điểm nhận đồ);
  - **When:** Người thuê chọn xác nhận hành động hủy lượt thuê theo US-008 sau khi đã nhận thông tin cảnh báo phạt theo mã lỗi đề xuất ERR-USR-021 (lượt thuê chuyển sang CANCELLED);
  - **Then:** Hệ thống tự động tạo bản ghi cọc loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu (tiền cọc không bị cấn trừ phạt); đồng thời chính sách phạt áp dụng thu 50% tiền thuê và hoàn 50% tiền thuê còn lại cho Người thuê (lưu ý phân biệt: khoản phạt 50% chỉ tính trên tiền thuê, tuyệt đối không trừ vào cọc);
  - **Rule:** E-R2, BR-009-06 `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` (Nguồn benchmark: Getaround Help Center Article 77ae2d7092b0; cảnh báo ERR-USR-021).

- **AC-009-07 (Alternative — Hoàn cọc toàn bộ RELEASE khi Chủ thiết bị hủy sau khi đã xác nhận theo E-R5):**
  - **Given:** Một lượt thuê đang ở trạng thái CONFIRMED (đã có bản ghi HOLD);
  - **When:** Chủ thiết bị chọn hành động hủy lượt thuê trước giờ nhận thiết bị theo quy tắc E-R5 và US-008 (lượt thuê chuyển sang CANCELLED);
  - **Then:** Hệ thống tự động tạo bản ghi cọc loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu để hoàn trả đầy đủ cho Người thuê; đồng thời hệ thống ghi nhận hoàn 100% tiền thuê cho Người thuê, cấp một phiếu ưu đãi thuê có điều kiện (voucher) cho Người thuê, và ghi nhận một điểm phạt vi phạm (strike) đối với Chủ thiết bị theo E-R5 (mọi mức phí phạt tiền mặt 10%/30% tính trên tiền thuê đối với Chủ thiết bị là `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` dựa trên tham chiếu Turo Policy và Fat Llama US Terms lịch sử);
  - **Rule:** E-R5, BR-009-07.

- **AC-009-08 (Flow — Khấu trừ một phần cọc DEDUCT và hoàn phần cọc còn lại RELEASE khi Quản trị viên phân xử khiếu nại):**
  - **Given:** Một lượt thuê đang có khiếu nại (Dispute) ở trạng thái OPEN hoặc UNDER_REVIEW, có biên bản nhận và trả đồ kèm hình ảnh (E-R3, E-R6), và có bản ghi cọc ban đầu loại HOLD;
  - **When:** Quản trị viên đưa ra quyết định phân xử chính thức theo US-012 chấp thuận bồi thường hư hỏng với tỷ lệ khấu trừ P% (với 0% < P < 100%, hoặc P = 100%);
  - **Then:** Hệ thống ghi nhận đầy đủ dấu vết quyết định của Quản trị viên (gồm định danh Quản trị viên thực hiện, thời điểm phân xử, căn cứ/lý do nghiệp vụ, và tỷ lệ trừ cọc P%); tự động tạo bản ghi cọc loại DEDUCT với số tiền bằng (P% × HOLD); nếu P < 100%, hệ thống tự động tạo tiếp bản ghi cọc loại RELEASE với số tiền bằng ((100 - P)% × HOLD) để hoàn phần còn lại cho Người thuê; bảo đảm tổng số tiền (DEDUCT + RELEASE) đúng bằng số tiền HOLD ban đầu; và chuyển trạng thái lượt thuê sang RESOLVED;
  - **Rule:** E-R2, BR-009-08, BR-009-09.

- **AC-009-09 (Flow — Hoàn cọc toàn bộ RELEASE khi Quản trị viên bác bỏ khiếu nại hư hỏng):**
  - **Given:** Một lượt thuê đang có khiếu nại (Dispute) ở trạng thái chờ phân xử, và có bản ghi cọc ban đầu loại HOLD;
  - **When:** Quản trị viên đưa ra quyết định phân xử bác bỏ khiếu nại (do bằng chứng không đầy đủ hoặc hư hỏng không thuộc trách nhiệm Người thuê) tương đương tỷ lệ trừ cọc 0% (US-012);
  - **Then:** Hệ thống ghi nhận dấu vết quyết định của Quản trị viên (định danh Quản trị viên, thời điểm, lý do); tự động tạo bản ghi cọc loại RELEASE với số tiền bằng đúng 100% số tiền HOLD ban đầu để hoàn trả cho Người thuê; không tạo bản ghi DEDUCT nào; và chuyển trạng thái lượt thuê sang RESOLVED;
  - **Rule:** E-R2, BR-009-08, BR-009-09.

- **AC-009-10 (Exception / Invariant — Bảo toàn tính bất biến của sổ cái cọc: chỉ ghi thêm, không vượt trần HOLD):**
  - **Given:** Một lượt thuê đã có các bản ghi cọc trong sổ cái (DepositTransaction);
  - **When:** Phát sinh bất kỳ yêu cầu nào từ người dùng, quản trị viên hoặc tiến trình nội bộ nhằm chỉnh sửa (Update) hoặc xóa bỏ (Delete) một bản ghi cọc đã có, hoặc tạo thêm giao dịch cọc khiến tổng số tiền (tổng các bản ghi RELEASE + tổng các bản ghi DEDUCT) vượt quá số tiền HOLD ban đầu của lượt thuê;
  - **Then:** Hệ thống từ chối thực hiện yêu cầu, chặn đứng hành vi sửa/xóa dữ liệu sổ cái, bảo toàn bất biến nghiệp vụ, và phản hồi lỗi hệ thống theo mã ERR-SYS-001;
  - **Rule:** E-R2, BR-009-09.

- **AC-009-11 (Conflict / Race — Xử lý xung đột tương tranh khi giải phóng cọc hoặc phân xử):**
  - **Given:** Một lượt thuê ở trạng thái RETURNED đang chuẩn bị kích hoạt tự động hoàn cọc theo thời gian (48h), hoặc đang có yêu cầu phân xử đồng thời từ Quản trị viên;
  - **When:** Hai tiến trình (tiến trình tự động hoàn cọc 48h và thao tác phân xử của Quản trị viên, hoặc hai yêu cầu xử lý cọc đồng thời) cố gắng ghi nhận vào sổ cái cọc cùng lúc;
  - **Then:** Chỉ một lần xử lý được ghi nhận; Booking và số tiền cọc chỉ thay đổi theo quyết định đầu tiên. Thao tác đến sau bị từ chối với `ERR-SYS-002`, không tạo thêm RELEASE/DEDUCT (E-R2, BR-009-09).
  - **Rule:** E-R2, BR-009-09, ERR-SYS-002.

### 5. Business Rules
- **BR-009-01 (Tạo bản ghi giữ cọc HOLD khi phát sinh lượt thuê):** Khi một lượt thuê được tạo ở trạng thái REQUESTED, hệ thống tự động tính số tiền cọc = (giá thuê/ngày × số ngày thuê × tỷ lệ cọc snapshot của tin đăng) và ghi một bản ghi HOLD duy nhất vào sổ cái. Nguồn: E-R2, Spec 6.2 (B2, A1). [ĐÃ CHỐT]
- **BR-009-02 (Tự động hoàn cọc 48 giờ sau khi trả đồ không khiếu nại):** Nếu sau 48 giờ kể từ thời điểm lượt thuê chuyển sang RETURNED mà không có khiếu nại (Dispute) nào được mở, hệ thống tự động ghi bản ghi RELEASE 100% số tiền HOLD và chuyển lượt thuê sang CLOSED. Cơ chế thực thi áp dụng đối soát khi truy vấn (reconciliation-on-read). Nguồn: E-R4, Spec US4, Blueprint §3, §7. [ĐÃ CHỐT]
- **BR-009-03 (Hoàn cọc khi Chủ thiết bị từ chối yêu cầu):** Khi lượt thuê REQUESTED bị Chủ thiết bị từ chối (chuyển sang CANCELLED), hệ thống tự động tạo bản ghi RELEASE 100% số tiền HOLD. Nguồn: E-R2, Spec US3. [ĐÃ CHỐT]
- **BR-009-04 (Tự động hoàn cọc khi yêu cầu thuê hết hạn 24 giờ chờ duyệt):** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Nếu sau 24 giờ kể từ thời điểm gửi yêu cầu mà Chủ thiết bị không duyệt hoặc từ chối, yêu cầu thuê hết hạn (chuyển sang EXPIRED hoặc CANCELLED), hệ thống tự động tạo bản ghi RELEASE 100% số tiền HOLD, giải phóng lịch của thiết bị, và phát thông báo NTF-004. Nguồn tham chiếu benchmark: Airbnb Help Center (24h response window), Getaround EU Terms 2026. [ĐỀ XUẤT — CẦN NHÓM CHỐT]
- **BR-009-05 (Hoàn cọc khi Người thuê hủy sớm trước 48 giờ):** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Nếu Người thuê hủy lượt thuê trước giờ nhận thiết bị lớn hơn 48 giờ (> 48h), hệ thống tạo bản ghi RELEASE 100% số tiền HOLD và hoàn 100% tiền thuê. Nguồn tham chiếu benchmark: Getaround Help Center (hủy >48h hoàn 100%). [ĐỀ XUẤT — CẦN NHÓM CHỐT]
- **BR-009-06 (Hoàn cọc và phạt tiền thuê khi Người thuê hủy muộn trong vòng 48 giờ):** `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` Nếu Người thuê hủy lượt thuê trong vòng 48 giờ trước giờ nhận thiết bị (≤ 48h), hệ thống tạo bản ghi RELEASE 100% số tiền HOLD (cọc không bị cấn trừ phạt); chính sách phạt giữ lại 50% tiền thuê và chỉ hoàn 50% tiền thuê còn lại. Nguồn tham chiếu benchmark: Getaround Help Center (hủy <48h hoàn 50% tiền thuê). Lưu ý: Khoản phạt tính trên tiền thuê, không phải cọc. [ĐỀ XUẤT — CẦN NHÓM CHỐT]
- **BR-009-07 (Hoàn cọc khi Chủ thiết bị hủy lượt thuê đã xác nhận theo E-R5):** Khi Chủ thiết bị hủy lượt thuê đã CONFIRMED trước giờ nhận, hệ thống tạo bản ghi RELEASE 100% số tiền HOLD, hoàn 100% tiền thuê cho Người thuê, cấp voucher thuê có điều kiện cho Người thuê, và ghi nhận 1 điểm phạt vi phạm (strike) cho Chủ thiết bị. Các mức phạt tiền mặt 10% (nếu hủy ≥ 24h) hoặc 30% (nếu hủy < 24h) tính trên tiền thuê là đề xuất từ benchmark (Turo Cancellation Policy, Fat Llama US Terms lịch sử). Nguồn: E-R5, Workshop 1 B4 [C2][C4]. [ĐÃ CHỐT CƠ CHẾ HOÀN CỌC + VOUCHER + STRIKE; ĐỀ XUẤT THAM SỐ PHẠT TIỀN THUÊ]
- **BR-009-08 (Thẩm quyền phân xử khấu trừ và giải phóng cọc):** Chỉ có Quản trị viên (ADMIN) thông qua quy trình phân xử khiếu nại (US-012) mới có thẩm quyền kích hoạt tạo bản ghi DEDUCT (từ 0% đến 100% HOLD) và RELEASE phần còn lại. Mọi thao tác này phải lưu vết định danh Quản trị viên, thời điểm, lý do nghiệp vụ và chuyển lượt thuê sang RESOLVED. Nguồn: E-R2, Spec US5, Shared Contract §4. [ĐÃ CHỐT]
- **BR-009-09 (Bất biến sổ cái cọc: Append-only và Bảo toàn giá trị):** Sổ cái cọc (DepositTransaction) là bất biến chỉ ghi thêm (append-only), tuyệt đối không hỗ trợ thao tác cập nhật (Update) hoặc xóa (Delete). Tại mọi thời điểm, tổng số tiền của các bản ghi RELEASE và DEDUCT trên một lượt thuê không bao giờ được vượt quá số tiền HOLD ban đầu: `Tổng(RELEASE) + Tổng(DEDUCT) <= HOLD`. Nguồn: E-R2, Spec 6.2, Blueprint §3, §5. [ĐÃ CHỐT]
- **BR-009-10 (Cửa sổ mở khiếu nại hư hỏng — CHƯA CÓ TRONG HỒ SƠ):** E-R4 chỉ quy định "48h sau RETURNED không khiếu nại thì tự RELEASE"; hồ sơ **không** định nghĩa hạn chót mở khiếu nại. Đề xuất (suy luận đồng bộ với E-R4) là cửa sổ 48h kể từ RETURNED — `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`, xem Phụ lục D, Q4. Hành vi chắc chắn: đã có Dispute thì không tự hoàn cọc (E-R4). Nguồn: suy luận từ E-R4 / Spec US4. [CẦN XÁC NHẬN]

### 6. Validation & Error Handling
- Kiểm tra tính hợp lệ của số tiền cọc: Tỷ lệ cọc phải nằm trong phạm vi cho phép (từ 20% đến 50% giá trị quy định `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`), số tiền HOLD phải lớn hơn 0; nếu vi phạm trả mã lỗi `ERR-USR-006` hoặc `ERR-USR-014`.
- Thao tác hủy khi lượt thuê đã chuyển sang PICKED_UP trở đi → Bị chặn với mã lỗi `ERR-USR-007`.
- Người thuê thực hiện hủy trong vòng 48 giờ trước giờ nhận → Hệ thống đưa ra cảnh báo phạt tiền thuê với mã lỗi `ERR-USR-021` trước khi người dùng xác nhận.
- Cố tình mở Dispute khi đã quá thời hạn mở khiếu nại → Bị từ chối với mã lỗi `ERR-USR-012`. `[CẦN XÁC NHẬN]` mốc 48h chỉ là đề xuất, áp dụng nếu nhóm chốt cửa sổ mở khiếu nại (Phụ lục D, Q4).
- Phân xử tranh chấp với tỷ lệ khấu trừ ngoài khoảng 0%–100% → Bị từ chối với mã lỗi `ERR-USR-019`.
- Bất kỳ thao tác nào vi phạm bất biến sổ cái cọc (sửa/xóa dòng tiền, tổng RELEASE + DEDUCT > HOLD) → Bị từ chối xử lý với mã lỗi `ERR-SYS-001`.
- Xung đột dữ liệu khi ghi nhận giao dịch cọc đồng thời (race condition) → Bị chặn an toàn với mã lỗi `ERR-SYS-002`.

### 7. Permissions & Preconditions
- **Vai trò được thực hiện:**
  - SYSTEM: Tự động tạo bản ghi HOLD khi tạo lượt thuê; tự động tạo bản ghi RELEASE khi hết hạn 24h, khi kết thúc 48h không khiếu nại, khi chủ từ chối yêu cầu, hoặc khi hai bên hủy hợp lệ trước giờ nhận.
  - ADMIN: Kích hoạt tạo bản ghi DEDUCT và RELEASE phần còn lại thông qua phán quyết phân xử tranh chấp (US-012).
  - RENTER / OWNER: Chỉ có quyền đọc (Read) lịch sử cọc của chính lượt thuê của mình; tuyệt đối không có quyền tự kích hoạt dòng tiền cọc.
- **Điều kiện tiên quyết:**
  - Lượt thuê phải có bản ghi HOLD hợp lệ trước khi thực hiện bất kỳ giao dịch RELEASE hoặc DEDUCT nào.
  - Lượt thuê phải ở trạng thái RETURNED và có biên bản kiểm tra tình trạng trả đồ (ConditionReport RETURN) hợp lệ trước khi kích hoạt bộ đếm 48 giờ hoàn cọc.

### 8. Dependencies & References
- **Phụ thuộc:**
  - US-005 (Đặt thuê theo khung ngày: tạo lượt thuê REQUESTED kích hoạt HOLD).
  - US-007 (Duyệt / từ chối yêu cầu thuê: từ chối kích hoạt RELEASE).
  - US-008 (Hủy lượt thuê chưa bắt đầu: Renter hoặc Owner hủy kích hoạt RELEASE).
  - US-010 (Xác nhận nhận đồ: hoàn thành biên bản PICKUP, chuyển sang PICKED_UP).
  - US-011 (Xác nhận trả đồ: hoàn thành biên bản RETURN, chuyển sang RETURNED, bắt đầu đếm 48h).
  - US-012 (Phân xử tranh chấp hư hỏng: Admin quyết định DEDUCT/RELEASE).
- **Tham chiếu:**
  - `gearloop_user_stories.md`: US-009.
  - `gearloop_day02_spec.md`: §6.1, §6.2 (CRUD matrix, core rules), US2, US4, US5.
  - `gearloop_architecture_blueprint.md`: §3 (Domain model), §5 (Data & Prisma conventions), §7 (Testing strategy, reconciliation-on-read).
  - `wb4_gearloop/BusinessRules.md`: E-R2, E-R4, E-R5, E-R6.
  - `local://shared_contract.md`: §3 (Trạng thái Booking), §4 (Trạng thái DepositTransaction), §7a, §7b, §8 (Sự kiện thông báo NTF-004, NTF-009).
  - Policy Benchmark Register: `tmp/bench/bench_deposit.md`, `tmp/bench/bench_cancel.md`, `tmp/bench/bench_dispute.md`.

### 9. Out of Scope
- Tích hợp cổng thanh toán trực tuyến thực tế (Payment Service Provider / cổng thẻ Visa, Mastercard, ví điện tử) hoặc xử lý tiền mặt thật trong giai đoạn này (hệ thống xử lý ghi nhận sổ cái mô phỏng / authorization hold nghiệp vụ).
- Cơ chế giải ngân tiền thuê (payout) cho Chủ thiết bị vào tài khoản ngân hàng.
- Chính sách bảo hiểm thiết bị bên thứ ba (bảo hiểm hư hỏng, mất cắp vượt trần cọc).
- Tự động trừ tiền phạt hủy của Chủ thiết bị qua tài khoản ngân hàng (vi phạm chỉ ghi nhận điểm phạt strike và lưu vết trong hệ thống).

---

## 3. Bảng tổng hợp câu hỏi quyết định và tham số đề xuất cho nhóm chốt

| # | Vấn đề / Tham số | Giá trị đề xuất | Nguồn căn cứ benchmark | Trạng thái hiện tại | Câu hỏi cụ thể cần nhóm chốt |
|---|---|---|---|---|---|
| 1 | Mức cọc niêm yết của tin đăng | Cố định 30% giá trị lượt thuê (hoặc dải 20%–50% do Owner chọn) | Spec US2 nêu ví dụ 30%; Spec 6.2 ghi dải 20%–50% [GIẢ ĐỊNH - cần kiểm chứng]; Shopify B2B dùng ví dụ 20%; Turo dùng mức cố định $200–$750; Fat Llama không bắt buộc cọc thường. | `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` | Nhóm chốt mức cọc là một tỷ lệ cố định 30% toàn sàn để đơn giản hóa giao dịch, hay cho phép Chủ thiết bị tự chọn trong dải 20%–50% khi đăng tin? |
| 2 | Thời gian chờ Chủ thiết bị duyệt yêu cầu thuê | 24 giờ kể từ thời điểm gửi yêu cầu; hết hạn thì tự động hoàn cọc và mở lại lịch | Airbnb Help Center Article 28 (24h response window); Getaround EU Terms 2026 (24h to accept/refuse). | `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` | Nhóm chốt thời gian chờ duyệt là 24 giờ hay 12 giờ (như bản nháp sớm)? Trạng thái kết thúc của yêu cầu hết hạn nên là mã riêng `EXPIRED` hay gộp chung vào `CANCELLED`? Khung ngày của thiết bị có tự động mở lại không? |
| 3 | Cửa sổ thời gian mở khiếu nại tranh chấp (Dispute window) | 48 giờ kể từ thời điểm xác nhận trả đồ (RETURNED) | Hồ sơ gốc GearLoop chỉ quy định E-R4 (48h sau RETURNED tự RELEASE nếu không Dispute). Turo cho phép báo damage trong 24h; Getaround cho 5 ngày làm việc; Airbnb cho 14 ngày. | `[CẦN XÁC NHẬN]` | Nhóm xác nhận cửa sổ mở khiếu nại chính thức là đúng 48 giờ (khớp với bộ đếm tự hoàn cọc E-R4), hay có tách biệt thời hạn khiếu nại riêng với thời hạn tự hoàn cọc? |
| 4 | Chính sách phạt khi Người thuê hủy muộn | Hủy >48h trước giờ nhận: hoàn 100% tiền thuê; Hủy ≤48h trước giờ nhận: hoàn 50% tiền thuê (phạt 50% tiền thuê); Sau giờ nhận: không hoàn tiền thuê (0%). Tiền cọc luôn hoàn 100% khi hủy trước nhận đồ. | Getaround Help Center Article 77ae2d7092b0 chính thức (>48h: 100%; <48h: 50%; sau giờ nhận: 0%); Hygglo/Fat Llama blog nội bộ đối chiếu. | `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` | Nhóm chốt áp dụng khung phạt hủy 3 mốc của Getaround (>48h / ≤48h / sau giờ nhận) tính trên tiền thuê hay có khung phạt khác? Xác nhận tiền cọc (HOLD) luôn được hoàn 100% khi hủy trước giờ nhận, không bị cấn trừ phạt? |
| 5 | Chế tài xử lý khi Chủ thiết bị hủy lượt thuê đã xác nhận | Hoàn 100% tiền thuê + hoàn 100% cọc cho Renter + tặng voucher thuê có điều kiện + ghi nhận 1 strike cho Owner. Đề xuất phạt Owner: 10% nếu hủy ≥24h, 30% nếu hủy <24h. | E-R5 chốt hoàn cọc + voucher + strike. Tham số phạt tiền mặt tham chiếu từ Turo ($25/$50) và Fat Llama US Terms lịch sử (30% Hire Fee). | `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` (phần % phạt tiền) | Nhóm xác nhận ngoài chế tài strike và voucher theo E-R5, sàn có áp dụng thu phí phạt tiền mặt 10%/30% tính trên tiền thuê đối với Chủ thiết bị hay không? |
# GearLoop — Đặc tả User Story: Cụm Quản trị viên (Admin)

Tài liệu đặc tả chi tiết cho 2 User Story thuộc vai trò Quản trị viên (**Admin**): **US-012** và **US-013**.
Căn cứ xây dựng:
- Khung User Story nền: `gearloop_user_stories.md`
- Đặc tả yêu cầu & CRUD matrix: `gearloop_day02_spec.md` (§6.1–6.3, US1–US5)
- Kiến trúc miền & ma trận phân quyền RBAC: `gearloop_architecture_blueprint.md` (§3, §6, §7)
- Quy tắc nghiệp vụ cốt lõi: `wb4_gearloop/BusinessRules.md` (E-R1..E-R9)
- Bản đăng ký chuẩn đối sánh: Policy Benchmark Register (`tmp/bench/bench_dispute.md`, `tmp/bench/bench_deposit.md`, `tmp/bench/bench_cancel.md`)
- Hợp đồng dùng chung: `local://shared_contract.md`

---


---

## US-010: Xác nhận nhận đồ

### 0. Khối thông tin định danh (Metadata)
- **Mã User Story:** US-010
- **Tên User Story:** Xác nhận nhận đồ
- **Vai trò chính:** Người thuê (Renter)
- **Mức độ ưu tiên (MoSCoW):** Must have
- **Sprint dự kiến:** Sprint 3
- **Trạng thái:** Chưa làm
- **Quy tắc nghiệp vụ tham chiếu:** E-R3 (ConditionReport là cổng bắt buộc trước khi đổi trạng thái), E-R6 (biên bản checklist kép + ảnh có dấu thời gian + mã một lần tại điểm giao nhận; không lưu vị trí), E-R8 (bàn giao tại PickupPoint), BR-010-01, BR-010-02, BR-010-03, BR-010-04

### 1. Tiêu đề (Title)
US-010: Xác nhận bàn giao nhận đồ, hoàn thành biên bản kiểm tra tình trạng (ConditionReport PICKUP) kèm ảnh chụp thực tế có dấu thời gian và chuyển trạng thái lượt thuê sang PICKED_UP.

### 2. Đang xây dựng khả năng gì?
Cung cấp khả năng cho Renter kiểm tra thực tế thiết bị tại điểm nhận đồ PickupPoint, hoàn thành checklist tình trạng bắt buộc (đánh giá từng mục OK/NOT_OK, ghi chú khuyết tật có sẵn, tải ảnh minh chứng có dấu thời gian) và thực hiện xác nhận nhận thiết bị để kích hoạt mốc bắt đầu trách nhiệm bảo quản và chuyển trạng thái Booking từ CONFIRMED sang PICKED_UP.

### 3. User Story (Nguyên văn)
> Là Renter, tôi muốn xác nhận tình trạng sản phẩm và nhận được thiết bị khi bắt đầu phiên thuê, để trách nhiệm bảo quản và thời hạn thuê được ghi nhận chính xác từ đúng thời điểm.

### 4. Tiêu chí chấp nhận (Acceptance Criteria - AC)
- **AC-010-01 (Happy Path - Hoàn thành ConditionReport và xác nhận nhận đồ thành công):**
  - **Given:** Booking B đang ở trạng thái CONFIRMED; hai bên gặp nhau tại điểm PickupPoint đã đăng ký;
  - **When:** Renter R mở biên bản nhận đồ, đánh giá đầy đủ tất cả các hạng mục trong checklist (thân máy, ống kính, cảm biến, phụ kiện kèm theo) ở mức OK hoặc NOT_OK kèm ghi chú cụ thể, tải lên tối thiểu 01 ảnh chụp thực tế có gắn dấu thời gian (timestamp), và chọn hành động xác nhận nhận đồ;
  - **Then:** Hệ thống lưu biên bản ConditionReport loại PICKUP gắn với Booking B; chuyển trạng thái Booking B từ CONFIRMED sang PICKED_UP; ghi nhận thời điểm bắt đầu phiên thuê thực tế; phát sự kiện thông báo NTF-007 tới Owner (theo E-R3, E-R6, BR-010-01, BR-010-02).
- **AC-010-02 (Exception - Chặn chuyển trạng thái khi chưa hoàn thành ConditionReport):**
  - **Given:** Booking B đang ở trạng thái CONFIRMED;
  - **When:** Renter R chọn hành động xác nhận nhận đồ nhưng bỏ trống một số hạng mục checklist hoặc chưa tải ảnh thực tế minh chứng;
  - **Then:** Hệ thống từ chối cập nhật trạng thái Booking B, giữ nguyên trạng thái CONFIRMED, không lưu biên bản chưa đầy đủ và thông báo lỗi theo mã ERR-USR-013 (theo E-R3, BR-010-01).
- **AC-010-03 (Exception - Xác nhận nhận đồ khi Booking chưa CONFIRMED):**
  - **Given:** Booking B đang REQUESTED hoặc CANCELLED;
  - **When:** Renter chọn hành động xác nhận nhận đồ;
  - **Then:** Không tạo ConditionReport, Booking giữ nguyên trạng thái và hệ thống trả `ERR-USR-016` (BR-010-01).
- **AC-010-04 (Alternative - Renter phát hiện thiết bị có lỗi sẵn và ghi nhận vào checklist):**
  - **Given:** Tại thời điểm nhận đồ, Renter phát hiện thiết bị có vết trầy xước trên thân máy nhưng đồng ý tiếp tục thuê;
  - **When:** Renter đánh dấu mục thân máy là NOT_OK, nhập ghi chú chi tiết mô tả vị trí vết xước và chụp ảnh cận cảnh vết xước tải lên biên bản trước khi bấm xác nhận;
  - **Then:** Biên bản ConditionReport PICKUP được lưu lại đầy đủ các bằng chứng này; Booking chuyển sang PICKED_UP; dữ liệu này trở thành căn cứ pháp lý đối trừ khi trả đồ để bảo vệ Renter không bị trừ cọc oan (theo E-R6, BR-010-03).
- **AC-010-05 (Exception - Người dùng không phải Renter của booking thực hiện xác nhận):**
  - **Given:** Booking B thuộc Renter R1;
  - **When:** Người dùng khác gửi yêu cầu tạo ConditionReport hoặc xác nhận nhận đồ cho B;
  - **Then:** Hệ thống từ chối, không đổi Booking/biên bản, trả `ERR-USR-008` (BR-010-01, BR-010-04).
- **AC-010-06 (Exception - Ảnh tải lên không hợp lệ hoặc thiếu dữ liệu thời gian):**
  - **Given:** Renter đang hoàn thành ConditionReport PICKUP;
  - **When:** Renter tải lên tệp ảnh bị lỗi định dạng, vượt quá dung lượng quy định hoặc ảnh không có thông tin dấu thời gian xác thực;
  - **Then:** Hệ thống từ chối nhận ảnh, yêu cầu chụp/tải lại ảnh hợp lệ và không cho phép bấm xác nhận nhận đồ.

### 5. Quy tắc nghiệp vụ (Business Rules)
- **BR-010-01 (Cổng bắt buộc ConditionReport - State Transition Gate):** Booking tuyệt đối không được chuyển từ CONFIRMED sang PICKED_UP nếu chưa tồn tại một bản ghi ConditionReport loại PICKUP hợp lệ với đầy đủ các mục checklist đã đánh giá và có ảnh thực tế đính kèm (Nguồn: E-R3, Day02 spec §6.2, blueprint §3).
- **BR-010-02 (Chuẩn mực bằng chứng nhận bàn giao):** Bằng chứng nhận đồ bắt buộc bao gồm: danh sách kiểm tra từng bộ phận (OK/NOT_OK), ghi chú bằng chữ về khuyết tật (nếu có), ảnh chụp hiện trạng có dấu thời gian (timestamp). Quá trình này không được phép thu thập hay lưu trữ tọa độ vị trí địa lý hoặc thói quen sử dụng cá nhân của Renter (Nguồn: E-R6, Workshop 1 C3).
- **BR-010-03 (Bảo toàn bằng chứng không sửa đổi):** ConditionReport sau khi Renter đã xác nhận thành công sẽ bị khóa ở chế độ chỉ đọc (read-only), không ai (kể cả Owner hay Admin) được quyền chỉnh sửa hoặc xóa bỏ nội dung biên bản này (Nguồn: E-R6, E-R7, blueprint §3).
- **BR-010-04 (Địa điểm bàn giao tại PickupPoint):** Việc kiểm tra và nhận đồ phải được thực hiện tại đúng địa điểm PickupPoint đã chốt trong Booking để bảo đảm tính chuẩn hóa và an toàn (Nguồn: E-R8).

### 6. Xác thực dữ liệu & Xử lý lỗi (Validation & Error Handling)
- **Kiểm tra dữ liệu ConditionReport:**
  - `booking_id`: Bắt buộc, tồn tại trong hệ thống.
  - `report_type`: Bắt buộc, giá trị phải là `PICKUP`.
  - `checklist_items`: Bắt buộc, danh sách các mục kiểm tra; mỗi mục phải có giá trị trạng thái thuộc `{OK, NOT_OK}`.
  - `notes`: Chuỗi văn bản, bắt buộc nhập giải trình nếu có mục chọn `NOT_OK`.
  - `photos`: Danh sách đường dẫn ảnh thực tế, tối thiểu 01 ảnh, tối đa 10 ảnh, định dạng chuẩn (JPG, PNG).
- **Danh mục mã lỗi chuẩn:**
  - `ERR-USR-008`: "Bạn không có quyền thực hiện thao tác này."
  - `ERR-USR-013`: "Vui lòng hoàn thành biên bản tình trạng thiết bị trước khi tiếp tục."
  - `ERR-USR-016`: "Lượt thuê chưa được chủ đồ xác nhận."
  - `ERR-SYS-001`: "Hệ thống gặp sự cố. Vui lòng thử lại sau. Mã lỗi: ERR-SYS-001."

### 7. Phân quyền & Điều kiện tiên quyết (Permissions & Preconditions)
- **Phân quyền (RBAC):** Chỉ RENTER là người tạo Booking mới có quyền điền ConditionReport PICKUP và bấm xác nhận nhận đồ; OWNER và ADMIN chỉ có quyền đọc (view) biên bản này.
- **Điều kiện tiên quyết:**
  - Booking phải đang ở đúng trạng thái CONFIRMED.
  - Chưa từng có ConditionReport loại PICKUP nào được tạo cho Booking này trước đó.

### 8. Phụ thuộc & Tài liệu tham chiếu (Dependencies & References)
- **Phụ thuộc story:** Phụ thuộc US-005 (đã tạo Booking), US-007 (Owner đã duyệt CONFIRMED), US-011 (Owner xác nhận trả đồ kế tiếp sau phiên thuê).
- **Tài liệu tham chiếu:** `gearloop_user_stories.md` (US-010), `gearloop_day02_spec.md` (§6.1, §6.2, §6.3 US3), `gearloop_architecture_blueprint.md` (§3, §6, §7), `wb4_gearloop/BusinessRules.md` (E-R3, E-R6, E-R8), `tmp/bench/bench_deposit.md` (mô hình kiểm tra bắt buộc của Getaround và Turo).

### 9. Ngoài phạm vi (Out of Scope)
- Biên bản kiểm tra lúc trả đồ (ConditionReport RETURN - thuộc phạm vi US-011 của Owner).
- Phân xử tranh chấp hoặc khiếu nại phát sinh sau khi nhận đồ (thuộc US-012).
- Sử dụng công nghệ nhận diện hình ảnh AI/ML để tự động quét lỗi hoặc so sánh vết xước trên ảnh (cam kết Zero-AI theo blueprint §1).
- Thu thập định vị GPS để tự động kiểm tra xem Renter có đang đứng tại PickupPoint hay không (bị cấm tuyệt đối theo ràng buộc E-R6).

---


---

## US-011: Xác nhận trả đồ

### 0. Metadata block
- **Story ID:** US-011
- **Tên:** Xác nhận trả đồ
- **Vai trò:** Owner
- **Mức ưu tiên (MoSCoW):** Must
- **Sprint dự kiến:** Sprint 3
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R2, E-R3, E-R4, E-R6, E-R8, BR-011-01, BR-011-02, BR-011-03, BR-011-04 `[CẦN XÁC NHẬN]`, BR-011-05

### 1. Title
Xác nhận hoàn tất trả thiết bị và lập biên bản kiểm tra tình trạng kết thúc phiên

### 2. Đang xây dựng khả năng gì?
Cho phép Chủ thiết bị xác nhận đã nhận lại thiết bị từ Người thuê tại điểm hẹn, bắt buộc hoàn thành biên bản tình trạng trả đồ (ConditionReport RETURN kèm ảnh có dấu thời gian), ghi nhận chuyển trạng thái lượt thuê sang RETURNED và kích hoạt quy trình xử lý cọc cuối kỳ.

### 3. User Story
Là Owner, tôi muốn xác nhận đã nhận lại thiết bị sau khi phiên thuê kết thúc, để phiên được đóng đúng thực tế và cọc được kích hoạt xử lý.

### 4. Acceptance Criteria (AC)

- **AC-011-01 (Happy path - Xác nhận trả đồ thành công kèm ConditionReport hợp lệ):**  
  *Gắn rule:* E-R3, E-R6, BR-011-01, BR-011-02.  
  - **Given:** Lượt thuê đang ở trạng thái PICKED_UP; hai bên tiến hành bàn giao lại thiết bị tại điểm giao nhận do S3 quản lý theo E-R8.  
  - **When:** Chủ thiết bị chọn hành động hoàn thành biên bản trả đồ (ConditionReport loại RETURN) bao gồm: đánh giá từng hạng mục kiểm tra (OK hoặc NOT_OK), nhập ghi chú hiện trạng, tải lên ít nhất 01 ảnh thực tế có dấu thời gian ghi nhận lúc nhận lại đồ; sau đó chọn xác nhận đã nhận lại thiết bị.  
  - **Then:** Hệ thống ghi nhận ConditionReport (RETURN); trạng thái Booking chính thức chuyển từ PICKED_UP sang RETURNED; phát sinh thông báo `NTF-008` gửi tới Người thuê; mốc thời gian RETURNED được ghi nhận để US-009 áp dụng quy tắc tự RELEASE sau 48h nếu không có khiếu nại (E-R4).

- **AC-011-02 (Gate/Exception - Chặn xác nhận trả đồ khi chưa hoàn thành ConditionReport):**  
  *Gắn rule:* E-R3, BR-011-02.  
  - **Given:** Lượt thuê đang ở trạng thái PICKED_UP.  
  - **When:** Chủ thiết bị chọn hành động xác nhận đã nhận lại đồ nhưng chưa điền đầy đủ danh mục kiểm tra hoặc chưa tải lên ảnh bằng chứng của biên bản trả đồ.  
  - **Then:** Hệ thống chặn việc chuyển trạng thái Booking, giữ nguyên trạng thái PICKED_UP, và hiển thị thông báo lỗi `ERR-USR-013`.

- **AC-011-03 (Exception - Xác nhận khi booking không ở trạng thái PICKED_UP):**  
  *Gắn rule:* BR-011-01.  
  - **Given:** Lượt thuê đang ở trạng thái CONFIRMED (chưa nhận), REQUESTED, hoặc đã ở trạng thái RETURNED / CLOSED.  
  - **When:** Chủ thiết bị cố gắng gửi yêu cầu xác nhận trả đồ.  
  - **Then:** Hệ thống từ chối thao tác và hiển thị mã lỗi `ERR-USR-017`.

- **AC-011-04 (Alternative - Ghi nhận thiết bị có dấu hiệu hư hỏng tại biên bản trả):**  
  *Gắn rule:* E-R3, E-R6, BR-011-03.  
  - **Given:** Thiết bị khi nhận lại phát sinh trầy xước, nứt vỡ hoặc thiếu phụ kiện so với biên bản lúc nhận (PICKUP).  
  - **When:** Chủ thiết bị lập ConditionReport (RETURN) đánh dấu các hạng mục hư hại là NOT_OK, mô tả rõ trong phần ghi chú và đính kèm ảnh cận cảnh dấu vết hư hỏng; sau đó chọn hành động xác nhận trả đồ.  
  - **Then:** Hệ thống vẫn chuyển trạng thái Booking sang RETURNED; toàn bộ dữ liệu biên bản và hình ảnh hư hại được lưu trữ nguyên vẹn để làm cơ sở đối chiếu chứng cứ cho việc mở tranh chấp Dispute (thuộc US-012).

- **AC-011-05 (Timeout/Linkage - Ghi nhận mốc 48h tự hoàn cọc):**  
  *Gắn rule:* E-R4, BR-011-04 `[CẦN XÁC NHẬN]`.  
  - **Given:** Booking vừa chuyển sang trạng thái RETURNED thành công tại thời điểm T.  
  - **When:** Hệ thống ghi nhận mốc thời gian hoàn tất trả đồ.  
  - **Then:** Hệ thống ghi nhận mốc T để US-009 áp dụng quy tắc đã chốt: 48h sau T, nếu không có tranh chấp (Dispute), cọc được tự động ghi nhận RELEASE. `[CẦN XÁC NHẬN]` Việc coi 48h đồng thời là hạn chót mở khiếu nại chưa được hồ sơ xác nhận và cần nhóm chốt riêng.

- **AC-011-06 (Security/Permission - Thao tác không đúng quyền sở hữu):**  
  *Gắn rule:* BR-011-05.  
  - **Given:** Người dùng đang đăng nhập với vai trò RENTER hoặc là một Chủ thiết bị khác.  
  - **When:** Người này cố gắng gửi yêu cầu xác nhận trả đồ hoặc tạo biên bản RETURN cho Booking này.  
  - **Then:** Hệ thống từ chối quyền truy cập và trả về mã lỗi `ERR-USR-008`.

### 5. Business Rules
- **BR-011-01 (Điều kiện tiên quyết của trạng thái trả đồ - Đã chốt theo Spec 6.1/6.2):** Hành động xác nhận trả đồ chỉ có thể thực hiện khi Booking đang ở chính xác trạng thái PICKED_UP. Khi thực hiện thành công, trạng thái Booking bắt buộc chuyển sang RETURNED. Nguồn: `gearloop_day02_spec.md §6.1, §6.2`.
- **BR-011-02 (Cổng kiểm soát bắt buộc ConditionReport - Đã chốt theo E-R3):** Không một Booking nào được phép chuyển trạng thái từ PICKED_UP sang RETURNED nếu chưa có biên bản tình trạng (ConditionReport) loại RETURN được hoàn thành đầy đủ các hạng mục và đính kèm ít nhất 01 hình ảnh thực tế. Hình ảnh phải có dấu thời gian; bằng chứng nhận–trả phải có ở cả hai mốc PICKUP và RETURN theo E-R6 và yêu cầu chính sách trong shared contract. Nguồn: `E-R3`, `E-R6`, `gearloop_day02_spec.md §6.2`.
- **BR-011-03 (Bằng chứng nhận trả và tính nguyên vẹn dữ liệu - Đã chốt theo E-R6):** Biên bản nhận trả lưu trữ các hạng mục kiểm tra, mô tả văn bản và ảnh chụp thực tế có gắn dấu thời gian. Biên bản sau khi xác nhận không được phép sửa đổi hay xóa bỏ để phục vụ đối chiếu công bằng. Nguồn: `E-R6`.
- **BR-011-04 (Kích hoạt bộ đếm thời gian xử lý cọc 48h - Đã chốt theo E-R4; cửa sổ Dispute `[CẦN XÁC NHẬN]`):** 48h sau thời điểm Booking chuyển sang RETURNED, nếu không phát sinh khiếu nại (Dispute), cọc sẽ tự động được giải phóng (RELEASE) bởi hệ thống theo E-R4. `[CẦN XÁC NHẬN]` Quy định ngầm định coi 48h này đồng thời là hạn chót mở khiếu nại của Owner (Dispute window), cần nhóm xác nhận chính thức xem sau 48h Owner có còn quyền mở tranh chấp ngoại lệ hay không. Nguồn benchmark đối chiếu: `tmp/bench/bench_dispute.md` (Turo 24h; Getaround 5–7 ngày làm việc; không có chuẩn P2P thống nhất), đối chiếu với mốc 48h đã chốt trong E-R4.
- **BR-011-05 (Thẩm quyền xác nhận - Đã chốt):** Chỉ có Chủ thiết bị sở hữu thiết bị cho thuê mới có thẩm quyền lập biên bản RETURN và chọn hành động xác nhận đã nhận lại đồ. Nguồn: `gearloop_architecture_blueprint.md §6`.

### 6. Validation & Error Handling
- Xác nhận trả đồ khi chưa hoàn tất ConditionReport hoặc thiếu ảnh: Chặn và trả về mã lỗi `ERR-USR-013`.
- Xác nhận khi booking không phải trạng thái PICKED_UP: Chặn và trả về mã lỗi `ERR-USR-017`.
- Người dùng không phải Owner của đơn thuê thực hiện: Chặn và trả về mã lỗi `ERR-USR-008`.
- Lỗi kết nối hoặc cập nhật trạng thái hệ thống: Trả về `ERR-SYS-001`.

### 7. Permissions & Preconditions
- **Vai trò thực hiện:** OWNER.
- **Mối quan hệ:** Phải là chủ sở hữu của thiết bị trong Booking.
- **Trạng thái Booking:** Bắt buộc là PICKED_UP.

### 8. Dependencies & References
- **Phụ thuộc story nền:** US-010 (Renter xác nhận nhận đồ → Booking PICKED_UP).
- **Làm tiền đề cho story:** US-009 (Tự động hoàn cọc 48h sau RETURNED nếu không có Dispute), US-012 (Admin phân xử tranh chấp hư hỏng nếu có khiếu nại dựa trên đối chiếu 2 ConditionReport).
- **Tài liệu tham chiếu:** `gearloop_day02_spec.md` (§6.1, §6.2), `gearloop_architecture_blueprint.md` (§3, §6), `wb4_gearloop/BusinessRules.md` (E-R2, E-R3, E-R4, E-R6, E-R8).

### 9. Out of Scope
- Tự động trừ tiền phạt hay cấn trừ cọc ngay tại thời điểm trả đồ (việc trừ cọc bắt buộc phải qua quy trình phân xử Dispute do Admin quyết định theo E-R2).
- Giám định kỹ thuật chuyên sâu bằng thiết bị phòng lab hoặc bên thứ ba độc lập tại chỗ.
- Đánh giá sao (Rating/Review) giữa hai bên sau khi kết thúc chuyến thuê (thuộc phạm vi Should/giai đoạn sau).

---


---

## US-003: Quản lý tin đã đăng

### 0. Metadata block
- **Story ID:** US-003
- **Tên:** Quản lý tin đã đăng
- **Vai trò:** Owner
- **Mức ưu tiên (MoSCoW):** Should
- **Sprint dự kiến:** Sprint 1
- **Trạng thái:** Chưa làm
- **Rule tham chiếu:** E-R1, E-R9, BR-003-01, BR-003-02, BR-003-03, BR-003-04

### 1. Title
Quản lý và điều chỉnh tin cho thuê đã đăng

### 2. Đang xây dựng khả năng gì?
Cho phép Chủ thiết bị cập nhật nội dung mô tả, điều chỉnh giá thuê, cập nhật khung ngày rảnh, hoặc tạm ẩn/bỏ ẩn tin đăng của chính mình nhằm kiểm soát sự sẵn sàng của thiết bị trên sàn. Đây là story ở mức Should.

### 3. User Story
Là Owner, tôi muốn cập nhật hoặc tạm ẩn tin cho thuê của mình, để thông tin trên sàn luôn đúng thực tế và tôi kiểm soát được lịch rảnh của thiết bị.

### 4. Acceptance Criteria (AC)

- **AC-003-01 (Happy path - Xem danh sách tin của chính mình):**  
  *Gắn rule:* BR-003-01.  
  - **Given:** Người dùng đã đăng nhập với vai trò OWNER.  
  - **When:** Chủ thiết bị chọn hành động xem danh sách tin cho thuê của tôi.  
  - **Then:** Hệ thống hiển thị toàn bộ các tin đăng thuộc quyền sở hữu của chính chủ thiết bị đó (bao gồm cả tin đang ở trạng thái OPEN và HIDDEN); không hiển thị tin của chủ khác.

- **AC-003-02 (Happy path - Cập nhật thông tin mô tả và khung ngày rảnh):**  
  *Gắn rule:* BR-003-02, BR-003-03.  
  - **Given:** Tin đăng đang ở trạng thái OPEN hoặc HIDDEN thuộc sở hữu của Owner.  
  - **When:** Chủ thiết bị chọn hành động cập nhật thông tin: chỉnh sửa phần mô tả, thêm mới một khung ngày rảnh trong tương lai.  
  - **Then:** Hệ thống lưu các thay đổi thành công; thông tin mới lập tức có hiệu lực khi người dùng khác xem chi tiết tin.

- **AC-003-03 (Conflict - Sửa giá thuê không ảnh hưởng booking đã tạo):**  
  *Gắn rule:* BR-003-02.  
  - **Given:** Tin đăng có lượt thuê đã được tạo trước đó ở trạng thái REQUESTED hoặc CONFIRMED với giá cũ (ví dụ: 500.000 đồng/ngày).  
  - **When:** Chủ thiết bị chọn hành động cập nhật giá thuê của tin đăng lên mức 600.000 đồng/ngày.  
  - **Then:** Hệ thống cập nhật giá niêm yết của tin đăng thành 600.000 đồng/ngày cho các lượt đặt phát sinh trong tương lai; các lượt đặt cũ (REQUESTED, CONFIRMED) giữ nguyên giá trị 500.000 đồng/ngày và số tiền cọc HOLD ban đầu không bị biến động.

- **AC-003-04 (Happy path - Tạm ẩn tin đăng khi không có booking đang hoạt động):**  
  *Gắn rule:* BR-003-04.  
  - **Given:** Tin đăng thuộc quyền sở hữu của Owner đang ở trạng thái OPEN, và không có bất kỳ lượt thuê nào đang ở trạng thái CONFIRMED hoặc PICKED_UP.  
  - **When:** Chủ thiết bị chọn hành động tạm ẩn tin đăng.  
  - **Then:** Trạng thái tin đăng chuyển từ OPEN sang HIDDEN; tin đăng không còn xuất hiện trên kết quả tìm kiếm của người thuê; hệ thống phản hồi thao tác thành công.

- **AC-003-05 (Exception - Chặn tạm ẩn tin khi có booking CONFIRMED hoặc PICKED_UP):**  
  *Gắn rule:* BR-003-04.  
  - **Given:** Tin đăng đang có ít nhất một lượt thuê ở trạng thái CONFIRMED (đã duyệt, chờ nhận) hoặc PICKED_UP (đang trong phiên thuê).  
  - **When:** Chủ thiết bị chọn hành động tạm ẩn tin đăng.  
  - **Then:** Hệ thống từ chối chuyển trạng thái tin sang HIDDEN, giữ nguyên trạng thái OPEN, và thông báo mã lỗi `ERR-USR-020`.

- **AC-003-06 (Happy path - Mở lại tin đăng đã tạm ẩn):**  
  *Gắn rule:* BR-003-04.  
  - **Given:** Tin đăng của Owner đang ở trạng thái HIDDEN (do Owner tự ẩn, không phải do Admin khóa/ẩn theo E-R9).  
  - **When:** Chủ thiết bị chọn hành động bỏ ẩn (công khai lại) tin đăng.  
  - **Then:** Trạng thái tin đăng chuyển từ HIDDEN sang OPEN; tin xuất hiện trở lại trong danh sách tìm kiếm nếu có khung ngày rảnh hợp lệ.

- **AC-003-07 (Security/Boundary - Thao tác trên tin của chủ khác):**  
  *Gắn rule:* BR-003-01.  
  - **Given:** Chủ thiết bị A đăng nhập vào hệ thống.  
  - **When:** Chủ thiết bị A cố gắng thực hiện hành động sửa đổi thông tin hoặc ẩn tin đăng thuộc quyền sở hữu của Chủ thiết bị B.  
  - **Then:** Hệ thống từ chối yêu cầu và phản hồi mã lỗi `ERR-USR-008`.

- **AC-003-08 (Exception - Tin đăng bị Admin xử lý vi phạm):**  
  *Gắn rule:* E-R9.  
  - **Given:** Tin đăng của Owner đã bị Quản trị viên (Admin) ẩn do vi phạm quy định nền tảng (theo E-R9).  
  - **When:** Chủ thiết bị chọn hành động bỏ ẩn để mở lại tin đăng.  
  - **Then:** Hệ thống từ chối thao tác và giữ nguyên trạng thái bị ẩn bởi Admin; hành động mở lại tin đăng thuộc trách nhiệm quản trị của Admin trong US-013.

### 5. Business Rules
- **BR-003-01 (Phạm vi sở hữu dữ liệu - Đã chốt):** Chủ thiết bị chỉ được phép xem, cập nhật, ẩn các tin đăng do chính mình tạo ra. Nguồn: `gearloop_architecture_blueprint.md §6`.
- **BR-003-02 (Tính bất biến giá trị giao dịch của booking - Đã chốt theo yêu cầu đặc tả US-003):** Mọi sự thay đổi về giá thuê, tỷ lệ cọc hoặc mô tả trên tin đăng chỉ áp dụng cho các yêu cầu thuê tạo mới sau thời điểm lưu; tuyệt đối không hồi tố (retroactive) làm thay đổi tổng tiền thuê hay số tiền cọc HOLD của các Booking đã khởi tạo. Nguồn: yêu cầu đặc tả cho US-003; phù hợp E-R7 về nguyên tắc không sửa lịch/giao dịch đã tạo.
- **BR-003-03 (Bảo toàn lịch rảnh không xung đột - `[CẦN XÁC NHẬN]`):** `[CẦN XÁC NHẬN]` Khi sửa đổi/xóa bớt khung ngày rảnh, Chủ thiết bị không được phép xóa hoặc thu hẹp khoảng ngày đã có lượt đặt ở trạng thái CONFIRMED hoặc REQUESTED đang chờ xử lý, trừ khi hủy lượt đặt theo đúng quy trình. Nguồn suy luận: `E-R1`; cần nhóm xác nhận cách xử lý khung rảnh khi còn booking chưa kết thúc.
- **BR-003-04 (Điều kiện tạm ẩn tin đăng - Đã chốt theo shared contract):** Owner chỉ được chuyển trạng thái tin từ OPEN sang HIDDEN nếu tin đăng không có lượt thuê nào đang ở trạng thái CONFIRMED hoặc PICKED_UP. Nguồn: `local://shared_contract.md §7a` (ERR-USR-020).

### 6. Validation & Error Handling
- Cố gắng tạm ẩn tin khi có booking CONFIRMED hoặc PICKED_UP: Chặn và trả về mã lỗi `ERR-USR-020`.
- Thao tác trên tin của người dùng khác: Chặn và trả về mã lỗi `ERR-USR-008`.
- Thao tác trên tin đang bị Admin ẩn: Chặn; việc mở lại tin do Admin thực hiện trong US-013.
- Cập nhật giá ≤ 0 hoặc cọc ngoài phạm vi: Chặn và trả về mã lỗi `ERR-USR-006` / `ERR-USR-014`.
- Lỗi kết nối hoặc xử lý nội bộ: Trả về `ERR-SYS-001`.

### 7. Permissions & Preconditions
- **Vai trò thực hiện:** OWNER.
- **Mối quan hệ:** Người thực hiện phải là chủ sở hữu của tin đăng.
- **Trạng thái tin:** Tin đăng tồn tại và không bị Admin khóa theo E-R9.

### 8. Dependencies & References
- **Phụ thuộc story nền:** US-001 (Đăng nhập & phân quyền), US-002 (Đăng tin cho thuê).
- **Tương tác với:** US-005 (Đặt thuê), US-007 (Duyệt/từ chối), US-013 (Admin quản trị nội dung).
- **Tài liệu tham chiếu:** `gearloop_day02_spec.md` (§6.2), `gearloop_architecture_blueprint.md` (§6), `local://shared_contract.md`.

### 9. Out of Scope
- Xóa vĩnh viễn (Hard delete) tin đăng (chỉ áp dụng archive / trạng thái HIDDEN nhằm duy trì toàn vẹn dữ liệu lịch sử lượt thuê).
- Đẩy tin ưu tiên / mua gói quảng cáo cho tin đăng (Won't).
- Thiết lập giá thuê linh hoạt tự động theo mùa hoặc ngày cuối tuần (ngoài phạm vi CRUD đơn giản).

---


---

## US-012: Phân xử tranh chấp hư hỏng

### 0. Metadata Block
- **Story ID:** US-012
- **Tên story:** Phân xử tranh chấp hư hỏng
- **Vai trò:** Quản trị viên (Admin)
- **Mức độ ưu tiên (MoSCoW):** Should
- **Sprint dự kiến:** Sprint 3
- **Trạng thái:** Chưa làm
- **Quy tắc tham chiếu:** E-R2, E-R3, E-R4, E-R6, E-R7, BR-012-01, BR-012-02, BR-012-03, BR-012-04, BR-012-05, BR-012-06, BR-012-07, BR-012-08

---

### 1. Title
Phân xử tranh chấp hư hỏng thiết bị và quyết định phân bổ cọc

---

### 2. Đang xây dựng khả năng gì?
Cung cấp khả năng cho Quản trị viên đối chiếu biên bản bàn giao và biên bản trả đồ (kèm ảnh chụp có dấu thời gian) của hai bên để đưa ra phán quyết phân xử khiếu nại công bằng, phân bổ trừ hoặc hoàn trả cọc trên sổ cái và chuyển lượt thuê về trạng thái hoàn tất phân xử.

---

### 3. User Story
> Là Admin, tôi muốn xem khiếu nại kèm bằng chứng của hai bên và đưa ra quyết định phân xử, để tranh chấp được giải quyết công bằng, quyết định là căn cứ xử lý cọc.

---

### 4. Acceptance Criteria (AC)

#### AC-012-01: Tiếp nhận khiếu nại và đối chiếu hai biên bản cạnh nhau (Happy Path)
- **Given:** Lượt thuê ở trạng thái `RETURNED`; Chủ thiết bị hoặc Người thuê đã mở một `Dispute` hợp lệ nên hệ thống đã tạo `NTF-010` cho phía đối diện và Quản trị viên; `Dispute` đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW` và có đủ hai `ConditionReport` mốc `PICKUP` và `RETURN`, mỗi biên bản có ảnh và ghi chú; **[CẦN XÁC NHẬN]** — hồ sơ chưa xác định điều kiện và mốc cuối để mở `Dispute` hợp lệ;
- **When:** Quản trị viên chọn hành động xem xét khiếu nại;
- **Then:** Quản trị viên nhìn thấy hai biên bản tình trạng được trình bày cạnh nhau, gồm ảnh và ghi chú của từng mốc; nếu khiếu nại đang `OPEN`, nó chuyển `OPEN → UNDER_REVIEW`, còn nếu đã `UNDER_REVIEW` thì giữ nguyên; chưa phát sinh giao dịch cọc và chưa phân xử khiếu nại.
- **Rule gắn kèm:** E-R3, E-R6, BR-012-03, BR-012-08

#### AC-012-02: Phân xử chấp thuận một phần khiếu nại — Trừ 40% và hoàn 60% cọc (Happy Path)
- **Given:** Lượt thuê ở trạng thái `RETURNED`, có khoản cọc đang giữ (`DepositTransaction` loại `HOLD`) 360.000 VNĐ; `Dispute` đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW` với đủ hai biên bản và bằng chứng;
- **When:** Quản trị viên đối chiếu bằng chứng, xác nhận thiết bị bị hư hỏng trong phiên thuê và chọn hành động phân xử với tỷ lệ trừ cọc 40% kèm lý do "Phát hiện vết trầy xước sâu trên thấu kính không có trong biên bản lúc nhận";
- **Then:** `Dispute` chuyển `OPEN`/`UNDER_REVIEW → RESOLVED_DEDUCT`, `Booking` chuyển `RETURNED → RESOLVED`; hệ thống tạo dòng `DepositTransaction` loại `DEDUCT` 144.000 VNĐ (40% HOLD) và dòng `DepositTransaction` loại `RELEASE` 216.000 VNĐ (60% phần còn lại), đồng thời phát `NTF-011` kèm phán quyết cho Chủ thiết bị và Người thuê.
- **Rule gắn kèm:** E-R2, BR-012-01, BR-012-02, BR-012-08

#### AC-012-03: Bác khiếu nại do bằng chứng không đủ — Hoàn 100% cọc (Alternative Path)
- **Given:** Lượt thuê ở trạng thái `RETURNED`, có khoản cọc đang giữ (`DepositTransaction` loại `HOLD`) 360.000 VNĐ; `Dispute` đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW`;
- **When:** Quản trị viên đối chiếu bằng chứng và xác nhận bằng chứng không đủ chứng minh thiết bị bị hư hỏng trong phiên thuê (ví dụ vết xước đã có trong ảnh lúc `PICKUP`), chọn hành động bác khiếu nại với tỷ lệ trừ 0% kèm lý do;
- **Then:** `Dispute` chuyển `OPEN`/`UNDER_REVIEW → RESOLVED_RELEASE`, `Booking` chuyển `RETURNED → RESOLVED`; hệ thống tạo dòng `DepositTransaction` loại `RELEASE` 360.000 VNĐ (100% HOLD), không tạo dòng `DEDUCT`, đồng thời phát `NTF-011` kèm phán quyết cho Chủ thiết bị và Người thuê.
- **Rule gắn kèm:** E-R2, BR-012-01, BR-012-02, BR-012-03, BR-012-08

#### AC-012-04: Lưu vết kiểm toán bắt buộc cho phán quyết phân xử (Dấu vết)
- **Given:** `Dispute` đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW` và Quản trị viên đã xác nhận một quyết định phân xử;
- **When:** Hệ thống ghi nhận phán quyết;
- **Then:** `Dispute` chuyển sang trạng thái kết thúc tương ứng và `Booking` chuyển `RETURNED → RESOLVED`; đồng thời hệ thống lưu vết kiểm toán gồm `admin_id`, thời điểm phân xử, lý do và tỷ lệ `DEDUCT` đã chọn; vết kiểm toán không thể sửa hoặc xóa.
- **Rule gắn kèm:** E-R7, BR-012-04

#### AC-012-05: Chặn phân xử khi khiếu nại không ở trạng thái chờ giải quyết (Exception)
- **Given:** `Dispute` đã ở trạng thái kết thúc `RESOLVED_DEDUCT` hoặc `RESOLVED_RELEASE`;
- **When:** Quản trị viên cố gắng chọn hành động phân xử khiếu nại đó;
- **Then:** Hệ thống từ chối thao tác, giữ nguyên trạng thái `Dispute`, `Booking` và sổ cái cọc, đồng thời trả lỗi `ERR-USR-018`.
- **Rule gắn kèm:** BR-012-01, ERR-USR-018

#### AC-012-06: Chặn tỷ lệ phần trăm trừ cọc không hợp lệ (Exception)
- **Given:** `Dispute` đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW`;
- **When:** Quản trị viên nhập tỷ lệ trừ cọc nhỏ hơn 0% hoặc lớn hơn 100% (ví dụ -10% hoặc 150%) rồi chọn hành động phân xử;
- **Then:** Hệ thống chặn thao tác, `Dispute` và `Booking` giữ nguyên trạng thái, không phát sinh giao dịch cọc, đồng thời trả lỗi `ERR-USR-019`.
- **Rule gắn kèm:** BR-012-05, ERR-USR-019

#### AC-012-07: Không tự hoàn cọc khi đã có khiếu nại đang chờ phân xử (Timeout / Thời gian)
- **Given:** Lượt thuê đã ở trạng thái `RETURNED` và tại mốc 48h sau `RETURNED` vẫn tồn tại `Dispute` ở trạng thái `OPEN` hoặc `UNDER_REVIEW`;
- **When:** Hệ thống kiểm tra điều kiện tự hoàn cọc theo E-R4;
- **Then:** Điều kiện “không khiếu nại” không thành lập, nên hệ thống không tạo `DepositTransaction` loại `RELEASE`; `Booking` giữ `RETURNED`, khoản cọc tiếp tục ở `HOLD` và khiếu nại chờ Quản trị viên phân xử.
- **Rule gắn kèm:** E-R4, BR-012-07

#### AC-012-08: Xử lý xung đột khi hai Quản trị viên cùng thao tác (Conflict / Race)
- **Given:** Hai Quản trị viên cùng xem một `Dispute` đang ở trạng thái `OPEN`;
- **When:** Quản trị viên thứ nhất gửi quyết định phân xử thành công trước, sau đó Quản trị viên thứ hai gửi quyết định phân xử;
- **Then:** Quyết định thứ nhất là quyết định có hiệu lực, `Dispute` chuyển sang trạng thái kết thúc và `Booking` chuyển `RETURNED → RESOLVED`; yêu cầu thứ hai bị từ chối với `ERR-USR-018`, không phát sinh thêm giao dịch cọc hoặc `NTF-011`, và không làm thay đổi kết quả của Quản trị viên thứ nhất.
- **Rule gắn kèm:** E-R2, BR-012-01, BR-012-02, BR-012-08

---

### 5. Business Rules (BR)

| Mã Rule | Nội dung quy tắc | Trạng thái / Nguồn |
|---|---|---|
| **E-R2** | Tạo Booking thành công ⇒ `DepositTransaction(HOLD)`; chỉ ADMIN chuyển `RELEASE`/`DEDUCT`; sổ cái append-only, không D | **Quy tắc gốc đã chốt** (`gearloop_day02_spec.md:332`, `wb4_gearloop/BusinessRules.md`) |
| **E-R3** | Booking phải xong `ConditionReport` bắt buộc trước khi đổi trạng thái | **Quy tắc gốc đã chốt** (`wb4_gearloop/BusinessRules.md`) |
| **E-R4** | 48h sau `RETURNED` không khiếu nại ⇒ tự `RELEASE` (đồng hồ mô phỏng, US4) | **Quy tắc gốc đã chốt** (`gearloop_day02_spec.md:342`, `wb4_gearloop/BusinessRules.md`) |
| **E-R6** | Không lưu vị trí/thói quen sử dụng; xác minh bàn giao bằng checklist kép + ảnh dấu thời gian + cặp mã một-lần | **Quy tắc gốc đã chốt** (`wb4_gearloop/BusinessRules.md`) |
| **E-R7** | Người thuê không tự sửa lịch sau khi duyệt; không ai xóa lịch sử giao dịch | **Quy tắc gốc đã chốt** (`wb4_gearloop/BusinessRules.md`) |
| **BR-012-01** | Điều kiện tiên quyết để phân xử: Lượt thuê phải ở trạng thái `RETURNED`, và tồn tại bản ghi `Dispute` ở trạng thái `OPEN` hoặc `UNDER_REVIEW`. Khi phân xử hoàn tất, `Dispute` chuyển sang `RESOLVED_DEDUCT` hoặc `RESOLVED_RELEASE`, đồng thời `Booking` chuyển sang `RESOLVED`. | Quy tắc nghiệp vụ phân xử (`gearloop_day02_spec.md:343`, `gearloop_architecture_blueprint.md:57`) |
| **BR-012-02** | Bất biến sổ cái cọc: Mỗi phán quyết phân xử được ánh xạ thành các dòng giao dịch ghi thêm (append-only) trên `DepositTransaction`; tổng tiền `DEDUCT` + `RELEASE` không được vượt quá số tiền `HOLD` ban đầu. Không xóa hay sửa đổi các dòng đã ghi. | **Quy tắc bất biến sổ cái đã chốt** (`local://shared_contract.md`; `gearloop_day02_spec.md:332`) |
| **BR-012-03** | Căn cứ phân xử đối chiếu biên bản kép: Quản trị viên đưa ra quyết định dựa trên việc so sánh trực diện 2 biên bản `ConditionReport` (bàn giao lúc `PICKUP` và trả đồ lúc `RETURN`) kèm ảnh chụp thực tế có dấu thời gian. Khi bằng chứng không đủ chứng minh thiết bị bị hư hỏng trong phiên thuê, Quản trị viên có thể bác khiếu nại và hoàn 100% cọc. | Quy tắc nghiệp vụ đã chốt (`gearloop_day02_spec.md:343`; E-R3, E-R6; yêu cầu US-012); mô hình quyết định của người trung lập đối sánh tại `tmp/bench/bench_dispute.md` (Hygglo Resolutions Team) |
| **BR-012-04** | Trách nhiệm giải trình và lưu vết: Mọi phán quyết của Quản trị viên bắt buộc phải có nội dung lý do bằng văn bản và lưu lại định danh Quản trị viên (`admin_id`) cùng mốc thời gian thực tế để phục vụ kiểm toán nội bộ. | Quy tắc quản trị hệ thống (`local://shared_contract.md`) |
| **BR-012-05** | Giới hạn tỷ lệ trừ cọc: Tỷ lệ trừ cọc $x\%$ do Quản trị viên chỉ định phải nằm trong đoạn $[0\%, 100\%]$. Số tiền trừ cọc không được vượt quá số tiền cọc `HOLD` hiện hữu của phiên thuê. | **Quy tắc đã chốt** (`local://shared_contract.md` — `ERR-USR-019`; kết quả phân xử deposit-only trong `tmp/bench/bench_dispute.md`) |
| **BR-012-06** | Phân quyền quyết định: Chỉ người dùng có vai trò `ADMIN` mới có quyền truy cập thông tin khiếu nại toàn sàn và ký duyệt phán quyết xử lý cọc. | Ma trận RBAC (`gearloop_architecture_blueprint.md:161`) |
| **BR-012-07** | Quan hệ giữa khiếu nại và bộ đếm tự hoàn: E-R4 quy định 48h sau `RETURNED` **không khiếu nại** thì tự `RELEASE`. Khi đã có `Dispute` ở trạng thái `OPEN` hoặc `UNDER_REVIEW`, điều kiện “không khiếu nại” không thành lập nên hệ thống không tự hoàn; khoản cọc giữ `HOLD` cho tới khi Quản trị viên phân xử. Hồ sơ **không xác định** mốc cuối để mở `Dispute`; không suy ra cửa sổ mở khiếu nại 48h từ E-R4. | **Quy tắc gốc đã chốt** cho quan hệ với E-R4; phần thời hạn mở khiếu nại **không có trong hồ sơ** và cần nhóm chốt |
| **BR-012-08** | Thông báo phân xử: Khi khiếu nại được mở, phát `NTF-010` cho phía đối diện và Quản trị viên; khi Quản trị viên chốt phán quyết, phát `NTF-011` cho Chủ thiết bị và Người thuê. | **Sự kiện thông báo đã chốt** (`local://shared_contract.md`) |

---

### 6. Validation & Error Handling

#### Tiêu chí dữ liệu hợp lệ:
- Định danh `Dispute` phải tồn tại và đang ở trạng thái `OPEN` hoặc `UNDER_REVIEW`.
- Lượt thuê (`Booking`) liên quan phải ở trạng thái `RETURNED`.
- Phải tồn tại đủ 2 biên bản `ConditionReport` gắn với `Booking`: một biên bản lúc `PICKUP` và một biên bản lúc `RETURN`.
- Tỷ lệ trừ cọc $x$ phải thỏa mãn: $0 \le x \le 100$.
- Lý do phân xử bắt buộc phải có nội dung, không được để trống hoặc chỉ chứa khoảng trắng → trả lỗi `ERR-USR-023` (mã do hợp nhất đặc tả cấp mới, Phụ lục B). `[CẦN XÁC NHẬN]` nhóm còn phải chốt độ dài tối thiểu/tối đa của lý do phân xử.

#### Danh mục mã lỗi áp dụng:
- **`ERR-USR-018`**: Khiếu nại không ở trạng thái chờ phân xử; dùng khi Admin thao tác trên `Dispute` đã kết thúc.
- **`ERR-USR-019`**: Tỷ lệ trừ cọc nằm ngoài khoảng 0%–100%.
- **`ERR-USR-008`**: Không đúng vai trò; dùng khi người dùng không phải Admin cố thực hiện phân xử.
- **`ERR-SYS-002`**: Xung đột dữ liệu; dùng khi hệ thống không thể bảo toàn tính duy nhất của quyết định phân xử trong thao tác đồng thời.
- **`ERR-USR-023`**: Lý do phân xử bắt buộc bị bỏ trống hoặc chỉ chứa khoảng trắng. Mã lỗi cấp mới tại Phụ lục B (hợp nhất đặc tả — thay cho phương án dùng lại `ERR-USR-005`, vốn dành cho tạo/sửa tin đăng).

---

### 7. Permissions & Preconditions

#### Phân quyền (Permissions):
- **Vai trò thực hiện:** Chỉ duy nhất vai trò `ADMIN`.
- **Vai trò liên quan được đọc kết quả:** `OWNER` và `RENTER` của lượt thuê tương ứng chỉ được xem kết quả phán quyết, lý do và số tiền cọc được phân bổ sau khi Quản trị viên đã chốt.

#### Điều kiện tiên quyết (Preconditions):
- Người dùng thao tác phải đăng nhập với phiên mang vai trò `ADMIN` còn hiệu lực.
- Lượt thuê đã hoàn thành chu trình nhận đồ và trả đồ trên thực tế, đang ở trạng thái `RETURNED`.
- Tồn tại khiếu nại `Dispute` được mở hợp lệ và đang ở trạng thái chờ (`OPEN` hoặc `UNDER_REVIEW`).
- Hai bên đã hoàn thành biên bản `ConditionReport` (E-R3) kèm hình ảnh ghi nhận hiện trạng.
- Khoản cọc của lượt thuê vẫn đang được giữ trong sổ cái (`DepositTransaction` có dòng `HOLD` chưa bị giải tỏa `RELEASE`).

---

### 8. Dependencies & References

#### Phụ thuộc các User Story khác:
- **US-009 (Giữ & xử lý cọc trung gian):** US-012 là căn cứ nghiệp vụ phát sinh hành động tạo các bản ghi `DEDUCT` và `RELEASE` trên sổ cái tiền cọc.
- **US-010 (Xác nhận nhận đồ):** Cung cấp `ConditionReport` mốc `PICKUP` làm căn cứ hiện trạng ban đầu.
- **US-011 (Xác nhận trả đồ):** Đưa `Booking` vào trạng thái `RETURNED`, cung cấp `ConditionReport` mốc `RETURN` và làm phát sinh mốc 48h theo E-R4. **[CẦN XÁC NHẬN]** — thời điểm cuối hợp lệ để mở `Dispute` không được xác định trong hồ sơ.

#### Tài liệu tham chiếu:
- `local://shared_contract.md`: Thuật ngữ, trạng thái Booking/Dispute/DepositTransaction, danh mục mã lỗi `ERR-USR-018`, `ERR-USR-019`, sự kiện thông báo `NTF-010`, `NTF-011`.
- `gearloop_day02_spec.md`: Mục 6.2 (CRUD matrix), Mục 6.3 (US4, US5).
- `gearloop_architecture_blueprint.md`: §3 (Domain model), §6 (RBAC design), §7 (Testing us5-dispute-resolution).
- `tmp/bench/bench_dispute.md`: Đối sánh chính sách phân xử tranh chấp (Hygglo Resolutions Team, Turo Damage Review, Airbnb Host Damage Protection).

---

### 9. Out of Scope (Cố ý chưa làm)
- Không tích hợp cơ chế bảo hiểm bên thứ ba hoặc bồi thường vượt quá giá trị cọc thực tế đang `HOLD` (bảo đảm phạm vi CRUD MVP deposit-only).
- Không hỗ trợ phân xử nhiều cấp hoặc khiếu nại phúc quyết sau khi Quản trị viên đã chốt phán quyết trong phạm vi story này.
- Không tự động giám định ảnh bằng trí tuệ nhân tạo (AI/ML) — hoàn toàn dựa trên việc đối chiếu thủ công của Quản trị viên con người.
- Không thu phí dịch vụ phân xử tranh chấp đối với các bên.

---


---

## US-013: Quản trị người dùng & tin đăng

### 0. Metadata Block
- **Story ID:** US-013
- **Tên story:** Quản trị người dùng & tin đăng
- **Vai trò:** Quản trị viên (Admin)
- **Mức độ ưu tiên (MoSCoW):** Should
- **Sprint dự kiến:** Sprint 3
- **Trạng thái:** Chưa làm
- **Quy tắc tham chiếu:** E-R7, E-R9, BR-013-01, BR-013-02, BR-013-03, BR-013-04, BR-013-05, BR-013-06

---

### 1. Title
Quản trị nền tảng: Tạm khóa/mở khóa tài khoản người dùng và ẩn/bỏ ẩn tin cho thuê

---

### 2. Đang xây dựng khả năng gì?
Cung cấp khả năng cho Quản trị viên kiểm duyệt và can thiệp bảo vệ môi trường vận hành của sàn giao dịch thông qua việc tạm thời vô hiệu hóa tài khoản vi phạm hoặc ẩn tin đăng thiết bị không phù hợp quy định (mà không xóa dữ liệu vật lý), bảo toàn toàn vẹn lịch sử giao dịch và bảo vệ quyền lợi các bên liên quan.

---

### 3. User Story
> Là Admin, tôi muốn tạm khóa tài khoản vi phạm và ẩn tin đăng không phù hợp, để giữ sàn an toàn, lành mạnh cho mọi người dùng.

---

### 4. Acceptance Criteria (AC)

#### AC-013-01: Khóa tài khoản người dùng vi phạm (Happy Path)
- **Given:** Người dùng có tài khoản ở trạng thái `ACTIVE` và không có Booking `CONFIRMED`/`PICKED_UP`; Quản trị viên đã ghi nhận lý do xử lý;
- **When:** Quản trị viên chọn hành động khóa tài khoản;
- **Then:** Tài khoản chuyển `ACTIVE → LOCKED`; hệ thống ghi vết kiểm toán gồm `admin_id`, thời điểm và lý do, phát `NTF-012` cho người bị khóa, và các lần đăng nhập tiếp theo bị từ chối với `ERR-USR-011`.
- **Rule gắn kèm:** E-R9, BR-013-01, BR-013-03, BR-013-06

#### AC-013-02: Mở khóa tài khoản người dùng (Alternative Path)
- **Given:** Người dùng có tài khoản ở trạng thái `LOCKED`; Quản trị viên đã ghi nhận lý do mở khóa;
- **When:** Quản trị viên chọn hành động mở khóa tài khoản;
- **Then:** Tài khoản chuyển `LOCKED → ACTIVE`; hệ thống ghi vết kiểm toán gồm `admin_id`, thời điểm và lý do; người dùng có thể đăng nhập trở lại và thực hiện quyền theo vai trò đã được cấp.
- **Rule gắn kèm:** E-R9, BR-013-01, BR-013-03, BR-013-06

#### AC-013-03: Ẩn tin đăng vi phạm (Happy Path)
- **Given:** Tin cho thuê (`Item`) đang ở trạng thái `OPEN` và không có Booking `CONFIRMED`/`PICKED_UP`; Quản trị viên đã ghi nhận lý do xử lý;
- **When:** Quản trị viên chọn hành động ẩn tin đăng;
- **Then:** Tin đăng chuyển `OPEN → HIDDEN`, không còn xuất hiện trong tìm kiếm công khai và không nhận Booking mới; hệ thống ghi vết kiểm toán gồm `admin_id`, thời điểm và lý do, đồng thời phát `NTF-013` cho Chủ thiết bị.
- **Rule gắn kèm:** E-R9, BR-013-02, BR-013-03, BR-013-06

#### AC-013-04: Bỏ ẩn tin đăng đã khắc phục (Alternative Path)
- **Given:** Tin cho thuê (`Item`) đang ở trạng thái `HIDDEN` do Quản trị viên trước đó ẩn; Quản trị viên đã ghi nhận lý do bỏ ẩn;
- **When:** Quản trị viên chọn hành động bỏ ẩn tin đăng;
- **Then:** Tin đăng chuyển `HIDDEN → OPEN` và trở lại phạm vi công khai, có thể nhận Booking mới cho khung ngày hợp lệ; hệ thống ghi vết kiểm toán gồm `admin_id`, thời điểm và lý do.
- **Rule gắn kèm:** E-R9, BR-013-02, BR-013-03, BR-013-06

#### AC-013-05: Mọi thao tác quản trị đều có dấu vết kiểm toán (Dấu vết)
- **Given:** Quản trị viên thực hiện một trong các thao tác khóa tài khoản, mở khóa tài khoản, ẩn tin đăng hoặc bỏ ẩn tin đăng;
- **When:** Hệ thống ghi nhận thao tác;
- **Then:** Vết kiểm toán ghi rõ ai thực hiện (`admin_id`), thời điểm thực hiện, hành động, lý do và trạng thái trước → sau; vết này không thể sửa hoặc xóa và lịch sử giao dịch liên quan vẫn được giữ.
- **Rule gắn kèm:** E-R7, BR-013-03

#### AC-013-06: Khóa tài khoản khi còn Booking đang chạy (Exception `[CẦN XÁC NHẬN]`)
- **Given:** Tài khoản người dùng đang có ít nhất một Booking ở trạng thái `CONFIRMED` hoặc `PICKED_UP`;
- **When:** Quản trị viên chọn hành động khóa tài khoản;
- **Then:** **[CẦN XÁC NHẬN]** — hệ thống hiển thị các Booking đang chạy và chặn chuyển `ACTIVE → LOCKED` cho tới khi Admin xử lý Booking trước; trả lỗi `ERR-USR-024` (mã cấp mới tại Phụ lục B); không phát `NTF-012` và không thay đổi trạng thái tài khoản. Nhóm còn phải chốt cơ chế “xử lý Booking trước”.
- **Rule gắn kèm:** BR-013-04

#### AC-013-07: Ẩn tin đăng khi còn Booking đang chạy (Exception)
- **Given:** Tin cho thuê (`Item`) đang có ít nhất một Booking ở trạng thái `CONFIRMED` hoặc `PICKED_UP`;
- **When:** Quản trị viên chọn hành động ẩn tin đăng;
- **Then:** Hệ thống từ chối thao tác, giữ tin đăng ở `OPEN`, không phát `NTF-013`, đồng thời trả lỗi `ERR-USR-020`; Quản trị viên phải xử lý Booking đang chạy trước.
- **Rule gắn kèm:** E-R9, BR-013-04, ERR-USR-020

#### AC-013-08: Chặn người dùng không đúng vai trò quản trị (Exception)
- **Given:** Người dùng đang đăng nhập với vai trò `OWNER` hoặc `RENTER`;
- **When:** Người dùng cố gắng thực hiện thao tác khóa/mở khóa tài khoản hoặc ẩn/bỏ ẩn tin đăng thuộc quyền quản trị;
- **Then:** Hệ thống từ chối thực hiện, giữ nguyên trạng thái người dùng/tin đăng và sổ cọc, đồng thời trả lỗi `ERR-USR-008` (BR-013-06).
- **Rule gắn kèm:** BR-013-06, ERR-USR-008

---

### 5. Business Rules (BR)

| Mã Rule | Nội dung quy tắc | Trạng thái / Nguồn |
|---|---|---|
| **E-R9** | Item bị admin ẩn khi vi phạm; user bị khóa | **Quy tắc gốc đã chốt** (`gearloop_day02_spec.md:329-330`, `wb4_gearloop/BusinessRules.md`) |
| **E-R7** | Người thuê không tự sửa lịch sau khi duyệt; không ai xóa lịch sử giao dịch | **Quy tắc gốc đã chốt** (`wb4_gearloop/BusinessRules.md`) |
| **BR-013-01** | Quản lý trạng thái tài khoản: Quản trị viên có thể khóa tài khoản đang `ACTIVE` để chuyển `ACTIVE → LOCKED`, và mở khóa tài khoản `LOCKED` để chuyển `LOCKED → ACTIVE`. Tài khoản `LOCKED` bị từ chối đăng nhập với `ERR-USR-011`. | **Quy tắc gốc đã chốt** (E-R9; `gearloop_day02_spec.md:329`; `local://shared_contract.md`) |
| **BR-013-02** | Quản lý trạng thái tin đăng: Quản trị viên có thể ẩn tin `OPEN` để chuyển `OPEN → HIDDEN`, và bỏ ẩn tin `HIDDEN` để chuyển `HIDDEN → OPEN`. Tin `HIDDEN` không hiển thị công khai và không nhận Booking mới. | **Quy tắc gốc đã chốt** (E-R9; `gearloop_day02_spec.md:330`; `gearloop_architecture_blueprint.md:157`) |
| **BR-013-03** | Bảo toàn dữ liệu kiểm toán và cấm xóa cứng: Không xóa vật lý tài khoản hoặc tin đăng; thay bằng thay đổi trạng thái để giữ lịch sử giao dịch. Mọi thao tác quản trị phải ghi vết gồm `admin_id`, thời điểm, hành động, lý do và trạng thái trước → sau; vết không thể sửa hoặc xóa. | **Quy tắc gốc đã chốt** (E-R7, E-R9; `gearloop_day02_spec.md:329`; yêu cầu dấu vết của US-013) |
| **BR-013-04** | Ràng buộc Booking đang chạy: Khóa tài khoản có Booking `CONFIRMED`/`PICKED_UP` phải được xử lý Booking trước; hành vi chặn và cơ chế xử lý cần nhóm chốt `[CẦN XÁC NHẬN]`. Ẩn tin có Booking `CONFIRMED`/`PICKED_UP` bị từ chối với `ERR-USR-020`; tin giữ `OPEN` và Admin phải xử lý Booking trước. | Phần khóa User: **[CẦN XÁC NHẬN]**; phần ẩn Item: **quy tắc đã chốt** theo yêu cầu US-013 và `ERR-USR-020` trong Shared Contract |
| **BR-013-05** | Thông báo quản trị: Khóa tài khoản phát `NTF-012` cho người bị khóa; ẩn tin đăng phát `NTF-013` cho Chủ thiết bị. Mở khóa tài khoản và bỏ ẩn tin không có sự kiện thông báo riêng trong Shared Contract. | **Sự kiện thông báo đã chốt** (`local://shared_contract.md`) |
| **BR-013-06** | Thẩm quyền quản trị: Chỉ người dùng mang vai trò `ADMIN` mới được phép khóa/mở khóa tài khoản và ẩn/bỏ ẩn tin đăng. Người dùng vai trò khác thao tác các quyền này bị từ chối với `ERR-USR-008`. | **Ma trận RBAC đã chốt** (`gearloop_architecture_blueprint.md:156-157`; `local://shared_contract.md`) |

---

### 6. Validation & Error Handling

#### Tiêu chí dữ liệu hợp lệ:
- Định danh người dùng hoặc tin đăng được thao tác phải tồn tại trên hệ thống.
- Khi khóa tài khoản: Trạng thái hiện tại của tài khoản phải là `ACTIVE`.
- Khi mở khóa tài khoản: Trạng thái hiện tại của tài khoản phải là `LOCKED`.
- Khi ẩn tin đăng: Trạng thái hiện tại của tin đăng phải là `OPEN`.
- Khi bỏ ẩn tin đăng: Trạng thái hiện tại của tin đăng phải là `HIDDEN`.
- Lý do xử lý của Quản trị viên là trường bắt buộc và không được để trống hoặc chỉ chứa khoảng trắng. **[CẦN XÁC NHẬN]** — nhóm cần chốt giới hạn độ dài và mã lỗi dành riêng cho trường hợp thiếu lý do; `ERR-USR-005` trong Shared Contract hiện được mô tả cho tạo/sửa Item, không nên mặc định áp dụng cho thao tác quản trị.

#### Danh mục mã lỗi áp dụng:
- **`ERR-USR-008`**: Không đúng vai trò; dùng khi người dùng không phải Admin cố thực hiện thao tác quản trị.
- **`ERR-USR-011`**: Tài khoản bị khóa; dùng khi người dùng `LOCKED` cố đăng nhập.
- **`ERR-USR-020`**: Không thể ẩn tin đăng khi còn lượt thuê `CONFIRMED`/`PICKED_UP` đang chạy.
- **`ERR-SYS-001`**: Lỗi xử lý nội bộ; hệ thống không hoàn tất thao tác và không thay đổi trạng thái đích.
- **`ERR-USR-023`**: Lý do quản trị bắt buộc bị bỏ trống hoặc chỉ chứa khoảng trắng. Mã lỗi cấp mới tại Phụ lục B (hợp nhất đặc tả). `[CẦN XÁC NHẬN]` nhóm còn phải chốt độ dài hợp lệ của lý do quản trị.
- **`ERR-USR-024`**: Khóa tài khoản bị chặn vì còn lượt thuê `CONFIRMED`/`PICKED_UP` đang chạy; hệ thống hiển thị danh sách lượt thuê cần xử lý trước. Mã lỗi cấp mới tại Phụ lục B; `[CẦN XÁC NHẬN]` cơ chế “xử lý Booking trước” chưa chốt.

---

### 7. Permissions & Preconditions

#### Phân quyền (Permissions):
- **Vai trò thực hiện:** Chỉ duy nhất vai trò `ADMIN`.
- **Vai trò chịu tác động:**
  - `OWNER` hoặc `RENTER` bị khóa tài khoản (nhận thông báo `NTF-012`).
  - `OWNER` sở hữu tin đăng bị ẩn (nhận thông báo `NTF-013`).

#### Điều kiện tiên quyết (Preconditions):
- Quản trị viên đăng nhập với phiên làm việc hợp lệ mang vai trò `ADMIN`.
- Thực thể người dùng (`User`) hoặc tin đăng (`Item`) chịu tác động phải tồn tại trên hệ thống.
- Đối với thao tác khóa người dùng: Nếu còn Booking `CONFIRMED`/`PICKED_UP`, phải xử lý Booking trước; cách thức xử lý cần nhóm chốt `[CẦN XÁC NHẬN]`, mã lỗi áp dụng là `ERR-USR-024`. Đối với thao tác ẩn tin: không được ẩn khi còn Booking `CONFIRMED`/`PICKED_UP`; trả `ERR-USR-020`.

---

### 8. Dependencies & References

#### Phụ thuộc các User Story khác:
- **US-001 (Đăng nhập & phân quyền):** Quản trị viên đăng nhập để được cấp quyền `ADMIN`; trạng thái `LOCKED` ngăn chặn phiên đăng nhập của người dùng vi phạm.
- **US-002 / US-003 (Đăng tin & quản lý tin cho thuê):** Cung cấp các thực thể tin đăng `Item`; tin bị Quản trị viên đưa về `HIDDEN` sẽ không hiển thị trên danh mục tìm kiếm.
- **US-004 / US-005 (Tìm kiếm & đặt thuê):** Tin ở trạng thái `HIDDEN` bị loại khỏi kết quả tìm kiếm và bị chặn tạo `Booking` mới.

#### Tài liệu tham chiếu:
- `gearloop_day02_spec.md`: Mục 6.2 (CRUD matrix — User: R/U khóa/mở; Item: R/U ẩn khi vi phạm; không xóa cứng).
- `gearloop_architecture_blueprint.md`: §3 (Domain model), §6 (RBAC design), §7 (Testing us5 & moderation).
- `wb4_gearloop/BusinessRules.md`: E-R7 (không xóa lịch sử), E-R9 (admin ẩn tin, khóa user).
- `local://shared_contract.md`: Mã lỗi `ERR-USR-008`, `ERR-USR-011`, `ERR-USR-020`, sự kiện `NTF-012`, `NTF-013`.

---

### 9. Out of Scope (Cố ý chưa làm)
- Không cung cấp tính năng xóa cứng (hard delete / xóa vật lý) tài khoản hoặc tin đăng khỏi cơ sở dữ liệu nhằm bảo đảm toàn vẹn dữ liệu kế toán và lịch sử giao dịch.
- Không tự động quét phát hiện từ khóa cấm hoặc kiểm duyệt nội dung/hình ảnh bằng mô hình học máy (AI/ML) — toàn bộ việc kiểm tra vi phạm thực hiện thủ công bởi Quản trị viên.
- Không hỗ trợ quy trình khiếu nại lệnh khóa tài khoản trực tuyến tự động trong phiên bản MVP (người dùng liên hệ qua kênh hỗ trợ ngoài sàn).

---


---


# Phụ lục A — Policy Benchmark Register

**Truy cập:** 2026-10-27. **Thứ bậc:** nguồn chính thức của sản phẩm trước; bản lưu trữ first-party được ghi rõ là lịch sử; blog chỉ là nguồn thứ cấp. Benchmark chỉ định hướng quyết định chưa chốt, không ghi đè hồ sơ GearLoop. Fat Llama đã chuyển thương hiệu sang Hygglo 24/11/2025; policy Fat Llama từ bản lưu là lịch sử, không đại diện chắc chắn cho hành vi hiện hành của app. Rentomo thiết bị là nguồn lịch sử (domain hiện không còn sản phẩm thuê thiết bị).

| Tham số | Giá trị đề xuất cho GearLoop | Nguồn + trích dẫn nguyên văn + cấp độ | So với hồ sơ | Dùng làm mặc định? | Lý do |
|---|---|---|---|---|---|
| Mức cọc (cơ sở/tỷ lệ) | **Không tìm thấy nguồn đủ tin cậy** cho tỷ lệ phổ quát. Giữ ví dụ 30% và dải 20–50% như giả định hồ sơ; nhóm cần chốt cơ sở tính (giá trị kê khai hay tổng tiền thuê). | GearLoop `gearloop_day02_spec.md` §6.2: `%cọc ≥20% và ≤50% giá trị kê khai [GIẢ ĐỊNH]`; US2: “cọc 30%” ví dụ, tính 600k × 2 ngày × 30% = 360k. Shopify B2B (chính thức, đối chiếu e-commerce): https://help.shopify.com/en/manual/b2b/checkout-and-orders/payment-terms — “Enter a percentage amount deposit requirement, such as 20%.” Turo: https://help.turo.com/en_us/security-deposits-us-HkbE44lE9 — “Turo’s system may apply a refundable security deposit to your booked trip depending on your age, vehicle type, vehicle location, and other factors.” Fat Llama archived (chính thức lịch sử): https://web.archive.org/web/20240222220957id_/https://fatllama.crisp.help/en/article/how-does-payment-work-for-renters-1ui6hgr/ — “No, there's no need to pay a deposit to rent on Fat Llama. Woohoo.” | Mâu thuẫn cơ sở tính nội bộ; không thay giá trị hồ sơ. | **Không** (đề xuất 20–50% có điều kiện, cần nhóm chốt). | Benchmark xác nhận mô hình % tồn tại ở e-commerce, không xác nhận 30% cho thiết bị P2P. Cọc mô phỏng ledger; không tuyên bố PSP/tiền thật. |
| Cơ chế HOLD / hoàn | Domain GearLoop giữ `HOLD → RELEASE/DEDUCT`; nếu dùng PSP về sau, authorization hold + partial capture là phương án benchmark, không phải cam kết MVP. | Stripe Docs (chính thức): https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md — “Authorizing a payment guarantees the amount by holding it on the customer’s payment method.” / “A partial capture automatically releases the remaining amount.” Fat Llama archived UK policy (chính thức lịch sử): payment hold trước, transfer cho Owner trong 24h từ start; US/CA terms có actual card charge, khác UK. | Hồ sơ nói ledger mô phỏng; tiền thật/PSP là Won’t. | **Không** (chỉ tham chiếu). | Khu vực pháp lý làm thay đổi cơ chế; không lấy một mô hình quốc tế làm mặc định tiền thật cho GearLoop. |
| Tự hoàn cọc sau RETURNED | **48 giờ**, giữ nguyên như E-R4/US4. | GearLoop `gearloop_day02_spec.md` §6.3 US4: “48h sau checklist RETURNED không có khiếu nại thì cọc tự hoàn”; blueprint §3. Đối chiếu: Turo US 80h, https://help.turo.com/en_us/security-deposits-us-HkbE44lE9 — “automatically refund your security deposit 80 hours after your trip ends”; Getaround 7 ngày làm việc, https://getaround.com/help/articles/93aab182f07c/intl — “automatically released 7 working days after the end of the rental”; Airbnb 7/14 ngày, https://www.airbnb.com/help/article/2799. Tất cả nguồn benchmark chính thức. | Benchmark lâu hơn; hồ sơ giữ 48h. | **Có — 48h giữ nguyên.** | Không thay yêu cầu đã chốt. An toàn 48h phụ thuộc quy trình khiếu nại/bằng chứng; không tự suy ra 48h là hạn chót mở khiếu nại. |
| Thời hạn mở Dispute hư hỏng | **Chưa chốt.** Mốc 48h là ứng viên suy luận, không phải rule đã có. | Turo US: report trong 24h, https://help.turo.com/en_us/reporting-damage-Bk7aIWhHi — “You must report damage no more than 24 hours after the trip ends.” Getaround EU: 5 ngày làm việc (owner thường), 7 ngày Entrepreneur Program, https://getaround-assets.gumlet.io/legal/2026-05-31/20260531_EU_TOS_EN.pdf. Fat Llama 24h là chính thức lịch sử: https://web.archive.org/web/20240222205022id_/https://fatllama.crisp.help/en/article/what-are-the-criteria-for-the-owner-guarantee-1m8i4bw/. | Hồ sơ chỉ quy định 48h sau RETURNED không có Dispute → RELEASE; không định nghĩa claim window. | **Không — cần nhóm chốt.** | Gắn cửa sổ khiếu nại vào timer có thể đóng quyền khiếu nại quá sớm hoặc giữ cọc vô hạn; phải quyết định riêng. |
| Renter hủy muộn | Ứng viên: >48h trước giờ nhận hoàn 100% tiền thuê; ≤48h hoàn 50%; sau giờ nhận 0%. **Tiền cọc xử lý riêng, không mặc định cấn phạt vào HOLD.** | Getaround (chính thức): https://getaround.com/help/articles/77ae2d7092b0 — “More than 48 hours before the start of the rental” (full refund); “Less than 48 hours” (50%); “Once the rental start time has passed” (no refund). Các % là tiền thuê/booking, không phải cọc. | Chính sách renter-cancel chưa có trong hồ sơ nền. | **Không — `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`.** | Gần nhất với mốc 48h, đơn giản; không chuyển benchmark thành chính sách GearLoop trước khi nhóm duyệt. |
| Owner hủy: hoàn cho Renter | Hoàn 100% tiền thuê và RELEASE 100% cọc; voucher/strike theo E-R5. Không mặc định cash compensation khác. | Airbnb (chính thức): https://www.airbnb.com/help/article/170 — “You'll get a full refund, including service fees, if you choose not to rebook.” Getaround EU Terms (chính thức): https://getaround-assets.gumlet.io/legal/2026-05-31/20260531_EU_TOS_EN.pdf — “In case of cancellation of a Booking by the Owner, the Driver is fully reimbursed”. Hygglo UK TOS: https://hygglo.com/uk/tos — “the Renter will receive a full refund of the rental amount. No additional compensation will be paid”. | E-R5 đã quy định hoàn cọc + voucher có điều kiện + strike cho Owner; blueprint/US story đề cập hoàn đủ. | **Có — theo E-R5, không thêm cash compensation.** | Mẫu đơn giản, bảo vệ Renter, tránh tự đặt thêm nghĩa vụ tài chính. |
| Phạt tiền Owner hủy | Không đặt mức tiền trong bản nền; giữ strike/voucher E-R5. 10%/30% chỉ là ứng viên, không áp dụng mặc định. | Turo (chính thức): https://turo.com/us/en/policies/cancellation — “$50” khi <24h, “$25” khi >24h; Fat Llama/Hygglo US terms (chính thức, hiện hành US): https://hygglo.com/us/tos — “cancellation charge of thirty percent (30%) of the Hire Fee”; đó là vùng US/CA, không phải tiền cọc. | E-R5 có strike, không chốt phí tiền mặt. | **Không — cần nhóm chốt.** | Phí phụ thuộc thị trường/pháp lý và có thể mâu thuẫn với mô hình không xử lý tiền thật. |
| Thời hạn Owner duyệt yêu cầu | 24h + trạng thái hết hạn là ứng viên; trạng thái `EXPIRED` chưa được ratify. | Airbnb (chính thức): https://www.airbnb.com/help/article/28 — “You have 24 hours to respond before it expires.” Getaround EU Terms (chính thức): https://getaround-assets.gumlet.com/legal/2026-05-31/20260531_EU_TOS_EN.pdf — “doesn’t respond within 24 hours”. | GearLoop state machine không có EXPIRED. | **Không — `[ĐỀ XUẤT — CẦN NHÓM CHỐT]`.** | 24h có nguồn benchmark; cần chốt trạng thái kết quả và việc tự mở lịch. |
| Bằng chứng nhận–trả | Checklist/ConditionReport + ảnh có dấu thời gian tại hai mốc theo E-R3/E-R6; số ảnh/quy trình ảnh chưa chốt. | Getaround (chính thức): https://getaround.com/help/articles/cb9a9a7a44ca/intl — “The checkin inspection is mandatory for all rentals.” Turo (chính thức): https://help.turo.com/en_us/trip-photos-guide-or-hosts-BkKcBEeN5; Fat Llama Owner Guarantee PDF (chính thức; policy lịch sử) https://fat-lama-assets.s3.eu-west-1.amazonaws.com/lenderguarante.pdf §5.1.5.4: “photos or videos ... no more than 24 hours before the rental”. | E-R3/E-R6 đã yêu cầu checklist kép + ảnh dấu thời gian + mã một lần. | **Có — nguyên tắc hồ sơ; không sao chép số ảnh benchmark.** | Mỗi sản phẩm khác biệt; số lượng ảnh, loại file, mẫu checklist cần nhóm chốt (Phụ lục D). |
| Bảo hiểm / protection | Deposit-only; không tuyên bố bảo hiểm hoặc bảo đảm vượt giá trị cọc thực giữ. | GearLoop `gearloop_day02_spec.md` §6.4: “Bảo hiểm tích hợp” Won’t. Airbnb HDP tối đa $3m, https://www.airbnb.com/help/article/279; Turo plans tối đa $200k, https://help.turo.com/en_us/earnings-plans-in-detail-us-hosts-ByMOIVxEc; Getaround EU insurance tới €75,000; Hygglo guarantee theo category £3k–£30k, PDF tại `tmp/bench/bench_dispute.md`. Chính thức. | Không có bảo hiểm tích hợp trong MVP. | **Không.** | Những khoản bảo vệ này có backing/điều khoản riêng; không phù hợp để giả lập trong CRUD MVP. |
| Owner không phản hồi / booking hết hạn: lịch & tiền | Ứng viên: sau 24h không có booking, RELEASE cọc và mở lịch lại. | Airbnb (chính thức): https://www.airbnb.com/help/article/28 — expired request leaves dates blocked until Host manually unblocks; Getaround (chính thức): https://getaround-assets.gumlet.com/legal/2026-05-31/20260531_EU_TOS_EN.pdf — driver notified, must start process again. | Hồ sơ GearLoop chưa định nghĩa hết hạn hoặc lịch sau hết hạn. | **Không — cần nhóm chọn.** | Benchmark không thống nhất về lịch; không tự chốt hành vi. |

**Lưu ý trích dẫn benchmark:** Trích dẫn nguyên văn đầy đủ, URL truy cập, tình trạng nguồn (kể cả Fat Llama lịch sử/US-CA), và danh sách nguồn không đủ tin cậy nằm tại `tmp/bench/bench_deposit.md`, `tmp/bench/bench_cancel.md`, `tmp/bench/bench_dispute.md`. Phụ lục này giữ các trích dẫn đủ để người đọc kiểm tra cơ sở cho từng đề xuất và nêu rõ khác biệt với hồ sơ; file benchmark sẽ được giữ lại ngoài scaffold `tmp/specs/`.

# Phụ lục B — Trạng thái, chuyển trạng thái và danh mục lỗi chuẩn

## B1. Booking — tập trạng thái có nguồn

**Tập hồ sơ đã ghi:** `REQUESTED → CONFIRMED → PICKED_UP → RETURNED → CLOSED | CANCELLED | RESOLVED` (`gearloop_day02_spec.md` §6.1, `gearloop_architecture_blueprint.md` §3). `RESOLVED` là trạng thái kết thúc sau phân xử theo blueprint. `EXPIRED` **không có** trong state machine nguồn.

| Chuyển đổi | Vai/sự kiện | Hệ quả | Rule / nguồn |
|---|---|---|---|
| ∅ → REQUESTED | Renter tạo yêu cầu thuê | Tạo HOLD theo E-R2; khoảng ngày bị chiếm theo E-R1; NTF-001 tới Owner | E-R1/E-R2; US-005 |
| REQUESTED → CONFIRMED | Owner duyệt | Yêu cầu được xác nhận; NTF-002 tới Renter | `gearloop_day02_spec.md` §6.1–6.3; US-007 |
| REQUESTED → CANCELLED | Owner từ chối hoặc Renter hủy | RELEASE HOLD; NTF-003 (Owner từ chối) hoặc NTF-005 (Renter hủy) | E-R2; US-007/008 |
| CONFIRMED → CANCELLED | Renter hủy hoặc Owner hủy trước nhận | Renter hủy: chính sách tiền thuê chưa chốt; Owner hủy: E-R5 hoàn cọc + voucher + strike; NTF-005/006 | E-R5; US-008 |
| CONFIRMED → PICKED_UP | Renter xác nhận nhận + ConditionReport PICKUP | Bắt đầu phiên thuê; NTF-007 tới Owner | E-R3/E-R6/E-R8; US-010 |
| PICKED_UP → RETURNED | Owner xác nhận trả + ConditionReport RETURN | Bắt đầu kỳ 48h E-R4; NTF-008 tới Renter | E-R3/E-R4/E-R6/E-R8; US-011 |
| RETURNED → CLOSED | System, sau 48h không Dispute | RELEASE 100% HOLD; NTF-009 | E-R4; US-009 |
| RETURNED → RESOLVED | Admin phân xử Dispute | DEDUCT phần quyết định + RELEASE phần dư, hoặc RELEASE toàn bộ; NTF-011 | E-R2; `gearloop_day02_spec.md` US5; US-012 |
| REQUESTED → EXPIRED | **Chưa có trong hồ sơ; chỉ đề xuất 24h** | Nếu nhóm chốt: RELEASE + mở lịch + NTF-004. Trước khi chốt, không xem là hành vi nền | `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` BR-009-04/BR-005-04 |

**Xung đột cần quyết:** nhóm trạng thái chiếm lịch khác nhau giữa E-R1 (ngôn ngữ “không hai Booking chồng ngày”), US1 tìm kiếm (REQUESTED/CONFIRMED), và `BR-005-01` (REQUESTED/CONFIRMED/PICKED_UP). Đề xuất nhất quán là REQUESTED + CONFIRMED + PICKED_UP chiếm lịch; cần nhóm xác nhận Q2. Không tự suy diễn CANCELLED/EXPIRED thành một trạng thái nguồn.

## B2. Deposit — từ vựng giao dịch

`HOLD` được System tạo khi Booking thành công; `RELEASE` hoàn cọc; `DEDUCT` là khoản trừ do Admin quyết qua phân xử. Ledger append-only, không sửa/xóa; `sum(RELEASE)+sum(DEDUCT) ≤ HOLD`. Chỉ Admin được quyền quyết định RELEASE/DEDUCT theo E-R2, trong khi việc tự RELEASE theo E-R4/đường từ chối do System thực hiện theo quy trình hồ sơ. **Không dùng “Deposit status” như state machine thay cho giao dịch ledger.** Tiền cọc là khoản ghi nhận mô phỏng, không phải tiền thật/authorization của PSP.

## B3. Notification events

| Mã | Sự kiện / lúc phát | Người nhận | Story sở hữu |
|---|---|---|---|
| NTF-001 | Booking REQUESTED được tạo | Owner | US-005 (sinh); US-006 (Owner tiêu hóa) |
| NTF-002 | Owner duyệt → CONFIRMED | Renter | US-007 |
| NTF-003 | Owner từ chối → CANCELLED | Renter | US-007 |
| NTF-004 | REQUESTED hết hạn 24h | Renter + Owner | US-009, **đề xuất** |
| NTF-005 | Renter hủy | Owner | US-008 |
| NTF-006 | Owner hủy theo E-R5 | Renter | US-008 |
| NTF-007 | Renter xác nhận nhận → PICKED_UP | Owner | US-010 |
| NTF-008 | Owner xác nhận trả → RETURNED | Renter | US-011 |
| NTF-009 | System RELEASE 48h | Renter + Owner | US-009 |
| NTF-010 | Dispute mở | Phía đối diện + Admin | US-012 |
| NTF-011 | Admin phân xử xong | Renter + Owner | US-012 |
| NTF-012 | Admin khóa User | User bị khóa | US-013 |
| NTF-013 | Admin ẩn Item | Owner | US-013 |

Thông báo đều in-app; NTF-001 chỉ được tiêu hóa ở US-006 (không phát lại ở US-006). Nếu trạng thái booking đổi trước khi Owner mở thông báo, nội dung phải phản ánh trạng thái hiện tại. NTF-004 chỉ phát nếu nhóm phê duyệt hết hạn 24h.

## B4. Error catalog

Mọi lỗi người dùng giữ dữ liệu nhập, không làm đổi trạng thái/giao dịch; lỗi hệ thống trả thông điệp chung + mã tra cứu, không lộ chi tiết kỹ thuật. Mã dùng trong AC không lặp chuỗi thông điệp.

| Mã | Hành vi | Thông điệp tiếng Việt |
|---|---|---|
| ERR-USR-001 | Khoảng thuê giao với lịch đã bị chiếm | Khung ngày bạn chọn đã có người đặt. Vui lòng chọn khung ngày khác. |
| ERR-USR-002 | Ngày bắt đầu trước hôm nay | Ngày bắt đầu phải từ hôm nay trở đi. |
| ERR-USR-003 | Ngày kết thúc trước ngày bắt đầu hoặc khoảng không hợp lệ | Ngày kết thúc phải sau ngày bắt đầu. |
| ERR-USR-004 | Item ẩn/không khả dụng | Tin đăng hiện không khả dụng. |
| ERR-USR-005 | Thiếu trường bắt buộc tạo/sửa tin | Vui lòng điền đầy đủ các trường bắt buộc: {danh sách trường}. |
| ERR-USR-006 | Giá ≤0 hoặc giá trị tài chính không hợp lệ | Giá thuê phải lớn hơn 0. Mức cọc phải từ 20% đến 50%. `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` dải 20–50%. |
| ERR-USR-007 | Hủy sau PICKED_UP | Lượt thuê đã bắt đầu, không thể hủy. Vui lòng liên hệ hỗ trợ. |
| ERR-USR-008 | Sai vai hoặc không có quyền trên đối tượng | Bạn không có quyền thực hiện thao tác này. |
| ERR-USR-009 | Duyệt/từ chối không ở REQUESTED | Yêu cầu thuê không ở trạng thái chờ duyệt. |
| ERR-USR-010 | Đăng nhập sai thông tin | Thông tin đăng nhập không đúng. |
| ERR-USR-011 | Tài khoản LOCKED đăng nhập | Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên. |
| ERR-USR-012 | Mở Dispute ngoài cửa sổ đã được nhóm chốt | Đã quá thời hạn mở khiếu nại. **[CẦN XÁC NHẬN]** cửa sổ hiện chưa chốt. |
| ERR-USR-013 | ConditionReport thiếu trường/ảnh bắt buộc | Vui lòng hoàn thành biên bản tình trạng thiết bị trước khi tiếp tục. |
| ERR-USR-014 | Cọc ngoài dải | Mức cọc phải từ 20% đến 50% giá trị kê khai. `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` |
| ERR-USR-015 | Duyệt booking đã hết hạn | Yêu cầu thuê đã hết hạn. **[ĐỀ XUẤT — CẦN NHÓM CHỐT]** phụ thuộc EXPIRED. |
| ERR-USR-016 | Nhận đồ trước CONFIRMED | Lượt thuê chưa được chủ đồ xác nhận. |
| ERR-USR-017 | Xác nhận trả không ở PICKED_UP | Lượt thuê chưa ở trạng thái đang thuê. |
| ERR-USR-018 | Dispute đã kết thúc/không chờ phân xử | Khiếu nại không ở trạng thái chờ phân xử. |
| ERR-USR-019 | Tỷ lệ DEDUCT ngoài [0%, 100%] | Tỷ lệ trừ cọc phải từ 0% đến 100%. |
| ERR-USR-020 | Ẩn Item còn booking CONFIRMED/PICKED_UP | Không thể ẩn tin đăng khi còn lượt thuê đang diễn ra. |
| ERR-USR-021 | Cảnh báo Renter hủy ≤48h (nếu chính sách được chốt) | Bạn hủy trong vòng 48 giờ trước giờ nhận. Chính sách hoàn tiền cần được nhóm chốt. |
| ERR-USR-022 | Renter đặt thuê Item của chính mình | Bạn không thể đặt thuê thiết bị của chính mình. `[CẦN XÁC NHẬN]` quy tắc chưa có trong nguồn. |
| ERR-USR-023 | Thiếu lý do phân xử/quản trị bắt buộc | Vui lòng nhập lý do xử lý. `[CẦN XÁC NHẬN]` giới hạn độ dài. |
| ERR-USR-024 | Khóa User còn booking đang chạy | Không thể khóa tài khoản khi còn lượt thuê đang diễn ra. `[CẦN XÁC NHẬN]` quy trình. |
| ERR-SYS-001 | Lỗi nội bộ | Hệ thống gặp sự cố. Vui lòng thử lại sau. Mã lỗi: ERR-SYS-001. |
| ERR-SYS-002 | Xung đột đồng thời | Thao tác không thể hoàn thành do xung đột dữ liệu. Vui lòng thử lại. Mã lỗi: ERR-SYS-002. |
| ERR-SYS-003 | Phiên đăng nhập hết hạn | Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại. Mã lỗi: ERR-SYS-003. |

# Phụ lục C — Truy vết Story → Rule → AC

AC liệt kê dưới rule là AC có tham chiếu rule đó. `E-R` giữ nguyên mã nguồn; mọi `BR` duy nhất trong namespace story. Số AC mỗi story tính theo ID duy nhất, không tính lần lặp tham chiếu.

| Story | Rule | AC |
|---|---|---|
| US-001 | BR-001-01 | AC-001-01, AC-001-06 |
| US-001 | BR-001-02 | AC-001-02 |
| US-001 | BR-001-03 | AC-001-03 |
| US-001 | BR-001-04, E-R9 | AC-001-04 |
| US-001 | BR-001-05 | AC-001-05 |
| US-002 | BR-002-01 | AC-002-01, AC-002-02, AC-002-03 |
| US-002 | BR-002-02 | AC-002-01, AC-002-04 |
| US-002 | BR-002-03 | AC-002-01, AC-002-05, AC-002-06, AC-002-07 |
| US-002 | BR-002-04 | AC-002-08 |
| US-003 | BR-003-01 | AC-003-01, AC-003-07 |
| US-003 | BR-003-02 | AC-003-02, AC-003-03 |
| US-003 | BR-003-03 | AC-003-02 |
| US-003 | BR-003-04 | AC-003-04, AC-003-05, AC-003-06 |
| US-003 | E-R9 | AC-003-06, AC-003-08 |
| US-004 | BR-004-01 | AC-004-01, AC-004-03 |
| US-004 | BR-004-02, E-R1 | AC-004-02 |
| US-004 | BR-004-03, E-R8 | AC-004-04 |
| US-004 | BR-004-04, E-R9 | AC-004-05 |
| US-005 | BR-005-01, E-R1 | AC-005-01, AC-005-02, AC-005-07 |
| US-005 | BR-005-02 | AC-005-01, AC-005-08 |
| US-005 | BR-005-03, E-R2 | AC-005-01, AC-005-07 |
| US-005 | BR-005-04 `[ĐỀ XUẤT]` | AC-005-09 `[ĐỀ XUẤT]` |
| US-005 | BR-005-05, E-R8 | AC-005-10 |
| US-005 | BR-005-06 `[CẦN XÁC NHẬN]` | AC-005-03 |
| US-008 | BR-008-01, BR-008-03 | AC-008-05 |
| US-010 | BR-010-01 | AC-010-03, AC-010-05 |
| US-010 | BR-010-04 | AC-010-01, AC-010-05 |
| US-006 | BR-006-01 | AC-006-01, AC-006-02 |
| US-006 | BR-006-02 | AC-006-02 |
| US-006 | BR-006-03 `[CẦN XÁC NHẬN]` | AC-006-03 |
| US-007 | BR-007-01 | AC-007-01, AC-007-03, AC-007-06 |
| US-007 | BR-007-02 | AC-007-02, AC-007-03, AC-007-06 |
| US-007 | BR-007-03 `[ĐỀ XUẤT]` | AC-007-04 `[ĐỀ XUẤT]` |
| US-007 | BR-007-04 | AC-007-01, AC-007-02, AC-007-05 |
| US-007 | BR-007-05, E-R5 | AC-007-07 |
| US-008 | BR-008-01, E-R2/E-R3 | AC-008-01, AC-008-04 |
| US-008 | BR-008-02 `[ĐỀ XUẤT]` | AC-008-02, AC-008-03 `[ĐỀ XUẤT]` |
| US-008 | BR-008-03 | AC-008-04 |
| US-008 | BR-008-04, E-R5 | AC-008-06, AC-008-07 |
| US-009 | BR-009-01, E-R2 | AC-009-01 |
| US-009 | BR-009-02, BR-009-10 `[CẦN XÁC NHẬN]`, E-R4 | AC-009-02 |
| US-009 | BR-009-03, E-R2 | AC-009-03 |
| US-009 | BR-009-04 `[ĐỀ XUẤT]` | AC-009-04 `[ĐỀ XUẤT]` |
| US-009 | BR-009-05 `[ĐỀ XUẤT]` | AC-009-05 `[ĐỀ XUẤT]` |
| US-009 | BR-009-06 `[ĐỀ XUẤT]` | AC-009-06 `[ĐỀ XUẤT]` |
| US-009 | BR-009-07, E-R5 | AC-009-07 |
| US-009 | BR-009-08, E-R2 | AC-009-08, AC-009-09 |
| US-009 | BR-009-09, E-R2 | AC-009-08, AC-009-09, AC-009-10, AC-009-11 |
| US-010 | BR-010-01, E-R3 | AC-010-01, AC-010-02 |
| US-010 | BR-010-02, E-R6 | AC-010-01 |
| US-010 | BR-010-03, E-R6/E-R7 | AC-010-04 |
| US-010 | BR-010-04, E-R8 | AC-010-01 |
| US-011 | BR-011-01 | AC-011-01, AC-011-03 |
| US-011 | BR-011-02, E-R3 | AC-011-01, AC-011-02 |
| US-011 | BR-011-03, E-R6 | AC-011-04 |
| US-011 | BR-011-04, E-R4 `[CẦN XÁC NHẬN]` | AC-011-01, AC-011-05 |
| US-011 | BR-011-05 | AC-011-06 |
| US-012 | BR-012-01 | AC-012-02, AC-012-03, AC-012-05, AC-012-08 |
| US-012 | BR-012-02, E-R2 | AC-012-02, AC-012-03, AC-012-08 |
| US-012 | BR-012-03, E-R3/E-R6 | AC-012-01, AC-012-03 |
| US-012 | BR-012-04, E-R7 | AC-012-04 |
| US-012 | BR-012-05 | AC-012-06 |
| US-012 | BR-012-07, E-R4 | AC-012-07 |
| US-012 | BR-012-08 | AC-012-01, AC-012-02, AC-012-03, AC-012-08 |
| US-013 | BR-013-01, E-R9 | AC-013-01, AC-013-02 |
| US-013 | BR-013-02, E-R9 | AC-013-03, AC-013-04 |
| US-013 | BR-013-03, E-R7 | AC-013-01, AC-013-02, AC-013-03, AC-013-04, AC-013-05 |
| US-013 | BR-013-04 `[CẦN XÁC NHẬN]` | AC-013-06, AC-013-07 |
| US-013 | BR-013-06 | AC-013-01, AC-013-02, AC-013-03, AC-013-04, AC-013-08 |

# Phụ lục D — Câu hỏi mở và mâu thuẫn cần nhóm quyết định

| ID | Câu hỏi quyết định được | Nếu trả lời sai / ảnh hưởng |
|---|---|---|
| Q1 — US-002/005/009 | **Cơ sở tính cọc là gì?** §6.2 quy định 20–50% *giá trị kê khai*; ví dụ US2 tính 30% × *tổng giá thuê* (600k/ngày × 2 ngày = 1,2m; cọc 360k). Chốt một cơ sở và xác định có tỷ lệ mặc định 30% hay Owner chọn trong dải? | Sai cơ sở làm lệch HOLD, giá niêm yết và toàn bộ phân xử/hoàn cọc. **Mâu thuẫn nguồn; không thể chốt AC tài chính trước khi quyết định.** |
| Q2 — US-004/005/008 | **Nhóm trạng thái nào chiếm lịch?** E-R1 nói không có hai Booking chồng ngày; US1 lọc REQUESTED/CONFIRMED; BR-005-01 bổ sung PICKED_UP. Chốt REQUESTED + CONFIRMED + PICKED_UP cùng chiếm lịch? | Sai sẽ tạo double booking hoặc hiển thị sai ngày trống. |
| Q3 — US-005/007/009 | Có phê duyệt **24h chờ duyệt**, trạng thái mới `EXPIRED`, RELEASE cọc, mở lịch và NTF-004 không? Nếu có, quy tắc gia hạn/đồng hồ tính từ lúc nào? | Chưa chốt mà dùng sẽ làm lệch state machine và có thể giải phóng lịch/cọc khi Owner vẫn được phép duyệt. |
| Q4 — US-009/010/011/012 | **48h sau RETURNED** là hạn tự RELEASE; có đồng thời là hạn cuối mở Dispute không? Có cho claim ngoại lệ sau RELEASE? | Ghép hai thời hạn sai có thể tước quyền khiếu nại; tách mà không giữ cọc có thể khiến không còn nguồn DEDUCT. |
| Q5 — US-008/009 | Chốt tiền thuê khi Renter hủy: đề xuất benchmark Getaround >48h hoàn 100%, ≤48h hoàn 50%, sau giờ nhận 0%; cọc HOLD hoàn riêng hay cho phép cấn phí hủy? | Benchmark nói tỷ lệ trên tiền thuê, không phải cọc; nhập nhằng có thể trừ sai ledger hoặc gây tranh chấp. |
| Q6 — US-008/009 | E-R5 giữ nguyên: Owner hủy CONFIRMED → hoàn cọc + voucher có điều kiện + strike. Có thêm phạt tiền mặt 10%/30% theo mốc 24h không? Ai chịu/nhận khoản này khi MVP không có PSP? | Phạt chưa có trong hồ sơ, có thể tạo nghĩa vụ tiền thật ngoài phạm vi; Fat Llama 30% là policy US/CA cụ thể, không phải chuẩn phổ quát. |
| Q7 — US-002/010/011 | Chốt dải cọc 20–50% và mẫu checklist theo category? Ảnh bắt buộc bao nhiêu/tối đa bao nhiêu, định nghĩa “dấu thời gian hợp lệ” và cặp mã một lần ở E-R6? | Thiếu quy tắc cụ thể khiến Owner/Renter không thể hoàn thành cùng một tiêu chuẩn; số ảnh tối đa 10 hiện là chi tiết chưa có nguồn. |
| Q8 — US-004/006/007 | Có cho khách chưa đăng nhập xem tin công khai? NTF-001 hiển thị các trường nào (tên renter, giá/cọc)? Có trạng thái đã đọc/chưa đọc và lưu thông báo bao lâu? | Sai có thể lộ thông tin cá nhân hoặc làm Owner không nhận đủ thông tin; hồ sơ chỉ chốt in-app event. |
| Q9 — US-003/013 | Owner có được bỏ ẩn tin mà Admin đã ẩn? Khóa User còn CONFIRMED/PICKED_UP: (A) chặn khóa; (B) cho khóa nhưng cho phép hoàn tất booking; (C) Admin hủy/điều chỉnh? | Có thể làm gián đoạn giao dịch đang giữ thiết bị hoặc khiến tin vi phạm tái xuất hiện. |
| Q10 — US-012/013 | Lý do Admin/Dispute bắt buộc: độ dài, mã lỗi khi thiếu (đề xuất ERR-USR-023); khóa User có booking đang chạy (ERR-USR-024) — chốt chính sách và mã? Có SLA phân xử không? | Không có audit rationale làm quyết định không thể kiểm tra; lỗi không nhất quán làm khó kiểm thử. |
| Q11 — US-002/003/005 | Chốt validation chưa có trong nguồn: Item bắt buộc ≥1 ảnh/khung rảnh? Khung rảnh trong cùng tin có thể chồng nhau? Renter có được đặt Item của mình? Ngày bắt đầu thuê có thể là hôm nay (múi giờ nào) hay chỉ từ ngày mai? Giá/cọc snapshot tại REQUESTED hay CONFIRMED? | Có thể tạo tin/đặt thuê không hợp lệ, lỗi double-booking hoặc số tiền khác cam kết; các điều kiện cần được ratify trước khi coi AC là contract cuối. |
| Q12 — US-001 | Chốt thời hạn sống phiên đăng nhập và cách xử lý khi tài khoản bị khóa trong phiên đang mở? | Hiện lỗi ERR-SYS-003 được định nghĩa nhưng thời hạn phiên chưa có số; phiên cũ có thể tiếp tục quyền sau khóa. |

## Mâu thuẫn / giới hạn đã phát hiện khi hợp nhất

1. **Dải cọc và cơ sở tính không thống nhất:** §6.2 dùng % giá trị kê khai; ví dụ US2 dùng % tổng giá thuê. Đánh dấu Q1, không tự sửa.
2. **Nhóm trạng thái chiếm lịch không thống nhất:** spec US1 bỏ REQUESTED/CONFIRMED; BR-005-01 gồm REQUESTED/CONFIRMED/PICKED_UP. Dùng danh sách BR-005-01 làm đề xuất đồng bộ nhưng cần nhóm chốt Q2.
3. **48h Dispute window không có trong source:** E-R4 đặt điều kiện tự RELEASE, không đặt deadline cho khiếu nại. Đã sửa câu chữ trong US-009/011/012 để không coi hạn mở khiếu nại 48h là rule đã chốt; BR-009-10/BR-011-04 được gắn `[CẦN XÁC NHẬN]`.
4. **EXPIRED không nằm trong Booking state machine nguồn:** hết hạn 24h chỉ là đề xuất; không được trộn vào tập trạng thái đã ratify.
5. **Vai:** role nghiệp vụ của mỗi story giữ nguyên theo nguồn; System là actor tự động, không phải vai RBAC người dùng. Cọc do System tự HOLD/auto-RELEASE, Admin là bên quyết định phân xử DEDUCT/RELEASE theo E-R2; không có vai “trung gian” thứ tư.
6. **Một số chi tiết AC do yêu cầu testability nhưng hồ sơ không chốt** (độ dài tìm kiếm, ảnh tối đa 10, ảnh JPG/PNG, trạng thái đọc thông báo, lỗi self-rental, session timeout duration). Những mục này phải được duyệt ở Q8/Q11/Q12 trước khi coi là acceptance contract cuối.