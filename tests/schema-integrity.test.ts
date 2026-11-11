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
let renterId: number;
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
    email: "owner@integrity.test", passwordHash: "unused-test-hash", fullName: "Owner", role: "OWNER",
  } });
  const renter = await db.user.create({ data: {
    email: "renter@integrity.test", passwordHash: "unused-test-hash", fullName: "Renter", role: "RENTER",
  } });
  renterId = renter.id;
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

function createBooking(client: Prisma.TransactionClient | PrismaClient,
  changes: Partial<Prisma.BookingUncheckedCreateInput> = {}) {
  return client.booking.create({ data: {
    itemId, renterId, startDate, endDate, totalVnd: 3_000, depositVnd: 1_000,
    ...changes,
  } });
}

function entry(bookingId: number, type: Prisma.DepositLedgerCreateManyInput["type"],
  amountVnd: number, eventKey: string = randomUUID()) {
  return { bookingId, type, amountVnd, eventKey, reason: "Schema integrity test" };
}

// Observe the actual PostgreSQL lock before committing the first writer. A
// trigger without serialization must fail this test, even if it rejects tx2 later.
async function contendWithLock(
  firstWrite: (tx: Prisma.TransactionClient) => Promise<unknown>,
  secondWrite: (tx: Prisma.TransactionClient) => Promise<unknown>,
  isolationLevel: Prisma.TransactionIsolationLevel,
) {
  let firstStarted!: (pid: number) => void;
  let secondStarted!: (pid: number) => void;
  let releaseFirst!: () => void;
  const firstReady = new Promise<number>((resolve) => { firstStarted = resolve; });
  const secondReady = new Promise<number>((resolve) => { secondStarted = resolve; });
  const released = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = db.$transaction(async (tx) => {
    const [{ pid }] = await tx.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
    await firstWrite(tx);
    firstStarted(pid);
    await released;
  }, { isolationLevel, timeout: 10_000 });
  let second: Promise<unknown> | undefined;
  let outcomes: PromiseSettledResult<unknown>[] = [];
  try {
    const firstPid = await Promise.race([firstReady, first.then(() => { throw new Error("First writer ended before barrier"); })]);
    second = db.$transaction(async (tx) => {
      const [{ pid }] = await tx.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
      secondStarted(pid);
      return secondWrite(tx);
    }, { isolationLevel, timeout: 10_000 });
    const secondPid = await Promise.race([secondReady, second.then(() => { throw new Error("Second writer ended before barrier"); })]);
    await expect.poll(async () => {
      const [{ blocked }] = await db.$queryRaw<{ blocked: boolean }[]>`
        SELECT ${firstPid}::int = ANY(pg_blocking_pids(${secondPid}::int)) AS blocked`;
      return blocked;
    }, { timeout: 3_000, interval: 25 }).toBe(true);
  } finally {
    releaseFirst();
    outcomes = await Promise.allSettled(second ? [first, second] : [first]);
  }
  expect(outcomes[0]).toMatchObject({ status: "fulfilled" });
  return outcomes[1];
}

