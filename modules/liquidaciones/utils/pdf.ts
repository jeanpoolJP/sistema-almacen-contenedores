// modules\liquidaciones\utils\pdf.ts

import jsPDF from "jspdf"
import autoTable, { type UserOptions } from "jspdf-autotable"
import type { LiquidacionDetalle } from "../liquidacion.types"
import { formatDate } from "@/lib/date/format"
import { calcularResumen } from "./resumen"

// ============================================================
// DISEÑO — mismos colores y patrón visual del resto de reportes
// ============================================================

/**
 * Tupla mutable [r, g, b]. jsPDF y jspdf-autotable exigen arrays mutables
 * (no `readonly`), así que NO se usa `as const` en ningún color.
 */
type RGB = [number, number, number]

const COLORS: Record<
  "navy" | "greyLight" | "line" | "text" | "muted" | "totalBg" | "white",
  RGB
> = {
  navy: [31, 56, 100], // #1F3864
  greyLight: [242, 244, 247], // #F2F4F7
  line: [208, 213, 221], // #D0D5DD
  text: [34, 34, 34], // #222222
  muted: [102, 112, 133], // #667085
  totalBg: [228, 233, 242], // #E4E9F2
  white: [255, 255, 255],
}

const ESTADO_LABEL: Record<LiquidacionDetalle["estado"], string> = {
  BORRADOR: "Borrador",
  CONFIRMADA: "Confirmada",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
}

const ESTADO_COLOR: Record<LiquidacionDetalle["estado"], RGB> = {
  BORRADOR: COLORS.muted,
  CONFIRMADA: [37, 99, 235],
  PAGADA: [22, 163, 74],
  ANULADA: [220, 38, 38],
}

const ALMACEN = "KRENCO"
const MARGIN = 14

/** Estilo común de todas las tablas del PDF (resumen y detalle). */
const TABLE_STYLE: Pick<
  UserOptions,
  "theme" | "styles" | "headStyles" | "alternateRowStyles"
> = {
  theme: "grid",
  styles: {
    fontSize: 8,
    textColor: COLORS.text,
    lineColor: COLORS.line,
    lineWidth: 0.2,
    cellPadding: 3,
  },
  headStyles: {
    fillColor: COLORS.navy,
    textColor: COLORS.white,
    fontStyle: "bold",
    halign: "left",
  },
  alternateRowStyles: {
    fillColor: COLORS.greyLight,
  },
}

// ============================================================
// HELPERS DE FORMATO
// ============================================================

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "-"
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return formatDate(d)
}

function formatNumero(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "-"
  return new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)
}

function formatMoneda(valor: number): string {
  return `S/ ${formatNumero(valor)}`
}

/** Concatena marca + número de contenedor en un solo campo, con fallback. */
function formatContenedor(marca: string, numero: string): string {
  const m = marca?.trim()
  const n = numero?.trim()

  if (m && n) return `${m}${n}`
  if (m && !n) return `${m} S/N`
  if (!m && n) return `S/M ${n}`
  return "S/M S/N"
}

// ============================================================
// HELPERS DE LAYOUT
// ============================================================

/** Título de sección con un pequeño acento navy, consistente en todo el PDF. */
function dibujarTituloSeccion(doc: jsPDF, texto: string, x: number, y: number) {
  doc.setFillColor(...COLORS.navy)
  doc.rect(x, y - 3.2, 2.4, 3.2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.navy)
  doc.text(texto, x + 5, y)
}

/** Devuelve la posición Y donde terminó la última tabla dibujada con autoTable. */
function getFinalY(doc: jsPDF): number {
  return (
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 0
  )
}

// ============================================================
// PÁGINA 1 — Portada + resumen ejecutivo
// ============================================================

