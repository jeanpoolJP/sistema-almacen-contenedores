// modules\trasegados\schemas\shared\empresa-transporte.schema.ts

import { z } from "zod"
import { upperString, optionalUpperString } from "./upper-string.helper"

/**
 * Datos de una empresa de transporte.
 */
export const empresaTransporteInputSchema = z.object({
  ruc: upperString(1, 20, "El RUC es obligatorio."),
  nombre: upperString(1, 255, "El nombre de la empresa es obligatorio."),
  telefono: optionalUpperString(30),
  contactoLogistico: optionalUpperString(255),
  nombreEncargado: optionalUpperString(255),
})

export type EmpresaTransporteInput = z.infer<
  typeof empresaTransporteInputSchema
>
