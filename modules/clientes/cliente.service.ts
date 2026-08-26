// modules/clientes/cliente.service.ts

import {
  clienteBuscarDocumentoSchema,
  clienteSchema,
} from "./cliente.schema";

import {
  createCliente,
  deactivateCliente,
  findClienteByDocumento,
  findClienteById,
  findClientes,
  updateCliente,
  countClientes,
} from "./cliente.repository";

import type { ClienteFormData } from "./cliente.types";

/**
 * Busca un cliente por su número de documento.
 *
 * Si existe, lo devuelve.
 * Si no existe, lo crea y lo devuelve.
 *
 * Esta función puede ser utilizada por el módulo
 * de Guías al momento de registrar una nueva guía.
 */
export async function obtenerOCrearCliente(
  data: ClienteFormData,
) {
  // 1. Validar los datos del cliente
  const datosValidados = clienteSchema.parse(data);

  // 2. Buscar si ya existe por número de documento
  const clienteExistente = await findClienteByDocumento(
    datosValidados.numeroDocumento,
  );

  // 3. Si existe, devolverlo
  if (clienteExistente) {
    return clienteExistente;
  }

  // 4. Si no existe, crearlo
  return createCliente({
    tipoDocumento: datosValidados.tipoDocumento,
    numeroDocumento: datosValidados.numeroDocumento,
    nombreCompleto: datosValidados.nombreCompleto,
    telefono: datosValidados.telefono || null,
    observaciones: datosValidados.observaciones || null,
    activo: datosValidados.activo,
  });
}

/**
 * Busca un cliente por su número de documento.
 *
 * Acepta:
 * - DNI: 8 dígitos
 * - RUC: 11 dígitos
 */
export async function obtenerClientePorDocumento(
  numeroDocumento: string,
) {
  const { numeroDocumento: documentoValido } =
    clienteBuscarDocumentoSchema.parse({
      numeroDocumento,
    });

  return findClienteByDocumento(documentoValido);
}

/**
 * Busca un cliente por su ID.
 */
export async function obtenerClientePorId(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ID del cliente no es válido");
  }

  return findClienteById(id);
}

/**
 * Obtiene una página de clientes.
 */
export async function obtenerClientes(
  page: number = 1,
  pageSize: number = 10,
) {
  return findClientes(
    page,
    pageSize,
  );
}

/**
 * Obtiene la cantidad total de clientes.
 */
export async function contarClientes() {
  return countClientes();
}
/**
 * Registra un nuevo cliente.
 *
 * Reglas:
 * - El documento debe ser un DNI o RUC válido.
 * - No puede existir otro cliente con el mismo documento.
 */
export async function registrarCliente(
  data: ClienteFormData,
) {
  const datosValidados = clienteSchema.parse(data);

  const clienteExistente = await findClienteByDocumento(
    datosValidados.numeroDocumento,
  );

  if (clienteExistente) {
    throw new Error(
      `Ya existe un cliente registrado con este ${datosValidados.tipoDocumento}.`,
    );
  }

  return createCliente({
    tipoDocumento: datosValidados.tipoDocumento,
    numeroDocumento: datosValidados.numeroDocumento,
    nombreCompleto: datosValidados.nombreCompleto,
    telefono: datosValidados.telefono || null,
    observaciones: datosValidados.observaciones || null,
    activo: datosValidados.activo,
  });
}

/**
 * Actualiza un cliente existente.
 *
 * Verifica que el documento no pertenezca
 * a otro cliente.
 */
export async function actualizarCliente(
  id: number,
  data: ClienteFormData,
) {
  const datosValidados = clienteSchema.parse(data);

  const cliente = await findClienteById(id);

  if (!cliente) {
    throw new Error("El cliente no existe");
  }

  const clienteExistente = await findClienteByDocumento(
    datosValidados.numeroDocumento,
  );

  if (
    clienteExistente &&
    clienteExistente.id !== id
  ) {
    throw new Error(
      `Ya existe otro cliente registrado con este ${datosValidados.tipoDocumento}.`,
    );
  }

  return updateCliente(id, {
    tipoDocumento: datosValidados.tipoDocumento,
    numeroDocumento: datosValidados.numeroDocumento,
    nombreCompleto: datosValidados.nombreCompleto,
    telefono: datosValidados.telefono || null,
    observaciones: datosValidados.observaciones || null,
    activo: datosValidados.activo,
  });
}

/**
 * Desactiva un cliente.
 *
 * No elimina físicamente el registro.
 */
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