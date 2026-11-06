// modules\liquidaciones\utils\pdf.ts

import jsPDF from "jspdf"
import autoTable, { type UserOptions } from "jspdf-autotable"
import type { LiquidacionDetalle } from "../liquidacion.types"
import { formatDate } from "@/lib/date/format"
import { calcularResumen } from "./resumen"

// ============================================================
// DISEÑO — identidad KRENCO: negro + verde #138830
// ============================================================

type RGB = [number, number, number]

const COLORS: Record<
  | "brand"
  | "brandSoft"
  | "black"
  | "greyLight"
  | "line"
  | "text"
  | "muted"
  | "white",
  RGB
> = {
  brand: [19, 136, 48], // #138830 (verde del logo)
  brandSoft: [231, 244, 235], // verde muy claro para totales
  black: [20, 20, 20], // negro del logo
  greyLight: [245, 246, 247],
  line: [215, 219, 224],
  text: [34, 34, 34],
  muted: [102, 112, 133],
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
  PAGADA: COLORS.brand,
  ANULADA: [220, 38, 38],
}

const ALMACEN = "KRENCO"
const MARGIN = 14

/** Zona reservada al pie de página (línea + texto). */
const FOOTER_RESERVED = 20

// Logo: public/krenco-logo-nombre-transparente.png (689 x 227 px)
const LOGO_PATH = "/krenco-logo-nombre-transparente.png"
const LOGO_RATIO = 689 / 227

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
    fillColor: COLORS.black,
    textColor: COLORS.white,
    fontStyle: "bold",
    halign: "left",
  },
  alternateRowStyles: {
    fillColor: COLORS.greyLight,
  },
}

// ============================================================
// LOGO
// ============================================================

let logoCache: string | null = null

async function cargarLogo(): Promise<string | null> {
  if (logoCache) return logoCache
  try {
    const res = await fetch(LOGO_PATH)
    if (!res.ok) return null
    const blob = await res.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
    logoCache = dataUrl
    return dataUrl
  } catch {
    return null
  }
}

/** Dibuja el logo con ancho fijo (alto proporcional). Fallback: texto. */
function dibujarLogo(
  doc: jsPDF,
  logo: string | null,
  x: number,
  y: number,
  width: number
) {
  if (logo) {
    doc.addImage(logo, "PNG", x, y, width, width / LOGO_RATIO)
    return
  }
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...COLORS.brand)
  doc.text(ALMACEN, x, y + 8)
}

// ============================================================
// HELPERS DE FORMATO
// ============================================================

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "-"
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return formatDate(d)
}

/** Fecha y hora en una sola línea: "dd/mm/yyyy HH:mm". */
function formatFechaHora(
  fecha: string | Date | null | undefined,
  hora: string | null | undefined
): string {
  const f = formatFecha(fecha)
  if (f === "-") return "-"
  return hora ? `${f} ${hora}` : f
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

function dibujarTituloSeccion(doc: jsPDF, texto: string, x: number, y: number) {
  doc.setFillColor(...COLORS.brand)
  doc.rect(x, y - 3.4, 2, 3.4, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.black)
  doc.text(texto, x + 4.5, y)
}

function getFinalY(doc: jsPDF): number {
  return (
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 0
  )
}

// ============================================================
// PÁGINA 1 — Portada + resumen ejecutivo
// ============================================================

function dibujarEncabezado(
  doc: jsPDF,
  l: LiquidacionDetalle,
  logo: string | null
): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Logo a la izquierda
  dibujarLogo(doc, logo, MARGIN, 10, 52)

  // Título y número a la derecha
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.muted)
  doc.text("LIQUIDACIÓN DE GUÍAS DE INTERNAMIENTO", pageWidth - MARGIN, 14, {
    align: "right",
  })

  doc.setFontSize(20)
  doc.setTextColor(...COLORS.brand)
  doc.text(l.numero, pageWidth - MARGIN, 24, { align: "right" })

  // Línea de marca
  doc.setDrawColor(...COLORS.brand)
  doc.setLineWidth(0.8)
  doc.line(MARGIN, 30, pageWidth - MARGIN, 30)

  // Caja de información
  const boxY = 36
  const boxH = 22
  doc.setFillColor(...COLORS.greyLight)
  doc.rect(MARGIN, boxY, pageWidth - MARGIN * 2, boxH, "F")
  doc.setFillColor(...COLORS.brand)
  doc.rect(MARGIN, boxY, 1.6, boxH, "F")

  const campo = (
    label: string,
    valor: string,
    x: number,
    maxW: number,
    color: RGB = COLORS.text
  ) => {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(...COLORS.muted)
    doc.text(label.toUpperCase(), x, boxY + 7)

    doc.setFontSize(10)
    doc.setTextColor(...color)
    doc.text(doc.splitTextToSize(valor, maxW), x, boxY + 14)
  }

  campo("Cliente", l.clienteNombre || "-", MARGIN + 8, 100)
  campo("Documento", l.clienteDocumento || "-", MARGIN + 115, 50)
  campo("Fecha de corte", formatFecha(l.fechaCorte), MARGIN + 170, 45)
  campo(
    "Estado",
    ESTADO_LABEL[l.estado],
    MARGIN + 225,
    35,
    ESTADO_COLOR[l.estado]
  )

  return boxY + boxH + 12
}

