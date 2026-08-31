// modules/auth/lib/auth.ts

import { prisma } from "@/lib/prisma"

export async function obtenerUsuarioAuth() {
  return prisma.usuarioAuth.findFirst({
    select: {
      id: true,
      passwordHash: true,
    },
  })
}
