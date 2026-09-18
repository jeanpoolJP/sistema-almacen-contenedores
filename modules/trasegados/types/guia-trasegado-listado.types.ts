// modules\trasegados\types\guia-trasegado-listado.types.ts

import type { ListarGuiasTrasegadoInput } from "../schemas/listar-guias-trasegado.schema"

/**
 * Fila que se muestra en la tabla del listado.
 *
 * Solo se incluyen los campos que se visualizan,
 * NO la guía completa. Para el detalle se usa
 * obtenerGuiaTrasegadoService.
 */
export interface GuiaTrasegadoListItem {
  id: number
  numeroGuia: string
  descripcionServicio: string | null

  fechaIngreso: Date
  estado: "EN_PROCESO" | "FINALIZADO"

  estadoPago: "PENDIENTE" | "PAGADO"
  totalPagar: number | null

  cliente: {
    id: number
    tipoDocumento: "DNI" | "RUC"
    numeroDocumento: string
    nombreCompleto: string | null
  } | null

  // Conteos para la UI
  totalElementos: number
  totalSalidas: number
}

export interface ListarGuiasTrasegadoResult {
  items: GuiaTrasegadoListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ListarGuiasTrasegadoFiltros = ListarGuiasTrasegadoInput
