// modules/guias/components/list/use-guias-table.ts

"use client"

import { useEffect, useState, useTransition } from "react"

import { toast } from "sonner"

import { anularGuiaAction, obtenerGuiasAction } from "../../guia.actions"

import { exportarExcel } from "@/lib/exportar-excel"

import type {
  EstadoGuia,
  EstadoPago,
  TratamientoIGV,
} from "@/lib/generated/prisma"

import type { GuiaConRelaciones } from "../guia-con-relaciones.type"

import type { GuiasData, GuiasFiltros } from "./types"

import { mapearGuiasParaExcel } from "./guias-utils"

function fechaArchivoActual() {
  const ahora = new Date()

  return [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, "0"),
    String(ahora.getDate()).padStart(2, "0"),
  ].join("-")
}

/**
 * ============================================================
 * ESTADO INICIAL DE FILTROS
 * ============================================================
 */
const FILTROS_INICIALES: GuiasFiltros = {
  numeroGuia: "",
  numeroContenedor: "",
  medidaContenedor: undefined,
  documentoCliente: "",
  sinCliente: false,
  estado: undefined,
  estadoPago: undefined,
  tratamientoIGV: undefined,
  fechaIngresoDesde: "",
  fechaIngresoHasta: "",
  fechaSalidaDesde: "",
  fechaSalidaHasta: "",
}

function contarFiltrosActivos(filtros: GuiasFiltros) {
  return Object.entries(filtros).filter(([campo, valor]) =>
    campo === "sinCliente" ? valor === true : Boolean(valor)
  ).length
}

function filtrosIguales(primero: GuiasFiltros, segundo: GuiasFiltros) {
  return JSON.stringify(primero) === JSON.stringify(segundo)
}

/**
 * ============================================================
 * HOOK PRINCIPAL DE LA TABLA DE GUÍAS
 * ============================================================
 */
