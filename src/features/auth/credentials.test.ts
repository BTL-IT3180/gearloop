import { describe, expect, it } from "vitest";
import { authorizeCredentials } from "./credentials";

describe("Auth.js credentials", () => {
  it("authenticates with the persisted password and role", async () => {
    const user = await authorizeCredentials({
      email: "mai@gearloop.local",
      password: "demo123",
    });

    expect(user).toMatchObject({
      email: "mai@gearloop.local",
      role: "OWNER",
    });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it.each([
    { email: "missing@gearloop.local", password: "demo123" },
    { email: "mai@gearloop.local", password: "incorrect" },
    { email: "mai@gearloop.local", password: "" },
    { email: "not-an-email", password: "demo123" },
  ])("rejects invalid credentials without returning account data: %j", async (credentials) => {
    const user = await authorizeCredentials(credentials);
    expect(user).toBeNull();
  });

  it("uses the database role instead of a client-supplied role", async () => {
    const user = await authorizeCredentials({
      email: "mai@gearloop.local",
      password: "demo123",
      role: "ADMIN",
    });

    expect(user?.role).toBe("OWNER");
  });
});
