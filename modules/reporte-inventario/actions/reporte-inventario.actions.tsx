// modules/reporte-inventario/actions/reporte-inventario.actions.tsx

"use server"

import { renderToBuffer } from "@react-pdf/renderer"
import { generarReporteInventarioSchema } from "../schema/reporte-inventario.schema"
import { reporteInventarioService } from "../service/reporte-inventario.service"
import { ReporteInventarioPdf } from "../components/reporte-inventario-pdf"
import type {
  ActionResult,
  ClienteOption,
} from "../types/reporte-inventario.types"

/**
 * Clientes disponibles para el selector del formulario.
 */
export async function obtenerClientesParaReporte(): Promise<
  ActionResult<ClienteOption[]>
> {
  try {
    const clientes = await reporteInventarioService.listarClientesDisponibles()
    return { success: true, data: clientes }
  } catch (error) {
    console.error("[obtenerClientesParaReporte]", error)
    return { success: false, error: "No se pudo obtener la lista de clientes." }
  }
}

/**
 * Genera el PDF de inventario de un cliente y lo devuelve en base64
 * para que el cliente (navegador) lo descargue.
 */
export async function generarReporteInventarioPdf(
  input: unknown
): Promise<ActionResult<{ archivoBase64: string; nombreArchivo: string }>> {
  const parsed = generarReporteInventarioSchema.safeParse(input)

  if (!parsed.success) {
    return {
      success: false,
      // Cambiado de parsed.error.errors a parsed.error.issues
      error: parsed.error.issues[0]?.message ?? "Datos inválidos.",
    }
  }

  try {
    const data = await reporteInventarioService.construirReporte(
      parsed.data.clienteId
    )

    if (data.totalContenedores === 0) {
      return {
        success: false,
        error: "El cliente no tiene contenedores almacenados actualmente.",
      }
    }

    const buffer = await renderToBuffer(<ReporteInventarioPdf data={data} />)
    const fecha = new Date().toISOString().slice(0, 10)
    const nombreArchivo = `Inventario_${data.cliente.nombre.replace(
      /\s+/g,
      "_"
    )}_${fecha}.pdf`

    return {
      success: true,
      data: {
        archivoBase64: buffer.toString("base64"),
        nombreArchivo,
      },
    }
  } catch (error) {
    console.error("[generarReporteInventarioPdf]", error)
    const mensaje =
      error instanceof Error ? error.message : "No se pudo generar el reporte."
    return { success: false, error: mensaje }
  }
}
