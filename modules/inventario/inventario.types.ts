// modules\inventario\inventario.types.ts

import {
  EstadoInventario,
  ResultadoInventario,
} from "@/lib/generated/prisma/client"

export type InventarioConDetalles = {
  id: number
  fecha: Date
  estado: EstadoInventario
  observaciones: string | null
  createdAt: Date
  updatedAt: Date
  detalles: InventarioDetalleConGuia[]
}

export type InventarioDetalleConGuia = {
  id: number
  inventarioId: number
  guiaId: number
  resultado: ResultadoInventario
  observaciones: string | null
  verificadoAt: Date | null

  guia: {
    id: number
    numeroGuia: string
    fechaIngreso: Date
    estado: string

    contenedor: {
      id: number
      numero: string
      medida: number
      tipo?: string
    }
  }
}

export type CrearInventarioInput = {
  fecha: Date
  observaciones?: string
}

export type ActualizarResultadoInventarioInput = {
  detalleId: number
  resultado: ResultadoInventario
  observaciones?: string
}

export type InventarioResumen = {
  total: number
  pendientes: number
  encontrados: number
  noEncontrados: number
}
