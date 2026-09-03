// modules/guias/guia.service.ts

import {
  actualizarGuia,
  anularGuia,
  crearGuia,
  obtenerGuiaPorId,
  obtenerGuiaPorNumero,
  obtenerGuias,
  obtenerGuiasEspacioAlquilado,
  registrarPagoGuia,
  asignarClienteAGuiasEspacioAlquilado,
  obtenerGuiasEspacioAlquiladoPorIds,
} from "./guia.repository"

import { findClienteById } from "@/modules/clientes/cliente.repository"

import {
  crearGuiaSchema,
  registrarPagoGuiaSchema,
  registrarSalidaGuiaSchema,
} from "./guia.schema"

import type {
  CrearGuiaInput,
  RegistrarSalidaGuiaInput,
  RegistrarPagoGuiaInput,
} from "./guia.types"

import { calcularDiasAlmacenamiento } from "./utils/calcular-almacenamiento"

import { calcularMontoGuia } from "./utils/calcular-monto"

import { serializarGuia } from "./utils/serializar-guia"

import { obtenerConfiguracionPrecioService } from "@/modules/configuracion/configuracion.service"

import { obtenerOCrearCliente } from "@/modules/clientes/cliente.service"

import { obtenerOCrearContenedor } from "@/modules/contenedores/contenedores.service"

import { obtenerOCrearEmpresaTransporte } from "@/modules/empresas-transporte/empresa-transporte.service"

import { obtenerOCrearVehiculo } from "@/modules/vehiculos/vehiculos.service"

import { obtenerOCrearConductor } from "@/modules/conductores/conductores.service"

import type {
  EstadoGuia,
  EstadoPago,
  TratamientoIGV,
} from "@/lib/generated/prisma"
import { formatearNumeroGuia } from "./utils/formatear-numero-guia"
import {
  calcularMontoEspacioAlquilado,
  calcularPrecioMovimientos,
} from "./utils/calcular-monto-espacio-alquilado"

/**
 * Crea una guía de internamiento.
 *
 * Este service coordina todos los módulos
 * relacionados con una guía.
 */
export async function crearGuiaService(data: CrearGuiaInput) {
  // ============================================================
  // 1. VALIDAR DATOS
  // ============================================================

  const datosValidados = crearGuiaSchema.parse(data)

  const numeroGuia = formatearNumeroGuia(datosValidados.numeroGuia)

  // ============================================================
  // 2. VERIFICAR NÚMERO DE GUÍA
  // ============================================================

  const guiaExistente = await obtenerGuiaPorNumero(numeroGuia)

  if (guiaExistente) {
    throw new Error(`Ya existe una guía con el número ${numeroGuia}`)
  }

  // ============================================================
  // 3. CLIENTE
  // ============================================================

  let cliente = null

  if (datosValidados.cliente) {
    cliente = await obtenerOCrearCliente({
      tipoDocumento: datosValidados.cliente.tipoDocumento,

      numeroDocumento: datosValidados.cliente.numeroDocumento,

      nombreCompleto: datosValidados.cliente.nombreCompleto,
    })
  }

  // ============================================================
  // 4. CONTENEDOR
  // ============================================================

  const contenedor = await obtenerOCrearContenedor({
    numeroContenedor: datosValidados.contenedor.numeroContenedor,

    marca: datosValidados.contenedor.marca,

    medida: datosValidados.contenedor.medida,

    tipo: datosValidados.contenedor.tipo,
  })

  // ============================================================
  // 5. EMPRESA DE TRANSPORTE
  // ============================================================

  const empresaIngreso = await obtenerOCrearEmpresaTransporte({
    nombre: datosValidados.transportistaIngreso.empresaNombre,
    ruc: datosValidados.transportistaIngreso.ruc,
    telefono: datosValidados.transportistaIngreso.telefono,
    contactoLogistico: datosValidados.transportistaIngreso.contactoLogistico,
    nombreEncargado: datosValidados.transportistaIngreso.nombreEncargado,
  })

  // ============================================================
  // 6. VEHÍCULO
  // ============================================================

  const vehiculoIngreso = await obtenerOCrearVehiculo({
    placa: datosValidados.transportistaIngreso.placa,
  })

  // ============================================================
  // 7. CONDUCTOR
  // ============================================================

  const conductorIngreso = await obtenerOCrearConductor({
    nombreCompleto: datosValidados.transportistaIngreso.conductorNombre,

    numeroLicencia: datosValidados.transportistaIngreso.numeroLicencia,
  })

  // ============================================================
  // 8. CONFIGURACIÓN DE PRECIOS
  // ============================================================

  const configuracion = await obtenerConfiguracionPrecioService()

  // ============================================================
  // 9. DETERMINAR PRECIOS
  // ============================================================

  let precioPrimerDia = 0

  let precioDiaAdicional = 0

  let precioIngresoSalida: number | undefined

  if (datosValidados.tipoPrecio === "ESTANDAR") {
    precioPrimerDia = Number(configuracion.precioPrimerDia)

    precioDiaAdicional = Number(configuracion.precioDiaAdicional)
  }

  if (datosValidados.tipoPrecio === "PERSONALIZADO") {
    precioPrimerDia = datosValidados.precioPrimerDia!

    precioDiaAdicional = datosValidados.precioDiaAdicional!
  }

  if (datosValidados.tipoPrecio === "ESPACIO_ALQUILADO") {
    precioIngresoSalida = datosValidados.precioIngresoSalida!
  }
  // ============================================================
  // 10. PORCENTAJE IGV
  // ============================================================

  const porcentajeIGV = Number(configuracion.porcentajeIGV)

  // ============================================================
  // 11. CREAR GUÍA
  // ============================================================

  const guia = await crearGuia({
    numeroGuia,

    clienteId: cliente?.id ?? null,

    contenedorId: contenedor.id,

    empresaTransporteIngresoId: empresaIngreso.id,

    vehiculoIngresoId: vehiculoIngreso.id,

    conductorIngresoId: conductorIngreso.id,

    fechaIngreso: datosValidados.fechaIngreso,

    horaIngreso: datosValidados.horaIngreso,

    tipoPrecio: datosValidados.tipoPrecio,

    precioPrimerDia,

    precioDiaAdicional,

    precioIngresoSalida,

    porcentajeIGV,

    tratamientoIGV: datosValidados.tratamientoIGV,

    estado: "ALMACENADO",

    observaciones: datosValidados.observaciones ?? null,
  })

  return serializarGuia(guia)
}

