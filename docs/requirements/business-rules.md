# GearLoop — Quy tắc nghiệp vụ

> Quy tắc nền E-R1…E-R9, registry 68 quy tắc cục bộ theo story, quy tắc sống
> còn, tham số chính sách và các quyết định còn mở của GearLoop.

Nguồn chính: `prod.md` cũ §2 (đã hợp nhất và xóa khỏi repo; xem git history) ·
[../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md)
(§5 từng story, Phụ lục A–D) ·
[../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md) ·
[../planning/gearloop_project_plan.md](../planning/gearloop_project_plan.md) §7.2 ·
[../architecture/database-design.md](../architecture/database-design.md) §5 ·
[../architecture/adrs/007-rbac-3-roles.md](../architecture/adrs/007-rbac-3-roles.md).

## 1. Quy tắc nền E-R1…E-R9

`E-Rn` là quy tắc nền giữ nguyên mã nguồn (specs §5, Phụ lục C). Cột "Nơi áp
dụng" liệt kê story/nơi quy tắc được dùng.

| Mã | Nội dung (một dòng) | Nơi áp dụng |
| --- | --- | --- |
| E-R1 | Không đặt chồng: một (Item, ngày) chỉ một dòng lịch; nhóm trạng thái chiếm lịch chặn trùng (tập trạng thái cụ thể còn mở — Q2) | US-003, US-004, US-005, CalendarDay `UNIQUE(itemId, date)` |
| E-R2 | Tạo Booking thành công ⇒ sinh `DepositLedger(HOLD)`; chỉ Admin chuyển RELEASE/DEDUCT qua phân xử; sổ cái append-only, hệ thống tự RELEASE theo E-R4/đường hủy hợp lệ | US-005, US-009, US-012 |
| E-R3 | Booking phải hoàn thành `ConditionReport` bắt buộc trước khi đổi trạng thái (cổng PICKUP/RETURN) | US-010, US-011 |
| E-R4 | 48h sau `RETURNED` không có khiếu nại ⇒ hệ thống tự `RELEASE` (đồng hồ mô phỏng) | US-009, US-011, US-012 |
| E-R5 | Owner hủy Booking `CONFIRMED` trước giờ nhận ⇒ hoàn 100% tiền thuê + RELEASE 100% cọc + voucher có điều kiện + 1 strike cho Owner | US-007, US-008, US-009 |
| E-R6 | Không lưu vị trí/thói quen sử dụng; xác minh bàn giao bằng checklist kép + ảnh có dấu thời gian + cặp mã một lần | US-004, US-010, US-011, US-012 |
| E-R7 | Người thuê không tự sửa lịch sau khi duyệt; không ai xóa lịch sử giao dịch (append-only) | US-005, US-008, US-012, US-013 |
| E-R8 | Bàn giao tại điểm PickupPoint do Admin quản lý; không lưu/hiển thị địa chỉ nhà riêng | US-004, US-005, US-010, US-011 |
| E-R9 | Admin ẩn Item vi phạm và khóa tài khoản vi phạm (không xóa cứng) | US-001, US-004, US-013 |

## 2. Registry quy tắc cục bộ (68 mục — US-001…US-013)

