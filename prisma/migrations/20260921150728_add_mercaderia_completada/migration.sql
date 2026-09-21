-- AlterTable
ALTER TABLE "guias_trasegado_elementos" ADD COLUMN     "mercaderia_completada" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "TipoVehiculoTrasegado";