export function useGuiasTable(data: GuiasData, onCambio?: () => void) {
  /**
   * DATOS
   */
  const [guias, setGuias] = useState<GuiaConRelaciones[]>(data.guias)
  const [total, setTotal] = useState(data.total)
  const [pagina, setPagina] = useState(data.pagina)
  const [limite, setLimite] = useState(data.limite)
  const [totalPaginas, setTotalPaginas] = useState(data.totalPaginas)

  /**
   * FILTROS
   */
  const [filtros, setFiltros] = useState<GuiasFiltros>(FILTROS_INICIALES)
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<GuiasFiltros>(FILTROS_INICIALES)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  /**
   * TRANSICIÓN
   */
  const [isPending, startTransition] = useTransition()

  /**
   * EXPORTACIÓN
   */
  const [exportando, setExportando] = useState(false)

  /**
   * DIALOGS
   */

  const [guiaDetalle, setGuiaDetalle] = useState<GuiaConRelaciones | null>(null)
  const [guiaSalida, setGuiaSalida] = useState<GuiaConRelaciones | null>(null)
  const [guiaPago, setGuiaPago] = useState<GuiaConRelaciones | null>(null)
  const [guiaAnular, setGuiaAnular] = useState<GuiaConRelaciones | null>(null)
  const [anulando, setAnulando] = useState(false)

  /**
   * SINCRONIZAR DATOS CON EL SERVIDOR
   */
  useEffect(() => {
    if (contarFiltrosActivos(filtrosAplicados) > 0) {
      buscarGuias(pagina, limite, filtrosAplicados)
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuias(data.guias)
    setTotal(data.total)
    setPagina(data.pagina)
    setLimite(data.limite)
    setTotalPaginas(data.totalPaginas)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  /**
   * CONSTRUIR FILTROS PARA LA ACTION
   */
  function obtenerFiltros(filtrosConsulta: GuiasFiltros = filtrosAplicados) {
    return {
      numeroGuia: filtrosConsulta.numeroGuia.trim() || undefined,
      numeroContenedor: filtrosConsulta.numeroContenedor.trim() || undefined,
      medidaContenedor: filtrosConsulta.medidaContenedor,
      documentoCliente: filtrosConsulta.documentoCliente.trim() || undefined,
      sinCliente: filtrosConsulta.sinCliente,
      estado: filtrosConsulta.estado as EstadoGuia | undefined,
      estadoPago: filtrosConsulta.estadoPago as EstadoPago | undefined,
      tratamientoIGV: filtrosConsulta.tratamientoIGV as
        TratamientoIGV | undefined,
      fechaIngresoDesde: filtrosConsulta.fechaIngresoDesde || undefined,
      fechaIngresoHasta: filtrosConsulta.fechaIngresoHasta || undefined,
      fechaSalidaDesde: filtrosConsulta.fechaSalidaDesde || undefined,
      fechaSalidaHasta: filtrosConsulta.fechaSalidaHasta || undefined,
    }
  }

  /**
   * APLICAR RESULTADO DE LA ACTION
   */
  function aplicarResultado(resultado: {
    guias: GuiaConRelaciones[]
    total: number
    pagina: number
    limite: number
    totalPaginas: number
  }) {
    setGuias(resultado.guias)
    setTotal(resultado.total)
    setPagina(resultado.pagina)
    setLimite(resultado.limite)
    setTotalPaginas(resultado.totalPaginas)
  }

  /**
   * BUSCAR GUÍAS
   */
  function buscarGuias(
    nuevaPagina = 1,
    nuevoLimite = limite,
    filtrosConsulta = filtrosAplicados
  ) {
    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: nuevaPagina,
        limite: nuevoLimite,
        ...obtenerFiltros(filtrosConsulta),
      })

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      aplicarResultado(resultado.data)
    })
  }

  /**
   * APLICAR FILTROS
   */
  function aplicarFiltros() {
    setFiltrosAplicados(filtros)
    buscarGuias(1, limite, filtros)
  }

  /**
   * LIMPIAR FILTROS
   */
  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)
    setFiltrosAplicados(FILTROS_INICIALES)

    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: 1,
        limite,
      })

      if (!resultado.success) {
        toast.error(resultado.message)
        return
      }

      aplicarResultado(resultado.data)
    })
  }

  /**
   * CAMBIAR PÁGINA
   */
  function cambiarPagina(nuevaPagina: number) {
    if (
      nuevaPagina < 1 ||
      nuevaPagina > totalPaginas ||
      nuevaPagina === pagina
    ) {
      return
    }

    buscarGuias(nuevaPagina, limite)
  }

  /**
   * CAMBIAR LÍMITE
   */
  function cambiarLimite(nuevoLimite: string | null) {
    if (nuevoLimite === null) return

    const limiteNumero = Number(nuevoLimite)
    buscarGuias(1, limiteNumero)
  }

  /**
   * EXPORTAR A EXCEL
   */
  async function exportarAExcel() {
    try {
      setExportando(true)

      const resultado = await obtenerGuiasAction({
        pagina: 1,
        limite: 10000,
        ...obtenerFiltros(),
      })

      if (!resultado.success) {
        toast.error(resultado.message ?? "No se pudieron obtener las guías")
        return
      }

      if (resultado.data.guias.length === 0) {
        toast.info("No hay guías para exportar.")
        return
      }

      const datosExcel = mapearGuiasParaExcel(resultado.data.guias)

      exportarExcel({
        datos: datosExcel,
        nombreArchivo: `guias-de-internamiento-${fechaArchivoActual()}`,
        nombreHoja: "Guías de internamiento",
        titulo: "GUÍAS DE INTERNAMIENTO",
        subtitulo: `Reporte generado el ${fechaArchivoActual()} · ${datosExcel.length} registros`,
        anchos: [17, 28, 22, 23, 10, 17, 17, 17, 16, 16, 20, 23, 22, 16, 16],
      })

      toast.success(
        `${datosExcel.length} ${
          datosExcel.length === 1 ? "guía exportada" : "guías exportadas"
        } correctamente.`
      )
    } catch (error) {
      console.error("Error al exportar guías:", error)
      toast.error("Ocurrió un error al exportar las guías.")
    } finally {
      setExportando(false)
    }
  }

  /**
   * CONFIRMAR ANULACIÓN
   */
  async function confirmarAnulacion() {
    if (!guiaAnular) return

    setAnulando(true)

    const res = await anularGuiaAction(guiaAnular.id)

    setAnulando(false)
    setGuiaAnular(null)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)

    buscarGuias(pagina, limite)
    onCambio?.()
  }

  /**
   * REFRESCAR DESPUÉS DE UNA ACCIÓN EXITOSA
   */
  function refrescarTrasAccion() {
    buscarGuias(pagina, limite)
    onCambio?.()
  }

  return {
    // datos
    guias,
    total,
    pagina,
    limite,
    totalPaginas,

    // filtros
    filtros,
    setFiltros,
    filtrosActivos: contarFiltrosActivos(filtrosAplicados),
    filtrosPendientes: !filtrosIguales(filtros, filtrosAplicados),
    filtrosAbiertos,
    setFiltrosAbiertos,

    // estados
    isPending,
    exportando,
    anulando,

    // dialogs
    guiaDetalle,
    setGuiaDetalle,
    guiaSalida,
    setGuiaSalida,
    guiaPago,
    setGuiaPago,
    guiaAnular,
    setGuiaAnular,

    // acciones
    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarLimite,
    exportarAExcel,
    confirmarAnulacion,
    refrescarTrasAccion,
  }
}

export type GuiasTableController = ReturnType<typeof useGuiasTable>
