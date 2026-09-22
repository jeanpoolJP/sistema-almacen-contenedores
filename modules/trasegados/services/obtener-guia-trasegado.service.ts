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
  const elementos: GuiaTrasegadoElementoDetalle[] = guia.ingresos.flatMap(
    (ingreso) =>
      ingreso.elementos.map((el) => {
        const vecesRetirado = el.salidas.length
        const esMercaderia = el.tipo === "MERCADERIA" || el.tipo === "OTRO"

        // Regla de "retirado":
        // - Identificables: ya salieron al menos una vez.
        // - Mercadería: el usuario lo marcó como completado.
        const retirado = esMercaderia
          ? el.mercaderiaCompletada
          : vecesRetirado > 0

        return {
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
          mercaderiaCompletada: el.mercaderiaCompletada,
          vecesRetirado,
          retirado,
        }
      })
  )

  const ingresos = guia.ingresos.map((ingreso) => ({
    id: ingreso.id,
    empresaTransporte: {
      id: ingreso.empresaTransporte.id,
      ruc: ingreso.empresaTransporte.ruc,
      nombre: ingreso.empresaTransporte.nombre,
      telefono: ingreso.empresaTransporte.telefono,
      contactoLogistico: ingreso.empresaTransporte.contactoLogistico,
      nombreEncargado: ingreso.empresaTransporte.nombreEncargado,
    },
    vehiculo: {
      id: ingreso.vehiculo.id,
      placa: ingreso.vehiculo.placa,
      tipo: ingreso.vehiculo.tipo,
      descripcion: ingreso.vehiculo.descripcion,
    },
    conductor: {
      id: ingreso.conductor.id,
      numeroLicencia: ingreso.conductor.numeroLicencia,
      nombreCompleto: ingreso.conductor.nombreCompleto,
      telefono: ingreso.conductor.telefono,
    },
    elementos: ingreso.elementos.map((el) =>
      elementos.find((elemento) => elemento.id === el.id)!
    ),
  }))

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
    ingresos,
    salidas,
  }
}
