// modules\trasegados\services\registrar-pago.service.ts

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
    numeroCotizacion: guia.numeroCotizacion,
    estadoPago: guia.estadoPago,
    metodoPago: guia.metodoPago,
    numeroOperacion: guia.numeroOperacion,
    fechaPago: guia.fechaPago,
    totalPagar: guia.totalPagar != null ? Number(guia.totalPagar) : null,
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
 * 3. La cotización debe estar asignada antes de registrar el pago.
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

  if (!guia.numeroCotizacion || guia.totalPagar == null) {
    throw new Error(
      "Asigna una cotización y su monto antes de registrar el pago."
    )
  }

  // ------------------ REGISTRAR ------------------
  return registrarPagoRepository({
    guiaTrasegadoId: datos.guiaTrasegadoId,
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
