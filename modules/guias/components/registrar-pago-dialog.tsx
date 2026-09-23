// modules/guias/components/registrar-pago-dialog.tsx

"use client"

import { useEffect, useState } from "react"
import { useForm, FormProvider, useFormContext } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, WalletCards } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import {
  registrarPagoGuiaSchema,
  type RegistrarPagoGuiaSchema,
} from "../guia.schema"
import { registrarPagoGuiaAction } from "../guia.actions"

import { ClienteField } from "./fields/cliente-field"
import { FechaHoraField } from "./fields/fecha-hora-field"
import type { GuiaConRelaciones } from "./guia-con-relaciones.type"

const FORM_ID = "registrar-pago-form"
const METODO_PAGO_DEFAULT = "YAPE" as const

const METODOS_PAGO = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "YAPE", label: "Yape" },
  { value: "PLIN", label: "Plin" },
  { value: "TRANSFERENCIA", label: "Transferencia bancaria" },
  { value: "TARJETA", label: "Tarjeta" },
  { value: "OTRO", label: "Otro" },
] as const

type RegistrarPagoDialogProps = {
  /** Guía sobre la que se registra el pago. Debe incluir `cliente` si existe. */
  guia: GuiaConRelaciones
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Tras un registro exitoso (el padre suele cerrar el contexto y refrescar). */
  onRegistrado?: () => void
}

type ClienteForm = RegistrarPagoGuiaSchema["cliente"]

function valoresIniciales(guiaId: number) {
  return {
    guiaId,
    cliente: null,
    metodoPago: METODO_PAGO_DEFAULT,
    numeroOperacion: "",
    fechaPago: undefined,
    horaPago: undefined,
  }
}

/** Precarga el cliente de la guía en el form; no se edita si ya está asociado. */
function clienteDesdeGuia(guia: GuiaConRelaciones): ClienteForm {
  if (!guia.cliente) {
    return null
  }

  return {
    tipoDocumento: guia.cliente.tipoDocumento,
    numeroDocumento: guia.cliente.numeroDocumento,
    nombreCompleto: guia.cliente.nombreCompleto ?? "",
  }
}

function valoresAlAbrir(guia: GuiaConRelaciones) {
  return {
    ...valoresIniciales(guia.id),
    cliente: clienteDesdeGuia(guia),
  }
}

function formatMoneda(valor: number | null) {
  if (valor === null || valor === undefined) {
    return "—"
  }

  return `S/ ${valor.toFixed(2)}`
}

/**
 * Omite un cliente incompleto (p. ej. switch apagado o documento vacío)
 * para que el backend reciba `cliente: null`.
 */
function payloadRegistroPago(
  data: RegistrarPagoGuiaSchema
): RegistrarPagoGuiaSchema {
  return {
    ...data,
    cliente:
      data.cliente && data.cliente.numeroDocumento
        ? {
            ...data.cliente,
            nombreCompleto: data.cliente.nombreCompleto || undefined,
          }
        : null,
  }
}

/**
 * Diálogo de registro de pago de una guía de almacenamiento.
 *
 * Flujo: resumen del monto → método y operación → cliente (si aplica) →
 * fecha/hora → `registrarPagoGuiaAction`. En éxito: toast, reset, cierra
 * y dispara `onRegistrado`.
 *
 * Reglas (schema + servicio):
 * - `numeroOperacion` es obligatorio salvo `metodoPago === "EFECTIVO"`.
 * - Cliente existente: solo lectura; no se reasigna en este flujo.
 * - Sin cliente: asociarlo es opcional (switch).
 * - El backend rechaza guías sin `montoTotal` o ya `PAGADO`.
 *
 * El formulario se resetea cada vez que `open` pasa a `true`.
 */
