// modules/guias/guia.actions.ts

"use server";

import {
  crearGuiaService,
  registrarSalidaService,
} from "./guia.service";

import {
  obtenerGuiaPorId,
  obtenerGuiaPorNumero,
  obtenerGuiaPorContenedor,
  listarGuias,
} from "./guia.repository";

import {
  obtenerClientePorDocumento,
} from "@/modules/clientes/cliente.service";

import {
  obtenerContenedorPorNumero,
} from "@/modules/contenedores/contenedores.service";

import {
  obtenerConductorPorLicencia,
} from "@/modules/conductores/conductores.service";

import {
  obtenerVehiculoPorPlaca,
} from "@/modules/vehiculos/vehiculos.service";

import {
  obtenerEmpresasTransporteService,
} from "@/modules/empresas-transporte/empresa-transporte.service";

import {
  obtenerConfiguracionPrecioService,
} from "@/modules/configuracion/configuracion.service";

import type {
  CrearGuiaInput,
  ActualizarSalidaGuiaInput,
} from "./guia.types";

// ============================================================
// RESPUESTAS
// ============================================================

type ActionSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

type ActionError = {
  success: false;
  data: null;
  message: string;
};

type ActionResult<T> =
  | ActionSuccess<T>
  | ActionError;

// ============================================================
// CREAR GUÍA
// ============================================================

export async function crearGuiaAction(
  datos: CrearGuiaInput,
): Promise<ActionResult<Awaited<ReturnType<typeof crearGuiaService>>>> {
  try {
    const guia =
      await crearGuiaService(datos);

    return {
      success: true,
      data: guia,
      message:
        "Guía registrada correctamente.",
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
          : "No se pudo registrar la guía.",
    };
  }
}

// ============================================================
// REGISTRAR SALIDA
// ============================================================

