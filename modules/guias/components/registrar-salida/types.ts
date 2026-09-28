// modules/guias/components/registrar-salida/types.ts

import type { CalculoMonto } from "../../guia.types"

/**
 * Configuración de precios estándar cargada
 * desde la configuración global del sistema.
 */
export type PrecioBase = {
  precioPrimerDia: number
  precioDiaAdicional: number
  porcentajeIGV: number
}

/**
 * Re-exportamos CalculoMonto para que los componentes
 * internos solo importen desde este módulo.
 */
export type { CalculoMonto }
