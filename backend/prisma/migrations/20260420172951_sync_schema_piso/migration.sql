-- AlterTable
ALTER TABLE "lost_found_items" ADD COLUMN     "fotos_url" TEXT;

-- AlterTable
ALTER TABLE "units" ADD COLUMN     "area" TEXT,
ADD COLUMN     "piso" INTEGER;
