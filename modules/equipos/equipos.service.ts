import type { Prisma } from "@/lib/generated/prisma/client"

import { equipoSchema, filtrosEquiposSchema } from "./equipos.schema"
import type { EquipoFormData, FiltrosEquipos } from "./equipos.schema"
import {
  countEquipos,
  createEquipo,
  findEquipoById,
  findEquipos,
  updateEquipo,
  updateEstadoEquipo,
} from "./equipos.repository"
import type { Equipo } from "./equipos.types"

function construirWhere(
  busqueda: string,
  tipo: "todos" | "MONTACARGAS" | "STACKER" | "OTRO",
  estado: "todos" | "DISPONIBLE" | "EN_REPARACION" | "INOPERATIVO"
): Prisma.EquipoWhereInput {
  const condiciones: Prisma.EquipoWhereInput[] = []

  if (busqueda) {
    condiciones.push({
      OR: [
        { codigo: { contains: busqueda, mode: "insensitive" } },
        { nombre: { contains: busqueda, mode: "insensitive" } },
        { marca: { contains: busqueda, mode: "insensitive" } },
        { modelo: { contains: busqueda, mode: "insensitive" } },
        { placa: { contains: busqueda, mode: "insensitive" } },
      ],
    })
  }

  if (tipo !== "todos") condiciones.push({ tipo })
  if (estado !== "todos") condiciones.push({ estado })

  return condiciones.length ? { AND: condiciones } : {}
}

export async function listarEquipos(filtros: FiltrosEquipos = {}) {
  const { busqueda, tipo, estado, pagina, porPagina } =
    filtrosEquiposSchema.parse(filtros)
  const where = construirWhere(busqueda, tipo, estado)
  const [resultados, total] = await Promise.all([
    findEquipos(where, pagina, porPagina),
    countEquipos(where),
  ])

  const equipos: Equipo[] = resultados.map((equipo) => ({
    ...equipo,
    capacidadCarga: equipo.capacidadCarga?.toString() ?? null,
  }))

  return {
    equipos,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
  }
}

export function crearEquipo(data: EquipoFormData) {
  return createEquipo(data)
}

export async function editarEquipo(id: string, data: EquipoFormData) {
  const actual = await findEquipoById(id)
  if (!actual) throw new Error("El equipo no existe")
  return updateEquipo(id, data)
}

export function cambiarEstadoEquipo(
  id: string,
  estado: Prisma.EquipoUpdateInput["estado"]
) {
  return updateEstadoEquipo(id, estado)
}
