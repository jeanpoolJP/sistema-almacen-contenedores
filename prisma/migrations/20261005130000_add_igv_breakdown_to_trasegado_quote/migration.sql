CREATE TYPE "ModoIGVCotizacion" AS ENUM ('SIN_IGV', 'CON_IGV', 'IGV_INCLUIDO');

ALTER TABLE "guias_trasegado"
ADD COLUMN "modo_igv_cotizacion" "ModoIGVCotizacion" NOT NULL DEFAULT 'SIN_IGV';