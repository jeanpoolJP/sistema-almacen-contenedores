DO $$
BEGIN
  CREATE TYPE "CargaContenedor" AS ENUM ('LLENO', 'VACIO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "guias_internamiento"
ADD COLUMN IF NOT EXISTS "carga_contenedor" "CargaContenedor";