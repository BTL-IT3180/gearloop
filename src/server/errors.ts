// Mirror của src/errors.js ở template: mọi lỗi nghiệp vụ đi qua AppError,
// route handler bắt và chuyển thành JSON { error } với mã HTTP tương ứng.
export class AppError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string) => new AppError(400, message);
export const unauthorized = (message = "Chưa đăng nhập") =>
  new AppError(401, message);
export const forbidden = (message = "Không đủ quyền") =>
  new AppError(403, message);
export const notFound = (message = "Không tìm thấy") =>
  new AppError(404, message);
export const conflict = (message: string) => new AppError(409, message);
