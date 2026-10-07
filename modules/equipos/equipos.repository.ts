import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export function findEquipos(
  where: Prisma.EquipoWhereInput,
  pagina: number,
  porPagina: number
) {
  return prisma.equipo.findMany({
    where,
    skip: (pagina - 1) * porPagina,
    take: porPagina,
    orderBy: [{ nombre: "asc" }, { codigo: "asc" }],
  })
}

export function countEquipos(where: Prisma.EquipoWhereInput) {
  return prisma.equipo.count({ where })
}

export function findEquipoById(id: string) {
  return prisma.equipo.findUnique({ where: { id } })
}

export function createEquipo(data: Prisma.EquipoCreateInput) {
  return prisma.equipo.create({ data })
}

export function updateEquipo(id: string, data: Prisma.EquipoUpdateInput) {
  return prisma.equipo.update({ where: { id }, data })
}

export function updateEstadoEquipo(
  id: string,
  estado: Prisma.EquipoUpdateInput["estado"]
) {
  return prisma.equipo.update({ where: { id }, data: { estado } })
}
