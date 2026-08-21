// modules/contenedores/contenedores.types.ts

import type {
  Contenedor as PrismaContenedor,
} from "@/lib/generated/prisma/client";

import type { z } from "zod";

import type {
  contenedorSchema,
  contenedorNumeroSchema,
  contenedorIdSchema,
} from "./contenedores.schema";

/**
 * Datos originales utilizados por el formulario.
 */
export type ContenedorFormData =
  z.input<typeof contenedorSchema>;

/**
 * Datos después de pasar por la validación
 * y transformaciones de Zod.
 */
export type ContenedorFormValidated =
  z.output<typeof contenedorSchema>;

/**
 * Contenedor completo generado por Prisma.
 */
export type Contenedor = PrismaContenedor;

/**
 * Datos utilizados para buscar un contenedor
 * mediante su número.
 */
export type ContenedorNumeroData =
  z.input<typeof contenedorNumeroSchema>;

/**
 * Datos utilizados para identificar un contenedor
 * mediante su ID.
 */
export type ContenedorIdData =
  z.input<typeof contenedorIdSchema>;

/**
 * Tipo de contenedor.
 *
 * Valores:
 * - NORMAL
 * - REEFER
 */
export type TipoContenedor =
  Contenedor["tipo"];

/**
 * Medidas permitidas para los contenedores.
 */
export type MedidaContenedor = 20 | 40;