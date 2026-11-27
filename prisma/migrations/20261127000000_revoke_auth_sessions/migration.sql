CREATE TABLE "RevokedAuthSession" (
    "id" UUID NOT NULL,
    "revokedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedAuthSession_pkey" PRIMARY KEY ("id")
);