export function RegistrarPagoDialog({
  guia,
  open,
  onOpenChange,
  onRegistrado,
}: RegistrarPagoDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const [registrarCliente, setRegistrarCliente] = useState(false)

  const tieneCliente = guia.cliente !== null

  const form = useForm<RegistrarPagoGuiaSchema>({
    resolver: zodResolver(registrarPagoGuiaSchema),
    defaultValues: valoresIniciales(guia.id),
  })

  useEffect(() => {
    setRegistrarCliente(false)

    if (!open) {
      return
    }

    form.reset(valoresAlAbrir(guia))
  }, [open, guia, form])

  const esEfectivo = form.watch("metodoPago") === "EFECTIVO"

  async function onSubmit(data: RegistrarPagoGuiaSchema) {
    setSubmitting(true)

    const res = await registrarPagoGuiaAction(payloadRegistroPago(data))

    setSubmitting(false)

    if (!res.success) {
      toast.error(res.message)
      return
    }

    toast.success(res.message)
    form.reset(valoresIniciales(guia.id))
    setRegistrarCliente(false)
    onOpenChange(false)
    onRegistrado?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-lg overflow-hidden p-0 sm:w-[calc(100%-2rem)]">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <CreditCard className="size-5" />
            <DialogTitle>Registrar pago — Guía {guia.numeroGuia}</DialogTitle>
          </div>
          <DialogDescription>
            Registra la información del pago realizado por el cliente.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-4 sm:px-6">
          <FormProvider {...form}>
            <form
              id={FORM_ID}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <ResumenMonto montoTotal={guia.montoTotal} />

              <Separator />

              <CampoMetodoPago />
              <CampoNumeroOperacion esEfectivo={esEfectivo} />

              <Separator />

              <SeccionCliente
                cliente={guia.cliente}
                tieneCliente={tieneCliente}
                registrarCliente={registrarCliente}
                onToggleRegistrarCliente={setRegistrarCliente}
              />

              <FechaHoraField
                fechaName="fechaPago"
                horaName="horaPago"
                label="Fecha y hora de pago"
              />
            </form>
          </FormProvider>
        </ScrollArea>

        <DialogFooter className="border-t px-4 py-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={submitting}
            className="w-full gap-2 sm:w-auto"
          >
            <CreditCard className="size-4" />
            {submitting ? "Guardando..." : "Registrar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResumenMonto({ montoTotal }: { montoTotal: number | null }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Monto total de la guía</p>
          <p className="text-xl font-semibold">{formatMoneda(montoTotal)}</p>
        </div>
        <WalletCards className="size-6 text-muted-foreground" />
      </div>
    </div>
  )
}

function CampoMetodoPago() {
  const { control } = useFormContext<RegistrarPagoGuiaSchema>()

  return (
    <FormField
      control={control}
      name="metodoPago"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Método de pago</FormLabel>
          <Select
            value={field.value ?? METODO_PAGO_DEFAULT}
            onValueChange={field.onChange}
          >
            <FormControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {METODOS_PAGO.map((metodo) => (
                <SelectItem key={metodo.value} value={metodo.value}>
                  {metodo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function CampoNumeroOperacion({ esEfectivo }: { esEfectivo: boolean }) {
  const { control } = useFormContext<RegistrarPagoGuiaSchema>()

  return (
    <FormField
      control={control}
      name="numeroOperacion"
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Número de operación
            {esEfectivo ? (
              <span className="ml-1 text-muted-foreground">(opcional)</span>
            ) : (
              <span className="ml-1 text-destructive">*</span>
            )}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={
                esEfectivo ? "Ej. 123456789 (opcional)" : "Ej. 123456789"
              }
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <p className="text-xs text-muted-foreground">
            {esEfectivo
              ? "Puedes dejarlo vacío si el pago fue en efectivo."
              : "Obligatorio para pagos por Yape, Plin, Transferencia o Tarjeta."}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function SeccionCliente({
  cliente,
  tieneCliente,
  registrarCliente,
  onToggleRegistrarCliente,
}: {
  cliente: GuiaConRelaciones["cliente"]
  tieneCliente: boolean
  registrarCliente: boolean
  onToggleRegistrarCliente: (checked: boolean) => void
}) {
  const { setValue } = useFormContext<RegistrarPagoGuiaSchema>()

  function handleToggle(checked: boolean) {
    onToggleRegistrarCliente(checked)

    if (!checked) {
      setValue("cliente", null)
      return
    }

    setValue("cliente", {
      tipoDocumento: "DNI",
      numeroDocumento: "",
      nombreCompleto: "",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold">Cliente</p>
        <p className="text-xs text-muted-foreground">
          {tieneCliente
            ? "Cliente asociado a la guía."
            : "Esta guía no tiene un cliente asociado. Puedes identificarlo durante el registro del pago si corresponde."}
        </p>
      </div>

      {tieneCliente ? (
        <ClienteSoloLectura cliente={cliente} />
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Identificar cliente</p>
              <p className="text-xs text-muted-foreground">
                Opcional. Puedes registrar el pago sin asociar ningún cliente.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Asociar cliente
              </span>
              <Switch checked={registrarCliente} onCheckedChange={handleToggle} />
            </div>
          </div>

          {registrarCliente && (
            <div className="rounded-lg border p-4">
              <ClienteField />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function ClienteSoloLectura({
  cliente,
}: {
  cliente: GuiaConRelaciones["cliente"]
}) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">
            {cliente?.nombreCompleto || "Sin nombre registrado"}
          </p>
          <p className="text-xs text-muted-foreground">
            {cliente?.tipoDocumento}: {cliente?.numeroDocumento}
          </p>
        </div>
        <span className="shrink-0 rounded-md border px-2 py-1 text-xs text-muted-foreground">
          Solo lectura
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Este cliente ya está asociado a la guía y no puede modificarse durante
        el registro del pago.
      </p>
    </div>
  )
}
