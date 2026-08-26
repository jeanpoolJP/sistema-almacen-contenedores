// modules\vehiculos\vehiculos.repository.ts

import { prisma } from "@/lib/prisma";

import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Busca un vehículo por su placa.
 *
 * Se utilizará principalmente al momento
 * de registrar una guía.
 */
export async function findVehiculoByPlaca(
  placa: string,
) {
  return prisma.vehiculo.findUnique({
    where: {
      placa,
    },
  });
}

/**
 * Busca un vehículo por su ID.
 */
export async function findVehiculoById(
  id: number,
) {
  return prisma.vehiculo.findUnique({
    where: {
      id,
    },
  });
}

/**
 * Obtiene los vehículos paginados.
 *
 * Los más recientemente registrados
 * aparecen primero.
 */
export async function findVehiculos(
  page: number = 1,
  pageSize: number = 10,
) {
  const skip = (page - 1) * pageSize;

  return prisma.vehiculo.findMany({
    skip,
    take: pageSize,

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Cuenta todos los vehículos registrados.
 */
export async function countVehiculos() {
  return prisma.vehiculo.count();
}

/**
 * Crea un nuevo vehículo.
 */
export async function createVehiculo(
  data: Prisma.VehiculoCreateInput,
) {
  return prisma.vehiculo.create({
    data,
  });
}

/**
 * Actualiza un vehículo existente.
 */
export async function updateVehiculo(
  id: number,
  data: Prisma.VehiculoUpdateInput,
) {
  return prisma.vehiculo.update({
    where: {
      id,
    },
    data,
  });
}

/**
 * Elimina un vehículo.
 *
 * Por ahora no utilizamos desactivación porque
 * el modelo Vehiculo no tiene un campo "activo".
 */
export async function deleteVehiculo(
  id: number,
) {
  return prisma.vehiculo.delete({
    where: {
      id,
    },
  });
}