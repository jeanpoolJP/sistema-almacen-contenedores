import type { Cliente as PrismaCliente } from "@/lib/generated/prisma/client";

import type {
  clienteSchema,
  clienteDniSchema,
} from "./cliente.schema";

import type { z } from "zod";

/**
 * Datos utilizados por el formulario.
 */
export type ClienteFormData = z.input<typeof clienteSchema>;

/**
 * Datos después de pasar por la validación de Zod.
 */
export type ClienteFormValidated = z.output<typeof clienteSchema>;

/**
 * Datos completos de un cliente.
 */
export type Cliente = PrismaCliente;

/**
 * Datos utilizados para buscar un cliente por DNI.
 */
export type ClienteDniData = z.input<typeof clienteDniSchema>;