// modules\guias\components\asignar-cliente-espacio-alquilado-dialog.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Users, Check, Loader2, UserRound } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

import { buscarClientePorDocumento } from "@/modules/clientes/cliente.actions"

import {
  asignarClienteMasivoAction,
  obtenerGuiasEspacioAlquiladoAction,
} from "../guia.actions"

type Cliente = {
  id: number
  tipoDocumento: "DNI" | "RUC"
  numeroDocumento: string
  nombreCompleto: string | null
}

type GuiaEspacioAlquilado = {
  id: number
  numeroGuia: string
  clienteId: number | null
  estado: string
  contenedor: {
    numeroContenedor: string
  }
}

type AsignarClienteEspacioAlquiladoDialogProps = {
  onAsignada?: () => void
}

export function AsignarClienteEspacioAlquiladoDialog({
  onAsignada,
}: AsignarClienteEspacioAlquiladoDialogProps) {
  const [open, setOpen] = useState(false)

  const [guias, setGuias] = useState<GuiaEspacioAlquilado[]>([])
  const [guiasSeleccionadas, setGuiasSeleccionadas] = useState<number[]>([])

  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [cliente, setCliente] = useState<Cliente | null>(null)

  const [busquedaGuia, setBusquedaGuia] = useState("")

  const [cargandoGuias, setCargandoGuias] = useState(false)
  const [buscandoCliente, setBuscandoCliente] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ============================================================
  // CARGAR GUÍAS
  // ============================================================

  useEffect(() => {
    if (!open) return

    async function cargarGuias() {
      setCargandoGuias(true)

      try {
        const res = await obtenerGuiasEspacioAlquiladoAction()

        if (!res.success) {
          toast.error(res.message)
          return
        }

        setGuias(res.data ?? [])
      } catch (error) {
        console.error(error)

        toast.error("No se pudieron cargar las guías de espacio alquilado.")
      } finally {
        setCargandoGuias(false)
      }
    }

    cargarGuias()
  }, [open])

  // ============================================================
  // BUSCAR CLIENTE POR DNI / RUC
  // ============================================================

  async function handleBuscarCliente() {
    const documento = numeroDocumento.trim()

    if (!documento) {
      setCliente(null)
      toast.error("Ingresa un DNI o RUC.")
      return
    }

    setBuscandoCliente(true)

    try {
      const res = await buscarClientePorDocumento(documento)

      if (!res.success) {
        setCliente(null)
        toast.error(res.error)
        return
      }

      if (!res.data) {
        setCliente(null)
        toast.error("No se encontró ningún cliente con ese documento.")
        return
      }

      setCliente(res.data)

      toast.success("Cliente encontrado.")
    } catch (error) {
      console.error(error)

      setCliente(null)

      toast.error("No se pudo buscar el cliente.")
    } finally {
      setBuscandoCliente(false)
    }
  }

  // ============================================================
  // GUÍAS FILTRADAS
  // ============================================================

  const guiasFiltradas = useMemo(() => {
    const texto = busquedaGuia.trim().toLowerCase()

    if (!texto) {
      return guias
    }

    return guias.filter((guia) => {
      return (
        guia.numeroGuia.toLowerCase().includes(texto) ||
        guia.contenedor.numeroContenedor.toLowerCase().includes(texto)
      )
    })
  }, [guias, busquedaGuia])

  // ============================================================
  // SELECCIONAR / DESELECCIONAR GUÍA
  // ============================================================

  function toggleGuia(guiaId: number) {
    setGuiasSeleccionadas((actuales) => {
      if (actuales.includes(guiaId)) {
        return actuales.filter((id) => id !== guiaId)
      }

      return [...actuales, guiaId]
    })
  }

  // ============================================================
  // SELECCIONAR TODAS LAS VISIBLES
  // ============================================================

  function seleccionarTodas() {
    const idsVisibles = guiasFiltradas.map((guia) => guia.id)

    setGuiasSeleccionadas((actuales) => {
      const nuevoSet = new Set(actuales)

      idsVisibles.forEach((id) => {
        nuevoSet.add(id)
      })

      return Array.from(nuevoSet)
    })
  }

  // ============================================================
  // DESELECCIONAR TODAS LAS VISIBLES
  // ============================================================

  function deseleccionarTodas() {
    const idsVisibles = new Set(guiasFiltradas.map((guia) => guia.id))

    setGuiasSeleccionadas((actuales) =>
      actuales.filter((id) => !idsVisibles.has(id))
    )
  }

  // ============================================================
  // VERIFICAR SI TODAS LAS VISIBLES ESTÁN SELECCIONADAS
  // ============================================================

  const todasVisiblesSeleccionadas =
    guiasFiltradas.length > 0 &&
    guiasFiltradas.every((guia) => guiasSeleccionadas.includes(guia.id))

  // ============================================================
  // ASIGNAR CLIENTE
  // ============================================================

  async function handleAsignarCliente() {
    if (!cliente) {
      toast.error("Primero debes buscar un cliente por DNI o RUC.")
      return
    }

    if (guiasSeleccionadas.length === 0) {
      toast.error("Selecciona al menos una guía.")
      return
    }

    setSubmitting(true)

    try {
      const res = await asignarClienteMasivoAction({
        guiaIds: guiasSeleccionadas,
        clienteId: cliente.id,
      })

      if (!res.success) {
        toast.error(res.message)
        return
      }

      toast.success(res.message)

      setGuiasSeleccionadas([])
      setNumeroDocumento("")
      setCliente(null)
      setBusquedaGuia("")

      setOpen(false)

      onAsignada?.()
    } catch (error) {
      console.error(error)

      toast.error("Ocurrió un error al asignar el cliente.")
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // CERRAR / REINICIAR
  // ============================================================

  function handleOpenChange(value: boolean) {
    setOpen(value)

    if (!value) {
      setGuiasSeleccionadas([])
      setNumeroDocumento("")
      setCliente(null)
      setBusquedaGuia("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <Users className="size-4" />
        Asignar cliente
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-full max-w-[calc(100vw-2rem)] overflow-hidden p-0 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        {" "}
        {/* ========================================================
            HEADER
        ======================================================== */}
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <DialogTitle>Asignar cliente a espacios alquilados</DialogTitle>

          <DialogDescription>
            Busca un cliente mediante su DNI o RUC y asígnalo a las guías de
            espacio alquilado seleccionadas.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] px-4 sm:px-6">
          <div className="space-y-6 py-4">
            {/* ======================================================
                CLIENTE
            ====================================================== */}

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Cliente</h3>

                <p className="text-xs text-muted-foreground">
                  Ingresa el DNI o RUC del cliente que deseas asignar.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder="Ingrese DNI o RUC..."
                    className="pl-9"
                    disabled={buscandoCliente || submitting}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleBuscarCliente()
                      }
                    }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleBuscarCliente}
                  disabled={
                    buscandoCliente || submitting || !numeroDocumento.trim()
                  }
                  className="gap-2"
                >
                  {buscandoCliente ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Search className="size-4" />
                  )}

                  {buscandoCliente ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              {/* CLIENTE ENCONTRADO */}

              {cliente && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <UserRound className="size-5 text-primary" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {cliente.nombreCompleto ?? "Sin nombre registrado"}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {cliente.tipoDocumento}: {cliente.numeroDocumento}
                      </p>
                    </div>

                    <Badge variant="secondary">Cliente encontrado</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* ======================================================
                GUÍAS
            ====================================================== */}

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    Guías de espacio alquilado
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {guias.length} guía
                    {guias.length === 1 ? "" : "s"} encontradas
                  </p>
                </div>

                {guiasFiltradas.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={
                      todasVisiblesSeleccionadas
                        ? deseleccionarTodas
                        : seleccionarTodas
                    }
                    disabled={submitting}
                  >
                    {todasVisiblesSeleccionadas
                      ? "Deseleccionar todas"
                      : "Seleccionar todas"}
                  </Button>
                )}
              </div>

              {/* BUSCAR GUÍA */}

              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  value={busquedaGuia}
                  onChange={(e) => setBusquedaGuia(e.target.value)}
                  placeholder="Buscar por número de guía o contenedor..."
                  className="pl-9"
                  disabled={submitting}
                />
              </div>

              {/* LISTA */}

              <div className="overflow-hidden rounded-lg border">
                {cargandoGuias ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Cargando guías...
                  </div>
                ) : guiasFiltradas.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay guías de espacio alquilado.
                  </div>
                ) : (
                  <div className="divide-y">
                    {guiasFiltradas.map((guia) => {
                      const seleccionada = guiasSeleccionadas.includes(guia.id)

                      return (
                        <label
                          key={guia.id}
                          className="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={seleccionada}
                            disabled={submitting}
                            onCheckedChange={() => toggleGuia(guia.id)}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-medium">
                                Guía {guia.numeroGuia}
                              </span>

                              <Badge variant="secondary">
                                ESPACIO ALQUILADO
                              </Badge>

                              {guia.clienteId !== null && (
                                <Badge variant="outline">
                                  Ya tiene cliente
                                </Badge>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                              Contenedor {guia.contenedor.numeroContenedor}
                            </p>
                          </div>

                          {seleccionada && (
                            <Check className="size-4 text-primary" />
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================
                RESUMEN
            ====================================================== */}

            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Guías seleccionadas</p>

                  <p className="text-xs text-muted-foreground">
                    El cliente encontrado será asignado a estas guías.
                  </p>
                </div>

                <Badge>{guiasSeleccionadas.length}</Badge>
              </div>
            </div>
          </div>
        </ScrollArea>
        {/* ========================================================
            FOOTER
        ======================================================== */}
        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleAsignarCliente}
            disabled={submitting || !cliente || guiasSeleccionadas.length === 0}
            className="gap-2"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}

            {submitting ? "Asignando..." : "Asignar cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
