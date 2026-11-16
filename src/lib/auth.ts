import "server-only";
import type { Role } from "@prisma/client";
import { auth } from "@/features/auth/auth";

export type CurrentUser = {
  id: number;
  email: string | null | undefined;
  name: string | null | undefined;
  role: Role;
};

function isRole(role: unknown): role is Role {
  return role === "ADMIN" || role === "OWNER" || role === "RENTER";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const user = session?.user;
  if (!user || !isRole(user.role)) return null;

  const id = Number(user.id);
  if (!Number.isSafeInteger(id) || id < 1) return null;

  return { id, email: user.email, name: user.name, role: user.role };
}
