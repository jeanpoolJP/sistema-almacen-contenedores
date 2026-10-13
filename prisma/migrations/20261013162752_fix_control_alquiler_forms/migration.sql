-- DropForeignKey
ALTER TABLE "GuiaAlquiler" DROP CONSTRAINT "GuiaAlquiler_operadorId_fkey";

-- AlterTable
ALTER TABLE "GuiaAlquiler" ADD COLUMN     "descripcionServicio" VARCHAR(255),
ADD COLUMN     "horasMinimas" DECIMAL(8,2),
ADD COLUMN     "horasServicio" DECIMAL(8,2),
ADD COLUMN     "horasUsoMaquina" DECIMAL(12,1),
ADD COLUMN     "horometroFinal" DECIMAL(12,1),
ADD COLUMN     "horometroInicial" DECIMAL(12,1),
ADD COLUMN     "lugarServicio" VARCHAR(250),
ADD COLUMN     "nombreOperadorExterno" VARCHAR(150),
ADD COLUMN     "precioPorHora" DECIMAL(10,2),
ALTER COLUMN "operadorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GuiaAlquiler" ADD CONSTRAINT "GuiaAlquiler_operadorId_fkey" FOREIGN KEY ("operadorId") REFERENCES "Operador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
