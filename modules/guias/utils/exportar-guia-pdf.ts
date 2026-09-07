// modules/guias/utils/exportar-guia-pdf.ts

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { formatearHora } from "./formatear-hora"
import { formatearFecha } from "./formatear-fecha"
import type { GuiaConRelaciones } from "../components/guia-con-relaciones.type"

// ---------- Paleta KRENCO ----------
const COLOR_PRIMARIO: [number, number, number] = [15, 23, 42] // slate-900
const COLOR_ACENTO: [number, number, number] = [234, 88, 12] // orange-600
const COLOR_GRIS_TEXTO: [number, number, number] = [100, 116, 139] // slate-500
const COLOR_GRIS_CLARO: [number, number, number] = [241, 245, 249] // slate-100
const COLOR_BLANCO: [number, number, number] = [255, 255, 255]
const COLOR_VERDE: [number, number, number] = [22, 163, 74] // green-600
const COLOR_AMBAR: [number, number, number] = [217, 119, 6] // amber-600

function formatMoneda(valor: number | null | undefined) {
  if (valor === null || valor === undefined) return "—"
  return `S/ ${valor.toFixed(2)}`
}

const METODOS_PAGO: Record<string, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
  OTRO: "Otro",
}

const ESTADOS_GUIA: Record<string, string> = {
  EN_ALMACEN: "En almacén",
  DESPACHADO: "Despachado",
  PENDIENTE: "Pendiente",
}

