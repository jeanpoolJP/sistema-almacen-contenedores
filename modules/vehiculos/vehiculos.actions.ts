// modules\vehiculos\vehiculos.actions.ts

"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { ZodError } from "zod";

import {
  actualizarVehiculo as actualizarVehiculoService,
  eliminarVehiculo as eliminarVehiculoService,
  obtenerVehiculoPorId,
  obtenerVehiculoPorPlaca,
  obtenerVehiculos,
  registrarVehiculo,
} from "./vehiculos.service";

import type { VehiculoFormData } from "./vehiculos.types";

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
 * Buscar un vehículo por su placa.
 *
 * Esta función será utilizada principalmente
 * al momento de crear una guía.
 */
export async function buscarVehiculoPorPlaca(
  placa: string,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerVehiculoPorPlaca>
    >
  >
> {
  try {
    const vehiculo =
      await obtenerVehiculoPorPlaca(placa);

    return {
      success: true,
      data: vehiculo,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "La placa no es válida",
      };
    }

    console.error(
      "Error al buscar vehículo por placa:",
      error,
    );

    return {
      success: false,
      error: "No se pudo buscar el vehículo",
    };
  }
}

/**
 * Buscar un vehículo por su ID.
 */
export async function buscarVehiculoPorId(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerVehiculoPorId>
    >
  >
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del vehículo no es válido",
      };
    }

    const vehiculo =
      await obtenerVehiculoPorId(id);

    if (!vehiculo) {
      return {
        success: false,
        error: "Vehículo no encontrado",
      };
    }

    return {
      success: true,
      data: vehiculo,
    };
  } catch (error) {
    console.error(
      "Error al buscar vehículo:",
      error,
    );

    return {
      success: false,
      error: "No se pudo obtener el vehículo",
    };
  }
}

/**
 * Listar todos los vehículos.
 */
export async function listarVehiculos(): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerVehiculos>
    >
  >
> {
  try {
    const vehiculos =
      await obtenerVehiculos();

    return {
      success: true,
      data: vehiculos,
    };
  } catch (error) {
    console.error(
      "Error al listar vehículos:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudieron obtener los vehículos",
    };
  }
}

/**
 * Crear un nuevo vehículo.
 */
export async function crearVehiculo(
  data: VehiculoFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof registrarVehiculo>
    >
  >
> {
  try {
    const vehiculo =
      await registrarVehiculo(data);

    return {
      success: true,
      data: vehiculo,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "Los datos proporcionados no son válidos",
      };
    }

    /**
     * P2002 = Violación de restricción UNIQUE.
     *
     * En este caso corresponde a la placa.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Ya existe un vehículo registrado con esta placa",
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al crear vehículo:",
      error,
    );

    return {
      success: false,
      error: "No se pudo crear el vehículo",
    };
  }
}

/**
 * Editar un vehículo existente.
 */
export async function editarVehiculo(
  id: number,
  data: VehiculoFormData,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof actualizarVehiculoService>
    >
  >
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del vehículo no es válido",
      };
    }

    const vehiculo =
      await actualizarVehiculoService(
        id,
        data,
      );

    return {
      success: true,
      data: vehiculo,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "Los datos proporcionados no son válidos",
      };
    }

    /**
     * P2002 = La nueva placa ya pertenece
     * a otro vehículo.
     */
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "Ya existe otro vehículo registrado con esta placa",
        };
      }

      if (error.code === "P2025") {
        return {
          success: false,
          error: "El vehículo no existe",
        };
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al actualizar vehículo:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo actualizar el vehículo",
    };
  }
}

/**
 * Eliminar un vehículo.
 */
export async function eliminarVehiculo(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof eliminarVehiculoService>
    >
  >
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del vehículo no es válido",
      };
    }

    const vehiculo =
      await eliminarVehiculoService(id);

    return {
      success: true,
      data: vehiculo,
    };
  } catch (error) {
    if (
      error instanceof
        Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2025") {
        return {
          success: false,
          error: "El vehículo no existe",
        };
      }

      /**
       * Dependiendo de la configuración de
       * relaciones en Prisma, intentar eliminar
       * un vehículo utilizado por una guía puede
       * provocar un error de restricción.
       */
      if (
        error.code === "P2003"
      ) {
        return {
          success: false,
          error:
            "No se puede eliminar este vehículo porque está relacionado con una o más guías",
        };
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al eliminar vehículo:",
      error,
    );

    return {
      success: false,
      error:
        "No se pudo eliminar el vehículo",
    };
  }
}