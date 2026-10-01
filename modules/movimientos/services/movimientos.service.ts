// modules\movimientos\services\movimientos.service.ts

import { createLimaDate } from "@/lib/date/create"
import { formatDate, formatTime } from "@/lib/date/format"
import { movimientosRepository } from "../repository/movimientos.repository"
import type {
  MovimientoItem,
  OrigenMovimiento,
  ReporteMovimientos,
  TipoMovimiento,
} from "../types/movimientos.types"

// Suma un día a la fecha en formato "YYYY-MM-DD" y devuelve la nueva fecha en el mismo formato.
function sumarDia(fecha: string) {
  const dia = new Date(`${fecha}T00:00:00.000Z`)
  dia.setUTCDate(dia.getUTCDate() + 1)
  return dia.toISOString().slice(0, 10)
}

// Construye un rango de fechas e instantes a partir de las fechas de inicio y fin proporcionadas.
function construirRango(desde?: string, hasta?: string) {
  const hastaExclusivo = hasta ? sumarDia(hasta) : undefined
  const desdeFecha = desde ? new Date(`${desde}T00:00:00.000Z`) : undefined
  const desdeInstante = desde ? createLimaDate(desde, "00:00") : undefined
  return {
    desdeFecha,
    hastaFechaExclusiva: hastaExclusivo
      ? new Date(`${hastaExclusivo}T00:00:00.000Z`)
      : undefined,
    desdeInstante,
    hastaInstanteExclusivo: hastaExclusivo
      ? createLimaDate(hastaExclusivo, "00:00")
      : undefined,
  }
}

// Verifica si una fecha está dentro del rango especificado (desde, hastaExclusiva).
function estaDentroDelRango(fecha: Date, desde?: Date, hastaExclusiva?: Date) {
  return (
    (!desde || fecha >= desde) && (!hastaExclusiva || fecha < hastaExclusiva)
  )
}

// Formatea una hora en formato "HH:MM" a partir de un objeto Date.
function formatearHoraSql(hora: Date) {
  return `${String(hora.getUTCHours()).padStart(2, "0")}:${String(
    hora.getUTCMinutes()
  ).padStart(2, "0")}`
}

// Ordena una fecha y hora de internamiento para su comparación y ordenamiento.
function ordenarFechaInternamiento(fecha: Date, hora: Date) {
  const fechaIso = fecha.toISOString().slice(0, 10)
  const horaIso = `${formatearHoraSql(hora)}:${String(
    hora.getUTCSeconds()
  ).padStart(2, "0")}`
  return createLimaDate(fechaIso, horaIso)
}

function formatearContenedor(contenedor: {
  marca: string
  numeroContenedor: string
  medida: number
}) {
  return `Contenedor: ${contenedor.marca} ${contenedor.numeroContenedor} - ${contenedor.medida}`
}

function formatearFlatRack(flatRack: { marca: string; numero: string }) {
  return `Flat Rack: ${flatRack.marca} ${flatRack.numero}`
}

function obtenerNombreElemento(elemento: {
  tipo: string
  numero: string | null
  descripcion: string | null
  contenedor: {
    marca: string
    numeroContenedor: string
    medida: number
  } | null
  flatRack: { marca: string; numero: string } | null
}) {
  if (elemento.contenedor) {
    return formatearContenedor(elemento.contenedor)
  }
  if (elemento.flatRack) {
    return formatearFlatRack(elemento.flatRack)
  }

  const tipos: Record<string, string> = {
    MERCADERIA: "Mercadería",
    MAQUINARIA: "Maquinaria",
    OTRO: "Otro",
  }
  const detalle = elemento.numero ?? elemento.descripcion ?? "Sin detalle"
  return `${tipos[elemento.tipo] ?? elemento.tipo}: ${detalle}`
}

function crearMovimiento({
  id,
  fecha,
  hora,
  tipo,
  origen,
  guia,
  elemento,
  cliente,
  fechaOrden,
}: {
  id: string
  fecha: string
  hora: string
  tipo: TipoMovimiento
  origen: OrigenMovimiento
  guia: string
  elemento: string
  cliente: string | null | undefined
  fechaOrden: Date
}) {
  return {
    movimiento: {
      id,
      fecha,
      hora,
      tipo,
      origen,
      guia,
      elemento,
      cliente: cliente?.trim() || "Sin cliente asignado",
    } satisfies MovimientoItem,
    fechaOrden,
  }
}

