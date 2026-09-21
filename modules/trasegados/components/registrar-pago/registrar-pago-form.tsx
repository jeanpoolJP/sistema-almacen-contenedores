// modules\trasegados\components\registrar-pago\registrar-pago-form.tsx

"use client"

import { Loader2Icon, SaveIcon } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"

import { SeccionTotales } from "./seccion-totales"
import { SeccionMetodoPago } from "./seccion-metodo-pago"
import type { RegistrarPagoInput } from "../../schemas/registrar-pago.schema"
import type { TotalesCalculados } from "../../utils/calcular-totales"

interface RegistrarPagoFormProps {
  form: UseFormReturn<RegistrarPagoInput>
  onSubmit: (e?: React.BaseSyntheticEvent) => void
  isPending: boolean
  totales: TotalesCalculados
  esEdicion: boolean
  onCancel: () => void
}

export function RegistrarPagoForm({
  form,
  onSubmit,
  isPending,
  totales,
  esEdicion,
  onCancel,
}: RegistrarPagoFormProps) {
  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        className="space-y-6"
        autoComplete="off"
        noValidate
      >
        <SeccionTotales form={form} totales={totales} />

        <SeccionMetodoPago form={form} />

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <SaveIcon className="mr-2 size-4" />
                {esEdicion ? "Actualizar pago" : "Registrar pago"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
