// modules/guias/components/guia-con-relaciones.type.ts

import type {
  EstadoGuia,
  EstadoPago,
  MetodoPago,
  TipoContenedor,
  TipoDocumento,
  TipoPrecioGuia,
  TratamientoIGV,
} from "@/lib/generated/prisma"

/**
 * Forma que debe tener cada guía devuelta por `obtenerGuiasAction` /
 * `obtenerGuiaPorIdAction` para que los componentes de este módulo
 * puedan renderizarla completa (tabla + detalle).
 *
 * Esto implica que `guia.repository.ts` debe incluir (`include`) las
 * relaciones: cliente, contenedor, empresaTransporteIngreso,
 * vehiculoIngreso, conductorIngreso, empresaTransporteSalida,
 * vehiculoSalida, conductorSalida.
 *
 * Los campos Decimal de Prisma (precioPrimerDia, montoTotal, etc.)
 * se esperan aquí como `number`: conviértelos con `Number(...)` en el
 * repository/service antes de devolverlos a un componente cliente,
 * ya que `Decimal` no es serializable entre server/client.
 */
export type GuiaConRelaciones = {
  id: number
  numeroGuia: string

  fechaIngreso: Date
  horaIngreso: Date
  fechaSalida: Date | null
  horaSalida: Date | null

  diasAlmacenamiento: number | null

  tipoPrecio: TipoPrecioGuia
  precioPrimerDia: number
  precioDiaAdicional: number

  subtotal: number | null
  porcentajeIGV: number | null
  montoIGV: number | null
  montoTotal: number | null

  estadoPago: EstadoPago
  metodoPago: MetodoPago | null
  numeroOperacion: string | null
  fechaPago: Date | null
  horaPago: Date | null

  tratamientoIGV: TratamientoIGV
  estado: EstadoGuia

  observaciones: string | null

  createdAt: Date
  updatedAt: Date

  cliente: {
    id: number
    tipoDocumento: TipoDocumento
    numeroDocumento: string
    nombreCompleto: string | null
  } | null

  contenedor: {
    id: number
    numeroContenedor: string
    marca: string
    medida: number
    tipo: TipoContenedor
  }

  empresaTransporteIngreso: {
    id: number
    nombre: string
    ruc: string | null
    telefono: string | null
  }
  vehiculoIngreso: { id: number; placa: string }
  conductorIngreso: {
    id: number
    nombreCompleto: string
    numeroLicencia: string
  }

  empresaTransporteSalida: {
    id: number
    nombre: string
    ruc: string | null
    telefono: string | null
  } | null
  vehiculoSalida: { id: number; placa: string } | null
  conductorSalida: {
    id: number
    nombreCompleto: string
    numeroLicencia: string
  } | null
}
