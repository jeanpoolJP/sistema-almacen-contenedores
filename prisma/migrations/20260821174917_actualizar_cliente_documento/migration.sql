/*
  Warnings:

  - You are about to drop the column `dni` on the `clientes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numero_documento]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero_documento` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_documento` to the `clientes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'RUC');

-- DropIndex
DROP INDEX "clientes_dni_key";

-- AlterTable
ALTER TABLE "clientes" DROP COLUMN "dni",
ADD COLUMN     "numero_documento" VARCHAR(11) NOT NULL,
ADD COLUMN     "tipo_documento" "TipoDocumento" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clientes_numero_documento_key" ON "clientes"("numero_documento");
