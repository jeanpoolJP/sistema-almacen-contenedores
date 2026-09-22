// modules\trasegados\services\listar-guias-trasegado.service.ts

import {
  listarGuiasTrasegadoSchema,
  type ListarGuiasTrasegadoInput,
} from "../schemas/listar-guias-trasegado.schema"
import { listarGuiasTrasegadoRepository } from "../repository/guia-trasegado.repository"
import type {
  GuiaTrasegadoListItem,
  ListarGuiasTrasegadoResult,
} from "../types/guia-trasegado-listado.types"

/**
 * Lista las guías de trasegado aplicando filtros, paginación
 * y orden. Convierte los Decimal de Prisma a number para
 * que sean serializables al cliente.
 */
export async function listarGuiasTrasegadoService(
  input: Partial<ListarGuiasTrasegadoInput>
): Promise<ListarGuiasTrasegadoResult> {
  const filtros = listarGuiasTrasegadoSchema.parse({
    ...input,
    // Normalizamos los strings de filtros a mayúsculas
    numeroGuia: input.numeroGuia?.toUpperCase() ?? "",
    numeroContenedor: input.numeroContenedor?.toUpperCase() ?? "",
  })

  const { items, total } = await listarGuiasTrasegadoRepository(filtros)

  const mapped: GuiaTrasegadoListItem[] = items.map((g) => ({
    id: g.id,
    numeroGuia: g.numeroGuia,
    descripcionServicio: g.descripcionServicio,
    fechaIngreso: g.fechaIngreso,
    estado: g.estado,
    estadoPago: g.estadoPago,
    totalPagar: g.totalPagar != null ? Number(g.totalPagar) : null,
    cliente: g.cliente,
    totalElementos: g.ingresos.reduce(
      (total, ingreso) => total + ingreso._count.elementos,
      0
    ),
    totalSalidas: g._count.salidas,
  }))

  return {
    items: mapped,
    total,
    page: filtros.page,
    pageSize: filtros.pageSize,
    totalPages: Math.max(1, Math.ceil(total / filtros.pageSize)),
  }
}
