// modules/guias/utils/exportar-guia-pdf.ts

import jsPDF from "jspdf"
import autoTable, { type CellHookData } from "jspdf-autotable"

import { formatearHora } from "./formatear-hora"
import { formatearFecha } from "./formatear-fecha"
import type { GuiaConRelaciones } from "../components/guia-con-relaciones.type"

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
  | "amber",
  RGB
> = {
  brand: [19, 136, 48], // #138830
  brandSoft: [231, 244, 235],
  black: [20, 20, 20],
  greyLight: [245, 246, 247],
  line: [215, 219, 224],
  text: [34, 34, 34],
  muted: [102, 112, 133],
  amber: [217, 119, 6],
}

const MARGIN = 14
const GAP = 6
const FOOTER_Y_OFFSET = 10

// Logo: public/krenco-logo-nombre-transparente.png (689 x 227 px)
const LOGO_PATH = "/krenco-logo-nombre-transparente.png"
const LOGO_RATIO = 689 / 227

const METODOS_PAGO: Record<string, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
}

const ESTADOS_GUIA: Record<string, string> = {
  ALMACENADO: "Almacenado",
  RETIRADO: "Retirado",
  ANULADO: "Anulado",
}

const ESTADO_GUIA_COLOR: Record<string, RGB> = {
  ALMACENADO: COLORS.brand,
  RETIRADO: COLORS.black,
  ANULADO: [220, 38, 38],
}

type Fila = [string, string]

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
    logoCache = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
    return logoCache
  } catch {
    return null
  }
}

// ============================================================
// HELPERS
// ============================================================

function formatMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—"
  return `S/ ${valor.toFixed(2)}`
}

function getFinalY(doc: jsPDF): number {
  return (
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
      ?.finalY ?? 0
  )
}

function tituloSeccion(doc: jsPDF, texto: string, x: number, y: number) {
  doc.setFillColor(...COLORS.brand)
  doc.rect(x, y - 3.4, 2, 3.4, "F")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9.5)
  doc.setTextColor(...COLORS.black)
  doc.text(texto, x + 4.5, y)
}

/** Dibuja título + tabla de datos (etiqueta / valor) y devuelve la Y final. */
function bloque(
  doc: jsPDF,
  titulo: string,
  filas: Fila[],
  x: number,
  y: number,
  w: number,
  onCell?: (data: CellHookData) => void
): number {
  const pageWidth = doc.internal.pageSize.getWidth()
  tituloSeccion(doc, titulo, x, y)

  autoTable(doc, {
    startY: y + 2.5,
    margin: { left: x, right: pageWidth - x - w },
    tableWidth: w,
    body: filas,
    theme: "plain",
    styles: {
      fontSize: 8,
      cellPadding: { top: 1.4, bottom: 1.4, left: 2, right: 2 },
      textColor: COLORS.text,
      lineColor: COLORS.line,
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: COLORS.muted, cellWidth: 33 },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: COLORS.greyLight },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.cell.raw === "—") {
        data.cell.styles.textColor = [148, 163, 184]
        data.cell.styles.fontStyle = "italic"
      }
      onCell?.(data)
    },
  })

  return getFinalY(doc)
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================

