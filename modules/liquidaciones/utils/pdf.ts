// modules\liquidaciones\utils\pdf.ts

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { LiquidacionDetalle } from "../liquidacion.types"

export function exportLiquidacionToPDF(l: LiquidacionDetalle) {
  const doc = new jsPDF({ orientation: "landscape" })

  doc.setFontSize(16)
  doc.text("KRENCO - Liquidación de Guías de Internamiento", 14, 15)
  doc.setFontSize(10)
  doc.text(`Liquidación N°: ${l.numero}`, 14, 23)
  doc.text(`Cliente: ${l.clienteNombre} - ${l.clienteDocumento}`, 14, 29)
  doc.text(
    `Fecha de corte: ${new Date(l.fechaCorte).toLocaleDateString("es-PE")}`,
    14,
    35
  )
  doc.text(`Estado: ${l.estado}`, 14, 41)

  autoTable(doc, {
    startY: 48,
    head: [
      [
        "N° Guía",
        "Marca",
        "N° Contenedor",
        "Medida",
        "Tipo",
        "F. Ingreso",
        "F. Salida",
        "P. Ing/Sal",
        "Movs",
        "Subtotal movs",
        "Monto guía",
      ],
    ],
    body: l.detalles.map((d) => [
      d.numeroGuia,
      d.marcaContenedor,
      d.numeroContenedor,
      d.medidaContenedor,
      d.tipoContenedor,
      new Date(d.fechaIngreso).toLocaleDateString("es-PE"),
      d.fechaSalida ? new Date(d.fechaSalida).toLocaleDateString("es-PE") : "-",
      d.precioIngresoSalida?.toFixed(2) ?? "-",
      d.cantidadMovimientos ?? "-",
      d.subtotalMovimientos?.toFixed(2) ?? "-",
      d.montoTotalGuia.toFixed(2),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 58, 138] },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(10)
  doc.text(`Subtotal: S/ ${l.subtotal.toFixed(2)}`, 200, finalY)
  doc.text(
    `IGV (${l.porcentajeIGV}%): S/ ${l.montoIGV.toFixed(2)}`,
    200,
    finalY + 6
  )
  doc.setFontSize(12)
  doc.text(`TOTAL: S/ ${l.montoTotal.toFixed(2)}`, 200, finalY + 14)

  doc.save(`liquidacion-${l.numero}.pdf`)
}
