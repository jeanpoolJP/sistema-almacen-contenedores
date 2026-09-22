import { prisma } from "@/lib/prisma"

import { obtenerOCrearEmpresaTransporte } from "@/modules/empresas-transporte/empresa-transporte.service"
import { obtenerOCrearVehiculo } from "@/modules/vehiculos/vehiculos.service"
import { obtenerOCrearConductor } from "@/modules/conductores/conductores.service"
import { obtenerOCrearContenedor } from "@/modules/contenedores/contenedores.service"
import { findOrCreateFlatRackService } from "@/modules/flat-racks/flat-rack.service"

import {
  registrarIngresoSchema,
  type RegistrarIngresoInput,
} from "../schemas/registrar-ingreso.schema"

export async function registrarIngresoTrasegadoService(
  input: RegistrarIngresoInput
) {
  const datos = registrarIngresoSchema.parse(input)
  const guia = await prisma.guiaTrasegado.findUnique({
    where: { id: datos.guiaTrasegadoId },
    select: { id: true, numeroGuia: true, estado: true },
  })

  if (!guia) throw new Error("La guía de trasegado no existe.")
  if (guia.estado === "FINALIZADO") {
    throw new Error(`La guía "${guia.numeroGuia}" está finalizada.`)
  }

  const empresa = await obtenerOCrearEmpresaTransporte(
    datos.ingreso.empresaTransporte
  )
  const vehiculo = await obtenerOCrearVehiculo(datos.ingreso.vehiculo)
  const conductor = await obtenerOCrearConductor(datos.ingreso.conductor)

  const elementos = await Promise.all(
    datos.ingreso.elementos.map(async (elemento) => {
      if (elemento.tipo === "CONTENEDOR") {
        const contenedor = await obtenerOCrearContenedor(elemento.contenedor)
        return {
          tipo: elemento.tipo,
          contenedorId: contenedor.id,
          flatRackId: null,
          numero: contenedor.numeroContenedor,
          observaciones: elemento.observaciones?.trim() || null,
        }
      }
      if (elemento.tipo === "FLAT_RACK") {
        const flatRack = await findOrCreateFlatRackService(
          elemento.flatRack.numero,
          elemento.flatRack.marca
        )
        return {
          tipo: elemento.tipo,
          contenedorId: null,
          flatRackId: flatRack.id,
          numero: flatRack.numero,
          observaciones: elemento.observaciones?.trim() || null,
        }
      }
      return {
        tipo: elemento.tipo,
        contenedorId: null,
        flatRackId: null,
        numero: elemento.numero.trim().toUpperCase(),
        descripcion: elemento.descripcion?.trim() || null,
        observaciones: elemento.observaciones?.trim() || null,
      }
    })
  )

  return prisma.$transaction(async (tx) => {
    const contenedorIds = elementos.flatMap((elemento) =>
      elemento.contenedorId ? [elemento.contenedorId] : []
    )
    const flatRackIds = elementos.flatMap((elemento) =>
      elemento.flatRackId ? [elemento.flatRackId] : []
    )

    const pendientes = await tx.guiaTrasegadoElemento.findMany({
      where: {
        OR: [
          ...(contenedorIds.length
            ? [{ contenedorId: { in: contenedorIds } }]
            : []),
          ...(flatRackIds.length ? [{ flatRackId: { in: flatRackIds } }] : []),
        ],
        salidas: { none: {} },
      },
      select: { numero: true },
    })
    if (pendientes.length)
      throw new Error(
        `Uno de los elementos ya está pendiente de retiro en otra guía.`
      )

    const ingreso = await tx.guiaTrasegadoIngreso.create({
      data: {
        guiaTrasegadoId: datos.guiaTrasegadoId,
        empresaTransporteId: empresa.id,
        vehiculoId: vehiculo.id,
        conductorId: conductor.id,
        elementos: { create: elementos },
      },
      select: { id: true, guiaTrasegadoId: true },
    })
    return ingreso
  })
}
