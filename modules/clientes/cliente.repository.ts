// modules/clientes/cliente.repository.ts

import { prisma } from "@/lib/prisma";

import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Busca un cliente por su documento.
 *
 * El documento puede ser DNI o RUC.
 */
export async function findClienteByDocumento(
  numeroDocumento: string,
) {
  return prisma.cliente.findUnique({
    where: {
      numeroDocumento,
    },
  });
}

/**
 * Busca un cliente por su ID.
 */
export async function findClienteById(id: number) {
  return prisma.cliente.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Obtiene todos los clientes.
 *
 * Los más recientes aparecen primero.
 */
export async function findClientes() {
  return prisma.cliente.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Crea un nuevo cliente.
 */
export async function createCliente(
  data: Prisma.ClienteCreateInput,
) {
  return prisma.cliente.create({
    data,
  });
}

/**
 * Actualiza un cliente existente.
 */
export async function updateCliente(
  id: number,
  data: Prisma.ClienteUpdateInput,
) {
  return prisma.cliente.update({
    where: {
      id,
    },
    data,
  });
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
  });
}