// modules/guias/components/list/guias-filtros.tsx

"use client"

import { ChevronDown, Download, Loader2, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type {
  EstadoGuia,
  EstadoPago,
  TratamientoIGV,
} from "@/lib/generated/prisma"

import type { GuiasFiltros } from "./types"

type GuiasFiltrosProps = {
  filtros: GuiasFiltros
  onFiltrosChange: (filtros: GuiasFiltros) => void
  abiertos: boolean
  onAbiertosChange: (abierto: boolean) => void
  onAplicar: () => void
  onLimpiar: () => void
  onExportar: () => void
  isPending: boolean
  exportando: boolean
  total: number
}

export function GuiasFiltros({
  filtros,
  onFiltrosChange,
  abiertos,
  onAbiertosChange,
  onAplicar,
  onLimpiar,
  onExportar,
  isPending,
  exportando,
  total,
}: GuiasFiltrosProps) {
  function actualizar<K extends keyof GuiasFiltros>(
    campo: K,
    valor: GuiasFiltros[K]
  ) {
    onFiltrosChange({ ...filtros, [campo]: valor })
  }

  const deshabilitado = isPending || exportando

  return (
    <Collapsible
      open={abiertos}
      onOpenChange={onAbiertosChange}
      className="rounded-lg border"
    >
      <div className="flex items-center justify-between p-4">
        <div>
          <h3 className="text-sm font-semibold">Filtros de búsqueda</h3>
          <p className="text-xs text-muted-foreground">
            Filtra las guías por número, cliente, estado o fecha.
          </p>
        </div>

        <CollapsibleTrigger
          render={
            <Button variant="outline" size="sm" type="button">
              {abiertos ? "Ocultar filtros" : "Mostrar filtros"}
              <ChevronDown
                className={`ml-2 size-4 transition-transform ${
                  abiertos ? "rotate-180" : ""
                }`}
              />
            </Button>
          }
        />
      </div>

      <CollapsibleContent>
        <div className="border-t p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* NÚMERO GUÍA */}
            <div className="space-y-2">
              <label className="text-sm font-medium">N° de guía</label>
              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={filtros.numeroGuia}
                  onChange={(e) => actualizar("numeroGuia", e.target.value)}
                  placeholder="Buscar guía..."
                  className="pl-8"
                />
              </div>
            </div>

            {/* CONTENEDOR */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Contenedor</label>
              <Input
                value={filtros.numeroContenedor}
                onChange={(e) => actualizar("numeroContenedor", e.target.value)}
                placeholder="Número de contenedor"
              />
            </div>

            {/* DOCUMENTO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Documento del cliente
              </label>
              <Input
                value={filtros.documentoCliente}
                onChange={(e) => actualizar("documentoCliente", e.target.value)}
                placeholder="DNI o RUC"
              />
            </div>

            {/* CLIENTE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={filtros.sinCliente ? "SIN_CLIENTE" : "TODOS"}
                onValueChange={(value) =>
                  actualizar("sinCliente", value === "SIN_CLIENTE")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los clientes</SelectItem>
                  <SelectItem value="SIN_CLIENTE">Sin cliente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ESTADO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filtros.estado ?? "TODOS"}
                onValueChange={(value) =>
                  actualizar(
                    "estado",
                    value === "TODOS" ? undefined : (value as EstadoGuia)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="ALMACENADO">Almacenado</SelectItem>
                  <SelectItem value="RETIRADO">Retirado</SelectItem>
                  <SelectItem value="ANULADO">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ESTADO DE PAGO */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado de pago</label>
              <Select
                value={filtros.estadoPago ?? "TODOS"}
                onValueChange={(value) =>
                  actualizar(
                    "estadoPago",
                    value === "TODOS" ? undefined : (value as EstadoPago)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados de pago" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos los estados</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TRATAMIENTO IGV */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tratamiento IGV</label>
              <Select
                value={filtros.tratamientoIGV ?? "TODOS"}
                onValueChange={(value) =>
                  actualizar(
                    "tratamientoIGV",
                    value === "TODOS" ? undefined : (value as TratamientoIGV)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="CON_IGV">Con IGV</SelectItem>
                  <SelectItem value="SIN_IGV">Sin IGV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* FECHA DESDE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha desde</label>
              <Input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => actualizar("fechaDesde", e.target.value)}
              />
            </div>

            {/* FECHA HASTA */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha hasta</label>
              <Input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => actualizar("fechaHasta", e.target.value)}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={onAplicar} disabled={deshabilitado}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Buscar
            </Button>

            <Button
              variant="outline"
              onClick={onLimpiar}
              disabled={deshabilitado}
            >
              <X className="mr-2 size-4" />
              Limpiar filtros
            </Button>

            <Button
              variant="outline"
              onClick={onExportar}
              disabled={deshabilitado || total === 0}
            >
              {exportando ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              {exportando ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
