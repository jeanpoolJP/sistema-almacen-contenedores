import { prisma } from "@/lib/prisma";

import type {
  ActualizarEmpresaTransporteInput,
  CrearEmpresaTransporteInput,
} from "./empresa-transporte.types";

export async function crearEmpresaTransporte(
  data: CrearEmpresaTransporteInput
) {
  return prisma.empresaTransporte.create({
    data: {
      nombre: data.nombre,
      ruc: data.ruc || null,
      telefono: data.telefono || null,
    },
  });
}

export async function obtenerEmpresasTransporte() {
  return prisma.empresaTransporte.findMany({
    orderBy: {
      nombre: "asc",
    },
  });
}

export async function obtenerEmpresaTransportePorId(id: number) {
  return prisma.empresaTransporte.findUnique({
    where: {
      id,
    },
  });
}

export async function actualizarEmpresaTransporte(
  data: ActualizarEmpresaTransporteInput
) {
  return prisma.empresaTransporte.update({
    where: {
      id: data.id,
    },
    data: {
      nombre: data.nombre,
      ruc: data.ruc || null,
      telefono: data.telefono || null,
    },
  });
}

export async function cambiarEstadoEmpresaTransporte(
  id: number,
  activo: boolean
) {
  return prisma.empresaTransporte.update({
    where: {
      id,
    },
    data: {
      activo,
    },
  });
}