export const movimientosService = {
  async consultar(desde?: string, hasta?: string): Promise<ReporteMovimientos> {
    const rango = construirRango(desde, hasta)
    const [internamientos, ingresosTrasegado, salidasTrasegado] =
      await Promise.all([
        movimientosRepository.obtenerInternamientos(rango),
        movimientosRepository.obtenerIngresosTrasegado(rango),
        movimientosRepository.obtenerSalidasTrasegado(rango),
      ])

    const movimientosOrdenados = []

    for (const guia of internamientos) {
      const elemento = formatearContenedor(guia.contenedor)
      if (
        estaDentroDelRango(
          guia.fechaIngreso,
          rango.desdeFecha,
          rango.hastaFechaExclusiva
        )
      ) {
        movimientosOrdenados.push(
          crearMovimiento({
            id: `internamiento-${guia.id}-ingreso`,
            fecha: formatDate(guia.fechaIngreso),
            hora: formatearHoraSql(guia.horaIngreso),
            fechaOrden: ordenarFechaInternamiento(
              guia.fechaIngreso,
              guia.horaIngreso
            ),
            tipo: "INGRESO",
            origen: "INTERNAMIENTO",
            guia: guia.numeroGuia,
            elemento,
            cliente: guia.cliente?.nombreCompleto,
          })
        )
      }
      if (
        guia.fechaSalida &&
        estaDentroDelRango(
          guia.fechaSalida,
          rango.desdeFecha,
          rango.hastaFechaExclusiva
        )
      ) {
        movimientosOrdenados.push(
          crearMovimiento({
            id: `internamiento-${guia.id}-salida`,
            fecha: formatDate(guia.fechaSalida),
            hora: guia.horaSalida ? formatearHoraSql(guia.horaSalida) : "-",
            fechaOrden: guia.horaSalida
              ? ordenarFechaInternamiento(guia.fechaSalida, guia.horaSalida)
              : guia.fechaSalida,
            tipo: "SALIDA",
            origen: "INTERNAMIENTO",
            guia: guia.numeroGuia,
            elemento,
            cliente: guia.cliente?.nombreCompleto,
          })
        )
      }
    }

    for (const ingreso of ingresosTrasegado) {
      for (const elemento of ingreso.elementos) {
        movimientosOrdenados.push(
          crearMovimiento({
            id: `trasegado-ingreso-${ingreso.id}-${elemento.id}`,
            fecha: formatDate(ingreso.guiaTrasegado.fechaIngreso),
            hora: formatTime(ingreso.guiaTrasegado.fechaIngreso),
            fechaOrden: ingreso.guiaTrasegado.fechaIngreso,
            tipo: "INGRESO",
            origen: "TRASEGADO",
            guia: ingreso.guiaTrasegado.numeroGuia,
            elemento: obtenerNombreElemento(elemento),
            cliente: ingreso.guiaTrasegado.cliente?.nombreCompleto,
          })
        )
      }
    }

    for (const salida of salidasTrasegado) {
      for (const { elemento } of salida.elementos) {
        movimientosOrdenados.push(
          crearMovimiento({
            id: `trasegado-salida-${salida.id}-${elemento.id}`,
            fecha: formatDate(salida.fechaSalida),
            hora: formatTime(salida.fechaSalida),
            fechaOrden: salida.fechaSalida,
            tipo: "SALIDA",
            origen: "TRASEGADO",
            guia: salida.guiaTrasegado.numeroGuia,
            elemento: obtenerNombreElemento(elemento),
            cliente: salida.guiaTrasegado.cliente?.nombreCompleto,
          })
        )
      }
    }

    movimientosOrdenados.sort(
      (a, b) =>
        b.fechaOrden.getTime() - a.fechaOrden.getTime() ||
        b.movimiento.guia.localeCompare(a.movimiento.guia)
    )

    const movimientos = movimientosOrdenados.map(({ movimiento }) => movimiento)
    const ingresos = movimientos.filter(
      (item) => item.tipo === "INGRESO"
    ).length
    const salidas = movimientos.length - ingresos

    return {
      desde: desde ?? "",
      hasta: hasta ?? "",
      resumen: {
        total: movimientos.length,
        ingresos,
        salidas,
        internamientos: movimientos.filter(
          (item) => item.origen === "INTERNAMIENTO"
        ).length,
        trasegados: movimientos.filter((item) => item.origen === "TRASEGADO")
          .length,
      },
      movimientos,
    }
  },
}
