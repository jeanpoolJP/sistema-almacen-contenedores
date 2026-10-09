"use client"

import { Loader2Icon, PencilIcon, UserPlusIcon } from "lucide-react"
import { useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  asignarClienteAlquilerAction,
  obtenerOpcionesAlquilerAction,
} from "../actions/control-alquiler.actions"

type SuccessData<T> = T extends { success: true; data: infer Data }
  ? Data
  : never
type Opciones = SuccessData<
  Awaited<ReturnType<typeof obtenerOpcionesAlquilerAction>>
>
type Cliente = Opciones["clientes"][number]
type ClienteAsignado = Omit<Cliente, "_count">

interface AsignarClienteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guiaId: string
  numeroGuia: string
  clienteActual: ClienteAsignado | null
  clientesFrecuentes: Cliente[]
  onSuccess: () => void
}

type DatosCliente = {
  tipoDocumento: "DNI" | "RUC"
  numeroDocumento: string
  nombreCompleto: string
  telefono: string
  observaciones: string
}

const datosVacios: DatosCliente = {
  tipoDocumento: "DNI",
  numeroDocumento: "",
  nombreCompleto: "",
  telefono: "",
  observaciones: "",
}

export function AsignarClienteDialog({
  open,
  onOpenChange,
  guiaId,
  numeroGuia,
  clienteActual,
  clientesFrecuentes,
  onSuccess,
}: AsignarClienteDialogProps) {
  const [busqueda, setBusqueda] = useState("")
  const [clienteId, setClienteId] = useState(
    clienteActual ? String(clienteActual.id) : ""
  )
  const [modoFormulario, setModoFormulario] = useState<
    "nuevo" | "editar" | null
  >(null)
  const [datos, setDatos] = useState<DatosCliente>(datosVacios)
  const [isPending, startTransition] = useTransition()

  const opciones = useMemo(() => {
    const unicos = new Map<number, ClienteAsignado>()
    if (clienteActual) unicos.set(clienteActual.id, clienteActual)
    clientesFrecuentes.forEach((cliente) => unicos.set(cliente.id, cliente))
    return Array.from(unicos.values())
  }, [clienteActual, clientesFrecuentes])

  const clientesFiltrados = useMemo(() => {
    const term = busqueda.trim().toLocaleLowerCase()
    if (!term) return opciones
    return opciones.filter((cliente) =>
      [
        cliente.nombreCompleto ?? "",
        cliente.numeroDocumento,
        cliente.tipoDocumento,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term)
    )
  }, [busqueda, opciones])

  function editarSeleccionado() {
    const cliente = opciones.find((item) => String(item.id) === clienteId)
    if (!cliente) return
    setDatos({
      tipoDocumento: cliente.tipoDocumento,
      numeroDocumento: cliente.numeroDocumento,
      nombreCompleto: cliente.nombreCompleto ?? "",
      telefono: cliente.telefono ?? "",
      observaciones: cliente.observaciones ?? "",
    })
    setModoFormulario("editar")
  }

  function guardarCliente() {
    if (
      !datos.numeroDocumento.trim() ||
      !datos.nombreCompleto.trim() ||
      datos.nombreCompleto.trim().length < 3
    ) {
      toast.error("Ingresa un documento y un nombre o razón social válido.")
      return
    }
    startTransition(async () => {
      const result = await asignarClienteAlquilerAction({
        guiaAlquilerId: guiaId,
        ...(modoFormulario === "editar"
          ? { clienteId: Number(clienteId) }
          : {}),
        clienteData: datos,
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onOpenChange(false)
      onSuccess()
    })
  }

  function asignarSeleccionado() {
    if (!clienteId) {
      toast.error("Selecciona un cliente.")
      return
    }
    startTransition(async () => {
      const result = await asignarClienteAlquilerAction({
        guiaAlquilerId: guiaId,
        clienteId: Number(clienteId),
      })
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      onOpenChange(false)
      onSuccess()
    })
  }

  function actualizarDato<K extends keyof DatosCliente>(
    campo: K,
    valor: DatosCliente[K]
  ) {
    setDatos((actual) => ({ ...actual, [campo]: valor }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {clienteActual ? "Cambiar cliente" : "Asignar cliente"}
          </DialogTitle>
          <DialogDescription>
            Guía <span className="font-mono font-medium">{numeroGuia}</span>.
            Selecciona uno de los clientes frecuentes o registra/edita sus
            datos.
          </DialogDescription>
        </DialogHeader>

        {modoFormulario === null ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buscar-cliente-alquiler">Buscar cliente</Label>
              <Input
                id="buscar-cliente-alquiler"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Nombre, DNI o RUC"
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={clienteId}
                onValueChange={(value) => setClienteId(value ?? "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientesFiltrados.map((cliente) => (
                    <SelectItem key={cliente.id} value={String(cliente.id)}>
                      {cliente.nombreCompleto || "Sin nombre"} —{" "}
                      {cliente.tipoDocumento} {cliente.numeroDocumento}
                    </SelectItem>
                  ))}
                  {clientesFiltrados.length === 0 && (
                    <div className="px-2 py-3 text-sm text-muted-foreground">
                      No se encontraron clientes en los primeros 100.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Se muestran los 100 clientes activos con mayor uso en guías de
                alquiler.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                onClick={asignarSeleccionado}
                disabled={!clienteId || isPending}
              >
                Asignar cliente seleccionado
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={editarSeleccionado}
                disabled={!clienteId || isPending}
              >
                <PencilIcon className="mr-2 size-4" />
                Editar datos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDatos(datosVacios)
                  setModoFormulario("nuevo")
                }}
                disabled={isPending}
              >
                <UserPlusIcon className="mr-2 size-4" />
                Nuevo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de documento</Label>
                <Select
                  value={datos.tipoDocumento}
                  onValueChange={(value) => {
                    if (value) actualizarDato("tipoDocumento", value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="documento-cliente-alquiler">
                  Número de documento
                </Label>
                <Input
                  id="documento-cliente-alquiler"
                  value={datos.numeroDocumento}
                  onChange={(event) =>
                    actualizarDato("numeroDocumento", event.target.value)
                  }
                  maxLength={datos.tipoDocumento === "DNI" ? 8 : 11}
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="nombre-cliente-alquiler">
                  Nombre o razón social
                </Label>
                <Input
                  id="nombre-cliente-alquiler"
                  value={datos.nombreCompleto}
                  onChange={(event) =>
                    actualizarDato("nombreCompleto", event.target.value)
                  }
                  maxLength={150}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="telefono-cliente-alquiler">Teléfono</Label>
                <Input
                  id="telefono-cliente-alquiler"
                  value={datos.telefono}
                  onChange={(event) =>
                    actualizarDato("telefono", event.target.value)
                  }
                  maxLength={20}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="observaciones-cliente-alquiler">
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones-cliente-alquiler"
                  value={datos.observaciones}
                  onChange={(event) =>
                    actualizarDato("observaciones", event.target.value)
                  }
                  maxLength={1000}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setModoFormulario(null)}
                disabled={isPending}
              >
                Volver
              </Button>
              <Button
                type="button"
                onClick={guardarCliente}
                disabled={isPending}
              >
                {isPending && (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                )}
                {modoFormulario === "nuevo"
                  ? "Registrar y asignar"
                  : "Guardar cambios"}
              </Button>
            </DialogFooter>
          </div>
        )}

        {modoFormulario === null && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cerrar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
