// modules/guias/components/crear-guia-dialog.tsx

"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { crearGuiaSchema, type CrearGuiaSchema } from "../guia.schema";
import { crearGuiaAction } from "../guia.actions";
import { ClienteField } from "./fields/cliente-field";
import { ContenedorField } from "./fields/contenedor-field";
import { TransportistaFields } from "./fields/transportista-fields";
import { FechaHoraField } from "./fields/fecha-hora-field";

/**
 * Ajusta este import al action real de tu módulo de configuración.
 * Debe devolver la configuración de precios activa:
 * { precioPrimerDia, precioDiaAdicional, porcentajeIGV }
 */
import { obtenerConfiguracionPrecioAction } from "@/modules/configuracion/configuracion.actions";

const SECTION_TITLE =
  "text-sm font-semibold text-foreground";

type CrearGuiaDialogProps = {
  onCreada?: () => void;
};

export function CrearGuiaDialog({ onCreada }: CrearGuiaDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [precioBase, setPrecioBase] = useState<{
    precioPrimerDia: number;
    precioDiaAdicional: number;
  } | null>(null);

  const form = useForm<CrearGuiaSchema>({
    resolver: zodResolver(crearGuiaSchema),
    defaultValues: {
      numeroGuia: "",
      cliente: {
        tipoDocumento: "DNI",
        numeroDocumento: "",
        nombreCompleto: "",
      },
      contenedor: {
        numeroContenedor: "",
        marca: "",
        medida: undefined,
        tipo: "NORMAL",
      },
      transportistaIngreso: {
        empresaNombre: "",
        placa: "",
        conductorNombre: "",
        numeroLicencia: "",
      },
      fechaIngreso: undefined,
      horaIngreso: undefined,
      tipoPrecio: "ESTANDAR",
      precioPrimerDia: undefined,
      precioDiaAdicional: undefined,
      tratamientoIGV: "SIN_IGV",
      observaciones: "",
    },
  });

  const tipoPrecio = form.watch("tipoPrecio");
  const tratamientoIGV = form.watch("tratamientoIGV");

  // Carga la configuración de precios activa al abrir el diálogo,
  // para mostrar y usar por defecto los precios estándar.
  useEffect(() => {
    if (!open) return;

    obtenerConfiguracionPrecioAction().then((res) => {
      if (res?.success && res.data) {
        const base = {
          precioPrimerDia: Number(res.data.precioPrimerDia),
          precioDiaAdicional: Number(res.data.precioDiaAdicional),
        };
        setPrecioBase(base);
        form.setValue("precioPrimerDia", base.precioPrimerDia);
        form.setValue("precioDiaAdicional", base.precioDiaAdicional);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleTipoPrecioChange(
    value: "ESTANDAR" | "PERSONALIZADO" | null,
  ) {
    if (!value) return;

    form.setValue("tipoPrecio", value);
    if (value === "ESTANDAR" && precioBase) {
      form.setValue("precioPrimerDia", precioBase.precioPrimerDia);
      form.setValue("precioDiaAdicional", precioBase.precioDiaAdicional);
    }
  }

  async function onSubmit(data: CrearGuiaSchema) {
    setSubmitting(true);

    const payload = {
      ...data,
      cliente:
        data.cliente && data.cliente.numeroDocumento
          ? {
              ...data.cliente,
              nombreCompleto: data.cliente.nombreCompleto || undefined,
            }
          : null,
    };

    const res = await crearGuiaAction(payload);
    setSubmitting(false);

    if (!res.success) {
      toast.error(res.message);
      return;
    }

    toast.success(res.message);
    form.reset();
    setOpen(false);
    onCreada?.();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="gap-2" />}
      >
        <PlusCircle className="size-4" />
        Registrar guía
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Registrar ingreso de contenedor</DialogTitle>
          <DialogDescription>
            Completa los datos del cliente, el contenedor y el
            transportista que entrega.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] px-6">
          <FormProvider {...form}>
            <form
              id="crear-guia-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="numeroGuia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de guía</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: G-000123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <p className={SECTION_TITLE}>Cliente</p>
                <ClienteField />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className={SECTION_TITLE}>Contenedor</p>
                <ContenedorField />
              </div>

              <Separator />

              <div className="space-y-3">
                <p className={SECTION_TITLE}>
                  Transportista que entrega
                </p>
                <TransportistaFields prefix="transportistaIngreso" />
              </div>

              <Separator />

              <FechaHoraField
                fechaName="fechaIngreso"
                horaName="horaIngreso"
                label="Fecha y hora de ingreso"
              />

              <Separator />

              <div className="space-y-3">
                <p className={SECTION_TITLE}>Precio de almacenamiento</p>

                <FormField
                  control={form.control}
                  name="tipoPrecio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de precio</FormLabel>
                      <Select
                        onValueChange={handleTipoPrecioChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ESTANDAR">
                            Estándar
                          </SelectItem>
                          <SelectItem value="PERSONALIZADO">
                            Personalizado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="precioPrimerDia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio primer día (S/)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            disabled={tipoPrecio === "ESTANDAR"}
                            className={
                              tipoPrecio === "ESTANDAR"
                                ? "bg-muted"
                                : undefined
                            }
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="precioDiaAdicional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio día adicional (S/)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            disabled={tipoPrecio === "ESTANDAR"}
                            className={
                              tipoPrecio === "ESTANDAR"
                                ? "bg-muted"
                                : undefined
                            }
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value),
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>¿El cliente solicita factura (con IGV)?</Label>
                    <p className="text-xs text-muted-foreground">
                      Por defecto la guía no incluye IGV.
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
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Observaciones{" "}
                      <span className="font-normal text-muted-foreground">
                        (opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Notas adicionales sobre la guía"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </FormProvider>
        </ScrollArea>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="crear-guia-form"
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Registrar guía"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
