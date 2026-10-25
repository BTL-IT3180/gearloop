/**
 * Smoke test lõi schema + seed (chạy trong CI sau khi db push + seed).
 * CẦN DATABASE_URL trỏ tới database đã seed — xem doc/regression-testing.md.
 * Không mock: truy vấn thật vào PostgreSQL, giống tinh thần test của template.
 */
import { describe, expect, it } from "vitest";
import { prisma } from "../src/server/db/client";

describe("seed v1 (GL-109)", () => {
  it("tạo đúng 6 users theo 3 vai trò", async () => {
    const users = await prisma.user.findMany();
    expect(users).toHaveLength(6);
    expect(users.filter((u) => u.role === "ADMIN")).toHaveLength(1);
    expect(users.filter((u) => u.role === "SELLER")).toHaveLength(2);
    expect(users.filter((u) => u.role === "BUYER")).toHaveLength(3);
    // bcrypt hash, không plaintext (ADR-002)
    for (const u of users) {
      expect(u.passwordHash).toMatch(/^\$2[aby]\$/);
    }
  });

  it("tạo 3 categories, 4 items, mỗi item có tier + cọc + ảnh gốc", async () => {
    expect(await prisma.category.count()).toBe(3);
    const items = await prisma.item.findMany({
      include: { rateTiers: true, depositPolicy: true, photos: true },
    });
    expect(items).toHaveLength(4);
    for (const item of items) {
      expect(item.rateTiers.length).toBeGreaterThan(0);
      expect(item.depositPolicy).not.toBeNull();
      expect(item.photos.some((p) => p.isBaseline)).toBe(true);
    }
  });

  it("mỗi item có đúng 60 ngày lịch FREE", async () => {
    const days = await prisma.calendarDay.groupBy({
      by: ["itemId"],
      _count: { _all: true },
    });
    expect(days).toHaveLength(4);
    for (const d of days) expect(d._count._all).toBe(60);
  });
});

describe("ràng buộc cốt lõi (GL-107)", () => {
  it("@@unique([itemId, date]) chặn tạo trùng ngày — đặt chồng bị DB từ chối", async () => {
    const day = await prisma.calendarDay.findFirst({ where: { kind: "FREE" } });
    expect(day).not.toBeNull();
    await expect(
      prisma.calendarDay.create({
        data: { itemId: day!.itemId, date: day!.date, kind: "FREE" },
      }),
    ).rejects.toThrow();
    // Database là lớp bảo vệ cuối: bất kỳ đường code nào quên check
    // availability cũng không tạo được 2 dòng cùng (itemId, date).
  });

  it("2 item khác nhau dùng chung một ngày thoải mái — ràng buộc đúng phạm vi", async () => {
    const [a, b] = await prisma.item.findMany({
      take: 2,
      orderBy: { id: "asc" },
    });
    const date = await prisma.calendarDay.findFirst({
      where: { itemId: a.id },
    });
    const bDay = await prisma.calendarDay.findFirst({
      where: { itemId: b.id, date: date!.date },
    });
    expect(bDay).not.toBeNull(); // cùng ngày, khác item → tồn tại độc lập
  });
});
