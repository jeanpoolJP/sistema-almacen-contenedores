// modules\trasegados\services\marcar-mercaderia-completada.service.ts

import { prisma } from "@/lib/prisma"

import { marcarMercaderiaCompletadaRepository } from "../repository/guia-trasegado.repository"

/**
 * Marca o desmarca la mercadería de un elemento como completada.
 *
 * Reglas:
 * - Solo aplica a elementos tipo MERCADERIA / OTRO.
 * - Si el elemento no existe, lanza error.
 * - Si el elemento no es de tipo mercadería, lanza error.
 *
 * @throws {Error} Si el elemento no existe o no es mercadería.
 */
export async function marcarMercaderiaCompletadaService(
  elementoId: number,
  completada: boolean
) {
  const elemento = await prisma.guiaTrasegadoElemento.findUnique({
    where: { id: elementoId },
    select: { id: true, tipo: true },
  })

  if (!elemento) {
    throw new Error(`No se encontró el elemento con ID ${elementoId}.`)
  }

  if (elemento.tipo !== "MERCADERIA" && elemento.tipo !== "OTRO") {
    throw new Error(
      `El elemento "${elemento.tipo}" no admite el flag de mercadería completada.`
    )
  }

  return marcarMercaderiaCompletadaRepository(elementoId, completada)
}
