import "server-only"

import { fromZonedTime, toZonedTime } from "date-fns-tz"

import { APP_TIMEZONE } from "@/lib/date/constants"

import { filtroEstadisticasTrasegadoSchema } from "../schemas/estadisticas-trasegado.schema"
import type {
  EstadisticasTrasegado,
  FiltroEstadisticasTrasegado,
  IngresoMensualTrasegado,
} from "../types/estadisticas-trasegado.types"
import { obtenerEstadisticasTrasegadoRepository } from "../repository/estadisticas-trasegado.repository"

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

function crearFechaLima(anio: number, mes: number, dia: number): Date {
  return fromZonedTime(new Date(anio, mes, dia), APP_TIMEZONE)
}

interface RangoPeriodo {
  desde?: Date
  hasta?: Date
  hastaExclusivo?: boolean
}

function obtenerRangoPeriodo(
  filtro: FiltroEstadisticasTrasegado,
  ahora: Date
): RangoPeriodo {
  if (filtro.periodo === "HISTORIAL") return {}

  if (filtro.periodo === "RANGO" && filtro.fechaDesde && filtro.fechaHasta) {
    const [anioDesde, mesDesde, diaDesde] = filtro.fechaDesde
      .split("-")
      .map(Number)
    const [anioHasta, mesHasta, diaHasta] = filtro.fechaHasta
      .split("-")
      .map(Number)

    return {
      desde: crearFechaLima(anioDesde, mesDesde - 1, diaDesde),
      hasta: crearFechaLima(anioHasta, mesHasta - 1, diaHasta + 1),
      hastaExclusivo: true,
    }
  }

  const ahoraEnLima = toZonedTime(ahora, APP_TIMEZONE)
  const anio = ahoraEnLima.getFullYear()
  const mes = ahoraEnLima.getMonth()
  const dia = ahoraEnLima.getDate()

  if (filtro.periodo === "ANIO") {
    return { desde: crearFechaLima(anio, 0, 1), hasta: ahora }
  }
  if (filtro.periodo === "MES") {
    return { desde: crearFechaLima(anio, mes, 1), hasta: ahora }
  }
  if (filtro.periodo === "MES_PASADO") {
    return {
      desde: crearFechaLima(anio, mes - 1, 1),
      hasta: crearFechaLima(anio, mes, 1),
      hastaExclusivo: true,
    }
  }

  const inicioDia = new Date(anio, mes, dia)
  if (filtro.periodo === "SEMANA") {
    const diasDesdeLunes = (inicioDia.getDay() + 6) % 7
    inicioDia.setDate(inicioDia.getDate() - diasDesdeLunes)
  }

  return {
    desde: fromZonedTime(inicioDia, APP_TIMEZONE),
    hasta: ahora,
  }
}

function mapearIngresosMensuales(
  filas: Array<{
    anio: number
    mes: number
    generado: number
    cobrado: number
  }>,
  ahora: Date
): IngresoMensualTrasegado[] {
  const ahoraEnLima = toZonedTime(ahora, APP_TIMEZONE)
  const valoresPorMes = new Map(
    filas.map((fila) => [`${fila.anio}-${fila.mes}`, fila])
  )

  return Array.from({ length: 12 }, (_, indice) => {
    const fecha = new Date(
      ahoraEnLima.getFullYear(),
      ahoraEnLima.getMonth() - 11 + indice,
      1
    )
    const anio = fecha.getFullYear()
    const mesNumero = fecha.getMonth() + 1
    const valores = valoresPorMes.get(`${anio}-${mesNumero}`)

    return {
      mes: `${NOMBRES_MESES[mesNumero - 1]} ${anio}`,
      anio,
      generado: valores?.generado ?? 0,
      cobrado: valores?.cobrado ?? 0,
    }
  })
}

export async function obtenerEstadisticasTrasegadoService(
  filtroInput: FiltroEstadisticasTrasegado
): Promise<EstadisticasTrasegado> {
  const filtro = filtroEstadisticasTrasegadoSchema.parse(filtroInput)
  const ahora = new Date()
  const rango = obtenerRangoPeriodo(filtro, ahora)
  const ahoraEnLima = toZonedTime(ahora, APP_TIMEZONE)
  const anioActual = ahoraEnLima.getFullYear()
  const mesActual = ahoraEnLima.getMonth()
  const resultado = await obtenerEstadisticasTrasegadoRepository({
    ...rango,
    inicioGrafica: crearFechaLima(anioActual, mesActual - 11, 1),
    finGrafica: crearFechaLima(anioActual, mesActual + 1, 1),
  })

  return {
    periodo: filtro.periodo,
    guiasTotales: resultado.guiasTotales,
    guiasFinalizadas: resultado.guiasFinalizadas,
    guiasEnProceso: resultado.guiasEnProceso,
    totalGenerado: resultado.totalGenerado,
    totalCobrado: resultado.totalCobrado,
    totalPendiente: resultado.totalPendiente,
    ingresosMensuales: mapearIngresosMensuales(
      resultado.ingresosMensuales,
      ahora
    ),
  }
}
