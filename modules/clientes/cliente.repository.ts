import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export async function findClienteByDni(dni: string) {
  return prisma.cliente.findUnique({
    where: {
      dni,
    },
  });
}

export async function findClienteById(id: number) {
  return prisma.cliente.findUnique({
    where: {
      id,
    },
  });
}

export async function findClientes() {
  return prisma.cliente.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createCliente(data: Prisma.ClienteCreateInput) {
  return prisma.cliente.create({
    data,
  });
}

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