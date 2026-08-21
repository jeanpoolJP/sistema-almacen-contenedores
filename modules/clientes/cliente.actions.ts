"use server";

import { Prisma } from "@/lib/generated/prisma/client";
import { ZodError } from "zod";

import {
  actualizarCliente as actualizarClienteService,
  desactivarCliente as desactivarClienteService,
  obtenerClientePorDni,
  obtenerClientePorId,
  obtenerClientes,
  registrarCliente,
} from "./cliente.service";

import type { ClienteFormData } from "./cliente.types";

type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

export async function buscarClientePorDni(
  dni: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof obtenerClientePorDni>>>
> {
  try {
    const cliente = await obtenerClientePorDni(dni);

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error:
          error.issues[0]?.message ??
          "El DNI no es válido",
      };
    }

    console.error(
      "Error al buscar cliente por DNI:",
      error,
    );

    return {
      success: false,
      error: "No se pudo buscar el cliente",
    };
  }
}

export async function buscarClientePorId(
  id: number,
): Promise<
  ActionResult<Awaited<ReturnType<typeof obtenerClientePorId>>>
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del cliente no es válido",
      };
    }

    const cliente = await obtenerClientePorId(id);

    if (!cliente) {
      return {
        success: false,
        error: "Cliente no encontrado",
      };
    }

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    console.error(
      "Error al buscar cliente:",
      error,
    );

    return {
      success: false,
      error: "No se pudo obtener el cliente",
    };
  }
}

export async function listarClientes(): Promise<
  ActionResult<Awaited<ReturnType<typeof obtenerClientes>>>
> {
  try {
    const clientes = await obtenerClientes();

    return {
      success: true,
      data: clientes,
    };
  } catch (error) {
    console.error(
      "Error al listar clientes:",
      error,
    );

    return {
      success: false,
      error: "No se pudieron obtener los clientes",
    };
  }
}

export async function crearCliente(
  data: ClienteFormData,
): Promise<
  ActionResult<Awaited<ReturnType<typeof registrarCliente>>>
> {
  try {
    const cliente = await registrarCliente(data);

    return {
      success: true,
      data: cliente,
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Ya existe un cliente registrado con este DNI",
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al crear cliente:",
      error,
    );

    return {
      success: false,
      error: "No se pudo crear el cliente",
    };
  }
}

export async function editarCliente(
  id: number,
  data: ClienteFormData,
): Promise<
  ActionResult<Awaited<ReturnType<typeof actualizarClienteService>>>
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del cliente no es válido",
      };
    }

    const cliente =
      await actualizarClienteService(id, data);

    return {
      success: true,
      data: cliente,
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

    if (
      error instanceof Prisma.PrismaClientKnownRequestError
    ) {
      if (error.code === "P2002") {
        return {
          success: false,
          error:
            "Ya existe otro cliente registrado con este DNI",
        };
      }

      if (error.code === "P2025") {
        return {
          success: false,
          error: "El cliente no existe",
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
      "Error al actualizar cliente:",
      error,
    );

    return {
      success: false,
      error: "No se pudo actualizar el cliente",
    };
  }
}

export async function desactivarCliente(
  id: number,
): Promise<
  ActionResult<
    Awaited<ReturnType<typeof desactivarClienteService>>
  >
> {
  try {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        success: false,
        error: "El ID del cliente no es válido",
      };
    }

    const cliente =
      await desactivarClienteService(id);

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return {
        success: false,
        error: "El cliente no existe",
      };
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.error(
      "Error al desactivar cliente:",
      error,
    );

    return {
      success: false,
      error: "No se pudo desactivar el cliente",
    };
  }
}