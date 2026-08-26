// modules/guias/guia.service.ts

import {
  actualizarGuia,
  anularGuia,
  crearGuia,
  obtenerGuiaPorId,
  obtenerGuiaPorNumero,
  obtenerGuias,
} from "./guia.repository"

import { crearGuiaSchema, registrarSalidaGuiaSchema } from "./guia.schema"

import type { CrearGuiaInput, RegistrarSalidaGuiaInput } from "./guia.types"

import { calcularDiasAlmacenamiento } from "./utils/calcular-almacenamiento"

import { calcularMontoGuia } from "./utils/calcular-monto"

import { obtenerConfiguracionPrecioService } from "@/modules/configuracion/configuracion.service"

import { obtenerOCrearCliente } from "@/modules/clientes/cliente.service"

import { obtenerOCrearContenedor } from "@/modules/contenedores/contenedores.service"

import { obtenerOCrearEmpresaTransporte } from "@/modules/empresas-transporte/empresa-transporte.service"

import { obtenerOCrearVehiculo } from "@/modules/vehiculos/vehiculos.service"

import { obtenerOCrearConductor } from "@/modules/conductores/conductores.service"

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

  // ============================================================
  // 2. VERIFICAR NÚMERO DE GUÍA
  // ============================================================

  const guiaExistente = await obtenerGuiaPorNumero(datosValidados.numeroGuia)

  if (guiaExistente) {
    throw new Error(
      `Ya existe una guía con el número ${datosValidados.numeroGuia}`
    )
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

  return crearGuia({
    numeroGuia: datosValidados.numeroGuia,

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

  console.log("========== CÁLCULO ALMACENAMIENTO ==========")

  console.log("Fecha ingreso:", guia.fechaIngreso)
  console.log("Hora ingreso:", guia.horaIngreso)

  console.log("Fecha salida:", datosValidados.fechaSalida)

  console.log("Hora salida:", datosValidados.horaSalida)

  console.log("Fecha ingreso ISO:", guia.fechaIngreso.toISOString())

  console.log("Hora ingreso ISO:", guia.horaIngreso.toISOString())

  console.log("Fecha salida ISO:", datosValidados.fechaSalida.toISOString())

  console.log("Hora salida ISO:", datosValidados.horaSalida.toISOString())

  const diasAlmacenamiento = calcularDiasAlmacenamiento(
    guia.fechaIngreso,
    guia.horaIngreso,
    datosValidados.fechaSalida,
    datosValidados.horaSalida
  )

  console.log("DÍAS CALCULADOS:", diasAlmacenamiento)

  console.log("==============================================")

  // ============================================================
  // 8. OBTENER PRECIOS GUARDADOS EN LA GUÍA
  // ============================================================

  const precioPrimerDia = Number(guia.precioPrimerDia)

  const precioDiaAdicional = Number(guia.precioDiaAdicional)

  // ============================================================
  // 9. OBTENER PORCENTAJE IGV
  // ============================================================

  const configuracion = await obtenerConfiguracionPrecioService()

  const porcentajeIGV = Number(
    guia.porcentajeIGV ?? configuracion.porcentajeIGV
  )

  // ============================================================
  // 10. CALCULAR MONTO
  // ============================================================

  const calculo = calcularMontoGuia({
    diasAlmacenamiento,

    precioPrimerDia,

    precioDiaAdicional,

    tratamientoIGV: datosValidados.tratamientoIGV,

    porcentajeIGV,
  })

  // ============================================================
  // 11. ACTUALIZAR GUÍA
  // ============================================================

  return actualizarGuia(guia.id, {
    empresaTransporteSalidaId: empresaSalida.id,

    vehiculoSalidaId: vehiculoSalida.id,

    conductorSalidaId: conductorSalida.id,

    fechaSalida: datosValidados.fechaSalida,

    horaSalida: datosValidados.horaSalida,

    diasAlmacenamiento,

    subtotal: calculo.subtotal,

    porcentajeIGV,

    montoIGV: calculo.montoIGV,

    montoTotal: calculo.montoTotal,

    tratamientoIGV: datosValidados.tratamientoIGV,

    estado: "RETIRADO",
  })
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
 * Obtiene todas las guías.
 */
export async function obtenerGuiasService() {
  const guias = await obtenerGuias()

  return guias.map((guia) => ({
    ...guia,
    precioPrimerDia: Number(guia.precioPrimerDia),
    precioDiaAdicional: Number(guia.precioDiaAdicional),
    subtotal: guia.subtotal === null ? null : Number(guia.subtotal),
    porcentajeIGV:
      guia.porcentajeIGV === null ? null : Number(guia.porcentajeIGV),
    montoIGV: guia.montoIGV === null ? null : Number(guia.montoIGV),
    montoTotal: guia.montoTotal === null ? null : Number(guia.montoTotal),
  }))
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
