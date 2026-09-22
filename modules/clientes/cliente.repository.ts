// modules/clientes/cliente.repository.ts

import { prisma } from "@/lib/prisma"

import type { Prisma } from "@/lib/generated/prisma/client"
import { af } from "date-fns/locale"

/**
 * Busca un cliente por su documento.
 *
 * El documento puede ser DNI o RUC.
 */
export async function findClienteByDocumento(numeroDocumento: string) {
  return prisma.cliente.findUnique({
    where: {
      numeroDocumento,
    },
  })
}

/**
 * Busca un cliente por su ID.
 */
export async function findClienteById(id: number) {
  return prisma.cliente.findUnique({
    where: {
      id,
    },
  })
}

/**
 * Obtiene una página de clientes.
 *
 * Los más recientes aparecen primero.
 */
export async function findClientes(page: number = 1, pageSize: number = 10) {
  const skip = (page - 1) * pageSize

  return prisma.cliente.findMany({
    skip,
    take: pageSize,

    orderBy: {
      createdAt: "desc",
    },
  })
}

/**
 * Obtiene la cantidad total de clientes.
 *
 * Se utiliza para calcular la cantidad
 * de páginas disponibles.
 */
export async function countClientes() {
  return prisma.cliente.count()
}

/**
 * Crea un nuevo cliente.
 */
export async function createCliente(data: Prisma.ClienteCreateInput) {
  return prisma.cliente.create({
    data,
  })
}

/**
 * Actualiza un cliente existente.
 */
export async function updateCliente(
  id: number,
  data: Prisma.ClienteUpdateInput
) {
  return prisma.cliente.update({
    where: {
      id,
    },
    data,
  })
}

/**
 * Desactiva un cliente.
 *
 * No se elimina físicamente de la base de datos.
 */
export async function deactivateCliente(id: number) {
  return prisma.cliente.update({
    where: {
      id,
    },
    data: {
      activo: false,
    },
  })
}

/*
 * Buscar los 10 clientes con mas guias asociadas
 */
export async function findClientesFrecuentes(limit: number = 10) {
  return prisma.cliente.findMany({
    where: {
      activo: true,

      guiasInternamiento: {
        some: {},
      },
    },

    take: limit,

    orderBy: [
      {
        guiasInternamiento: {
          _count: "desc",
        },
      },
      {
        nombreCompleto: "asc",
      },
    ],

    select: {
      id: true,
      tipoDocumento: true,
      numeroDocumento: true,
      nombreCompleto: true,

      _count: {
        select: {
          guiasInternamiento: true,
        },
      },
    },
  })
}

/**
 * Crea un cliente dentro de una transacción existente.
 *
 * Esta función no inicia ni confirma la transacción.
 * La transacción es responsabilidad del servicio
 * que coordina la operación.
 */
export async function createClienteTx(
  tx: Prisma.TransactionClient,
  data: Prisma.ClienteCreateInput
) {
  return tx.cliente.create({
    data,
  })
}

/**
 * Busca un cliente por documento dentro
 * de una transacción existente.
 */
export async function findClienteByDocumentoTx(
  tx: Prisma.TransactionClient,
  numeroDocumento: string
) {
  return tx.cliente.findUnique({
    where: {
      numeroDocumento,
    },
  })
}

/**
 * Busca un cliente por ID dentro
 * de una transacción existente.
 */
export async function findClienteByIdTx(
  tx: Prisma.TransactionClient,
  id: number
) {
  return tx.cliente.findUnique({
    where: {
      id,
    },
  })
}