/**
 * Registra la salida de un contenedor.
 *
 * El operador puede modificar:
 *
 * - Tipo de precio
 * - Días de almacenamiento
 * - Precios personalizados
 * - Cantidad de movimiento
 * - Tratamiento de IGV
 *
 * El monto definitivo siempre se calcula
 * nuevamente en el servidor antes de guardar.
 */
export async function registrarSalidaGuiaService(
  data: RegistrarSalidaGuiaInput
) {
  // ============================================================
  // 1. VALIDAR DATOS
  // ============================================================

  const datosValidados = registrarSalidaGuiaSchema.parse(data)

  // ============================================================
  // 2. BUSCAR GUÍA
  // ============================================================

  const guia = await obtenerGuiaPorId(datosValidados.guiaId)

  if (!guia) {
    throw new Error("La guía no existe")
  }

  // ============================================================
  // 3. VALIDAR ESTADO
  // ============================================================

  if (guia.estado !== "ALMACENADO") {
    throw new Error("Solo se puede registrar la salida de una guía almacenada")
  }

  // ============================================================
  // 4. EMPRESA DE TRANSPORTE DE SALIDA
  // ============================================================

  const empresaSalida = await obtenerOCrearEmpresaTransporte({
    nombre: datosValidados.transportistaSalida.empresaNombre,

    ruc: datosValidados.transportistaSalida.ruc,

    telefono: datosValidados.transportistaSalida.telefono,

    contactoLogistico: datosValidados.transportistaSalida.contactoLogistico,

    nombreEncargado: datosValidados.transportistaSalida.nombreEncargado,
  })

  // ============================================================
  // 5. VEHÍCULO DE SALIDA
  // ============================================================

  const vehiculoSalida = await obtenerOCrearVehiculo({
    placa: datosValidados.transportistaSalida.placa,
  })

  // ============================================================
  // 6. CONDUCTOR DE SALIDA
  // ============================================================

  const conductorSalida = await obtenerOCrearConductor({
    nombreCompleto: datosValidados.transportistaSalida.conductorNombre,

    numeroLicencia: datosValidados.transportistaSalida.numeroLicencia,
  })

  // ============================================================
  // 7. CALCULAR DÍAS AUTOMÁTICAMENTE
  // ============================================================

  const diasCalculados = calcularDiasAlmacenamiento(
    guia.fechaIngreso,
    guia.horaIngreso,
    datosValidados.fechaSalida,
    datosValidados.horaSalida
  )

  console.log("Días calculados automáticamente:", diasCalculados)

  console.log(
    "Días ingresados por el operador:",
    datosValidados.diasAlmacenamiento
  )

  // ============================================================
  // 8. LOS DÍAS DEL FORMULARIO SON LOS DEFINITIVOS
  // ============================================================

  const diasAlmacenamiento = datosValidados.diasAlmacenamiento

  // ============================================================
  // 9. OBTENER CONFIGURACIÓN
  // ============================================================

  const configuracion = await obtenerConfiguracionPrecioService()

  // ============================================================
  // 10. OBTENER PORCENTAJE IGV
  // ============================================================

  const porcentajeIGV = Number(
    guia.porcentajeIGV ?? configuracion.porcentajeIGV
  )

  // ============================================================
  // 11. VARIABLES DEL CÁLCULO
  // ============================================================

  let precioPrimerDia = 0
  let precioDiaAdicional = 0

  let cantidadMovimientos: number | null = null
  let subtotalMovimientos: number | null = null

  let subtotal = 0
  let montoIGV = 0
  let montoTotal = 0

  // ============================================================
  // 12. DETERMINAR TIPO DE PRECIO
  // ============================================================

  if (datosValidados.tipoPrecio === "ESTANDAR") {
    // ----------------------------------------------------------
    // ESTÁNDAR
    // ----------------------------------------------------------

    precioPrimerDia = Number(configuracion.precioPrimerDia)

    precioDiaAdicional = Number(configuracion.precioDiaAdicional)

    const calculo = calcularMontoGuia({
      diasAlmacenamiento,

      precioPrimerDia,

      precioDiaAdicional,

      tratamientoIGV: datosValidados.tratamientoIGV,

      porcentajeIGV,
    })

    subtotal = calculo.subtotal
    montoIGV = calculo.montoIGV
    montoTotal = calculo.montoTotal
  } else if (datosValidados.tipoPrecio === "PERSONALIZADO") {
    // ----------------------------------------------------------
    // PERSONALIZADO
    // ----------------------------------------------------------

    if (datosValidados.precioPrimerDia === undefined) {
      throw new Error("El precio del primer día es obligatorio")
    }

    if (datosValidados.precioDiaAdicional === undefined) {
      throw new Error("El precio del día adicional es obligatorio")
    }

    precioPrimerDia = datosValidados.precioPrimerDia

    precioDiaAdicional = datosValidados.precioDiaAdicional

    const calculo = calcularMontoGuia({
      diasAlmacenamiento,

      precioPrimerDia,

      precioDiaAdicional,

      tratamientoIGV: datosValidados.tratamientoIGV,

      porcentajeIGV,
    })

    subtotal = calculo.subtotal
    montoIGV = calculo.montoIGV
    montoTotal = calculo.montoTotal
  } else if (datosValidados.tipoPrecio === "ESPACIO_ALQUILADO") {
    // ----------------------------------------------------------
    // ESPACIO ALQUILADO
    // ----------------------------------------------------------

    if (datosValidados.precioIngresoSalida === undefined) {
      throw new Error("El precio de ingreso y salida es obligatorio")
    }

    if (datosValidados.cantidadMovimientos === undefined) {
      throw new Error("La cantidad de movimientos es obligatoria")
    }

    const precioIngresoSalida = datosValidados.precioIngresoSalida

    cantidadMovimientos = datosValidados.cantidadMovimientos

    // La tarifa depende automáticamente de la cantidad de movimientos.
    subtotalMovimientos = calcularPrecioMovimientos(cantidadMovimientos)

    const calculo = calcularMontoEspacioAlquilado({
      precioIngresoSalida,
      cantidadMovimientos,
      tratamientoIGV: datosValidados.tratamientoIGV,
      porcentajeIGV,
    })

    subtotal = calculo.subtotal
    montoIGV = calculo.montoIGV
    montoTotal = calculo.montoTotal
  }

  // ============================================================
  // 13. ACTUALIZAR GUÍA
  // ============================================================

  const guiaActualizada = await actualizarGuia(guia.id, {
    // --------------------------------------------------------
    // TRANSPORTE DE SALIDA
    // --------------------------------------------------------

    empresaTransporteSalidaId: empresaSalida.id,

    vehiculoSalidaId: vehiculoSalida.id,

    conductorSalidaId: conductorSalida.id,

    // --------------------------------------------------------
    // FECHA Y HORA
    // --------------------------------------------------------

    fechaSalida: datosValidados.fechaSalida,

    horaSalida: datosValidados.horaSalida,

    // --------------------------------------------------------
    // ALMACENAMIENTO
    // --------------------------------------------------------

    diasAlmacenamiento,

    // --------------------------------------------------------
    // PRECIOS
    // --------------------------------------------------------

    tipoPrecio: datosValidados.tipoPrecio,

    precioPrimerDia,

    precioDiaAdicional,

    precioIngresoSalida: datosValidados.precioIngresoSalida,

    // --------------------------------------------------------
    // MOVIMIENTOS
    // --------------------------------------------------------

    cantidadMovimientos,

    subtotalMovimientos,

    // --------------------------------------------------------
    // TOTALES
    // --------------------------------------------------------

    subtotal,

    porcentajeIGV,

    montoIGV,

    montoTotal,

    // --------------------------------------------------------
    // IGV
    // --------------------------------------------------------

    tratamientoIGV: datosValidados.tratamientoIGV,

    // --------------------------------------------------------
    // ESTADO
    // --------------------------------------------------------

    estado: "RETIRADO",
  })

  // ============================================================
  // 14. SERIALIZAR
  // ============================================================

  return serializarGuia(guiaActualizada)
}

