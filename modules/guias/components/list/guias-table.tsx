// modules/guias/components/list/guias-table.tsx

"use client"

import { GuiasDialogs } from "./guias-dialogs"
import { GuiasFiltros } from "./guias-filtros"
import { GuiasPaginacion } from "./guias-paginacion"
import { GuiasTabla } from "./guias-tabla"
import { GuiasToolbar } from "./guias-toolbar"
import { useGuiasTable } from "./use-guias-table"

import type { GuiasTableProps } from "./types"

/**
 * ============================================================
 * TABLA DE GUÍAS
 * ============================================================
 *
 * Componente orquestador. Delega el estado y la lógica al hook
 * `useGuiasTable`, y compone los subcomponentes de UI.
 */
export function GuiasTable({ data, onCambio }: GuiasTableProps) {
  const {
    guias,
    total,
    pagina,
    limite,
    totalPaginas,

    filtros,
    setFiltros,
    filtrosActivos,
    filtrosPendientes,
    filtrosAbiertos,
    setFiltrosAbiertos,

    isPending,
    exportando,
    anulando,
    anulandoSalida,

    guiaDetalle,
    setGuiaDetalle,
    guiaSalida,
    setGuiaSalida,
    guiaPago,
    setGuiaPago,
    guiaAnular,
    setGuiaAnular,
    guiaAnularSalida,
    setGuiaAnularSalida,

    aplicarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarLimite,
    exportarAExcel,
    confirmarAnulacion,
    confirmarAnulacionSalida,
    refrescarTrasAccion,
  } = useGuiasTable(data, onCambio)

  const deshabilitado = isPending || exportando

  return (
    <div className="space-y-4">
      <GuiasFiltros
        filtros={filtros}
        onFiltrosChange={setFiltros}
        abiertos={filtrosAbiertos}
        onAbiertosChange={setFiltrosAbiertos}
        onAplicar={aplicarFiltros}
        onLimpiar={limpiarFiltros}
        onExportar={exportarAExcel}
        filtrosActivos={filtrosActivos}
        filtrosPendientes={filtrosPendientes}
        isPending={isPending}
        exportando={exportando}
        total={total}
      />

      <GuiasToolbar total={total} isPending={isPending} />

      <GuiasTabla
        guias={guias}
        onVerDetalle={setGuiaDetalle}
        onRegistrarSalida={setGuiaSalida}
        onAnularSalida={setGuiaAnularSalida}
        onRegistrarPago={setGuiaPago}
        onAnular={setGuiaAnular}
        onCambio={refrescarTrasAccion}
      />

      <GuiasPaginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        limite={limite}
        onCambiarPagina={cambiarPagina}
        onCambiarLimite={cambiarLimite}
        deshabilitado={deshabilitado}
      />

      <GuiasDialogs
        guiaDetalle={guiaDetalle}
        setGuiaDetalle={setGuiaDetalle}
        guiaSalida={guiaSalida}
        setGuiaSalida={setGuiaSalida}
        guiaPago={guiaPago}
        setGuiaPago={setGuiaPago}
        guiaAnular={guiaAnular}
        setGuiaAnular={setGuiaAnular}
        anulando={anulando}
        onConfirmarAnulacion={confirmarAnulacion}
        guiaAnularSalida={guiaAnularSalida}
        setGuiaAnularSalida={setGuiaAnularSalida}
        anulandoSalida={anulandoSalida}
        onConfirmarAnulacionSalida={confirmarAnulacionSalida}
        onRefrescar={refrescarTrasAccion}
      />
    </div>
  )
}
