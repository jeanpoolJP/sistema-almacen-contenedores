// modules\contenedores\contenedores.repository.ts

import { prisma } from "@/lib/prisma";

import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Busca un contenedor por su número.
 *
 * Se utiliza principalmente al momento
 * de registrar una guía.
 */
export async function findContenedorByNumero(
  numeroContenedor: string,
) {
  return prisma.contenedor.findUnique({
    where: {
      numeroContenedor,
    },
  });
}

/**
 * Busca un contenedor por su ID.
 */
export async function findContenedorById(
  id: number,
) {
  return prisma.contenedor.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Obtiene una página de contenedores.
 *
 * Los más recientemente registrados
 * aparecen primero.
 */
export async function findContenedores(
  page: number = 1,
  pageSize: number = 10,
) {
  const skip = (page - 1) * pageSize;

  return prisma.contenedor.findMany({
    skip,
    take: pageSize,

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Obtiene la cantidad total de contenedores.
 *
 * Se utiliza para calcular la cantidad
 * de páginas disponibles.
 */
export async function countContenedores() {
  return prisma.contenedor.count();
}

/**
 * Crea un nuevo contenedor.
 */
export async function createContenedor(
  data: Prisma.ContenedorCreateInput,
) {
  return prisma.contenedor.create({
    data,
  });
}

/**
 * Actualiza un contenedor existente.
 */
export async function updateContenedor(
  id: number,
  data: Prisma.ContenedorUpdateInput,
) {
  return prisma.contenedor.update({
    where: {
      id,
    },
    data,
  });
}

/**
 * Elimina un contenedor.
 *
 * No se recomienda eliminar físicamente un contenedor
 * que ya tenga guías relacionadas.
 */
export async function deleteContenedor(
  id: number,
) {
  return prisma.contenedor.delete({
    where: {
      id,
    },
  });
}