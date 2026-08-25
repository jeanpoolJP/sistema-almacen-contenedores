// modules\conductores\conductores.actions.ts

"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { ZodError } from "zod";

import {
  actualizarConductor as actualizarConductorService,
  eliminarConductor as eliminarConductorService,
  obtenerConductorPorLicencia,
  obtenerConductorPorId,
  obtenerConductores,
  countConductores,
  registrarConductor,
} from "./conductores.service";


import type { ConductorFormData } from "./conductores.types";

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
 * BUSCAR CONDUCTOR POR LICENCIA
 * ============================================================
 *
 * Esta función será utilizada principalmente
 * al momento de crear una guía.
 *
 * Si la licencia existe, devuelve los datos del conductor.
 * Si no existe, devuelve data: null.
 */
export async function buscarConductorPorLicencia(
  numeroLicencia: string,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerConductorPorLicencia>
    >
  >
> {
  try {
    const conductor =
      await obtenerConductorPorLicencia(
        numeroLicencia,
      );

    return {
      success: true,
      data: conductor,
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
          "El número de licencia no es válido",
      };
    }

    console.error(
      "Error al buscar conductor por licencia:",
      error,
    );

    return {
      success: false,
      error: "No se pudo buscar el conductor",
    };
  }
}

/**
 * ============================================================
 * BUSCAR CONDUCTOR POR ID
 * ============================================================
 */
export async function buscarConductorPorId(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerConductorPorId>
    >
  >
> {
  try {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        error: "El ID del conductor no es válido",
      };
    }

    const conductor =
      await obtenerConductorPorId(id);

    if (!conductor) {
      return {
        success: false,
        error: "Conductor no encontrado",
      };
    }

    return {
      success: true,
      data: conductor,
    };
  } catch (error) {
    console.error(
      "Error al buscar conductor:",
      error,
    );

    return {
      success: false,
      error: "No se pudo obtener el conductor",
    };
  }
}
/**
 * ============================================================
 * LISTAR CONDUCTORES
 * ============================================================
 */
export async function listarConductores(
  page: number = 1,
  pageSize: number = 10,
): Promise<
  ActionResult<{
    data: Awaited<
      ReturnType<typeof obtenerConductores>
    >;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>
> {
  try {
    const [conductores, total] =
      await Promise.all([
        obtenerConductores(page, pageSize),
        countConductores(),
      ]);

    const totalPages = Math.ceil(
      total / pageSize,
    );

    return {
      success: true,
      data: {
        data: conductores,
        total,
        page,
        pageSize,
        totalPages,
      },
    };
  } catch (error) {
    console.error(
      "Error al listar conductores:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudieron obtener los conductores",
    };
  }
}

/**
 * ============================================================
 * CREAR CONDUCTOR
 * ============================================================
 */
export async function crearConductor(
  data: ConductorFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof registrarConductor>
    >
  >
> {
  try {
    const conductor =
      await registrarConductor(data);

    return {
      success: true,
      data: conductor,
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
     * Restricción @unique de Prisma.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Ya existe un conductor registrado con este número de licencia",
      };
    }

    /**
     * Errores generados por nuestro service.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al crear conductor:",
      error,
    );

    return {
      success: false,
      error: "No se pudo crear el conductor",
    };
  }
}

/**
 * ============================================================
 * EDITAR CONDUCTOR
 * ============================================================
 */
export async function editarConductor(
  id: number,
  data: ConductorFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<
        typeof actualizarConductorService
      >
    >
  >
> {
  try {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        error: "El ID del conductor no es válido",
      };
    }

    const conductor =
      await actualizarConductorService(
        id,
        data,
      );

    return {
      success: true,
      data: conductor,
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
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "Ya existe otro conductor registrado con este número de licencia",
        };
      }

      if (error.code === "P2025") {
        return {
          success: false,
          error: "El conductor no existe",
        };
      }
    }

    /**
     * Errores generados por nuestro service.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al actualizar conductor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo actualizar el conductor",
    };
  }
}

/**
 * ============================================================
 * ELIMINAR CONDUCTOR
 * ============================================================
 *
 * IMPORTANTE:
 * Si el conductor ya está relacionado con una
 * o más guías, Prisma puede impedir su eliminación
 * dependiendo de la configuración de las relaciones.
 */
export async function eliminarConductor(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<
        typeof eliminarConductorService
      >
    >
  >
> {
  try {
    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return {
        success: false,
        error: "El ID del conductor no es válido",
      };
    }

    const conductor =
      await eliminarConductorService(id);

    return {
      success: true,
      data: conductor,
    };
  } catch (error) {
    /**
     * Registro inexistente.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        error: "El conductor no existe",
      };
    }

    /**
     * Restricción de relaciones.
     *
     * P2003 normalmente indica que existen
     * registros relacionados que impiden eliminarlo.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return {
        success: false,
        error:
          "No se puede eliminar este conductor porque tiene guías relacionadas",
      };
    }

    /**
     * Errores generados por nuestro service.
     */
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al eliminar conductor:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo eliminar el conductor",
    };
  }
}