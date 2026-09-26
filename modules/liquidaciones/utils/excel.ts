// modules\liquidaciones\utils\excel.ts

import * as XLSX from "xlsx"
import type { LiquidacionDetalle } from "../liquidacion.types"

export function exportLiquidacionToExcel(l: LiquidacionDetalle) {
  const rows = l.detalles.map((d) => ({
    "N° Guía": d.numeroGuia,
    Marca: d.marcaContenedor,
    "N° Contenedor": d.numeroContenedor,
    Medida: d.medidaContenedor,
    Tipo: d.tipoContenedor,
    "F. Ingreso": new Date(d.fechaIngreso).toLocaleDateString("es-PE"),
    "F. Salida": d.fechaSalida
      ? new Date(d.fechaSalida).toLocaleDateString("es-PE")
      : "-",
    "P. Ing/Sal": d.precioIngresoSalida ?? "",
    Movs: d.cantidadMovimientos ?? "",
    "Subtotal movs": d.subtotalMovimientos ?? "",
    "Monto guía": d.montoTotalGuia,
  }))

  rows.push({
    "N° Guía": "",
    Marca: "",
    "N° Contenedor": "",
    Medida: "" as any,
    Tipo: "" as any,
    "F. Ingreso": "",
    "F. Salida": "",
    "P. Ing/Sal": "" as any,
    Movs: "" as any,
    "Subtotal movs": "Subtotal",
    "Monto guía": l.subtotal,
  } as any)

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Liquidación")
  XLSX.writeFile(wb, `liquidacion-${l.numero}.xlsx`)
}
