// modules/inventario/inventario.service.ts

import {
  EstadoInventario,
  ResultadoInventario,
} from "@/lib/generated/prisma/client"

import {
  obtenerInventarios,
  obtenerInventarioPorId,
  obtenerGuiasAlmacenadas,
  crearInventario as crearInventarioRepository,
  actualizarResultadoDetalle,
  finalizarInventario as finalizarInventarioRepository,
  obtenerEstadisticasInventario,
} from "./inventario.repository"

/**
 * Obtiene los inventarios registrados con paginacion.
 */
export async function listarInventarios(page: number = 1, limit: number = 10) {
  return obtenerInventarios(page, limit)
}

/**
 * Obtiene un inventario específico.
 */
export async function obtenerInventario(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del inventario no es válido.")
  }

  const inventario = await obtenerInventarioPorId(id)

  if (!inventario) {
    throw new Error("El inventario no existe.")
  }

  return inventario
}

/**
 * Obtiene las guías que actualmente se encuentran almacenadas
 * y que pueden formar parte de un nuevo inventario.
 */
export async function obtenerGuiasDisponibles() {
  return obtenerGuiasAlmacenadas()
}

/**
 * Crea un nuevo inventario tomando como referencia las guías
 * que actualmente aparecen como ALMACENADO.
 */
export async function crearInventario(fecha: Date, observaciones?: string) {
  // 1. Obtener las guías que actualmente están almacenadas.
  const guias = await obtenerGuiasAlmacenadas()

  // 2. No tiene sentido crear un inventario vacío.
  if (guias.length === 0) {
    throw new Error(
      "No existen contenedores almacenados para realizar el inventario."
    )
  }

  // 3. Extraer los IDs de las guías.
  const guiaIds = guias.map((guia) => guia.id)

  // 4. Crear el inventario y sus detalles.
  return crearInventarioRepository(fecha, guiaIds, observaciones)
}

/**
 * Actualiza el resultado de la verificación física
 * de un contenedor.
 */
export async function verificarDetalle(
  inventarioId: number,
  detalleId: number,
  resultado: ResultadoInventario,
  observaciones?: string
) {
  // 1. Validar IDs.
  if (
    !Number.isInteger(inventarioId) ||
    inventarioId <= 0 ||
    !Number.isInteger(detalleId) ||
    detalleId <= 0
  ) {
    throw new Error("Los identificadores proporcionados no son válidos.")
  }

  // 2. Obtener el inventario.
  const inventario = await obtenerInventarioPorId(inventarioId)

  if (!inventario) {
    throw new Error("El inventario no existe.")
  }

  // 3. No permitir modificaciones después de finalizar.
  if (inventario.estado === EstadoInventario.FINALIZADO) {
    throw new Error(
      "No se puede modificar un inventario que ya fue finalizado."
    )
  }

  // 4. Verificar que el detalle pertenece al inventario.
  const detalle = inventario.detalles.find(
    (detalle) => detalle.id === detalleId
  )

  if (!detalle) {
    throw new Error("El detalle no pertenece al inventario indicado.")
  }

  // 5. Validar el resultado.
  if (!Object.values(ResultadoInventario).includes(resultado)) {
    throw new Error("El resultado de inventario no es válido.")
  }

  // 6. Actualizar resultado.
  return actualizarResultadoDetalle(detalleId, resultado, observaciones)
}

/**
 * Finaliza un inventario.
 *
 * Regla de negocio:
 * No se puede finalizar mientras existan detalles pendientes.
 */
export async function finalizarInventario(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del inventario no es válido.")
  }

  // 1. Obtener inventario.
  const inventario = await obtenerInventarioPorId(id)

  if (!inventario) {
    throw new Error("El inventario no existe.")
  }

  // 2. Evitar finalizar nuevamente.
  if (inventario.estado === EstadoInventario.FINALIZADO) {
    throw new Error("El inventario ya se encuentra finalizado.")
  }

  // 3. Verificar pendientes.
  const pendientes = inventario.detalles.filter(
    (detalle) => detalle.resultado === ResultadoInventario.PENDIENTE
  )

  if (pendientes.length > 0) {
    throw new Error(
      `No se puede finalizar el inventario. Hay ${pendientes.length} contenedor(es) pendiente(s) de verificar.`
    )
  }

  // 4. Finalizar.
  return finalizarInventarioRepository(id)
}

/**
 * Obtiene las estadísticas de un inventario.
 */
export async function obtenerEstadisticas(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del inventario no es válido.")
  }

  const inventario = await obtenerInventarioPorId(id)

  if (!inventario) {
    throw new Error("El inventario no existe.")
  }

  return obtenerEstadisticasInventario(id)
}
