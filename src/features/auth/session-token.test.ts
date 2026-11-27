import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/server/db/client";
import { revokeAuthSession } from "@/server/repositories/auth-session";
import { validateSessionToken } from "./session-token";

const revokedIds: string[] = [];

afterEach(async () => {
  const ids = revokedIds.splice(0);
  if (ids.length) await prisma.revokedAuthSession.deleteMany({ where: { id: { in: ids } } });
});

describe("JWT session revocation", () => {
  it("rejects a revoked session after a refresh while preserving the user's other session", async () => {
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: "mai@gearloop.local" },
      select: { id: true },
    });
    const identity = { sub: String(user.id) };
    const first = await validateSessionToken(identity, true);
    const second = await validateSessionToken(identity, true);
    expect(first?.sessionId).toBeDefined();
    expect(second?.sessionId).toBeDefined();
    if (!first?.sessionId || !second?.sessionId) throw new Error("Missing session ID");

    const firstId = first.sessionId;
    expect(firstId).not.toBe(second.sessionId);
    const refreshed = await validateSessionToken(first, false);
    expect(refreshed).toMatchObject({ sessionId: firstId, role: "OWNER" });
    if (!refreshed) throw new Error("Session refresh failed");

    revokedIds.push(firstId);
    await Promise.all([revokeAuthSession(firstId), revokeAuthSession(firstId)]);

    expect(await validateSessionToken(refreshed, false)).toBeNull();
    expect(await validateSessionToken(second, false)).toMatchObject({ sessionId: second.sessionId });
  });

  it("requires login again for a legacy JWT without a session ID", async () => {
    expect(await validateSessionToken({ sub: "1", role: "OWNER" }, false)).toBeNull();
  });
});
