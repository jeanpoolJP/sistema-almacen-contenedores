// modules\trasegados\services\crear-guia-trasegado.service.ts

import { prisma } from "@/lib/prisma"

import {
  crearGuiaTrasegadoSchema,
  type CrearGuiaTrasegadoInput,
} from "../schemas/crear-guia-trasegado.schema"

import { obtenerOCrearEmpresaTransporte } from "@/modules/empresas-transporte/empresa-transporte.service"
import { obtenerOCrearVehiculo } from "@/modules/vehiculos/vehiculos.service"
import { obtenerOCrearConductor } from "@/modules/conductores/conductores.service"
import { obtenerOCrearContenedor } from "@/modules/contenedores/contenedores.service"
import { findOrCreateFlatRackService } from "@/modules/flat-racks/flat-rack.service"

/**
 * Crea una nueva guía de trasegado junto con su ingreso
 * y todos los elementos transportados.
 *
 * El servicio recibe los datos naturales utilizados por el usuario
 * (RUC, placa, licencia, número de contenedor, número de Flat Rack, etc.)
 * y utiliza los servicios de cada módulo para obtener o crear
 * las entidades correspondientes.
 *
 * La operación completa se ejecuta dentro de una transacción.
 *
 * @param input Datos de la guía de trasegado.
 * @returns La guía creada con su ingreso y elementos.
 *
 * @throws {ZodError} Si los datos no cumplen el schema.
 * @throws {Error} Si existe una guía con el mismo número.
 * @throws {Error} Si algún elemento identificable ya se encuentra
 *                 pendiente de retiro en otra guía.
 */
