import { describe, expect, it } from "vitest";
import {
  ROLE_NAVIGATION,
  PUBLIC_NAVIGATION,
  type UserRole,
} from "../src/components/layout/nav-items";

describe("AppShell navigation & role mapping (E0-F3-T1)", () => {
  it("khớp đúng 3 vai trò của hệ thống (ADMIN, OWNER, RENTER)", () => {
    const roles: UserRole[] = ["ADMIN", "OWNER", "RENTER"];
    for (const role of roles) {
      expect(ROLE_NAVIGATION[role]).toBeDefined();
      expect(ROLE_NAVIGATION[role].length).toBeGreaterThan(0);
    }
  });

  it("mọi route đều có label và href hợp lệ", () => {
    const allRoutes = [
      ...PUBLIC_NAVIGATION,
      ...ROLE_NAVIGATION.ADMIN,
      ...ROLE_NAVIGATION.OWNER,
      ...ROLE_NAVIGATION.RENTER,
    ];

    for (const route of allRoutes) {
      expect(route.label.trim().length).toBeGreaterThan(0);
      expect(route.href.startsWith("/")).toBe(true);
    }
  });

  it("mỗi vai trò có các màn hình đặc thù theo đặc tả", () => {
    // Renter có tìm đồ và đơn thuê
    expect(ROLE_NAVIGATION.RENTER.some((r) => r.href === "/items")).toBe(true);
    expect(ROLE_NAVIGATION.RENTER.some((r) => r.href === "/bookings")).toBe(true);

    // Owner có quản lý đồ và yêu cầu thuê
    expect(ROLE_NAVIGATION.OWNER.some((r) => r.href === "/my-items")).toBe(true);
    expect(ROLE_NAVIGATION.OWNER.some((r) => r.href === "/requests")).toBe(true);

    // Admin có quản lý user, danh mục và audit log
    expect(ROLE_NAVIGATION.ADMIN.some((r) => r.href === "/admin/users")).toBe(true);
    expect(ROLE_NAVIGATION.ADMIN.some((r) => r.href === "/admin/audit-logs")).toBe(true);
  });
});
