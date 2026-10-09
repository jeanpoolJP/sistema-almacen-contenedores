-- AlterTable
ALTER TABLE "GuiaAlquiler"
ADD COLUMN "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN "metodo_pago" "MetodoPago",
ADD COLUMN "numero_operacion" VARCHAR(100),
ADD COLUMN "fecha_pago" DATE,
ADD COLUMN "hora_pago" TIME(0);
