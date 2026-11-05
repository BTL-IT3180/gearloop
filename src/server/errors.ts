import { errorCatalog, errorMessage, type ActiveErrorCode } from "../lib/error-catalog";

// Thông điệp và HTTP status lấy từ cùng catalog, không nhận chuỗi lỗi tùy ý.
export class AppError extends Error {
  public readonly status: number;

  constructor(
    public readonly code: ActiveErrorCode,
    fields?: readonly string[],
    // Cùng mã login: input sai cấu trúc là 400, xác thực sai là 401.
    validationStatus?: 400,
  ) {
    super(errorMessage(code, fields));
    this.status = validationStatus ?? errorCatalog[code].status;
    this.name = "AppError";
  }
}

// Giữ các guard đang dùng requireRole; không thay đổi điều kiện phân quyền.
export const unauthorized = () => new AppError("ERR-SYS-003");
export const forbidden = () => new AppError("ERR-USR-008");
