// modules\guias\guia.actions.ts

"use server";

import {
  crearGuiaService,
  registrarSalidaGuiaService,
  obtenerGuiaPorIdService,
  obtenerGuiaPorNumeroService,
  obtenerGuiasService,
  anularGuiaService,
} from "./guia.service";

import type {
  CrearGuiaInput,
  RegistrarSalidaGuiaInput,
} from "./guia.types";

/**
 * ============================================================
 * CREAR GUÍA
 * ============================================================
 *
 * Server Action utilizada por el formulario
 * de registro de una nueva guía.
 */
export async function crearGuiaAction(
  data: CrearGuiaInput,
) {
  try {
    const guia =
      await crearGuiaService(data);

    return {
      success: true,
      data: guia,
      message:
        "La guía se registró correctamente",
    };
  } catch (error) {
    console.error(
      "Error al crear guía:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar la guía",
    };
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
  data: RegistrarSalidaGuiaInput,
) {
  try {
    const guia =
      await registrarSalidaGuiaService(data);

    return {
      success: true,
      data: guia,
      message:
        "La salida del contenedor se registró correctamente",
    };
  } catch (error) {
    console.error(
      "Error al registrar salida:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al registrar la salida",
    };
  }
}

/**
 * ============================================================
 * OBTENER GUÍA POR ID
 * ============================================================
 */
export async function obtenerGuiaPorIdAction(
  id: number,
) {
  try {
    const guia =
      await obtenerGuiaPorIdService(id);

    if (!guia) {
      return {
        success: false,
        data: null,
        message:
          "La guía no existe",
      };
    }

    return {
      success: true,
      data: guia,
      message: null,
    };
  } catch (error) {
    console.error(
      "Error al obtener guía por ID:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener la guía",
    };
  }
}

/**
 * ============================================================
 * OBTENER GUÍA POR NÚMERO
 * ============================================================
 */
export async function obtenerGuiaPorNumeroAction(
  numeroGuia: string,
) {
  try {
    const guia =
      await obtenerGuiaPorNumeroService(
        numeroGuia,
      );

    if (!guia) {
      return {
        success: false,
        data: null,
        message:
          "No se encontró una guía con ese número",
      };
    }

    return {
      success: true,
      data: guia,
      message: null,
    };
  } catch (error) {
    console.error(
      "Error al obtener guía:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener la guía",
    };
  }
}

/**
 * ============================================================
 * OBTENER TODAS LAS GUÍAS
 * ============================================================
 */
export async function obtenerGuiasAction() {
  try {
    const guias =
      await obtenerGuiasService();

    return {
      success: true,
      data: guias,
      message: null,
    };
  } catch (error) {
    console.error(
      "Error al obtener guías:",
      error,
    );

    return {
      success: false,
      data: [],
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al obtener las guías",
    };
  }
}

/**
 * ============================================================
 * ANULAR GUÍA
 * ============================================================
 */
export async function anularGuiaAction(
  id: number,
) {
  try {
    const guia =
      await anularGuiaService(id);

    return {
      success: true,
      data: guia,
      message:
        "La guía se anuló correctamente",
    };
  } catch (error) {
    console.error(
      "Error al anular guía:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Ocurrió un error al anular la guía",
    };
  }
}