export async function exportarGuiaPDF(guia: GuiaConRelaciones) {
  const logo = await cargarLogo()
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const colW = (pageWidth - MARGIN * 2 - GAP) / 2
  const xL = MARGIN
  const xR = MARGIN + colW + GAP

  // ---------------- ENCABEZADO ----------------
  if (logo) {
    const logoW = 52
    doc.addImage(logo, "PNG", MARGIN, 9, logoW, logoW / LOGO_RATIO)
  } else {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.setTextColor(...COLORS.brand)
    doc.text("KRENCO", MARGIN, 20)
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.text("GUÍA DE INTERNAMIENTO", pageWidth - MARGIN, 13, { align: "right" })

  doc.setFontSize(18)
  doc.setTextColor(...COLORS.brand)
  doc.text(guia.numeroGuia, pageWidth - MARGIN, 21.5, { align: "right" })

  doc.setFontSize(8)
  doc.setTextColor(...(ESTADO_GUIA_COLOR[guia.estado] ?? COLORS.text))
  doc.text(
    `Estado: ${ESTADOS_GUIA[guia.estado] ?? guia.estado}`,
    pageWidth - MARGIN,
    27,
    { align: "right" }
  )

  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.muted)
  doc.text(`Generado: ${formatearFecha(new Date())}`, pageWidth - MARGIN, 31, {
    align: "right",
  })

  doc.setDrawColor(...COLORS.brand)
  doc.setLineWidth(0.8)
  doc.line(MARGIN, 34, pageWidth - MARGIN, 34)

  let y = 44

  // ---------------- FILA 1: CONTENEDOR | CLIENTE ----------------
  const cargaLabel =
    guia.cargaContenedor === "LLENO"
      ? "Lleno"
      : guia.cargaContenedor === "VACIO"
        ? "Vacío"
        : "—"

  const yContenedor = bloque(
    doc,
    "Contenedor",
    [
      ["Número", guia.contenedor.numeroContenedor],
      ["Marca", guia.contenedor.marca],
      ["Medida", `${guia.contenedor.medida} pies`],
      ["Tipo", guia.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"],
      ["Estado de carga", cargaLabel],
    ],
    xL,
    y,
    colW
  )

  const yCliente = bloque(
    doc,
    "Cliente",
    [
      [
        "Documento",
        guia.cliente
          ? `${guia.cliente.tipoDocumento} ${guia.cliente.numeroDocumento}`
          : "—",
      ],
      ["Nombre / Razón social", guia.cliente?.nombreCompleto ?? "—"],
    ],
    xR,
    y,
    colW
  )

  y = Math.max(yContenedor, yCliente) + 9

  // ---------------- FILA 2: INGRESO | SALIDA ----------------
  const yIngreso = bloque(
    doc,
    "Ingreso al almacén",
    [
      ["Fecha", formatearFecha(guia.fechaIngreso)],
      ["Hora", formatearHora(guia.horaIngreso)],
      ["Empresa de transporte", guia.empresaTransporteIngreso.nombre],
      ["Placa", guia.vehiculoIngreso.placa],
      ["Conductor", guia.conductorIngreso.nombreCompleto],
      ["Licencia", guia.conductorIngreso.numeroLicencia],
    ],
    xL,
    y,
    colW
  )

  const salidaFilas: Fila[] = guia.fechaSalida
    ? [
        ["Fecha", formatearFecha(guia.fechaSalida)],
        ["Hora", guia.horaSalida ? formatearHora(guia.horaSalida) : "—"],
        ["Empresa de transporte", guia.empresaTransporteSalida?.nombre ?? "—"],
        ["Placa", guia.vehiculoSalida?.placa ?? "—"],
        ["Conductor", guia.conductorSalida?.nombreCompleto ?? "—"],
        ["Licencia", guia.conductorSalida?.numeroLicencia ?? "—"],
      ]
    : [
        ["Fecha", "—"],
        ["Hora", "—"],
        ["Empresa de transporte", "—"],
        ["Placa", "—"],
        ["Conductor", "—"],
        ["Licencia", "—"],
      ]

  const ySalida = bloque(doc, "Salida del almacén", salidaFilas, xR, y, colW)

  y = Math.max(yIngreso, ySalida) + 9

  // ---------------- FILA 3: PRECIO | PAGO ----------------
  const tipoPrecioLabel =
    guia.tipoPrecio === "ESTANDAR"
      ? "Estándar"
      : guia.tipoPrecio === "PERSONALIZADO"
        ? "Personalizado"
        : "Espacio alquilado"

  const filasPrecio: Fila[] = [
    [
      "Días de almacenamiento",
      guia.diasAlmacenamiento !== null && guia.diasAlmacenamiento !== undefined
        ? String(guia.diasAlmacenamiento)
        : "—",
    ],
    ["Tipo de precio", tipoPrecioLabel],
  ]

  if (guia.tipoPrecio === "ESPACIO_ALQUILADO") {
    filasPrecio.push(
      ["Precio ingreso / salida", formatMoneda(guia.precioIngresoSalida)],
      ["Cant. de movimientos", String(guia.cantidadMovimientos ?? 0)],
      ["Precio por movimiento", formatMoneda(guia.precioMovimiento)],
      ["Subtotal movimientos", formatMoneda(guia.subtotalMovimientos)]
    )
  } else {
    filasPrecio.push(
      ["Precio primer día", formatMoneda(guia.precioPrimerDia)],
      ["Precio día adicional", formatMoneda(guia.precioDiaAdicional)]
    )
  }

  filasPrecio.push(["Subtotal", formatMoneda(guia.subtotal)])
  filasPrecio.push([
    guia.tratamientoIGV === "CON_IGV"
      ? `IGV (${guia.porcentajeIGV ?? 18}%)`
      : "IGV",
    guia.tratamientoIGV === "CON_IGV"
      ? formatMoneda(guia.montoIGV)
      : "No incluye",
  ])

  const yPrecio = bloque(
    doc,
    "Almacenamiento y precio",
    filasPrecio,
    xL,
    y,
    colW
  )

  const esPagado = guia.estadoPago === "PAGADO"
  const yPago = bloque(
    doc,
    "Información de pago",
    [
      ["Estado", esPagado ? "Pagado" : "Pendiente"],
      [
        "Método de pago",
        guia.metodoPago ? (METODOS_PAGO[guia.metodoPago] ?? "—") : "—",
      ],
      ["N.° de operación", guia.numeroOperacion ?? "—"],
      ["Fecha de pago", guia.fechaPago ? formatearFecha(guia.fechaPago) : "—"],
      ["Hora de pago", guia.horaPago ? formatearHora(guia.horaPago) : "—"],
    ],
    xR,
    y,
    colW,
    (data) => {
      if (data.column.index === 1 && data.row.index === 0) {
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.textColor = esPagado ? COLORS.brand : COLORS.amber
      }
    }
  )

  y = Math.max(yPrecio, yPago) + 8

  // ---------------- MONTO TOTAL ----------------
  const boxH = 15
  doc.setFillColor(...COLORS.brandSoft)
  doc.rect(MARGIN, y, pageWidth - MARGIN * 2, boxH, "F")
  doc.setFillColor(...COLORS.brand)
  doc.rect(MARGIN, y, 1.8, boxH, "F")

  const textY = y + boxH / 2 + 1.6
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(...COLORS.black)
  doc.text("MONTO TOTAL", MARGIN + 8, textY)

  doc.setFontSize(15)
  doc.setTextColor(...COLORS.brand)
  doc.text(
    guia.montoTotal !== null && guia.montoTotal !== undefined
      ? formatMoneda(guia.montoTotal)
      : "Pendiente de calcular",
    pageWidth - MARGIN - 6,
    textY,
    { align: "right" }
  )

  y += boxH + 9

  // ---------------- OBSERVACIONES ----------------
  if (guia.observaciones) {
    tituloSeccion(doc, "Observaciones", MARGIN, y)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8.5)
    doc.setTextColor(...COLORS.text)

    const MAX_LINEAS = 5
    let lineas = doc.splitTextToSize(
      guia.observaciones,
      pageWidth - MARGIN * 2
    ) as string[]
    if (lineas.length > MAX_LINEAS) {
      lineas = lineas.slice(0, MAX_LINEAS)
      lineas[MAX_LINEAS - 1] =
        lineas[MAX_LINEAS - 1].replace(/\s*\S*$/, "") + "…"
    }
    doc.text(lineas, MARGIN, y + 6)
  }

  // ---------------- PIE DE PÁGINA ----------------
  const footerY = pageHeight - FOOTER_Y_OFFSET
  doc.setDrawColor(...COLORS.brand)
  doc.setLineWidth(0.4)
  doc.line(MARGIN, footerY - 4, pageWidth - MARGIN, footerY - 4)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(...COLORS.muted)
  doc.text(
    "KRENCO | Almacén de contenedores · Documento generado automáticamente",
    MARGIN,
    footerY
  )
  doc.text(`Guía ${guia.numeroGuia}`, pageWidth - MARGIN, footerY, {
    align: "right",
  })

  doc.save(`Guia-${guia.numeroGuia}-KRENCO.pdf`)
}
