import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { AppShell } from "../../components/layout/app-shell";
import type { UserRole } from "../../components/layout/nav-items";

function parseSessionRole(token: string | undefined): UserRole | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const json = Buffer.from(payloadBase64, "base64").toString("utf-8");
      const parsed = JSON.parse(json) as { role?: string };
      if (parsed.role === "ADMIN" || parsed.role === "OWNER" || parsed.role === "RENTER") {
        return parsed.role;
      }
    }
  } catch {
    // Session token không hợp lệ hoặc hỏng
  }
  return null;
}

export default async function AppGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();

  // 1. Đọc vai trò từ session cookie thật của E0-F2 (ADR-002: JWT cookie httpOnly)
  const sessionToken =
    cookieStore.get("session")?.value ?? cookieStore.get("gearloop_session")?.value;
  const sessionRole = parseSessionRole(sessionToken);

  // 2. Nếu chưa có session đăng nhập thật, đọc vai trò xem thử (preview role cho dev/demo)
  const previewRole = cookieStore.get("gearloop_preview_role")?.value;
  const validPreviewRole =
    previewRole === "ADMIN" || previewRole === "OWNER" || previewRole === "RENTER"
      ? previewRole
      : null;

  // 3. Quyết định vai trò ban đầu: ưu tiên session thật -> preview role -> GUEST
  const initialRole: UserRole | "GUEST" = sessionRole ?? validPreviewRole ?? "GUEST";

  return <AppShell initialRole={initialRole}>{children}</AppShell>;
}
