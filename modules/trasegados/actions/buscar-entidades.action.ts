"use server"

import { prisma } from "@/lib/prisma"

/**
 * Resultado genérico de una búsqueda de entidad.
 */
export type BuscarEntidadResult<T> = { found: true; data: T } | { found: false }

/**
 * Busca un contenedor por número.
 * Si existe, devuelve sus datos para autocompletar y bloquear.
 */
export async function buscarContenedorAction(numero: string): Promise<
  BuscarEntidadResult<{
    id: number
    numeroContenedor: string
    marca: string
    medida: number
    tipo: "NORMAL" | "REEFER"
  }>
> {
  const numeroNormalizado = numero.trim().toUpperCase()

  if (!numeroNormalizado) return { found: false }

  const contenedor = await prisma.contenedor.findUnique({
    where: { numeroContenedor: numeroNormalizado },
    select: {
      id: true,
      numeroContenedor: true,
      marca: true,
      medida: true,
      tipo: true,
    },
  })

  if (!contenedor) return { found: false }

  return { found: true, data: contenedor }
}

/**
 * Busca un flat rack por número.
 */
export async function buscarFlatRackAction(numero: string): Promise<
  BuscarEntidadResult<{
    id: number
    numero: string
    marca: string
  }>
> {
  const numeroNormalizado = numero.trim().toUpperCase()

  if (!numeroNormalizado) return { found: false }

  const flatRack = await prisma.flatRack.findUnique({
    where: { numero: numeroNormalizado },
    select: { id: true, numero: true, marca: true },
  })

  if (!flatRack) return { found: false }

  return { found: true, data: flatRack }
}

/**
 * Busca una empresa de transporte por RUC.
 */
export async function buscarEmpresaTransporteAction(ruc: string): Promise<
  BuscarEntidadResult<{
    id: number
    ruc: string
    nombre: string
    telefono: string | null
    contactoLogistico: string | null
    nombreEncargado: string | null
  }>
> {
  const rucNormalizado = ruc.trim()

  if (!rucNormalizado) return { found: false }

  const empresa = await prisma.empresaTransporte.findUnique({
    where: { ruc: rucNormalizado },
    select: {
      id: true,
      ruc: true,
      nombre: true,
      telefono: true,
      contactoLogistico: true,
      nombreEncargado: true,
    },
  })

  if (!empresa) return { found: false }

  return { found: true, data: empresa }
}

/**
 * Busca un vehículo por placa.
 */
export async function buscarVehiculoAction(placa: string): Promise<
  BuscarEntidadResult<{
    id: number
    placa: string
    tipo: "PORTA_CONTENEDORES" | "CAMA_BAJA" | "OTRO" | null
    descripcion: string | null
  }>
> {
  const placaNormalizada = placa.trim().toUpperCase()

  if (!placaNormalizada) return { found: false }

  const vehiculo = await prisma.vehiculo.findUnique({
    where: { placa: placaNormalizada },
    select: {
      id: true,
      placa: true,
      tipo: true,
      descripcion: true,
    },
  })

  if (!vehiculo) return { found: false }

  return { found: true, data: vehiculo }
}

/**
 * Busca un conductor por licencia.
 */
export async function buscarConductorAction(numeroLicencia: string): Promise<
  BuscarEntidadResult<{
    id: number
    numeroLicencia: string
    nombreCompleto: string
    telefono: string | null
  }>
> {
  const licenciaNormalizada = numeroLicencia.trim().toUpperCase()

  if (!licenciaNormalizada) return { found: false }

  const conductor = await prisma.conductor.findUnique({
    where: { numeroLicencia: licenciaNormalizada },
    select: {
      id: true,
      numeroLicencia: true,
      nombreCompleto: true,
      telefono: true,
    },
  })

  if (!conductor) return { found: false }

  return { found: true, data: conductor }
}
