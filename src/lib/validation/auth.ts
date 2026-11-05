import { z } from "zod";
import { errorMessage } from "../error-catalog";

const message = errorMessage("ERR-USR-010");
// Không trim password và không tự đặt chính sách độ dài mật khẩu mới.
export const loginSchema = z.object({
  email: z.string({ required_error: message, invalid_type_error: message }).trim().email(message),
  password: z.string({ required_error: message, invalid_type_error: message }).min(1, message),
}, { required_error: message, invalid_type_error: message });

export type LoginInput = z.infer<typeof loginSchema>;
