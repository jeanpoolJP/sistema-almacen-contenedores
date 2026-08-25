// modules\conductores\conductores.service.ts

import {
  conductorLicenciaSchema,
  conductorSchema,
} from "./conductores.schema";

import {
  createConductor,
  deleteConductor,
  findConductorById,
  findConductorByLicencia,
  findConductores,
  updateConductor,
} from "./conductores.repository";

import type { ConductorFormData } from "./conductores.types";

/**
 * Busca un conductor por su número de licencia.
 *
 * Si existe, lo devuelve.
 * Si no existe, lo crea y lo devuelve.
 *
 * Esta función puede ser utilizada por el módulo
 * de Guías al momento de registrar una nueva guía.
 */
export async function obtenerOCrearConductor(
  data: ConductorFormData,
) {
  // 1. Validar los datos del conductor
  const datosValidados = conductorSchema.parse(data);

  // 2. Buscar si ya existe por número de licencia
  const conductorExistente = await findConductorByLicencia(
    datosValidados.numeroLicencia,
  );

  // 3. Si existe, devolverlo
  if (conductorExistente) {
    return conductorExistente;
  }

  // 4. Si no existe, crearlo
  return createConductor({
    nombreCompleto: datosValidados.nombreCompleto,
    numeroLicencia: datosValidados.numeroLicencia,
  });
}

/**
 * Obtiene un conductor mediante su número de licencia.
 *
 * Se utilizará principalmente al momento
 * de crear una guía.
 */
export async function obtenerConductorPorLicencia(
  numeroLicencia: string,
) {
  const {
    numeroLicencia: licenciaValida,
  } = conductorLicenciaSchema.parse({
    numeroLicencia,
  });

  return findConductorByLicencia(
    licenciaValida,
  );
}

/**
 * Obtiene un conductor mediante su ID.
 */
export async function obtenerConductorPorId(
  id: number,
) {
  return findConductorById(id);
}

/**
 * Obtiene todos los conductores.
 */
export async function obtenerConductores() {
  return findConductores();
}

/**
 * Registra un nuevo conductor.
 */
export async function registrarConductor(
  data: ConductorFormData,
) {
  const datosValidados =
    conductorSchema.parse(data);

  /**
   * Verificamos que no exista otro conductor
   * con la misma licencia.
   */
  const conductorExistente =
    await findConductorByLicencia(
      datosValidados.numeroLicencia,
    );

  if (conductorExistente) {
    throw new Error(
      "Ya existe un conductor registrado con este número de licencia",
    );
  }

  return createConductor({
    nombreCompleto:
      datosValidados.nombreCompleto,

    numeroLicencia:
      datosValidados.numeroLicencia,
  });
}

/**
 * Actualiza un conductor existente.
 */
export async function actualizarConductor(
  id: number,
  data: ConductorFormData,
) {
  const datosValidados =
    conductorSchema.parse(data);

  /**
   * Verificamos si la licencia pertenece
   * a otro conductor.
   */
  const conductorExistente =
    await findConductorByLicencia(
      datosValidados.numeroLicencia,
    );

  if (
    conductorExistente &&
    conductorExistente.id !== id
  ) {
    throw new Error(
      "Ya existe otro conductor registrado con este número de licencia",
    );
  }

  /**
   * Verificamos que el conductor
   * que queremos editar exista.
   */
  const conductor =
    await findConductorById(id);

  if (!conductor) {
    throw new Error(
      "El conductor no existe",
    );
  }

  return updateConductor(id, {
    nombreCompleto:
      datosValidados.nombreCompleto,

    numeroLicencia:
      datosValidados.numeroLicencia,
  });
}

/**
 * Elimina físicamente un conductor.
 *
 * Esta operación puede fallar si el conductor
 * tiene guías relacionadas.
 */
export async function eliminarConductor(
  id: number,
) {
  const conductor =
    await findConductorById(id);

  if (!conductor) {
    throw new Error(
      "El conductor no existe",
    );
  }

  return deleteConductor(id);
}