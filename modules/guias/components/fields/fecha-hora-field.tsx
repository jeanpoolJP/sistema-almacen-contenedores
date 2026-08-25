// modules/guias/components/fields/fecha-hora-field.tsx

"use client";

import { useFormContext } from "react-hook-form";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type FechaHoraFieldProps = {
  fechaName: string;
  horaName: string;
  label: string;
};

/**
 * ============================================================
 * HORA
 * ============================================================
 *
 * Las horas se guardan como un Date neutro:
 *
 * 16:05
 * ↓
 * 1970-01-01T16:05:00.000Z
 *
 * Por eso usamos UTC para leerlas.
 */
function horaAString(
  fecha: Date | undefined | null,
) {
  if (!fecha) return "";

  const horas = String(
    fecha.getUTCHours(),
  ).padStart(2, "0");

  const minutos = String(
    fecha.getUTCMinutes(),
  ).padStart(2, "0");

  return `${horas}:${minutos}`;
}

/**
 * Convierte HH:mm a una hora neutra UTC.
 */
function stringAHora(valor: string) {
  if (!valor) {
    return undefined;
  }

  const [horas, minutos] = valor
    .split(":")
    .map(Number);

  return new Date(
    Date.UTC(
      1970,
      0,
      1,
      horas || 0,
      minutos || 0,
      0,
      0,
    ),
  );
}

/**
 * ============================================================
 * FECHA
 * ============================================================
 *
 * IMPORTANTE:
 *
 * NO usamos:
 *
 * new Date("2026-08-25")
 *
 * porque JavaScript interpreta esa cadena como UTC.
 *
 * Tampoco queremos que date-fns convierta la fecha
 * de negocio a otra zona horaria.
 *
 * Creamos el Date utilizando los componentes locales.
 */
function crearFechaLocal(
  fecha: Date,
) {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    0,
    0,
    0,
    0,
  );
}

/**
 * Devuelve una fecha local que representa exactamente
 * el día seleccionado.
 *
 * Ejemplo:
 *
 * seleccionar 25/08/2026
 *
 * → Date local:
 * 25/08/2026 00:00
 */
function crearFechaDesdeCalendar(
  fecha: Date,
) {
  return crearFechaLocal(fecha);
}

/**
 * Obtiene la fecha actual del equipo.
 *
 * Si hoy es:
 *
 * 25/08/2026
 *
 * devuelve:
 *
 * 25/08/2026 00:00 hora local
 */
function obtenerFechaActual() {
  const ahora = new Date();

  return crearFechaLocal(ahora);
}

/**
 * Obtiene la hora actual del equipo
 * como hora neutra UTC.
 */
function obtenerHoraActual() {
  const ahora = new Date();

  return new Date(
    Date.UTC(
      1970,
      0,
      1,
      ahora.getHours(),
      ahora.getMinutes(),
      ahora.getSeconds(),
      0,
    ),
  );
}

export function FechaHoraField({
  fechaName,
  horaName,
  label,
}: FechaHoraFieldProps) {
  const {
    control,
    setValue,
  } = useFormContext();

  /**
   * ==========================================================
   * FECHA + HORA ACTUAL
   * ==========================================================
   */
  function usarFechaHoraActual() {
    setValue(
      fechaName,
      obtenerFechaActual(),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );

    setValue(
      horaName,
      obtenerHoraActual(),
      {
        shouldValidate: true,
        shouldDirty: true,
      },
    );
  }

  return (
    <div className="space-y-2">

      {/* ======================================================
          TÍTULO
      ====================================================== */}

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {label}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={usarFechaHoraActual}
        >
          <Clock className="size-3.5" />
          Usar fecha y hora actual
        </Button>
      </div>

      {/* ======================================================
          FECHA + HORA
      ====================================================== */}

      <div className="grid grid-cols-2 gap-3">

        {/* ====================================================
            FECHA
        ==================================================== */}

        <FormField
          control={control}
          name={fechaName}
          render={({ field }) => (
            <FormItem className="flex flex-col">

              <Popover>

                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !field.value &&
                          "text-muted-foreground",
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 size-4" />

                  {field.value
                    ? format(
                        field.value,
                        "dd MMM yyyy",
                        {
                          locale: es,
                        },
                      )
                    : "Seleccionar fecha"}
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"

                    /*
                     * IMPORTANTE:
                     *
                     * Creamos una fecha local para que
                     * Calendar no retroceda un día.
                     */
                    selected={
                      field.value
                        ? crearFechaLocal(
                            field.value,
                          )
                        : undefined
                    }

                    onSelect={(fecha) => {
                      if (!fecha) {
                        field.onChange(
                          undefined,
                        );
                        return;
                      }

                      /*
                       * Guardamos exactamente el día
                       * que el usuario seleccionó.
                       */
                      field.onChange(
                        crearFechaDesdeCalendar(
                          fecha,
                        ),
                      );
                    }}

                    locale={es}
                  />
                </PopoverContent>

              </Popover>

              <FormMessage />

            </FormItem>
          )}
        />

        {/* ====================================================
            HORA
        ==================================================== */}

        <FormField
          control={control}
          name={horaName}
          render={({ field }) => (
            <FormItem>

              <FormControl>

                <Input
                  type="time"
                  value={horaAString(
                    field.value,
                  )}
                  onChange={(e) => {
                    field.onChange(
                      stringAHora(
                        e.target.value,
                      ),
                    );
                  }}
                />

              </FormControl>

              <FormMessage />

            </FormItem>
          )}
        />

      </div>
    </div>
  );
}