describe("CalendarDay booking relationship", () => {
  it.each([Prisma.TransactionIsolationLevel.ReadCommitted, Prisma.TransactionIsolationLevel.RepeatableRead])(
    "rejects shortening a booking after a concurrent calendar insert: %s", async (isolationLevel) => {
      const booking = await createBooking(db);
      let snapshotReady!: () => void;
      let continueUpdate!: () => void;
      const ready = new Promise<void>((resolve) => { snapshotReady = resolve; });
      const inserted = new Promise<void>((resolve) => { continueUpdate = resolve; });
      const update = db.$transaction(async (tx) => {
        await tx.booking.findUniqueOrThrow({ where: { id: booking.id } });
        snapshotReady();
        await inserted;
        return tx.booking.update({ where: { id: booking.id }, data: { endDate: startDate } });
      }, { isolationLevel, timeout: 10_000 });
      const outcome = update.then(
        () => ({ status: "fulfilled" as const }),
        (reason: unknown) => ({ status: "rejected" as const, reason }),
      );
      try {
        try {
          await Promise.race([ready, outcome.then(() => { throw new Error("Updater ended before snapshot barrier"); })]);
          await db.calendarDay.create({ data: { itemId, date: endDate, kind: "BOOKED", bookingId: booking.id } });
        } finally { continueUpdate(); }
        const reason = isolationLevel === Prisma.TransactionIsolationLevel.RepeatableRead
          ? { code: "P2034" } : { message: expect.stringMatching(/PostgresError \{ code: "23514"/) };
        await expect(outcome).resolves.toMatchObject({ status: "rejected", reason });
        expect((await db.booking.findUniqueOrThrow({ where: { id: booking.id } })).endDate).toEqual(endDate);
      } finally {
        continueUpdate();
        await outcome;
        // A failed assertion must not leave dates behind and break later cases.
        await db.calendarDay.deleteMany({ where: { bookingId: booking.id } });
      }
    },
  );

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
      } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it.each(["item", "start", "end"])("rejects a parent %s change invalidating linked days", async (field) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.calendarDay.create({ data: { itemId, date: endDate, kind: "BOOKED", bookingId: booking.id } });
      const data = field === "item" ? { itemId: otherItemId }
        : field === "start" ? { startDate: new Date("2030-01-04") } : { endDate: startDate };
      await expect(tx.booking.update({ where: { id: booking.id }, data })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("requires clearing bookingId when freeing an occupied day", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      const day = await tx.calendarDay.create({ data: { itemId, date: startDate, kind: "FREE" } });
      await tx.calendarDay.update({ where: { id: day.id }, data: { kind: "BOOKED", bookingId: booking.id } });
      await expect(tx.calendarDay.update({ where: { id: day.id }, data: { kind: "FREE" } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
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
      await expect(tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", amount) })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it.each(["RELEASE", "DEDUCT", "VOID"] as const)("rejects %s without a held deposit", async (type) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await expect(tx.depositLedger.create({ data: entry(booking.id, type, 1) })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("rejects a second initial deposit with a different event key", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
      await expect(tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) })).rejects.toThrow(/PostgresError \{ code: "23514"/);
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
        if (operation === "duplicate") {
          await expect(write).rejects.toMatchObject({ code: "P2002" });
        } else {
          await expect(write).rejects.toThrow(/PostgresError \{ code: "23514"/);
        }
      });
    },
  );

  it("VOID clears the balance and cannot be followed by RELEASE", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await tx.depositLedger.create({ data: entry(booking.id, "DEPOSIT_HELD", 1_000) });
      await tx.depositLedger.create({ data: entry(booking.id, "VOID", 1_000) });
      await expect(tx.depositLedger.create({ data: entry(booking.id, "RELEASE", 1) })).rejects.toThrow(/PostgresError \{ code: "23514"/);
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
    const insert = (tx: Prisma.TransactionClient, data: typeof first) => tx.$executeRaw`
      INSERT INTO "DepositLedger" ("bookingId", type, "amountVnd", "eventKey", reason)
      VALUES (${data.bookingId}, 'RELEASE', ${data.amountVnd}, ${data.eventKey}, ${data.reason})`;
    const result = await contendWithLock((tx) => insert(tx, first), (tx) => insert(tx, second), isolationLevel);
    const sqlState = isolationLevel === Prisma.TransactionIsolationLevel.RepeatableRead
      ? "40001" : mode === "same-event" ? "23505" : "23514";
    expect(result).toMatchObject({ status: "rejected", reason: { code: "P2010", meta: { code: sqlState } } });
    expect(await db.depositLedger.count({ where: { bookingId: booking.id, type: "RELEASE" } })).toBe(1);
  });
});

describe("Booking values and history", () => {
  it.each([
    { totalVnd: -1 }, { depositVnd: -1 },
    { startDate: endDate, endDate: startDate },
  ])("rejects invalid booking data: %j", async (changes) => {
    await rollbackTest(async (tx) => {
      await expect(createBooking(tx, changes)).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("accepts a one-day booking with zero money", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx, { endDate: startDate, totalVnd: 0, depositVnd: 0 });
      expect(booking.endDate).toEqual(startDate);
    });
  });

  it.each([{ totalVnd: 4_000 }, { depositVnd: 2_000 }])("protects money snapshots before ledger writes: %j", async (data) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx);
      await expect(tx.booking.update({ where: { id: booking.id }, data })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("records return time once and retains it across subsequent updates", async () => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx, { status: "RETURN_PENDING" });
      const returned = await tx.booking.update({ where: { id: booking.id }, data: { status: "RETURNED" } });
      expect(returned.returnedAt).toBeInstanceOf(Date);
      const edited = await tx.booking.update({ where: { id: booking.id }, data: { updatedAt: new Date("2035-01-01") } });
      expect(edited.returnedAt).toEqual(returned.returnedAt);
      const disputed = await tx.booking.update({ where: { id: booking.id }, data: { status: "DISPUTED" } });
      expect(disputed.returnedAt).toEqual(returned.returnedAt);
    });
  });

  it.each([null, new Date("2000-01-01")])("rejects changing recorded return time to %s", async (returnedAt) => {
    await rollbackTest(async (tx) => {
      const booking = await createBooking(tx, { status: "RETURNED" });
      await expect(tx.booking.update({ where: { id: booking.id }, data: { returnedAt } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("rejects a manually supplied return time before return", async () => {
    await rollbackTest(async (tx) => {
      await expect(createBooking(tx, { returnedAt: new Date("2000-01-01") })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });
});

describe("AuditLog append-only", () => {
  it.each(["update", "delete"])("rejects %s of an audit entry", async (operation) => {
    await rollbackTest(async (tx) => {
      const audit = await tx.auditLog.create({ data: { action: "booking.create", entity: "Booking" } });
      const write = operation === "update"
        ? tx.auditLog.update({ where: { id: audit.id }, data: { action: "rewritten" } })
        : tx.auditLog.delete({ where: { id: audit.id } });
      await expect(write).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });
});

describe("Historical user references", () => {
  it.each(["audit", "ledger", "claim"])("rejects deleting a user referenced only by %s", async (reference) => {
    await rollbackTest(async (tx) => {
      const user = await tx.user.create({ data: {
        email: `${randomUUID()}@history.test`, fullName: "Historical actor",
        passwordHash: "unused-test-hash", role: "ADMIN",
      } });
      if (reference === "audit") {
        await tx.auditLog.create({ data: { actorId: user.id, action: "test", entity: "Booking" } });
      } else {
        const booking = await createBooking(tx);
        if (reference === "ledger") {
          await tx.depositLedger.create({ data: { ...entry(booking.id, "DEPOSIT_HELD", 1_000), createdById: user.id } });
        } else {
          await tx.damageClaim.create({ data: { bookingId: booking.id, openedById: renterId,
            resolvedById: user.id, status: "RESOLVED", reason: "Test", amountRequestedVnd: 1,
            amountAwardedVnd: 1, resolvedAt: new Date() } });
        }
      }
      // Deactivation does not mutate history; hard deletion fails at the FK,
      // not through an implicit UPDATE blocked by an append-only trigger.
      expect((await tx.user.update({ where: { id: user.id }, data: { isActive: false } })).isActive).toBe(false);
      await expect(tx.$executeRaw`DELETE FROM "User" WHERE id = ${user.id}`)
        .rejects.toMatchObject({ code: "P2010", meta: { code: "23503" } });
    });
  });
});

describe("RateTier ranges", () => {
  it.each([
    { minDays: 0, maxDays: 2, pricePerDayVnd: 1 },
    { minDays: 3, maxDays: 2, pricePerDayVnd: 1 },
    { minDays: 1, maxDays: 2, pricePerDayVnd: -1 },
  ])("rejects invalid tier values: %j", async (data) => {
    await rollbackTest(async (tx) => {
      await expect(tx.rateTier.create({ data: { itemId, ...data } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("accepts adjacent tiers and an open-ended tier", async () => {
    await rollbackTest(async (tx) => {
      await tx.rateTier.createMany({ data: [
        { itemId, minDays: 1, maxDays: 2, pricePerDayVnd: 0 },
        { itemId, minDays: 3, maxDays: 6, pricePerDayVnd: 100 },
        { itemId, minDays: 7, maxDays: null, pricePerDayVnd: 90 },
      ] });
      expect(await tx.rateTier.count({ where: { itemId } })).toBe(3);
    });
  });

  it.each([3, null])("rejects overlapping ranges with maxDays %s", async (maxDays) => {
    await rollbackTest(async (tx) => {
      await tx.rateTier.create({ data: { itemId, minDays: 1, maxDays, pricePerDayVnd: 100 } });
      await expect(tx.rateTier.create({ data: { itemId, minDays: 2, maxDays: 4, pricePerDayVnd: 90 } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("rejects updating a tier into another tier's range", async () => {
    await rollbackTest(async (tx) => {
      await tx.rateTier.create({ data: { itemId, minDays: 1, maxDays: 2, pricePerDayVnd: 100 } });
      const tier = await tx.rateTier.create({ data: { itemId, minDays: 3, maxDays: null, pricePerDayVnd: 90 } });
      await expect(tx.rateTier.update({ where: { id: tier.id }, data: { minDays: 2 } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it.each([Prisma.TransactionIsolationLevel.ReadCommitted, Prisma.TransactionIsolationLevel.RepeatableRead])(
    "serializes concurrent overlapping tiers: %s", async (isolationLevel) => {
      const original = await db.item.findUniqueOrThrow({ where: { id: itemId } });
      const item = await db.item.create({ data: { ownerId: original.ownerId,
        categoryId: original.categoryId, replacementValueVnd: 1_000, title: "Tier race" } });
      const insert = (tx: Prisma.TransactionClient, min: number, max: number) => tx.$executeRaw`
        INSERT INTO "RateTier" ("itemId", "minDays", "maxDays", "pricePerDayVnd")
        VALUES (${item.id}, ${min}, ${max}, 100)`;
      const result = await contendWithLock((tx) => insert(tx, 1, 3), (tx) => insert(tx, 2, 4), isolationLevel);
      const sqlState = isolationLevel === Prisma.TransactionIsolationLevel.RepeatableRead ? "40001" : "23514";
      expect(result).toMatchObject({ status: "rejected", reason: { code: "P2010", meta: { code: sqlState } } });
    },
  );
});

async function checklistFixture(tx: Prisma.TransactionClient) {
  const booking = await createBooking(tx);
  const item = await tx.item.findUniqueOrThrow({ where: { id: itemId } });
  const template = await tx.checklistTemplateItem.create({ data: {
    categoryId: item.categoryId, label: "Lens intact", required: true,
  } });
  const report = await tx.conditionReport.create({ data: { bookingId: booking.id, reporterId: renterId, phase: "PICKUP" } });
  const entryData = { reportId: report.id, checklistItemId: template.id, state: "OK" as const,
    labelSnapshot: "Untrusted label", requiredSnapshot: false };
  return { template, entryData };
}

describe("Checklist history snapshots", () => {
  it("captures actual template values and retains them after template edits", async () => {
    await rollbackTest(async (tx) => {
      const { template, entryData } = await checklistFixture(tx);
      const entry = await tx.conditionReportEntry.create({ data: entryData });
      expect(entry.labelSnapshot).toBe(template.label);
      expect(entry.requiredSnapshot).toBe(true);
      await tx.checklistTemplateItem.update({ where: { id: template.id }, data: { label: "Lens clean", required: false } });
      const historical = await tx.conditionReportEntry.findUniqueOrThrow({ where: { id: entry.id } });
      expect(historical.labelSnapshot).toBe("Lens intact");
      expect(historical.requiredSnapshot).toBe(true);
    });
  });

  it.each([{ labelSnapshot: "rewritten" }, { requiredSnapshot: false }])("rejects rewriting a checklist snapshot: %j", async (data) => {
    await rollbackTest(async (tx) => {
      const { entryData } = await checklistFixture(tx);
      const entry = await tx.conditionReportEntry.create({ data: entryData });
      await expect(tx.conditionReportEntry.update({ where: { id: entry.id }, data })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });

  it("rejects a checklist from another category", async () => {
    await rollbackTest(async (tx) => {
      const { entryData } = await checklistFixture(tx);
      const category = await tx.category.create({ data: { name: "Other checklist category" } });
      const template = await tx.checklistTemplateItem.create({ data: { categoryId: category.id, label: "Other" } });
      await expect(tx.conditionReportEntry.create({ data: { ...entryData, checklistItemId: template.id } })).rejects.toThrow(/PostgresError \{ code: "23514"/);
    });
  });
});
