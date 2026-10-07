import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

export async function findOperadores(
  where: Prisma.OperadorWhereInput,
  pagina: number,
  porPagina: number
) {
  return prisma.operador.findMany({
    where,
    skip: (pagina - 1) * porPagina,
    take: porPagina,
    orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
  })
}

export function countOperadores(where: Prisma.OperadorWhereInput) {
  return prisma.operador.count({ where })
}

export function countOperadoresActivos() {
  return prisma.operador.count({ where: { activo: true } })
}

export function createOperador(data: Prisma.OperadorCreateInput) {
  return prisma.operador.create({ data })
}

export function updateOperador(id: string, data: Prisma.OperadorUpdateInput) {
  return prisma.operador.update({ where: { id }, data })
}

export function findOperadorById(id: string) {
  return prisma.operador.findUnique({ where: { id } })
}

export function setOperadorActivo(id: string, activo: boolean) {
  return prisma.operador.update({ where: { id }, data: { activo } })
}
