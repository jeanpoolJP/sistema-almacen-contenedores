// app\actions\page.ts

"use server";

import { prisma } from "@/lib/prisma";

interface CrearClienteData {
  dni?: string;
  nombreCompleto?: string;
  telefono?: string;
  observaciones?: string;
}

export async function crearCliente(data: CrearClienteData) {
  try {
    const cliente = await prisma.cliente.create({
      data: {
        dni: data.dni || null,
        nombreCompleto: data.nombreCompleto || null,
        telefono: data.telefono || null,
        observaciones: data.observaciones || null,
      },
    });

    return {
      success: true,
      data: cliente,
    };
  } catch (error) {
    console.error("Error al crear cliente:", error);

    return {
      success: false,
      error: "No se pudo crear el cliente.",
    };
  }
}
