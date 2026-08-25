"use client";

import { useState } from "react";
import { Loader2, Save, Clock3 } from "lucide-react";
import { toast } from "sonner";

import { crearGuiaAction } from "../guia.actions";

import type { CrearGuiaInput } from "../guia.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TipoDocumento = "DNI" | "RUC";
type TipoContenedor = "NORMAL" | "REEFER";
type TipoPrecio = "ESTANDAR" | "PERSONALIZADO";
type TratamientoIGV = "SIN_IGV" | "CON_IGV";

type FormularioState = {
  numeroGuia: string;

  cliente: {
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    nombreCompleto: string;
  };

  contenedor: {
    numeroContenedor: string;
    marca: string;
    medida: string;
    tipo: TipoContenedor;
  };

  transportistaIngreso: {
    empresaNombre: string;
    empresaRuc: string;
    empresaTelefono: string;

    placa: string;

    conductorNombre: string;
    numeroLicencia: string;
  };

  fechaIngreso: string;
  horaIngreso: string;

  tipoPrecio: TipoPrecio;
  precioPrimerDia: string;
  precioDiaAdicional: string;

  tratamientoIGV: TratamientoIGV;

  observaciones: string;
};

const estadoInicial: FormularioState = {
  numeroGuia: "",

  cliente: {
    tipoDocumento: "DNI",
    numeroDocumento: "",
    nombreCompleto: "",
  },

  contenedor: {
    numeroContenedor: "",
    marca: "",
    medida: "",
    tipo: "NORMAL",
  },

  transportistaIngreso: {
    empresaNombre: "",
    empresaRuc: "",
    empresaTelefono: "",

    placa: "",

    conductorNombre: "",
    numeroLicencia: "",
  },

  fechaIngreso: "",
  horaIngreso: "",

  tipoPrecio: "ESTANDAR",
  precioPrimerDia: "",
  precioDiaAdicional: "",

  tratamientoIGV: "SIN_IGV",

  observaciones: "",
};

function obtenerFechaActual() {
  const ahora = new Date();

  return ahora.toISOString().split("T")[0];
}

function obtenerHoraActual() {
  const ahora = new Date();

  return `${String(ahora.getHours()).padStart(2, "0")}:${String(
    ahora.getMinutes(),
  ).padStart(2, "0")}`;
}

