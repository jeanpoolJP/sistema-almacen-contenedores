// modules\trasegados\services\registrar-pago.service.ts

import { calcularTotales } from "../utils/calcular-totales"
import {
  obtenerEstadoPagoRepository,
  registrarPagoRepository,
  revertirPagoRepository,
} from "../repository/guia-trasegado.repository"
import {
  registrarPagoSchema,
  type RegistrarPagoInput,
} from "../schemas/registrar-pago.schema"
import type { EstadoPagoGuia } from "../types/pago.types"

// ------------------------------------------------------------
// CONSULTAR ESTADO DE PAGO
// ------------------------------------------------------------

/**
 * Devuelve el estado actual de pago de una guía.
 * Se usa para precargar el modal.
 *
 * @throws {Error} Si la guía no existe.
 */
export async function obtenerEstadoPagoService(
  guiaTrasegadoId: number
): Promise<EstadoPagoGuia> {
  const guia = await obtenerEstadoPagoRepository(guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${guiaTrasegadoId}.`)
  }

  return {
    guiaTrasegadoId: guia.id,
    numeroGuia: guia.numeroGuia,
    estadoPago: guia.estadoPago,
    metodoPago: guia.metodoPago,
    numeroOperacion: guia.numeroOperacion,
    fechaPago: guia.fechaPago,
    subtotal: guia.subtotal != null ? Number(guia.subtotal) : null,
    porcentajeIGV:
      guia.porcentajeIGV != null ? Number(guia.porcentajeIGV) : null,
    montoIGV: guia.montoIGV != null ? Number(guia.montoIGV) : null,
    totalPagar: guia.totalPagar != null ? Number(guia.totalPagar) : null,
    tratamientoIGV: guia.tratamientoIGV,
  }
}

// ------------------------------------------------------------
// REGISTRAR PAGO
// ------------------------------------------------------------

/**
 * Registra el pago de una guía de trasegado.
 *
 * Reglas:
 * 1. La guía debe existir.
 * 2. La guía NO puede estar FINALIZADA sin pago previo...
 *    (en realidad sí puede: se permite pagar una guía finalizada).
 *    La única restricción es que la guía exista.
 * 3. El cálculo de totales se hace SIEMPRE en el backend,
 *    ignorando cualquier cálculo que venga del frontend.
 *
 * @throws {Error} Si la guía no existe.
 */
export async function registrarPagoService(input: RegistrarPagoInput) {
  const datos = registrarPagoSchema.parse(input)

  // ------------------ VALIDAR GUÍA ------------------
  const guia = await obtenerEstadoPagoRepository(datos.guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${datos.guiaTrasegadoId}.`)
  }

  // ------------------ CALCULAR TOTALES ------------------
  // El cálculo se hace aquí, nunca confiando en el frontend.
  const totales = calcularTotales({
    montoBase: datos.montoBase,
    tratamientoIGV: datos.tratamientoIGV,
    porcentajeIGV: datos.porcentajeIGV,
  })

  // ------------------ REGISTRAR ------------------
  return registrarPagoRepository({
    guiaTrasegadoId: datos.guiaTrasegadoId,
    subtotal: totales.subtotal,
    porcentajeIGV: totales.porcentajeIGV,
    montoIGV: totales.montoIGV,
    totalPagar: totales.totalPagar,
    tratamientoIGV: datos.tratamientoIGV,
    metodoPago: datos.metodoPago,
    numeroOperacion: datos.numeroOperacion?.trim() || null,
    fechaPago: datos.fechaPago,
    observaciones: datos.observaciones?.trim() || null,
  })
}

// ------------------------------------------------------------
// REVERTIR PAGO
// ------------------------------------------------------------

/**
 * Revierte el pago de una guía, dejándola como PENDIENTE.
 * Los montos calculados se conservan.
 *
 * @throws {Error} Si la guía no existe o ya está pendiente.
 */
export async function revertirPagoService(guiaTrasegadoId: number) {
  const guia = await obtenerEstadoPagoRepository(guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${guiaTrasegadoId}.`)
  }

  if (guia.estadoPago === "PENDIENTE") {
    throw new Error(`La guía "${guia.numeroGuia}" ya está pendiente de pago.`)
  }

  return revertirPagoRepository(guiaTrasegadoId)
}
