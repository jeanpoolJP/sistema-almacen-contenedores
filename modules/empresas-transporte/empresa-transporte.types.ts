export type EmpresaTransporte = {
  id: number;
  nombre: string;
  ruc: string | null;
  telefono: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CrearEmpresaTransporteInput = {
  nombre: string;
  ruc?: string | null;
  telefono?: string | null;
};

export type ActualizarEmpresaTransporteInput = {
  id: number;
  nombre: string;
  ruc?: string | null;
  telefono?: string | null;
};

export type CambiarEstadoEmpresaTransporteInput = {
  id: number;
  activo: boolean;
};