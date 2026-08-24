/*
  Warnings:

  - Added the required column `precio_dia_adicional` to the `guias_internamiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `precio_primer_dia` to the `guias_internamiento` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoPrecioGuia" AS ENUM ('ESTANDAR', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "TratamientoIGV" AS ENUM ('SIN_IGV', 'CON_IGV');

-- AlterTable
ALTER TABLE "guias_internamiento" ADD COLUMN     "monto_igv" DECIMAL(10,2),
ADD COLUMN     "porcentaje_igv" DECIMAL(5,2),
ADD COLUMN     "precio_dia_adicional" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "precio_primer_dia" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "tipo_precio" "TipoPrecioGuia" NOT NULL DEFAULT 'ESTANDAR',
ADD COLUMN     "tratamiento_igv" "TratamientoIGV" NOT NULL DEFAULT 'SIN_IGV';

-- CreateTable
CREATE TABLE "configuracion_precios" (
    "id" SERIAL NOT NULL,
    "precio_primer_dia" DECIMAL(10,2) NOT NULL,
    "precio_dia_adicional" DECIMAL(10,2) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "configuracion_precios_pkey" PRIMARY KEY ("id")
);
