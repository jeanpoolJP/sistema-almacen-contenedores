// modules\guias\utils\calcular-monto.ts

import type { TratamientoIGV } from "@/lib/generated/prisma";

import type {
  CalculoMonto,
  DatosCalculoMonto,
} from "../guia.types";

/**
 * Calcula el subtotal, el IGV y el monto total de una guía.
 * El primer día usa un precio independiente y los días restantes el precio adicional.
 *
 * @throws {Error} Si los días, precios o porcentaje de IGV no son válidos.
 */
export function calcularMontoGuia({
  diasAlmacenamiento,
  precioPrimerDia,
  precioDiaAdicional,
  tratamientoIGV,
  porcentajeIGV,
}: DatosCalculoMonto): CalculoMonto {
  if (diasAlmacenamiento < 1) {
    throw new Error(
      "Los días de almacenamiento deben ser mayores a 0"
    );
  }

  if (precioPrimerDia <= 0) {
    throw new Error(
      "El precio del primer día debe ser mayor a 0"
    );
  }

  if (precioDiaAdicional < 0) {
    throw new Error(
      "El precio del día adicional no puede ser negativo"
    );
  }

  if (porcentajeIGV < 0 || porcentajeIGV > 100) {
    throw new Error(
      "El porcentaje de IGV debe estar entre 0 y 100"
    );
  }

  const diasAdicionales =
    Math.max(0, diasAlmacenamiento - 1);

  const subtotal =
    precioPrimerDia +
    diasAdicionales * precioDiaAdicional;

  let montoIGV = 0;

  if (tratamientoIGV === "CON_IGV") {
    montoIGV =
      subtotal * (porcentajeIGV / 100);
  }

  const montoTotal =
    subtotal + montoIGV;

  return {
    subtotal: redondear(subtotal),
    montoIGV: redondear(montoIGV),
    montoTotal: redondear(montoTotal),
  };
}

/** Redondea un importe a dos decimales para evitar errores de precisión monetaria. */
function redondear(valor: number): number {
  return Math.round(
    (valor + Number.EPSILON) * 100
  ) / 100;
}