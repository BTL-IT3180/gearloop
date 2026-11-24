import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { forbidden, unauthorized } from "../server/errors";

type RbacSession = Pick<Session, "user"> | null | undefined;

export type OwnedRecord = {
  ownerId: number;
};

function getSessionUserId(session: RbacSession): number {
  const userId = Number(session?.user?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) throw unauthorized();
  return userId;
}

function isRole(role: unknown): role is Role {
  return role === "ADMIN" || role === "OWNER" || role === "RENTER";
}

export function requireRole(session: RbacSession, ...roles: Role[]): void {
  getSessionUserId(session);
  const role = session?.user?.role;
  if (!isRole(role)) throw unauthorized();
  if (!roles.includes(role)) throw forbidden();
}

export function requireOwnership(record: OwnedRecord, session: RbacSession): void {
  const userId = getSessionUserId(session);
  if (!Number.isSafeInteger(record.ownerId) || record.ownerId !== userId) {
    throw forbidden();
  }
}
