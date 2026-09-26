// modules\liquidaciones\liquidacion.repository.ts

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/lib/generated/prisma"

export const liquidacionRepository = {
  findMany(params: Prisma.LiquidacionFindManyArgs) {
    return prisma.liquidacion.findMany({
      ...params,
      include: {
        cliente: {
          select: { id: true, nombreCompleto: true, numeroDocumento: true },
        },
        ...(params.include ?? {}),
      },
    })
  },

  count(where: Prisma.LiquidacionWhereInput) {
    return prisma.liquidacion.count({ where })
  },

  findById(id: number) {
    return prisma.liquidacion.findUnique({
      where: { id },
      include: {
        cliente: true,
        detalles: {
          include: { guia: true },
          orderBy: { fechaSalida: "asc" },
        },
      },
    })
  },

  create(data: Prisma.LiquidacionCreateInput) {
    return prisma.liquidacion.create({ data })
  },

  update(id: number, data: Prisma.LiquidacionUpdateInput) {
    return prisma.liquidacion.update({ where: { id }, data })
  },

  delete(id: number) {
    return prisma.liquidacion.delete({ where: { id } })
  },

  /**
   * Devuelve las guías retiradas, pendientes de pago, del cliente,
   * que NO estén incluidas en otra liquidación.
   * Ordenadas por fechaSalida ASC.
   */
  findGuiasDisponibles(clienteId: number) {
    return prisma.guiaInternamiento.findMany({
      where: {
        clienteId,
        estado: "RETIRADO",
        estadoPago: "PENDIENTE",
        liquidacionDetalle: { is: null },
      },
      include: {
        contenedor: true,
      },
      orderBy: [{ fechaSalida: "asc" }, { id: "asc" }],
    })
  },

  findGuiasByIds(ids: number[]) {
    return prisma.guiaInternamiento.findMany({
      where: { id: { in: ids } },
      include: { contenedor: true },
      orderBy: [{ fechaSalida: "asc" }, { id: "asc" }],
    })
  },

  generateNumero(): Promise<string> {
    return prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear()
      const count = await tx.liquidacion.count({
        where: { numero: { startsWith: `LIQ-${year}-` } },
      })
      return `LIQ-${year}-${String(count + 1).padStart(6, "0")}`
    })
  },
}
