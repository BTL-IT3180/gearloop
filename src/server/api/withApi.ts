import { NextResponse } from "next/server";
import type { ApiFailure, ApiSuccess } from "../../lib/api-response";
import { AppError } from "../errors";

type RouteContext = { params: Promise<Record<string, string>> };

// Khuôn mẫu chung của mọi API route (mirror ADR-006 của template):
// handler chỉ trả data; helper gói { data } và bắt AppError thành { error, code }.
export function withApi<T>(
  handler: (req: Request, ctx: RouteContext) => Promise<T>,
) {
  return async (req: Request, ctx: RouteContext) => {
    try {
      const data = await handler(req, ctx);
      return NextResponse.json({ data } satisfies ApiSuccess<T>);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, code: error.code } satisfies ApiFailure,
          { status: error.status },
        );
      }
      // Không log exception thô: có thể chứa request, thông tin DB hoặc secret.
      console.error("[api] unhandled error");
      const fallback = new AppError("ERR-SYS-001");
      return NextResponse.json(
        { error: fallback.message, code: fallback.code } satisfies ApiFailure,
        { status: fallback.status },
      );
    }
  };
}
