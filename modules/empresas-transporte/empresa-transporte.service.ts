import {
  actualizarEmpresaTransporte,
  cambiarEstadoEmpresaTransporte,
  crearEmpresaTransporte,
  obtenerEmpresaTransportePorId,
  obtenerEmpresasTransporte,
} from "./empresa-transporte.repository";

import type {
  ActualizarEmpresaTransporteInput,
  CrearEmpresaTransporteInput,
} from "./empresa-transporte.types";

export async function crearEmpresaTransporteService(
  data: CrearEmpresaTransporteInput
) {
  const nombre = data.nombre.trim();

  if (!nombre) {
    throw new Error("El nombre de la empresa es obligatorio");
  }

  return crearEmpresaTransporte({
    nombre,
    ruc: data.ruc?.trim() || null,
    telefono: data.telefono?.trim() || null,
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