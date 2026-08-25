// modules/guias/guia.repository.ts

import { prisma } from "@/lib/prisma";

import type {
  CrearGuiaRepositoryInput,
} from "./guia.types";

/**
 * Crea una guía de internamiento.
 *
 * Este repository NO busca ni crea clientes,
 * contenedores, vehículos, conductores, etc.
 *
 * Esa responsabilidad pertenece al service.
 */
export async function crearGuia(
  data: CrearGuiaRepositoryInput,
) {
  return prisma.guiaInternamiento.create({
    data: {
      numeroGuia:
        data.numeroGuia,

      clienteId:
        data.clienteId ?? null,

      contenedorId:
        data.contenedorId,

      empresaTransporteIngresoId:
        data.empresaTransporteIngresoId,

      vehiculoIngresoId:
        data.vehiculoIngresoId,

      conductorIngresoId:
        data.conductorIngresoId,

      fechaIngreso:
        data.fechaIngreso,

      horaIngreso:
        data.horaIngreso,

      tipoPrecio:
        data.tipoPrecio,

      precioPrimerDia:
        data.precioPrimerDia,

      precioDiaAdicional:
        data.precioDiaAdicional,

      porcentajeIGV:
        data.porcentajeIGV,

      tratamientoIGV:
        data.tratamientoIGV,

      estado:
        data.estado,

      observaciones:
        data.observaciones ?? null,
    },

    include: {
      cliente: true,

      contenedor: true,

      empresaTransporteIngreso: true,

      vehiculoIngreso: true,

      conductorIngreso: true,

      empresaTransporteSalida: true,

      vehiculoSalida: true,

      conductorSalida: true,
    },
  });
}

/**
 * Busca una guía por ID.
 */
export async function obtenerGuiaPorId(
  id: number,
) {
  return prisma.guiaInternamiento.findUnique({
    where: {
      id,
    },

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  });
}

/**
 * Busca una guía por número.
 */
export async function obtenerGuiaPorNumero(
  numeroGuia: string,
) {
  return prisma.guiaInternamiento.findUnique({
    where: {
      numeroGuia,
    },

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  });
}

/**
 * Obtiene todas las guías.
 */
export async function obtenerGuias() {
  return prisma.guiaInternamiento.findMany({
    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Actualiza una guía.
 */
export async function actualizarGuia(
  id: number,
  data: Record<string, unknown>,
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data,

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,

      empresaTransporteSalida: true,
      vehiculoSalida: true,
      conductorSalida: true,
    },
  });
}

/**
 * Anula una guía.
 */
export async function anularGuia(
  id: number,
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      estado: "ANULADO",
    },
  });
}