function dibujarEncabezado(doc: jsPDF, l: LiquidacionDetalle): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text(ALMACEN, MARGIN, 16)

  doc.setFontSize(18)
  doc.setTextColor(...COLORS.navy)
  doc.text("Liquidación de guías de internamiento", MARGIN, 25)

  doc.setDrawColor(...COLORS.navy)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, 29, pageWidth - MARGIN, 29)

  const labelX1 = MARGIN
  const valueX1 = MARGIN + 32
  const labelX2 = pageWidth / 2 + 10
  const valueX2 = labelX2 + 32
  let y = 37

  const filaInfo = (
    label: string,
    valor: string,
    labelX: number,
    valueX: number,
    fy: number
  ) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...COLORS.muted)
    doc.text(label, labelX, fy)

    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.text)
    doc.text(valor, valueX, fy)
  }

  filaInfo("Liquidación N°:", l.numero, labelX1, valueX1, y)
  filaInfo("Fecha de corte:", formatFecha(l.fechaCorte), labelX2, valueX2, y)

  y += 6
  filaInfo("Cliente:", l.clienteNombre, labelX1, valueX1, y)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text("Estado:", labelX2, y)
  doc.setTextColor(...ESTADO_COLOR[l.estado])
  doc.text(ESTADO_LABEL[l.estado], valueX2, y)

  y += 6
  filaInfo("Documento:", l.clienteDocumento, labelX1, valueX1, y)

  return y + 10 // y de inicio para lo que siga
}

/**
 * Resumen del corte en dos tablas a ancho completo (mismo estilo que el detalle):
 * 1) cifras clave: cuántos servicios, cuántos movimientos, periodo y total.
 * 2) desglose del cobro: servicios de ingreso/salida vs. movimientos adicionales.
 */
function dibujarResumenEjecutivo(
  doc: jsPDF,
  l: LiquidacionDetalle,
  startY: number
): number {
  const resumen = calcularResumen(l)
  const totalMovimientos = l.detalles.reduce(
    (acc, d) => acc + (d.cantidadMovimientos ?? 0),
    0
  )
  const periodo =
    resumen.fechaMin && resumen.fechaMax
      ? `${formatFecha(resumen.fechaMin)} - ${formatFecha(resumen.fechaMax)}`
      : "-"

  dibujarTituloSeccion(doc, "Resumen de la liquidación", MARGIN, startY)

  // --- Tabla 1: cifras clave ---
  autoTable(doc, {
    startY: startY + 5,
    margin: { left: MARGIN, right: MARGIN },
    head: [
      [
        "Servicios de ingreso/salida",
        "Movimientos adicionales",
        "Periodo de salidas",
        "Total a pagar",
      ],
    ],
    body: [
      [
        `${resumen.cantidadSalidas} contenedores retirados`,
        `${totalMovimientos} movimientos`,
        periodo,
        formatMoneda(resumen.total),
      ],
    ],
    ...TABLE_STYLE,
    styles: { ...TABLE_STYLE.styles, fontSize: 10, cellPadding: 4 },
    columnStyles: {
      3: { halign: "right", fontStyle: "bold", textColor: COLORS.navy },
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index === 3) {
        data.cell.styles.halign = "right"
      }
    },
  })

  // --- Tabla 2: desglose del cobro ---
  autoTable(doc, {
    startY: getFinalY(doc) + 8,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Concepto", "Detalle", "Cantidad", "Importe"]],
    body: [
      [
        "Servicios de ingreso y salida",
        "Cobro por el ingreso y la salida de cada contenedor retirado",
        String(resumen.cantidadSalidas),
        formatMoneda(resumen.montoPorSalidas),
      ],
      [
        "Movimientos adicionales",
        "Movimientos realizados por el almacén para retirar los contenedores",
        String(totalMovimientos),
        formatMoneda(resumen.montoPorMovimientos),
      ],
      ["Total a pagar", "", "", formatMoneda(resumen.total)],
    ],
    ...TABLE_STYLE,
    styles: { ...TABLE_STYLE.styles, fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: "bold" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 45, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "head") {
        if (data.column.index === 2) data.cell.styles.halign = "center"
        if (data.column.index === 3) data.cell.styles.halign = "right"
      }
      // Última fila: Total a pagar resaltado
      if (data.section === "body" && data.row.index === 2) {
        data.cell.styles.fillColor = COLORS.totalBg
        data.cell.styles.textColor = COLORS.navy
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.fontSize = 11
      }
    },
  })

  return getFinalY(doc) + 10
}

// ============================================================
// PÁGINA 2+ — Detalle de guías
// ============================================================

