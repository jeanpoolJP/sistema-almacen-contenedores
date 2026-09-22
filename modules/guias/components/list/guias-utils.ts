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

export function formatHoraNegocio(hora: Date | string | null | undefined) {
  if (!hora) return "—"

  const horaDate = typeof hora === "string" ? new Date(hora) : hora

  return [
    String(horaDate.getUTCHours()).padStart(2, "0"),
    String(horaDate.getUTCMinutes()).padStart(2, "0"),
  ].join(":")
}

/**
 * ============================================================
 * MAPEAR GUÍAS PARA EXPORTACIÓN A EXCEL
 * ============================================================
 */
export function mapearGuiasParaExcel(guias: GuiaConRelaciones[]) {
  return guias.map((guia) => ({
    "Número de guía": guia.numeroGuia,
    Cliente: guia.cliente?.nombreCompleto ?? "Sin cliente",
    "Marca de contenedor": guia.contenedor.marca,
    "Número de contenedor": guia.contenedor.numeroContenedor,
    Medida: `${guia.contenedor.medida}'`,
    "Hora de ingreso": formatHoraNegocio(guia.horaIngreso),
    "Fecha de ingreso": formatFechaNegocio(guia.fechaIngreso),
    "Fecha de salida": formatFechaNegocio(guia.fechaSalida),
    "Hora de salida": formatHoraNegocio(guia.horaSalida),
    "Días almacenados": guia.diasAlmacenamiento ?? "",
    "Precio ingreso salida": guia.precioIngresoSalida ?? "",
    "Cantidad de movimientos": guia.cantidadMovimientos ?? "",
    "Subtotal movimientos": guia.subtotalMovimientos ?? "",
    "Monto total": guia.montoTotal ?? "",
    Estado: guia.estado,
  }))
}
