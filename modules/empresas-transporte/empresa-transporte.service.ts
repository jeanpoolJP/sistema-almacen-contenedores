// modules/empresas-transporte/empresa-transporte.service.ts

import {
  actualizarEmpresaTransporte,
  cambiarEstadoEmpresaTransporte,
  crearEmpresaTransporte,
  obtenerEmpresaTransportePorId,
  obtenerEmpresaTransportePorRuc,
  obtenerEmpresasTransporte,
  countEmpresasTransporte,
} from "./empresa-transporte.repository"

import { empresaTransporteSchema } from "./empresa-transporte.schema"

import type {
  ActualizarEmpresaTransporteInput,
  CrearEmpresaTransporteInput,
} from "./empresa-transporte.types"

/**
 * Normaliza el nombre de una empresa de transporte.
 *
 * - Elimina espacios al inicio y al final.
 * - Convierte el nombre a mayúsculas.
 */
function normalizarNombreEmpresa(nombre: string) {
  return nombre.trim().toUpperCase()
}

/**
 * Normaliza el RUC.
 *
 * - Elimina espacios al inicio y al final.
 */
function normalizarRuc(ruc: string) {
  return ruc.trim()
}

/**
 * Crea una empresa de transporte.
 *
 * El RUC es el identificador único de la empresa.
 */
export async function crearEmpresaTransporteService(
  data: CrearEmpresaTransporteInput
) {
  const datosValidados = empresaTransporteSchema.parse(data)

  const nombre = normalizarNombreEmpresa(datosValidados.nombre)

  const ruc = normalizarRuc(datosValidados.ruc)

  const empresaExistente = await obtenerEmpresaTransportePorRuc(ruc)

  if (empresaExistente) {
    throw new Error("Ya existe una empresa de transporte con ese RUC")
  }

  return crearEmpresaTransporte({
    nombre,
    ruc,
    telefono: datosValidados.telefono?.trim() || null,

    contactoLogistico: datosValidados.contactoLogistico?.trim() || null,

    nombreEncargado: datosValidados.nombreEncargado?.trim() || null,
  })
}

/**
 * Busca una empresa de transporte por su RUC.
 *
 * El RUC es el identificador de la empresa.
 */
export async function obtenerEmpresaTransportePorRucService(ruc: string) {
  const rucNormalizado = normalizarRuc(ruc)

  if (!rucNormalizado) {
    throw new Error("El RUC es obligatorio")
  }

  return obtenerEmpresaTransportePorRuc(rucNormalizado)
}

/**
 * Busca una empresa de transporte por su RUC.
 *
 * Si existe, la devuelve.
 * Si no existe, la crea y la devuelve.
 *
 * Esta función puede ser utilizada por el módulo
 * de Guías al registrar una nueva guía.
 */
export async function obtenerOCrearEmpresaTransporte(
  data: CrearEmpresaTransporteInput
) {
  const datosValidados = empresaTransporteSchema.parse(data)

  const nombre = normalizarNombreEmpresa(datosValidados.nombre)

  const ruc = normalizarRuc(datosValidados.ruc)

  // Buscar por RUC
  const empresaExistente = await obtenerEmpresaTransportePorRuc(ruc)

  // Si existe, devolverla
  if (empresaExistente) {
    return empresaExistente
  }

  // Si no existe, crearla
  return crearEmpresaTransporte({
    nombre,
    ruc,
    telefono: datosValidados.telefono?.trim() || null,

    contactoLogistico: datosValidados.contactoLogistico?.trim() || null,

    nombreEncargado: datosValidados.nombreEncargado?.trim() || null,
  })
}

/**
 * Obtiene una página de empresas
 * de transporte.
 */
export async function obtenerEmpresasTransporteService(
  page: number = 1,
  pageSize: number = 10
) {
  return obtenerEmpresasTransporte(page, pageSize)
}

/**
 * Obtiene la cantidad total de empresas
 * de transporte.
 */
export async function contarEmpresasTransporteService() {
  return countEmpresasTransporte()
}

/**
 * Obtiene una empresa de transporte por su ID.
 */
export async function obtenerEmpresaTransportePorIdService(id: number) {
  const empresa = await obtenerEmpresaTransportePorId(id)

  if (!empresa) {
    throw new Error("La empresa de transporte no existe")
  }

  return empresa
}

/**
 * Actualiza una empresa de transporte.
 *
 * El RUC continúa siendo el identificador único.
 */
export async function actualizarEmpresaTransporteService(
  data: ActualizarEmpresaTransporteInput
) {
  const empresa = await obtenerEmpresaTransportePorId(data.id)

  if (!empresa) {
    throw new Error("La empresa de transporte no existe")
  }

  const datosValidados = empresaTransporteSchema.parse({
    nombre: data.nombre,
    ruc: data.ruc,
    telefono: data.telefono,
    contactoLogistico: data.contactoLogistico,
    nombreEncargado: data.nombreEncargado,
  })

  const nombre = normalizarNombreEmpresa(datosValidados.nombre)

  const ruc = normalizarRuc(datosValidados.ruc)

  // Verificar que el RUC no pertenezca
  // a otra empresa.
  const empresaConMismoRuc = await obtenerEmpresaTransportePorRuc(ruc)

  if (empresaConMismoRuc && empresaConMismoRuc.id !== data.id) {
    throw new Error("Ya existe otra empresa de transporte con ese RUC")
  }

  return actualizarEmpresaTransporte({
    id: data.id,

    nombre,

    ruc,

    telefono: datosValidados.telefono?.trim() || null,

    contactoLogistico: datosValidados.contactoLogistico?.trim() || null,

    nombreEncargado: datosValidados.nombreEncargado?.trim() || null,
  })
}

/**
 * Activa o desactiva una empresa de transporte.
 */
export async function cambiarEstadoEmpresaTransporteService(
  id: number,
  activo: boolean
) {
  const empresa = await obtenerEmpresaTransportePorId(id)

  if (!empresa) {
    throw new Error("La empresa de transporte no existe")
  }

  return cambiarEstadoEmpresaTransporte(id, activo)
}
