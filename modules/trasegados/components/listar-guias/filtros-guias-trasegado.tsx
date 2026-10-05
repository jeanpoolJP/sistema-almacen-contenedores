// modules\trasegados\components\listar-guias\filtros-guias-trasegado.tsx

"use client"

import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { UppercaseInput } from "../shared/uppercase-input"
import type { ListarGuiasTrasegadoInput } from "../../schemas/listar-guias-trasegado.schema"

interface FiltrosGuiasTrasegadoProps {
  filtros: Partial<ListarGuiasTrasegadoInput>
  onChange: <K extends keyof ListarGuiasTrasegadoInput>(
    key: K,
    value: ListarGuiasTrasegadoInput[K] | undefined
  ) => void
  onLimpiar: () => void
}

export function FiltrosGuiasTrasegado({
  filtros,
  onChange,
  onLimpiar,
}: FiltrosGuiasTrasegadoProps) {
  const [abiertos, setAbiertos] = useState(false)
  const filtrosActivos = [
    filtros.numeroGuia,
    filtros.numeroDocumentoCliente,
    filtros.numeroContenedor,
    filtros.estado,
    filtros.estadoPago,
    filtros.fechaIngresoDesde,
    filtros.fechaIngresoHasta,
    filtros.fechaSalidaDesde,
    filtros.fechaSalidaHasta,
  ].filter((valor) => valor != null && valor !== "").length

  return (
    <Collapsible
      open={abiertos}
      onOpenChange={setAbiertos}
      className="rounded-lg border"
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Filtros de búsqueda</h3>
            {filtrosActivos > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <CheckIcon className="size-3" />
                {filtrosActivos} {filtrosActivos === 1 ? "activo" : "activos"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Filtra las guías por número, cliente, estado o fecha.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onLimpiar} type="button">
            <XIcon className="mr-2 size-4" />
            Limpiar
          </Button>
          <CollapsibleTrigger
            render={
              <Button variant="outline" size="sm" type="button">
                {abiertos ? "Ocultar filtros" : "Mostrar filtros"}
                <ChevronDownIcon
                  className={`ml-2 size-4 transition-transform ${
                    abiertos ? "rotate-180" : ""
                  }`}
                />
              </Button>
            }
          />
        </div>
      </div>

      <CollapsibleContent>
        <div className="space-y-4 border-t p-4">
          {/* Búsqueda */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="filtro-numero-guia">Número de guía</Label>
              <UppercaseInput
                id="filtro-numero-guia"
                placeholder="000123"
                value={filtros.numeroGuia ?? ""}
                onChange={(e) => onChange("numeroGuia", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-doc-cliente">Documento del cliente</Label>
              <Input
                id="filtro-doc-cliente"
                placeholder="20123456789"
                value={filtros.numeroDocumentoCliente ?? ""}
                onChange={(e) =>
                  onChange("numeroDocumentoCliente", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filtro-num-contenedor">
                Número de contenedor
              </Label>
              <UppercaseInput
                id="filtro-num-contenedor"
                placeholder="MSCU1234567"
                value={filtros.numeroContenedor ?? ""}
                onChange={(e) => onChange("numeroContenedor", e.target.value)}
              />
            </div>
          </div>

          {/* Estados */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Estado de la guía</Label>
              <Select
                value={filtros.estado ?? "TODOS"}
                onValueChange={(v) =>
                  onChange(
                    "estado",
                    v === "TODOS"
                      ? undefined
                      : (v as "EN_PROCESO" | "FINALIZADO")
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="EN_PROCESO">En proceso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estado de pago</Label>
              <Select
                value={filtros.estadoPago ?? "TODOS"}
                onValueChange={(v) =>
                  onChange(
                    "estadoPago",
                    v === "TODOS" ? undefined : (v as "PENDIENTE" | "PAGADO")
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rango fecha ingreso */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha de ingreso desde</Label>
              <Input
                type="date"
                value={filtros.fechaIngresoDesde ?? ""}
                onChange={(e) => onChange("fechaIngresoDesde", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de ingreso hasta</Label>
              <Input
                type="date"
                value={filtros.fechaIngresoHasta ?? ""}
                onChange={(e) => onChange("fechaIngresoHasta", e.target.value)}
              />
            </div>
          </div>

          {/* Rango fecha salida */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fecha de salida desde</Label>
              <Input
                type="date"
                value={filtros.fechaSalidaDesde ?? ""}
                onChange={(e) => onChange("fechaSalidaDesde", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de salida hasta</Label>
              <Input
                type="date"
                value={filtros.fechaSalidaHasta ?? ""}
                onChange={(e) => onChange("fechaSalidaHasta", e.target.value)}
              />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