export function exportarGuiaPDF(guia: GuiaConRelaciones) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 14
  let cursorY = 0

  // ================= ENCABEZADO =================
  doc.setFillColor(...COLOR_PRIMARIO)
  doc.rect(0, 0, pageWidth, 32, "F")

  // Franja de acento
  doc.setFillColor(...COLOR_ACENTO)
  doc.rect(0, 32, pageWidth, 1.5, "F")

  doc.setTextColor(...COLOR_BLANCO)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(20)
  doc.text("KRENCO", marginX, 14)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225) // slate-300
  doc.text("Almacén de Contenedores", marginX, 20)

  // Bloque derecho: número de guía + estado
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(...COLOR_BLANCO)
  doc.text(`GUÍA N.° ${guia.numeroGuia}`, pageWidth - marginX, 14, {
    align: "right",
  })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  const estadoLabel = ESTADOS_GUIA[guia.estado] ?? guia.estado
  doc.text(`Estado: ${estadoLabel}`, pageWidth - marginX, 20, {
    align: "right",
  })

  const fechaGeneracion = formatearFecha(new Date())
  doc.text(`Generado: ${fechaGeneracion}`, pageWidth - marginX, 25, {
    align: "right",
  })

  cursorY = 40

  // ================= HELPERS DE SECCIÓN =================
  function tituloSeccion(titulo: string) {
    doc.setFillColor(...COLOR_ACENTO)
    doc.rect(marginX, cursorY, 3, 4.5, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(...COLOR_PRIMARIO)
    doc.text(titulo, marginX + 6, cursorY + 3.8)

    cursorY += 8
  }

  function tablaDatos(filas: [string, string][]) {
    autoTable(doc, {
      startY: cursorY,
      pageBreak: "avoid",
      rowPageBreak: "avoid",
      margin: { left: marginX, right: marginX },
      body: filas,
      theme: "plain",
      styles: {
        fontSize: 8.5,
        cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
        textColor: [30, 41, 59],
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
          textColor: COLOR_GRIS_TEXTO,
          cellWidth: 55,
        },
        1: { cellWidth: "auto" },
      },
      alternateRowStyles: { fillColor: COLOR_GRIS_CLARO },
      didParseCell: (data) => {
        if (data.column.index === 1 && data.cell.raw === "—") {
          data.cell.styles.textColor = [148, 163, 184]
          data.cell.styles.fontStyle = "italic"
        }
      },
    })
    // @ts-expect-error - jspdf-autotable añade esta propiedad en runtime
    cursorY = doc.lastAutoTable.finalY + 8
  }

  function lineaSeparadora() {
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.line(marginX, cursorY - 4, pageWidth - marginX, cursorY - 4)
  }

  // ================= CLIENTE =================
  tituloSeccion("Datos del cliente")
  tablaDatos([
    [
      "Documento",
      guia.cliente
        ? `${guia.cliente.tipoDocumento} ${guia.cliente.numeroDocumento}`
        : "—",
    ],
    ["Nombre / Razón social", guia.cliente?.nombreCompleto ?? "—"],
  ])

  // ================= CONTENEDOR =================
  tituloSeccion("Contenedor")
  tablaDatos([
    ["Número", guia.contenedor.numeroContenedor],
    ["Marca", guia.contenedor.marca],
    ["Medida", `${guia.contenedor.medida} pies`],
    ["Tipo", guia.contenedor.tipo === "REEFER" ? "Reefer" : "Normal"],
  ])

  // ================= INGRESO =================
  tituloSeccion("Ingreso al almacén")
  tablaDatos([
    ["Fecha", formatearFecha(guia.fechaIngreso)],
    ["Hora", formatearHora(guia.horaIngreso)],
    ["Empresa de transporte", guia.empresaTransporteIngreso.nombre],
    ["Placa", guia.vehiculoIngreso.placa],
    ["Conductor", guia.conductorIngreso.nombreCompleto],
    ["Licencia", guia.conductorIngreso.numeroLicencia],
  ])

  // ================= SALIDA =================
  tituloSeccion("Salida del almacén")
  if (guia.fechaSalida) {
    tablaDatos([
      ["Fecha", formatearFecha(guia.fechaSalida)],
      ["Hora", guia.horaSalida ? formatearHora(guia.horaSalida) : "—"],
      ["Empresa de transporte", guia.empresaTransporteSalida?.nombre ?? "—"],
      ["Placa", guia.vehiculoSalida?.placa ?? "—"],
      ["Conductor", guia.conductorSalida?.nombreCompleto ?? "—"],
      ["Licencia", guia.conductorSalida?.numeroLicencia ?? "—"],
    ])
  } else {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(9.5)
    doc.setTextColor(...COLOR_GRIS_TEXTO)
    doc.text(
      "El contenedor aún no ha salido del almacén.",
      marginX,
      cursorY + 2
    )
    cursorY += 10
  }

  // ================= ALMACENAMIENTO Y PRECIO =================
  doc.addPage()
  cursorY = 20

  tituloSeccion("Almacenamiento y precio")

  const filasPrecio: [string, string][] = [
    ["Días de almacenamiento", String(guia.diasAlmacenamiento)],
    [
      "Tipo de precio",
      guia.tipoPrecio === "ESTANDAR"
        ? "Estándar"
        : guia.tipoPrecio === "PERSONALIZADO"
          ? "Personalizado"
          : "Espacio alquilado",
    ],
  ]

  if (guia.tipoPrecio === "ESPACIO_ALQUILADO") {
    filasPrecio.push(
      ["Precio ingreso / salida", formatMoneda(guia.precioIngresoSalida)],
      ["Cantidad de movimientos", String(guia.cantidadMovimientos ?? 0)],
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

  tablaDatos(filasPrecio)

  // Caja de Monto Total destacada
  doc.setFillColor(...COLOR_PRIMARIO)
  doc.roundedRect(marginX, cursorY, pageWidth - marginX * 2, 16, 2, 2, "F")
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(203, 213, 225)
  doc.text("MONTO TOTAL", marginX + 5, cursorY + 6.5)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(15)
  doc.setTextColor(...COLOR_BLANCO)
  doc.text(
    guia.montoTotal !== null && guia.montoTotal !== undefined
      ? formatMoneda(guia.montoTotal)
      : "Pendiente de calcular",
    pageWidth - marginX - 5,
    cursorY + 10,
    { align: "right" }
  )
  cursorY += 24

  // ================= PAGO =================
  tituloSeccion("Información de pago")

  const esPagado = guia.estadoPago === "PAGADO"

  autoTable(doc, {
    startY: cursorY,
    pageBreak: "avoid",
    rowPageBreak: "avoid",
    margin: { left: marginX, right: marginX },
    body: [
      ["Estado", esPagado ? "Pagado" : "Pendiente"],
      [
        "Método de pago",
        guia.metodoPago ? (METODOS_PAGO[guia.metodoPago] ?? "—") : "—",
      ],
      ["N.° de operación", guia.numeroOperacion ?? "—"],
      ["Fecha de pago", guia.fechaPago ? formatearFecha(guia.fechaPago) : "—"],
      ["Hora de pago", guia.horaPago ? formatearHora(guia.horaPago) : "—"],
    ],
    theme: "plain",
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: COLOR_GRIS_TEXTO, cellWidth: 55 },
      1: { cellWidth: "auto" },
    },
    alternateRowStyles: { fillColor: COLOR_GRIS_CLARO },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.row.index === 0) {
        data.cell.styles.fontStyle = "bold"
        data.cell.styles.textColor = esPagado ? COLOR_VERDE : COLOR_AMBAR
      }
    },
  })
  // @ts-expect-error - runtime prop
  cursorY = doc.lastAutoTable.finalY + 8

  // ================= OBSERVACIONES =================
  if (guia.observaciones) {
    tituloSeccion("Observaciones")
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9.5)
    doc.setTextColor(51, 65, 85)
    const lineas = doc.splitTextToSize(
      guia.observaciones,
      pageWidth - marginX * 2
    )
    doc.text(lineas, marginX, cursorY)
    cursorY += lineas.length * 4.5 + 6
  }

  // ================= PIE DE PÁGINA (todas las páginas) =================
  const totalPaginas = doc.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    const pageHeight = doc.internal.pageSize.getHeight()

    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageHeight - 14, pageWidth - marginX, pageHeight - 14)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_GRIS_TEXTO)
    doc.text(
      "KRENCO — Almacén de Contenedores · Documento generado automáticamente",
      marginX,
      pageHeight - 9
    )
    doc.text(
      `Página ${i} de ${totalPaginas}`,
      pageWidth - marginX,
      pageHeight - 9,
      { align: "right" }
    )
  }

  doc.save(`Guia-${guia.numeroGuia}-KRENCO.pdf`)
}
