-- CreateEnum
CREATE TYPE "TipoDocumentoPersona" AS ENUM ('DNI', 'CARNET_EXTRANJERIA', 'PASAPORTE', 'OTRO');

-- CreateTable
CREATE TABLE "Operador" (
    "id" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumentoPersona" NOT NULL,
    "numeroDocumento" VARCHAR(30) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "telefono" TEXT,
    "licencia" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Operador_apellidos_nombres_idx" ON "Operador"("apellidos", "nombres");

-- CreateIndex
CREATE UNIQUE INDEX "Operador_tipoDocumento_numeroDocumento_key" ON "Operador"("tipoDocumento", "numeroDocumento");
