/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `empresas_transporte` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "empresas_transporte_nombre_key" ON "empresas_transporte"("nombre");
