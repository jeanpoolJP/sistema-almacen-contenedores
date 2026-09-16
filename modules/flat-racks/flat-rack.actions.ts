// modules\flat-racks\flat-rack.actions.ts

"use server"

import {
  createFlatRackService,
  deleteFlatRackService,
  findFlatRackByIdService,
  findFlatRackByNumeroService,
  findOrCreateFlatRackService,
  listFlatRacksService,
  updateFlatRackService,
} from "./flat-rack.service"
import {
  createFlatRackSchema,
  flatRackListSchema,
  searchFlatRackSchema,
  updateFlatRackSchema,
} from "./flat-rack.schema"

type ActionResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: string
    }

/**
 * Registra un nuevo Flat Rack.
 *
 * Valida y normaliza los datos mediante Zod antes
 * de enviarlos al service.
 */
export async function createFlatRackAction(input: unknown) {
  try {
    const validatedInput = createFlatRackSchema.parse(input)

    const flatRack = await createFlatRackService(validatedInput)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Actualiza un Flat Rack existente.
 */
export async function updateFlatRackAction(input: unknown) {
  try {
    const validatedInput = updateFlatRackSchema.parse(input)

    const { id, ...data } = validatedInput

    const flatRack = await updateFlatRackService(id, data)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Obtiene un Flat Rack mediante su ID.
 */
export async function getFlatRackByIdAction(id: number) {
  try {
    const flatRack = await findFlatRackByIdService(id)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Busca un Flat Rack por su número.
 *
 * Se utiliza principalmente cuando otro módulo,
 * como Trasegado, necesita localizar un Flat Rack.
 */
export async function getFlatRackByNumeroAction(input: unknown) {
  try {
    const validatedInput = searchFlatRackSchema.parse(input)

    const flatRack = await findFlatRackByNumeroService(validatedInput.numero)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Busca un Flat Rack por número y lo crea si no existe.
 *
 * Si el Flat Rack ya existe, devuelve el registro existente.
 * Si no existe, la marca será necesaria para registrarlo.
 *
 * Pensado para ser reutilizado por otros módulos.
 */
export async function findOrCreateFlatRackAction(
  numero: string,
  marca?: string
) {
  try {
    const flatRack = await findOrCreateFlatRackService(numero, marca)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Lista Flat Racks con búsqueda y paginación.
 */
export async function listFlatRacksAction(
  input?: unknown
): Promise<ActionResult<Awaited<ReturnType<typeof listFlatRacksService>>>> {
  try {
    const validatedInput = flatRackListSchema.parse(input ?? {})

    const result = await listFlatRacksService(validatedInput)

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Elimina un Flat Rack.
 */
export async function deleteFlatRackAction(id: number) {
  try {
    const flatRack = await deleteFlatRackService(id)

    return {
      success: true,
      data: flatRack,
    }
  } catch (error) {
    return {
      success: false,
      error: getActionErrorMessage(error),
    }
  }
}

/**
 * Obtiene un mensaje seguro y consistente para los errores
 * producidos dentro de las Server Actions.
 */
function getActionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return "OCURRIÓ UN ERROR INESPERADO"
}
