import { guardarCotizacionRepository } from "../repository/guia-trasegado.repository"
import {
  cotizacionSchema,
  type CotizacionInput,
} from "../schemas/cotizacion.schema"
import { calcularTotalesCotizacion } from "../utils/calcular-cotizacion"

export async function guardarCotizacionService(input: CotizacionInput) {
  const datos = cotizacionSchema.parse(input)
  const totales = calcularTotalesCotizacion(
    datos.montoIngresado,
    datos.modoIGVCotizacion
  )

  return guardarCotizacionRepository({
    guiaTrasegadoId: datos.guiaTrasegadoId,
    numeroCotizacion: datos.numeroCotizacion,
    modoIGVCotizacion: datos.modoIGVCotizacion,
    ...totales,
  })
}
