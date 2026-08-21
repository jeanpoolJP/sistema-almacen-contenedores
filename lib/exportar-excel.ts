// lib/exportar-excel.ts

import * as XLSX from "xlsx";

type ExportarExcelOptions = {
  datos: Record<string, unknown>[];
  nombreArchivo: string;
  nombreHoja?: string;
};

export function exportarExcel({
  datos,
  nombreArchivo,
  nombreHoja = "Datos",
}: ExportarExcelOptions) {
  if (datos.length === 0) {
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(datos);

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    nombreHoja,
  );

  XLSX.writeFile(
    workbook,
    `${nombreArchivo}.xlsx`,
  );
}