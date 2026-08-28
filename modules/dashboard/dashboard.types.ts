import type { EstadoGuia, EstadoPago, TipoContenedor } from "@/lib/generated/prisma";

export interface DashboardStats {
  contenedoresAlmacenados: number;
  ingresosHoy: number;
  salidasHoy: number;
  montoPorCobrar: number;
  montoCobradoMes: number;
  clientesActivos: number;
  guiasDelMes: number;
}

export interface DistribucionTipoContenedor {
  tipo: TipoContenedor;
  cantidad: number;
}

export interface MovimientoDiario {
  fecha: string; // YYYY-MM-DD
  ingresos: number;
  salidas: number;
}

export interface IngresoMensual {
  mes: string; // "Ene 2026"
  monto: number;
}

export interface GuiaReciente {
  id: number;
  numeroGuia: string;
  clienteNombre: string;
  numeroContenedor: string;
  tipoContenedor: TipoContenedor;
  estado: EstadoGuia;
  estadoPago: EstadoPago;
  fechaIngreso: Date;
  montoTotal: number | null;
}

export interface PagoPendiente {
  id: number;
  numeroGuia: string;
  clienteNombre: string;
  montoTotal: number;
  diasAlmacenamiento: number | null;
  fechaIngreso: Date;
}

export interface DashboardData {
  stats: DashboardStats;
  distribucionContenedores: DistribucionTipoContenedor[];
  movimientosDiarios: MovimientoDiario[];
  ingresosMensuales: IngresoMensual[];
  guiasRecientes: GuiaReciente[];
  pagosPendientes: PagoPendiente[];
}
