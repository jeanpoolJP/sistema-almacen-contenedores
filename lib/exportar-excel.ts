// lib/exportar-excel.ts

import * as XLSX from "xlsx"

type ExportarExcelOptions = {
  datos: Record<string, unknown>[]
  nombreArchivo: string
  nombreHoja?: string
  titulo?: string
  subtitulo?: string
  anchos?: number[]
}

export function exportarExcel({
  datos,
  nombreArchivo,
  nombreHoja = "Datos",
  titulo,
  subtitulo,
  anchos,
}: ExportarExcelOptions) {
  if (datos.length === 0) {
    return
  }

  const tieneCabeceraReporte = Boolean(titulo)
  const filaCabecera = tieneCabeceraReporte ? 3 : 0
  const worksheet = XLSX.utils.aoa_to_sheet([])

  XLSX.utils.sheet_add_json(worksheet, datos, {
    origin: filaCabecera,
  })
  const rango = XLSX.utils.decode_range(worksheet["!ref"] ?? "A1")
  const ultimaColumna = XLSX.utils.encode_col(rango.e.c)
  const primeraFilaDatos = filaCabecera + 1

  if (tieneCabeceraReporte) {
    XLSX.utils.sheet_add_aoa(worksheet, [[titulo], [subtitulo ?? ""]], {
      origin: "A1",
    })

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: rango.e.c } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: rango.e.c } },
    ]
  }

  worksheet["!autofilter"] = {
    ref: `${tieneCabeceraReporte ? "A4" : "A1"}:${ultimaColumna}${rango.e.r + 1}`,
  }

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: primeraFilaDatos,
  }

  worksheet["!cols"] = (anchos ?? []).map((wch) => ({ wch }))

  const estiloCabecera = {
    fill: { fgColor: { rgb: "1F4E78" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      bottom: { style: "medium", color: { rgb: "163A5C" } },
    },
  }

  if (tieneCabeceraReporte) {
    const tituloCelda = worksheet.A1
    const subtituloCelda = worksheet.A2

    if (tituloCelda) {
      tituloCelda.s = {
        fill: { fgColor: { rgb: "163A5C" } },
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 16 },
        alignment: { horizontal: "left", vertical: "center" },
      }
    }

    if (subtituloCelda) {
      subtituloCelda.s = {
        fill: { fgColor: { rgb: "DCE6F1" } },
        font: { italic: true, color: { rgb: "365F91" } },
        alignment: { horizontal: "left", vertical: "center" },
      }
    }
  }

  for (let columna = rango.s.c; columna <= rango.e.c; columna += 1) {
    const celda =
      worksheet[
        XLSX.utils.encode_cell({
          r: filaCabecera,
          c: columna,
        })
      ]

    if (celda) {
      celda.s = estiloCabecera
    }
  }

  const encabezados = datos.length > 0 ? Object.keys(datos[0]) : []
  const columnasMoneda = new Set([
    "Precio ingreso salida",
    "Subtotal movimientos",
    "Monto total",
  ])

  for (let fila = primeraFilaDatos; fila <= rango.e.r; fila += 1) {
    for (let columna = rango.s.c; columna <= rango.e.c; columna += 1) {
      const celda = worksheet[XLSX.utils.encode_cell({ r: fila, c: columna })]

      if (celda) {
        celda.s = {
          fill: {
            fgColor: { rgb: fila % 2 === 0 ? "F4F7FA" : "FFFFFF" },
          },
          alignment: { vertical: "center", wrapText: true },
        }

        const encabezado = encabezados[columna]

        if (columnasMoneda.has(encabezado) && typeof celda.v === "number") {
          celda.z = '"S/ "#,##0.00'
        }

        if (encabezado === "Estado") {
          const color = celda.v === "ALMACENADO" ? "E2F0D9" : "FCE4D6"

          celda.s = {
            ...celda.s,
            fill: { fgColor: { rgb: color } },
            font: { bold: true, color: { rgb: "365F41" } },
            alignment: { horizontal: "center", vertical: "center" },
          }
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja)

  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`, { cellStyles: true })
}
