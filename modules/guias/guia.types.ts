// modules/guias/guia.types.ts

import type {
  EstadoGuia,
  EstadoPago,
  MetodoPago,
  TipoContenedor,
  TipoDocumento,
  TipoPrecioGuia,
  TratamientoIGV,
} from "@/lib/generated/prisma"
import { GuiaConRelaciones } from "./components/guia-con-relaciones.type"

/**
 * Resultado del cálculo de días de almacenamiento.
 */
export type CalculoAlmacenamiento = {
  diasAlmacenamiento: number
}

/**
 * Resultado del cálculo monetario.
 */
export type CalculoMonto = {
  subtotal: number
  montoIGV: number
  montoTotal: number
}

/**
 * Datos necesarios para calcular
 * el monto de una guía.
 */
export type DatosCalculoMonto = {
  diasAlmacenamiento: number
  precioPrimerDia: number
  precioDiaAdicional: number
  tratamientoIGV: TratamientoIGV
  porcentajeIGV: number
}

/**
 * Datos del cliente utilizados
 * al registrar una guía.
 */
export type ClienteGuiaInput = {
  tipoDocumento: TipoDocumento
  numeroDocumento: string
  nombreCompleto?: string | null
}

/**
 * Datos del contenedor utilizados
 * al registrar una guía.
 */
export type ContenedorGuiaInput = {
  numeroContenedor: string
  marca: string
  medida: number
  tipo: TipoContenedor
}

/**
 * Datos del transportista utilizados
 * al registrar una guía.
 */
export type TransportistaGuiaInput = {
  empresaNombre: string

  placa: string

  conductorNombre: string
  numeroLicencia: string
}

/**
 * Datos necesarios para crear una guía.
 *
 * Los IDs de las entidades relacionadas NO se reciben
 * desde el formulario.
 *
 * El servicio de guías se encarga de buscar o crear:
 * - Cliente
 * - Contenedor
 * - Empresa de transporte
 * - Vehículo
 * - Conductor
 */
export type CrearGuiaInput = {
  numeroGuia: string

  cliente?: ClienteGuiaInput | null

  contenedor: ContenedorGuiaInput

  transportistaIngreso: TransportistaGuiaInput

  fechaIngreso: Date
  horaIngreso: Date

  tipoPrecio: TipoPrecioGuia

  /**
   * Solo se utilizan cuando
   * tipoPrecio = PERSONALIZADO.
   */
  precioPrimerDia?: number
  precioDiaAdicional?: number

  tratamientoIGV: TratamientoIGV

  observaciones?: string | null
}

/**
 * Datos necesarios para registrar
 * la salida de una guía.
 */
export type RegistrarSalidaGuiaInput = {
  guiaId: number

  transportistaSalida: TransportistaGuiaInput

  fechaSalida: Date
  horaSalida: Date

  diasAlmacenamiento: number

  tipoPrecio: TipoPrecioGuia

  precioPrimerDia: number

  precioDiaAdicional: number

  tratamientoIGV: TratamientoIGV
}

/**
 * Datos necesarios para registrar
 * el pago de una guía.
 */
export type RegistrarPagoGuiaInput = {
  guiaId: number

  cliente?: ClienteGuiaInput | null

  metodoPago: MetodoPago

  numeroOperacion?: string | null

  fechaPago: Date

  horaPago: Date
}
/**
 * Datos internos que utiliza el repository
 * después de que el service haya resuelto
 * todas las relaciones.
 */
export type CrearGuiaRepositoryInput = {
  numeroGuia: string

  clienteId?: number | null
  contenedorId: number

  empresaTransporteIngresoId: number
  vehiculoIngresoId: number
  conductorIngresoId: number

  fechaIngreso: Date
  horaIngreso: Date

  tipoPrecio: TipoPrecioGuia

  precioPrimerDia: number
  precioDiaAdicional: number

  porcentajeIGV: number

  tratamientoIGV: TratamientoIGV

  estado: EstadoGuia

  observaciones?: string | null
}

export type FiltrosGuias = {
  busqueda?: string
  estado?: EstadoGuia | "TODOS"
  pagina?: number
  estadoPago?: EstadoPago | "TODOS"
  limite?: number
}

export type ResultadoGuiasPaginadas = {
  guias: GuiaConRelaciones[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}
