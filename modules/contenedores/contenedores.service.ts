import { contenedorNumeroSchema, contenedorSchema } from "./contenedores.schema"

import {
  createContenedor,
  deleteContenedor,
  findContenedorById,
  findContenedorByNumero,
  findContenedores,
  updateContenedor,
  countContenedores,
} from "./contenedores.repository"

import type { ContenedorFormData } from "./contenedores.types"

/**
 * Busca un contenedor por su número único.
 *
 * Si existe, lo devuelve.
 * Si no existe, lo registra y lo devuelve.
 */
export async function obtenerOCrearContenedor(data: ContenedorFormData) {
  const datosValidados = contenedorSchema.parse(data)

  // Normalizamos los datos antes de trabajar con ellos.
  const numeroContenedor = datosValidados.numeroContenedor.trim().toUpperCase()

  const marca = datosValidados.marca.trim().toUpperCase()

  // Buscamos usando el número normalizado.
  const contenedorExistente = await findContenedorByNumero(numeroContenedor)

  if (contenedorExistente) {
    return contenedorExistente
  }

  return createContenedor({
    numeroContenedor,
    marca,
    medida: datosValidados.medida,
    tipo: datosValidados.tipo,
  })
}

/**
 * Busca un contenedor por su número.
 *
 * El número se normaliza a mayúsculas para
 * mantener consistencia en las búsquedas.
 */
export async function obtenerContenedorPorNumero(numeroContenedor: string) {
  const { numeroContenedor: numeroValido } = contenedorNumeroSchema.parse({
    numeroContenedor,
  })

  return findContenedorByNumero(numeroValido.trim().toUpperCase())
}

/**
 * Obtiene un contenedor por su ID.
 */
export async function obtenerContenedorPorId(id: number) {
  return findContenedorById(id)
}

/**
 * Obtiene una página de contenedores.
 */
export async function obtenerContenedores(
  page: number = 1,
  pageSize: number = 10
) {
  return findContenedores(page, pageSize)
}

/**
 * Obtiene la cantidad total de contenedores.
 */
export async function contarContenedores() {
  return countContenedores()
}

/**
 * Registra un nuevo contenedor.
 */
export async function registrarContenedor(data: ContenedorFormData) {
  const datosValidados = contenedorSchema.parse(data)

  // Normalizamos antes de buscar y guardar.
  const numeroContenedor = datosValidados.numeroContenedor.trim().toUpperCase()

  const marca = datosValidados.marca.trim().toUpperCase()

  /**
   * Verificamos que no exista otro contenedor
   * con el mismo número.
   */
  const contenedorExistente = await findContenedorByNumero(numeroContenedor)

  if (contenedorExistente) {
    throw new Error("Ya existe un contenedor registrado con este número")
  }

  return createContenedor({
    numeroContenedor,
    marca,
    medida: datosValidados.medida,
    tipo: datosValidados.tipo,
  })
}

/**
 * Actualiza un contenedor existente.
 */
export async function actualizarContenedor(
  id: number,
  data: ContenedorFormData
) {
  const datosValidados = contenedorSchema.parse(data)

  // Normalizamos antes de buscar y actualizar.
  const numeroContenedor = datosValidados.numeroContenedor.trim().toUpperCase()

  const marca = datosValidados.marca.trim().toUpperCase()

  /**
   * Verificamos si el número pertenece
   * a otro contenedor.
   */
  const contenedorExistente = await findContenedorByNumero(numeroContenedor)

  if (contenedorExistente && contenedorExistente.id !== id) {
    throw new Error("Ya existe otro contenedor registrado con este número")
  }

  return updateContenedor(id, {
    numeroContenedor,
    marca,
    medida: datosValidados.medida,
    tipo: datosValidados.tipo,
  })
}

/**
 * Elimina un contenedor.
 *
 * Esta operación puede fallar si el contenedor
 * tiene guías relacionadas.
 */
export async function eliminarContenedor(id: number) {
  const contenedor = await findContenedorById(id)

  if (!contenedor) {
    throw new Error("El contenedor no existe")
  }

  return deleteContenedor(id)
}
