// modules\empresas-transporte\empresa-transporte.actions.ts

"use server"

import {
  actualizarEmpresaTransporteSchema,
  cambiarEstadoEmpresaTransporteSchema,
  empresaTransporteSchema,
} from "./empresa-transporte.schema"

import {
  actualizarEmpresaTransporteService,
  cambiarEstadoEmpresaTransporteService,
  crearEmpresaTransporteService,
  obtenerEmpresaTransportePorIdService,
  obtenerEmpresasTransporteService,
  contarEmpresasTransporteService,
} from "./empresa-transporte.service"

export async function crearEmpresaTransporteAction(data: unknown) {
  const resultado = empresaTransporteSchema.safeParse(data)

  if (!resultado.success) {
    return {
      success: false,
      message: "Los datos ingresados no son válidos",
      errors: resultado.error.flatten().fieldErrors,
    }
  }

  try {
    const empresa = await crearEmpresaTransporteService(resultado.data)

    return {
      success: true,
      message: "Empresa de transporte registrada correctamente",
      data: empresa,
    }
  } catch (error) {
    console.error("Error al crear empresa de transporte:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo registrar la empresa de transporte",
    }
  }
}

/**
 * ============================================================
 * LISTAR EMPRESAS DE TRANSPORTE
 * ============================================================
 */
export async function obtenerEmpresasTransporteAction(
  page: number = 1,
  pageSize: number = 10
) {
  try {
    const [empresas, total] = await Promise.all([
      obtenerEmpresasTransporteService(page, pageSize),
      contarEmpresasTransporteService(),
    ])

    const totalPages = Math.ceil(total / pageSize)

    return {
      success: true,

      data: {
        data: empresas,
        total,
        page,
        pageSize,
        totalPages,
      },
    }
  } catch (error) {
    console.error("Error al obtener empresas de transporte:", error)

    return {
      success: false,

      message: "No se pudieron obtener las empresas de transporte",

      data: {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      },
    }
  }
}

export async function obtenerEmpresaTransportePorIdAction(id: number) {
  try {
    const empresa = await obtenerEmpresaTransportePorIdService(id)

    return {
      success: true,
      data: empresa,
    }
  } catch (error) {
    console.error("Error al obtener empresa de transporte:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo obtener la empresa de transporte",
    }
  }
}

export async function actualizarEmpresaTransporteAction(data: unknown) {
  const resultado = actualizarEmpresaTransporteSchema.safeParse(data)

  if (!resultado.success) {
    return {
      success: false,
      message: "Los datos ingresados no son válidos",
      errors: resultado.error.flatten().fieldErrors,
    }
  }

  try {
    const empresa = await actualizarEmpresaTransporteService(resultado.data)

    return {
      success: true,
      message: "Empresa de transporte actualizada correctamente",
      data: empresa,
    }
  } catch (error) {
    console.error("Error al actualizar empresa de transporte:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la empresa de transporte",
    }
  }
}

export async function cambiarEstadoEmpresaTransporteAction(data: unknown) {
  const resultado = cambiarEstadoEmpresaTransporteSchema.safeParse(data)

  if (!resultado.success) {
    return {
      success: false,
      message: "Los datos ingresados no son válidos",
      errors: resultado.error.flatten().fieldErrors,
    }
  }

  try {
    const empresa = await cambiarEstadoEmpresaTransporteService(
      resultado.data.id,
      resultado.data.activo
    )

    return {
      success: true,
      message: resultado.data.activo
        ? "Empresa de transporte activada correctamente"
        : "Empresa de transporte desactivada correctamente",
      data: empresa,
    }
  } catch (error) {
    console.error("Error al cambiar estado de empresa de transporte:", error)

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado de la empresa",
    }
  }
}
