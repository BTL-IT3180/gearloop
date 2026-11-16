import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { loginSchema } from "../../lib/validation/auth";
import { prisma } from "../../server/db/client";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function authorizeCredentials(
  credentials: unknown,
): Promise<AuthenticatedUser | null> {
  const parsed = loginSchema.safeParse(credentials);
  if (!parsed.success) return null;

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      id: true,
      email: true,
      fullName: true,
      passwordHash: true,
      role: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;
  if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;

  return {
    id: String(user.id),
    email: user.email,
    name: user.fullName,
    role: user.role,
  };
}
