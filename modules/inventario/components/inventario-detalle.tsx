// modules\inventario\components\inventario-detalle.tsx

"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Check, FileSpreadsheet, Printer, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { exportarExcel } from "@/lib/exportar-excel"

/**
 * Resultado que puede registrar un contenedor durante un inventario físico.
 */
type ResultadoInventario = "PENDIENTE" | "ENCONTRADO" | "NO_ENCONTRADO"

/**
 * Representa cada línea del inventario: una guía asociada a un contenedor
 * que debe ser revisada y marcada como encontrada, no encontrada o pendiente.
 */
type Detalle = {
  id: number
  guiaId: number
  resultado: ResultadoInventario
  observaciones: string | null
  verificadoAt: Date | null

  guia: {
    id: number
    numeroGuia: string
    fechaIngreso: Date
    estado: string

    contenedor: {
      id: number
      numeroContenedor: string
      medida: number
      tipo: "NORMAL" | "REEFER"
      marca: string
    }
  }
}

/**
 * Props del componente para visualizar el detalle de un inventario y permitir
 * la verificación de contenedores, su exportación a Excel y su impresión.
 */
type InventarioDetalleProps = {
  inventarioId: number
  fecha: Date
  estado: "EN_PROCESO" | "FINALIZADO"
  detalles: Detalle[]

  onVerificar?: (detalleId: number, resultado: ResultadoInventario) => void

  onFinalizar?: () => void
}

/**
 * Formatea una fecha para mostrarla en el idioma del usuario.
 */
function formatearFecha(fecha: Date) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(fecha))
}

/**
 * Devuelve el badge visual correspondiente al estado de verificación de un contenedor.
 */
function obtenerBadge(resultado: ResultadoInventario) {
  switch (resultado) {
    case "ENCONTRADO":
      return <Badge>Encontrado</Badge>

    case "NO_ENCONTRADO":
      return <Badge variant="destructive">No encontrado</Badge>

    default:
      return <Badge variant="secondary">Pendiente</Badge>
  }
}

/**
 * Muestra el detalle de un inventario, separando contenedores por medida,
 * permitiendo verificar cada guía, exportar a Excel e imprimir el documento.
 *
 * El componente está preparado para dos escenarios:
 * - inventarios en proceso, donde se puede marcar cada contenedor
 * - inventarios finalizados, donde solo se observa el resultado
 */
