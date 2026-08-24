"use client";

import { useState } from "react";
import { Clock, Save } from "lucide-react";
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

export function GuiaIngresoForm() {
  const [numeroGuia, setNumeroGuia] = useState("");

  const [tipoDocumento, setTipoDocumento] =
    useState<"DNI" | "RUC">("DNI");

  const [numeroDocumento, setNumeroDocumento] =
    useState("");

  const [nombreCliente, setNombreCliente] =
    useState("");

  const [numeroContenedor, setNumeroContenedor] =
    useState("");

  const [marcaContenedor, setMarcaContenedor] =
    useState("");

  const [medidaContenedor, setMedidaContenedor] =
    useState("");

  const [tipoContenedor, setTipoContenedor] =
    useState<"NORMAL" | "REEFER">("NORMAL");

  const [empresaTransporte, setEmpresaTransporte] =
    useState("");

  const [placa, setPlaca] = useState("");

  const [numeroLicencia, setNumeroLicencia] =
    useState("");

  const [nombreConductor, setNombreConductor] =
    useState("");

  const [fechaIngreso, setFechaIngreso] =
    useState("");

  const [horaIngreso, setHoraIngreso] =
    useState("");

  const [observaciones, setObservaciones] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  function usarFechaHoraActual() {
    const ahora = new Date();

    const fecha = ahora
      .toISOString()
      .split("T")[0];

    const hora = ahora
      .toTimeString()
      .slice(0, 5);

    setFechaIngreso(fecha);
    setHoraIngreso(hora);
  }

  function limpiarFormulario() {
    setNumeroGuia("");

    setTipoDocumento("DNI");
    setNumeroDocumento("");
    setNombreCliente("");

    setNumeroContenedor("");
    setMarcaContenedor("");
    setMedidaContenedor("");
    setTipoContenedor("NORMAL");

    setEmpresaTransporte("");
    setPlaca("");
    setNumeroLicencia("");
    setNombreConductor("");

    setFechaIngreso("");
    setHoraIngreso("");

    setObservaciones("");
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

    if (!numeroDocumento.trim()) {
      toast.error(
        "Ingrese el documento del cliente."
      );
      return;
    }

    if (!numeroContenedor.trim()) {
      toast.error(
        "Ingrese el número del contenedor."
      );
      return;
    }

    if (!fechaIngreso || !horaIngreso) {
      toast.error(
        "Ingrese la fecha y hora de ingreso."
      );
      return;
    }

    setGuardando(true);

    try {
      /*
       * AQUÍ conectaremos posteriormente
       * registrarGuiaAction().
       *
       * No hacemos todavía la llamada
       * porque necesitamos conectar
       * este formulario con las actions
       * reales del módulo.
       */

      console.log({
        numeroGuia,

        tipoDocumento,
        numeroDocumento,
        nombreCliente,

        numeroContenedor,
        marcaContenedor,
        medidaContenedor:
          Number(medidaContenedor),
        tipoContenedor,

        empresaTransporte,
        placa,

        numeroLicencia,
        nombreConductor,

        fechaIngreso,
        horaIngreso,

        observaciones,
      });

      toast.success(
        "Datos de la guía validados correctamente."
      );

      limpiarFormulario();
    } catch (error) {
      console.error(error);

      toast.error(
        "No se pudo registrar la guía."
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
      {/* INFORMACIÓN GENERAL */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Información general
          </CardTitle>

          <CardDescription>
            Datos principales de la guía y del cliente.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="numeroGuia">
              Número de guía
            </Label>

            <Input
              id="numeroGuia"
              value={numeroGuia}
              onChange={(event) =>
                setNumeroGuia(
                  event.target.value
                )
              }
              placeholder="Ej. GUIA-000001"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Tipo de documento
            </Label>

            <select
              value={tipoDocumento}
              onChange={(event) =>
                setTipoDocumento(
                  event.target.value as
                    | "DNI"
                    | "RUC"
                )
              }
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="DNI">
                DNI
              </option>

              <option value="RUC">
                RUC
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroDocumento">
              Número de documento
            </Label>

            <Input
              id="numeroDocumento"
              value={numeroDocumento}
              onChange={(event) =>
                setNumeroDocumento(
                  event.target.value
                )
              }
              placeholder={
                tipoDocumento === "DNI"
                  ? "8 dígitos"
                  : "11 dígitos"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreCliente">
              Nombre del cliente
            </Label>

            <Input
              id="nombreCliente"
              value={nombreCliente}
              onChange={(event) =>
                setNombreCliente(
                  event.target.value
                )
              }
              placeholder="Solo si es necesario registrar un cliente nuevo"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* CONTENEDOR */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Datos del contenedor
          </CardTitle>

          <CardDescription>
            Ingresa el número del contenedor.
            Si ya existe, sus datos se cargarán automáticamente.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="numeroContenedor">
              Número de contenedor
            </Label>

            <Input
              id="numeroContenedor"
              value={numeroContenedor}
              onChange={(event) =>
                setNumeroContenedor(
                  event.target.value.toUpperCase()
                )
              }
              placeholder="Ej. MSCU1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marcaContenedor">
              Marca
            </Label>

            <Input
              id="marcaContenedor"
              value={marcaContenedor}
              onChange={(event) =>
                setMarcaContenedor(
                  event.target.value
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medidaContenedor">
              Medida
            </Label>

            <select
              id="medidaContenedor"
              value={medidaContenedor}
              onChange={(event) =>
                setMedidaContenedor(
                  event.target.value
                )
              }
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">
                Seleccionar medida
              </option>

              <option value="20">
                20 pies
              </option>

              <option value="40">
                40 pies
              </option>
            </select>
          </div>

          <div className="space-y-2">
            <Label>
              Tipo de contenedor
            </Label>

            <select
              value={tipoContenedor}
              onChange={(event) =>
                setTipoContenedor(
                  event.target.value as
                    | "NORMAL"
                    | "REEFER"
                )
              }
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="NORMAL">
                Normal
              </option>

              <option value="REEFER">
                Reefer
              </option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* TRANSPORTISTA DE ENTREGA */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Transportista de entrega
          </CardTitle>

          <CardDescription>
            Datos del vehículo que ingresa el contenedor.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="empresaTransporte">
              Empresa de transporte
            </Label>

            <Input
              id="empresaTransporte"
              value={empresaTransporte}
              onChange={(event) =>
                setEmpresaTransporte(
                  event.target.value
                )
              }
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="placa">
              Placa
            </Label>

            <Input
              id="placa"
              value={placa}
              onChange={(event) =>
                setPlaca(
                  event.target.value.toUpperCase()
                )
              }
              placeholder="Ej. ABC-123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroLicencia">
              Número de licencia
            </Label>

            <Input
              id="numeroLicencia"
              value={numeroLicencia}
              onChange={(event) =>
                setNumeroLicencia(
                  event.target.value.toUpperCase()
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreConductor">
              Nombre del conductor
            </Label>

            <Input
              id="nombreConductor"
              value={nombreConductor}
              onChange={(event) =>
                setNombreConductor(
                  event.target.value
                )
              }
              placeholder="Se cargará automáticamente si la licencia existe"
            />
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* INGRESO */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Ingreso al almacén
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
              <Label htmlFor="fechaIngreso">
                Fecha de ingreso
              </Label>

              <Input
                id="fechaIngreso"
                type="date"
                value={fechaIngreso}
                onChange={(event) =>
                  setFechaIngreso(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaIngreso">
                Hora de ingreso
              </Label>

              <Input
                id="horaIngreso"
                type="time"
                value={horaIngreso}
                onChange={(event) =>
                  setHoraIngreso(
                    event.target.value
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* PRECIO */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Configuración de precio
          </CardTitle>

          <CardDescription>
            Los precios se obtienen automáticamente
            desde la configuración del sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">
              Los precios estándar serán cargados
              automáticamente al registrar la guía.
            </p>

            <p className="mt-2 text-sm font-medium">
              El sistema determinará automáticamente
              si el precio utilizado corresponde a un
              precio estándar o personalizado.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* OBSERVACIONES */}
      {/* ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Observaciones
          </CardTitle>
        </CardHeader>

        <CardContent>
          <textarea
            value={observaciones}
            onChange={(event) =>
              setObservaciones(
                event.target.value
              )
            }
            placeholder="Observaciones opcionales..."
            className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={guardando}
        >
          <Save className="mr-2 size-4" />

          {guardando
            ? "Registrando..."
            : "Registrar ingreso"}
        </Button>
      </div>
    </form>
  );
}