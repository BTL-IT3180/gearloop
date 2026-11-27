import { prisma } from "@/server/db/client";

export async function isAuthSessionRevoked(id: string): Promise<boolean> {
  const revoked = await prisma.revokedAuthSession.findUnique({
    where: { id },
    select: { id: true },
  });
  return revoked !== null;
}

export async function revokeAuthSession(id: string): Promise<void> {
  await prisma.revokedAuthSession.createMany({
    data: { id },
    skipDuplicates: true,
  });
}
