// modules\contenedores\contenedores.service.ts

import {
  contenedorNumeroSchema,
  contenedorSchema,
} from "./contenedores.schema";

import {
  createContenedor,
  deleteContenedor,
  findContenedorById,
  findContenedorByNumero,
  findContenedores,
  updateContenedor,
  countContenedores,
} from "./contenedores.repository";

import type {
  ContenedorFormData,
} from "./contenedores.types";

/**
 * Busca un contenedor por su número único. 
 * Si existe, lo devuelve. Si no existe, lo registra y lo devuelve.
 * 
 * Esta función es el puente ideal para ser consumida por el 
 * Servicio o Server Action del módulo de Guías.
 */
export async function obtenerOCrearContenedor(
  data: ContenedorFormData
) {
  // 1. Validamos los datos de entrada usando tu schema existente
  const datosValidados = contenedorSchema.parse(data);

  // 2. Buscamos si ya existe por su número único
  const contenedorExistente = await findContenedorByNumero(
    datosValidados.numeroContenedor
  );

  // 3. Caso A: Si ya existe, lo retornamos de inmediato
  if (contenedorExistente) {
    return contenedorExistente;
  }

  // 4. Caso B: Si no existe, lo creamos directamente usando el repositorio
  // Nota: Usamos el repositorio directo para evitar la doble validación que hace 'registrarContenedor'
  return createContenedor({
    numeroContenedor: datosValidados.numeroContenedor,
    marca: datosValidados.marca,
    medida: datosValidados.medida,
    tipo: datosValidados.tipo,
  });
}

/**
 * Busca un contenedor por su número.
 *
 * Esta función será utilizada principalmente
 * al momento de crear una guía.
 *
 * Si el contenedor existe:
 * - devuelve toda su información.
 *
 * Si no existe:
 * - devuelve null.
 */
export async function obtenerContenedorPorNumero(
  numeroContenedor: string,
) {
  const {
    numeroContenedor: numeroValido,
  } = contenedorNumeroSchema.parse({
    numeroContenedor,
  });

  return findContenedorByNumero(
    numeroValido,
  );
}

/**
 * Obtiene un contenedor por su ID.
 */
export async function obtenerContenedorPorId(
  id: number,
) {
  return findContenedorById(id);
}

/**
 * Obtiene una página de contenedores.
 */
export async function obtenerContenedores(
  page: number = 1,
  pageSize: number = 10,
) {
  return findContenedores(
    page,
    pageSize,
  );
}

/**
 * Obtiene la cantidad total de contenedores.
 */
export async function contarContenedores() {
  return countContenedores();
}

/**
 * Registra un nuevo contenedor.
 */
export async function registrarContenedor(
  data: ContenedorFormData,
) {
  const datosValidados =
    contenedorSchema.parse(data);

  /**
   * Verificamos que no exista otro contenedor
   * con el mismo número.
   */
  const contenedorExistente =
    await findContenedorByNumero(
      datosValidados.numeroContenedor,
    );

  if (contenedorExistente) {
    throw new Error(
      "Ya existe un contenedor registrado con este número",
    );
  }

  return createContenedor({
    numeroContenedor:
      datosValidados.numeroContenedor,

    marca:
      datosValidados.marca,

    medida:
      datosValidados.medida,

    tipo:
      datosValidados.tipo,
  });
}

/**
 * Actualiza un contenedor existente.
 */
export async function actualizarContenedor(
  id: number,
  data: ContenedorFormData,
) {
  const datosValidados =
    contenedorSchema.parse(data);

  /**
   * Verificamos si el número pertenece
   * a otro contenedor.
   */
  const contenedorExistente =
    await findContenedorByNumero(
      datosValidados.numeroContenedor,
    );

  if (
    contenedorExistente &&
    contenedorExistente.id !== id
  ) {
    throw new Error(
      "Ya existe otro contenedor registrado con este número",
    );
  }

  return updateContenedor(id, {
    numeroContenedor:
      datosValidados.numeroContenedor,

    marca:
      datosValidados.marca,

    medida:
      datosValidados.medida,

    tipo:
      datosValidados.tipo,
  });
}

/**
 * Elimina un contenedor.
 *
 * Esta operación puede fallar si el contenedor
 * tiene guías relacionadas.
 */
export async function eliminarContenedor(
  id: number,
) {
  const contenedor =
    await findContenedorById(id);

  if (!contenedor) {
    throw new Error(
      "El contenedor no existe",
    );
  }

  return deleteContenedor(id);
}