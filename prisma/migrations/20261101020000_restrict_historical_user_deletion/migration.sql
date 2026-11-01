BEGIN;

-- Preserve attribution without implicit UPDATEs on append-only tables.
-- Accounts are deactivated through isActive instead of deleting their history.
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_actorId_fkey";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey"
FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DepositLedger" DROP CONSTRAINT "DepositLedger_createdById_fkey";
ALTER TABLE "DepositLedger" ADD CONSTRAINT "DepositLedger_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "DamageClaim" DROP CONSTRAINT "DamageClaim_resolvedById_fkey";
ALTER TABLE "DamageClaim" ADD CONSTRAINT "DamageClaim_resolvedById_fkey"
FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
