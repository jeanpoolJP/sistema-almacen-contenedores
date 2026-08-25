// modules\vehiculos\vehiculos.service.ts

import { vehiculoSchema } from "./vehiculos.schema";

import {
  createVehiculo,
  deleteVehiculo,
  findVehiculoById,
  findVehiculoByPlaca,
  findVehiculos,
  updateVehiculo,
} from "./vehiculos.repository";

import type { VehiculoFormData } from "./vehiculos.types";

/**
 * Busca un vehículo por su placa.
 *
 * Si existe, lo devuelve.
 * Si no existe, lo crea y lo devuelve.
 *
 * Esta función será utilizada por el módulo
 * de Guías al momento de registrar una guía.
 */
export async function obtenerOCrearVehiculo(
  data: VehiculoFormData,
) {
  // 1. Validar los datos del vehículo.
  // El schema también normaliza la placa a mayúsculas.
  const datosValidados = vehiculoSchema.parse(data);

  // 2. Buscar si el vehículo ya existe por placa.
  const vehiculoExistente = await findVehiculoByPlaca(
    datosValidados.placa,
  );

  // 3. Si existe, devolverlo.
  if (vehiculoExistente) {
    return vehiculoExistente;
  }

  // 4. Si no existe, crearlo.
  return createVehiculo({
    placa: datosValidados.placa,
  });
}

/**
 * Busca un vehículo por su placa.
 *
 * Esta función será utilizada posteriormente
 * al momento de crear una guía.
 */
export async function obtenerVehiculoPorPlaca(
  placa: string,
) {
  const datosValidados = vehiculoSchema
    .pick({
      placa: true,
    })
    .parse({
      placa,
    });

  return findVehiculoByPlaca(
    datosValidados.placa,
  );
}

/**
 * Busca un vehículo por su ID.
 */
export async function obtenerVehiculoPorId(
  id: number,
) {
  return findVehiculoById(id);
}

/**
 * Obtiene todos los vehículos registrados.
 */
export async function obtenerVehiculos() {
  return findVehiculos();
}

/**
 * Registra un nuevo vehículo.
 */
export async function registrarVehiculo(
  data: VehiculoFormData,
) {
  const datosValidados =
    vehiculoSchema.parse(data);

  const vehiculoExistente =
    await findVehiculoByPlaca(
      datosValidados.placa,
    );

  if (vehiculoExistente) {
    throw new Error(
      "Ya existe un vehículo registrado con esta placa",
    );
  }

  return createVehiculo({
    placa: datosValidados.placa,
  });
}

/**
 * Actualiza un vehículo existente.
 */
export async function actualizarVehiculo(
  id: number,
  data: VehiculoFormData,
) {
  const datosValidados =
    vehiculoSchema.parse(data);

  const vehiculoExistente =
    await findVehiculoByPlaca(
      datosValidados.placa,
    );

  if (
    vehiculoExistente &&
    vehiculoExistente.id !== id
  ) {
    throw new Error(
      "Ya existe otro vehículo registrado con esta placa",
    );
  }

  return updateVehiculo(id, {
    placa: datosValidados.placa,
  });
}

/**
 * Elimina un vehículo.
 */
export async function eliminarVehiculo(
  id: number,
) {
  const vehiculo =
    await findVehiculoById(id);

  if (!vehiculo) {
    throw new Error(
      "El vehículo no existe",
    );
  }

  return deleteVehiculo(id);
}