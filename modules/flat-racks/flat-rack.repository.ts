// modules\flat-racks\flat-rack.repository.ts

import { prisma } from "@/lib/prisma"
import type {
  FlatRackListInput,
  CreateFlatRackInput,
  UpdateFlatRackData,
} from "./flat-rack.schema"

/**
 * Crea un nuevo Flat Rack.
 *
 * Este repositorio solamente ejecuta la operación contra la base de datos.
 * La validación y normalización de los datos deben realizarse previamente
 * en el schema/service.
 */
export async function createFlatRack(data: CreateFlatRackInput) {
  return prisma.flatRack.create({
    data: {
      numero: data.numero,
      marca: data.marca,
    },
  })
}

/**
 * Busca un Flat Rack por su ID.
 *
 * @param id ID único del Flat Rack.
 * @returns El Flat Rack encontrado o null si no existe.
 */
export async function findFlatRackById(id: number) {
  return prisma.flatRack.findUnique({
    where: {
      id,
    },
  })
}

/**
 * Busca un Flat Rack por su número exacto.
 *
 * Esta es una función importante porque será reutilizada
 * por otros módulos, como Trasegado.
 *
 * El número debe llegar previamente normalizado a mayúsculas.
 *
 * @param numero Número del Flat Rack.
 * @returns El Flat Rack encontrado o null si no existe.
 */
export async function findFlatRackByNumero(numero: string) {
  return prisma.flatRack.findUnique({
    where: {
      numero,
    },
  })
}

/**
 * Verifica si existe un Flat Rack con determinado número.
 *
 * Puede utilizarse para validar duplicados antes de crear
 * o actualizar un registro.
 *
 * @param numero Número del Flat Rack.
 * @param excludeId ID que debe excluirse de la búsqueda.
 *
 * El excludeId es útil durante una actualización:
 * si el registro mantiene su propio número, no debe considerarse
 * como un duplicado.
 */
export async function existsFlatRackByNumero(
  numero: string,
  excludeId?: number
) {
  const flatRack = await prisma.flatRack.findFirst({
    where: {
      numero,
      ...(excludeId !== undefined && {
        NOT: {
          id: excludeId,
        },
      }),
    },
    select: {
      id: true,
    },
  })

  return flatRack !== null
}

/**
 * Lista los Flat Racks registrados con paginación.
 *
 * Permite buscar por número o marca.
 *
 * @param input Parámetros de búsqueda y paginación.
 * @returns Registros de la página actual y metadatos de paginación.
 */
export async function findFlatRacks(input: FlatRackListInput) {
  const { page, pageSize, search } = input

  const where = search
    ? {
        OR: [
          {
            numero: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            marca: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : undefined

  const skip = (page - 1) * pageSize

  const [items, total] = await prisma.$transaction([
    prisma.flatRack.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        numero: "asc",
      },
    }),

    prisma.flatRack.count({
      where,
    }),
  ])

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

/**
 * Actualiza un Flat Rack existente.
 *
 * @param id ID del Flat Rack que se actualizará.
 * @param data Datos nuevos del Flat Rack.
 */
export async function updateFlatRack(id: number, data: UpdateFlatRackData) {
  return prisma.flatRack.update({
    where: {
      id,
    },
    data: {
      numero: data.numero,
      marca: data.marca,
    },
  })
}

/**
 * Elimina un Flat Rack.
 *
 * Esta función se incluye para completar el acceso al modelo,
 * pero la eliminación debe ser controlada por el service debido
 * a que un Flat Rack puede estar relacionado con registros
 * de trasegado.
 *
 * Si posteriormente decides no permitir eliminación física,
 * simplemente no expongas esta función desde el service.
 */
export async function deleteFlatRack(id: number) {
  return prisma.flatRack.delete({
    where: {
      id,
    },
  })
}
