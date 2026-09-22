import type { ElementoTrasegadoFormValue } from "../types"

export function crearIngresoVacio() {
  return {
    empresaTransporte: {
      ruc: "",
      nombre: "",
      telefono: "",
      contactoLogistico: "",
      nombreEncargado: "",
    },
    vehiculo: {
      placa: "",
      tipo: null,
      descripcion: "",
    },
    conductor: {
      numeroLicencia: "",
      nombreCompleto: "",
      telefono: "",
    },
    elementos: [],
  }
}

/**
 * Valores por defecto para una nueva guía de trasegado.
 * Nota: `fechaIngreso` se resuelve en el hook para usar la fecha actual.
 */
export function crearElementoVacio(
  tipo: ElementoTrasegadoFormValue["tipo"]
): ElementoTrasegadoFormValue {
  switch (tipo) {
    case "CONTENEDOR":
      return {
        tipo: "CONTENEDOR",
        contenedor: {
          numeroContenedor: "",
          marca: "",
          medida: 20,
          tipo: "NORMAL",
        },
        observaciones: "",
      }

    case "FLAT_RACK":
      return {
        tipo: "FLAT_RACK",
        flatRack: { numero: "", marca: "" },
        observaciones: "",
      }

    case "MERCADERIA":
      return {
        tipo: "MERCADERIA",
        numero: "",
        descripcion: "",
        observaciones: "",
      }

    case "MAQUINARIA":
      return {
        tipo: "MAQUINARIA",
        numero: "",
        descripcion: "",
        observaciones: "",
      }
  }
}
