/*
  Warnings:

  - Added the required column `description` to the `Plan` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "currencyType" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "cost" TEXT NOT NULL
);
INSERT INTO "new_Plan" ("cost", "currencyType", "id", "name", "priceId", "productId", "type") SELECT "cost", "currencyType", "id", "name", "priceId", "productId", "type" FROM "Plan";
DROP TABLE "Plan";
ALTER TABLE "new_Plan" RENAME TO "Plan";
CREATE UNIQUE INDEX "Plan_priceId_key" ON "Plan"("priceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
