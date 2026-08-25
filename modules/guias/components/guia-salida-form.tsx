"use client";

import { useState } from "react";
import {
  Clock3,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { registrarSalidaGuiaAction } from "../guia.actions";

import type {
  RegistrarSalidaGuiaInput,
} from "../guia.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TratamientoIGV =
  | "SIN_IGV"
  | "CON_IGV";

type FormState = {
  transportistaSalida: {
    empresaNombre: string;
    empresaRuc: string;
    empresaTelefono: string;
    placa: string;
    conductorNombre: string;
    numeroLicencia: string;
  };

  fechaSalida: string;
  horaSalida: string;

  tratamientoIGV: TratamientoIGV;
};

const estadoInicial: FormState = {
  transportistaSalida: {
    empresaNombre: "",
    empresaRuc: "",
    empresaTelefono: "",
    placa: "",
    conductorNombre: "",
    numeroLicencia: "",
  },

  fechaSalida: "",
  horaSalida: "",

  tratamientoIGV: "SIN_IGV",
};

function obtenerFechaActual() {
  const ahora = new Date();

  return ahora.toISOString().split("T")[0];
}

function obtenerHoraActual() {
  const ahora = new Date();

  return `${String(
    ahora.getHours(),
  ).padStart(2, "0")}:${String(
    ahora.getMinutes(),
  ).padStart(2, "0")}`;
}

type SalidaGuiaFormProps = {
  guiaId: number;
};

export function SalidaGuiaForm({
  guiaId,
}: SalidaGuiaFormProps) {
  const [form, setForm] =
    useState<FormState>(
      estadoInicial,
    );

  const [guardando, setGuardando] =
    useState(false);

  function actualizarTransportista(
    campo: keyof FormState["transportistaSalida"],
    valor: string,
  ) {
    setForm((actual) => ({
      ...actual,
      transportistaSalida: {
        ...actual.transportistaSalida,
        [campo]: valor,
      },
    }));
  }

  function actualizarFechaHoraActual() {
    setForm((actual) => ({
      ...actual,
      fechaSalida:
        obtenerFechaActual(),
      horaSalida:
        obtenerHoraActual(),
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setGuardando(true);

      if (
        !form.transportistaSalida
          .empresaNombre.trim()
      ) {
        toast.error(
          "La empresa de transporte es obligatoria",
        );
        return;
      }

      if (
        !form.transportistaSalida
          .placa.trim()
      ) {
        toast.error(
          "La placa es obligatoria",
        );
        return;
      }

      if (
        !form.transportistaSalida
          .conductorNombre.trim()
      ) {
        toast.error(
          "El nombre del conductor es obligatorio",
        );
        return;
      }

      if (
        !form.transportistaSalida
          .numeroLicencia.trim()
      ) {
        toast.error(
          "El número de licencia es obligatorio",
        );
        return;
      }

      if (!form.fechaSalida) {
        toast.error(
          "La fecha de salida es obligatoria",
        );
        return;
      }

      if (!form.horaSalida) {
        toast.error(
          "La hora de salida es obligatoria",
        );
        return;
      }

      const data: RegistrarSalidaGuiaInput = {
        guiaId,

        transportistaSalida: {
          empresaNombre:
            form.transportistaSalida
              .empresaNombre.trim(),

          empresaRuc:
            form.transportistaSalida
              .empresaRuc.trim() ||
            null,

          empresaTelefono:
            form.transportistaSalida
              .empresaTelefono.trim() ||
            null,

          placa:
            form.transportistaSalida
              .placa.trim(),

          conductorNombre:
            form.transportistaSalida
              .conductorNombre.trim(),

          numeroLicencia:
            form.transportistaSalida
              .numeroLicencia.trim(),
        },

        fechaSalida: new Date(
          `${form.fechaSalida}T00:00:00`,
        ),

        horaSalida: new Date(
          `1970-01-01T${form.horaSalida}:00`,
        ),

        tratamientoIGV:
          form.tratamientoIGV,
      };

      const resultado =
        await registrarSalidaGuiaAction(
          data,
        );

      if (!resultado.success) {
        toast.error(
          resultado.message,
        );
        return;
      }

      toast.success(
        resultado.message,
      );

      setForm(estadoInicial);
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado",
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            Registrar salida
          </CardTitle>

          <CardDescription>
            Registra el transportista que
            retira el contenedor del almacén.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Empresa de transporte
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .empresaNombre
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaNombre",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              RUC
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .empresaRuc
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaRuc",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Teléfono
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .empresaTelefono
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaTelefono",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Placa / Camión
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .placa
              }
              onChange={(e) =>
                actualizarTransportista(
                  "placa",
                  e.target.value.toUpperCase(),
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Nombre del conductor
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .conductorNombre
              }
              onChange={(e) =>
                actualizarTransportista(
                  "conductorNombre",
                  e.target.value,
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label>
              Número de licencia
            </Label>

            <Input
              value={
                form.transportistaSalida
                  .numeroLicencia
              }
              onChange={(e) =>
                actualizarTransportista(
                  "numeroLicencia",
                  e.target.value.toUpperCase(),
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Fecha y hora de salida
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={
                actualizarFechaHoraActual
              }
            >
              <Clock3 className="mr-2 h-4 w-4" />

              Usar fecha y hora actual
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Fecha de salida
              </Label>

              <Input
                type="date"
                value={
                  form.fechaSalida
                }
                onChange={(e) =>
                  setForm((actual) => ({
                    ...actual,
                    fechaSalida:
                      e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Hora de salida
              </Label>

              <Input
                type="time"
                value={
                  form.horaSalida
                }
                onChange={(e) =>
                  setForm((actual) => ({
                    ...actual,
                    horaSalida:
                      e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Tratamiento del IGV
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="max-w-sm space-y-2">
            <Label>
              Facturación
            </Label>

            <Select
              value={
                form.tratamientoIGV
              }
              onValueChange={(value) =>
                setForm((actual) => ({
                  ...actual,
                  tratamientoIGV:
                    value as TratamientoIGV,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="SIN_IGV">
                  Sin IGV
                </SelectItem>

                <SelectItem value="CON_IGV">
                  Con IGV
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={guardando}
          size="lg"
        >
          {guardando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Registrando salida...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />

              Registrar salida
            </>
          )}
        </Button>
      </div>
    </form>
  );
}