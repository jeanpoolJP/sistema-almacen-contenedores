// modules/guias/components/list/types.ts

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

export type GuiasData = {
  guias: GuiaConRelaciones[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export type GuiasFiltros = {
  numeroGuia: string
  numeroContenedor: string
  documentoCliente: string
  sinCliente: boolean
  estado?: string
  estadoPago?: string
  tratamientoIGV?: string
  fechaDesde: string
  fechaHasta: string
}

export type GuiasTableProps = {
  data: GuiasData
  onCambio?: () => void
}
