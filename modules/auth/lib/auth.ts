import { prisma } from "@/lib/prisma";

export async function obtenerUsuarioAuth() {
  return prisma.usuarioAuth.findFirst();
}