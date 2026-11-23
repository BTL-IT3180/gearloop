import type { Role } from "@prisma/client";
import type { Session } from "next-auth";
import { describe, expect, it } from "vitest";
import { ForbiddenError, AppError } from "../server/errors";
import { requireOwnership, requireRole } from "./rbac";

function session(id: string, role: Role): Pick<Session, "user"> {
  return { user: { id, role } };
}

function thrownBy(action: () => void): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe("requireRole", () => {
  it.each([
    ["ADMIN", ["ADMIN"]],
    ["OWNER", ["OWNER", "ADMIN"]],
    ["RENTER", ["RENTER"]],
  ] as const)("allows %s when its role is granted", (role, allowed) => {
    expect(() => requireRole(session("7", role), ...allowed)).not.toThrow();
  });

  it("throws the catalog-backed forbidden error for a disallowed role", () => {
    const error = thrownBy(() => requireRole(session("7", "RENTER"), "OWNER"));

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toMatchObject({ code: "ERR-USR-008", status: 403 });
  });

  it("throws unauthorized when the session is missing", () => {
    const error = thrownBy(() => requireRole(null, "ADMIN"));

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ code: "ERR-SYS-003", status: 401 });
  });
});

describe("requireOwnership", () => {
  it("allows the owner of the record", () => {
    expect(() => requireOwnership({ ownerId: 7 }, session("7", "RENTER"))).not.toThrow();
  });

  it("throws the catalog-backed forbidden error for another owner", () => {
    const error = thrownBy(() =>
      requireOwnership({ ownerId: 8 }, session("7", "OWNER")),
    );

    expect(error).toBeInstanceOf(ForbiddenError);
    expect(error).toMatchObject({ code: "ERR-USR-008", status: 403 });
  });

  it("does not bypass ownership for ADMIN", () => {
    const error = thrownBy(() =>
      requireOwnership({ ownerId: 8 }, session("7", "ADMIN")),
    );

    expect(error).toBeInstanceOf(ForbiddenError);
  });

  it("throws unauthorized when the session is missing", () => {
    const error = thrownBy(() => requireOwnership({ ownerId: 7 }, null));

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ code: "ERR-SYS-003", status: 401 });
  });
});
