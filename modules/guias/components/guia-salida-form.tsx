"use client";

import { useState } from "react";
import { Clock, Save, Copy } from "lucide-react";
import { toast } from "sonner";

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
import { Separator } from "@/components/ui/separator";

export function GuiaSalidaForm() {
  const [numeroGuia, setNumeroGuia] =
    useState("");

  const [empresaTransporte, setEmpresaTransporte] =
    useState("");

  const [placa, setPlaca] =
    useState("");

  const [numeroLicencia, setNumeroLicencia] =
    useState("");

  const [nombreConductor, setNombreConductor] =
    useState("");

  const [fechaSalida, setFechaSalida] =
    useState("");

  const [horaSalida, setHoraSalida] =
    useState("");

  const [tratamientoIGV, setTratamientoIGV] =
    useState<"SIN_IGV" | "CON_IGV">(
      "SIN_IGV"
    );

  const [guardando, setGuardando] =
    useState(false);

  /*
   * Estos valores posteriormente vendrán
   * desde la guía seleccionada.
   */
  const [diasAlmacenamiento] =
    useState<number | null>(null);

  const [subtotal] =
    useState<number | null>(null);

  const [montoIGV] =
    useState<number | null>(null);

  const [montoTotal] =
    useState<number | null>(null);

  function usarFechaHoraActual() {
    const ahora = new Date();

    const fecha = ahora
      .toISOString()
      .split("T")[0];

    const hora = ahora
      .toTimeString()
      .slice(0, 5);

    setFechaSalida(fecha);
    setHoraSalida(hora);
  }

  function repetirTransportistaEntrega() {
    toast.info(
      "Aquí se cargarán los datos del transportista de entrega."
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!numeroGuia.trim()) {
      toast.error(
        "Ingrese el número de guía."
      );
      return;
    }

    if (!fechaSalida || !horaSalida) {
      toast.error(
        "Ingrese la fecha y hora de salida."
      );
      return;
    }

    setGuardando(true);

    try {
      /*
       * Aquí conectaremos posteriormente
       * registrarSalidaAction().
       */

      console.log({
        numeroGuia,

        empresaTransporte,
        placa,

        numeroLicencia,
        nombreConductor,

        fechaSalida,
        horaSalida,

        tratamientoIGV,
      });

      toast.success(
        "Datos de salida validados correctamente."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo registrar la salida."
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
      {/* ===================================================== */}
      {/* GUÍA */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Guía a retirar
          </CardTitle>

          <CardDescription>
            Busca la guía que se encuentra almacenada.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="numeroGuiaSalida">
              Número de guía
            </Label>

            <Input
              id="numeroGuiaSalida"
              value={numeroGuia}
              onChange={(event) =>
                setNumeroGuia(
                  event.target.value
                )
              }
              placeholder="Ej. GUIA-000001"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* TRANSPORTISTA */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                Transportista de recogida
              </CardTitle>

              <CardDescription>
                Datos del vehículo que retirará el contenedor.
              </CardDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={
                repetirTransportistaEntrega
              }
            >
              <Copy className="mr-2 size-4" />
              Repetir datos de entrega
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empresaSalida">
              Empresa de transporte
            </Label>

            <Input
              id="empresaSalida"
              value={empresaTransporte}
              onChange={(event) =>
                setEmpresaTransporte(
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placaSalida">
              Placa
            </Label>

            <Input
              id="placaSalida"
              value={placa}
              onChange={(event) =>
                setPlaca(
                  event.target.value.toUpperCase()
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenciaSalida">
              Número de licencia
            </Label>

            <Input
              id="licenciaSalida"
              value={numeroLicencia}
              onChange={(event) =>
                setNumeroLicencia(
                  event.target.value.toUpperCase()
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conductorSalida">
              Nombre del conductor
            </Label>

            <Input
              id="conductorSalida"
              value={nombreConductor}
              onChange={(event) =>
                setNombreConductor(
                  event.target.value
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SALIDA */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Salida del almacén
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={usarFechaHoraActual}
            >
              <Clock className="mr-2 size-4" />
              Usar fecha y hora actual
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fechaSalida">
                Fecha de salida
              </Label>

              <Input
                id="fechaSalida"
                type="date"
                value={fechaSalida}
                onChange={(event) =>
                  setFechaSalida(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaSalida">
                Hora de salida
              </Label>

              <Input
                id="horaSalida"
                type="time"
                value={horaSalida}
                onChange={(event) =>
                  setHoraSalida(
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* FACTURACIÓN */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Facturación
          </CardTitle>

          <CardDescription>
            Selecciona si el cliente requiere factura.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <Label>
              Tratamiento tributario
            </Label>

            <select
              value={tratamientoIGV}
              onChange={(event) =>
                setTratamientoIGV(
                  event.target.value as
                    | "SIN_IGV"
                    | "CON_IGV"
                )
              }
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="SIN_IGV">
                Sin IGV
              </option>

              <option value="CON_IGV">
                Con IGV
              </option>
            </select>

            <p className="text-sm text-muted-foreground">
              El porcentaje del IGV es administrado
              desde la configuración del sistema y
              no puede modificarse aquí.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* RESUMEN */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Resumen del almacenamiento
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Días de almacenamiento
            </span>

            <span className="font-medium">
              {diasAlmacenamiento ?? "-"}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Subtotal
            </span>

            <span className="font-medium">
              {subtotal !== null
                ? `S/ ${subtotal.toFixed(2)}`
                : "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              IGV
            </span>

            <span className="font-medium">
              {montoIGV !== null
                ? `S/ ${montoIGV.toFixed(2)}`
                : "-"}
            </span>
          </div>

          <Separator />

          <div className="flex justify-between text-lg">
            <span className="font-semibold">
              Total
            </span>

            <span className="font-bold">
              {montoTotal !== null
                ? `S/ ${montoTotal.toFixed(2)}`
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* BOTÓN */}
      {/* ===================================================== */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={guardando}
        >
          <Save className="mr-2 size-4" />

          {guardando
            ? "Registrando..."
            : "Registrar salida"}
        </Button>
      </div>
    </form>
  );
}