/** Nota con la regla de cobro del almacenamiento. */
function dibujarNotaReglaNegocio(doc: jsPDF, startY: number): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  const boxW = pageWidth - MARGIN * 2
  const textX = MARGIN + 8
  const textW = boxW - 14

  const titulo = "Condiciones de cobro del almacenamiento"
  const parrafos = [
    "El precio de subida y bajada incluye el primer día de almacenamiento del contenedor.",
    "El tiempo de almacenamiento se contabiliza por periodos completos de 24 horas, contados desde la fecha y hora exactas de ingreso. Superado el primer periodo de 24 horas, se considera un día adicional de almacenamiento, y así sucesivamente por cada nuevo periodo iniciado.",
  ]

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  const lineas = parrafos.map((p) => doc.splitTextToSize(p, textW) as string[])
  const totalLineas = lineas.reduce((acc, l) => acc + l.length, 0)

  const lineH = 4.2
  const boxH = 6 + 5 + totalLineas * lineH + (parrafos.length - 1) * 1.5 + 3

  doc.setFillColor(...COLORS.greyLight)
  doc.rect(MARGIN, startY, boxW, boxH, "F")
  doc.setFillColor(...COLORS.brand)
  doc.rect(MARGIN, startY, 1.6, boxH, "F")

  let y = startY + 6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(...COLORS.brand)
  doc.text(titulo.toUpperCase(), textX, y)

  y += 5
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.text)
  for (const bloque of lineas) {
    for (const linea of bloque) {
      doc.text(linea, textX, y)
      y += lineH
    }
    y += 1.5
  }

  return startY + boxH + 8
}

function dibujarResumenEjecutivo(
  doc: jsPDF,
  l: LiquidacionDetalle,
  startY: number
): number {
  const resumen = calcularResumen(l)
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
      ["Servicios de subida y bajada", "Periodo de salidas", "Total a pagar"],
    ],
    body: [
      [
        `${resumen.cantidadSalidas} contenedores retirados`,
        periodo,
        formatMoneda(resumen.total),
      ],
    ],
    ...TABLE_STYLE,
    styles: { ...TABLE_STYLE.styles, fontSize: 10, cellPadding: 4 },
    columnStyles: {
      2: { halign: "right", fontStyle: "bold", textColor: COLORS.brand },
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index === 2) {
        data.cell.styles.halign = "right"
      }
    },
  })

  // --- Tabla 2: desglose del cobro ---
  autoTable(doc, {
    startY: getFinalY(doc) + 8,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Concepto", "Detalle", "Cantidad", "Precio", "Importe"]],
    body: [
      [
        "Servicios de subida y bajada",
        "Cobro por la subida y bajada de cada contenedor retirado (equivale al precio del primer día).",
        String(resumen.cantidadSalidas),
        formatMoneda(resumen.precioPromedioSubidaBajada),
        formatMoneda(resumen.montoPorSubidaBajada),
      ],
      [
        "Días adicionales de almacenamiento",
        "Días de almacenamiento posteriores al primer día.",
        String(resumen.totalDiasAdicionales),
        formatMoneda(resumen.precioPromedioDiaAdicional),
        formatMoneda(resumen.montoPorDiasAdicionales),
      ],
      ["Total a pagar", "", "", "", formatMoneda(resumen.total)],
    ],
    ...TABLE_STYLE,
    styles: { ...TABLE_STYLE.styles, fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: "bold" },
      2: { cellWidth: 25, halign: "center" },
      3: { cellWidth: 35, halign: "right" },
      4: { cellWidth: 40, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "head") {
        if (data.column.index === 2) data.cell.styles.halign = "center"
        if (data.column.index >= 3) data.cell.styles.halign = "right"
      }
      if (data.section === "body" && data.row.index === 2) {
        data.cell.styles.fillColor = COLORS.brandSoft
        data.cell.styles.textColor = COLORS.brand
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.fontSize = 11
      }
    },
  })

  return dibujarNotaReglaNegocio(doc, getFinalY(doc) + 8)
}

