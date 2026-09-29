// modules\liquidaciones\utils\excel.ts

import ExcelJS from "exceljs"
import { formatDate } from "@/lib/date/format"
import type { LiquidacionDetalle } from "../liquidacion.types"
import { calcularResumen } from "./resumen"

// ============================================================
// DISEÑO — mismos colores que el PDF (formato ARGB de ExcelJS)
// ============================================================

const COLORS = {
  navy: "FF1F3864", // #1F3864
  greyLight: "FFF2F4F7", // #F2F4F7
  line: "FFD0D5DD", // #D0D5DD
  text: "FF222222", // #222222
  muted: "FF667085", // #667085
  totalBg: "FFE4E9F2", // #E4E9F2
  white: "FFFFFFFF",
}

const ESTADO_LABEL: Record<LiquidacionDetalle["estado"], string> = {
  BORRADOR: "Borrador",
  CONFIRMADA: "Confirmada",
  PAGADA: "Pagada",
  ANULADA: "Anulada",
}

const ESTADO_COLOR: Record<LiquidacionDetalle["estado"], string> = {
  BORRADOR: COLORS.muted,
  CONFIRMADA: "FF2563EB",
  PAGADA: "FF16A34A",
  ANULADA: "FFDC2626",
}

const ALMACEN = "KRENCO"
const FONT = "Arial"
const FMT_MONEDA = '"S/ "#,##0.00'
const FMT_NUMERO = "#,##0.00"

type Align = "left" | "center" | "right"

const BORDE_TABLA: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: COLORS.line } },
  left: { style: "thin", color: { argb: COLORS.line } },
  bottom: { style: "thin", color: { argb: COLORS.line } },
  right: { style: "thin", color: { argb: COLORS.line } },
}

// ============================================================
// HELPERS DE FORMATO
// ============================================================

function formatFecha(fecha: string | Date | null | undefined): string {
  if (!fecha) return "-"
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return formatDate(d)
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

/** Título de sección con acento navy a la izquierda (igual que en el PDF). */
function dibujarTituloSeccion(
  ws: ExcelJS.Worksheet,
  row: number,
  texto: string
) {
  const cell = ws.getCell(row, 1)
  cell.value = texto
  cell.font = { name: FONT, size: 11, bold: true, color: { argb: COLORS.navy } }
  cell.alignment = { vertical: "middle", indent: 1 }
  cell.border = { left: { style: "thick", color: { argb: COLORS.navy } } }
  ws.getRow(row).height = 20
}

/** Línea navy bajo el encabezado de la hoja. */
function dibujarLineaNavy(
  ws: ExcelJS.Worksheet,
  row: number,
  columnas: number
) {
  for (let c = 1; c <= columnas; c++) {
    ws.getCell(row, c).border = {
      bottom: { style: "medium", color: { argb: COLORS.navy } },
    }
  }
}

function dibujarMarca(ws: ExcelJS.Worksheet) {
  const cell = ws.getCell(1, 1)
  cell.value = ALMACEN
  cell.font = { name: FONT, size: 9, bold: true, color: { argb: COLORS.muted } }
}

interface TablaOpts {
  aligns: Align[]
  boldCols?: number[] // índices 0-based
  numFmts?: Record<number, string> // índice 0-based -> formato
  fontSize?: number
  height?: number
}

/**
 * Dibuja una tabla con el estilo del PDF: cabecera navy, grilla,
 * filas alternadas. Devuelve la fila siguiente a la última fila de la tabla.
 */
function dibujarTabla(
  ws: ExcelJS.Worksheet,
  startRow: number,
  head: string[],
  body: (string | number)[][],
  opts: TablaOpts
): number {
  const {
    aligns,
    boldCols = [],
    numFmts = {},
    fontSize = 9,
    height = 20,
  } = opts

  // Cabecera
  const headRow = ws.getRow(startRow)
  headRow.height = height
  head.forEach((texto, i) => {
    const cell = headRow.getCell(i + 1)
    cell.value = texto
    cell.font = {
      name: FONT,
      size: fontSize,
      bold: true,
      color: { argb: COLORS.white },
    }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.navy },
    }
    cell.alignment = {
      vertical: "middle",
      horizontal: aligns[i],
      wrapText: true,
    }
    cell.border = BORDE_TABLA
  })

  // Cuerpo
  body.forEach((fila, r) => {
    const row = ws.getRow(startRow + 1 + r)
    row.height = height
    fila.forEach((valor, i) => {
      const cell = row.getCell(i + 1)
      cell.value = valor
      cell.font = {
        name: FONT,
        size: fontSize,
        bold: boldCols.includes(i),
        color: { argb: COLORS.text },
      }
      if (r % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLORS.greyLight },
        }
      }
      cell.alignment = {
        vertical: "middle",
        horizontal: aligns[i],
        wrapText: true,
      }
      cell.border = BORDE_TABLA
      if (typeof valor === "number" && numFmts[i]) cell.numFmt = numFmts[i]
    })
  })

  return startRow + body.length + 2
}

