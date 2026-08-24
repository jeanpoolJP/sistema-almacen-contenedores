import {
  actualizarConfiguracionPrecio,
  crearConfiguracionPrecio,
  obtenerConfiguracionPrecio,
} from "./configuracion.repository";

export async function obtenerConfiguracionPrecioService() {
  const configuracion =
    await obtenerConfiguracionPrecio();

  if (!configuracion) {
    return crearConfiguracionPrecio({
      precioPrimerDia: 35,
      precioDiaAdicional: 15,
      porcentajeIGV: 18,
    });
  }

  return configuracion;
}

export async function actualizarConfiguracionPrecioService(data: {
  precioPrimerDia: number;
  precioDiaAdicional: number;
  porcentajeIGV: number;
}) {
  const configuracion =
    await obtenerConfiguracionPrecio();

  if (!configuracion) {
    return crearConfiguracionPrecio(data);
  }

  return actualizarConfiguracionPrecio(
    configuracion.id,
    data
  );
}