/**
 * Obtiene una guía por ID.
 */
export async function obtenerGuiaPorIdService(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID de la guía no es válido")
  }

  return obtenerGuiaPorId(id)
}

/**
 * Obtiene una guía mediante su número.
 */
export async function obtenerGuiaPorNumeroService(numeroGuia: string) {
  const numero = numeroGuia.trim()

  if (!numero) {
    throw new Error("El número de guía es obligatorio")
  }

  return obtenerGuiaPorNumero(numero)
}

/**
 * Obtiene  las guías.
 */

type ObtenerGuiasServiceParams = {
  pagina: number
  limite: number

  numeroGuia?: string
  numeroContenedor?: string
  documentoCliente?: string

  sinCliente?: boolean

  estado?: EstadoGuia
  estadoPago?: EstadoPago
  tratamientoIGV?: TratamientoIGV

  fechaDesde?: Date
  fechaHasta?: Date
}

export async function obtenerGuiasService({
  pagina,
  limite,
  numeroGuia,
  numeroContenedor,
  documentoCliente,
  sinCliente,
  estado,
  estadoPago,
  tratamientoIGV,
  fechaDesde,
  fechaHasta,
}: ObtenerGuiasServiceParams) {
  const resultado = await obtenerGuias({
    pagina,
    limite,
    numeroGuia,
    numeroContenedor,
    documentoCliente,
    sinCliente,
    estado,
    estadoPago,
    tratamientoIGV,
    fechaDesde,
    fechaHasta,
  })

  const guias = resultado.guias.map((guia) => ({
    ...guia,

    precioPrimerDia: Number(guia.precioPrimerDia),

    precioDiaAdicional: Number(guia.precioDiaAdicional),

    precioIngresoSalida:
      guia.precioIngresoSalida === null
        ? null
        : Number(guia.precioIngresoSalida),

    precioMovimiento:
      guia.precioMovimiento === null ? null : Number(guia.precioMovimiento),

    subtotalMovimientos:
      guia.subtotalMovimientos === null
        ? null
        : Number(guia.subtotalMovimientos),

    subtotal: guia.subtotal === null ? null : Number(guia.subtotal),

    porcentajeIGV:
      guia.porcentajeIGV === null ? null : Number(guia.porcentajeIGV),

    montoIGV: guia.montoIGV === null ? null : Number(guia.montoIGV),

    montoTotal: guia.montoTotal === null ? null : Number(guia.montoTotal),
  }))

  return {
    guias,
    total: resultado.total,

    pagina,
    limite,

    totalPaginas: Math.ceil(resultado.total / limite),
  }
}

