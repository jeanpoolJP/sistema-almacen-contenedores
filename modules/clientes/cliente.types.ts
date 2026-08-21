// modules/clientes/cliente.types.ts

import type { Cliente as PrismaCliente } from "@/lib/generated/prisma/client";
import type {
  clienteSchema,
  clienteDocumentoSchema,
  clienteBuscarDocumentoSchema,
} from "./cliente.schema";
import type { z } from "zod";

/**
 * Datos que recibe el formulario.
 */
export type ClienteFormData = z.input<typeof clienteSchema>;

/**
 * Datos después de la validación de Zod.
 */
export type ClienteFormValidated = z.output<typeof clienteSchema>;

/**
 * Cliente completo generado por Prisma.
 */
export type Cliente = PrismaCliente;

/**
 * Tipo de documento disponible.
 */
export type TipoDocumento = Cliente["tipoDocumento"];

/**
 * Datos para buscar un cliente por tipo y número de documento.
 */
export type ClienteDocumentoData = z.input<
  typeof clienteDocumentoSchema
>;

/**
 * Datos para buscar un cliente únicamente
 * mediante su número de documento.
 */
export type ClienteBuscarDocumentoData = z.input<
  typeof clienteBuscarDocumentoSchema
>;