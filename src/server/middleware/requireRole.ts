import type { Role } from "@prisma/client";
import { forbidden, unauthorized } from "@/server/errors";

// Mirror của src/middleware/requireRole.js ở template.
// Next.js không có middleware chain kiểu Express nên hàm này được gọi
// bằng tay ở đầu mỗi service/route: requireRole(user.role, "ADMIN").
export function requireRole(
  role: Role | undefined,
  ...allowed: Role[]
): void {
  if (!role) throw unauthorized();
  if (!allowed.includes(role)) throw forbidden();
}
