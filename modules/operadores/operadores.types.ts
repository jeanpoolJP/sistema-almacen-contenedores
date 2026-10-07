import type { Operador as PrismaOperador } from "@/lib/generated/prisma/client"

export type Operador = PrismaOperador

export type ListadoOperadores = {
  operadores: Operador[]
  total: number
  pagina: number
  porPagina: number
  totalPaginas: number
  activos: number
}

export type ActionState = {
  success: boolean
  message: string
  fieldErrors?: Record<string, string[] | undefined>
}
