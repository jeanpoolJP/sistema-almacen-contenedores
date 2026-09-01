// modules/guias/guia.service.ts

import {
  actualizarGuia,
  anularGuia,
  crearGuia,
  obtenerGuiaPorId,
  obtenerGuiaPorNumero,
  obtenerGuias,
  registrarPagoGuia,
} from "./guia.repository"

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

  let precioPrimerDia: number

  let precioDiaAdicional: number

  if (datosValidados.tipoPrecio === "ESTANDAR") {
    precioPrimerDia = Number(configuracion.precioPrimerDia)

    precioDiaAdicional = Number(configuracion.precioDiaAdicional)
  } else {
    precioPrimerDia = datosValidados.precioPrimerDia!

    precioDiaAdicional = datosValidados.precioDiaAdicional!
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

    porcentajeIGV,

    tratamientoIGV: datosValidados.tratamientoIGV,

    estado: "ALMACENADO",

    observaciones: datosValidados.observaciones ?? null,
  })

  return serializarGuia(guia)
}

/**
 * Registra la salida de un contenedor.
 */
export async function registrarSalidaGuiaService(
  data: RegistrarSalidaGuiaInput
) {
  // ============================================================
  // 1. VALIDAR
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
  // 7. CALCULAR DÍAS
  // ============================================================

  const diasCalculados = calcularDiasAlmacenamiento(
    guia.fechaIngreso,
    guia.horaIngreso,
    datosValidados.fechaSalida,
    datosValidados.horaSalida
  )

  console.log("DÍAS CALCULADOS:", diasCalculados)

  console.log(
    "DÍAS RECIBIDOS DEL FORMULARIO:",
    datosValidados.diasAlmacenamiento
  )

  // ============================================================
  // 8. OBTENER CONFIGURACIÓN DE PRECIOS
  // ============================================================

  const configuracion = await obtenerConfiguracionPrecioService()

  // ============================================================
  // 9. DETERMINAR PRECIOS
  // ============================================================

  let precioPrimerDia: number

  let precioDiaAdicional: number

  if (datosValidados.tipoPrecio === "ESTANDAR") {
    precioPrimerDia = Number(configuracion.precioPrimerDia)

    precioDiaAdicional = Number(configuracion.precioDiaAdicional)
  } else {
    precioPrimerDia = datosValidados.precioPrimerDia

    precioDiaAdicional = datosValidados.precioDiaAdicional
  }

  // ============================================================
  // 10. OBTENER PORCENTAJE IGV
  // ============================================================

  const porcentajeIGV = Number(
    guia.porcentajeIGV ?? configuracion.porcentajeIGV
  )

  // ============================================================
  // 11. OBTENER DÍAS DEFINITIVOS
  // ============================================================

  const diasAlmacenamiento = datosValidados.diasAlmacenamiento

  // ============================================================
  // 12. CALCULAR MONTO
  // ============================================================

  const calculo = calcularMontoGuia({
    diasAlmacenamiento,

    precioPrimerDia,

    precioDiaAdicional,

    tratamientoIGV: datosValidados.tratamientoIGV,

    porcentajeIGV,
  })

  // ============================================================
  // 13. ACTUALIZAR GUÍA
  // ============================================================

  const guiaActualizada = await actualizarGuia(guia.id, {
    empresaTransporteSalidaId: empresaSalida.id,

    vehiculoSalidaId: vehiculoSalida.id,

    conductorSalidaId: conductorSalida.id,

    fechaSalida: datosValidados.fechaSalida,

    horaSalida: datosValidados.horaSalida,

    diasAlmacenamiento,

    tipoPrecio: datosValidados.tipoPrecio,

    precioPrimerDia,

    precioDiaAdicional,

    subtotal: calculo.subtotal,

    porcentajeIGV,

    montoIGV: calculo.montoIGV,

    montoTotal: calculo.montoTotal,

    tratamientoIGV: datosValidados.tratamientoIGV,

    estado: "RETIRADO",
  })

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