export async function registrarSalidaGuiaAction(
  datos: ActualizarSalidaGuiaInput,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<
        typeof registrarSalidaService
      >
    >
  >
> {
  try {
    const guia =
      await registrarSalidaService(datos);

    return {
      success: true,
      data: guia,
      message:
        "Salida registrada correctamente.",
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
          : "No se pudo registrar la salida.",
    };
  }
}

// ============================================================
// BUSCAR GUÍA POR ID
// ============================================================

export async function obtenerGuiaPorIdAction(
  id: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerGuiaPorId>
    >
  >
> {
  try {
    const guia =
      await obtenerGuiaPorId(id);

    if (!guia) {
      return {
        success: false,
        data: null,
        message:
          "La guía no existe.",
      };
    }

    return {
      success: true,
      data: guia,
      message:
        "Guía encontrada.",
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
        "No se pudo obtener la guía.",
    };
  }
}

// ============================================================
// BUSCAR GUÍA POR NÚMERO
// ============================================================

export async function obtenerGuiaPorNumeroAction(
  numeroGuia: string,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof obtenerGuiaPorNumero>
    >
  >
> {
  try {
    const guia =
      await obtenerGuiaPorNumero(
        numeroGuia,
      );

    if (!guia) {
      return {
        success: false,
        data: null,
        message:
          "No se encontró una guía con ese número.",
      };
    }

    return {
      success: true,
      data: guia,
      message:
        "Guía encontrada.",
    };
  } catch (error) {
    console.error(
      "Error al buscar guía:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        "No se pudo buscar la guía.",
    };
  }
}

// ============================================================
// BUSCAR GUÍA POR CONTENEDOR
// ============================================================

export async function obtenerGuiaPorContenedorAction(
  contenedorId: number,
): Promise<
  ActionResult<
    Awaited<
      ReturnType<
        typeof obtenerGuiaPorContenedor
      >
    >
  >
> {
  try {
    const guia =
      await obtenerGuiaPorContenedor(
        contenedorId,
      );

    return {
      success: true,
      data: guia,
      message:
        guia
          ? "Guía encontrada."
          : "El contenedor no tiene una guía almacenada.",
    };
  } catch (error) {
    console.error(
      "Error al buscar guía por contenedor:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        "No se pudo buscar la guía.",
    };
  }
}

// ============================================================
// LISTAR GUÍAS
// ============================================================

export async function listarGuiasAction(): Promise<
  ActionResult<
    Awaited<
      ReturnType<typeof listarGuias>
    >
  >
> {
  try {
    const guias =
      await listarGuias();

    return {
      success: true,
      data: guias,
      message:
        "Guías obtenidas correctamente.",
    };
  } catch (error) {
    console.error(
      "Error al listar guías:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        "No se pudieron obtener las guías.",
    };
  }
}

// ============================================================
// BUSCAR CLIENTE POR DOCUMENTO
// ============================================================

export async function buscarClienteParaGuiaAction(
  numeroDocumento: string,
) {
  try {
    const cliente =
      await obtenerClientePorDocumento(
        numeroDocumento,
      );

    return {
      success: true,
      data: cliente,
      message: cliente
        ? "Cliente encontrado."
        : "Cliente no registrado.",
    };
  } catch (error) {
    console.error(
      "Error al buscar cliente:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo buscar el cliente.",
    };
  }
}

// ============================================================
// BUSCAR CONTENEDOR POR NÚMERO
// ============================================================

export async function buscarContenedorParaGuiaAction(
  numeroContenedor: string,
) {
  try {
    const contenedor =
      await obtenerContenedorPorNumero(
        numeroContenedor,
      );

    return {
      success: true,
      data: contenedor,
      message: contenedor
        ? "Contenedor encontrado."
        : "Contenedor no registrado.",
    };
  } catch (error) {
    console.error(
      "Error al buscar contenedor:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo buscar el contenedor.",
    };
  }
}

// ============================================================
// BUSCAR VEHÍCULO POR PLACA
// ============================================================

export async function buscarVehiculoParaGuiaAction(
  placa: string,
) {
  try {
    const vehiculo =
      await obtenerVehiculoPorPlaca(
        placa,
      );

    return {
      success: true,
      data: vehiculo,
      message: vehiculo
        ? "Vehículo encontrado."
        : "Vehículo no registrado.",
    };
  } catch (error) {
    console.error(
      "Error al buscar vehículo:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo buscar el vehículo.",
    };
  }
}

// ============================================================
// BUSCAR CONDUCTOR POR LICENCIA
// ============================================================

export async function buscarConductorParaGuiaAction(
  numeroLicencia: string,
) {
  try {
    const conductor =
      await obtenerConductorPorLicencia(
        numeroLicencia,
      );

    return {
      success: true,
      data: conductor,
      message: conductor
        ? "Conductor encontrado."
        : "Conductor no registrado.",
    };
  } catch (error) {
    console.error(
      "Error al buscar conductor:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo buscar el conductor.",
    };
  }
}

// ============================================================
// OBTENER EMPRESAS DE TRANSPORTE
// ============================================================

export async function obtenerEmpresasTransporteParaGuiaAction() {
  try {
    const empresas =
      await obtenerEmpresasTransporteService();

    return {
      success: true,
      data: empresas,
      message:
        "Empresas de transporte obtenidas correctamente.",
    };
  } catch (error) {
    console.error(
      "Error al obtener empresas de transporte:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        "No se pudieron obtener las empresas de transporte.",
    };
  }
}

// ============================================================
// OBTENER CONFIGURACIÓN DE PRECIOS
// ============================================================

export async function obtenerConfiguracionParaGuiaAction() {
  try {
    const configuracion =
      await obtenerConfiguracionPrecioService();

    return {
      success: true,
      data: configuracion,
      message:
        "Configuración obtenida correctamente.",
    };
  } catch (error) {
    console.error(
      "Error al obtener configuración:",
      error,
    );

    return {
      success: false,
      data: null,
      message:
        "No se pudo obtener la configuración de precios.",
    };
  }
}