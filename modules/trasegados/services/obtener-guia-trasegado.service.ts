// modules\trasegados\services\obtener-guia-trasegado.service.ts

import { obtenerGuiaTrasegadoSchema } from "../schemas/obtener-guia-trasegado.schema"
import { obtenerGuiaTrasegadoPorIdRepository } from "../repository/guia-trasegado.repository"
import type {
  GuiaTrasegadoDetalle,
  GuiaTrasegadoElementoDetalle,
  GuiaTrasegadoSalidaDetalle,
} from "../types/guia-trasegado-detalle.types"

/**
 * Obtiene el detalle completo de una guía por su ID.
 *
 * Convierte Decimal → number para que sea serializable
 * al cliente, y marca cada elemento con `retirado: boolean`.
 *
 * @throws {Error} Si la guía no existe.
 */
export async function obtenerGuiaTrasegadoService(input: {
  id: number | string
}): Promise<GuiaTrasegadoDetalle> {
  const { id } = obtenerGuiaTrasegadoSchema.parse(input)

  const guia = await obtenerGuiaTrasegadoPorIdRepository(id)

  if (!guia) {
    throw new Error(`No se encontró la guía de trasegado con ID ${id}.`)
  }

  // ------------------ ELEMENTOS ------------------
  const elementos: GuiaTrasegadoElementoDetalle[] =
    guia.ingreso?.elementos.map((el) => ({
      id: el.id,
      tipo: el.tipo,
      numero: el.numero,
      descripcion: el.descripcion,
      observaciones: el.observaciones,
      contenedor: el.contenedor
        ? {
            id: el.contenedor.id,
            numeroContenedor: el.contenedor.numeroContenedor,
            marca: el.contenedor.marca,
            medida: el.contenedor.medida,
            tipo: el.contenedor.tipo,
          }
        : null,
      flatRack: el.flatRack
        ? {
            id: el.flatRack.id,
            numero: el.flatRack.numero,
            marca: el.flatRack.marca,
          }
        : null,
      // Si tiene al menos una salida asociada, ya fue retirado
      retirado: el.salidas.length > 0,
    })) ?? []

  // ------------------ SALIDAS ------------------
  const salidas: GuiaTrasegadoSalidaDetalle[] = guia.salidas.map((s) => ({
    id: s.id,
    fechaSalida: s.fechaSalida,
    observaciones: s.observaciones,
    empresaTransporte: {
      id: s.empresaTransporte.id,
      ruc: s.empresaTransporte.ruc,
      nombre: s.empresaTransporte.nombre,
    },
    vehiculo: {
      id: s.vehiculo.id,
      placa: s.vehiculo.placa,
    },
    conductor: {
      id: s.conductor.id,
      nombreCompleto: s.conductor.nombreCompleto,
    },
    elementos: s.elementos.map((se) => ({
      elementoId: se.elemento.id,
      tipo: se.elemento.tipo,
      numero: se.elemento.numero,
      descripcion: se.elemento.descripcion,
    })),
  }))

  return {
    id: guia.id,
    numeroGuia: guia.numeroGuia,
    descripcionServicio: guia.descripcionServicio,
    fechaIngreso: guia.fechaIngreso,
    estado: guia.estado,
    estadoPago: guia.estadoPago,
    metodoPago: guia.metodoPago,
    numeroOperacion: guia.numeroOperacion,
    fechaPago: guia.fechaPago,
    tratamientoIGV: guia.tratamientoIGV,
    subtotal: guia.subtotal != null ? Number(guia.subtotal) : null,
    porcentajeIGV:
      guia.porcentajeIGV != null ? Number(guia.porcentajeIGV) : null,
    montoIGV: guia.montoIGV != null ? Number(guia.montoIGV) : null,
    totalPagar: guia.totalPagar != null ? Number(guia.totalPagar) : null,
    observaciones: guia.observaciones,
    cliente: guia.cliente
      ? {
          id: guia.cliente.id,
          tipoDocumento: guia.cliente.tipoDocumento,
          numeroDocumento: guia.cliente.numeroDocumento,
          nombreCompleto: guia.cliente.nombreCompleto,
          telefono: guia.cliente.telefono,
          observaciones: guia.cliente.observaciones,
        }
      : null,
    ingreso: guia.ingreso
      ? {
          id: guia.ingreso.id,
          empresaTransporte: {
            id: guia.ingreso.empresaTransporte.id,
            ruc: guia.ingreso.empresaTransporte.ruc,
            nombre: guia.ingreso.empresaTransporte.nombre,
            telefono: guia.ingreso.empresaTransporte.telefono,
            contactoLogistico: guia.ingreso.empresaTransporte.contactoLogistico,
            nombreEncargado: guia.ingreso.empresaTransporte.nombreEncargado,
          },
          vehiculo: {
            id: guia.ingreso.vehiculo.id,
            placa: guia.ingreso.vehiculo.placa,
            tipo: guia.ingreso.vehiculo.tipo,
            descripcion: guia.ingreso.vehiculo.descripcion,
          },
          conductor: {
            id: guia.ingreso.conductor.id,
            numeroLicencia: guia.ingreso.conductor.numeroLicencia,
            nombreCompleto: guia.ingreso.conductor.nombreCompleto,
            telefono: guia.ingreso.conductor.telefono,
          },
          elementos,
        }
      : null,
    salidas,
  }
}
