import {
  clienteDniSchema,
  clienteSchema,
} from "./cliente.schema";

import {
  createCliente,
  deactivateCliente,
  findClienteByDni,
  findClienteById,
  findClientes,
  updateCliente,
} from "./cliente.repository";

import type { ClienteFormData } from "./cliente.types";

export async function obtenerClientePorDni(dni: string) {
  const { dni: dniValido } = clienteDniSchema.parse({
    dni,
  });

  return findClienteByDni(dniValido);
}

export async function obtenerClientePorId(id: number) {
  return findClienteById(id);
}

export async function obtenerClientes() {
  return findClientes();
}

export async function registrarCliente(data: ClienteFormData) {
  const datosValidados = clienteSchema.parse(data);

  const clienteExistente = await findClienteByDni(
    datosValidados.dni,
  );

  if (clienteExistente) {
    throw new Error(
      "Ya existe un cliente registrado con este DNI",
    );
  }

  return createCliente({
    dni: datosValidados.dni,
    nombreCompleto: datosValidados.nombreCompleto,
    telefono: datosValidados.telefono || null,
    observaciones: datosValidados.observaciones || null,
    activo: datosValidados.activo,
  });
}

export async function actualizarCliente(
  id: number,
  data: ClienteFormData,
) {
  const datosValidados = clienteSchema.parse(data);

  const clienteExistente = await findClienteByDni(
    datosValidados.dni,
  );

  if (
    clienteExistente &&
    clienteExistente.id !== id
  ) {
    throw new Error(
      "Ya existe otro cliente registrado con este DNI",
    );
  }

  return updateCliente(id, {
    dni: datosValidados.dni,
    nombreCompleto: datosValidados.nombreCompleto,
    telefono: datosValidados.telefono || null,
    observaciones: datosValidados.observaciones || null,
    activo: datosValidados.activo,
  });
}

export async function desactivarCliente(id: number) {
  const cliente = await findClienteById(id);

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  if (!cliente.activo) {
    throw new Error("El cliente ya está desactivado");
  }

  return deactivateCliente(id);
}