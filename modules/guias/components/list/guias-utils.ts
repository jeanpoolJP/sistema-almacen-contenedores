// modules/guias/components/list/guias-utils.ts

import { format } from "date-fns"
import { es } from "date-fns/locale"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

/**
 * ============================================================
 * FORMATEAR FECHA DE NEGOCIO
 * ============================================================
 */
export function formatFechaNegocio(fecha: Date | string | null | undefined) {
  if (!fecha) return "—"

  const fechaDate = typeof fecha === "string" ? new Date(fecha) : fecha

  const año = fechaDate.getUTCFullYear()
  const mes = fechaDate.getUTCMonth()
  const dia = fechaDate.getUTCDate()

  const fechaLocal = new Date(año, mes, dia)

  return format(fechaLocal, "dd MMM yyyy", {
    locale: es,
  })
}

/**
 * ============================================================
 * MAPEAR GUÍAS PARA EXPORTACIÓN A EXCEL
 * ============================================================
 */
export function mapearGuiasParaExcel(guias: GuiaConRelaciones[]) {
  return guias.map((guia) => ({
    "N° Guía": guia.numeroGuia,

    Cliente: guia.cliente?.nombreCompleto ?? "Sin cliente",

    "Tipo documento": guia.cliente?.tipoDocumento ?? "",

    "Documento cliente": guia.cliente?.numeroDocumento ?? "",

    Contenedor: guia.contenedor.numeroContenedor,

    "Marca contenedor": guia.contenedor.marca,

    Medida: guia.contenedor.medida,

    "Tipo contenedor": guia.contenedor.tipo,

    "Empresa transporte ingreso": guia.empresaTransporteIngreso?.nombre ?? "",

    "Vehículo ingreso": guia.vehiculoIngreso?.placa ?? "",

    "Conductor ingreso": guia.conductorIngreso?.nombreCompleto ?? "",

    "Licencia ingreso": guia.conductorIngreso?.numeroLicencia ?? "",

    "Fecha ingreso": formatFechaNegocio(guia.fechaIngreso),

    "Empresa transporte salida": guia.empresaTransporteSalida?.nombre ?? "",

    "Vehículo salida": guia.vehiculoSalida?.placa ?? "",

    "Conductor salida": guia.conductorSalida?.nombreCompleto ?? "",

    "Licencia salida": guia.conductorSalida?.numeroLicencia ?? "",

    "Fecha salida": formatFechaNegocio(guia.fechaSalida),

    "Días almacenamiento": guia.diasAlmacenamiento ?? "",

    "Tipo precio": guia.tipoPrecio,

    "Precio primer día": guia.precioPrimerDia ?? "",

    "Precio día adicional": guia.precioDiaAdicional ?? "",

    "Precio ingreso / salida": guia.precioIngresoSalida ?? "",

    "Cantidad movimientos": guia.cantidadMovimientos ?? "",

    "Precio por movimiento": guia.precioMovimiento ?? "",

    "Subtotal movimientos": guia.subtotalMovimientos ?? "",

    Subtotal: guia.subtotal ?? "",

    "IGV %": guia.porcentajeIGV ?? "",

    "Monto IGV": guia.montoIGV ?? "",

    "Monto total": guia.montoTotal ?? "",

    "Tratamiento IGV": guia.tratamientoIGV,

    Estado: guia.estado,

    "Estado de pago": guia.estadoPago,

    Observaciones: guia.observaciones ?? "",

    "Fecha creación": formatFechaNegocio(guia.createdAt),
  }))
}
