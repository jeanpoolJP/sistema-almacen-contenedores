// modules/guias/components/registrar-salida-dialog.tsx

"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CopyPlus, LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  registrarSalidaGuiaSchema,
  type RegistrarSalidaGuiaSchema,
} from "../guia.schema";
import { registrarSalidaGuiaAction } from "../guia.actions";
import { TransportistaFields } from "./fields/transportista-fields";
import { FechaHoraField } from "./fields/fecha-hora-field";
import type { GuiaConRelaciones } from "./guia-con-relaciones.type";

type RegistrarSalidaDialogProps = {
  guia: GuiaConRelaciones;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistrada?: () => void;
};

export function RegistrarSalidaDialog({
  guia,
  open,
  onOpenChange,
  onRegistrada,
}: RegistrarSalidaDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<RegistrarSalidaGuiaSchema>({
    resolver: zodResolver(registrarSalidaGuiaSchema),
    defaultValues: {
      guiaId: guia.id,
      transportistaSalida: {
        empresaNombre: "",
        placa: "",
        conductorNombre: "",
        numeroLicencia: "",
      },
      fechaSalida: undefined,
      horaSalida: undefined,
      tratamientoIGV: guia.tratamientoIGV,
    },
  });

  const tratamientoIGV = form.watch("tratamientoIGV");

  function copiarDatosIngreso() {
    form.setValue("transportistaSalida.empresaNombre", guia.empresaTransporteIngreso.nombre);
    form.setValue("transportistaSalida.placa", guia.vehiculoIngreso.placa);
    form.setValue("transportistaSalida.conductorNombre", guia.conductorIngreso.nombreCompleto);
    form.setValue("transportistaSalida.numeroLicencia", guia.conductorIngreso.numeroLicencia);
    toast.info("Se copiaron los datos del transportista de ingreso");
  }

  async function onSubmit(data: RegistrarSalidaGuiaSchema) {
    setSubmitting(true);
    const res = await registrarSalidaGuiaAction(data);
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    form.reset();
    onOpenChange(false);
    onRegistrada?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            Registrar salida — Guía {guia.numeroGuia}
          </DialogTitle>
          <DialogDescription>
            Contenedor {guia.contenedor.numeroContenedor} ·{" "}
            {guia.cliente?.nombreCompleto ??
              guia.cliente?.numeroDocumento ??
              "Sin cliente"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6">
          <FormProvider {...form}>
            <form
              id="registrar-salida-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">
                    Transportista que recoge
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground"
                    onClick={copiarDatosIngreso}
                  >
                    <CopyPlus className="size-3.5" />
                    Usar mismos datos de ingreso
                  </Button>
                </div>
                <TransportistaFields prefix="transportistaSalida" />
              </div>

              <Separator />

              <FechaHoraField
                fechaName="fechaSalida"
                horaName="horaSalida"
                label="Fecha y hora de salida"
              />

              <Separator />

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label>¿El cliente solicita factura (con IGV)?</Label>
                  <p className="text-xs text-muted-foreground">
                    Se recalculará el monto total con el 18% de IGV.
                  </p>
                </div>
                <Switch
                  checked={tratamientoIGV === "CON_IGV"}
                  onCheckedChange={(checked) =>
                    form.setValue(
                      "tratamientoIGV",
                      checked ? "CON_IGV" : "SIN_IGV",
                    )
                  }
                />
              </div>
            </form>
          </FormProvider>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="registrar-salida-form"
            disabled={submitting}
            className="gap-2"
          >
            <LogOut className="size-4" />
            {submitting ? "Guardando..." : "Registrar salida"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
