// modules\flat-racks\flat-rack.types.ts

/**
 * Representa un Flat Rack almacenado en el sistema.
 */
export interface FlatRack {
  id: number
  numero: string
  marca: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Metadatos de paginación utilizados por los listados.
 */
export interface FlatRackPagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}
