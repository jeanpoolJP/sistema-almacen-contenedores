import type { Prisma } from "@/lib/generated/prisma/client"
import { filtroOperadoresSchema, operadorSchema } from "./operadores.schema"
import {
  countOperadores,
  countOperadoresActivos,
  createOperador,
  findOperadorById,
  findOperadores,
  setOperadorActivo,
  updateOperador,
} from "./operadores.repository"
import type { FiltroOperadores, OperadorFormData } from "./operadores.schema"

function construirFiltro(
  busqueda: string,
  estado: "todos" | "activos" | "inactivos"
): Prisma.OperadorWhereInput {
  const condiciones: Prisma.OperadorWhereInput[] = []
  if (busqueda) {
    condiciones.push({
      OR: [
        { nombres: { contains: busqueda, mode: "insensitive" } },
        { apellidos: { contains: busqueda, mode: "insensitive" } },
        { numeroDocumento: { contains: busqueda, mode: "insensitive" } },
        { licencia: { contains: busqueda, mode: "insensitive" } },
      ],
    })
  }
  if (estado !== "todos") condiciones.push({ activo: estado === "activos" })
  return condiciones.length ? { AND: condiciones } : {}
}

export async function listarOperadores(filtros: FiltroOperadores = {}) {
  const { busqueda, estado, pagina, porPagina } =
    filtroOperadoresSchema.parse(filtros)
  const where = construirFiltro(busqueda, estado)
  const [operadores, total, activos] = await Promise.all([
    findOperadores(where, pagina, porPagina),
    countOperadores(where),
    countOperadoresActivos(),
  ])
  return {
    operadores,
    total,
    pagina,
    porPagina,
    totalPaginas: Math.ceil(total / porPagina),
    activos,
  }
}

function prepararDatos(data: OperadorFormData) {
  const parsed = operadorSchema.parse(data)
  return {
    ...parsed,
    telefono: parsed.telefono || null,
    licencia: parsed.licencia ? parsed.licencia.toUpperCase() : null,
    observaciones: parsed.observaciones || null,
  }
}

export function crearOperador(data: OperadorFormData) {
  return createOperador(prepararDatos(data))
}

export async function editarOperador(id: string, data: OperadorFormData) {
  const existente = await findOperadorById(id)
  if (!existente) throw new Error("El operador no existe")
  return updateOperador(id, prepararDatos(data))
}

export function cambiarEstadoOperador(id: string, activo: boolean) {
  return setOperadorActivo(id, activo)
}
