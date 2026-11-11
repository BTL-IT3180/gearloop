BEGIN;

-- Rename enum labels in place: preserve existing users, enum identity and default.
ALTER TYPE "Role" RENAME VALUE 'SELLER' TO 'OWNER';
ALTER TYPE "Role" RENAME VALUE 'BUYER' TO 'RENTER';

-- Preserve booking data and relationships while aligning the participant name.
ALTER TABLE "Booking" RENAME COLUMN "buyerId" TO "renterId";
ALTER TABLE "Booking" RENAME CONSTRAINT "Booking_buyerId_fkey" TO "Booking_renterId_fkey";
ALTER INDEX "Booking_buyerId_idx" RENAME TO "Booking_renterId_idx";

COMMIT;
