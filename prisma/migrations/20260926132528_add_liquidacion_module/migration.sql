-- CreateEnum
CREATE TYPE "EstadoLiquidacion" AS ENUM ('BORRADOR', 'CONFIRMADA', 'PAGADA', 'ANULADA');

-- CreateTable
CREATE TABLE "liquidaciones" (
    "id" SERIAL NOT NULL,
    "numero" VARCHAR(30) NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "fecha_corte" DATE NOT NULL,
    "estado" "EstadoLiquidacion" NOT NULL DEFAULT 'BORRADOR',
    "cantidad_guias" INTEGER NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "porcentaje_igv" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "monto_igv" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "monto_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "metodo_pago" "MetodoPago",
    "numero_operacion" VARCHAR(100),
    "fecha_pago" TIMESTAMP(0),
    "observaciones" TEXT,
    "confirmada_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "liquidaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "liquidacion_detalles" (
    "id" SERIAL NOT NULL,
    "liquidacion_id" INTEGER NOT NULL,
    "guia_id" INTEGER NOT NULL,
    "numero_guia" VARCHAR(30) NOT NULL,
    "marca_contenedor" VARCHAR(100) NOT NULL,
    "numero_contenedor" VARCHAR(20) NOT NULL,
    "medida_contenedor" INTEGER NOT NULL,
    "tipo_contenedor" "TipoContenedor" NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "fecha_salida" DATE,
    "precio_ingreso_salida" DECIMAL(10,2),
    "cantidad_movimientos" INTEGER,
    "subtotal_movimientos" DECIMAL(10,2),
    "monto_total_guia" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "liquidacion_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "liquidaciones_numero_key" ON "liquidaciones"("numero");

-- CreateIndex
CREATE INDEX "liquidaciones_cliente_id_idx" ON "liquidaciones"("cliente_id");

-- CreateIndex
CREATE INDEX "liquidaciones_estado_idx" ON "liquidaciones"("estado");

-- CreateIndex
CREATE INDEX "liquidaciones_fecha_corte_idx" ON "liquidaciones"("fecha_corte");

-- CreateIndex
CREATE INDEX "liquidacion_detalles_liquidacion_id_idx" ON "liquidacion_detalles"("liquidacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "liquidacion_detalles_guia_id_key" ON "liquidacion_detalles"("guia_id");

-- AddForeignKey
ALTER TABLE "liquidaciones" ADD CONSTRAINT "liquidaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidacion_detalles" ADD CONSTRAINT "liquidacion_detalles_liquidacion_id_fkey" FOREIGN KEY ("liquidacion_id") REFERENCES "liquidaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "liquidacion_detalles" ADD CONSTRAINT "liquidacion_detalles_guia_id_fkey" FOREIGN KEY ("guia_id") REFERENCES "guias_internamiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
