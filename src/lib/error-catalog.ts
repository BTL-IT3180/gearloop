// Nguồn: gearloop_user_story_specs.md, Phụ lục B4. Pending không được dùng runtime.
export const errorCatalog = {
  "ERR-USR-001": { status: 409, message: "Khung ngày bạn chọn đã có người đặt. Vui lòng chọn khung ngày khác." },
  "ERR-USR-002": { status: 400, message: "Ngày bắt đầu phải từ hôm nay trở đi." },
  "ERR-USR-003": { status: 400, message: "Ngày kết thúc phải sau ngày bắt đầu." },
  "ERR-USR-004": { status: 404, message: "Tin đăng hiện không khả dụng." },
  "ERR-USR-005": { status: 400, message: "Vui lòng điền đầy đủ các trường bắt buộc: {danh sách trường}." },
  "ERR-USR-006": { status: 400, message: "Giá thuê phải lớn hơn 0. Mức cọc phải từ 20% đến 50%.", pending: "Chưa chốt giá > 0 và dải cọc 20–50%." },
  "ERR-USR-007": { status: 409, message: "Lượt thuê đã bắt đầu, không thể hủy. Vui lòng liên hệ hỗ trợ." },
  "ERR-USR-008": { status: 403, message: "Bạn không có quyền thực hiện thao tác này." },
  "ERR-USR-009": { status: 409, message: "Yêu cầu thuê không ở trạng thái chờ duyệt." },
  "ERR-USR-010": { status: 401, message: "Thông tin đăng nhập không đúng." },
  "ERR-USR-011": { status: 403, message: "Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên." },
  "ERR-USR-012": { status: 409, message: "Đã quá thời hạn mở khiếu nại.", pending: "Cần đối chiếu cửa sổ claim với quy tắc hiện tại trước khi tích hợp." },
  "ERR-USR-013": { status: 400, message: "Vui lòng hoàn thành biên bản tình trạng thiết bị trước khi tiếp tục." },
  "ERR-USR-014": { status: 400, message: "Mức cọc phải từ 20% đến 50% giá trị kê khai.", pending: "Chưa chốt dải cọc 20–50%." },
  "ERR-USR-015": { status: 409, message: "Yêu cầu thuê đã hết hạn.", pending: "Schema hiện tại không có EXPIRED." },
  "ERR-USR-016": { status: 409, message: "Lượt thuê chưa được chủ đồ xác nhận." },
  "ERR-USR-017": { status: 409, message: "Lượt thuê chưa ở trạng thái đang thuê." },
  "ERR-USR-018": { status: 409, message: "Khiếu nại không ở trạng thái chờ phân xử." },
  "ERR-USR-019": { status: 400, message: "Tỷ lệ trừ cọc phải từ 0% đến 100%." },
  "ERR-USR-020": { status: 409, message: "Không thể ẩn tin đăng khi còn lượt thuê đang diễn ra." },
  "ERR-USR-021": { status: 409, message: "Bạn hủy trong vòng 48 giờ trước giờ nhận. Chính sách hoàn tiền cần được nhóm chốt.", pending: "Chưa chốt chính sách hủy muộn; đây có thể là cảnh báo." },
  "ERR-USR-022": { status: 400, message: "Bạn không thể đặt thuê thiết bị của chính mình.", pending: "Chưa chốt quy tắc tự đặt thuê." },
  "ERR-USR-023": { status: 400, message: "Vui lòng nhập lý do xử lý.", pending: "Chưa chốt ràng buộc lý do xử lý." },
  "ERR-USR-024": { status: 409, message: "Không thể khóa tài khoản khi còn lượt thuê đang diễn ra.", pending: "Chưa chốt quy trình khóa tài khoản đang có booking." },
  "ERR-SYS-001": { status: 500, message: "Hệ thống gặp sự cố. Vui lòng thử lại sau. Mã lỗi: ERR-SYS-001." },
  "ERR-SYS-002": { status: 409, message: "Thao tác không thể hoàn thành do xung đột dữ liệu. Vui lòng thử lại. Mã lỗi: ERR-SYS-002." },
  "ERR-SYS-003": { status: 401, message: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại. Mã lỗi: ERR-SYS-003." },
} as const;

export type ErrorCode = keyof typeof errorCatalog;
export type ActiveErrorCode = {
  [Code in ErrorCode]: (typeof errorCatalog)[Code] extends { pending: string } ? never : Code;
}[ErrorCode];
export type ValidationErrorCode = {
  [Code in ActiveErrorCode]: (typeof errorCatalog)[Code]["status"] extends 400 ? Code : never;
}[ActiveErrorCode] | "ERR-USR-010";

export function errorMessage(code: ActiveErrorCode, fields?: readonly string[]): string {
  const entry = errorCatalog[code];
  if ("pending" in entry) throw new Error("Error code is pending review");
  if (code === "ERR-USR-005") {
    if (!fields?.length || fields.some((field) => !field.trim())) {
      throw new Error("ERR-USR-005 requires field labels");
    }
    return entry.message.replace("{danh sách trường}", fields.join(", "));
  }
  return entry.message;
}
