import { prisma } from "@/lib/prisma";

export async function obtenerConfiguracionPrecio() {
  return prisma.configuracionPrecio.findFirst({
    where: {
      activo: true,
    },
    orderBy: {
      id: "desc",
    },
  });
}

export async function crearConfiguracionPrecio(data: {
  precioPrimerDia: number;
  precioDiaAdicional: number;
  porcentajeIGV: number;
}) {
  return prisma.configuracionPrecio.create({
    data: {
      precioPrimerDia: data.precioPrimerDia,
      precioDiaAdicional: data.precioDiaAdicional,
      porcentajeIGV: data.porcentajeIGV,
      activo: true,
    },
  });
}

export async function actualizarConfiguracionPrecio(
  id: number,
  data: {
    precioPrimerDia: number;
    precioDiaAdicional: number;
    porcentajeIGV: number;
  }
) {
  return prisma.configuracionPrecio.update({
    where: {
      id,
    },
    data: {
      precioPrimerDia: data.precioPrimerDia,
      precioDiaAdicional: data.precioDiaAdicional,
      porcentajeIGV: data.porcentajeIGV,
    },
  });
}