/** Encabezado corto para la(s) página(s) de detalle: no repite todo lo de la portada. */
function dibujarEncabezadoDetalle(doc: jsPDF, l: LiquidacionDetalle): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text(ALMACEN, MARGIN, 16)

  dibujarTituloSeccion(doc, "Detalle de guías", MARGIN, 25)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text(
    `Liquidación N° ${l.numero}  |  ${l.clienteNombre}`,
    pageWidth - MARGIN,
    25,
    { align: "right" }
  )

  doc.setDrawColor(...COLORS.navy)
  doc.setLineWidth(0.6)
  doc.line(MARGIN, 29, pageWidth - MARGIN, 29)

  return 37
}

function dibujarTablaDetalle(
  doc: jsPDF,
  l: LiquidacionDetalle,
  startY: number
) {
  autoTable(doc, {
    startY,
    margin: { left: MARGIN, right: MARGIN },
    head: [
      [
        "N° Guía",
        "Contenedor",
        "Medida",
        "Tipo",
        "F. Ingreso",
        "F. Salida",
        "Días", // ← NUEVO
        "P. Ing/Sal",
        "Movs",
        "Subtotal movs",
        "Monto guía",
      ],
    ],
    body: l.detalles.map((d) => [
      d.numeroGuia,
      formatContenedor(d.marcaContenedor, d.numeroContenedor),
      `${d.medidaContenedor}'`,
      d.tipoContenedor,
      formatFecha(d.fechaIngreso),
      formatFecha(d.fechaSalida),
      d.diasAlmacenamiento ?? "-", // ← NUEVO
      d.precioIngresoSalida !== null && d.precioIngresoSalida !== undefined
        ? formatNumero(d.precioIngresoSalida)
        : "-",
      d.cantidadMovimientos ?? "-",
      d.subtotalMovimientos !== null && d.subtotalMovimientos !== undefined
        ? formatNumero(d.subtotalMovimientos)
        : "-",
      formatNumero(d.montoTotalGuia),
    ]),
    ...TABLE_STYLE,
    columnStyles: {
      1: { fontStyle: "bold" }, // Contenedor
      6: { halign: "center" }, // Días            ← NUEVO (era 6=P.Ing/Sal; ahora 6=Días)
      7: { halign: "right" }, // P. Ing/Sal      ← antes 6
      8: { halign: "center" }, // Movs            ← antes 7
      9: { halign: "right" }, // Subtotal movs   ← antes 8
      10: { halign: "right", fontStyle: "bold" }, // Monto guía ← antes 9
    },
    didDrawPage: (data) => {
      dibujarPiePagina(doc, data.pageNumber)
    },
  })
}

/** Caja de total al cierre de la tabla, sin subtotal ni desglose de IGV. */
function dibujarCajaTotal(doc: jsPDF, l: LiquidacionDetalle) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const finalY = getFinalY(doc) + 10

  const boxWidth = 70
  const boxX = pageWidth - MARGIN - boxWidth
  const boxHeight = 12

  doc.setFillColor(...COLORS.totalBg)
  doc.roundedRect(boxX, finalY, boxWidth, boxHeight, 2, 2, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.navy)
  doc.text("Total a pagar", boxX + 6, finalY + 7.8)
  doc.text(formatMoneda(l.montoTotal), boxX + boxWidth - 6, finalY + 7.8, {
    align: "right",
  })
}

function dibujarPiePagina(doc: jsPDF, pagina: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const y = pageHeight - 10

  doc.setDrawColor(...COLORS.line)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, y - 4, pageWidth - MARGIN, y - 4)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.text(`${ALMACEN} | Liquidación de guías de internamiento`, MARGIN, y)
  doc.text(`Página ${pagina}`, pageWidth - MARGIN, y, { align: "right" })
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================

export function exportLiquidacionToPDF(l: LiquidacionDetalle) {
  const doc = new jsPDF({ orientation: "landscape" })

  // Página 1: portada + resumen ejecutivo
  const startY = dibujarEncabezado(doc, l)
  dibujarResumenEjecutivo(doc, l, startY)
  dibujarPiePagina(doc, 1)

  // Página 2+: detalle de guías
  doc.addPage()
  const startTablaY = dibujarEncabezadoDetalle(doc, l)
  dibujarTablaDetalle(doc, l, startTablaY)
  dibujarCajaTotal(doc, l)

  doc.save(`liquidacion-${l.numero}.pdf`)
}