/** Resalta una fila completa como "Total a pagar". */
function resaltarFilaTotal(
  ws: ExcelJS.Worksheet,
  row: number,
  desdeCol: number,
  hastaCol: number
) {
  for (let c = desdeCol; c <= hastaCol; c++) {
    const cell = ws.getCell(row, c)
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.totalBg },
    }
    cell.font = {
      name: FONT,
      size: 11,
      bold: true,
      color: { argb: COLORS.navy },
    }
    cell.border = BORDE_TABLA
  }
}

function descargar(buffer: ArrayBuffer, nombre: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ============================================================
// HOJA 1 — Resumen
// ============================================================

function construirHojaResumen(wb: ExcelJS.Workbook, l: LiquidacionDetalle) {
  const r = calcularResumen(l)
  const ws = wb.addWorksheet("Resumen", {
    views: [{ showGridLines: false }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  })

  ws.columns = [{ width: 32 }, { width: 58 }, { width: 28 }, { width: 24 }]

  // Encabezado
  dibujarMarca(ws)

  const titulo = ws.getCell(2, 1)
  titulo.value = "Liquidación de guías de internamiento"
  titulo.font = {
    name: FONT,
    size: 18,
    bold: true,
    color: { argb: COLORS.navy },
  }
  titulo.alignment = { vertical: "middle" }
  ws.getRow(2).height = 30
  dibujarLineaNavy(ws, 2, 4)

  // Datos de la liquidación
  const etiqueta = (row: number, col: number, texto: string) => {
    const c = ws.getCell(row, col)
    c.value = texto
    c.font = { name: FONT, size: 9, bold: true, color: { argb: COLORS.muted } }
    c.alignment = { vertical: "middle" }
  }
  const valor = (row: number, col: number, texto: string, color?: string) => {
    const c = ws.getCell(row, col)
    c.value = texto
    c.font = {
      name: FONT,
      size: 9,
      bold: Boolean(color),
      color: { argb: color ?? COLORS.text },
    }
    c.alignment = { vertical: "middle", horizontal: "left" }
  }

  etiqueta(4, 1, "Liquidación N°:")
  valor(4, 2, l.numero)
  etiqueta(4, 3, "Fecha de corte:")
  valor(4, 4, formatFecha(l.fechaCorte))

  etiqueta(5, 1, "Cliente:")
  valor(5, 2, l.clienteNombre)
  etiqueta(5, 3, "Estado:")
  valor(5, 4, ESTADO_LABEL[l.estado], ESTADO_COLOR[l.estado])

  etiqueta(6, 1, "Documento:")
  valor(6, 2, l.clienteDocumento)

  // Resumen
  dibujarTituloSeccion(ws, 8, "Resumen de la liquidación")

  const periodo =
    r.fechaMin && r.fechaMax
      ? `${formatFecha(r.fechaMin)} - ${formatFecha(r.fechaMax)}`
      : "-"

  // Tabla 1: cifras clave
  const siguiente = dibujarTabla(
    ws,
    9,
    [
      "Servicios de ingreso/salida",
      "Movimientos adicionales",
      "Periodo de salidas",
      "Total a pagar",
    ],
    [
      [
        `${r.cantidadSalidas} contenedores retirados`,
        `${r.cantidadMovimientos} movimientos`,
        periodo,
        r.total,
      ],
    ],
    {
      aligns: ["left", "left", "left", "right"],
      boldCols: [3],
      numFmts: { 3: FMT_MONEDA },
      fontSize: 10,
      height: 26,
    }
  )
  // Total a pagar en navy dentro de la tabla 1
  ws.getCell(10, 4).font = {
    name: FONT,
    size: 10,
    bold: true,
    color: { argb: COLORS.navy },
  }

  // Tabla 2: desglose del cobro
  const inicioTabla2 = siguiente + 1
  const finTabla2 = dibujarTabla(
    ws,
    inicioTabla2,
    ["Concepto", "Detalle", "Cantidad", "Importe"],
    [
      [
        "Servicios de ingreso y salida",
        "Cobro por el ingreso y la salida de cada contenedor retirado",
        r.cantidadSalidas,
        r.montoPorSalidas,
      ],
      [
        "Movimientos adicionales",
        "Movimientos realizados por el almacén para retirar los contenedores",
        r.cantidadMovimientos,
        r.montoPorMovimientos,
      ],
      ["Total a pagar", "", "", r.total],
    ],
    {
      aligns: ["left", "left", "center", "right"],
      boldCols: [0, 3],
      numFmts: { 3: FMT_MONEDA },
      fontSize: 9,
      height: 22,
    }
  )
  resaltarFilaTotal(ws, finTabla2 - 1, 1, 4)
  ws.getCell(finTabla2 - 1, 4).numFmt = FMT_MONEDA
  ws.getCell(finTabla2 - 1, 4).alignment = {
    vertical: "middle",
    horizontal: "right",
  }
  ws.getRow(finTabla2 - 1).height = 26
}

// ============================================================
// HOJA 2 — Detalle de guías
// ============================================================

function construirHojaDetalle(wb: ExcelJS.Workbook, l: LiquidacionDetalle) {
  const HEADER_ROW = 4
  const COLS = 10

  const ws = wb.addWorksheet("Detalle", {
    views: [{ showGridLines: false, state: "frozen", ySplit: HEADER_ROW }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      printTitlesRow: `${HEADER_ROW}:${HEADER_ROW}`,
    },
  })

  ws.columns = [
    { width: 16 }, // N° Guía
    { width: 22 }, // Contenedor
    { width: 10 }, // Medida
    { width: 10 }, // Tipo
    { width: 13 }, // F. Ingreso
    { width: 13 }, // F. Salida
    { width: 14 }, // P. Ing/Sal
    { width: 9 }, // Movs
    { width: 17 }, // Subtotal movs
    { width: 16 }, // Monto guía
  ]

  dibujarMarca(ws)

  dibujarTituloSeccion(ws, 2, "Detalle de guías")
  const info = ws.getCell(2, COLS)
  info.value = `Liquidación N° ${l.numero}  |  ${l.clienteNombre}`
  info.font = { name: FONT, size: 9, color: { argb: COLORS.muted } }
  info.alignment = { vertical: "middle", horizontal: "right" }
  dibujarLineaNavy(ws, 2, COLS)

  const body = l.detalles.map((d) => [
    d.numeroGuia,
    formatContenedor(d.marcaContenedor, d.numeroContenedor),
    `${d.medidaContenedor}'`,
    d.tipoContenedor,
    formatFecha(d.fechaIngreso),
    formatFecha(d.fechaSalida),
    d.precioIngresoSalida ?? "-",
    d.cantidadMovimientos ?? "-",
    d.subtotalMovimientos ?? "-",
    d.montoTotalGuia,
  ])

  const siguiente = dibujarTabla(
    ws,
    HEADER_ROW,
    [
      "N° Guía",
      "Contenedor",
      "Medida",
      "Tipo",
      "F. Ingreso",
      "F. Salida",
      "P. Ing/Sal",
      "Movs",
      "Subtotal movs",
      "Monto guía",
    ],
    body,
    {
      aligns: [
        "left",
        "left",
        "left",
        "left",
        "left",
        "left",
        "right",
        "center",
        "right",
        "right",
      ],
      boldCols: [1, 9],
      numFmts: { 6: FMT_NUMERO, 8: FMT_NUMERO, 9: FMT_NUMERO },
      fontSize: 9,
      height: 20,
    }
  )

  // Caja de total al cierre de la tabla (sin subtotal ni IGV)
  const totalRow = siguiente + 1
  const label = ws.getCell(totalRow, COLS - 1)
  label.value = "Total a pagar"
  const monto = ws.getCell(totalRow, COLS)
  monto.value = l.montoTotal
  resaltarFilaTotal(ws, totalRow, COLS - 1, COLS)
  label.alignment = { vertical: "middle", horizontal: "left" }
  monto.alignment = { vertical: "middle", horizontal: "right" }
  monto.numFmt = FMT_MONEDA
  ws.getRow(totalRow).height = 24
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================

export async function exportLiquidacionToExcel(l: LiquidacionDetalle) {
  const wb = new ExcelJS.Workbook()
  wb.creator = ALMACEN
  wb.created = new Date()

  construirHojaResumen(wb, l)
  construirHojaDetalle(wb, l)

  const buffer = await wb.xlsx.writeBuffer()
  descargar(buffer as ArrayBuffer, `liquidacion-${l.numero}.xlsx`)
}
