import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { Prisma, PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Each suite owns a disposable schema: no seed/reset/delete of shared data.
const schema = `e0_f1_t3_${randomUUID().replaceAll("-", "")}`;
let admin: PrismaClient;
let db: PrismaClient;
let itemId: number;
let otherItemId: number;
let buyerId: number;
const startDate = new Date("2030-01-01T00:00:00Z");
const endDate = new Date("2030-01-03T00:00:00Z");

beforeAll(async () => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (url.pathname !== "/gearloop_test" || !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Schema integrity tests require a local gearloop_test database");
  }
  admin = new PrismaClient({ datasources: { db: { url: url.toString() } } });
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  url.searchParams.set("schema", schema);
  const migration = spawnSync(process.execPath, [
    "node_modules/prisma/build/index.js", "migrate", "deploy",
  ], { env: { ...process.env, DATABASE_URL: url.toString() }, encoding: "utf8" });
  if (migration.status !== 0) throw new Error("Cannot deploy migrations to isolated test schema");
  db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
  const owner = await db.user.create({ data: {
    email: "owner@integrity.test", passwordHash: "unused-test-hash", fullName: "Owner", role: "SELLER",
  } });
  const buyer = await db.user.create({ data: {
    email: "buyer@integrity.test", passwordHash: "unused-test-hash", fullName: "Buyer", role: "BUYER",
  } });
  buyerId = buyer.id;
  const category = await db.category.create({ data: { name: "Integrity tests" } });
  const data = { ownerId: owner.id, categoryId: category.id, replacementValueVnd: 10_000 };
  itemId = (await db.item.create({ data: { ...data, title: "Item A" } })).id;
  otherItemId = (await db.item.create({ data: { ...data, title: "Item B" } })).id;
}, 30_000);

afterAll(async () => {
  await db?.$disconnect();
  if (admin) {
    // Only this suite's generated schema, after the database/host guard above.
    await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await admin.$disconnect();
  }
});

async function rollbackTest(run: (tx: Prisma.TransactionClient) => Promise<void>) {
  const rollback = new Error("rollback test fixture");
  try {
    await db.$transaction(async (tx) => {
      await run(tx);
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) throw error;
  }
}

function createBooking(client: Prisma.TransactionClient | PrismaClient) {
  return client.booking.create({ data: {
    itemId, buyerId, startDate, endDate, totalVnd: 3_000, depositVnd: 1_000,
  } });
}

function entry(bookingId: number, type: Prisma.DepositLedgerCreateManyInput["type"],
  amountVnd: number, eventKey: string = randomUUID()) {
  return { bookingId, type, amountVnd, eventKey, reason: "Schema integrity test" };
}

describe("CalendarDay booking relationship", () => {
  it("accepts FREE/BLOCKED without booking and BOOKED within the matching booking", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.calendarDay.createMany({ data: [
        { itemId, date: startDate, kind: "FREE" },
        { itemId, date: new Date("2030-01-02"), kind: "BLOCKED" },
        { itemId, date: endDate, kind: "BOOKED", bookingId: booking.id },
      ] });
      expect(await tx.calendarDay.count()).toBe(3);
    });
  });

  it.each([
    { kind: "BOOKED" as const, linked: false, other: false, outside: false },
    { kind: "FREE" as const, linked: true, other: false, outside: false },
    { kind: "BLOCKED" as const, linked: true, other: false, outside: false },
    { kind: "BOOKED" as const, linked: true, other: true, outside: false },
    { kind: "BOOKED" as const, linked: true, other: false, outside: true },
  ])("rejects inconsistent calendar data: %j", async ({ kind, linked, other, outside }) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await expect(tx.calendarDay.create({ data: {
        itemId: other ? otherItemId : itemId, kind,
        date: outside ? new Date("2030-01-04") : startDate,
        bookingId: linked ? booking.id : null,
      } })).rejects.toThrow();
    });
  });

  it.each(["item", "start", "end"])("rejects a parent %s change invalidating linked days", async (field) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.calendarDay.create({ data: { itemId, date: endDate, kind: "BOOKED", bookingId: booking.id } });
      const data = field === "item" ? { itemId: otherItemId }
        : field === "start" ? { startDate: new Date("2030-01-04") } : { endDate: startDate };
      await expect(tx.booking.update({ where: { id: booking.id }, data })).rejects.toThrow();
    });
  });

  it("requires clearing bookingId when freeing an occupied day", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      const day = await tx.calendarDay.create({ data: { itemId, date: startDate, kind: "FREE" } });
      await tx.calendarDay.update({ where: { id: day.id }, data: { kind: "BOOKED", bookingId: booking.id } });
      await expect(tx.calendarDay.update({ where: { id: day.id }, data: { kind: "FREE" } })).rejects.toThrow();
    });
  });
});