export async function obtenerGuiasEspacioAlquiladoService() {
  const guias = await obtenerGuiasEspacioAlquilado()

  return guias.map(
    (
      guia: Awaited<ReturnType<typeof obtenerGuiasEspacioAlquilado>>[number]
    ) => ({
      ...guia,
      contenedor: {
        numeroContenedor: guia.contenedor.numeroContenedor,
      },
    })
  )
}

/**
 * Registra el pago de una guía.
 */
export async function registrarPagoGuiaService(data: RegistrarPagoGuiaInput) {
  // ============================================================
  // 1. VALIDAR DATOS
  // ============================================================

  const datosValidados = registrarPagoGuiaSchema.parse(data)

  // ============================================================
  // 2. BUSCAR GUÍA
  // ============================================================

  const guia = await obtenerGuiaPorId(datosValidados.guiaId)

  if (!guia) {
    throw new Error("La guía no existe")
  }

  // ============================================================
  // 3. VALIDAR QUE TENGA UN MONTO TOTAL
  // ============================================================

  if (guia.montoTotal === null) {
    throw new Error(
      "No se puede registrar el pago porque la guía todavía no tiene un monto total calculado"
    )
  }

  // ============================================================
  // 4. VALIDAR ESTADO DE PAGO
  // ============================================================

  if (guia.estadoPago === "PAGADO") {
    throw new Error("La guía ya se encuentra pagada")
  }

  // ============================================================
  // 5. BUSCAR O CREAR CLIENTE
  // ============================================================

  let clienteId: number | null = null

  if (datosValidados.cliente) {
    const cliente = await obtenerOCrearCliente({
      tipoDocumento: datosValidados.cliente.tipoDocumento,

      numeroDocumento: datosValidados.cliente.numeroDocumento,

      nombreCompleto: datosValidados.cliente.nombreCompleto || null,

      telefono: "",

      observaciones: "",

      activo: true,
    })

    clienteId = cliente.id
  }

  // ============================================================
  // 6. REGISTRAR PAGO Y ASOCIAR CLIENTE
  // ============================================================

  const guiaActualizada = await registrarPagoGuia(guia.id, {
    clienteId,

    estadoPago: "PAGADO",

    metodoPago: datosValidados.metodoPago,

    numeroOperacion: datosValidados.numeroOperacion ?? null,

    fechaPago: datosValidados.fechaPago,

    horaPago: datosValidados.horaPago,
  })

  // ============================================================
  // 7. SERIALIZAR
  // ============================================================

  return serializarGuia(guiaActualizada)
}
/**
 * Anula una guía.
 *
 * No elimina físicamente el registro.
 */
