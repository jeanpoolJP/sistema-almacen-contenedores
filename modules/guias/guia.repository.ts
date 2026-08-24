// modules\guias\guia.repository.ts

import { prisma } from "@/lib/prisma";

export async function obtenerGuiaPorId(
  id: number
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

export async function obtenerGuiaPorNumero(
  numeroGuia: string
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

export async function obtenerGuiaPorContenedor(
  contenedorId: number
) {
  return prisma.guiaInternamiento.findFirst({
    where: {
      contenedorId,
      estado: "ALMACENADO",
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

export async function listarGuias() {
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

export async function crearGuia(data: {
  numeroGuia: string;

  clienteId?: number | null;
  contenedorId: number;

  empresaTransporteIngresoId: number;
  vehiculoIngresoId: number;
  conductorIngresoId: number;

  fechaIngreso: Date;
  horaIngreso: Date;

  tipoPrecio: "ESTANDAR" | "PERSONALIZADO";

  precioPrimerDia: number;
  precioDiaAdicional: number;

  subtotal?: number | null;
  porcentajeIGV?: number | null;
  montoIGV?: number | null;
  montoTotal?: number | null;

  tratamientoIGV: "SIN_IGV" | "CON_IGV";

  estado: "ALMACENADO" | "RETIRADO" | "ANULADO";

  observaciones?: string | null;
}) {
  return prisma.guiaInternamiento.create({
    data: {
      numeroGuia: data.numeroGuia,

      clienteId: data.clienteId ?? null,
      contenedorId: data.contenedorId,

      empresaTransporteIngresoId:
        data.empresaTransporteIngresoId,

      vehiculoIngresoId:
        data.vehiculoIngresoId,

      conductorIngresoId:
        data.conductorIngresoId,

      fechaIngreso: data.fechaIngreso,
      horaIngreso: data.horaIngreso,

      tipoPrecio: data.tipoPrecio,

      precioPrimerDia: data.precioPrimerDia,
      precioDiaAdicional:
        data.precioDiaAdicional,

      subtotal: data.subtotal ?? null,
      porcentajeIGV:
        data.porcentajeIGV ?? null,

      montoIGV: data.montoIGV ?? null,
      montoTotal: data.montoTotal ?? null,

      tratamientoIGV:
        data.tratamientoIGV,

      estado: data.estado,

      observaciones:
        data.observaciones ?? null,
    },

    include: {
      cliente: true,
      contenedor: true,

      empresaTransporteIngreso: true,
      vehiculoIngreso: true,
      conductorIngreso: true,
    },
  });
}

export async function actualizarSalidaGuia(
  id: number,
  data: {
    empresaTransporteSalidaId: number;
    vehiculoSalidaId: number;
    conductorSalidaId: number;

    fechaSalida: Date;
    horaSalida: Date;

    diasAlmacenamiento: number;

    subtotal: number;
    porcentajeIGV: number;
    montoIGV: number;
    montoTotal: number;

    tratamientoIGV:
      "SIN_IGV" | "CON_IGV";

    estado: "RETIRADO";
  }
) {
  return prisma.guiaInternamiento.update({
    where: {
      id,
    },

    data: {
      empresaTransporteSalidaId:
        data.empresaTransporteSalidaId,

      vehiculoSalidaId:
        data.vehiculoSalidaId,

      conductorSalidaId:
        data.conductorSalidaId,

      fechaSalida:
        data.fechaSalida,

      horaSalida:
        data.horaSalida,

      diasAlmacenamiento:
        data.diasAlmacenamiento,

      subtotal:
        data.subtotal,

      porcentajeIGV:
        data.porcentajeIGV,

      montoIGV:
        data.montoIGV,

      montoTotal:
        data.montoTotal,

      tratamientoIGV:
        data.tratamientoIGV,

      estado:
        data.estado,
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