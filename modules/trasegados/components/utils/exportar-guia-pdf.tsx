// modules\trasegados\components\utils\exportar-guia-pdf.ts

"use client"

import { pdf } from "@react-pdf/renderer"

import { DetalleGuiaPDFDocument } from "../detalle-guia/detalle-pdf-document"
import type { GuiaTrasegadoDetalle } from "../../types/guia-trasegado-detalle.types"

/**
 * Genera el PDF de una guía de trasegado y dispara su descarga.
 *
 * El nombre del archivo se construye con el número de guía
 * para que el usuario lo identifique fácilmente.
 */
export async function exportarGuiaTrasegadoPDF(
  guia: GuiaTrasegadoDetalle
): Promise<void> {
  const blob = await pdf(<DetalleGuiaPDFDocument guia={guia} />).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `guia-trasegado-${guia.numeroGuia}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
