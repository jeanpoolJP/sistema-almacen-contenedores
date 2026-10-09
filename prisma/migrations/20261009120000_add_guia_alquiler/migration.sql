-- CreateEnum
CREATE TYPE "EstadoGuiaAlquiler" AS ENUM ('EN_PROCESO', 'FINALIZADO', 'ANULADO');

-- CreateTable
CREATE TABLE "GuiaAlquiler" (
    "id" TEXT NOT NULL,
    "numeroGuia" VARCHAR(30) NOT NULL,
    "fechaInicio" DATE NOT NULL,
    "fechaFin" DATE NOT NULL,
    "solicitante" VARCHAR(150),
    "horaSalida" TIME(0),
    "horaInicio" TIME(0),
    "horaFinalizacion" TIME(0),
    "horaRetorno" TIME(0),
    "subtotal" DECIMAL(10,2),
    "igv" DECIMAL(10,2),
    "total" DECIMAL(10,2),
    "modoIGVCotizacion" "ModoIGVCotizacion",
    "numeroCotizacion" VARCHAR(50),
    "observaciones" TEXT,
    "estado" "EstadoGuiaAlquiler" NOT NULL DEFAULT 'EN_PROCESO',
    "clienteId" INTEGER,
    "equipoId" TEXT NOT NULL,
    "operadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "GuiaAlquiler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuiaAlquiler_numeroGuia_key" ON "GuiaAlquiler"("numeroGuia");
CREATE INDEX "GuiaAlquiler_fechaInicio_estado_idx" ON "GuiaAlquiler"("fechaInicio", "estado");
CREATE INDEX "GuiaAlquiler_clienteId_fechaInicio_idx" ON "GuiaAlquiler"("clienteId", "fechaInicio");
CREATE INDEX "GuiaAlquiler_equipoId_fechaInicio_idx" ON "GuiaAlquiler"("equipoId", "fechaInicio");
CREATE INDEX "GuiaAlquiler_operadorId_fechaInicio_idx" ON "GuiaAlquiler"("operadorId", "fechaInicio");
CREATE INDEX "GuiaAlquiler_numeroCotizacion_idx" ON "GuiaAlquiler"("numeroCotizacion");

-- AddForeignKey
ALTER TABLE "GuiaAlquiler" ADD CONSTRAINT "GuiaAlquiler_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GuiaAlquiler" ADD CONSTRAINT "GuiaAlquiler_equipoId_fkey"
    FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GuiaAlquiler" ADD CONSTRAINT "GuiaAlquiler_operadorId_fkey"
    FOREIGN KEY ("operadorId") REFERENCES "Operador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