Quy ước trạng thái: giữ đúng nhãn gốc của specs. Theo quy ước specs (dòng 5:
"mọi tham số chưa phê chuẩn được đánh dấu `[ĐỀ XUẤT — CẦN NHÓM CHỐT]` hoặc
`[CẦN XÁC NHẬN]`"), quy tắc **không gắn nhãn** được ghi nhận ở đây là **Đã
chốt**. Cột "Nguồn" trỏ tới §5 của story tương ứng trong specs kèm số dòng.

### US-001 — Đăng nhập & phân quyền (5)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-001-01 | Mỗi phiên chỉ một người dùng, một vai; kiểm tra phiên + phạm vi vai trước thao tác nhạy cảm | Đã chốt | specs §5 US-001 (dòng 89) |
| BR-001-02 | Đăng xuất vô hiệu hóa phiên tức thì; mọi yêu cầu mang phiên cũ không hợp lệ | Đã chốt | specs §5 US-001 (dòng 90) |
| BR-001-03 | Sai định danh hoặc sai mật khẩu trả cùng một lỗi chung, không tiết lộ tài khoản tồn tại | Đã chốt | specs §5 US-001 (dòng 91) |
| BR-001-04 | Tài khoản `LOCKED` không được tạo phiên mới cho tới khi Admin mở khóa | Đã chốt | specs §5 US-001 (dòng 92) |
| BR-001-05 | Phiên có thời hạn hiệu lực tối đa **8 giờ** (Q12 đã chốt 13/11/2026) | Đã chốt | specs §5 US-001 (dòng 93); [../architecture/adrs/008-session-thoi-luong.md](../architecture/adrs/008-session-thoi-luong.md) |

### US-002 — Đăng tin cho thuê (4)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-002-01 | Tin hợp lệ bắt buộc: tiêu đề, mô tả, tình trạng, ≥1 ảnh thực tế, giá/ngày nguyên dương, giá trị kê khai nguyên dương | Đã chốt | specs §5 US-002 (dòng 198) |
| BR-002-02 | Mức cọc nằm trong dải 20%–50% giá trị kê khai (cơ sở tính còn mâu thuẫn — Q1) | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-002 (dòng 199–200) |
| BR-002-03 | Tin phải có ≥1 khung ngày rảnh trong tương lai; ngày bắt đầu ≥ hôm nay, ngày kết thúc > ngày bắt đầu | Đã chốt (kèm ghi chú [CẦN XÁC NHẬN] về cấm khung rảnh tự chồng lấn) | specs §5 US-002 (dòng 201) |
| BR-002-04 | Chỉ tài khoản OWNER không bị khóa được tạo tin | Đã chốt | specs §5 US-002 (dòng 202) |

### US-003 — Quản lý tin đã đăng (4)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-003-01 | Owner chỉ xem/cập nhật/ẩn tin do chính mình tạo | Đã chốt | specs §5 US-003 (dòng 1093) |
| BR-003-02 | Sửa giá/cọc/mô tả chỉ áp dụng cho booking tạo mới; không hồi tố booking đã tạo | Đã chốt | specs §5 US-003 (dòng 1094) |
| BR-003-03 | Khi sửa/xóa khung rảnh, không được xóa/thu hẹp khoảng ngày đã có booking CONFIRMED/REQUESTED | [CẦN XÁC NHẬN] | specs §5 US-003 (dòng 1095) |
| BR-003-04 | Chỉ được chuyển tin OPEN → HIDDEN khi không có booking CONFIRMED/PICKED_UP | Đã chốt | specs §5 US-003 (dòng 1096) |

### US-004 — Tìm & xem tin cho thuê (4)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-004-01 | Chỉ Item sẵn sàng (OPEN), không bị ẩn/archived, thuộc Owner hoạt động mới hiển thị công khai | Đã chốt | specs §5 US-004 (dòng 284) |
| BR-004-02 | Lọc theo khoảng ngày loại bỏ Item có booking chiếm lịch giao thoa (đối chiếu tập trạng thái — Q2) | Đã chốt | specs §5 US-004 (dòng 285) |
| BR-004-03 | Chi tiết tin niêm yết rõ giá/ngày, tỷ lệ cọc trên giá trị kê khai, danh sách PickupPoint; không hiện địa chỉ nhà riêng | Đã chốt | specs §5 US-004 (dòng 286) |
| BR-004-04 | Tin bị Admin ẩn hoặc Owner bị khóa thì mọi yêu cầu đọc chi tiết bị từ chối | Đã chốt | specs §5 US-004 (dòng 287) |

### US-005 — Đặt thuê theo khung ngày (6)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-005-01 | Không tồn tại 2 booking giao nhau trên một Item khi thuộc nhóm trạng thái chiếm lịch; bảo vệ bằng giao dịch tuần tự độc lập | Đã chốt | specs §5 US-005 (dòng 380) |
| BR-005-02 | Booking phải snapshot đơn giá, tỷ lệ cọc và PickupPoint; thay đổi Item sau đó không đổi nghĩa vụ tài chính của booking | Đã chốt | specs §5 US-005 (dòng 381) |
| BR-005-03 | Booking REQUESTED bắt buộc sinh bản ghi HOLD trong sổ cái cọc append-only | Đã chốt | specs §5 US-005 (dòng 382) |
| BR-005-04 | Chờ duyệt tối đa 24h; quá hạn tự hủy trạng thái chờ (EXPIRED), giải phóng lịch, hoàn cọc | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-005 (dòng 383) |
| BR-005-05 | Mọi booking gắn đúng một PickupPoint hợp lệ; không cho nhập địa chỉ cá nhân | Đã chốt | specs §5 US-005 (dòng 384) |
| BR-005-06 | Chặn ngày thuê bắt đầu trước hôm nay (mốc ngày địa phương và việc cho phép hôm nay còn mở) | [CẦN XÁC NHẬN] | specs §5 US-005 (dòng 385) |

### US-006 — Nhận thông báo yêu cầu thuê (3)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-006-01 | Sự kiện NTF-001 phát tự động khi booking ở REQUESTED; người nhận duy nhất là Owner của Item | Đã chốt | specs §5 US-006 (dòng 465) |
| BR-006-02 | Thông báo dạng in-app log; danh sách của Owner chỉ chứa sự kiện gửi tới chính tài khoản đó | Đã chốt | specs §5 US-006 (dòng 466) |
| BR-006-03 | Màn hình chi tiết từ thông báo phải phản ánh trạng thái hiện thời của booking; đọc/chưa đọc và thời điểm hết hiệu lực còn mở | [CẦN XÁC NHẬN] | specs §5 US-006 (dòng 467) |

### US-007 — Duyệt / từ chối yêu cầu thuê (5)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-007-01 | Chỉ duyệt được khi booking đúng trạng thái REQUESTED; duyệt → CONFIRMED, khóa lịch chính thức | Đã chốt | specs §5 US-007 (dòng 556) |
| BR-007-02 | Từ chối khi REQUESTED → CANCELLED, ghi RELEASE 100% HOLD (tự nhả khung ngày là [ĐỀ XUẤT]) | Đã chốt (kèm ghi chú [ĐỀ XUẤT — CẦN NHÓM CHỐT] về tự giải phóng khung ngày) | specs §5 US-007 (dòng 557) |
| BR-007-03 | Thời hạn tối đa để Owner phản hồi là 24h kể từ lúc tạo; quá hạn coi như hết hạn, RELEASE cọc, Owner không duyệt tiếp | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-007 (dòng 558) |
| BR-007-04 | Chỉ Owner sở hữu món đồ trong đơn có quyền duyệt/từ chối | Đã chốt | specs §5 US-007 (dòng 559) |
| BR-007-05 | Ranh giới: từ chối khi REQUESTED không phạt Owner; Owner hủy sau CONFIRMED theo E-R5 (phạt tiền mặt 10%/30% là đề xuất; người nhận voucher còn mở) | Đã chốt (cơ chế) + [ĐỀ XUẤT — CẦN NHÓM CHỐT] (phạt tiền) + [CẦN XÁC NHẬN] (người nhận voucher) | specs §5 US-007 (dòng 560) |

### US-008 — Hủy lượt thuê chưa bắt đầu (4)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-008-01 | Chỉ hủy được khi booking ở REQUESTED hoặc CONFIRMED (trước PICKED_UP); sau PICKED_UP chỉ đóng qua trả đồ/khiếu nại | Đã chốt | specs §5 US-008 (dòng 639) |
| BR-008-02 | Chính sách hoàn tiền khi Renter hủy: REQUESTED hoàn 100%; CONFIRMED >48h hoàn 100%; ≤48h hoàn 50% tiền thuê; cọc luôn RELEASE 100% | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-008 (dòng 640–645) |
| BR-008-03 | Hủy không xóa booking vật lý — chỉ chuyển CANCELLED để đối soát | Đã chốt | specs §5 US-008 (dòng 646) |
| BR-008-04 | Owner hủy CONFIRMED: hoàn 100% tiền thuê + RELEASE 100% cọc + voucher + strike (tỷ lệ phạt tiền là đề xuất) | Đã chốt (cơ chế) + [ĐỀ XUẤT — CẦN NHÓM CHỐT] (tỷ lệ phạt) | specs §5 US-008 (dòng 647) |

### US-009 — Giữ & xử lý cọc trung gian (10)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-009-01 | Booking REQUESTED ⇒ tính cọc = giá/ngày × số ngày × tỷ lệ cọc snapshot, ghi một bản ghi HOLD duy nhất (cơ sở tính % còn mở — Q1) | Đã chốt | specs §5 US-009 (dòng 767) |
| BR-009-02 | 48h sau RETURNED không khiếu nại ⇒ tự RELEASE 100% HOLD và chuyển booking sang CLOSED (đối soát khi truy vấn) | Đã chốt | specs §5 US-009 (dòng 768) |
| BR-009-03 | Owner từ chối booking REQUESTED ⇒ tự tạo RELEASE 100% HOLD | Đã chốt | specs §5 US-009 (dòng 769) |
| BR-009-04 | Quá 24h Owner không phản hồi ⇒ hủy trạng thái chờ, RELEASE 100% HOLD, giải phóng lịch, phát NTF-004 | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-009 (dòng 770) |
| BR-009-05 | Renter hủy >48h trước giờ nhận ⇒ RELEASE 100% HOLD và hoàn 100% tiền thuê | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-009 (dòng 771) |
| BR-009-06 | Renter hủy ≤48h trước giờ nhận ⇒ RELEASE 100% HOLD (cọc không cấn phạt); giữ 50% tiền thuê, hoàn 50% | [ĐỀ XUẤT — CẦN NHÓM CHỐT] | specs §5 US-009 (dòng 772) |
| BR-009-07 | Owner hủy booking CONFIRMED ⇒ RELEASE 100% HOLD + hoàn 100% tiền thuê + voucher + strike (mức phạt tiền 10%/30% là đề xuất) | Đã chốt (cơ chế hoàn cọc + voucher + strike) + [ĐỀ XUẤT — CẦN NHÓM CHỐT] (tham số phạt tiền) | specs §5 US-009 (dòng 773) |
| BR-009-08 | Chỉ Admin qua phân xử mới được tạo DEDUCT (0–100% HOLD) và RELEASE phần còn lại; lưu vết admin/thời điểm/lý do, booking → RESOLVED | Đã chốt | specs §5 US-009 (dòng 774) |
| BR-009-09 | Sổ cái cọc bất biến append-only; không Update/Delete; Tổng(RELEASE) + Tổng(DEDUCT) ≤ HOLD | Đã chốt | specs §5 US-009 (dòng 775) |
| BR-009-10 | Cửa sổ mở khiếu nại hư hỏng chưa có trong hồ sơ; đề xuất 48h kể từ RETURNED (đồng bộ E-R4); đã có Dispute thì không tự hoàn cọc | [CẦN XÁC NHẬN] | specs §5 US-009 (dòng 776) |

### US-010 — Xác nhận nhận đồ (4)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-010-01 | Booking không được chuyển CONFIRMED → PICKED_UP nếu chưa có ConditionReport PICKUP đầy đủ mục và ảnh | Đã chốt | specs §5 US-010 (dòng 892) |
| BR-010-02 | Bằng chứng nhận đồ: checklist OK/NOT_OK, ghi chú khuyết tật, ảnh có dấu thời gian; không thu thập vị trí/thói quen | Đã chốt | specs §5 US-010 (dòng 893) |
| BR-010-03 | ConditionReport sau xác nhận khóa chỉ-đọc; kể cả Owner/Admin không được sửa/xóa | Đã chốt | specs §5 US-010 (dòng 894) |
| BR-010-04 | Kiểm tra và nhận đồ tại đúng PickupPoint đã chốt trong booking | Đã chốt | specs §5 US-010 (dòng 895) |

### US-011 — Xác nhận trả đồ (5)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-011-01 | Chỉ xác nhận trả đồ khi booking đúng PICKED_UP; thành công ⇒ chuyển RETURNED | Đã chốt | specs §5 US-011 (dòng 990) |
| BR-011-02 | Không chuyển PICKED_UP → RETURNED nếu chưa có ConditionReport RETURN đầy đủ mục và ≥1 ảnh có dấu thời gian | Đã chốt | specs §5 US-011 (dòng 991) |
| BR-011-03 | Biên bản nhận–trả lưu hạng mục, mô tả, ảnh có dấu thời gian; sau xác nhận không sửa/xóa | Đã chốt | specs §5 US-011 (dòng 992) |
| BR-011-04 | 48h sau RETURNED không Dispute ⇒ tự RELEASE (E-R4); việc coi 48h là hạn chót mở khiếu nại cần xác nhận | Đã chốt (theo E-R4) + [CẦN XÁC NHẬN] (cửa sổ Dispute) | specs §5 US-011 (dòng 993) |
| BR-011-05 | Chỉ Owner sở hữu thiết bị mới được lập biên bản RETURN và xác nhận đã nhận lại đồ | Đã chốt | specs §5 US-011 (dòng 994) |

### US-012 — Phân xử tranh chấp hư hỏng (8)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-012-01 | Điều kiện phân xử: booking ở RETURNED và có Dispute OPEN/UNDER_REVIEW; phân xử xong Dispute → RESOLVED_DEDUCT/RESOLVED_RELEASE và booking → RESOLVED | Đã chốt | specs §5 US-012 (dòng 1214) |
| BR-012-02 | Mỗi phán quyết ánh xạ thành các dòng append-only trên sổ cái; Tổng DEDUCT + RELEASE ≤ HOLD; không sửa/xóa | Đã chốt | specs §5 US-012 (dòng 1215) |
| BR-012-03 | Căn cứ phân xử là so sánh trực diện 2 ConditionReport PICKUP/RETURN kèm ảnh có dấu thời gian; bằng chứng không đủ thì bác và hoàn 100% cọc | Đã chốt | specs §5 US-012 (dòng 1216) |
| BR-012-04 | Mọi phán quyết phải có lý do bằng văn bản và lưu `admin_id` + mốc thời gian để kiểm toán nội bộ | Đã chốt | specs §5 US-012 (dòng 1217) |
| BR-012-05 | Tỷ lệ trừ cọc x% do Admin chỉ định phải trong đoạn [0%, 100%]; số tiền trừ ≤ HOLD hiện hữu | Đã chốt | specs §5 US-012 (dòng 1218) |
| BR-012-06 | Chỉ ADMIN truy cập thông tin khiếu nại toàn sàn và ký duyệt phán quyết xử lý cọc | Đã chốt | specs §5 US-012 (dòng 1219) |
| BR-012-07 | Quan hệ với bộ đếm tự hoàn: đã có Dispute OPEN/UNDER_REVIEW thì điều kiện "không khiếu nại" không thành lập nên hệ thống không tự hoàn; mốc cuối mở Dispute chưa xác định | Đã chốt (quan hệ với E-R4) + [CẦN XÁC NHẬN] (thời hạn mở khiếu nại) | specs §5 US-012 (dòng 1220) |
| BR-012-08 | Mở khiếu nại phát NTF-010 cho phía đối diện + Admin; Admin chốt phán quyết phát NTF-011 cho Owner + Renter | Đã chốt | specs §5 US-012 (dòng 1221) |

### US-013 — Quản trị người dùng & tin đăng (6)

| Mã | Tóm tắt | Trạng thái | Nguồn |
| --- | --- | --- | --- |
| BR-013-01 | Admin khóa ACTIVE → LOCKED và mở khóa LOCKED → ACTIVE; tài khoản LOCKED bị từ chối đăng nhập (ERR-USR-011) | Đã chốt | specs §5 US-013 (dòng 1370) |
| BR-013-02 | Admin ẩn OPEN → HIDDEN và bỏ ẩn HIDDEN → OPEN; tin HIDDEN không hiển thị công khai và không nhận booking mới | Đã chốt | specs §5 US-013 (dòng 1371) |
| BR-013-03 | Không xóa vật lý user/item — chỉ đổi trạng thái; mọi thao tác quản trị ghi vết admin/thời điểm/hành động/lý do/trạng thái trước→sau, không sửa/xóa | Đã chốt | specs §5 US-013 (dòng 1372) |
| BR-013-04 | Ràng buộc booking đang chạy: khóa user còn CONFIRMED/PICKED_UP phải xử lý booking trước (cơ chế chưa chốt); ẩn item còn booking bị từ chối với ERR-USR-020 | Phần khóa User: [CẦN XÁC NHẬN]; phần ẩn Item: Đã chốt | specs §5 US-013 (dòng 1373) |
| BR-013-05 | Khóa tài khoản phát NTF-012 cho người bị khóa; ẩn tin phát NTF-013 cho Owner; mở khóa/bỏ ẩn không có sự kiện riêng | Đã chốt | specs §5 US-013 (dòng 1374) |
| BR-013-06 | Chỉ ADMIN được khóa/mở khóa tài khoản và ẩn/bỏ ẩn tin; vai khác thao tác bị từ chối với ERR-USR-008 | Đã chốt | specs §5 US-013 (dòng 1375) |

## 3. Quy tắc nghiệp vụ sống còn

Tám quy tắc deterministic, không AI, ở tầng sản phẩm (Nguồn: `prod.md` cũ §2,
từng mục được hợp nhất vào đây):

1. **Không đặt chồng**: một (item, ngày) chỉ một dòng lịch — chặn ở DB
   (E-R1; `UNIQUE(itemId, date)`).
2. **Cọc giữ trước**: đặt booking → `DEPOSIT_HELD`; trả đủ sau cửa sổ claim →
   `RELEASE` (E-R2).
3. **Cửa sổ claim 48h** (`policy_settings.claim_window_hours`): hết giờ không
   claim → hệ thống tự nhả cọc. Có NOT_OK ở biên bản trả → Renter/Owner mở
   claim (E-R4).
4. **Award ≤ deposit**: Admin quyết số tiền, hệ thống chặn vượt cọc (E-R2).
5. **Snapshot tiền**: sửa giá không ảnh hưởng booking đã tạo.
6. **Sổ cọc append-only**; **audit log append-only** (E-R7).
7. **Hủy trước PICKED_UP**: lịch trả `FREE`, ledger `VOID`. Sau PICKED_UP: chỉ
   đường claim.
8. **Suspension**: `suspension_threshold` vi phạm trong 30 ngày → Admin khóa
   (S3+; cơ chế `is_active` có từ S1) (E-R9).

## 4. Tham số chính sách

| Khóa `PolicySetting` | Giá trị | Ý nghĩa | Trạng thái | Nguồn |
| --- | --- | --- | --- | --- |
| `claim_window_hours` | 48 | Số giờ sau RETURNED không khiếu nại thì tự nhả cọc | Đã chốt 48h | specs Phụ lục A ("48h giữ nguyên"); E-R4; [../architecture/database-design.md](../architecture/database-design.md) §5; `src/db/seed.ts` |
| `deposit_cap_percent` | 50 | Chặn trên % cọc trên giá trị kê khai của `DepositPolicy` | [ĐỀ XUẤT — CẦN NHÓM CHỐT] (dải 20–50%; cơ sở tính còn mở — Q1) | specs Phụ lục A (mục "Mức cọc"); specs §5 US-002/BR-002-02; `prisma/schema.prisma`; `src/db/seed.ts` |
| `suspension_threshold` | 3 vi phạm / 30 ngày | Số lần vi phạm trong 30 ngày trước khi tự khóa tài khoản | Ghi trong hồ sơ sản phẩm + seed; không có nhãn đề xuất/cần xác nhận | `prod.md` cũ §2.8; `src/db/seed.ts` (khóa `suspension_threshold`) |

Ghi chú: `PolicySetting` là bảng key–value, ba khóa trên là ba dòng seed mặc
định. Cửa sổ mở khiếu nại (khác `claim_window_hours`) chưa được chốt — xem Q4.
Độ dài phiên đăng nhập đã chốt 13/11/2026: **8 giờ**
([ADR-008](../architecture/adrs/008-session-thoi-luong.md)); phần còn lại của
Q12 (xử lý phiên đang mở khi tài khoản bị khóa) vẫn mở.

## 5. Quyết định mở Q1–Q14

Danh sách quyết định còn mở (một dòng mỗi mục); bảng đầy đủ kèm task bị ảnh
hưởng, hạn chốt và fallback nằm ở
[../planning/gearloop_project_plan.md](../planning/gearloop_project_plan.md) §7.2
và [../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md)
Phụ lục D. Theo dõi trạng thái chốt tại
[../planning/backlog.md](../planning/backlog.md).

| ID | Quyết định cần chốt |
| --- | --- |
| Q1 | Cơ sở tính % cọc (giá trị kê khai hay tổng tiền thuê) và tỷ lệ cố định 30% hay Owner chọn trong dải |
| Q2 | Nhóm trạng thái nào chiếm lịch (REQUESTED + CONFIRMED + PICKED_UP?) |
| Q3 | Có phê duyệt hết hạn 24h chờ duyệt, trạng thái `EXPIRED`, RELEASE cọc, mở lịch, NTF-004? |
| Q4 | 48h sau RETURNED vừa là hạn tự RELEASE vừa là hạn cuối mở Dispute? Có cho claim ngoại lệ sau RELEASE? |
| Q5 | Chính sách hủy muộn của Renter (mốc 48h; hoàn 100%/50%/0% trên tiền thuê) |
| Q6 | Có thêm phạt tiền mặt 10%/30% khi Owner hủy (ngoài E-R5: strike + voucher)? |
| Q7 | Quy chuẩn ảnh/checklist bắt buộc: số ảnh, định dạng, "dấu thời gian hợp lệ", mẫu checklist theo danh mục |
| Q8 | Khách chưa đăng nhập xem tin công khai? Trường tối thiểu của thông báo NTF-001? Trạng thái đã đọc và thời gian lưu thông báo? |
| Q9 | Owner có được bỏ ẩn tin Admin đã ẩn? Khóa user còn CONFIRMED/PICKED_UP xử lý thế nào (A/B/C)? |
| Q10 | Lý do phân xử/quản trị bắt buộc: độ dài, mã lỗi thiếu lý do (ERR-USR-023/024), SLA phân xử |
| Q11 | Validation bổ sung: self-booking, thời điểm snapshot giá/cọc, ngày bắt đầu = hôm nay (múi giờ nào) |
| Q12 | Thời hạn sống của phiên đăng nhập — **đã chốt 13/11/2026: 8 giờ** ([ADR-008](../architecture/adrs/008-session-thoi-luong.md)); còn mở: cách xử lý khi tài khoản bị khóa trong phiên đang mở |
| Q13 | US-012 (phân xử) Should → Must? |
| Q14 | Chat/thương lượng giá có làm trong 6 tuần (đề xuất giữ Won't)? |

## 6. Liên kết liên quan

- Đặc tả AC từng story:
  [../user-stories/gearloop_user_story_specs.md](../user-stories/gearloop_user_story_specs.md)
  (§4 AC, §5 BR, Phụ lục B trạng thái/lỗi/thông báo, Phụ lục C truy vết).
- Story nền và MoSCoW/sprint:
  [../user-stories/gearloop_user_stories.md](../user-stories/gearloop_user_stories.md).
- Vòng đời booking/cọc và ràng buộc DB:
  [../architecture/database-design.md](../architecture/database-design.md) §4–§5.
- Ma trận quyền và mô hình miền: [./domain-model.md](./domain-model.md).
- Yêu cầu chức năng: [./functional-requirements.md](./functional-requirements.md).
