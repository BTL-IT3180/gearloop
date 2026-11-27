import { randomUUID } from "node:crypto";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/server/db/client";
import { isAuthSessionRevoked } from "@/server/repositories/auth-session";

export async function validateSessionToken(token: JWT, signingIn: boolean): Promise<JWT | null> {
  const userId = Number(token.sub);
  if (!Number.isSafeInteger(userId) || userId < 1) return null;

  // Auth.js can reissue the JWT on session reads. Keep one ID for the whole login.
  const sessionId = signingIn ? randomUUID() : token.sessionId;
  if (typeof sessionId !== "string") return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, fullName: true, role: true, isActive: true },
  });
  if (!currentUser?.isActive) return null;
  if (!signingIn && await isAuthSessionRevoked(sessionId)) return null;

  return {
    ...token,
    sessionId,
    sub: String(currentUser.id),
    role: currentUser.role,
    name: currentUser.fullName,
    email: currentUser.email,
  };
}
