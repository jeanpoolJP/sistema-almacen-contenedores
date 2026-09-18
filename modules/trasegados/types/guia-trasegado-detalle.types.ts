// modules\trasegados\types\guia-trasegado-detalle.types.ts

/**
 * Guía de trasegado con su ingreso, elementos, salidas,
 * cliente y toda la información necesaria para el detalle.
 */
export interface GuiaTrasegadoDetalle {
  id: number
  numeroGuia: string
  descripcionServicio: string | null
  fechaIngreso: Date
  estado: "EN_PROCESO" | "FINALIZADO"

  estadoPago: "PENDIENTE" | "PAGADO"
  metodoPago: string | null
  numeroOperacion: string | null
  fechaPago: Date | null

  tratamientoIGV: "SIN_IGV" | "CON_IGV"
  subtotal: number | null
  porcentajeIGV: number | null
  montoIGV: number | null
  totalPagar: number | null

  observaciones: string | null

  cliente: {
    id: number
    tipoDocumento: "DNI" | "RUC"
    numeroDocumento: string
    nombreCompleto: string | null
    telefono: string | null
    observaciones: string | null
  } | null

  ingreso: {
    id: number
    empresaTransporte: {
      id: number
      ruc: string
      nombre: string
      telefono: string | null
      contactoLogistico: string | null
      nombreEncargado: string | null
    }
    vehiculo: {
      id: number
      placa: string
      tipo: "PORTA_CONTENEDORES" | "CAMA_BAJA" | "OTRO" | null
      descripcion: string | null
    }
    conductor: {
      id: number
      numeroLicencia: string
      nombreCompleto: string
      telefono: string | null
    }
    elementos: GuiaTrasegadoElementoDetalle[]
  } | null

  salidas: GuiaTrasegadoSalidaDetalle[]
}

export interface GuiaTrasegadoElementoDetalle {
  id: number
  tipo: "CONTENEDOR" | "FLAT_RACK" | "MERCADERIA" | "MAQUINARIA" | "OTRO"
  numero: string | null
  descripcion: string | null
  observaciones: string | null

  contenedor: {
    id: number
    numeroContenedor: string
    marca: string
    medida: number
    tipo: "NORMAL" | "REEFER"
  } | null

  flatRack: {
    id: number
    numero: string
    marca: string
  } | null

  // Si ya fue retirado en alguna salida, se marca
  retirado: boolean
}

export interface GuiaTrasegadoSalidaDetalle {
  id: number
  fechaSalida: Date
  observaciones: string | null

  empresaTransporte: {
    id: number
    ruc: string
    nombre: string
  }
  vehiculo: {
    id: number
    placa: string
  }
  conductor: {
    id: number
    nombreCompleto: string
  }

  elementos: Array<{
    elementoId: number
    tipo: string
    numero: string | null
    descripcion: string | null
  }>
}
