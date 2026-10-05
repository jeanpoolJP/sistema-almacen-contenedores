import "server-only"

import { toZonedTime } from "date-fns-tz"

import { APP_TIMEZONE } from "@/lib/date/constants"

import { filtroEstadisticasGuiasSchema } from "./estadisticas.schema"
import { obtenerEstadisticasGuiasRepository } from "./estadisticas.repository"
import type {
  EstadisticasGuias,
  FiltroEstadisticasGuias,
  IngresoMensualGuias,
} from "./estadisticas.types"

const NOMBRES_MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

function crearFecha(anio: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(anio, mes, dia))
}

function crearFechaDesdeISO(fecha: string): Date {
  const [anio, mes, dia] = fecha.split("-").map(Number)
  return crearFecha(anio, mes - 1, dia)
}

interface RangoFecha {
  desde?: Date
  hasta?: Date
}

function obtenerRangoFecha(
  filtro: FiltroEstadisticasGuias,
  ahora: Date
): RangoFecha {
  if (filtro.periodo === "HISTORIAL") return {}

  if (filtro.periodo === "RANGO" && filtro.fechaDesde && filtro.fechaHasta) {
    const diaPosterior = crearFechaDesdeISO(filtro.fechaHasta)
    diaPosterior.setUTCDate(diaPosterior.getUTCDate() + 1)
    return {
      desde: crearFechaDesdeISO(filtro.fechaDesde),
      hasta: diaPosterior,
    }
  }

  const fechaLima = toZonedTime(ahora, APP_TIMEZONE)
  const anio = fechaLima.getFullYear()
  const mes = fechaLima.getMonth()
  const dia = fechaLima.getDate()
  const hoy = crearFecha(anio, mes, dia)
  const manana = crearFecha(anio, mes, dia + 1)

  if (filtro.periodo === "HOY") {
    return { desde: hoy, hasta: manana }
  }
  if (filtro.periodo === "SEMANA") {
    const diasDesdeLunes = (hoy.getUTCDay() + 6) % 7
    const lunes = new Date(hoy)
    lunes.setUTCDate(lunes.getUTCDate() - diasDesdeLunes)
    return { desde: lunes, hasta: manana }
  }
  if (filtro.periodo === "MES") {
    return { desde: crearFecha(anio, mes, 1), hasta: manana }
  }
  if (filtro.periodo === "MES_PASADO") {
    return {
      desde: crearFecha(anio, mes - 1, 1),
      hasta: crearFecha(anio, mes, 1),
    }
  }

  return { desde: crearFecha(anio, 0, 1), hasta: manana }
}

function mapearIngresosMensuales(
  filas: Array<{
    anio: number
    mes: number
    generado: number
    cobrado: number
  }>,
  ahora: Date
): IngresoMensualGuias[] {
  const fechaLima = toZonedTime(ahora, APP_TIMEZONE)
  const valoresPorMes = new Map(
    filas.map((fila) => [`${fila.anio}-${fila.mes}`, fila])
  )

  return Array.from({ length: 12 }, (_, indice) => {
    const fecha = new Date(
      Date.UTC(fechaLima.getFullYear(), fechaLima.getMonth() - 11 + indice, 1)
    )
    const anio = fecha.getUTCFullYear()
    const mesNumero = fecha.getUTCMonth() + 1
    const valores = valoresPorMes.get(`${anio}-${mesNumero}`)

    return {
      mes: `${NOMBRES_MESES[mesNumero - 1]} ${anio}`,
      generado: valores?.generado ?? 0,
      cobrado: valores?.cobrado ?? 0,
    }
  })
}

export async function obtenerEstadisticasGuiasService(
  filtroInput: FiltroEstadisticasGuias
): Promise<EstadisticasGuias> {
  const filtro = filtroEstadisticasGuiasSchema.parse(filtroInput)
  const ahora = new Date()
  const fechaLima = toZonedTime(ahora, APP_TIMEZONE)
  const anioActual = fechaLima.getFullYear()
  const mesActual = fechaLima.getMonth()
  const resultado = await obtenerEstadisticasGuiasRepository({
    ...obtenerRangoFecha(filtro, ahora),
    inicioGrafica: crearFecha(anioActual, mesActual - 11, 1),
    finGrafica: crearFecha(anioActual, mesActual + 1, 1),
  })

  return {
    periodo: filtro.periodo,
    guiasTotales: resultado.guiasTotales,
    guiasAlmacenadas: resultado.guiasAlmacenadas,
    guiasRetiradas: resultado.guiasRetiradas,
    totalGenerado: resultado.totalGenerado,
    totalCobrado: resultado.totalCobrado,
    totalPendiente: resultado.totalPendiente,
    ingresosMensuales: mapearIngresosMensuales(
      resultado.ingresosMensuales,
      ahora
    ),
  }
}
