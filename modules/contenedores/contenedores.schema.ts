// modules/contenedores/contenedores.schema.ts

import { z } from "zod";
import { TipoContenedor } from "@/lib/generated/prisma/client";

/**
 * Esquema para crear y actualizar un contenedor.
 */
export const contenedorSchema = z.object({
  numeroContenedor: z
    .string()
    .trim()
    .min(
      1,
      "El número de contenedor es obligatorio",
    )
    .max(
      20,
      "El número de contenedor no puede superar los 20 caracteres",
    )
    .transform((value) => value.toUpperCase()),

  marca: z
    .string()
    .trim()
    .min(
      1,
      "La marca del contenedor es obligatoria",
    )
    .max(
      100,
      "La marca no puede superar los 100 caracteres",
    ),

  medida: z
    .number({
      error: "La medida del contenedor es obligatoria",
    })
    .refine(
      (value) => value === 20 || value === 40,
      {
        message:
          "La medida debe ser 20 o 40 pies",
      },
    ),

  tipo: z.enum(TipoContenedor, {
    error:
      "El tipo debe ser NORMAL o REEFER",
  }),
});

/**
 * Esquema para buscar un contenedor
 * por su número.
 */
export const contenedorNumeroSchema =
  z.object({
    numeroContenedor: z
      .string()
      .trim()
      .min(
        1,
        "Ingresa el número del contenedor",
      )
      .max(
        20,
        "El número de contenedor no puede superar los 20 caracteres",
      )
      .transform((value) => value.toUpperCase()),
  });

/**
 * Esquema para validar el ID de un contenedor.
 */
export const contenedorIdSchema = z.object({
  id: z
    .number({
      error: "El ID del contenedor no es válido",
    })
    .int("El ID debe ser un número entero")
    .positive("El ID debe ser mayor que cero"),
});