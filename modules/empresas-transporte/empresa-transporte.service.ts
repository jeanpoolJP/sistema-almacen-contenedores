// modules/empresas-transporte/empresa-transporte.service.ts

import {
  actualizarEmpresaTransporte,
  cambiarEstadoEmpresaTransporte,
  crearEmpresaTransporte,
  obtenerEmpresaTransportePorId,
  obtenerEmpresaTransportePorNombre,
  obtenerEmpresasTransporte,
} from "./empresa-transporte.repository";

import { empresaTransporteSchema } from "./empresa-transporte.schema";

import type {
  ActualizarEmpresaTransporteInput,
  CrearEmpresaTransporteInput,
} from "./empresa-transporte.types";

/**
 * Normaliza el nombre de una empresa de transporte.
 *
 * - Elimina espacios al inicio y al final.
 * - Convierte el nombre a mayúsculas.
 */
function normalizarNombreEmpresa(nombre: string) {
  return nombre.trim().toUpperCase();
}

/**
 * Crea una empresa de transporte.
 */
export async function crearEmpresaTransporteService(
  data: CrearEmpresaTransporteInput,
) {
  const datosValidados = empresaTransporteSchema.parse(data);

  const nombre = normalizarNombreEmpresa(datosValidados.nombre);

  const empresaExistente = await obtenerEmpresaTransportePorNombre(nombre);

  if (empresaExistente) {
    throw new Error(
      "Ya existe una empresa de transporte con ese nombre",
    );
  }

  return crearEmpresaTransporte({
    nombre,
    ruc: datosValidados.ruc?.trim() || null,
    telefono: datosValidados.telefono?.trim() || null,
  });
}

/**
 * Busca una empresa de transporte por nombre.
 *
 * El nombre se normaliza antes de realizar la búsqueda.
 */
export async function obtenerEmpresaTransportePorNombreService(
  nombre: string,
) {
  const nombreNormalizado = normalizarNombreEmpresa(nombre);

  if (!nombreNormalizado) {
    throw new Error(
      "El nombre de la empresa es obligatorio",
    );
  }

  return obtenerEmpresaTransportePorNombre(
    nombreNormalizado,
  );
}

/**
 * Busca una empresa de transporte por su nombre.
 *
 * Si existe, la devuelve.
 * Si no existe, la crea y la devuelve.
 *
 * Esta función puede ser utilizada por el módulo
 * de Guías al registrar una nueva guía.
 */
export async function obtenerOCrearEmpresaTransporte(
  data: CrearEmpresaTransporteInput,
) {
  const datosValidados = empresaTransporteSchema.parse(data);

  const nombre = normalizarNombreEmpresa(
    datosValidados.nombre,
  );

  // Buscar si ya existe
  const empresaExistente =
    await obtenerEmpresaTransportePorNombre(
      nombre,
    );

  // Si existe, devolverla
  if (empresaExistente) {
    return empresaExistente;
  }

  // Si no existe, crearla
  return crearEmpresaTransporte({
    nombre,
    ruc: datosValidados.ruc?.trim() || null,
    telefono: datosValidados.telefono?.trim() || null,
  });
}

export async function obtenerEmpresasTransporteService() {
  return obtenerEmpresasTransporte();
}

export async function obtenerEmpresaTransportePorIdService(id: number) {
  const empresa = await obtenerEmpresaTransportePorId(id);

  if (!empresa) {
    throw new Error("La empresa de transporte no existe");
  }

  return empresa;
}

export async function actualizarEmpresaTransporteService(
  data: ActualizarEmpresaTransporteInput
) {
  const empresa = await obtenerEmpresaTransportePorId(data.id);

  if (!empresa) {
    throw new Error("La empresa de transporte no existe");
  }

  const nombre = data.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre de la empresa es obligatorio");
  }

  return actualizarEmpresaTransporte({
    id: data.id,
    nombre,
    ruc: data.ruc?.trim() || null,
    telefono: data.telefono?.trim() || null,
  });
}

export async function cambiarEstadoEmpresaTransporteService(
  id: number,
  activo: boolean
) {
  const empresa = await obtenerEmpresaTransportePorId(id);

  if (!empresa) {
    throw new Error("La empresa de transporte no existe");
  }

  return cambiarEstadoEmpresaTransporte(id, activo);
}