export async function anularGuiaService(id: number) {
  const guia = await obtenerGuiaPorId(id)

  if (!guia) {
    throw new Error("La guía no existe")
  }

  if (guia.estado === "ANULADO") {
    throw new Error("La guía ya se encuentra anulada")
  }

  if (guia.estado === "RETIRADO") {
    throw new Error("Una guía retirada no puede ser anulada")
  }

  return anularGuia(id)
}

type AsignarClienteMasivoParams = {
  guiaIds: number[]
  clienteId: number
}

/**
 * Asigna masivamente un cliente a múltiples
 * guías de tipo ESPACIO_ALQUILADO.
 */
export async function asignarClienteMasivoService({
  guiaIds,
  clienteId,
}: AsignarClienteMasivoParams) {
  // Evitar IDs duplicados
  const idsUnicos = [...new Set(guiaIds)]

  // Validar que existan guías seleccionadas
  if (idsUnicos.length === 0) {
    throw new Error("Debes seleccionar al menos una guía")
  }

  // Validar que el cliente exista
  const cliente = await findClienteById(clienteId)

  if (!cliente) {
    throw new Error("El cliente seleccionado no existe")
  }

  // Obtener únicamente las guías ESPACIO_ALQUILADO
  const guias = await obtenerGuiasEspacioAlquiladoPorIds(idsUnicos)

  // Verificar que todas las guías seleccionadas
  // realmente sean ESPACIO_ALQUILADO
  if (guias.length !== idsUnicos.length) {
    throw new Error(
      "Una o más guías seleccionadas no son de tipo ESPACIO_ALQUILADO o no existen"
    )
  }

  // Verificar si alguna guía ya tiene un cliente
  const guiasConCliente = guias.filter((guia) => guia.clienteId !== null)

  // Realizar la actualización
  const resultado = await asignarClienteAGuiasEspacioAlquilado(
    idsUnicos,
    clienteId
  )

  return {
    cantidadSeleccionada: idsUnicos.length,
    cantidadActualizada: resultado.count,
    guiasConCliente: guiasConCliente.length,
    cliente,
  }
}
