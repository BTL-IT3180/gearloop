import { NextResponse } from "next/server";
import { AppError } from "@/server/errors";

type RouteContext = { params: Promise<Record<string, string>> };

// Khuôn mẫu chung của mọi API route (mirror ADR-006 của template):
// handler chỉ trả về data; helper lo gói { data } và bắt AppError thành { error }.
export function withApi(
  handler: (req: Request, ctx: RouteContext) => Promise<unknown>,
) {
  return async (req: Request, ctx: RouteContext) => {
    try {
      const data = await handler(req, ctx);
      return NextResponse.json({ data });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      // Lỗi chưa phân loại: log đầy đủ cho dev, trả thông điệp chung cho client.
      console.error("[api] unhandled error:", error);
      return NextResponse.json(
        { error: "Lỗi hệ thống" },
        { status: 500 },
      );
    }
  };
}
