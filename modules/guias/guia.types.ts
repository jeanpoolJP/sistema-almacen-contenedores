import type {
  EstadoGuia,
  TipoPrecioGuia,
  TratamientoIGV,
} from "@/lib/generated/prisma";

export type CalculoAlmacenamiento = {
  diasAlmacenamiento: number;
};

export type CalculoMonto = {
  subtotal: number;
  montoIGV: number;
  montoTotal: number;
};

export type DatosCalculoMonto = {
  diasAlmacenamiento: number;
  precioPrimerDia: number;
  precioDiaAdicional: number;
  tratamientoIGV: TratamientoIGV;
  porcentajeIGV: number;
};

export type CrearGuiaInput = {
  numeroGuia: string;

  clienteId?: number | null;
  contenedorId: number;

  empresaTransporteIngresoId: number;
  vehiculoIngresoId: number;
  conductorIngresoId: number;

  fechaIngreso: Date;
  horaIngreso: Date;

  empresaTransporteSalidaId?: number | null;
  vehiculoSalidaId?: number | null;
  conductorSalidaId?: number | null;

  fechaSalida?: Date | null;
  horaSalida?: Date | null;

  diasAlmacenamiento?: number | null;

  tipoPrecio: TipoPrecioGuia;

  precioPrimerDia: number;
  precioDiaAdicional: number;

  subtotal?: number | null;
  porcentajeIGV?: number | null;
  montoIGV?: number | null;
  montoTotal?: number | null;

  tratamientoIGV: TratamientoIGV;

  estado: EstadoGuia;

  observaciones?: string | null;
};

export type ActualizarSalidaGuiaInput = {
  guiaId: number;

  empresaTransporteSalidaId: number;
  vehiculoSalidaId: number;
  conductorSalidaId: number;

  fechaSalida: Date;
  horaSalida: Date;

  tratamientoIGV: TratamientoIGV;
};