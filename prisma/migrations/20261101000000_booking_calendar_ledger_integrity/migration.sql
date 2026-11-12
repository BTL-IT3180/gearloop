-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OWNER', 'RENTER');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CalendarDayKind" AS ENUM ('FREE', 'BOOKED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'DEPOSIT_HELD', 'APPROVED', 'PICKED_UP', 'RETURN_PENDING', 'RETURNED', 'CLOSED', 'DISPUTED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ReportPhase" AS ENUM ('PICKUP', 'RETURN');

-- CreateEnum
CREATE TYPE "ReportItemState" AS ENUM ('OK', 'NOT_OK');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT_HELD', 'RELEASE', 'DEDUCT', 'VOID');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'RENTER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplateItem" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ChecklistTemplateItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "replacementValueVnd" INTEGER NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPhoto" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ItemPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateTier" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "minDays" INTEGER NOT NULL,
    "maxDays" INTEGER,
    "pricePerDayVnd" INTEGER NOT NULL,

    CONSTRAINT "RateTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositPolicy" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "percent" INTEGER NOT NULL,

    CONSTRAINT "DepositPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarDay" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "kind" "CalendarDayKind" NOT NULL DEFAULT 'FREE',
    "bookingId" INTEGER,

    CONSTRAINT "CalendarDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "renterId" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
    "totalVnd" INTEGER NOT NULL,
    "depositVnd" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionReport" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "phase" "ReportPhase" NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConditionReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionReportEntry" (
    "id" SERIAL NOT NULL,
    "reportId" INTEGER NOT NULL,
    "checklistItemId" INTEGER NOT NULL,
    "state" "ReportItemState" NOT NULL,
    "note" TEXT,
    "photoUrl" TEXT,

    CONSTRAINT "ConditionReportEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageClaim" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "openedById" INTEGER NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
    "reason" TEXT NOT NULL,
    "amountRequestedVnd" INTEGER NOT NULL,
    "amountAwardedVnd" INTEGER,
    "resolvedById" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositLedger" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amountVnd" INTEGER NOT NULL,
    "eventKey" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "authorId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicySetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicySetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "actorId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "ChecklistTemplateItem_categoryId_idx" ON "ChecklistTemplateItem"("categoryId");

-- CreateIndex
CREATE INDEX "Item_ownerId_idx" ON "Item"("ownerId");

-- CreateIndex
CREATE INDEX "Item_categoryId_status_idx" ON "Item"("categoryId", "status");

-- CreateIndex
CREATE INDEX "ItemPhoto_itemId_idx" ON "ItemPhoto"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "RateTier_itemId_minDays_key" ON "RateTier"("itemId", "minDays");

-- CreateIndex
CREATE UNIQUE INDEX "DepositPolicy_itemId_key" ON "DepositPolicy"("itemId");

-- CreateIndex
CREATE INDEX "CalendarDay_itemId_date_idx" ON "CalendarDay"("itemId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarDay_itemId_date_key" ON "CalendarDay"("itemId", "date");

-- CreateIndex
CREATE INDEX "Booking_renterId_idx" ON "Booking"("renterId");

-- CreateIndex
CREATE INDEX "Booking_itemId_status_idx" ON "Booking"("itemId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_id_itemId_key" ON "Booking"("id", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionReport_bookingId_phase_key" ON "ConditionReport"("bookingId", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "ConditionReportEntry_reportId_checklistItemId_key" ON "ConditionReportEntry"("reportId", "checklistItemId");

-- CreateIndex
CREATE INDEX "DamageClaim_bookingId_idx" ON "DamageClaim"("bookingId");

-- CreateIndex
CREATE INDEX "DamageClaim_status_idx" ON "DamageClaim"("status");

-- CreateIndex
CREATE INDEX "DepositLedger_bookingId_idx" ON "DepositLedger"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "DepositLedger_bookingId_eventKey_type_key" ON "DepositLedger"("bookingId", "eventKey", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- AddForeignKey
ALTER TABLE "ChecklistTemplateItem" ADD CONSTRAINT "ChecklistTemplateItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPhoto" ADD CONSTRAINT "ItemPhoto_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateTier" ADD CONSTRAINT "RateTier_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositPolicy" ADD CONSTRAINT "DepositPolicy_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarDay" ADD CONSTRAINT "CalendarDay_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarDay" ADD CONSTRAINT "CalendarDay_bookingId_itemId_fkey" FOREIGN KEY ("bookingId", "itemId") REFERENCES "Booking"("id", "itemId") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReport" ADD CONSTRAINT "ConditionReport_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReport" ADD CONSTRAINT "ConditionReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReportEntry" ADD CONSTRAINT "ConditionReportEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "ConditionReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionReportEntry" ADD CONSTRAINT "ConditionReportEntry_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "ChecklistTemplateItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageClaim" ADD CONSTRAINT "DamageClaim_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageClaim" ADD CONSTRAINT "DamageClaim_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageClaim" ADD CONSTRAINT "DamageClaim_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLedger" ADD CONSTRAINT "DepositLedger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositLedger" ADD CONSTRAINT "DepositLedger_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hand-authored invariants not expressible in Prisma schema.
ALTER TABLE "CalendarDay" ADD CONSTRAINT "CalendarDay_booking_kind_check"
CHECK ((kind = 'BOOKED') = ("bookingId" IS NOT NULL));

ALTER TABLE "DepositLedger" ADD CONSTRAINT "DepositLedger_amount_positive"
CHECK ("amountVnd" > 0);
ALTER TABLE "DepositLedger" ADD CONSTRAINT "DepositLedger_event_key_nonempty"
CHECK (length(btrim("eventKey")) > 0);

-- A booking has one initial deposit, even if callers submit different event keys.
CREATE UNIQUE INDEX "DepositLedger_one_deposit_per_booking"
ON "DepositLedger" ("bookingId") WHERE type = 'DEPOSIT_HELD';

CREATE FUNCTION check_calendar_booking() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  booking_start date;
  booking_end date;
BEGIN
  IF NEW."bookingId" IS NOT NULL THEN
    SELECT "startDate", "endDate" INTO booking_start, booking_end
    FROM "Booking" WHERE id = NEW."bookingId" AND "itemId" = NEW."itemId"
    FOR SHARE;
    IF NOT FOUND OR NEW.date NOT BETWEEN booking_start AND booking_end THEN
      RAISE EXCEPTION 'Calendar day must match booking item and date range'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "CalendarDay_check_booking"
BEFORE INSERT OR UPDATE ON "CalendarDay"
FOR EACH ROW EXECUTE FUNCTION check_calendar_booking();

-- Protect the reverse direction too: editing the parent must not invalidate days
-- or change the deposit snapshot after financial entries have been recorded.
CREATE FUNCTION check_booking_links() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."itemId" IS DISTINCT FROM OLD."itemId"
     OR NEW."startDate" IS DISTINCT FROM OLD."startDate"
     OR NEW."endDate" IS DISTINCT FROM OLD."endDate" THEN
    IF EXISTS (SELECT 1 FROM "CalendarDay" WHERE "bookingId" = OLD.id
      AND ("itemId" <> NEW."itemId" OR date NOT BETWEEN NEW."startDate" AND NEW."endDate")) THEN
      RAISE EXCEPTION 'Booking update would invalidate calendar days'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW."depositVnd" IS DISTINCT FROM OLD."depositVnd"
     AND EXISTS (SELECT 1 FROM "DepositLedger" WHERE "bookingId" = OLD.id) THEN
    RAISE EXCEPTION 'Recorded deposit snapshot is immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "Booking_check_links"
BEFORE UPDATE ON "Booking"
FOR EACH ROW EXECUTE FUNCTION check_booking_links();

CREATE FUNCTION check_deposit_ledger() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  snapshot_vnd integer;
  held_vnd bigint;
  spent_vnd bigint;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'DepositLedger is append-only' USING ERRCODE = '23514';
  END IF;

  -- Serialize writers on the parent. A real row version is written so stale
  -- REPEATABLE READ transactions fail rather than spending an old balance.
  -- SQL does not change updatedAt: a ledger write must not reset the claim clock.
  UPDATE "Booking" SET "depositVnd" = "depositVnd"
  WHERE id = NEW."bookingId" RETURNING "depositVnd" INTO snapshot_vnd;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking does not exist' USING ERRCODE = '23503';
  END IF;

  SELECT COALESCE(SUM("amountVnd") FILTER (WHERE type = 'DEPOSIT_HELD'), 0),
         COALESCE(SUM("amountVnd") FILTER (WHERE type <> 'DEPOSIT_HELD'), 0)
  INTO held_vnd, spent_vnd FROM "DepositLedger" WHERE "bookingId" = NEW."bookingId";

  IF NEW.type = 'DEPOSIT_HELD' THEN
    IF held_vnd <> 0 OR NEW."amountVnd" <> snapshot_vnd THEN
      RAISE EXCEPTION 'Initial deposit must equal booking deposit and occur once'
        USING ERRCODE = '23514';
    END IF;
  ELSIF NEW."amountVnd" > held_vnd - spent_vnd THEN
    RAISE EXCEPTION 'Deposit outflow exceeds held balance' USING ERRCODE = '23514';
  ELSIF NEW.type = 'VOID' AND NEW."amountVnd" <> held_vnd - spent_vnd THEN
    RAISE EXCEPTION 'VOID must clear the remaining held balance' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "DepositLedger_check_entry"
BEFORE INSERT OR UPDATE OR DELETE ON "DepositLedger"
FOR EACH ROW EXECUTE FUNCTION check_deposit_ledger();
