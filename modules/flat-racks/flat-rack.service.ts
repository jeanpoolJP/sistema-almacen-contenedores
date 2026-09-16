// modules\flat-racks\flat-rack.service.ts

import {
  createFlatRack,
  deleteFlatRack,
  existsFlatRackByNumero,
  findFlatRackById,
  findFlatRackByNumero,
  findFlatRacks,
  updateFlatRack,
} from "./flat-rack.repository"
import type {
  CreateFlatRackInput,
  FlatRackListInput,
  UpdateFlatRackData,
} from "./flat-rack.schema"

/**
 * Normaliza un valor de texto para el módulo de Flat Racks.
 *
 * Todos los números y marcas se manejan en mayúsculas.
 */
function normalizeText(value: string): string {
  return value.trim().toUpperCase()
}

/**
 * Crea un nuevo Flat Rack.
 *
 * Reglas:
 * - El número se almacena en mayúsculas.
 * - La marca se almacena en mayúsculas.
 * - No se permite registrar dos Flat Racks con el mismo número.
 *
 * @param input Datos del Flat Rack.
 * @returns Flat Rack creado.
 */
export async function createFlatRackService(input: CreateFlatRackInput) {
  const numero = normalizeText(input.numero)
  const marca = normalizeText(input.marca)

  const exists = await existsFlatRackByNumero(numero)

  if (exists) {
    throw new Error(`EL FLAT RACK "${numero}" YA ESTÁ REGISTRADO`)
  }

  return createFlatRack({
    numero,
    marca,
  })
}

/**
 * Busca un Flat Rack por su número exacto.
 *
 * Esta función está pensada para ser reutilizada por otros módulos,
 * por ejemplo, el módulo de Trasegado.
 *
 * La búsqueda es normalizada a mayúsculas.
 *
 * @param numero Número del Flat Rack.
 * @returns Flat Rack encontrado o null.
 */
export async function findFlatRackByNumeroService(numero: string) {
  const normalizedNumero = normalizeText(numero)

  return findFlatRackByNumero(normalizedNumero)
}

/**
 * Busca un Flat Rack por su ID.
 *
 * @param id ID del Flat Rack.
 * @returns Flat Rack encontrado o null.
 */
export async function findFlatRackByIdService(id: number) {
  return findFlatRackById(id)
}

/**
 * Busca un Flat Rack por número y, si no existe, lo crea.
 *
 * Esta función está diseñada principalmente para ser utilizada
 * por otros módulos que reciben el número de un Flat Rack.
 *
 * Ejemplo:
 *
 * const flatRack = await findOrCreateFlatRackService("fr001")
 *
 * Si "FR001" existe:
 *   → devuelve el registro existente.
 *
 * Si "FR001" no existe:
 *   → crea el Flat Rack y lo devuelve.
 *
 * La marca es obligatoria únicamente cuando el Flat Rack
 * todavía no existe.
 *
 * @param numero Número del Flat Rack.
 * @param marca Marca del Flat Rack si es necesario crearlo.
 * @returns Flat Rack existente o recién creado.
 */
export async function findOrCreateFlatRackService(
  numero: string,
  marca?: string
) {
  const normalizedNumero = normalizeText(numero)

  const existingFlatRack = await findFlatRackByNumero(normalizedNumero)

  if (existingFlatRack) {
    return existingFlatRack
  }

  if (!marca?.trim()) {
    throw new Error(
      `EL FLAT RACK "${normalizedNumero}" NO EXISTE. LA MARCA ES OBLIGATORIA PARA REGISTRARLO`
    )
  }

  const normalizedMarca = normalizeText(marca)

  return createFlatRack({
    numero: normalizedNumero,
    marca: normalizedMarca,
  })
}

/**
 * Lista los Flat Racks registrados con paginación.
 *
 * Si se proporciona un texto de búsqueda, se normaliza
 * antes de enviarlo al repositorio.
 *
 * @param input Parámetros de búsqueda y paginación.
 * @returns Flat Racks de la página actual y metadatos de paginación.
 */
export async function listFlatRacksService(input: FlatRackListInput) {
  const normalizedSearch = input.search?.trim()
    ? normalizeText(input.search)
    : undefined

  return findFlatRacks({
    ...input,
    search: normalizedSearch,
  })
}

/**
 * Actualiza un Flat Rack existente.
 *
 * Reglas:
 * - El número se almacena en mayúsculas.
 * - La marca se almacena en mayúsculas.
 * - No se permite utilizar el número de otro Flat Rack.
 *
 * @param id ID del Flat Rack.
 * @param input Nuevos datos.
 * @returns Flat Rack actualizado.
 */
export async function updateFlatRackService(
  id: number,
  input: UpdateFlatRackData
) {
  const existingFlatRack = await findFlatRackById(id)

  if (!existingFlatRack) {
    throw new Error("EL FLAT RACK QUE INTENTAS ACTUALIZAR NO EXISTE")
  }

  const numero = normalizeText(input.numero)
  const marca = normalizeText(input.marca)

  const duplicated = await existsFlatRackByNumero(numero, id)

  if (duplicated) {
    throw new Error(`EL NÚMERO "${numero}" YA ESTÁ ASIGNADO A OTRO FLAT RACK`)
  }

  return updateFlatRack(id, {
    numero,
    marca,
  })
}

/**
 * Elimina físicamente un Flat Rack.
 *
 * Antes de utilizar esta función desde la UI, debes considerar
 * que el Flat Rack puede estar relacionado con registros de
 * Trasegado mediante GuiaTrasegadoElemento.
 *
 * Si existen relaciones que impiden la eliminación, Prisma
 * devolverá el error correspondiente según la configuración
 * de la relación en Prisma.
 *
 * @param id ID del Flat Rack.
 * @returns Flat Rack eliminado.
 */
export async function deleteFlatRackService(id: number) {
  const existingFlatRack = await findFlatRackById(id)

  if (!existingFlatRack) {
    throw new Error("EL FLAT RACK QUE INTENTAS ELIMINAR NO EXISTE")
  }

  return deleteFlatRack(id)
}
