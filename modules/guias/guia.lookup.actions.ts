// modules/guias/guia.lookup.actions.ts

"use server";

/**
 * Ajusta este import a la instancia singleton de Prisma que uses
 * en el proyecto (p. ej. "@/lib/prisma" o "@/lib/db").
 */
import { prisma } from "@/lib/prisma";

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
export async function buscarClientePorDocumentoAction(
  numeroDocumento: string,
) {
  try {
    const numero = numeroDocumento.trim();

    if (!numero) {
      return { success: true, encontrado: false, data: null };
    }

    const cliente = await prisma.cliente.findUnique({
      where: { numeroDocumento: numero },
      select: {
        id: true,
        tipoDocumento: true,
        numeroDocumento: true,
        nombreCompleto: true,
      },
    });

    return {
      success: true,
      encontrado: !!cliente,
      data: cliente,
    };
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    return {
      success: false,
      encontrado: false,
      data: null,
      message: "No se pudo buscar el cliente",
    };
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
  numeroContenedor: string,
) {
  try {
    const numero = numeroContenedor.trim().toUpperCase();

    if (!numero) {
      return { success: true, encontrado: false, data: null };
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
    });

    return {
      success: true,
      encontrado: !!contenedor,
      data: contenedor,
    };
  } catch (error) {
    console.error("Error al buscar contenedor:", error);
    return {
      success: false,
      encontrado: false,
      data: null,
      message: "No se pudo buscar el contenedor",
    };
  }
}
