-- CreateEnum
CREATE TYPE "public"."EstadoInventario" AS ENUM ('EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "public"."EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO');

-- CreateEnum
CREATE TYPE "public"."ResultadoInventario" AS ENUM ('PENDIENTE', 'ENCONTRADO', 'NO_ENCONTRADO');

-- AlterEnum
ALTER TYPE "public"."TipoPrecioGuia" ADD VALUE 'ESPACIO_ALQUILADO';

-- DropIndex
DROP INDEX "public"."empresas_transporte_nombre_key";

-- AlterTable
ALTER TABLE "public"."conductores" ADD COLUMN     "telefono" VARCHAR(20);

-- AlterTable
ALTER TABLE "public"."empresas_transporte" ADD COLUMN     "contacto_logistico" VARCHAR(150),
ADD COLUMN     "nombre_encargado" VARCHAR(150),
ALTER COLUMN "ruc" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."guias_internamiento" ADD COLUMN     "cantidad_movimientos" INTEGER,
ADD COLUMN     "estado_pago" "public"."EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "fecha_pago" DATE,
ADD COLUMN     "hora_pago" TIME(0),
ADD COLUMN     "metodo_pago" "public"."MetodoPago",
ADD COLUMN     "numero_operacion" VARCHAR(100),
ADD COLUMN     "precio_ingreso_salida" DECIMAL(10,2),
ADD COLUMN     "precio_movimiento" DECIMAL(10,2),
ADD COLUMN     "subtotal_movimientos" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "public"."inventario_detalles" (
    "id" SERIAL NOT NULL,
    "inventario_id" INTEGER NOT NULL,
    "guia_id" INTEGER NOT NULL,
    "resultado" "public"."ResultadoInventario" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "verificado_at" TIMESTAMP(0),

    CONSTRAINT "inventario_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventarios" (
    "id" SERIAL NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" "public"."EstadoInventario" NOT NULL DEFAULT 'EN_PROCESO',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "inventarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."usuarios_auth" (
    "id" SERIAL NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_auth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventario_detalles_guia_id_idx" ON "public"."inventario_detalles"("guia_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "inventario_detalles_inventario_id_guia_id_key" ON "public"."inventario_detalles"("inventario_id" ASC, "guia_id" ASC);

-- CreateIndex
CREATE INDEX "inventario_detalles_inventario_id_idx" ON "public"."inventario_detalles"("inventario_id" ASC);

-- CreateIndex
CREATE INDEX "inventarios_fecha_idx" ON "public"."inventarios"("fecha" ASC);

-- AddForeignKey
ALTER TABLE "public"."inventario_detalles" ADD CONSTRAINT "inventario_detalles_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "public"."guias_internamiento"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventario_detalles" ADD CONSTRAINT "inventario_detalles_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "public"."inventarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

