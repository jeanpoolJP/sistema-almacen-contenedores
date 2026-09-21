// modules\trasegados\services\finalizar-guia.service.ts

import { prisma } from "@/lib/prisma"

import {
  cambiarEstadoGuiaRepository,
  listarElementosPendientesParaFinalizarRepository,
  obtenerResumenGuiaRepository,
} from "../repository/guia-trasegado.repository"
import {
  cambiarEstadoGuiaSchema,
  type CambiarEstadoGuiaInput,
} from "../schemas/finalizar-guia.schema"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

// ------------------------------------------------------------
// ERROR CUSTOM PARA PENDIENTES
// ------------------------------------------------------------

/**
 * Error específico que el action puede detectar y convertir
 * en un resultado con la lista de pendientes para la UI.
 */
export class GuiaTienePendientesError extends Error {
  pendientes: ElementoPendienteSalida[]

  constructor(pendientes: ElementoPendienteSalida[]) {
    super("La guía tiene elementos pendientes de retiro.")
    this.name = "GuiaTienePendientesError"
    this.pendientes = pendientes
  }
}

// ------------------------------------------------------------
// SERVICIO
// ------------------------------------------------------------

/**
 * Cambia el estado de una guía de trasegado entre EN_PROCESO y FINALIZADO.
 *
 * Reglas:
 * 1. La guía debe existir.
 * 2. Para finalizar:
 *    - No debe haber elementos identificables sin salida.
 *    - No debe haber mercadería sin marcar como completada.
 * 3. Para reactivar:
 *    - No hay validaciones adicionales.
 */
export async function cambiarEstadoGuiaService(input: CambiarEstadoGuiaInput) {
  const datos = cambiarEstadoGuiaSchema.parse(input)

  // ------------------ VALIDAR GUÍA ------------------
  const guia = await obtenerResumenGuiaRepository(datos.guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${datos.guiaTrasegadoId}.`)
  }

  // ------------------ FINALIZAR ------------------
  if (datos.finalizar) {
    if (guia.estado === "FINALIZADO") {
      throw new Error(`La guía "${guia.numeroGuia}" ya está finalizada.`)
    }

    const pendientes = await listarElementosPendientesParaFinalizarRepository(
      datos.guiaTrasegadoId
    )

    if (pendientes.length > 0) {
      // Mapeamos a un formato usable por la UI
      const pendientesUI: ElementoPendienteSalida[] = pendientes.map((el) => ({
        id: el.id,
        tipo: el.tipo,
        numero: el.numero,
        descripcion: el.descripcion,
        observaciones: el.observaciones,
        contenedor: el.contenedor
          ? {
              id: el.contenedor.id,
              numeroContenedor: el.contenedor.numeroContenedor,
              marca: el.contenedor.marca,
              medida: el.contenedor.medida,
              tipo: el.contenedor.tipo,
            }
          : null,
        flatRack: el.flatRack
          ? {
              id: el.flatRack.id,
              numero: el.flatRack.numero,
              marca: el.flatRack.marca,
            }
          : null,
      }))

      throw new GuiaTienePendientesError(pendientesUI)
    }

    return cambiarEstadoGuiaRepository(
      datos.guiaTrasegadoId,
      "FINALIZADO",
      datos.observaciones?.trim() || null
    )
  }

  // ------------------ REACTIVAR ------------------
  if (guia.estado === "EN_PROCESO") {
    throw new Error(`La guía "${guia.numeroGuia}" ya está en proceso.`)
  }

  return cambiarEstadoGuiaRepository(
    datos.guiaTrasegadoId,
    "EN_PROCESO",
    datos.observaciones?.trim() || null
  )
}

// ------------------------------------------------------------
// CONSULTA DE PENDIENTES
// ------------------------------------------------------------

/**
 * Devuelve los elementos que impiden finalizar la guía.
 * Se usa para mostrar la lista antes de intentar finalizar
 * (por ejemplo, al abrir el modal de confirmación).
 */
export async function listarPendientesFinalizarService(
  guiaTrasegadoId: number
): Promise<ElementoPendienteSalida[]> {
  const guia = await obtenerResumenGuiaRepository(guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${guiaTrasegadoId}.`)
  }

  const pendientes =
    await listarElementosPendientesParaFinalizarRepository(guiaTrasegadoId)

  return pendientes.map((el) => ({
    id: el.id,
    tipo: el.tipo,
    numero: el.numero,
    descripcion: el.descripcion,
    observaciones: el.observaciones,
    contenedor: el.contenedor
      ? {
          id: el.contenedor.id,
          numeroContenedor: el.contenedor.numeroContenedor,
          marca: el.contenedor.marca,
          medida: el.contenedor.medida,
          tipo: el.contenedor.tipo,
        }
      : null,
    flatRack: el.flatRack
      ? {
          id: el.flatRack.id,
          numero: el.flatRack.numero,
          marca: el.flatRack.marca,
        }
      : null,
  }))
}
