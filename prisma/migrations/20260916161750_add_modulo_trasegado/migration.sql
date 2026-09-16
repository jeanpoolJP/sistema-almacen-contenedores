-- CreateEnum
CREATE TYPE "EstadoGuiaTrasegado" AS ENUM ('EN_PROCESO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "TipoElementoTrasegado" AS ENUM ('CONTENEDOR', 'FLAT_RACK', 'MERCADERIA', 'MAQUINARIA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoVehiculoTrasegado" AS ENUM ('PORTA_CONTENEDORES', 'CAMA_BAJA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoVehiculo" AS ENUM ('PORTA_CONTENEDORES', 'CAMA_BAJA', 'OTRO');

-- DropForeignKey
ALTER TABLE "inventario_detalles" DROP CONSTRAINT "inventario_detalles_guia_id_fkey";

-- AlterTable
ALTER TABLE "vehiculos" ADD COLUMN     "descripcion" VARCHAR(255),
ADD COLUMN     "tipo" "TipoVehiculo";

-- CreateTable
CREATE TABLE "guias_trasegado" (
    "id" SERIAL NOT NULL,
    "numero_guia" VARCHAR(30) NOT NULL,
    "descripcion_servicio" VARCHAR(255),
    "cliente_id" INTEGER,
    "fecha_ingreso" TIMESTAMPTZ(3) NOT NULL,
    "estado" "EstadoGuiaTrasegado" NOT NULL DEFAULT 'EN_PROCESO',
    "subtotal" DECIMAL(10,2),
    "porcentaje_igv" DECIMAL(5,2),
    "monto_igv" DECIMAL(10,2),
    "total_pagar" DECIMAL(10,2),
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "metodo_pago" "MetodoPago",
    "numero_operacion" VARCHAR(100),
    "fecha_pago" TIMESTAMPTZ(3),
    "tratamiento_igv" "TratamientoIGV" NOT NULL DEFAULT 'SIN_IGV',
    "observaciones" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "guias_trasegado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_trasegado_ingresos" (
    "id" SERIAL NOT NULL,
    "guia_trasegado_id" INTEGER NOT NULL,
    "empresa_transporte_id" INTEGER NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,

    CONSTRAINT "guias_trasegado_ingresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_trasegado_elementos" (
    "id" SERIAL NOT NULL,
    "ingreso_id" INTEGER NOT NULL,
    "tipo" "TipoElementoTrasegado" NOT NULL,
    "contenedor_id" INTEGER,
    "flat_rack_id" INTEGER,
    "descripcion" VARCHAR(255),
    "numero" VARCHAR(50),
    "observaciones" TEXT,

    CONSTRAINT "guias_trasegado_elementos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_trasegado_salidas" (
    "id" SERIAL NOT NULL,
    "guia_trasegado_id" INTEGER NOT NULL,
    "fecha_salida" TIMESTAMPTZ(3) NOT NULL,
    "empresa_transporte_id" INTEGER NOT NULL,
    "vehiculo_id" INTEGER NOT NULL,
    "conductor_id" INTEGER NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "guias_trasegado_salidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_trasegado_salida_elementos" (
    "id" SERIAL NOT NULL,
    "salida_id" INTEGER NOT NULL,
    "elemento_id" INTEGER NOT NULL,

    CONSTRAINT "guias_trasegado_salida_elementos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flat_racks" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "flat_racks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guias_trasegado_numero_guia_key" ON "guias_trasegado"("numero_guia");

-- CreateIndex
CREATE INDEX "guias_trasegado_cliente_id_idx" ON "guias_trasegado"("cliente_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_estado_idx" ON "guias_trasegado"("estado");

-- CreateIndex
CREATE INDEX "guias_trasegado_estado_pago_idx" ON "guias_trasegado"("estado_pago");

-- CreateIndex
CREATE INDEX "guias_trasegado_fecha_ingreso_idx" ON "guias_trasegado"("fecha_ingreso");

-- CreateIndex
CREATE UNIQUE INDEX "guias_trasegado_ingresos_guia_trasegado_id_key" ON "guias_trasegado_ingresos"("guia_trasegado_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_ingresos_empresa_transporte_id_idx" ON "guias_trasegado_ingresos"("empresa_transporte_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_ingresos_vehiculo_id_idx" ON "guias_trasegado_ingresos"("vehiculo_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_ingresos_conductor_id_idx" ON "guias_trasegado_ingresos"("conductor_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_elementos_ingreso_id_idx" ON "guias_trasegado_elementos"("ingreso_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_elementos_contenedor_id_idx" ON "guias_trasegado_elementos"("contenedor_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_elementos_flat_rack_id_idx" ON "guias_trasegado_elementos"("flat_rack_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_salidas_guia_trasegado_id_idx" ON "guias_trasegado_salidas"("guia_trasegado_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_salidas_empresa_transporte_id_idx" ON "guias_trasegado_salidas"("empresa_transporte_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_salidas_vehiculo_id_idx" ON "guias_trasegado_salidas"("vehiculo_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_salidas_conductor_id_idx" ON "guias_trasegado_salidas"("conductor_id");

-- CreateIndex
CREATE INDEX "guias_trasegado_salidas_fecha_salida_idx" ON "guias_trasegado_salidas"("fecha_salida");

-- CreateIndex
CREATE INDEX "guias_trasegado_salida_elementos_elemento_id_idx" ON "guias_trasegado_salida_elementos"("elemento_id");

-- CreateIndex
CREATE UNIQUE INDEX "guias_trasegado_salida_elementos_salida_id_elemento_id_key" ON "guias_trasegado_salida_elementos"("salida_id", "elemento_id");

-- CreateIndex
CREATE UNIQUE INDEX "flat_racks_numero_key" ON "flat_racks"("numero");

-- AddForeignKey
ALTER TABLE "inventario_detalles" ADD CONSTRAINT "inventario_detalles_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "guias_internamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado" ADD CONSTRAINT "guias_trasegado_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_ingresos" ADD CONSTRAINT "guias_trasegado_ingresos_guia_trasegado_id_fkey" FOREIGN KEY ("guia_trasegado_id") REFERENCES "guias_trasegado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_ingresos" ADD CONSTRAINT "guias_trasegado_ingresos_empresa_transporte_id_fkey" FOREIGN KEY ("empresa_transporte_id") REFERENCES "empresas_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_ingresos" ADD CONSTRAINT "guias_trasegado_ingresos_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_ingresos" ADD CONSTRAINT "guias_trasegado_ingresos_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "conductores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_elementos" ADD CONSTRAINT "guias_trasegado_elementos_ingreso_id_fkey" FOREIGN KEY ("ingreso_id") REFERENCES "guias_trasegado_ingresos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_elementos" ADD CONSTRAINT "guias_trasegado_elementos_contenedor_id_fkey" FOREIGN KEY ("contenedor_id") REFERENCES "contenedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_elementos" ADD CONSTRAINT "guias_trasegado_elementos_flat_rack_id_fkey" FOREIGN KEY ("flat_rack_id") REFERENCES "flat_racks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salidas" ADD CONSTRAINT "guias_trasegado_salidas_guia_trasegado_id_fkey" FOREIGN KEY ("guia_trasegado_id") REFERENCES "guias_trasegado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salidas" ADD CONSTRAINT "guias_trasegado_salidas_empresa_transporte_id_fkey" FOREIGN KEY ("empresa_transporte_id") REFERENCES "empresas_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salidas" ADD CONSTRAINT "guias_trasegado_salidas_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salidas" ADD CONSTRAINT "guias_trasegado_salidas_conductor_id_fkey" FOREIGN KEY ("conductor_id") REFERENCES "conductores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salida_elementos" ADD CONSTRAINT "guias_trasegado_salida_elementos_salida_id_fkey" FOREIGN KEY ("salida_id") REFERENCES "guias_trasegado_salidas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_trasegado_salida_elementos" ADD CONSTRAINT "guias_trasegado_salida_elementos_elemento_id_fkey" FOREIGN KEY ("elemento_id") REFERENCES "guias_trasegado_elementos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
