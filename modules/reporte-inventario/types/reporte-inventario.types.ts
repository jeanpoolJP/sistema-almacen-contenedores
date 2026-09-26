/**
 * Un contenedor dentro del reporte, ya formateado para mostrar.
 */
export interface ContenedorInventarioItem {
  /** Marca + número de contenedor concatenados, ej: "WHSU5038108" */
  contenedor: string;
  numeroGuia: string;
  /** dd/mm/yyyy */
  fechaIngreso: string;
}

/**
 * Grupo de contenedores por medida (40', 20', etc.)
 */
export interface GrupoMedidaInventario {
  medida: number;
  contenedores: ContenedorInventarioItem[];
}

/**
 * Estructura completa que consume el componente PDF.
 */
export interface ReporteInventarioData {
  almacen: string;
  /** dd/mm/yyyy */
  fechaCorte: string;
  cliente: {
    nombre: string;
    documento: string; // ej: "RUC 20123456789"
  };
  totalContenedores: number;
  grupos: GrupoMedidaInventario[];
}

/**
 * Opción de cliente para el selector del formulario.
 */
export interface ClienteOption {
  id: number;
  nombre: string;
  documento: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
