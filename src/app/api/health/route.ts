import { NextResponse } from "next/server";
import { prisma } from "@/server/db/client";

// Giống MedBook /health: kiểm tra app và database. Public, không cần đăng nhập.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ data: { ok: true, db: "up" } });
  } catch {
    // App sống nhưng chưa nối được DB — trả rõ trạng thái để dễ chẩn đoán deploy.
    return NextResponse.json({ data: { ok: true, db: "down" } });
  }
}
