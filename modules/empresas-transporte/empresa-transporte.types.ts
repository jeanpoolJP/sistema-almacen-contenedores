// modules/empresas-transporte/empresa-transporte.types.ts

export type EmpresaTransporte = {
  id: number

  nombre: string

  ruc: string

  telefono: string | null

  contactoLogistico: string | null

  nombreEncargado: string | null

  activo: boolean

  createdAt: Date

  updatedAt: Date
}

export type CrearEmpresaTransporteInput = {
  nombre: string

  ruc: string

  telefono?: string | null

  contactoLogistico?: string | null

  nombreEncargado?: string | null
}

export type ActualizarEmpresaTransporteInput = {
  id: number

  nombre: string

  ruc: string

  telefono?: string | null

  contactoLogistico?: string | null

  nombreEncargado?: string | null
}

export type CambiarEstadoEmpresaTransporteInput = {
  id: number

  activo: boolean
}
