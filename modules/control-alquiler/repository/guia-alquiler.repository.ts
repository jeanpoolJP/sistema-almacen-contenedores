import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

import type {
  GuiaAlquilerInput,
  PagoAlquilerInput,
} from "../schemas/control-alquiler.schema"

export async function listarGuiasAlquilerRepository(params: {
  pagina: number
  limite: number
  busqueda: string
}) {
  const skip = (params.pagina - 1) * params.limite
  const where: Prisma.GuiaAlquilerWhereInput = params.busqueda
    ? {
        OR: [
          { numeroGuia: { contains: params.busqueda, mode: "insensitive" } },
          { solicitante: { contains: params.busqueda, mode: "insensitive" } },
          {
            numeroCotizacion: {
              contains: params.busqueda,
              mode: "insensitive",
            },
          },
          {
            cliente: {
              is: {
                OR: [
                  {
                    nombreCompleto: {
                      contains: params.busqueda,
                      mode: "insensitive",
                    },
                  },
                  {
                    numeroDocumento: {
                      contains: params.busqueda,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
          {
            equipo: {
              is: {
                OR: [
                  {
                    codigo: { contains: params.busqueda, mode: "insensitive" },
                  },
                  {
                    nombre: { contains: params.busqueda, mode: "insensitive" },
                  },
                ],
              },
            },
          },
        ],
      }
    : {}

  const [guias, total] = await Promise.all([
    prisma.guiaAlquiler.findMany({
      where,
      skip,
      take: params.limite,
      orderBy: [{ fechaInicio: "desc" }, { createdAt: "desc" }],
      include: {
        cliente: {
          select: {
            id: true,
            tipoDocumento: true,
            numeroDocumento: true,
            nombreCompleto: true,
            telefono: true,
            observaciones: true,
          },
        },
        equipo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            tipo: true,
            marca: true,
            modelo: true,
            placa: true,
            capacidadCarga: true,
            estado: true,
          },
        },
        operador: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            tipoDocumento: true,
            numeroDocumento: true,
            telefono: true,
            licencia: true,
            activo: true,
          },
        },
      },
    }),
    prisma.guiaAlquiler.count({ where }),
  ])

  return { guias, total }
}

export async function listarOpcionesAlquilerRepository() {
  const [equipos, operadores, clientes] = await Promise.all([
    prisma.equipo.findMany({
      orderBy: [{ nombre: "asc" }, { codigo: "asc" }],
      select: {
        id: true,
        codigo: true,
        nombre: true,
        tipo: true,
        estado: true,
      },
    }),
    prisma.operador.findMany({
      orderBy: [{ apellidos: "asc" }, { nombres: "asc" }],
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        tipoDocumento: true,
        numeroDocumento: true,
        activo: true,
      },
    }),
    prisma.cliente.findMany({
      where: { activo: true },
      take: 100,
      orderBy: [
        { guiasAlquiler: { _count: "desc" } },
        { nombreCompleto: "asc" },
        { id: "asc" },
      ],
      select: {
        id: true,
        tipoDocumento: true,
        numeroDocumento: true,
        nombreCompleto: true,
        telefono: true,
        observaciones: true,
        _count: { select: { guiasAlquiler: true } },
      },
    }),
  ])

  return { equipos, operadores, clientes }
}

type GuiaAlquilerPersistencia = Omit<
  GuiaAlquilerInput,
  | "numeroGuia"
  | "fechaInicio"
  | "fechaFin"
  | "horaSalida"
  | "horaInicio"
  | "horaFinalizacion"
  | "horaRetorno"
> & {
  numeroGuia: string
  fechaInicio: Date
  fechaFin: Date
  horaSalida: Date | null
  horaInicio: Date | null
  horaFinalizacion: Date | null
  horaRetorno: Date | null
}

export async function crearGuiaAlquilerRepository(
  datos: GuiaAlquilerPersistencia
) {
  return prisma.guiaAlquiler.create({
    data: {
      numeroGuia: datos.numeroGuia,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      solicitante: datos.solicitante || null,
      horaSalida: datos.horaSalida,
      horaInicio: datos.horaInicio,
      horaFinalizacion: datos.horaFinalizacion,
      horaRetorno: datos.horaRetorno,
      equipoId: datos.equipoId,
      operadorId: datos.operadorId,
      estado: datos.estado,
      observaciones: datos.observaciones?.trim() || null,
    },
  })
}

export async function actualizarGuiaAlquilerRepository(
  id: string,
  datos: GuiaAlquilerPersistencia
) {
  return prisma.guiaAlquiler.update({
    where: { id },
    data: {
      numeroGuia: datos.numeroGuia,
      fechaInicio: datos.fechaInicio,
      fechaFin: datos.fechaFin,
      solicitante: datos.solicitante || null,
      horaSalida: datos.horaSalida,
      horaInicio: datos.horaInicio,
      horaFinalizacion: datos.horaFinalizacion,
      horaRetorno: datos.horaRetorno,
      equipoId: datos.equipoId,
      operadorId: datos.operadorId,
      estado: datos.estado,
      observaciones: datos.observaciones?.trim() || null,
    },
  })
}

export async function guardarCotizacionAlquilerRepository(input: {
  guiaAlquilerId: string
  numeroCotizacion: string
  modoIGVCotizacion: "SIN_IGV" | "CON_IGV" | "IGV_INCLUIDO"
  subtotal: number
  igv: number
  total: number
}) {
  return prisma.guiaAlquiler.update({
    where: { id: input.guiaAlquilerId },
    data: {
      numeroCotizacion: input.numeroCotizacion,
      modoIGVCotizacion: input.modoIGVCotizacion,
      subtotal: input.subtotal,
      igv: input.igv,
      total: input.total,
    },
  })
}

export async function registrarPagoAlquilerRepository(
  guiaAlquilerId: string,
  pago: Omit<PagoAlquilerInput, "guiaAlquilerId">
) {
  return prisma.guiaAlquiler.update({
    where: { id: guiaAlquilerId },
    data: {
      estadoPago: "PAGADO",
      metodoPago: pago.metodoPago,
      numeroOperacion: pago.numeroOperacion?.trim() || null,
      fechaPago: new Date(`${pago.fechaPago}T00:00:00.000Z`),
      horaPago: new Date(`1970-01-01T${pago.horaPago}:00.000Z`),
    },
  })
}
