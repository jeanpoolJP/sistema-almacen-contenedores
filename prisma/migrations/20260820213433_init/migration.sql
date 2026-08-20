-- CreateEnum
CREATE TYPE "EstadoGuia" AS ENUM ('ALMACENADO', 'RETIRADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'YAPE', 'PLIN', 'TRANSFERENCIA', 'TARJETA', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoContenedor" AS ENUM ('NORMAL', 'REEFER');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "dni" VARCHAR(8),
    "nombre_completo" VARCHAR(150),
    "telefono" VARCHAR(20),
    "observaciones" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas_transporte" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "ruc" VARCHAR(11),
    "telefono" VARCHAR(20),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "empresas_transporte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductores" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,
    "numero_licencia" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "conductores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehiculos" (
    "id" SERIAL NOT NULL,
    "placa" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "vehiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenedores" (
    "id" SERIAL NOT NULL,
    "numero_contenedor" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(100) NOT NULL,
    "medida" INTEGER NOT NULL,
    "tipo" "TipoContenedor" NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "contenedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guias_internamiento" (
    "id" SERIAL NOT NULL,
    "numero_guia" VARCHAR(30) NOT NULL,
    "cliente_id" INTEGER,
    "contenedor_id" INTEGER NOT NULL,
    "empresa_transporte_ingreso_id" INTEGER NOT NULL,
    "vehiculo_ingreso_id" INTEGER NOT NULL,
    "conductor_ingreso_id" INTEGER NOT NULL,
    "fecha_ingreso" DATE NOT NULL,
    "hora_ingreso" TIME(0) NOT NULL,
    "empresa_transporte_salida_id" INTEGER,
    "vehiculo_salida_id" INTEGER,
    "conductor_salida_id" INTEGER,
    "fecha_salida" DATE,
    "hora_salida" TIME(0),
    "dias_almacenamiento" INTEGER,
    "monto_total" DECIMAL(10,2),
    "estado" "EstadoGuia" NOT NULL DEFAULT 'ALMACENADO',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "guias_internamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,
    "numero_operacion" VARCHAR(100),
    "fecha_pago" DATE NOT NULL,
    "hora_pago" TIME(0) NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_dni_key" ON "clientes"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_transporte_ruc_key" ON "empresas_transporte"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "conductores_numero_licencia_key" ON "conductores"("numero_licencia");

-- CreateIndex
CREATE UNIQUE INDEX "vehiculos_placa_key" ON "vehiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "contenedores_numero_contenedor_key" ON "contenedores"("numero_contenedor");

-- CreateIndex
CREATE UNIQUE INDEX "guias_internamiento_numero_guia_key" ON "guias_internamiento"("numero_guia");

-- CreateIndex
CREATE INDEX "idx_guias_cliente_id" ON "guias_internamiento"("cliente_id");

-- CreateIndex
CREATE INDEX "idx_guias_contenedor_id" ON "guias_internamiento"("contenedor_id");

-- CreateIndex
CREATE INDEX "idx_guias_empresa_transporte_ingreso_id" ON "guias_internamiento"("empresa_transporte_ingreso_id");

-- CreateIndex
CREATE INDEX "idx_guias_vehiculo_ingreso_id" ON "guias_internamiento"("vehiculo_ingreso_id");

-- CreateIndex
CREATE INDEX "idx_guias_conductor_ingreso_id" ON "guias_internamiento"("conductor_ingreso_id");

-- CreateIndex
CREATE INDEX "idx_guias_empresa_transporte_salida_id" ON "guias_internamiento"("empresa_transporte_salida_id");

-- CreateIndex
CREATE INDEX "idx_guias_vehiculo_salida_id" ON "guias_internamiento"("vehiculo_salida_id");

-- CreateIndex
CREATE INDEX "idx_guias_conductor_salida_id" ON "guias_internamiento"("conductor_salida_id");

-- CreateIndex
CREATE INDEX "idx_pagos_cliente_id" ON "pagos"("cliente_id");

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_contenedor_id_fkey" FOREIGN KEY ("contenedor_id") REFERENCES "contenedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_empresa_transporte_ingreso_id_fkey" FOREIGN KEY ("empresa_transporte_ingreso_id") REFERENCES "empresas_transporte"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_vehiculo_ingreso_id_fkey" FOREIGN KEY ("vehiculo_ingreso_id") REFERENCES "vehiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_conductor_ingreso_id_fkey" FOREIGN KEY ("conductor_ingreso_id") REFERENCES "conductores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_empresa_transporte_salida_id_fkey" FOREIGN KEY ("empresa_transporte_salida_id") REFERENCES "empresas_transporte"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_vehiculo_salida_id_fkey" FOREIGN KEY ("vehiculo_salida_id") REFERENCES "vehiculos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guias_internamiento" ADD CONSTRAINT "guias_internamiento_conductor_salida_id_fkey" FOREIGN KEY ("conductor_salida_id") REFERENCES "conductores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
