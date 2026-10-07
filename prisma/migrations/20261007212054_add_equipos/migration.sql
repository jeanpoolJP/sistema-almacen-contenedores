-- CreateEnum
CREATE TYPE "TipoEquipo" AS ENUM ('MONTACARGAS', 'STACKER', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEquipo" AS ENUM ('DISPONIBLE', 'EN_REPARACION', 'INOPERATIVO');

-- CreateTable
CREATE TABLE "Equipo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoEquipo" NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "placa" TEXT,
    "capacidadCarga" DECIMAL(6,2),
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'DISPONIBLE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_codigo_key" ON "Equipo"("codigo");

-- CreateIndex
CREATE INDEX "Equipo_tipo_idx" ON "Equipo"("tipo");

-- CreateIndex
CREATE INDEX "Equipo_estado_idx" ON "Equipo"("estado");
