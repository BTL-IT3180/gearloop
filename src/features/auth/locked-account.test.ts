import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../server/db/client";
import { authorizeCredentials, LockedAccountError } from "./credentials";

describe("authentication for a locked account", () => {
  const email = randomUUID() + "@example.test";
  const password = randomUUID();
  let accountId: number | undefined;

  beforeAll(async () => {
    const account = await prisma.user.create({
      data: {
        email,
        fullName: "Vitest locked account",
        passwordHash: await bcrypt.hash(password, 4),
        isActive: false,
      },
      select: { id: true },
    });
    accountId = account.id;
  });

  afterAll(async () => {
    if (accountId !== undefined) await prisma.user.delete({ where: { id: accountId } });
  });

  it("reports a locked account with valid credentials", async () => {
    await expect(authorizeCredentials({ email, password })).rejects.toBeInstanceOf(
      LockedAccountError,
    );
  });

  it("returns the generic failure when the password is wrong", async () => {
    await expect(authorizeCredentials({ email, password: "incorrect" })).resolves.toBeNull();
  });
});
