// modules/guias/guia.lookup.actions.ts

"use server"

/**
 * Ajusta este import a la instancia singleton de Prisma que uses
 * en el proyecto (p. ej. "@/lib/prisma" o "@/lib/db").
 */
import { prisma } from "@/lib/prisma"

/**
 * ============================================================
 * BUSCAR CLIENTE POR DOCUMENTO
 * ============================================================
 *
 * Se usa en el formulario de creación de guía: al perder el foco
 * el campo "número de documento", el formulario llama a esta acción
 * para saber si el cliente ya existe y, de ser así, autocompletar
 * su nombre.
 */
export async function buscarClientePorDocumentoAction(numeroDocumento: string) {
  try {
    const numero = numeroDocumento.trim()

    if (!numero) {
      return { success: true, encontrado: false, data: null }
    }

    const cliente = await prisma.cliente.findUnique({
      where: { numeroDocumento: numero },
      select: {
        id: true,
        tipoDocumento: true,
        numeroDocumento: true,
        nombreCompleto: true,
      },
    })

    return {
      success: true,
      encontrado: !!cliente,
      data: cliente,
    }
  } catch (error) {
    console.error("Error al buscar cliente:", error)
    return {
      success: false,
      encontrado: false,
      data: null,
      message: "No se pudo buscar el cliente",
    }
  }
}

/**
 * ============================================================
 * BUSCAR CONTENEDOR POR NÚMERO
 * ============================================================
 *
 * Se usa en el formulario de creación de guía: al perder el foco
 * el campo "número de contenedor", el formulario llama a esta
 * acción para autocompletar marca, medida y tipo si ya existe.
 */
export async function buscarContenedorPorNumeroAction(
  numeroContenedor: string
) {
  try {
    const numero = numeroContenedor.trim().toUpperCase()

    if (!numero) {
      return { success: true, encontrado: false, data: null }
    }

    const contenedor = await prisma.contenedor.findUnique({
      where: { numeroContenedor: numero },
      select: {
        id: true,
        numeroContenedor: true,
        marca: true,
        medida: true,
        tipo: true,
      },
    })

    return {
      success: true,
      encontrado: !!contenedor,
      data: contenedor,
    }
  } catch (error) {
    console.error("Error al buscar contenedor:", error)
    return {
      success: false,
      encontrado: false,
      data: null,
      message: "No se pudo buscar el contenedor",
    }
  }
}

// modules/guias/guia.lookup.actions.ts

/**
 * ============================================================
 * BUSCAR EMPRESA DE TRANSPORTE POR NOMBRE
 * ============================================================
 *
 * Se usa en el formulario de creación de guía.
 * Al perder el foco del campo "empresa de transporte",
 * busca si ya existe y devuelve sus datos.
 */
export async function buscarEmpresaTransportePorNombreAction(nombre: string) {
  try {
    const nombreLimpio = nombre.trim()

    if (!nombreLimpio) {
      return {
        success: true,
        encontrado: false,
        data: null,
      }
    }

    const empresa = await prisma.empresaTransporte.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        nombre: true,
        ruc: true,
        telefono: true,
      },
    })

    return {
      success: true,
      encontrado: !!empresa,
      data: empresa,
    }
  } catch (error) {
    console.error("Error al buscar empresa de transporte:", error)

    return {
      success: false,
      encontrado: false,
      data: null,
      message: "No se pudo buscar la empresa de transporte",
    }
  }
}

// ============================================================
// BUSCAR VEHÍCULO POR PLACA
// ============================================================

export async function buscarVehiculoPorPlacaAction(
  placa: string,
) {
  try {
    const placaLimpia = placa.trim().toUpperCase()

    if (!placaLimpia) {
      return {
        success: true,
        encontrado: false,
        data: null,
      }
    }

    const vehiculo =
      await prisma.vehiculo.findUnique({
        where: {
          placa: placaLimpia,
        },
        select: {
          id: true,
          placa: true,
        },
      })

    return {
      success: true,
      encontrado: !!vehiculo,
      data: vehiculo,
    }
  } catch (error) {
    console.error(
      "Error al buscar vehículo:",
      error,
    )

    return {
      success: false,
      encontrado: false,
      data: null,
      message:
        "No se pudo buscar el vehículo",
    }
  }
}


// ============================================================
// BUSCAR CONDUCTOR POR LICENCIA
// ============================================================

export async function buscarConductorPorLicenciaAction(
  numeroLicencia: string,
) {
  try {
    const licencia =
      numeroLicencia.trim()

    if (!licencia) {
      return {
        success: true,
        encontrado: false,
        data: null,
      }
    }

    const conductor =
      await prisma.conductor.findUnique({
        where: {
          numeroLicencia: licencia,
        },
        select: {
          id: true,
          numeroLicencia: true,
          nombreCompleto: true,
        },
      })

    return {
      success: true,
      encontrado: !!conductor,
      data: conductor,
    }
  } catch (error) {
    console.error(
      "Error al buscar conductor:",
      error,
    )

    return {
      success: false,
      encontrado: false,
      data: null,
      message:
        "No se pudo buscar el conductor",
    }
  }
}