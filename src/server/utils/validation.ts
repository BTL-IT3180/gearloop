import type { ZodType } from "zod";
import type { ValidationErrorCode } from "../../lib/error-catalog";
import { AppError } from "../errors";

// Caller chọn mã đúng ngữ cảnh; không dùng lỗi thiếu trường tin đăng cho mọi form.
export function parseInput<T>(
  schema: ZodType<T>,
  input: unknown,
  code: ValidationErrorCode,
  fields?: readonly string[],
): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new AppError(code, fields, 400);
  return result.data;
}

export async function parseJsonInput<T>(
  request: Request,
  schema: ZodType<T>,
  code: ValidationErrorCode,
  fields?: readonly string[],
): Promise<T> {
  let input: unknown;
  try {
    input = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new AppError(code, fields, 400);
    throw error;
  }
  return parseInput(schema, input, code, fields);
}
