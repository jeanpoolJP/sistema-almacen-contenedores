// modules\trasegados\services\asignar-cliente.service.ts

import { prisma } from "@/lib/prisma"

import { asignarClienteSchema } from "../schemas/asignar-cliente.schema"
import type { AsignarClienteInput } from "../schemas/asignar-cliente.schema"

/**
 * Asigna un cliente a una guía de trasegado.
 *
 * Reglas:
 * - Si viene `clienteId`, se valida que exista y esté activo y se asigna.
 * - Si NO viene `clienteId`, se busca por `numeroDocumento`:
 *   - Si existe y está activo → se asigna.
 *   - Si existe pero está inactivo → se reactiva y se asigna.
 *   - Si no existe → se crea con los datos enviados y se asigna.
 *
 * Toda la operación corre en una transacción para evitar dejar
 * la guía sin cliente si algo falla al crear/actualizar el cliente.
 *
 * @throws {Error} Si la guía no existe.
 */
export async function asignarClienteService(input: AsignarClienteInput) {
  const datos = asignarClienteSchema.parse(input)

  const numeroDocumento = datos.numeroDocumento.trim()

  return prisma.$transaction(async (tx) => {
    // 1. Verificar que la guía exista
    const guia = await tx.guiaTrasegado.findUnique({
      where: { id: datos.guiaTrasegadoId },
      select: { id: true },
    })

    if (!guia) {
      throw new Error(
        `No se encontró la guía de trasegado con ID ${datos.guiaTrasegadoId}.`
      )
    }

    // 2. Resolver el cliente
    let clienteId: number

    if (datos.clienteId) {
      // Caso A: la UI ya encontró un cliente existente
      const cliente = await tx.cliente.findUnique({
        where: { id: datos.clienteId },
        select: { id: true, activo: true },
      })

      if (!cliente) {
        throw new Error("El cliente seleccionado ya no existe.")
      }

      // Si estaba inactivo, lo reactivamos
      if (!cliente.activo) {
        await tx.cliente.update({
          where: { id: cliente.id },
          data: { activo: true },
        })
      }

      clienteId = cliente.id
    } else {
      // Caso B: buscar por documento
      const existente = await tx.cliente.findUnique({
        where: { numeroDocumento },
        select: { id: true, activo: true },
      })

      if (existente) {
        if (!existente.activo) {
          await tx.cliente.update({
            where: { id: existente.id },
            data: { activo: true },
          })
        }
        clienteId = existente.id
      } else {
        // Caso C: crear cliente nuevo
        const nuevo = await tx.cliente.create({
          data: {
            tipoDocumento: datos.tipoDocumento,
            numeroDocumento,
            nombreCompleto: datos.nombreCompleto?.trim() || null,
            telefono: datos.telefono?.trim() || null,
            observaciones: datos.observaciones?.trim() || null,
            activo: true,
          },
          select: { id: true },
        })
        clienteId = nuevo.id
      }
    }

    // 3. Asignar el cliente a la guía
    const guiaActualizada = await tx.guiaTrasegado.update({
      where: { id: datos.guiaTrasegadoId },
      data: { clienteId },
      include: { cliente: true },
    })

    return guiaActualizada
  })
}
