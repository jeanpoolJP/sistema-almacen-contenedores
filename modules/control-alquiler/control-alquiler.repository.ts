// modules/control-alquiler/control-alquiler.repository.ts
import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

const guiaAlquilerInclude = {
  cliente: {
    select: { id: true, nombreCompleto: true, numeroDocumento: true },
  },
  equipo: {
    select: { id: true, codigo: true, nombre: true, tipo: true },
  },
  operador: {
    select: { id: true, nombres: true, apellidos: true },
  },
} satisfies Prisma.GuiaAlquilerInclude

export async function findGuiasAlquiler(
  where: Prisma.GuiaAlquilerWhereInput,
  skip: number,
  take: number
) {
  return prisma.guiaAlquiler.findMany({
    where,
    include: guiaAlquilerInclude,
    orderBy: [{ fechaInicio: "desc" }, { createdAt: "desc" }],
    skip,
    take,
  })
}

export async function countGuiasAlquiler(where: Prisma.GuiaAlquilerWhereInput) {
  return prisma.guiaAlquiler.count({ where })
}

export async function findGuiaAlquilerById(id: string) {
  return prisma.guiaAlquiler.findUnique({
    where: { id },
    include: guiaAlquilerInclude,
  })
}

export async function findGuiaAlquilerByNumero(numeroGuia: string) {
  return prisma.guiaAlquiler.findUnique({ where: { numeroGuia } })
}

export async function createGuiaAlquiler(
  data: Prisma.GuiaAlquilerUncheckedCreateInput
) {
  return prisma.guiaAlquiler.create({
    data,
    include: guiaAlquilerInclude,
  })
}

export async function updateGuiaAlquiler(
  id: string,
  data: Prisma.GuiaAlquilerUncheckedUpdateInput
) {
  return prisma.guiaAlquiler.update({
    where: { id },
    data,
    include: guiaAlquilerInclude,
  })
}

// ============================================================
// ACTUALIZACIONES PARCIALES (asignaciones)
// ============================================================

export async function asignarClienteGuiaAlquiler(
  id: string,
  clienteId: number
) {
  return prisma.guiaAlquiler.update({
    where: { id },
    data: { clienteId },
    include: guiaAlquilerInclude,
  })
}

export async function asignarCotizacionGuiaAlquiler(
  id: string,
  data: {
    numeroCotizacion: string
    subtotal: Prisma.Decimal
    igv: Prisma.Decimal
    total: Prisma.Decimal
    modoIGVCotizacion: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO"
  }
) {
  return prisma.guiaAlquiler.update({
    where: { id },
    data,
    include: guiaAlquilerInclude,
  })
}

export async function asignarPagoGuiaAlquiler(
  id: string,
  data: {
    metodoPago: Prisma.GuiaAlquilerUncheckedUpdateInput["metodoPago"]
    numeroOperacion: string | null
    fechaPago: Date
    horaPago: Date
    estadoPago: "PAGADO"
  }
) {
  return prisma.guiaAlquiler.update({
    where: { id },
    data,
    include: guiaAlquilerInclude,
  })
}

// ============================================================
// HELPERS PARA ASIGNAR CLIENTE NUEVO
// ============================================================

export async function findClienteByDocumento(numeroDocumento: string) {
  return prisma.cliente.findUnique({ where: { numeroDocumento } })
}

export async function createCliente(data: Prisma.ClienteUncheckedCreateInput) {
  return prisma.cliente.create({ data })
}