describe("DepositLedger invariants", () => {
  it("records DEPOSIT_HELD before approval and supports a split settlement", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      expect(booking.status).toBe("REQUESTED");
      await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
      const held = await tx.booking.update({ where: { id: booking.id }, data: { status: "DEPOSIT_HELD" } });
      expect(held.status).toBe("DEPOSIT_HELD");
      const event = randomUUID();
      await tx.depositLedger.create({ data: entry(booking.id, "DEDUCT", 300, event) });
      await tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 700, event) });
      const rows = await tx.depositLedger.findMany({ where: { bookingId: booking.id } });
      const balance = rows.reduce((sum, row) => sum + (row.type === "DEPOSIT_HELD" ? row.amountVnd : -row.amountVnd), 0);
      expect(balance).toBe(0);
    });
  });

  it.each([0, -1, 999])("rejects invalid initial deposit %i", async (amount) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await expect(tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", amount) })).rejects.toThrow();
    });
  });

  it.each(["RELEASE", "DEDUCT", "VOID"] as const)("rejects %s without a held deposit", async (type) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await expect(tx.depositLedger.create({ data: entry(booking.id, type, 1) })).rejects.toThrow();
    });
  });

  it("rejects a second initial deposit with a different event key", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
      await expect(tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) })).rejects.toThrow();
    });
  });

  it.each(["zero", "negative", "blank-key", "partial-void", "overdraw", "duplicate", "update", "delete", "snapshot"])(
    "rejects %s after holding a deposit", async (operation) => {
      await rollbackTest(async (tx) => {
        const booking = await createBooking(tx);
        const held = await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
        let write: Promise<unknown>;
        switch (operation) {
          case "zero": write = tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 0) }); break;
          case "negative": write = tx.depositLedger.create({ data: entry(booking.id, "RELEASE", -1) }); break;
          case "blank-key": write = tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 1, " ") }); break;
          case "partial-void": write = tx.depositLedger.create({ data: entry(booking.id, "VOID", 100) }); break;
          case "overdraw":
            await tx.depositLedger.create({ data: entry(booking.id, "DEDUCT", 600) });
            write = tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 500) }); break;
          case "duplicate": {
            const release = entry(booking.id, "RELEASE", 100);
            await tx.depositLedger.create({ data: release });
            write = tx.depositLedger.create({ data: release }); break;
          }
          case "update": write = tx.depositLedger.update({ where: { id: held.id }, data: { amountVnd: 500 } }); break;
          case "delete": write = tx.depositLedger.delete({ where: { id: held.id } }); break;
          default: write = tx.booking.update({ where: { id: booking.id }, data: { depositVnd: 2_000 } });
        }
        await expect(write).rejects.toThrow();
      });
    },
  );

  it("VOID clears the balance and cannot be followed by RELEASE", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
      await tx.depositLedger.create({ data: entry(booking.id, "VOID", 1_000) });
      await expect(tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 1) })).rejects.toThrow();
    });
  });

  it.each([
    { mode: "same-event", isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
    { mode: "different-events", isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
    { mode: "same-event", isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    { mode: "different-events", isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  ])("serializes simultaneous releases: $mode / $isolationLevel", async ({ mode, isolationLevel }) => {
    const booking = await createBooking(db);
    await db.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
    const first = entry(booking.id, "RELEASE", mode === "same-event" ? 300 : 700);
    const second = { ...first, eventKey: mode === "same-event" ? first.eventKey : randomUUID() };
    const outcomes = await Promise.allSettled([
      db.$transaction((tx) => tx.depositLedger.create({ data: first }), { isolationLevel }),
      db.$transaction((tx) => tx.depositLedger.create({ data: second }), { isolationLevel }),
    ]);
    expect(outcomes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(await db.depositLedger.count({ where: { bookingId: booking.id, type: "RELEASE" } })).toBe(1);
  });
});
