// modules\guias\guia.actions.ts

"use server"

import {
  crearGuiaService,
  registrarSalidaGuiaService,
  obtenerGuiaPorIdService,
  obtenerGuiaPorNumeroService,
  obtenerGuiasService,
  obtenerGuiasEspacioAlquiladoService,
  anularGuiaService,
  registrarPagoGuiaService,
  asignarClienteMasivoService,
} from "./guia.service"

import type { CrearGuiaInput, RegistrarSalidaGuiaInput } from "./guia.types"

import type {
  EstadoGuia,
  EstadoPago,
  TratamientoIGV,
} from "@/lib/generated/prisma"

import { registrarPagoGuiaSchema } from "./guia.schema"

/**
 * ============================================================
 * CREAR GUÍA
 * ============================================================
 *
 * Server Action utilizada por el formulario
 * de registro de una nueva guía.
 */
export async function crearGuiaAction(data: CrearGuiaInput) {
  try {
    const guia = await crearGuiaService(data)

    return {
      success: true,
      data: guia,
      message: "La guía se registró correctamente",
    }
  } catch (error) {
    console.error("Error al crear guía:", error)

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar la guía",
    }
  }
}

/**
 * ============================================================
 * REGISTRAR SALIDA
 * ============================================================
 *
 * Server Action utilizada cuando el contenedor
 * sale del almacén.
 */
export async function registrarSalidaGuiaAction(
  data: RegistrarSalidaGuiaInput
) {
  try {
    const guia = await registrarSalidaGuiaService(data)

    return {
      success: true,
      data: guia,
      message: "La salida del contenedor se registró correctamente",
    }
  } catch (error) {
    console.error("Error al registrar salida:", error)

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar la salida",
    }
  }
}

/**
 * ============================================================
 * OBTENER GUÍA POR ID
 * ============================================================
 */
export async function obtenerGuiaPorIdAction(id: number) {
  try {
    const guia = await obtenerGuiaPorIdService(id)

    if (!guia) {
      return {
        success: false,
        data: null,
        message: "La guía no existe",
      }
    }

    return {
      success: true,
      data: guia,
      message: null,
    }
  } catch (error) {
    console.error("Error al obtener guía por ID:", error)

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener la guía",
    }
  }
}

/**
 * ============================================================
 * OBTENER GUÍA POR NÚMERO
 * ============================================================
 */
export async function obtenerGuiaPorNumeroAction(numeroGuia: string) {
  try {
    const guia = await obtenerGuiaPorNumeroService(numeroGuia)

    if (!guia) {
      return {
        success: false,
        data: null,
        message: "No se encontró una guía con ese número",
      }
    }

    return {
      success: true,
      data: guia,
      message: null,
    }
  } catch (error) {
    console.error("Error al obtener guía:", error)

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener la guía",
    }
  }
}

/**
 * ============================================================
 * OBTENER TODAS LAS GUÍAS
 * ============================================================
 */
type ObtenerGuiasActionParams = {
  pagina?: number
  limite?: number

  numeroGuia?: string
  numeroContenedor?: string
  documentoCliente?: string

  sinCliente?: boolean

  estado?: EstadoGuia
  estadoPago?: EstadoPago
  tratamientoIGV?: TratamientoIGV

  fechaDesde?: Date
  fechaHasta?: Date
}

export async function obtenerGuiasAction({
  pagina = 1,
  limite = 10,

  numeroGuia,
  numeroContenedor,
  documentoCliente,
  sinCliente,

  estado,
  estadoPago,
  tratamientoIGV,

  fechaDesde,
  fechaHasta,
}: ObtenerGuiasActionParams = {}) {
  try {
    const resultado = await obtenerGuiasService({
      pagina,
      limite,

      numeroGuia,
      numeroContenedor,
      documentoCliente,
      sinCliente,

      estado,
      estadoPago,
      tratamientoIGV,

      fechaDesde,
      fechaHasta,
    })

    return {
      success: true,
      data: resultado,
      message: null,
    }
  } catch (error) {
    console.error("Error al obtener guías:", error)

    return {
      success: false,

      data: {
        guias: [],
        total: 0,
        pagina,
        limite,
        totalPaginas: 0,
      },

      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener las guías",
    }
  }
}

/**
 * ============================================================
 * REGISTRAR PAGO DE GUÍA
 * ============================================================
 */
export async function registrarPagoGuiaAction(data: unknown) {
  try {
    const datosValidados = registrarPagoGuiaSchema.parse(data)

    await registrarPagoGuiaService(datosValidados)

    return {
      success: true,
      message: "Pago registrado correctamente",
    }
  } catch (error) {
    console.error("Error al registrar pago:", error)

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "No se pudo registrar el pago",
    }
  }
}

/**
 * ============================================================
 * ANULAR GUÍA
 * ============================================================
 */
export async function anularGuiaAction(id: number) {
  try {
    const guia = await anularGuiaService(id)

    return {
      success: true,
      data: guia,
      message: "La guía se anuló correctamente",
    }
  } catch (error) {
    console.error("Error al anular guía:", error)

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al anular la guía",
    }
  }
}

type AsignarClienteMasivoInput = {
  guiaIds: number[]
  clienteId: number
}

export async function obtenerGuiasEspacioAlquiladoAction() {
  try {
    const guias = await obtenerGuiasEspacioAlquiladoService()

    return {
      success: true,
      data: guias,
      message: null,
    }
  } catch (error) {
    console.error("Error al obtener guías de espacio alquilado:", error)

    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "No se pudieron obtener las guías de espacio alquilado.",
    }
  }
}

export async function asignarClienteMasivoAction({
  guiaIds,
  clienteId,
}: AsignarClienteMasivoInput) {
  try {
    if (!Array.isArray(guiaIds) || guiaIds.length === 0) {
      return {
        success: false,
        message: "Debes seleccionar al menos una guía.",
      }
    }

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      return {
        success: false,
        message: "El cliente seleccionado no es válido.",
      }
    }

    const resultado = await asignarClienteMasivoService({
      guiaIds,
      clienteId,
    })

    return {
      success: true,
      message: `Cliente asignado correctamente a ${resultado.cantidadActualizada} guía${
        resultado.cantidadActualizada === 1 ? "" : "s"
      }.`,
      data: resultado,
    }
  } catch (error) {
    console.error("Error en asignarClienteMasivoAction:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al asignar el cliente a las guías.",
    }
  }
}
