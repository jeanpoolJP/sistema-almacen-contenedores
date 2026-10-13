// modules/control-alquiler/components/control-alquiler-filtros.tsx
"use client"

import { useState, useTransition, type KeyboardEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react"

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

import type { FiltrosGuiaAlquiler } from "../control-alquiler.types"

interface Props {
  filtros: FiltrosGuiaAlquiler
}

type FiltrosFormulario = Pick<
  FiltrosGuiaAlquiler,
  "busqueda" | "estado" | "estadoPago" | "cotizacion" | "desde" | "hasta"
>

function crearFiltrosFormulario(
  filtros: FiltrosGuiaAlquiler
): FiltrosFormulario {
  return {
    busqueda: filtros.busqueda ?? "",
    estado: filtros.estado ?? "todos",
    estadoPago: filtros.estadoPago ?? "todos",
    cotizacion: filtros.cotizacion ?? "todos",
    desde: filtros.desde ?? "",
    hasta: filtros.hasta ?? "",
  }
}

export function ControlAlquilerFiltros({ filtros }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [abiertos, setAbiertos] = useState(false)
  const [filtrosFormulario, setFiltrosFormulario] = useState(() =>
    crearFiltrosFormulario(filtros)
  )

  const valoresAplicados = crearFiltrosFormulario(filtros)
  const filtrosActivos = Object.entries(valoresAplicados).filter(
    ([campo, valor]) =>
      campo === "estado" ||
      campo === "estadoPago" ||
      campo === "cotizacion"
        ? valor !== "todos"
        : Boolean(valor)
  ).length
  const filtrosPendientes =
    JSON.stringify(filtrosFormulario) !== JSON.stringify(valoresAplicados)

  function navegarConFiltros(valores: FiltrosFormulario) {
    const params = new URLSearchParams()
    const busqueda = valores.busqueda.trim()

    if (busqueda) params.set("busqueda", busqueda)
    if (valores.estado !== "todos") params.set("estado", valores.estado)
    if (valores.estadoPago !== "todos")
      params.set("estadoPago", valores.estadoPago)
    if (valores.cotizacion !== "todos")
      params.set("cotizacion", valores.cotizacion)
    if (valores.desde) params.set("desde", valores.desde)
    if (valores.hasta) params.set("hasta", valores.hasta)
    if (filtros.porPagina !== 10)
      params.set("porPagina", String(filtros.porPagina))

    const query = params.toString()
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  function aplicarFiltros() {
    navegarConFiltros(filtrosFormulario)
  }

  function limpiarFiltros() {
    const filtrosIniciales: FiltrosFormulario = {
      busqueda: "",
      estado: "todos",
      estadoPago: "todos",
      cotizacion: "todos",
      desde: "",
      hasta: "",
    }

    setFiltrosFormulario(filtrosIniciales)
    navegarConFiltros(filtrosIniciales)
  }

  function manejarTeclaBusqueda(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault()
      aplicarFiltros()
    }
  }

  return (
    <Collapsible
      open={abiertos}
      onOpenChange={setAbiertos}
      className="rounded-lg border bg-card"
    >
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">Filtros de búsqueda</h3>
            {filtrosActivos > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Check className="size-3" />
                {filtrosActivos} {filtrosActivos === 1 ? "activo" : "activos"}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {filtrosActivos > 0
              ? "La tabla muestra resultados que coinciden con estos filtros."
              : "Filtra por guía, cliente, equipo, estado, pago o fecha."}
          </p>
          {filtrosPendientes && (
            <p className="mt-1 text-xs font-medium text-amber-600">
              Hay cambios sin aplicar. Presiona Buscar para actualizar la tabla.
            </p>
          )}
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
        <div className="space-y-4 border-t p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 sm:col-span-2 lg:col-span-3">
              <label htmlFor="control-alquiler-busqueda" className="text-sm font-medium">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="control-alquiler-busqueda"
                  className="pl-9"
                  placeholder="N° guía, cliente, equipo, solicitante..."
                  value={filtrosFormulario.busqueda}
                  onChange={(event) =>
                    setFiltrosFormulario((actuales) => ({
                      ...actuales,
                      busqueda: event.target.value,
                    }))
                  }
                  onKeyDown={manejarTeclaBusqueda}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado de la guía</label>
              <Select
                value={filtrosFormulario.estado}
                onValueChange={(valor) =>
                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    estado: (valor ?? "todos") as FiltrosFormulario["estado"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="EN_PROCESO">En proceso</SelectItem>
                  <SelectItem value="FINALIZADO">Finalizado</SelectItem>
                  <SelectItem value="ANULADO">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado de pago</label>
              <Select
                value={filtrosFormulario.estadoPago}
                onValueChange={(valor) =>
                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    estadoPago: (valor ??
                      "todos") as FiltrosFormulario["estadoPago"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos los pagos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los pagos</SelectItem>
                  <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                  <SelectItem value="PAGADO">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cotización</label>
              <Select
                value={filtrosFormulario.cotizacion}
                onValueChange={(valor) =>
                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    cotizacion: (valor ??
                      "todos") as FiltrosFormulario["cotizacion"],
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todas las cotizaciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las cotizaciones</SelectItem>
                  <SelectItem value="con">Con cotización</SelectItem>
                  <SelectItem value="sin">Sin cotización</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="control-alquiler-desde" className="text-sm font-medium">
                Fecha desde
              </label>
              <Input
                id="control-alquiler-desde"
                type="date"
                value={filtrosFormulario.desde}
                onChange={(event) =>
                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    desde: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="control-alquiler-hasta" className="text-sm font-medium">
                Fecha hasta
              </label>
              <Input
                id="control-alquiler-hasta"
                type="date"
                value={filtrosFormulario.hasta}
                onChange={(event) =>
                  setFiltrosFormulario((actuales) => ({
                    ...actuales,
                    hasta: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={aplicarFiltros} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Search className="mr-2 size-4" />
              )}
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={limpiarFiltros}
              disabled={isPending || filtrosActivos === 0}
            >
              <X className="mr-2 size-4" />
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
