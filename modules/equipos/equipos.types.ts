import type { Equipo as PrismaEquipo } from "@/lib/generated/prisma/client"

export type Equipo = Omit<PrismaEquipo, "capacidadCarga"> & {
  capacidadCarga: string | null
}

export type EquipoListado = {
  equipos: Equipo[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
}

export type EquipoActionState = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[] | undefined>
}