export function InventarioDetalle({
  inventarioId,
  fecha,
  estado,
  detalles,
  onVerificar,
  onFinalizar,
}: InventarioDetalleProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  /**
   * Configura la impresión del contenido del inventario utilizando react-to-print.
   */
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `inventario-${inventarioId}`,
  })

  // Se separan los contenedores por medida para mostrar tablas independientes y
  // facilitar la revisión física por tipo de equipo.
  const contenedores40 = detalles
    .filter((detalle) => detalle.guia.contenedor.medida === 40)
    .sort((a, b) =>
      a.guia.contenedor.numeroContenedor.localeCompare(
        b.guia.contenedor.numeroContenedor
      )
    )

  const contenedores20 = detalles
    .filter((detalle) => detalle.guia.contenedor.medida === 20)
    .sort((a, b) =>
      a.guia.contenedor.numeroContenedor.localeCompare(
        b.guia.contenedor.numeroContenedor
      )
    )

  // Totales de la vista para mostrar un resumen rápido del estado del inventario.
  const pendientes = detalles.filter(
    (detalle) => detalle.resultado === "PENDIENTE"
  ).length

  const encontrados = detalles.filter(
    (detalle) => detalle.resultado === "ENCONTRADO"
  ).length

  const noEncontrados = detalles.filter(
    (detalle) => detalle.resultado === "NO_ENCONTRADO"
  ).length

  /**
   * Exporta el detalle del inventario a un archivo Excel con el formato de revisión.
   */
  function exportar() {
    const datos = detalles.map((detalle) => ({
      "Número de contenedor": detalle.guia.contenedor.numeroContenedor,
      Medida: detalle.guia.contenedor.medida,
      "Número de guía": detalle.guia.numeroGuia,
      "Fecha de ingreso": formatearFecha(detalle.guia.fechaIngreso),
      Marca: detalle.guia.contenedor.marca,
      Tipo: detalle.guia.contenedor.tipo,
      Resultado:
        detalle.resultado === "ENCONTRADO"
          ? "Encontrado"
          : detalle.resultado === "NO_ENCONTRADO"
            ? "No encontrado"
            : "Pendiente",
      Observaciones: detalle.observaciones ?? "",
    }))

    exportarExcel({
      datos,
      nombreArchivo: `inventario-${inventarioId}`,
      nombreHoja: "Inventario",
    })
  }

  /**
   * Renderiza una tabla de contenedores agrupados por medida.
   *
   * @param titulo - Nombre del grupo visible para el usuario (20 pies / 40 pies)
   * @param items - Contenedores que pertenecen a ese grupo
   * @param esSegundaTabla - Indica si es la segunda tabla para ajustar saltos de página en impresión
   */
  function renderTabla(
    titulo: string,
    items: Detalle[],
    esSegundaTabla = false
  ) {
    const estaEnProceso = estado === "EN_PROCESO"

    return (
      <div
        className={`space-y-3 ${
          esSegundaTabla ? "print:break-before-page print:pt-6" : ""
        }`}
      >
        {/* Encabezado de sección */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Contenedores de {titulo}</h3>

            <Badge variant="outline" className="font-medium">
              {items.length}
            </Badge>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[24%]">Contenedor</TableHead>

                <TableHead className="w-[15%]">N.º Guía</TableHead>

                <TableHead className="w-[17%]">Fecha ingreso</TableHead>

                <TableHead className="w-[10%] text-center">Medida</TableHead>

                <TableHead className="w-[16%]">Resultado</TableHead>

                {estaEnProceso && (
                  <TableHead className="w-[18%] text-center print:hidden">
                    Verificar
                  </TableHead>
                )}

                {/* Columna exclusiva para impresión */}
                <TableHead className="hidden w-[18%] text-center print:table-cell">
                  Verificación física
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={estaEnProceso ? 6 : 6}
                    className="h-20 text-center text-muted-foreground"
                  >
                    No hay contenedores de {titulo}.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((detalle) => {
                  const encontrado = detalle.resultado === "ENCONTRADO"

                  const noEncontrado = detalle.resultado === "NO_ENCONTRADO"

                  return (
                    <TableRow key={detalle.id} className="hover:bg-muted/30">
                      {/* Contenedor */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-muted-foreground uppercase">
                            {detalle.guia.contenedor.marca}
                          </span>

                          <span className="font-mono text-sm font-semibold tracking-wide">
                            {detalle.guia.contenedor.numeroContenedor}
                          </span>
                        </div>
                      </TableCell>

                      {/* Guía */}
                      <TableCell className="font-medium">
                        {detalle.guia.numeroGuia}
                      </TableCell>

                      {/* Fecha */}
                      <TableCell className="text-muted-foreground">
                        {formatearFecha(detalle.guia.fechaIngreso)}
                      </TableCell>

                      {/* Medida */}
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="min-w-[48px] justify-center font-semibold"
                        >
                          {detalle.guia.contenedor.medida}'
                        </Badge>
                      </TableCell>

                      {/* Resultado */}
                      <TableCell>{obtenerBadge(detalle.resultado)}</TableCell>

                      {/* Acciones WEB */}
                      {estaEnProceso && (
                        <TableCell className="print:hidden">
                          <div className="flex justify-center gap-1.5">
                            <Button
                              type="button"
                              size="icon"
                              variant={encontrado ? "default" : "outline"}
                              className="h-8 w-8"
                              title="Marcar como encontrado"
                              onClick={() =>
                                onVerificar?.(detalle.id, "ENCONTRADO")
                              }
                            >
                              <Check className="h-4 w-4" />
                              <span className="sr-only">Encontrado</span>
                            </Button>

                            <Button
                              type="button"
                              size="icon"
                              variant={noEncontrado ? "destructive" : "outline"}
                              className="h-8 w-8"
                              title="Marcar como no encontrado"
                              onClick={() =>
                                onVerificar?.(detalle.id, "NO_ENCONTRADO")
                              }
                            >
                              <X className="h-4 w-4" />
                              <span className="sr-only">No encontrado</span>
                            </Button>
                          </div>
                        </TableCell>
                      )}

                      {/* Casillas para impresión */}
                      <TableCell className="hidden print:table-cell">
                        <div className="flex items-center justify-center gap-5">
                          <span className="flex items-center gap-1.5">
                            <span className="inline-block h-4 w-4 border border-black" />
                            <span className="text-xs">Encontrado</span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <span className="inline-block h-4 w-4 border border-black" />
                            <span className="text-xs">No</span>
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventario #{inventarioId}</h2>

          <p className="text-sm text-muted-foreground">
            Fecha: {formatearFecha(fecha)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportar}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>

          <Button variant="outline" onClick={() => handlePrint()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>

          {estado === "EN_PROCESO" && (
            <Button disabled={pendientes > 0} onClick={onFinalizar}>
              Finalizar inventario
            </Button>
          )}
        </div>
      </div>

      {/* Contenido Imprimible */}
      <div ref={contentRef} className="space-y-6 print:bg-white print:p-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Total</p>

            <p className="text-2xl font-bold">{detalles.length}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Pendientes</p>

            <p className="text-2xl font-bold">{pendientes}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Encontrados</p>

            <p className="text-2xl font-bold">{encontrados}</p>
          </div>

          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">No encontrados</p>

            <p className="text-2xl font-bold">{noEncontrados}</p>
          </div>
        </div>

        {/* 1. Primera tabla: Medida 20 pies */}
        {renderTabla("20 pies", contenedores20)}

        {/* 2. Segunda tabla: Medida 40 pies (con salto de página forzado en la impresión) */}
        {renderTabla("40 pies", contenedores40, true)}
      </div>
    </div>
  )
}
