// modules\contenedores\contenedores.actions.ts

"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { ZodError } from "zod";

import {
  actualizarContenedor as actualizarContenedorService,
  eliminarContenedor as eliminarContenedorService,
  obtenerContenedorPorId,
  obtenerContenedorPorNumero,
  obtenerContenedores,
  registrarContenedor,
  contarContenedores,
} from "./contenedores.service";

import type { ContenedorFormData } from "./contenedores.types";

/**
 * Resultado estándar de las Server Actions.
 */
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

/**
 * ============================================================
 * BUSCAR CONTENEDOR POR NÚMERO
 * ============================================================
 *
 * Esta acción será utilizada principalmente
 * al momento de registrar una guía.
 *
 * Si el contenedor existe, devuelve:
 *
 * - id
 * - número
 * - marca
 * - medida
 * - tipo
 *
 * Si no existe, devuelve null.
 */
export async function buscarContenedorPorNumero(
  numeroContenedor: string,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerContenedorPorNumero>
    >
  >
> {
  try {
    const contenedor =
      await obtenerContenedorPorNumero(
        numeroContenedor,
      );

    return {
      success: true,
      data: contenedor,
    };
  } catch (error) {
    /**
     * Errores de validación de Zod.
     */
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "El número del contenedor no es válido",
      };
    }

    console.error(
      "Error al buscar contenedor por número:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo buscar el contenedor",
    };
  }
}

/**
 * ============================================================
 * BUSCAR CONTENEDOR POR ID
 * ============================================================
 */
export async function buscarContenedorPorId(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerContenedorPorId>
    >
  >
> {
  try {
    /**
     * Validamos que el ID sea válido.
     */
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error:
          "El ID del contenedor no es válido",
      };
    }

    const contenedor =
      await obtenerContenedorPorId(id);

    if (!contenedor) {
      return {
        success: false,
        error:
          "Contenedor no encontrado",
      };
    }

    return {
      success: true,
      data: contenedor,
    };
  } catch (error) {
    console.error(
      "Error al buscar contenedor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo obtener el contenedor",
    };
  }
}

/**
 * ============================================================
 * LISTAR CONTENEDORES
 * ============================================================
 */
export async function listarContenedores(
  page: number = 1,
  pageSize: number = 10,
): Promise<
  ActionResult<{
    data: Awaited<
      ReturnType<typeof obtenerContenedores>
    >;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const [
      contenedores,
      total,
    ] = await Promise.all([
      obtenerContenedores(
        page,
        pageSize,
      ),
      contarContenedores(),
    ]);

    const totalPages = Math.ceil(
      total / pageSize,
    );

    return {
      success: true,

      data: {
        data: contenedores,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error(
      "Error al listar contenedores:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudieron obtener los contenedores",
    };
  }
}

/**
 * ============================================================
 * CREAR CONTENEDOR
 * ============================================================
 */
export async function crearContenedor(
  data: ContenedorFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof registrarContenedor>
    >
  >
> {
  try {
    const contenedor =
      await registrarContenedor(data);

    return {
      success: true,
      data: contenedor,
    };
  } catch (error) {
    /**
     * Errores de validación.
     */
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "Los datos proporcionados no son válidos",
      };
    }

    /**
     * Número de contenedor duplicado.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Ya existe un contenedor registrado con este número",
      };
    }

    /**
     * Errores controlados del servicio.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al crear contenedor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo crear el contenedor",
    };
  }
}

/**
 * ============================================================
 * EDITAR CONTENEDOR
 * ============================================================
 */
export async function editarContenedor(
  id: number,
  data: ContenedorFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof actualizarContenedorService>
    >
  >
> {
  try {
    /**
     * Validamos el ID.
     */
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error:
          "El ID del contenedor no es válido",
      };
    }

    const contenedor =
      await actualizarContenedorService(
        id,
        data,
      );

    return {
      success: true,
      data: contenedor,
    };
  } catch (error) {
    /**
     * Errores de validación.
     */
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "Los datos proporcionados no son válidos",
      };
    }

    /**
     * Errores conocidos de Prisma.
     */
    if (
      error instanceof
      Prisma.PrismaClientKnownRequestError
    ) {
      /**
       * Número duplicado.
       */
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "Ya existe otro contenedor registrado con este número",
        };
      }

      /**
       * Registro inexistente.
       */
      if (error.code === "P2025") {
        return {
          success: false,
          error:
            "El contenedor no existe",
        };
      }
    }

    /**
     * Errores controlados.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al actualizar contenedor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo actualizar el contenedor",
    };
  }
}

/**
 * ============================================================
 * ELIMINAR CONTENEDOR
 * ============================================================
 */
export async function eliminarContenedor(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof eliminarContenedorService>
    >
  >
> {
  try {
    /**
     * Validamos el ID.
     */
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error:
          "El ID del contenedor no es válido",
      };
    }

    const contenedor =
      await eliminarContenedorService(id);

    return {
      success: true,
      data: contenedor,
    };
  } catch (error) {
    /**
     * Contenedor no encontrado.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        error:
          "El contenedor no existe",
      };
    }

    /**
     * Contenedor relacionado con una guía.
     *
     * Esto dependerá de cómo esté configurada
     * la relación en Prisma.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        error:
          "No se puede eliminar el contenedor porque tiene guías relacionadas",
      };
    }

    /**
     * Errores controlados.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al eliminar contenedor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo eliminar el contenedor",
    };
  }
}