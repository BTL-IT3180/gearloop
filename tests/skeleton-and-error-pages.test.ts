import { describe, expect, it } from "vitest";
import { Skeleton, CardSkeleton, TableSkeleton } from "../src/components/ui/skeleton";
import NotFound from "../src/app/not-found";
import RootLoading from "../src/app/loading";
import ErrorPage from "../src/app/error";
import Home from "../src/app/(app)/page";
import { errorCatalog } from "../src/lib/error-catalog";

describe("Skeleton & Error pages (E0-F3-T3)", () => {
  it("xuất bản đầy đủ các helper Skeletons từ UI primitives", () => {
    expect(Skeleton).toBeDefined();
    expect(CardSkeleton).toBeDefined();
    expect(TableSkeleton).toBeDefined();
  });

  it("trang chủ skeleton trong nhóm route (app) được định nghĩa đầy đủ", () => {
    expect(Home).toBeDefined();
  });

  it("các trang lỗi và loading của Next.js App Router được định nghĩa đầy đủ", () => {
    expect(NotFound).toBeDefined();
    expect(RootLoading).toBeDefined();
    expect(ErrorPage).toBeDefined();
  });

  it("error catalog E0-F1-T5 có đúng mã và thông điệp chuẩn cho 4xx và 5xx", () => {
    // 5xx: ERR-SYS-001
    expect(errorCatalog["ERR-SYS-001"].status).toBe(500);
    expect(errorCatalog["ERR-SYS-001"].message).toContain("ERR-SYS-001");

    // 4xx: ERR-USR-004 (404), ERR-USR-008 (403), ERR-SYS-003 (401)
    expect(errorCatalog["ERR-USR-004"].status).toBe(404);
    expect(errorCatalog["ERR-USR-008"].status).toBe(403);
    expect(errorCatalog["ERR-SYS-003"].status).toBe(401);
  });
});
