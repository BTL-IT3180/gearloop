import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it } from "vitest";

let admin: PrismaClient;
let db: PrismaClient;
let schema: string;
let databaseUrl: string;

function runSeed() {
  return spawnSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "src/db/seed.ts"], {
    env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: "utf8",
  });
}

beforeAll(() => {
  const url = new URL(process.env.DATABASE_URL ?? "");
  if (url.pathname !== "/gearloop_test" || !["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("Seed tests require a local gearloop_test database");
  }
  admin = new PrismaClient({ datasources: { db: { url: url.toString() } } });
});

beforeEach(async () => {
  schema = `seed_test_${randomUUID().replaceAll("-", "")}`;
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("schema", schema);
  databaseUrl = url.toString();
  const migration = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: databaseUrl }, encoding: "utf8",
  });
  expect(migration.status).toBe(0);
  db = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
  expect(runSeed().status).toBe(0);
}, 30_000);

afterEach(async () => {
  await db?.$disconnect();
  if (schema) await admin.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
});
afterAll(async () => { await admin?.$disconnect(); });

async function snapshot() {
  return {
    users: await db.user.findMany({ select: { id: true, email: true, isActive: true }, orderBy: { id: "asc" } }),
    items: await db.item.findMany({ orderBy: { id: "asc" } }),
    bookings: await db.booking.findMany({ orderBy: { id: "asc" } }),
    days: await db.calendarDay.findMany({ orderBy: { id: "asc" } }),
    ledger: await db.depositLedger.findMany({ orderBy: { id: "asc" } }),
    audits: await db.auditLog.findMany({ orderBy: { id: "asc" } }),
    policies: await db.policySetting.findMany({ orderBy: { key: "asc" } }),
    categories: await db.category.findMany({ orderBy: { id: "asc" } }),
    templates: await db.checklistTemplateItem.findMany({ orderBy: { id: "asc" } }),
    tiers: await db.rateTier.findMany({ orderBy: { id: "asc" } }),
    photos: await db.itemPhoto.findMany({ orderBy: { id: "asc" } }),
    deposits: await db.depositPolicy.findMany({ orderBy: { id: "asc" } }),
  };
}

it("can reseed demo-only data without duplicating it", async () => {
  expect(runSeed().status).toBe(0);
  expect(await db.user.count()).toBe(6);
  expect(await db.item.count()).toBe(4);
  expect(await db.calendarDay.count()).toBe(240);
});

it("rolls back the wipe if loading sample data fails", async () => {
  const before = await snapshot();
  await db.$executeRawUnsafe(`CREATE FUNCTION reject_seed_policy() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'Injected seed failure' USING ERRCODE = '23514'; END; $$`);
  await db.$executeRawUnsafe(`CREATE TRIGGER reject_seed_policy BEFORE INSERT ON "PolicySetting"
    FOR EACH ROW EXECUTE FUNCTION reject_seed_policy()`);
  const result = runSeed();
  expect(result.status).not.toBe(0);
  expect(await snapshot()).toEqual(before);
});

it.each(["audit-only", "booked-without-ledger", "ledger"])(
  "exits successfully without altering existing data: %s", async (scenario) => {
    if (scenario === "audit-only") {
      await db.auditLog.create({ data: { action: "existing.audit", entity: "Item" } });
      expect(await db.booking.count()).toBe(0);
      expect(await db.depositLedger.count()).toBe(0);
    } else {
      const buyer = await db.user.findFirstOrThrow({ where: { role: "BUYER" } });
      const day = await db.calendarDay.findFirstOrThrow({ where: { kind: "FREE" } });
      const booking = await db.booking.create({ data: { itemId: day.itemId, buyerId: buyer.id,
        startDate: day.date, endDate: day.date, totalVnd: 1_000, depositVnd: 1_000 } });
      await db.calendarDay.update({ where: { id: day.id }, data: { kind: "BOOKED", bookingId: booking.id } });
      if (scenario === "ledger") {
        await db.depositLedger.create({ data: { bookingId: booking.id, type: "DEPOSIT_HELD",
          amountVnd: 1_000, eventKey: randomUUID(), reason: "Existing deposit" } });
      } else {
        expect(await db.depositLedger.count()).toBe(0);
      }
    }
    const before = await snapshot();
    const result = runSeed();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Skip seed:");
    expect(await snapshot()).toEqual(before);
  },
);
