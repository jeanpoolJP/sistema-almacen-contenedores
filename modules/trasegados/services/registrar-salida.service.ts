// modules\trasegados\services\registrar-salida.service.ts

import { prisma } from "@/lib/prisma"

import { obtenerOCrearEmpresaTransporte } from "@/modules/empresas-transporte/empresa-transporte.service"
import { obtenerOCrearVehiculo } from "@/modules/vehiculos/vehiculos.service"
import { obtenerOCrearConductor } from "@/modules/conductores/conductores.service"

import {
  crearSalidaRepository,
  listarElementosPendientesRepository,
  obtenerResumenGuiaRepository,
  validarElementosPertenecenAGuiaRepository,
} from "../repository/guia-trasegado.repository"
import {
  registrarSalidaSchema,
  type RegistrarSalidaInput,
} from "../schemas/registrar-salida.schema"
import type { ElementoPendienteSalida } from "../types/registrar-salida.types"

/**
 * Devuelve los elementos del ingreso de una guía que aún
 * no han sido retirados. Se usa para poblar la UI del modal.
 *
 * @throws {Error} Si la guía no existe.
 */
export async function listarElementosPendientesSalidaService(
  guiaTrasegadoId: number
): Promise<ElementoPendienteSalida[]> {
  const guia = await obtenerResumenGuiaRepository(guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${guiaTrasegadoId}.`)
  }

  const elementos = await listarElementosPendientesRepository(guiaTrasegadoId)

  return elementos.map((el) => ({
    id: el.id,
    tipo: el.tipo,
    numero: el.numero,
    descripcion: el.descripcion,
    observaciones: el.observaciones,
    contenedor: el.contenedor
      ? {
          id: el.contenedor.id,
          numeroContenedor: el.contenedor.numeroContenedor,
          marca: el.contenedor.marca,
          medida: el.contenedor.medida,
          tipo: el.contenedor.tipo,
        }
      : null,
    flatRack: el.flatRack
      ? {
          id: el.flatRack.id,
          numero: el.flatRack.numero,
          marca: el.flatRack.marca,
        }
      : null,
  }))
}

/**
 * Registra una salida para una guía de trasegado.
 *
 * Reglas de negocio:
 * 1. La guía debe existir y estar EN_PROCESO.
 * 2. Todos los elementos seleccionados deben pertenecer al ingreso
 *    de la guía y estar pendientes de retiro.
 * 3. La empresa, vehículo y conductor se obtienen o crean por clave
 *    de negocio (RUC, placa, licencia).
 *
 * Toda la operación corre en una transacción.
 *
 * @throws {Error} Si la guía no existe, está finalizada, o algún
 *                 elemento es inválido.
 */
export async function registrarSalidaService(input: RegistrarSalidaInput) {
  const datos = registrarSalidaSchema.parse(input)

  // ------------------ VALIDAR GUÍA ------------------
  const guia = await obtenerResumenGuiaRepository(datos.guiaTrasegadoId)

  if (!guia) {
    throw new Error(`No se encontró la guía con ID ${datos.guiaTrasegadoId}.`)
  }

  if (guia.estado === "FINALIZADO") {
    throw new Error(
      `La guía "${guia.numeroGuia}" está finalizada. No se pueden registrar nuevas salidas.`
    )
  }

  // ------------------ VALIDAR ELEMENTOS ------------------
  const idsInvalidos = await validarElementosPertenecenAGuiaRepository(
    datos.guiaTrasegadoId,
    datos.elementosIds
  )

  if (idsInvalidos.length > 0) {
    throw new Error(
      `Algunos elementos no pertenecen a la guía o ya fueron retirados (IDs: ${idsInvalidos.join(", ")}).`
    )
  }

  // ------------------ RESOLVER ENTIDADES ------------------
  // Fuera de la transacción: son operaciones idempotentes que pueden
  // crear registros maestros y no queremos bloquear la transacción
  // con llamadas externas largas.
  const empresaTransporte = await obtenerOCrearEmpresaTransporte(
    datos.empresaTransporte
  )

  const vehiculo = await obtenerOCrearVehiculo(datos.vehiculo)

  const conductor = await obtenerOCrearConductor(datos.conductor)

  // ------------------ CREAR SALIDA ------------------
  return prisma.$transaction(async (tx) => {
    // Revalidación dentro de la transacción para evitar race conditions.
    // Solo bloquea si el elemento es identificable y ya salió,
    // o si es mercadería ya completada por el usuario.
    const invalidos = await tx.guiaTrasegadoElemento.findMany({
      where: {
        id: { in: datos.elementosIds },
        OR: [
          // No pertenece a esta guía
          {
            ingreso: { guiaTrasegadoId: { not: datos.guiaTrasegadoId } },
          },
          // Identificable ya retirado
          {
            tipo: { in: ["CONTENEDOR", "FLAT_RACK", "MAQUINARIA"] },
            salidas: { some: {} },
          },
          // Mercadería ya completada
          {
            tipo: { in: ["MERCADERIA", "OTRO"] },
            mercaderiaCompletada: true,
          },
        ],
      },
      select: { id: true },
    })

    if (invalidos.length > 0) {
      throw new Error(
        `Algunos elementos no pueden ser retirados (IDs: ${invalidos.map((e) => e.id).join(", ")}).`
      )
    }

    return crearSalidaRepository({
      guiaTrasegadoId: datos.guiaTrasegadoId,
      fechaSalida: datos.fechaSalida,
      empresaTransporteId: empresaTransporte.id,
      vehiculoId: vehiculo.id,
      conductorId: conductor.id,
      observaciones: datos.observaciones?.trim() || null,
      elementosIds: datos.elementosIds,
    })
  })
}