export async function crearGuiaTrasegadoService(
  input: CrearGuiaTrasegadoInput
) {
  // ============================================================
  // 1. VALIDAR DATOS DE ENTRADA
  // ============================================================

  const datos = crearGuiaTrasegadoSchema.parse(input)

  // ============================================================
  // 2. NORMALIZAR DATOS GENERALES
  // ============================================================

  const numeroGuia = datos.numeroGuia.trim().toUpperCase()

  const descripcionServicio = datos.descripcionServicio?.trim() || null

  const observaciones = datos.observaciones?.trim() || null

  // ============================================================
  // 3. RESOLVER ENTIDADES DE TODOS LOS INGRESOS
  // ============================================================
  //
  // Estas funciones son responsabilidad de sus respectivos
  // módulos.
  //
  // El módulo de trasegado no debe duplicar su lógica.
  //
  // ============================================================

  const ingresosResueltos = await Promise.all(
    datos.ingresos.map(async (ingreso) => {
      const empresaTransporte = await obtenerOCrearEmpresaTransporte(
        ingreso.empresaTransporte
      )
      const vehiculo = await obtenerOCrearVehiculo(ingreso.vehiculo)
      const conductor = await obtenerOCrearConductor(ingreso.conductor)

      const elementos = await Promise.all(
        ingreso.elementos.map(async (elemento) => {
          // ----------------------------------------------------------
          // CONTENEDOR
          // ----------------------------------------------------------

          if (elemento.tipo === "CONTENEDOR") {
            const contenedor = await obtenerOCrearContenedor(
              elemento.contenedor
            )

            return {
              tipo: elemento.tipo,

              contenedorId: contenedor.id,
              flatRackId: null,

              numero: contenedor.numeroContenedor,

              observaciones: elemento.observaciones?.trim() || null,
            }
          }

          // ----------------------------------------------------------
          // FLAT RACK
          // ----------------------------------------------------------

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

      return {
        empresaTransporteId: empresaTransporte.id,
        vehiculoId: vehiculo.id,
        conductorId: conductor.id,
        elementos,
      }
    })
  )

  const elementosResueltos = ingresosResueltos.flatMap(
    (ingreso) => ingreso.elementos
  )

  // ============================================================
  // 5. CREAR LA GUÍA Y SU INGRESO
  // ============================================================

  return prisma.$transaction(async (tx) => {
    // ----------------------------------------------------------
    // Verificar número de guía
    // ----------------------------------------------------------

    const guiaExistente = await tx.guiaTrasegado.findUnique({
      where: {
        numeroGuia,
      },
      select: {
        id: true,
      },
    })

    if (guiaExistente) {
      throw new Error(
        `Ya existe una guía de trasegado con el número "${numeroGuia}".`
      )
    }

    // ==========================================================
    // 6. VERIFICAR ELEMENTOS IDENTIFICABLES PENDIENTES
    // ==========================================================
    //
    // Un contenedor o Flat Rack que todavía se encuentra dentro
    // del almacén no puede ingresar nuevamente como pendiente
    // en otra guía.
    //
    // IMPORTANTE:
    // No significa que el elemento no pueda aparecer nuevamente
    // en una guía futura después de haber sido retirado.
    //
    // ==========================================================

    const contenedorIds = elementosResueltos
      .filter(
        (elemento) =>
          elemento.tipo === "CONTENEDOR" && elemento.contenedorId !== null
      )
      .map((elemento) => elemento.contenedorId!)

    const flatRackIds = elementosResueltos
      .filter(
        (elemento) =>
          elemento.tipo === "FLAT_RACK" && elemento.flatRackId !== null
      )
      .map((elemento) => elemento.flatRackId!)

    // ----------------------------------------------------------
    // Verificar contenedores pendientes
    // ----------------------------------------------------------

    if (contenedorIds.length > 0) {
      const contenedoresPendientes = await tx.guiaTrasegadoElemento.findMany({
        where: {
          contenedorId: {
            in: contenedorIds,
          },

          salidas: {
            none: {},
          },
        },

        select: {
          contenedorId: true,

          ingreso: {
            select: {
              guiaTrasegado: {
                select: {
                  numeroGuia: true,
                  estado: true,
                },
              },
            },
          },
        },
      })

      if (contenedoresPendientes.length > 0) {
        const pendiente = contenedoresPendientes[0]

        throw new Error(
          `El contenedor ya se encuentra pendiente de retiro en la guía "${pendiente.ingreso.guiaTrasegado.numeroGuia}".`
        )
      }
    }

    // ----------------------------------------------------------
    // Verificar Flat Racks pendientes
    // ----------------------------------------------------------

    if (flatRackIds.length > 0) {
      const flatRacksPendientes = await tx.guiaTrasegadoElemento.findMany({
        where: {
          flatRackId: {
            in: flatRackIds,
          },

          salidas: {
            none: {},
          },
        },

        select: {
          flatRackId: true,

          ingreso: {
            select: {
              guiaTrasegado: {
                select: {
                  numeroGuia: true,
                  estado: true,
                },
              },
            },
          },
        },
      })

      if (flatRacksPendientes.length > 0) {
        const pendiente = flatRacksPendientes[0]

        throw new Error(
          `El Flat Rack ya se encuentra pendiente de retiro en la guía "${pendiente.ingreso.guiaTrasegado.numeroGuia}".`
        )
      }
    }

    // ==========================================================
    // 7. CREAR GUÍA
    // ==========================================================

    const guia = await tx.guiaTrasegado.create({
      data: {
        numeroGuia,

        descripcionServicio,

        clienteId: datos.clienteId ?? null,

        fechaIngreso: datos.fechaIngreso,

        estado: "EN_PROCESO",

        // ------------------------------------------------------
        // Información económica
        // ------------------------------------------------------
        //
        // Los valores económicos se calcularán posteriormente
        // mediante el servicio correspondiente.
        //
        subtotal: null,
        porcentajeIGV: null,
        montoIGV: null,
        totalPagar: null,

        // ------------------------------------------------------
        // Pago
        // ------------------------------------------------------

        estadoPago: "PENDIENTE",

        metodoPago: null,
        numeroOperacion: null,
        fechaPago: null,

        // ------------------------------------------------------
        // Tratamiento tributario
        // ------------------------------------------------------

        tratamientoIGV: "SIN_IGV",

        observaciones,

        // ======================================================
        // INGRESO
        // ======================================================

        ingresos: {
          create: ingresosResueltos.map((ingreso) => ({
            empresaTransporteId: ingreso.empresaTransporteId,
            vehiculoId: ingreso.vehiculoId,
            conductorId: ingreso.conductorId,
            elementos: {
              create: ingreso.elementos.map((elemento) => ({
                tipo: elemento.tipo,
                contenedorId: elemento.contenedorId,
                flatRackId: elemento.flatRackId,
                numero: elemento.numero,
                descripcion: elemento.descripcion,
                observaciones: elemento.observaciones,
              })),
            },
          })),
        },
      },

      include: {
        cliente: true,

        ingresos: {
          include: {
            empresaTransporte: true,
            vehiculo: true,
            conductor: true,

            elementos: {
              include: {
                contenedor: true,
                flatRack: true,
              },
            },
          },
        },

        salidas: true,
      },
    })

    return guia
  })
}
