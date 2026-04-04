-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "caseDate" TEXT,
ADD COLUMN     "causeOfDeath" TEXT,
ADD COLUMN     "deathDate" TEXT,
ADD COLUMN     "deathPlace" TEXT,
ADD COLUMN     "fileNumber" TEXT,
ADD COLUMN     "investigationText" TEXT;

-- AlterTable
ALTER TABLE "Plush" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "birthDate" TEXT,
ADD COLUMN     "identificationNumber" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "origin" TEXT,
ADD COLUMN     "race" TEXT;
