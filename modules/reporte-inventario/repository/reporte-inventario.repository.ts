import { prisma } from "@/lib/prisma";

/**
 * Repositorio: solo acceso a datos, sin lógica de negocio ni formateo.
 * Ajusta el import de `prisma` si tu singleton vive en otra ruta.
 */
export const reporteInventarioRepository = {
  async obtenerCliente(clienteId: number) {
    return prisma.cliente.findUnique({
      where: { id: clienteId },
    });
  },

  /**
   * Guías ALMACENADO de un cliente = lo que hoy tiene ocupando espacio
   * en el almacén (su inventario actual).
   */
  async obtenerGuiasAlmacenadasPorCliente(clienteId: number) {
    return prisma.guiaInternamiento.findMany({
      where: {
        clienteId,
        estado: "ALMACENADO",
      },
      include: {
        contenedor: true,
      },
      orderBy: {
        fechaIngreso: "asc",
      },
    });
  },

  /**
   * Clientes que actualmente tienen al menos un contenedor almacenado,
   * para poblar el selector del formulario.
   */
  async listarClientesConContenedoresAlmacenados() {
    const guias = await prisma.guiaInternamiento.findMany({
      where: {
        estado: "ALMACENADO",
        clienteId: { not: null },
      },
      select: {
        cliente: {
          select: {
            id: true,
            nombreCompleto: true,
            numeroDocumento: true,
            tipoDocumento: true,
          },
        },
      },
      distinct: ["clienteId"],
    });

    return guias
      .map((g) => g.cliente)
      .filter((c): c is NonNullable<typeof c> => c !== null);
  },
};
