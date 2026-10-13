// modules/control-alquiler/control-alquiler.types.ts
import type {
  EstadoGuiaAlquiler,
  EstadoPago,
  GuiaAlquiler,
  Equipo,
  Operador,
  Cliente,
} from "@/lib/generated/prisma/client"

import type {
  GuiaAlquilerFormData,
  FiltrosGuiaAlquiler,
  CotizacionFormData,
  PagoGuiaAlquilerFormData,
  AsignarClienteFormData,
} from "./control-alquiler.schema"

export type {
  GuiaAlquilerFormData,
  FiltrosGuiaAlquiler,
  CotizacionFormData,
  PagoGuiaAlquilerFormData,
  AsignarClienteFormData,
}

export type { EstadoGuiaAlquiler, EstadoPago }

/** Guía con relaciones para la tabla */
export type GuiaAlquilerConRelaciones = GuiaAlquiler & {
  cliente: Pick<Cliente, "id" | "nombreCompleto" | "numeroDocumento"> | null
  equipo: Pick<Equipo, "id" | "codigo" | "nombre" | "tipo">
  operador: Pick<Operador, "id" | "nombres" | "apellidos"> | null
}

/** Item ya serializado para el cliente (RSC -> Client Component) */
export interface GuiaAlquilerListItem {
  id: string
  numeroGuia: string

  fechaInicio: string
  fechaFin: string

  solicitante: string | null
  lugarServicio: string | null
  descripcionServicio: string | null

  // Horarios
  horaSalida: string | null
  horaInicio: string | null
  horaFinalizacion: string | null
  horaRetorno: string | null

  // Cobro
  horasServicio: number | null
  horasMinimas: number | null
  precioPorHora: number | null

  // Horómetro
  horometroInicial: number | null
  horometroFinal: number | null
  horasUsoMaquina: number | null

  // Totales
  subtotal: number | null
  igv: number | null
  total: number | null
  modoIGVCotizacion: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO" | null
  numeroCotizacion: string | null

  // Pago
  estadoPago: EstadoPago
  metodoPago: string | null
  numeroOperacion: string | null
  fechaPago: string | null
  horaPago: string | null

  estado: EstadoGuiaAlquiler
  observaciones: string | null

  cliente: {
    id: number
    nombreCompleto: string | null
    numeroDocumento: string
  } | null

  equipo: {
    id: string
    codigo: string
    nombre: string
    tipo: string
  }

  operador: {
    id: string
    nombres: string
    apellidos: string
  } | null

  nombreOperadorExterno: string | null

  createdAt: string
  updatedAt: string
}

/** Resultado paginado */
export interface GuiaAlquilerPaginado {
  guias: GuiaAlquilerListItem[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

/** Resultado de acción server action */
export type ActionResult<T = unknown> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> }

/** Opción para selects */
export interface SelectOption<T = string> {
  value: T
  label: string
}