export function GuiaForm() {
  const [form, setForm] =
    useState<FormularioState>(estadoInicial);

  const [guardando, setGuardando] =
    useState(false);

  function actualizarCampo(
    campo: keyof FormularioState,
    valor: string,
  ) {
    setForm((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  function actualizarCliente(
    campo: keyof FormularioState["cliente"],
    valor: string,
  ) {
    setForm((actual) => ({
      ...actual,
      cliente: {
        ...actual.cliente,
        [campo]: valor,
      },
    }));
  }

  function actualizarContenedor(
    campo: keyof FormularioState["contenedor"],
    valor: string,
  ) {
    setForm((actual) => ({
      ...actual,
      contenedor: {
        ...actual.contenedor,
        [campo]: valor,
      },
    }));
  }

  function actualizarTransportista(
    campo: keyof FormularioState["transportistaIngreso"],
    valor: string,
  ) {
    setForm((actual) => ({
      ...actual,
      transportistaIngreso: {
        ...actual.transportistaIngreso,
        [campo]: valor,
      },
    }));
  }

  function colocarFechaHoraActual() {
    setForm((actual) => ({
      ...actual,
      fechaIngreso: obtenerFechaActual(),
      horaIngreso: obtenerHoraActual(),
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setGuardando(true);

      if (!form.numeroGuia.trim()) {
        toast.error(
          "El número de guía es obligatorio",
        );
        return;
      }

      if (
        !form.contenedor.numeroContenedor.trim()
      ) {
        toast.error(
          "El número del contenedor es obligatorio",
        );
        return;
      }

      if (!form.fechaIngreso) {
        toast.error(
          "La fecha de ingreso es obligatoria",
        );
        return;
      }

      if (!form.horaIngreso) {
        toast.error(
          "La hora de ingreso es obligatoria",
        );
        return;
      }

      if (
        !form.transportistaIngreso
          .empresaNombre.trim()
      ) {
        toast.error(
          "La empresa de transporte es obligatoria",
        );
        return;
      }

      if (
        !form.transportistaIngreso
          .placa.trim()
      ) {
        toast.error(
          "La placa es obligatoria",
        );
        return;
      }

      if (
        !form.transportistaIngreso
          .conductorNombre.trim()
      ) {
        toast.error(
          "El nombre del conductor es obligatorio",
        );
        return;
      }

      if (
        !form.transportistaIngreso
          .numeroLicencia.trim()
      ) {
        toast.error(
          "El número de licencia es obligatorio",
        );
        return;
      }

      const data: CrearGuiaInput = {
        numeroGuia:
          form.numeroGuia.trim(),

        cliente: {
          tipoDocumento:
            form.cliente.tipoDocumento,

          numeroDocumento:
            form.cliente.numeroDocumento.trim(),

          nombreCompleto:
            form.cliente.nombreCompleto.trim() ||
            null,
        },

        contenedor: {
          numeroContenedor:
            form.contenedor.numeroContenedor.trim(),

          marca:
            form.contenedor.marca.trim(),

          medida:
            Number(form.contenedor.medida),

          tipo:
            form.contenedor.tipo,
        },

        transportistaIngreso: {
          empresaNombre:
            form.transportistaIngreso
              .empresaNombre.trim(),

          empresaRuc:
            form.transportistaIngreso
              .empresaRuc.trim() || null,

          empresaTelefono:
            form.transportistaIngreso
              .empresaTelefono.trim() || null,

          placa:
            form.transportistaIngreso
              .placa.trim(),

          conductorNombre:
            form.transportistaIngreso
              .conductorNombre.trim(),

          numeroLicencia:
            form.transportistaIngreso
              .numeroLicencia.trim(),
        },

        fechaIngreso: new Date(
          `${form.fechaIngreso}T00:00:00`,
        ),

        horaIngreso: new Date(
          `1970-01-01T${form.horaIngreso}:00`,
        ),

        tipoPrecio:
          form.tipoPrecio,

        precioPrimerDia:
          form.tipoPrecio ===
          "PERSONALIZADO"
            ? Number(form.precioPrimerDia)
            : undefined,

        precioDiaAdicional:
          form.tipoPrecio ===
          "PERSONALIZADO"
            ? Number(form.precioDiaAdicional)
            : undefined,

        tratamientoIGV:
          form.tratamientoIGV,

        observaciones:
          form.observaciones.trim() || null,
      };

      const resultado =
        await crearGuiaAction(data);

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
      {/* =====================================================
          INFORMACIÓN GENERAL
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Información de la guía
          </CardTitle>

          <CardDescription>
            Datos generales de la guía de
            internamiento.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="numeroGuia">
              Número de guía
            </Label>

            <Input
              id="numeroGuia"
              value={form.numeroGuia}
              onChange={(e) =>
                actualizarCampo(
                  "numeroGuia",
                  e.target.value,
                )
              }
              placeholder="Ej. GUIA-000001"
            />
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          CLIENTE
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Cliente
          </CardTitle>

          <CardDescription>
            Identificación del cliente que
            ingresa el contenedor.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>
              Tipo de documento
            </Label>

            <Select
              value={
                form.cliente.tipoDocumento
              }
              onValueChange={(value) =>
                actualizarCliente(
                  "tipoDocumento",
                  value ?? "",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="DNI">
                  DNI
                </SelectItem>

                <SelectItem value="RUC">
                  RUC
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numeroDocumento">
              Número de documento
            </Label>

            <Input
              id="numeroDocumento"
              value={
                form.cliente.numeroDocumento
              }
              onChange={(e) =>
                actualizarCliente(
                  "numeroDocumento",
                  e.target.value,
                )
              }
              placeholder={
                form.cliente.tipoDocumento ===
                "DNI"
                  ? "12345678"
                  : "20123456789"
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreCliente">
              Nombre / Razón social
            </Label>

            <Input
              id="nombreCliente"
              value={
                form.cliente.nombreCompleto
              }
              onChange={(e) =>
                actualizarCliente(
                  "nombreCompleto",
                  e.target.value,
                )
              }
              placeholder="Nombre del cliente"
            />
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          CONTENEDOR
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Contenedor
          </CardTitle>

          <CardDescription>
            Datos del contenedor que ingresa
            al almacén.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="numeroContenedor">
              Número de contenedor
            </Label>

            <Input
              id="numeroContenedor"
              value={
                form.contenedor
                  .numeroContenedor
              }
              onChange={(e) =>
                actualizarContenedor(
                  "numeroContenedor",
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="MSCU1234567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="marcaContenedor">
              Marca
            </Label>

            <Input
              id="marcaContenedor"
              value={
                form.contenedor.marca
              }
              onChange={(e) =>
                actualizarContenedor(
                  "marca",
                  e.target.value,
                )
              }
              placeholder="Maersk"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Medida
            </Label>

            <Select
              value={
                form.contenedor.medida
              }
              onValueChange={(value) =>
                actualizarContenedor(
                  "medida",
                  value ?? "",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="20">
                  20 pies
                </SelectItem>

                <SelectItem value="40">
                  40 pies
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Tipo
            </Label>

            <Select
              value={
                form.contenedor.tipo
              }
              onValueChange={(value) =>
                actualizarContenedor(
                  "tipo",
                  value as TipoContenedor,
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="NORMAL">
                  Normal
                </SelectItem>

                <SelectItem value="REEFER">
                  Reefer
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          TRANSPORTISTA DE INGRESO
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Transportista de entrega
          </CardTitle>

          <CardDescription>
            Datos del vehículo y conductor
            que entrega el contenedor.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>
              Empresa de transporte
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .empresaNombre
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaNombre",
                  e.target.value,
                )
              }
              placeholder="Nombre de la empresa"
            />
          </div>

          <div className="space-y-2">
            <Label>
              RUC de la empresa
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .empresaRuc
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaRuc",
                  e.target.value,
                )
              }
              placeholder="20123456789"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Teléfono
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .empresaTelefono
              }
              onChange={(e) =>
                actualizarTransportista(
                  "empresaTelefono",
                  e.target.value,
                )
              }
              placeholder="999999999"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Placa / Camión
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .placa
              }
              onChange={(e) =>
                actualizarTransportista(
                  "placa",
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="ABC-123"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Nombre del conductor
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .conductorNombre
              }
              onChange={(e) =>
                actualizarTransportista(
                  "conductorNombre",
                  e.target.value,
                )
              }
              placeholder="Nombre completo"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Número de licencia
            </Label>

            <Input
              value={
                form.transportistaIngreso
                  .numeroLicencia
              }
              onChange={(e) =>
                actualizarTransportista(
                  "numeroLicencia",
                  e.target.value.toUpperCase(),
                )
              }
              placeholder="Q12345678"
            />
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          INGRESO
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Fecha y hora de ingreso
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={
                colocarFechaHoraActual
              }
            >
              <Clock3 className="mr-2 h-4 w-4" />

              Usar fecha y hora actual
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Fecha de ingreso
              </Label>

              <Input
                type="date"
                value={
                  form.fechaIngreso
                }
                onChange={(e) =>
                  actualizarCampo(
                    "fechaIngreso",
                    e.target.value,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Hora de ingreso
              </Label>

              <Input
                type="time"
                value={
                  form.horaIngreso
                }
                onChange={(e) =>
                  actualizarCampo(
                    "horaIngreso",
                    e.target.value,
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          PRECIO
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Configuración del precio
          </CardTitle>

          <CardDescription>
            El precio estándar se obtiene de
            la configuración del sistema.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>
              Tipo de precio
            </Label>

            <Select
              value={
                form.tipoPrecio
              }
              onValueChange={(value) =>
                actualizarCampo(
                  "tipoPrecio",
                  value ?? "",
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ESTANDAR">
                  Estándar
                </SelectItem>

                <SelectItem value="PERSONALIZADO">
                  Personalizado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {form.tipoPrecio ===
            "PERSONALIZADO" && (
            <>
              <div className="space-y-2">
                <Label>
                  Precio primer día
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.precioPrimerDia
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      "precioPrimerDia",
                      e.target.value,
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Precio día adicional
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.precioDiaAdicional
                  }
                  onChange={(e) =>
                    actualizarCampo(
                      "precioDiaAdicional",
                      e.target.value,
                    )
                  }
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>
              Tratamiento IGV
            </Label>

            <Select
              value={
                form.tratamientoIGV
              }
              onValueChange={(value) =>
                actualizarCampo(
                  "tratamientoIGV",
                  value ?? "",
                )
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

      {/* =====================================================
          OBSERVACIONES
      ====================================================== */}

      <Card>
        <CardHeader>
          <CardTitle>
            Observaciones
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Textarea
            value={form.observaciones}
            onChange={(e) =>
              actualizarCampo(
                "observaciones",
                e.target.value,
              )
            }
            placeholder="Observaciones opcionales..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* =====================================================
          GUARDAR
      ====================================================== */}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={guardando}
          size="lg"
        >
          {guardando ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />

              Registrando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />

              Registrar guía
            </>
          )}
        </Button>
      </div>
    </form>
  );
}