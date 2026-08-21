// modules\conductores\conductores.repository.ts

import { prisma } from "@/lib/prisma";

import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Busca un conductor mediante su número de licencia.
 *
 * Se utilizará principalmente al momento
 * de registrar una guía.
 */
export async function findConductorByLicencia(
  numeroLicencia: string,
) {
  return prisma.conductor.findUnique({
    where: {
      numeroLicencia,
    },
  });
}

/**
 * Busca un conductor mediante su ID.
 */
export async function findConductorById(
  id: number,
) {
  return prisma.conductor.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Obtiene todos los conductores.
 *
 * Los más recientemente registrados
 * aparecen primero.
 */
export async function findConductores() {
  return prisma.conductor.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Crea un nuevo conductor.
 */
export async function createConductor(
  data: Prisma.ConductorCreateInput,
) {
  return prisma.conductor.create({
    data,
  });
}

/**
 * Actualiza los datos de un conductor.
 */
export async function updateConductor(
  id: number,
  data: Prisma.ConductorUpdateInput,
) {
  return prisma.conductor.update({
    where: {
      id,
    },
    data,
  });
}

/**
 * Elimina físicamente un conductor.
 *
 * NOTA:
 * No debería eliminarse un conductor que ya tenga
 * guías relacionadas debido a las relaciones existentes.
 */
export async function deleteConductor(
  id: number,
) {
  return prisma.conductor.delete({
    where: {
      id,
    },
  });
}