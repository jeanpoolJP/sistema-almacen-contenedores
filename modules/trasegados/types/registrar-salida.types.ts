// modules\trasegados\types\registrar-salida.types.ts

/**
 * Elemento del ingreso que puede ser retirado en una nueva salida.
 * Solo se listan los que aún no tienen salida asociada.
 */
export interface ElementoPendienteSalida {
  id: number
  tipo: "CONTENEDOR" | "FLAT_RACK" | "MERCADERIA" | "MAQUINARIA" | "OTRO"

  numero: string | null
  descripcion: string | null
  observaciones: string | null

  contenedor: {
    id: number
    numeroContenedor: string
    marca: string
    medida: number
    tipo: "NORMAL" | "REEFER"
  } | null

  flatRack: {
    id: number
    numero: string
    marca: string
  } | null
}
