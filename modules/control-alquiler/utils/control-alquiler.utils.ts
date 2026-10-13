// modules/control-alquiler/utils/control-alquiler.utils.ts
import type {
  GuiaAlquilerListItem,
  GuiaAlquilerConRelaciones,
} from "../control-alquiler.types"

// ============================================================
// CÁLCULO DE HORAS
// ============================================================

/** "HH:mm" -> minutos desde 00:00 */
export function horaAMinutos(hora: string | null | undefined): number | null {
  if (!hora) return null
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hora)
  if (!match) return null
  const [, hh, mm] = match
  return Number(hh) * 60 + Number(mm)
}

/** Convierte Date de prisma (Time) a "HH:mm" */
export function dateATimeString(date: Date | null | undefined): string | null {
  if (!date) return null
  const hh = String(date.getUTCHours()).padStart(2, "0")
  const mm = String(date.getUTCMinutes()).padStart(2, "0")
  return `${hh}:${mm}`
}

/** Convierte Date a "YYYY-MM-DD" */
export function dateADateString(date: Date | null | undefined): string | null {
  if (!date) return null
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(date.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/**
 * Horas de servicio = horaRetorno - horaSalida
 * Si el retorno es menor que la salida, asume cruce de medianoche.
 */
export function calcularHorasServicio(
  horaSalida: string | null | undefined,
  horaRetorno: string | null | undefined
): number | null {
  const salida = horaAMinutos(horaSalida)
  const retorno = horaAMinutos(horaRetorno)
  if (salida == null || retorno == null) return null

  let diff = retorno - salida
  if (diff < 0) diff += 24 * 60 // cruce de medianoche
  return Math.round((diff / 60) * 100) / 100
}

/**
 * Horas de uso = horometroFinal - horometroInicial
 */
export function calcularHorasUsoMaquina(
  inicial: number | null | undefined,
  final: number | null | undefined
): number | null {
  if (inicial == null || final == null) return null
  if (final < inicial) return null
  return Math.round((final - inicial) * 10) / 10
}

export function calcularImporteAlquiler(
  horasServicio: number | null | undefined,
  horasMinimas: number | null | undefined,
  precioPorHora: number | null | undefined
): number | null {
  if (precioPorHora == null || !Number.isFinite(precioPorHora)) return null
  if (horasServicio == null && horasMinimas == null) return null

  const horasFacturables = Math.max(horasServicio ?? 0, horasMinimas ?? 0)
  return redondear2(horasFacturables * precioPorHora)
}

// ============================================================
// CÁLCULO DE COTIZACIÓN
// ============================================================

export interface CalculoCotizacion {
  subtotal: number
  igv: number
  total: number
}

/**
 * Calcula los totales según el modo de IGV.
 *
 * - SIN_IGV       : subtotal = base, igv = 0, total = base
 * - CON_IGV       : subtotal = base, igv = base * 0.18, total = base + igv
 * - IGV_INCLUIDO  : el monto recibido ya incluye IGV.
 *                   total = base, subtotal = base / 1.18, igv = total - subtotal
 */
export function calcularCotizacion(
  montoBase: number,
  modo: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO",
  porcentajeIGV = 18
): CalculoCotizacion {
  const base = Number.isFinite(montoBase) ? montoBase : 0
  const tasa = porcentajeIGV / 100

  if (modo === "SIN_IGV") {
    return {
      subtotal: redondear2(base),
      igv: 0,
      total: redondear2(base),
    }
  }

  if (modo === "CON_IGV") {
    const igv = redondear2(base * tasa)
    return {
      subtotal: redondear2(base),
      igv,
      total: redondear2(base + igv),
    }
  }

  // IGV_INCLUIDO
  const subtotal = redondear2(base / (1 + tasa))
  const igv = redondear2(base - subtotal)
  return {
    subtotal,
    igv,
    total: redondear2(base),
  }
}

function redondear2(n: number): number {
  return Math.round(n * 100) / 100
}

// ============================================================
// SERIALIZACIÓN
// ============================================================

export function serializarGuiaAlquiler(
  guia: GuiaAlquilerConRelaciones
): GuiaAlquilerListItem {
  return {
    id: guia.id,
    numeroGuia: guia.numeroGuia,

    fechaInicio: dateADateString(guia.fechaInicio) ?? "",
    fechaFin: dateADateString(guia.fechaFin) ?? "",

    solicitante: guia.solicitante,
    lugarServicio: guia.lugarServicio,
    descripcionServicio: guia.descripcionServicio,

    horaSalida: dateATimeString(guia.horaSalida),
    horaInicio: dateATimeString(guia.horaInicio),
    horaFinalizacion: dateATimeString(guia.horaFinalizacion),
    horaRetorno: dateATimeString(guia.horaRetorno),

    horasServicio:
      guia.horasServicio != null ? Number(guia.horasServicio) : null,
    horasMinimas: guia.horasMinimas != null ? Number(guia.horasMinimas) : null,
    precioPorHora: guia.precioPorHora != null ? Number(guia.precioPorHora) : null,

    horometroInicial: guia.horometroInicial
      ? Number(guia.horometroInicial)
      : null,
    horometroFinal: guia.horometroFinal ? Number(guia.horometroFinal) : null,
    horasUsoMaquina: guia.horasUsoMaquina ? Number(guia.horasUsoMaquina) : null,

    subtotal: guia.subtotal != null ? Number(guia.subtotal) : null,
    igv: guia.igv != null ? Number(guia.igv) : null,
    total: guia.total != null ? Number(guia.total) : null,
    modoIGVCotizacion: guia.modoIGVCotizacion ?? null,
    numeroCotizacion: guia.numeroCotizacion,

    estadoPago: guia.estadoPago,
    metodoPago: guia.metodoPago,
    numeroOperacion: guia.numeroOperacion,
    fechaPago: dateADateString(guia.fechaPago),
    horaPago: dateATimeString(guia.horaPago),

    estado: guia.estado,
    observaciones: guia.observaciones,

    cliente: guia.cliente
      ? {
          id: guia.cliente.id,
          nombreCompleto: guia.cliente.nombreCompleto,
          numeroDocumento: guia.cliente.numeroDocumento,
        }
      : null,

    equipo: {
      id: guia.equipo.id,
      codigo: guia.equipo.codigo,
      nombre: guia.equipo.nombre,
      tipo: guia.equipo.tipo,
    },

    operador: guia.operador
      ? {
          id: guia.operador.id,
          nombres: guia.operador.nombres,
          apellidos: guia.operador.apellidos,
        }
      : null,

    nombreOperadorExterno: guia.nombreOperadorExterno,

    createdAt: guia.createdAt.toISOString(),
    updatedAt: guia.updatedAt.toISOString(),
  }
}

// ============================================================
// HELPERS DE FORMATO
// ============================================================

export function formatMoneda(n: number | null | undefined): string {
  if (n == null) return "—"
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(n)
}

export function formatNumero(n: number | null | undefined, dec = 2): string {
  if (n == null) return "—"
  return n.toFixed(dec)
}

export function normalizarNumeroGuia(numeroGuia: string): string {
  const valor = numeroGuia.trim()

  if (!/^\d+$/.test(valor)) {
    throw new Error("El número de guía solo puede contener números")
  }

  const numero = Number(valor)

  if (!Number.isFinite(numero) || numero < 0) {
    throw new Error("El número de guía no es válido")
  }

  if (numero > 999999) {
    throw new Error("El número de guía no puede tener más de 6 dígitos")
  }

  return numero.toString().padStart(6, "0")
}

export function formatFecha(fecha: string | null | undefined): string {
  if (!fecha) return "—"
  const [y, m, d] = fecha.split("-")
  if (!y || !m || !d) return fecha
  return `${d}/${m}/${y}`
}