// ============================================================
// PÁGINA 2+ — Detalle de guías
// ============================================================

function dibujarEncabezadoDetalle(
  doc: jsPDF,
  l: LiquidacionDetalle,
  logo: string | null
): number {
  const pageWidth = doc.internal.pageSize.getWidth()

  dibujarLogo(doc, logo, MARGIN, 9, 38)

  doc.setFont("helvetica", "bold")
  doc.setFontSize(12)
  doc.setTextColor(...COLORS.black)
  doc.text("Detalle de guías", pageWidth - MARGIN, 15, { align: "right" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.muted)
  doc.text(
    `Liquidación N° ${l.numero}  |  ${l.clienteNombre}`,
    pageWidth - MARGIN,
    21,
    { align: "right" }
  )

  doc.setDrawColor(...COLORS.brand)
  doc.setLineWidth(0.8)
  doc.line(MARGIN, 27, pageWidth - MARGIN, 27)

  return 34
}

function dibujarTablaDetalle(
  doc: jsPDF,
  l: LiquidacionDetalle,
  startY: number
) {
  autoTable(doc, {
    startY,
    margin: { left: MARGIN, right: MARGIN, bottom: FOOTER_RESERVED },
    head: [
      [
        "N° Guía",
        "Contenedor",
        "Medida",
        "Tipo",
        "Ingreso",
        "Salida",
        "Días",
        "P. Sub/Baj",
        "P. días adic.",
        "Monto guía",
      ],
    ],
    body: l.detalles.map((d) => [
      d.numeroGuia,
      formatContenedor(d.marcaContenedor, d.numeroContenedor),
      `${d.medidaContenedor}'`,
      d.tipoContenedor,
      formatFechaHora(d.fechaIngreso, d.horaIngreso),
      formatFechaHora(d.fechaSalida, d.horaSalida),
      d.diasAlmacenamiento ?? "-",
      formatNumero(d.precioPrimerDia),
      formatNumero(d.subtotalDiasAdicionales),
      formatNumero(d.montoTotalGuia),
    ]),
    ...TABLE_STYLE,
    columnStyles: {
      1: { fontStyle: "bold" },
      4: { cellWidth: "wrap" }, // Ingreso: fecha + hora en una línea
      5: { cellWidth: "wrap" }, // Salida: fecha + hora en una línea
      6: { halign: "center" },
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right", fontStyle: "bold" },
    },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index >= 6) {
        data.cell.styles.halign = data.column.index === 6 ? "center" : "right"
      }
    },
    didDrawPage: (data) => {
      dibujarPiePagina(doc, data.pageNumber)
    },
  })
}

function dibujarCajaTotal(doc: jsPDF, l: LiquidacionDetalle) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const boxWidth = 85
  const boxHeight = 14
  const boxX = pageWidth - MARGIN - boxWidth
  let boxY = getFinalY(doc) + 8

  // Si no cabe sobre el pie de página, pasa a una página nueva
  if (boxY + boxHeight > pageHeight - FOOTER_RESERVED) {
    doc.addPage()
    dibujarPiePagina(doc, doc.getNumberOfPages())
    boxY = MARGIN + 6
  }

  doc.setFillColor(...COLORS.brandSoft)
  doc.rect(boxX, boxY, boxWidth, boxHeight, "F")
  doc.setFillColor(...COLORS.brand)
  doc.rect(boxX, boxY, 1.6, boxHeight, "F")

  const textY = boxY + boxHeight / 2 + 1.4 // centrado vertical

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(...COLORS.black)
  doc.text("Total a pagar", boxX + 7, textY)
  doc.setTextColor(...COLORS.brand)
  doc.text(formatMoneda(l.montoTotal), boxX + boxWidth - 6, textY, {
    align: "right",
  })
}

function dibujarPiePagina(doc: jsPDF, pagina: number) {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const y = pageHeight - 10

  doc.setDrawColor(...COLORS.brand)
  doc.setLineWidth(0.4)
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

export async function exportLiquidacionToPDF(l: LiquidacionDetalle) {
  const logo = await cargarLogo()
  const doc = new jsPDF({ orientation: "landscape" })

  // Página 1: portada + resumen ejecutivo
  const startY = dibujarEncabezado(doc, l, logo)
  dibujarResumenEjecutivo(doc, l, startY)
  dibujarPiePagina(doc, 1)

  // Página 2+: detalle de guías
  doc.addPage()
  const startTablaY = dibujarEncabezadoDetalle(doc, l, logo)
  dibujarTablaDetalle(doc, l, startTablaY)
  dibujarCajaTotal(doc, l)

  doc.save(`liquidacion-${l.numero}.pdf`)
}
