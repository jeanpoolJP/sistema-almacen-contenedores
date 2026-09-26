import { reporteInventarioRepository } from "../repository/reporte-inventario.repository";
import type {
  ReporteInventarioData,
  ClienteOption,
  ContenedorInventarioItem,
} from "../types/reporte-inventario.types";

/** Ajusta esto al nombre real de tu almacén, o tráelo de una tabla de configuración. */
const NOMBRE_ALMACEN = "KRENCO";

function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(fecha);
}

/** Concatena marca + número de contenedor en un solo campo, con fallback. */
function construirEtiquetaContenedor(marca: string, numero: string): string {
  const m = marca?.trim();
  const n = numero?.trim();

  if (m && n) return `${m}${n}`;
  if (m && !n) return `${m} S/N`;
  if (!m && n) return `S/M ${n}`;
  return "S/M S/N";
}

function construirDocumentoCliente(
  tipoDocumento: string,
  numeroDocumento: string
): string {
  return `${tipoDocumento} ${numeroDocumento}`;
}

export const reporteInventarioService = {
  /** Clientes disponibles para el selector del formulario. */
  async listarClientesDisponibles(): Promise<ClienteOption[]> {
    const clientes =
      await reporteInventarioRepository.listarClientesConContenedoresAlmacenados();

    return clientes
      .map((c) => ({
        id: c.id,
        nombre: c.nombreCompleto ?? `Cliente ${c.numeroDocumento}`,
        documento: construirDocumentoCliente(c.tipoDocumento, c.numeroDocumento),
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  },

  /** Arma la estructura completa que consume el PDF, agrupada por medida. */
  async construirReporte(clienteId: number): Promise<ReporteInventarioData> {
    const cliente = await reporteInventarioRepository.obtenerCliente(clienteId);
    if (!cliente) {
      throw new Error("El cliente seleccionado no existe.");
    }

    const guias =
      await reporteInventarioRepository.obtenerGuiasAlmacenadasPorCliente(
        clienteId
      );

    const porMedida = new Map<number, ContenedorInventarioItem[]>();

    for (const guia of guias) {
      const item: ContenedorInventarioItem = {
        contenedor: construirEtiquetaContenedor(
          guia.contenedor.marca,
          guia.contenedor.numeroContenedor
        ),
        numeroGuia: guia.numeroGuia,
        fechaIngreso: formatearFecha(guia.fechaIngreso),
      };

      const medida = guia.contenedor.medida;
      const lista = porMedida.get(medida) ?? [];
      lista.push(item);
      porMedida.set(medida, lista);
    }

    // Medidas más grandes primero (40' antes que 20'), igual que el reporte de referencia.
    const grupos = Array.from(porMedida.entries())
      .sort(([medidaA], [medidaB]) => medidaB - medidaA)
      .map(([medida, contenedores]) => ({ medida, contenedores }));

    return {
      almacen: NOMBRE_ALMACEN,
      fechaCorte: formatearFecha(new Date()),
      cliente: {
        nombre: cliente.nombreCompleto ?? `Cliente ${cliente.numeroDocumento}`,
        documento: construirDocumentoCliente(
          cliente.tipoDocumento,
          cliente.numeroDocumento
        ),
      },
      totalContenedores: guias.length,
      grupos,
    };
  },
};
