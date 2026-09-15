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

/**
 * ============================================================
 * ESTADO INICIAL DE FILTROS
 * ============================================================
 */
const FILTROS_INICIALES: GuiasFiltros = {
  numeroGuia: "",
  numeroContenedor: "",
  documentoCliente: "",
  sinCliente: false,
  estado: undefined,
  estadoPago: undefined,
  tratamientoIGV: undefined,
  fechaDesde: "",
  fechaHasta: "",
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGuias(data.guias)
    setTotal(data.total)
    setPagina(data.pagina)
    setLimite(data.limite)
    setTotalPaginas(data.totalPaginas)
  }, [data])

  /**
   * CONSTRUIR FILTROS PARA LA ACTION
   */
  function obtenerFiltros() {
    return {
      numeroGuia: filtros.numeroGuia.trim() || undefined,
      numeroContenedor: filtros.numeroContenedor.trim() || undefined,
      documentoCliente: filtros.documentoCliente.trim() || undefined,
      sinCliente: filtros.sinCliente,
      estado: filtros.estado as EstadoGuia | undefined,
      estadoPago: filtros.estadoPago as EstadoPago | undefined,
      tratamientoIGV: filtros.tratamientoIGV as TratamientoIGV | undefined,
      fechaDesde: filtros.fechaDesde
        ? new Date(`${filtros.fechaDesde}T00:00:00`)
        : undefined,
      fechaHasta: filtros.fechaHasta
        ? new Date(`${filtros.fechaHasta}T23:59:59`)
        : undefined,
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
  function buscarGuias(nuevaPagina = 1, nuevoLimite = limite) {
    startTransition(async () => {
      const resultado = await obtenerGuiasAction({
        pagina: nuevaPagina,
        limite: nuevoLimite,
        ...obtenerFiltros(),
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
    buscarGuias(1, limite)
  }

  /**
   * LIMPIAR FILTROS
   */
  function limpiarFiltros() {
    setFiltros(FILTROS_INICIALES)

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
        nombreArchivo: `guias-${new Date().toISOString().slice(0, 10)}`,
        nombreHoja: "Guías",
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
