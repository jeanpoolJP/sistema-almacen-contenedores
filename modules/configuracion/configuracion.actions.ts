"use server";

import {
  configuracionPrecioSchema,
  type ConfiguracionPrecioInput,
} from "./configuracion.schema";
import {
  actualizarConfiguracionPrecioService,
  obtenerConfiguracionPrecioService,
} from "./configuracion.service";

export async function obtenerConfiguracionPrecioAction() {
  try {
    const configuracion =
      await obtenerConfiguracionPrecioService();

    return {
      success: true,
      data: {
        id: configuracion.id,
        precioPrimerDia:
          Number(configuracion.precioPrimerDia),
        precioDiaAdicional:
          Number(configuracion.precioDiaAdicional),
        porcentajeIGV:
          Number(configuracion.porcentajeIGV),
        activo: configuracion.activo,
        createdAt: configuracion.createdAt,
        updatedAt: configuracion.updatedAt,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "No se pudo obtener la configuración de precios",
    };
  }
}

export async function actualizarConfiguracionPrecioAction(
  data: ConfiguracionPrecioInput
) {
  try {
    const datosValidados =
      configuracionPrecioSchema.parse(data);

    const configuracion =
      await actualizarConfiguracionPrecioService(
        datosValidados
      );

    return {
      success: true,
      message:
        "Configuración actualizada correctamente",
      data: {
        id: configuracion.id,
        precioPrimerDia:
          Number(configuracion.precioPrimerDia),
        precioDiaAdicional:
          Number(configuracion.precioDiaAdicional),
        porcentajeIGV:
          Number(configuracion.porcentajeIGV),
        activo: configuracion.activo,
        createdAt: configuracion.createdAt,
        updatedAt: configuracion.updatedAt,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message:
        "No se pudo actualizar la configuración",
    };
  }
}