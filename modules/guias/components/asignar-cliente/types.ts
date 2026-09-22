// modules\guias\components\asignar-cliente\types.ts

export type ClienteFrecuente = {
  id: number
  tipoDocumento: "DNI" | "RUC"
  numeroDocumento: string
  nombreCompleto: string | null
  _count: {
    guiasInternamiento: number
  }
}

export type ClienteEncontrado = {
  id: number
  tipoDocumento: "DNI" | "RUC"
  numeroDocumento: string
  nombreCompleto: string | null
  telefono: string | null
  observaciones: string | null
  activo: boolean
}

export type ClienteActual = Pick<
  ClienteEncontrado,
  "id" | "tipoDocumento" | "numeroDocumento" | "nombreCompleto"
>

export type AsignarClienteDialogProps = {
  guiaId: number
  numeroGuia: string
  clienteActual: ClienteActual | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAsignada: () => void
}
