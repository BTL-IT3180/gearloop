BEGIN;

ALTER TABLE "Booking"
  ADD COLUMN "returnedAt" TIMESTAMP(3),
  ADD CONSTRAINT "Booking_date_range_check" CHECK ("endDate" >= "startDate"),
  ADD CONSTRAINT "Booking_money_nonnegative" CHECK ("totalVnd" >= 0 AND "depositVnd" >= 0);

-- Existing return reports are the only available return-time evidence. Do not
-- invent timestamps from updatedAt when historical evidence is absent.
UPDATE "Booking" AS b SET "returnedAt" = r."createdAt"
FROM "ConditionReport" AS r WHERE r."bookingId" = b.id AND r.phase = 'RETURN';
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_return_time_check"
CHECK (status <> 'RETURNED' OR "returnedAt" IS NOT NULL);

ALTER TABLE "ConditionReportEntry"
  ADD COLUMN "labelSnapshot" TEXT,
  ADD COLUMN "requiredSnapshot" BOOLEAN;
-- Old rows have no historical label. Preserve the template available at upgrade;
-- prior edits cannot be reconstructed and must be reviewed by the DB owner.
UPDATE "ConditionReportEntry" AS e
SET "labelSnapshot" = t.label, "requiredSnapshot" = t.required
FROM "ChecklistTemplateItem" AS t WHERE t.id = e."checklistItemId";
ALTER TABLE "ConditionReportEntry"
  ALTER COLUMN "labelSnapshot" SET NOT NULL,
  ALTER COLUMN "requiredSnapshot" SET NOT NULL;

CREATE OR REPLACE FUNCTION check_calendar_booking() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  booking_start date;
  booking_end date;
BEGIN
  IF NEW."bookingId" IS NOT NULL THEN
    -- Write a parent version, not only a SHARE lock: a stale REPEATABLE READ
    -- updater must fail serialization instead of overlooking newly linked days.
    UPDATE "Booking" SET "startDate" = "startDate"
    WHERE id = NEW."bookingId" AND "itemId" = NEW."itemId"
    RETURNING "startDate", "endDate" INTO booking_start, booking_end;
    IF NOT FOUND OR NEW.date NOT BETWEEN booking_start AND booking_end THEN
      RAISE EXCEPTION 'Calendar day must match booking item and date range'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION check_booking_links() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'RETURNED' THEN
      NEW."returnedAt" := timezone('UTC', clock_timestamp());
    ELSIF NEW."returnedAt" IS NOT NULL THEN
      RAISE EXCEPTION 'Return time can only be set on return' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW."itemId" IS DISTINCT FROM OLD."itemId"
     OR NEW."startDate" IS DISTINCT FROM OLD."startDate"
     OR NEW."endDate" IS DISTINCT FROM OLD."endDate" THEN
    IF EXISTS (SELECT 1 FROM "CalendarDay" WHERE "bookingId" = OLD.id
      AND ("itemId" <> NEW."itemId" OR date NOT BETWEEN NEW."startDate" AND NEW."endDate")) THEN
      RAISE EXCEPTION 'Booking update would invalidate calendar days' USING ERRCODE = '23514';
    END IF;
  END IF;
  IF NEW."totalVnd" IS DISTINCT FROM OLD."totalVnd"
     OR NEW."depositVnd" IS DISTINCT FROM OLD."depositVnd" THEN
    RAISE EXCEPTION 'Booking money snapshots are immutable' USING ERRCODE = '23514';
  END IF;
  IF NEW."returnedAt" IS DISTINCT FROM OLD."returnedAt" THEN
    RAISE EXCEPTION 'Return time is managed by the database and immutable' USING ERRCODE = '23514';
  END IF;
  IF OLD."returnedAt" IS NULL AND NEW.status = 'RETURNED' AND OLD.status <> 'RETURNED' THEN
    NEW."returnedAt" := timezone('UTC', clock_timestamp());
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER "Booking_check_links" ON "Booking";
CREATE TRIGGER "Booking_check_links" BEFORE INSERT OR UPDATE ON "Booking"
FOR EACH ROW EXECUTE FUNCTION check_booking_links();

CREATE FUNCTION protect_audit_log() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only' USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER "AuditLog_append_only" BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION protect_audit_log();

ALTER TABLE "RateTier" ADD CONSTRAINT "RateTier_values_check"
CHECK ("minDays" >= 1 AND ("maxDays" IS NULL OR "maxDays" >= "minDays")
       AND "pricePerDayVnd" >= 0);

-- Validate existing ranges too; a trigger alone only protects future writes.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM "RateTier" AS a JOIN "RateTier" AS b
    ON a."itemId" = b."itemId" AND a.id < b.id
    WHERE (a."maxDays" IS NULL OR b."minDays" <= a."maxDays")
      AND (b."maxDays" IS NULL OR a."minDays" <= b."maxDays")) THEN
    RAISE EXCEPTION 'Existing rate tiers overlap; review data before migrating';
  END IF;
END $$;

CREATE FUNCTION check_rate_tiers() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- The item row serializes all tier writers, including stale snapshot writers.
  UPDATE "Item" SET "replacementValueVnd" = "replacementValueVnd" WHERE id = NEW."itemId";
  IF EXISTS (SELECT 1 FROM "RateTier" AS t WHERE t."itemId" = NEW."itemId" AND t.id <> NEW.id
    AND (NEW."maxDays" IS NULL OR t."minDays" <= NEW."maxDays")
    AND (t."maxDays" IS NULL OR NEW."minDays" <= t."maxDays")) THEN
    RAISE EXCEPTION 'Rate tiers must not overlap' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "RateTier_no_overlap" BEFORE INSERT OR UPDATE ON "RateTier"
FOR EACH ROW EXECUTE FUNCTION check_rate_tiers();

CREATE FUNCTION snapshot_checklist_entry() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  template_label text;
  template_required boolean;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW."reportId" IS DISTINCT FROM OLD."reportId"
       OR NEW."checklistItemId" IS DISTINCT FROM OLD."checklistItemId"
       OR NEW."labelSnapshot" IS DISTINCT FROM OLD."labelSnapshot"
       OR NEW."requiredSnapshot" IS DISTINCT FROM OLD."requiredSnapshot" THEN
      RAISE EXCEPTION 'Checklist entry identity and snapshots are immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
  END IF;

  SELECT t.label, t.required INTO template_label, template_required
  FROM "ChecklistTemplateItem" AS t
  JOIN "ConditionReport" AS r ON r.id = NEW."reportId"
  JOIN "Booking" AS b ON b.id = r."bookingId"
  JOIN "Item" AS i ON i.id = b."itemId"
  WHERE t.id = NEW."checklistItemId" AND t."categoryId" = i."categoryId"
  FOR SHARE OF t;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checklist template must belong to the booking item category' USING ERRCODE = '23514';
  END IF;
  -- Do not trust snapshots supplied by a caller; capture the current template.
  NEW."labelSnapshot" := template_label;
  NEW."requiredSnapshot" := template_required;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "ConditionReportEntry_snapshot" BEFORE INSERT OR UPDATE ON "ConditionReportEntry"
FOR EACH ROW EXECUTE FUNCTION snapshot_checklist_entry();

COMMIT;
